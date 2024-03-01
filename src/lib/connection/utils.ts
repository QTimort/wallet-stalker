import { Connection } from "@solana/web3.js"

export async function createAndValidateConnection(
  rpcAddress: string
): Promise<Connection> {
  const connection = new Connection(rpcAddress)

  try {
    const version = await connection.getVersion()
    console.log(
      `Connected to Solana RPC at ${rpcAddress}. Version: ${version["solana-core"]}`
    )

    return connection
  } catch (error) {
    throw new Error(
      `Failed to connect to Solana RPC at ${rpcAddress}: ${error}`
    )
  }
}
