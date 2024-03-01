import React from "react"
import { ConfirmedSignatureInfo } from "@solana/web3.js"

import { Button } from "@/components/ui/button"

interface Props {
  data: ConfirmedSignatureInfo[]
  filename: string
}

const CSVExportButton: React.FC<Props> = ({ data, filename }) => {
  const convertToCSV = (arr: ConfirmedSignatureInfo[]): string => {
    const array = [Object.keys(arr[0])].concat(arr as any)
    return array
      .map((it) => {
        return Object.values(it)
          .map((value: any) => {
            if (value === null || value === undefined) {
              return ""
            } else if (typeof value === "string") {
              return `"${value.replace(/"/g, '""')}"` // Escape double quotes
            }
            return String(value)
          })
          .join(",")
      })
      .join("\r\n")
  }

  const downloadCSV = () => {
    const csvString = convertToCSV(data)
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return <Button onClick={downloadCSV}>Download CSV</Button>
}

export default CSVExportButton
