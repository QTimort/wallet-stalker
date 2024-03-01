import { ConfirmedSignatureInfo, Connection, PublicKey } from "@solana/web3.js"

import { intersectObjectsToArray } from "@/lib/object/utils"

export type TransactionSet = { [tx: string]: ConfirmedSignatureInfo }

export type FetchMatchingTransactionsOptions = {
  before?: string
  until?: string
  onPageUpdate?: (
    matches: TransactionSet[keyof TransactionSet][],
    transactionLookedUp: number
  ) => boolean
  includeError?: boolean
  maxTxLookupPerWallet?: number
}

export async function fetchMatchingTransactions(
  connection: Connection,
  walletA: string,
  walletB: string,
  opt: FetchMatchingTransactionsOptions
): Promise<TransactionSet[keyof TransactionSet][]> {
  const pageSize = 1000
  const walletAPubKey = new PublicKey(walletA)
  const walletBPubKey = new PublicKey(walletB)

  let lastSignatureA: string | undefined = opt.before
  let lastSignatureB: string | undefined = opt.before
  let hasMoreTransactionsA = true
  let hasMoreTransactionsB = true
  let transactionsSetA: TransactionSet = {}
  let transactionsSetB: TransactionSet = {}
  let transactionLookedUp = 0

  try {
    while (hasMoreTransactionsA || hasMoreTransactionsB) {
      const fetchPromises = []
      if (hasMoreTransactionsA) {
        fetchPromises.push(
          connection.getSignaturesForAddress(walletAPubKey, {
            before: lastSignatureA,
            limit: pageSize,
            until: opt.until,
          })
        )
      }
      if (hasMoreTransactionsB) {
        fetchPromises.push(
          connection.getSignaturesForAddress(walletBPubKey, {
            before: lastSignatureB,
            limit: pageSize,
            until: opt.until,
          })
        )
      }

      transactionLookedUp += pageSize

      const [txsA = [], txsB = []] = await Promise.all(fetchPromises)

      hasMoreTransactionsA = txsA.length === pageSize
      hasMoreTransactionsB = txsB.length === pageSize

      txsA.forEach((tx) => (transactionsSetA[tx.signature] = tx))
      txsB.forEach((tx) => (transactionsSetB[tx.signature] = tx))

      if (opt.onPageUpdate) {
        const intersection = intersectObjectsToArray(
          transactionsSetA,
          transactionsSetB
        )
        if (!opt.onPageUpdate(intersection, transactionLookedUp)) {
          break
        }
      }

      lastSignatureA = txsA[txsA.length - 1]?.signature
      lastSignatureB = txsB[txsB.length - 1]?.signature
    }

    return intersectObjectsToArray(transactionsSetA, transactionsSetB)
  } catch (error) {
    throw error
  }
}

export const formatHash = (hash: string): string => {
  if (hash.length <= 6) {
    return hash
  }
  return `${hash.substring(0, 3)}..${hash.substring(hash.length - 3)}`
}
