"""Indy issuer implementation."""

import json
import logging

from collections import OrderedDict
from typing import Sequence

import indy.anoncreds
from indy.error import ErrorCode, IndyError

from ..wallet.error import WalletNotFoundError

from .base import BaseHolder


class IndyHolder(BaseHolder):
    """Indy holder class."""

    def __init__(self, wallet):
        """
        Initialize an IndyHolder instance.

        Args:
            wallet: IndyWallet instance

        """
        self.logger = logging.getLogger(__name__)
        self.wallet = wallet

    async def create_credential_request(
        self, credential_offer, credential_definition, did
    ):
        """
        Create a credential offer for the given credential definition id.

        Args:
            credential_offer: The credential offer to create request for
            credential_definition: The credential definition to create an offer for

        Returns:
            A credential request

        """

        (
            credential_request_json,
            credential_request_metadata_json,
        ) = await indy.anoncreds.prover_create_credential_req(
            self.wallet.handle,
            did,
            json.dumps(credential_offer),
            json.dumps(credential_definition),
            self.wallet.master_secret_id,
        )

        self.logger.debug(
            "Created credential request. "
            + f"credential_request_json={credential_request_json} "
            + f"credential_request_metadata_json={credential_request_metadata_json}"
        )

        credential_request = json.loads(credential_request_json)
        credential_request_metadata = json.loads(credential_request_metadata_json)

        return credential_request, credential_request_metadata

    async def store_credential(
        self, credential_definition, credential_data, credential_request_metadata
    ):
        """
        Store a credential in the wallet.

        Args:
            credential_definition: Credential definition for this credential
            credential_data: Credential data generated by the issuer

        """

        credential_id = await indy.anoncreds.prover_store_credential(
            self.wallet.handle,
            None,  # Always let indy set the id for now
            json.dumps(credential_request_metadata),
            json.dumps(credential_data),
            json.dumps(credential_definition),
            None,  # We don't support revocation yet
        )

        return credential_id

    async def get_credentials(self, start: int, count: int, wql: dict):
        """
        Get credentials stored in the wallet.

        Args:
            start: Starting index
            count: Number of records to return
            wql: wql query dict

        """
        search_handle, record_count = await indy.anoncreds.prover_search_credentials(
            self.wallet.handle, json.dumps(wql)
        )

        # We need to move the database cursor position manually...
        if start > 0:
            # TODO: move cursor in chunks to avoid exploding memory
            await indy.anoncreds.prover_fetch_credentials(search_handle, start)

        credentials_json = await indy.anoncreds.prover_fetch_credentials(
            search_handle, count
        )
        await indy.anoncreds.prover_close_credentials_search(search_handle)

        credentials = json.loads(credentials_json)
        return credentials

    async def get_credentials_for_presentation_request_by_referent(
        self,
        presentation_request: dict,
        referents: Sequence[str],
        start: int,
        count: int,
        extra_query: dict = {},
    ):
        """
        Get credentials stored in the wallet.

        Args:
            presentation_request: Valid presentation request from issuer
            referents: Presentation request referents to use to search for creds
            start: Starting index
            count: Maximum number of records to return
            extra_query: wql query dict

        """

        search_handle = await indy.anoncreds.prover_search_credentials_for_proof_req(
            self.wallet.handle,
            json.dumps(presentation_request),
            json.dumps(extra_query),
        )

        if not referents:
            referents = (
                *presentation_request["requested_attributes"],
                *presentation_request["requested_predicates"],
            )
        creds_dict = OrderedDict()

        try:
            for reft in referents:
                # We need to move the database cursor position manually...
                if start > 0:
                    # TODO: move cursors in chunks to avoid exploding memory
                    await indy.anoncreds.prover_fetch_credentials_for_proof_req(
                        search_handle, reft, start
                    )
                (
                    credentials_json
                ) = await indy.anoncreds.prover_fetch_credentials_for_proof_req(
                    search_handle, reft, count
                )
                credentials = json.loads(credentials_json)
                for cred in credentials:
                    cred_id = cred["cred_info"]["referent"]
                    if cred_id not in creds_dict:
                        cred["presentation_referents"] = {reft}
                        creds_dict[cred_id] = cred
                    else:
                        creds_dict[cred_id]["presentation_referents"].add(reft)

        finally:
            # Always close
            await indy.anoncreds.prover_close_credentials_search_for_proof_req(
                search_handle
            )

        for cred in creds_dict.values():
            cred["presentation_referents"] = list(cred["presentation_referents"])

        return tuple(creds_dict.values())[:count]

    async def get_credential(self, credential_id: str):
        """
        Get a credential stored in the wallet.

        Args:
            credential_id: Credential id to retrieve

        """
        try:
            credential_json = await indy.anoncreds.prover_get_credential(
                self.wallet.handle, credential_id
            )
        except IndyError as e:
            if e.error_code == ErrorCode.WalletItemNotFound:
                raise WalletNotFoundError(
                    "Credential not found in the wallet: {}".format(credential_id)
                )
            else:
                raise

        credential = json.loads(credential_json)
        return credential

    async def delete_credential(self, credential_id: str):
        """
        Remove a credential stored in the wallet.

        Args:
            credential_id: Credential id to remove

        """
        try:
            await indy.anoncreds.prover_delete_credential(
                self.wallet.handle, credential_id
            )
        except IndyError as e:
            if e.error_code == ErrorCode.WalletItemNotFound:
                raise WalletNotFoundError(
                    "Credential not found in the wallet: {}".format(credential_id)
                )
            else:
                raise

    async def create_presentation(
        self,
        presentation_request: dict,
        requested_credentials: dict,
        schemas: dict,
        credential_definitions: dict,
    ):
        """
        Get credentials stored in the wallet.

        Args:
            presentation_request: Valid indy format presentation request
            requested_credentials: Indy format requested_credentials
            schemas: Indy formatted schemas_json
            credential_definitions: Indy formatted schemas_json

        """

        presentation_json = await indy.anoncreds.prover_create_proof(
            self.wallet.handle,
            json.dumps(presentation_request),
            json.dumps(requested_credentials),
            self.wallet.master_secret_id,
            json.dumps(schemas),
            json.dumps(credential_definitions),
            json.dumps({}),  # We don't support revocation currently.
        )

        presentation = json.loads(presentation_json)
        return presentation
