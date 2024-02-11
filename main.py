from solana.rpc.api import Client

http_client = Client("https://api.devnet.solana.com")

print(http_client.get_version())
print(http_client.is_connected())

