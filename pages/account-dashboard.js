import {ethers} from 'ethers'
import {useEffect, useState} from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Image from 'next/image';


import { nftaddress, nftmarketaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import SGMarket from '../artifacts/contracts/SGMarket.sol/SGMarket.json'

export default function AccountDashBoard() {
  const [nfts, setNFTs] = useState([])
  const [sold, setSold] = useState([])
  const [loadingState, setLoadingState] = useState("not-loaded")
  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, SGMarket.abi, signer)
    const data = await marketContract.fetchItemsCreated()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      // get metadata from uri
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item
    }))

    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNFTs(items)
    setLoadingState('loaded')
  }


  if(loadingState === 'loaded' && !nfts.length) return (
    <h1 className="px-20 py-7 text-4xl">You have not minted any NFT</h1>
  ) 

  return (
    <div className="p-4">
      <h2 className="text-2xl py-2">Tokens Minted</h2>
      <div className="px-4" style={{maxWidth: '1200px'}}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <Image src={nft.image} alt="image" />
                <div className="p-4">
                  <p style={{height: '64px'}} className="text-3xl font-semibold">
                    {nft.name}
                  </p>
                  <div style={{height: '72px', overflow: 'hidden'}}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-3xl mb-4 font-bold text-white">{nft.price} ETH</p>
                  {/* <button className="w-full bg-purple-500 text-white font-bold py-3 px-12" onClick={() => buyNFT(nft)}>Buy</button>   */}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
