import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "Wallet Stalker",
  author: "@TimortUnchained",
  description: "Find on-chain interactions between two wallets.",
  keywords: ["Solana", "Wallet", "Stalker"],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "https://twitter.com/TimortUnchained",
  },
  links: {
    github: "https://github.com/QTimort/wallet-stalker",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
}
