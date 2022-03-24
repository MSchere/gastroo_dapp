describe("NFTMarket", function() {
  it("Creacion y ejecucion de ventas de MarketPlace", async function() {
    /* IMplementacion del MarketPlace*/
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace")
    const nftMarketplace = await NFTMarketplace.deploy()
    await nftMarketplace.deployed()

    let listingPrice = await nftMarketplace.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('1', 'ether')

    /* Creacion de Tokens */
    await nftMarketplace.createToken("https://www.testoken1.com", auctionPrice, { value: listingPrice })
    await nftMarketplace.createToken("https://www.testoken2.com", auctionPrice, { value: listingPrice })
    await nftMarketplace.createToken("https://www.testoken3.com", auctionPrice, { value: listingPrice })
      
    const [_, buyerAddress] = await ethers.getSigners()
  
    /* Ejecucion de la venta del token a otro usuario */
    await nftMarketplace.connect(buyerAddress).createMarketSale(1, { value: auctionPrice })

    /* Reventa de un token */
    await nftMarketplace.connect(buyerAddress).resellToken(1, auctionPrice, { value: listingPrice })

    /* Consulta y retorno de los articulos no vendidos */
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
