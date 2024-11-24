import requests

ACA_PY_ADMIN_URL = "http://localhost:8021"
LEDGER_URL = "http://localhost:9000"

def create_did():
    response = requests.post(
        f"{ACA_PY_ADMIN_URL}/wallet/did/create",
        json={"method": "sov"},
        headers={"Content-Type": "application/json"}
    )
    response.raise_for_status()
    return response.json()["result"]

def register_did_to_ledger(genesis_url, did, verkey, alias=None):
    payload = {"did": did, "verkey": verkey, "alias": alias}
    response = requests.post(f"{genesis_url}/register", json=payload)
    response.raise_for_status()
    return response.json()

def post_did_to_ledger(did):
    response = requests.post(
        f"{ACA_PY_ADMIN_URL}/wallet/did/post",
        json={"did": did},
        headers={"Content-Type": "application/json"}
    )
    response.raise_for_status()
    return response.json()

def set_public_did(did):
    response = requests.post(
        f"{ACA_PY_ADMIN_URL}/wallet/did/public",
        json={"did": did},
        headers={"Content-Type": "application/json"}
    )
    response.raise_for_status()
    return response.json()

def main():
    try:
        # Step 1: Create a new DID
        did_info = create_did()
        print(f"Created DID: {did_info}")

        # Step 2: Register the DID on the ledger
        registered_did = register_did_to_ledger(
            genesis_url=LEDGER_URL,
            did=did_info["did"],
            verkey=did_info["verkey"],
            alias="Condominio"
        )
        print(f"Registered DID: {registered_did}")

        # Step 3: Post the DID to the ledger (to update posture)
        posted_did = post_did_to_ledger(did_info["did"])
        print(f"Posted DID to ledger: {posted_did}")

        # Step 4: Set the DID as public
        public_did = set_public_did(did_info["did"])
        print(f"Public DID set: {public_did}")

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
