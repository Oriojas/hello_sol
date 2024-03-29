import os
import json
import requests

NFT_URI = "https://gateway.lighthouse.storage/ipfs/QmSrMjwKCR5cFZVdFyn8tr8gJEdVR6dadmeLsHA7hpHa3h"
NFT_NAME = "quantum_sapiens_iniciado"
NFT_SYMBOL = "QSI"
NFT_DESCRIPTION = ("Son los miembros más jóvenes de la Orden y comienzan su entrenamiento individual sobre los 2 años "
                   "(en especies humanoides). Este entrenamiento tiene lugar en el Templo bajo la supervisión de los "
                   "Maestros instructores así como la utilización del los recursos de los archivos.")
NFT_METADATA = {"power": 600}

KEY_ID = os.environ["KEY_ID"]
SECRET_KEY = os.environ["SECRET_KEY"]
SECRET_PHRASE = os.environ["SECRET_PHRASE"]

HEADERS = {
    "APIKeyID": KEY_ID,
    "APISecretKey": SECRET_KEY
}

SECRET_PHRASE_ENDPOINT = "https://api.blockchainapi.com/v1/solana/wallet/secret_recovery_phrase"
PUBLIC_KEY_ENDPOINT = "https://api.blockchainapi.com/v1/solana/wallet/public_key"
BALANCE_ENDPOINT = "https://api.blockchainapi.com/v1/solana/wallet/balance"
NFT_MINT_FEE_ENDPOINT = "https://api.blockchainapi.com/v1/solana/nft/mint/fee"
NFT_ENDPOINT = "https://api.blockchainapi.com/v1/solana/nft"

DERIVATION_PATH = ""

# PUBLIC_KEY = "HyRxYQYMfrGmDYcukX6LP9SitHVdLyFU8F8Ryo7Aexjj"
PUBLIC_KEY = "7CjX5NP1KkteFQTYYgGUbr7XutAUpHeDdjo4ymrvyXZa"


def get_balance():
    response = requests.get(
        BALANCE_ENDPOINT,
        params={
            "public_key": PUBLIC_KEY
        },
        headers=HEADERS
    )
    print(response.json())


def get_nft_mint_fee():
    response = requests.get(
        NFT_MINT_FEE_ENDPOINT,
        headers=HEADERS
    )
    print(response.json())


get_balance()
# get_nft_mint_fee()


# if __name__ == '__main__':
#     # Create the NFT!
#     mint_nft_response = requests.post(
#         NFT_ENDPOINT,
#         params={
#             "derivation_path": DERIVATION_PATH,
#             "secret_recovery_phrase": SECRET_PHRASE,
#             "nft_name": NFT_NAME,
#             "nft_symbol": NFT_SYMBOL,
#             "nft_description": NFT_DESCRIPTION,
#             "nft_url": NFT_URI,
#             "nft_metadata": json.dumps(NFT_METADATA),
#             "network": "devnet",
#             "nft_upload_method": "S3"
#         },
#         headers=HEADERS
#     )
#     response = mint_nft_response.json()
#     print(mint_nft_response.json())
#
#     with open('data.json', 'w') as file:
#         json.dump(response, file, indent=4)
