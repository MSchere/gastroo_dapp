import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">TFG's MarketPlace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-red-500">
              Home
            </a>
          </Link>
          <Link href="/create-nft">
            <a className="mr-6 text-red-500">
              Crea tu NFT
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-red-500">
              Mis NFTs
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 text-red-500">
              Panel de control
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp