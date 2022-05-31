import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { Spinner } from 'reactstrap'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    //Comprobamos que el archivo introducido es del formato correcto(mp4).
    var allowedExtensions = /(.mp4)$/i;
    if(!allowedExtensions.exec(e.target.files[0].name)){
      console.log(e.target.files[0].name)
      window.alert("Debes añadir un video en formato mp4")
      window.location.reload()
    }
 //subimos el video a IPFS
    const file = e.target.files[0]
    try {
      /*El método add devuelve un resultado de tipo AddResult, que 
      contiene las siguientes propiedades cid, mode, mtime, path y size */
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)

        }
      )
      /*Usaremos path para mostrar el archivo subido a IPFS en nuestra aplicacion*/
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Upss...Algo ha ido mal subiendo tu archivo: ', error)
    }  
  }
  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
//Subimos el json con los metadartos a IPFS
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      //Despues de la subida del Json, se devuelve la URL para utilizarla en la transaccion
      return url
    } catch (error) {
      console.log('Upss...Algo ha ido mal subiendo tu archivo: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()


    //Creacion del NFT
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()

    router.push('/')
  }

  return (
    <div className="flex justify-center">
      
      <div className="w-1/2 flex flex-col pb-12">
      <h2 className="text-2xl py-2">Aqui puedes crear tu NFT</h2>
        <input 
          placeholder="Pon un nombre para tu NFT"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Pon una descripcion para tu NFT"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="¿Cual es el precio para tu NFT?"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
          

        {
          fileUrl && (
            <video src={fileUrl} controls/>
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-5 bg-red-500 text-white rounded p-5 shadow-lg">
          ¡¡Crea tu NFT!!
        </button>
      </div>
    </div>
  )
}