import { siteConfig } from "@/config/site"
import { WalletStalker } from "@/components/wallet-stalker"

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          {siteConfig.description}
        </p>
        <WalletStalker />
      </div>
    </main>
  )
}
