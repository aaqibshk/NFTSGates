import '../styles/globals.css'
import './app.css'
import Link from 'next/link';
function CryptoBirdzMarketplace({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-6" style={{backgroundColor: 'green'}}>
        <p className="text-2xl font-bold text-white">Stadium Gates Marketplace</p>
        <div className="flex justify-center mt-4">
          <Link href="/">
            <a className="mr-4">
              Main Marketplace
            </a>
          </Link>
          <Link href="/mint-item">
            <a className="mr-6">
              Mint Tokens
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6">
              My NFTs
            </a>
          </Link>
          <Link href="/account-dashboard">
            <a className="mr-6">
              Account Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default CryptoBirdzMarketplace;