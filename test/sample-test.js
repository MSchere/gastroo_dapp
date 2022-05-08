// En este archivo se realiza la implementacion de las pruebas pertinentes al uso general
// de las funciones definidas en el contrato inteligente.


describe("NFTMarket", function() {
  it("Creacion y ejecucion de ventas de MarketPlace", async function() {
    //Test para la pruba de la implementacion del MarketPlace
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace")
    const nftMarketplace = await NFTMarketplace.deploy()
    await nftMarketplace.deployed()

    let listingPrice = await nftMarketplace.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    // Test de prueba donde verificamos la correcta creacion de Tokens 
    await nftMarketplace.createToken("https://www.probando1.es", auctionPrice, { value: listingPrice })
    await nftMarketplace.createToken("https://www.probando2.es", auctionPrice, { value: listingPrice })
    await nftMarketplace.createToken("https://www.probando3.es", auctionPrice, { value: listingPrice })
      
    const [_, buyerAddress] = await ethers.getSigners()
  
    // Ejecucion de la venta del token a otro usuario 
    await nftMarketplace.connect(buyerAddress).createMarketSale(1, { value: auctionPrice })

    // Reventa de un token 
    await nftMarketplace.connect(buyerAddress).resellToken(1, auctionPrice, { value: listingPrice })

    // Consulta y retorno de los articulos no vendidos 
    items = await nftMarketplace.fetchMarketItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nftMarketplace.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
})
