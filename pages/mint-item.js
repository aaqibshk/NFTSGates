import {ethers} from 'ethers'
import {useEffect, useState} from 'react'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Image from 'next/image';


import { nftaddress, nftmarketaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import SGMarket from '../artifacts/contracts/SGMarket.sol/SGMarket.json'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
// setup IPFS to host NFT data
export default function MintItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({name: '', price: '', description: ''})
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`)
      })
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('File uploading error', error)
    }
  }

  async function createMarket() {
    console.log('1');
    const {name, price, description} = formInput
    console.log('2', !name, !price, !description, !fileUrl);
    if(name !== '' || price !== '' || description !== '' || fileUrl !== null) {
    console.log('3');
      const data = JSON.stringify({
        name, description, image:fileUrl
      })

      try {
        const added = await client.add(data)
        const url = `https://ipfs.infura.io/ipfs/${added.path}`

        createSale(url)
      } catch (error) {
        
      }
    }
  }

  async function createSale(url) {
    // create items and list them on marketplace
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    // create token
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.mintToken(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()
    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    // list item for sale on marketplace

    contract = new ethers.Contract(nftmarketaddress, SGMarket.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.makeMarketItem(nftaddress, tokenId, price, {value: listingPrice})
    await transaction.wait()
    console.log('ok');
    router.push('./')
  }

  return(
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">

        <input placeholder="Enter Title" className="mt-8 border rounded p-4" onChange={e => updateFormInput({...formInput, name: e.target.value})} />

        <textarea placeholder="Enter Description" className="mt-2 border rounded p-4" onChange={e => updateFormInput({...formInput, description: e.target.value})} />

        <input placeholder="Enter price in ETH" className="mt-2 border rounded p-4" onChange={e => updateFormInput({...formInput, price: e.target.value})} />

        <input type="file" className="mt-4" name="Asset" onChange={onChange} />

        {fileUrl && (<Image alt="image" className="rounded mt-4" width="350px" src={fileUrl} />)}

        <button onClick={createMarket} className="font-bold mt-4 bg-green-900 text-white rounded p-4 shadow-lg">Mint NFT</button>

      </div>
    </div>
  )







































}