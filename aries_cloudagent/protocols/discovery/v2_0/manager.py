"""."""
import logging

from ....core.error import BaseError
from ....core.profile import Profile
from ....core.protocol_registry import ProtocolRegistry
from ....core.goal_code_registry import GoalCodeRegistry
from ....storage.error import StorageNotFoundError
from ....messaging.responder import BaseResponder

from .messages.disclosures import Disclosures
from .messages.queries import QueryItem, Queries
from .models.discovery_record import V20DiscoveryExchangeRecord


class V20DiscoveryMgrError(BaseError):
    """Discover feature v2_0 error."""


class V20DiscoveryMgr:
    """Class for discover feature v1_0 under RFC 31."""

    def __init__(self, profile: Profile):
        """
        Initialize a V20DiscoveryMgr.

        Args:
            profile: The profile for this manager
        """
        self._profile = profile
        self._logger = logging.getLogger(__name__)

    @property
    def profile(self) -> Profile:
        """
        Accessor for the current Profile.

        Returns:
            The Profile for this manager

        """
        return self._profile

    async def receive_disclose(
        self, disclose_msg: Disclosures, connection_id: str = None
    ) -> V20DiscoveryExchangeRecord:
        """Receive Disclose message and return updated V20DiscoveryExchangeRecord."""
        thread_id = disclose_msg._thread.thid
        try:
            async with self._profile.session() as session:
                discover_exch_rec = (
                    await V20DiscoveryExchangeRecord.retrieve_by_thread_id(
                        session=session, thread_id=thread_id
                    )
                )
                discover_exch_rec.disclose = disclose_msg
                await discover_exch_rec.save(session)
            return discover_exch_rec
        except StorageNotFoundError:
            if connection_id:
                try:
                    async with self._profile.session() as session:
                        discover_exch_rec = (
                            await V20DiscoveryExchangeRecord.retrieve_by_connection_id(
                                session=session, connection_id=connection_id
                            )
                        )
                except StorageNotFoundError:
                    discover_exch_rec = V20DiscoveryExchangeRecord()
                    discover_exch_rec.connection_id = connection_id
            else:
                discover_exch_rec = V20DiscoveryExchangeRecord()
                discover_exch_rec.connection_id = connection_id
            async with self._profile.session() as session:
                discover_exch_rec.disclose = disclose_msg
                await discover_exch_rec.save(session)
            return discover_exch_rec

    async def receive_query(self, queries_msg: Queries) -> Disclosures:
        """Process query and return the corresponding disclose message."""
        protocol_registry = self._profile.context.inject_or(ProtocolRegistry)
        goal_code_registry = self._profile.context.inject_or(GoalCodeRegistry)
        disclosures = Disclosures(disclosures=[])
        published_results = []
        async with self._profile.session() as session:
            to_publish_protocols = None
            to_publish_goal_codes = None
            if (
                session.settings.get("disclose_protocol_list")
                and len(session.settings.get("disclose_protocol_list")) > 0
            ):
                to_publish_protocols = session.settings.get("disclose_protocol_list")
            if (
                session.settings.get("disclose_goal_code_list")
                and len(session.settings.get("disclose_goal_code_list")) > 0
            ):
                to_publish_goal_codes = session.settings.get("disclose_goal_code_list")
            for query_item in queries_msg.queries:
                assert isinstance(query_item, QueryItem)
                if query_item.feature_type == "protocol":
                    protocols = protocol_registry.protocols_matching_query(
                        query_item.match
                    )
                    results = await protocol_registry.prepare_disclosed(
                        self._profile.context, protocols
                    )
                    for result in results:
                        to_publish_result = {"feature-type": "protocol"}
                        if "pid" in result:
                            if (
                                to_publish_protocols
                                and result.get("pid") not in to_publish_protocols
                            ):
                                continue
                            to_publish_result["id"] = result.get("pid")
                        else:
                            continue
                        if "roles" in result:
                            to_publish_result["roles"] = result.get("roles")
                        published_results.append(to_publish_result)
                elif query_item.feature_type == "goal-code":
                    results = goal_code_registry.goal_codes_matching_query(
                        query_item.match
                    )
                    for result in results:
                        to_publish_result = {"feature-type": "goal-code"}
                        if (
                            to_publish_goal_codes
                            and result not in to_publish_goal_codes
                        ):
                            continue
                        to_publish_result["id"] = result
                        published_results.append(to_publish_result)
        disclosures.disclosures = published_results
        disclosures.assign_thread_id(queries_msg._thread.thid)
        return disclosures

    async def create_and_send_query(
        self,
        connection_id: str = None,
        query_protocol: str = None,
        query_goal_code: str = None,
    ) -> V20DiscoveryExchangeRecord:
        """Create and send a Query message."""
        queries = []
        if not query_goal_code and not query_protocol:
            raise V20DiscoveryMgrError("")
        if query_protocol:
            queries.append(QueryItem(feature_type="protocol", match=query_protocol))
        if query_goal_code:
            queries.append(QueryItem(feature_type="goal-code", match=query_goal_code))
        queries_msg = Queries(queries=queries)
        if connection_id:
            async with self._profile.session() as session:
                try:
                    # If existing record exists for a connection_id
                    existing_discovery_ex_rec = (
                        await V20DiscoveryExchangeRecord.retrieve_by_connection_id(
                            session=session, connection_id=connection_id
                        )
                    )
                    await existing_discovery_ex_rec.delete_record(session)
                    discovery_ex_rec = V20DiscoveryExchangeRecord()
                except StorageNotFoundError:
                    discovery_ex_rec = V20DiscoveryExchangeRecord()
            discovery_ex_rec.queries = queries_msg
            await discovery_ex_rec.save(session)
            responder = self.profile.inject_or(BaseResponder)
            if responder:
                await responder.send(queries_msg, connection_id=connection_id)
            else:
                self._logger.exception(
                    "Unable to send discover-features v2 query message"
                    ": BaseResponder unavailable"
                )
            return discovery_ex_rec
        else:
            # Disclose this agent's features and/or goal codes
            discovery_ex_rec = V20DiscoveryExchangeRecord()
            discovery_ex_rec.queries = queries_msg
            disclosures = await self.receive_query(queries_msg=queries_msg)
            discovery_ex_rec.disclosures = disclosures
            return discovery_ex_rec
