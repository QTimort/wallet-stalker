"use client"

import { useState } from "react"
import * as React from "react"
import Link from "next/link"
import { ConfirmedSignatureInfo, Connection } from "@solana/web3.js"

import {
  findClosestBlockToTimestamp,
  getFirstTransactionHashOfBlock,
} from "@/lib/block/utils"
import { createAndValidateConnection } from "@/lib/connection/utils"
import { convertToLocalDate, formatDate } from "@/lib/date/utils"
import { fetchMatchingTransactions, formatHash } from "@/lib/wallet/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CSVExportButton from "@/components/csv-export-button"
import { ModeToggle } from "@/components/mode-toggle"

type FormData = {
  rpcUrl?: string
  rpcConnection?: Connection
  fromDate?: string
  toDate?: string
  fromBlock?: string
  toBlock?: string
  walletOne?: string
  walletTwo?: string
}

type SearchState = {
  loading: boolean
  error: boolean
  message: string
  result: ConfirmedSignatureInfo[]
}

export function WalletStalker() {
  const [formData, setFormData] = useState<FormData>({
    rpcUrl:
      "https://mainnet.helius-rpc.com/?api-key=3d76ed43-ead2-43bc-8218-6d07403af290",
    //walletOne: "C3jfD4UDLBR3QWKEMKfUhQKqgmja35bHiYhiebwk5EPr",
    //walletTwo: "EvQhZguCxP1Tn9Cec5cvhkHhESHvhfmgD1rGR4dS2dKT",
  })

  const [searchState, setSearchState] = useState<SearchState>({
    loading: false,
    error: false,
    message: "",
    result: [],
  })

  async function onSearch() {
    if (searchState.loading) {
      console.warn("Search already in progress, ignoring")
      return
    }
    try {
      setSearchState((prev) => ({
        ...prev,
        message: "Finding blocks close to specified input dates...",
        error: false,
        loading: true,
        result: [],
      }))

      const connection = await createAndValidateConnection(
        formData?.rpcUrl || ""
      )
      const fromDate = formData.fromDate
        ? convertToLocalDate(formData.fromDate)
        : undefined
      const toDate = formData.toDate
        ? convertToLocalDate(formData.toDate)
        : undefined

      if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
        throw new Error(
          "The From Date must be before the To Date, please try again with a different date"
        )
      }

      let fromBlock = formData.fromBlock
      let toBlock = formData.toBlock

      if (fromDate && formData.fromBlock === undefined) {
        fromBlock = (
          await findClosestBlockToTimestamp(connection, fromDate)
        ).toString()
      }
      if (toDate && formData.toBlock === undefined) {
        toBlock = (
          await findClosestBlockToTimestamp(connection, toDate)
        ).toString()
      }
      if (fromBlock && toBlock && parseInt(fromBlock) > parseInt(toBlock)) {
        throw new Error(
          "The From Date/Block must be before the To Date/Block, please try again with a different date or block"
        )
      }
      if (!formData.walletOne || !formData.walletTwo) {
        throw new Error("You must provide two Solana wallets")
      }
      setFormData((prev) => ({
        ...prev,
        fromBlock,
        toBlock,
      }))
      setSearchState((prev) => ({
        ...prev,
        message: "Fetching wallet transactions...",
        loading: true,
      }))
      const beforeTx = toBlock
        ? await getFirstTransactionHashOfBlock(
            connection,
            Number.parseInt(toBlock)
          )
        : undefined
      const untilTx = fromBlock
        ? await getFirstTransactionHashOfBlock(
            connection,
            Number.parseInt(fromBlock)
          )
        : undefined
      const res = await fetchMatchingTransactions(
        connection,
        formData.walletOne,
        formData.walletTwo,
        {
          before: beforeTx,
          until: untilTx,
          onPageUpdate: (r, transactionLookedUp) => {
            setSearchState((prev) => ({
              ...prev,
              result: r,
              message: `Found ${r.length} matching transactions within ${transactionLookedUp} transactions`,
              loading: true,
            }))
            return true
          },
        }
      )
      setSearchState((prev) => ({
        ...prev,
        loading: false,
      }))
      console.log(res)
    } catch (e) {
      setSearchState((prev) => ({
        ...prev,
        error: true,
        loading: false,
        message: JSON.stringify(e),
      }))
    }
  }

  function setFormDataField<T extends keyof FormData>(
    key: T,
    value: FormData[T]
  ) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div>
      <div className={"flex flex-wrap justify-center gap-2 gap-y-4"}>
        <div className={"flex w-full items-end gap-x-2"}>
          <Input
            id={"rpc-url"}
            type="text"
            label={"RPC URL"}
            placeholder="RPC URL"
            className={"w-full"}
            value={formData?.rpcUrl || ""}
            onChange={(e) => setFormDataField("rpcUrl", e.target.value)}
          />
          <ModeToggle />
        </div>
        <div className={"my-4 flex w-full flex-col gap-2 sm:flex-row"}>
          <Input
            id={"wallet-1"}
            type="text"
            label={"Wallet 1"}
            placeholder="Wallet 1"
            className={""}
            value={formData?.walletOne || ""}
            onChange={(e) => setFormDataField("walletOne", e.target.value)}
          />
          <Input
            id={"wallet-2"}
            type="text"
            label={"Wallet 2"}
            placeholder="Wallet 2"
            className={""}
            value={formData?.walletTwo || ""}
            onChange={(e) => setFormDataField("walletTwo", e.target.value)}
          />
        </div>
        <div className={"my-4 flex w-full flex-col gap-2 sm:flex-row"}>
          <div className={"flex w-full flex-col gap-y-2 sm:w-1/2"}>
            <Input
              id={"from-date"}
              type="datetime-local"
              label={"From Date"}
              placeholder="From Date"
              className={"w-full"}
              value={formData?.fromDate || ""}
              onChange={(e) => {
                setFormDataField("fromDate", e.target.value)
                setFormDataField("fromBlock", undefined)
              }}
            />
            <div className="flex items-center gap-x-2">
              <div className="h-0.5 flex-grow bg-gray-400"></div>
              <span>OR</span>
              <div className="h-0.5 flex-grow bg-gray-400"></div>
            </div>
            <Input
              id={"from-block"}
              type="number"
              min={1}
              label={"From Block Slot"}
              placeholder="From Block Slot"
              className={"w-full"}
              value={formData?.fromBlock || ""}
              onChange={(e) => setFormDataField("fromBlock", e.target.value)}
            />
          </div>
          <div className={"flex w-full flex-col gap-y-2 sm:w-1/2"}>
            <Input
              id={"to-date"}
              type="datetime-local"
              label={"To Date"}
              placeholder="To Date"
              className={"w-full"}
              value={formData?.toDate || ""}
              onChange={(e) => {
                setFormDataField("toDate", e.target.value)
                setFormDataField("toBlock", undefined)
              }}
            />
            <div className="flex items-center gap-x-2">
              <div className="h-0.5 flex-grow bg-gray-400"></div>
              <span>OR</span>
              <div className="h-0.5 flex-grow bg-gray-400"></div>
            </div>
            <Input
              id={"to-block"}
              type="number"
              min={1}
              label={"To Block Slot"}
              placeholder="To Block Slot"
              className={"w-full"}
              value={formData?.toBlock || ""}
              onChange={(e) => setFormDataField("toBlock", e.target.value)}
            />
          </div>
        </div>
        <div className={"flex w-full flex-col items-center justify-center"}>
          {searchState.message && <div>{searchState.message}</div>}
          {searchState.loading ? (
            <Spinner />
          ) : (
            <Button variant="default" onClick={onSearch}>
              Search
            </Button>
          )}
        </div>
      </div>
      <div className={"my-8 flex flex-col justify-center gap-y-4"}>
        {searchState.result?.length ? (
          <div>
            <CSVExportButton
              data={searchState.result}
              filename={`ws-${formatHash(formData.walletOne || "")}-${formatHash(formData.walletTwo || "")}-${new Date().toISOString()}.csv`}
            />
          </div>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow className={"bg-zinc-100 dark:bg-zinc-900"}>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className={"hidden sm:table-cell"}>Status</TableHead>
              <TableHead className={"hidden sm:table-cell"}>Block</TableHead>
              <TableHead className={"hidden sm:table-cell"}>Memo</TableHead>
              <TableHead className="text-right">Transaction Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchState.result.map((t) => (
              <TableRow key={t.signature}>
                <TableCell className="w-44 text-left">
                  {t.blockTime ? formatDate(new Date(t.blockTime * 1000)) : "?"}
                </TableCell>
                <TableCell
                  className={
                    "hidden w-24 text-left sm:table-cell " +
                    (t.err ? "text-red-500" : "text-green-600")
                  }
                >
                  {t.err ? "KO" : "OK"}
                </TableCell>
                <TableCell className={"hidden w-24 sm:table-cell"}>
                  <Link
                    className={"text-left underline underline-offset-4"}
                    href={"https://solana.fm/block/" + t.slot}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.slot}
                  </Link>
                </TableCell>
                <TableCell className={"hidden sm:table-cell "}>
                  {t.memo || ""}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    className={"text-left underline underline-offset-4"}
                    href={"https://solana.fm/tx/" + t.signature}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {formatHash(t.signature)}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
