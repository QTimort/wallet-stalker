import { Connection } from "@solana/web3.js"

export const findClosestBlockToTimestamp = async (
  connection: Connection,
  targetDate: Date
): Promise<number> => {
  const targetTimestamp = Math.floor(targetDate.getTime() / 1000)
  let low = 1
  let high = await connection.getSlot()
  let closestBlock = { slot: 0, timeDifference: Infinity }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    let blockTime: number | null = null

    try {
      blockTime = await connection.getBlockTime(mid)
    } catch (error) {
      if (error?.toString?.()?.includes?.("was skipped, or missing")) {
        high = mid - 1
        continue
      }
      throw error
    }

    if (blockTime !== null) {
      const timeDifference = Math.abs(targetTimestamp - blockTime)
      if (timeDifference < closestBlock.timeDifference) {
        closestBlock = { slot: mid, timeDifference: timeDifference }
      }

      if (blockTime < targetTimestamp) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    } else {
      high = mid - 1
    }
  }

  return closestBlock.slot
}

export const getFirstTransactionHashOfBlock = async (
  connection: Connection,
  blockId: number
): Promise<string> => {
  const block = await connection.getBlockSignatures(blockId)
  if (block && block.signatures.length > 0) {
    return block.signatures[0]
  } else {
    throw new Error(`No transactions found in block ${blockId}`)
  }
}
