// SPDX-License-Identifier: MIT

/* 
Este contrato inteligente implementa un token ERC-1155 estandar importado 
desde la libreria de OpenZeppelin.
*/

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract NFTMarketplace is ERC1155, Ownable, ERC1155URIStorage, ERC1155Holder {
    using Counters for Counters.Counter;
    /*================Variables globales================*/
    Counters.Counter private _tokenIds;
    Counters.Counter private _offerIds;
    Counters.Counter private _offersInMarket;

    uint256 creatorFee = 100; //tasa del 1% pagada al creador
    uint256 mintingFee = 0.001 ether; //Se usa cuando minteamos tokens de video
    uint256 fungMintingFee = 0.0001 ether; //Se usa cuando minteamos tokens funcgibles

    /*================Estructuras de datos================*/
    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => MarketOffer) private idToMarketOffer;

    struct MarketItem {
        uint256 tokenId;
        address payable creator;
        uint256 totalAmount;
        bool isPrivate;
        bool isFungible;
    }

    struct MarketOffer {
        MarketItem item;
        uint256 offerId;
        address payable seller;
        uint256 price;
        uint256 amount;
        bool isActive;
    }

    /*================Eventos================*/
    event MarketOfferCreated(
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        uint256 amount
    );

    /*================Getters y Setters================*/
    function updateCreatorFee(uint256 _creatorFee) public payable onlyOwner{
        creatorFee = _creatorFee;
    }

    /* Devuelve el precio de la cotizacion del contrato */
    function getCreatorFee() public view returns (uint256) {
        return creatorFee;
    }

    function updateMintingFee(uint256 _mintingFee) public payable onlyOwner{
        mintingFee = _mintingFee;
    }

    /* Devuelve el precio de la cotizacion del contrato */
    function getMintingFee() public view returns (uint256) {
        return mintingFee;
    }

    function updateFungMintingFee(uint256 _fungMintingFee) public payable onlyOwner{
        fungMintingFee = _fungMintingFee;
    }

    /* Devuelve el precio de la cotizacion del contrato */
    function getFungMintingFee() public view returns (uint256) {
        return fungMintingFee;
    }

    /*================Métodos heredados================*/
    constructor() ERC1155("") {}

    function uri(uint256 tokenId)
        public
        view
        virtual
        override(ERC1155, ERC1155URIStorage)
        returns (string memory)
    {
        return super.uri(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, ERC1155Receiver)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /*
    Este es el constructor para nuestro contrato inteligente.
    Aqui especificaremos las propiedades que definiran el contrato. 
    Aqui se inicializaran las variables de estado del contrato.
    */

    /*
    Actualiza el precio de la cotizacion del contrato 
    Esta cotizacion fijada la recibirá el proietario del marketplace
    por cada una de las ventas realizadas 
    */

    /*================Funciones de Escritura================*/


    /* 
    Con estas funciones el usuario podra realizar la creacion del NFT
    siendo este listado a continuacion en el Marketplace
     */
    function createToken(
        string memory tokenURI,
        uint256 amount,
        bool isPrivate,
        bool isFungible
    ) public payable returns (uint) {
        uint256 fee = 0;
        if (isFungible) fee = amount * fungMintingFee;
        else fee = amount * mintingFee;
        require (
            msg.value == fee,
            "Insufficient minting value sent"
        );
        payable(owner()).transfer(fee); //Fee de minteo
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        bytes memory data;
        _mint(msg.sender, newTokenId, amount, data);
        _setURI(newTokenId, tokenURI);
        idToMarketItem[newTokenId] = MarketItem(
            newTokenId,
            payable(msg.sender),
            amount,
            isPrivate,
            isFungible        
            );
        return newTokenId;
    }

    /* Crea un elemento en el Marketplace basándose en un item creado */
    function createMarketOffer(
        uint256 tokenId,
        uint256 amount,
        uint256 price    
        ) public payable {
        require(price > 0, "Price must be at least 1 wei");
        bytes memory data;
        _safeTransferFrom(msg.sender, address(this), tokenId, amount, data);
        _offerIds.increment();
        uint256 newOfferId = _offerIds.current();
        idToMarketOffer[newOfferId] = MarketOffer(
            idToMarketItem[tokenId],
            newOfferId,
            payable(msg.sender),
            price,
            amount,
            true
        );
        _offersInMarket.increment();
        emit MarketOfferCreated(
            tokenId,
            msg.sender,
            price,
            amount
        );
    }

        function cancelMarketOffer(uint256 offerId) public payable {
        uint tokenId = idToMarketOffer[offerId].item.tokenId;
        address seller = idToMarketOffer[offerId].seller;
        uint amount = idToMarketOffer[offerId].amount;
        bytes memory data;
        require(
            msg.sender == seller,
            "Only the seller can cancel the sale"
        );
        _safeTransferFrom(address(this), msg.sender, tokenId, amount, data);

        idToMarketOffer[offerId].amount = 0;
        idToMarketOffer[offerId].seller = payable(address(0));
        idToMarketOffer[offerId].isActive = false;
        _offersInMarket.decrement();
        
    }

    /* realiza la venta de un token en el MarketPlace */
    /* Se transfiere la propiedad del Token y los fondos correspondientes a la transaccion entre las partes */
    function createMarketSale(uint256 offerId, uint256 amount) public payable {
        uint tokenId = idToMarketOffer[offerId].item.tokenId;
        address creator = idToMarketOffer[offerId].item.creator;
        uint totalPrice = idToMarketOffer[offerId].price * amount;
        uint totalFee = totalPrice / creatorFee;
        address seller = idToMarketOffer[offerId].seller;
        uint remainingAmount = idToMarketOffer[offerId].amount - amount;
        bytes memory data;
        require(
            msg.value >= totalPrice + totalFee,
            "Insufficient value sent to create the sale"
        );
        _safeTransferFrom(address(this), msg.sender, tokenId, amount, data);
        
        payable(creator).transfer(totalFee); //1% creatorFee al creator
        payable(seller).transfer(totalPrice); //Precio total al vendedor
        idToMarketOffer[offerId].amount = remainingAmount;
        if (remainingAmount <= 0) {
            idToMarketOffer[offerId].seller = payable(address(0));
            idToMarketOffer[offerId].isActive = false;
            _offersInMarket.decrement();
        }
    }

     /*================Funciones de Lectura================*/


    /* Devuelve las ofertas activas del Marketplace
    tokenType a: 
    - 0: tokens de video publico
    - 1: tokens de video privado
    - 2: tokens fungibles
    - resto: todos los tokens
    */
    function fetchMarketOffers(uint tokenType) public view returns (MarketOffer[] memory) {
        uint currentIndex = 0;
        MarketOffer memory offer;
        MarketOffer[] memory offers = new MarketOffer[](_offersInMarket.current());
        for (uint i = 1; i <= _offerIds.current(); i++) {
            offer = idToMarketOffer[i];
            if (tokenType == 0 && offer.isActive && !offer.item.isPrivate  && !offer.item.isFungible) {
                offers[currentIndex] = offer;
                currentIndex += 1;
            }
            else if (tokenType == 1 && offer.isActive && offer.item.isPrivate && !offer.item.isFungible) {
                offers[currentIndex] = offer;
                currentIndex += 1;
            }
            else if (tokenType == 2 && offer.isActive && !offer.item.isPrivate && offer.item.isFungible) {
                offers[currentIndex] = offer;
                currentIndex += 1;
            }
            else if (tokenType == 4 && offer.isActive) {
                offers[currentIndex] = offer;
                currentIndex += 1;
            }      
        }
        return offers;
    }
    

    /* Devuelve todos las ofertas publicadas por el usuario*/
    function fetchMyOffers() public view returns (MarketOffer[] memory) {
        uint totalOfferCount = _offerIds.current();
        uint currentIndex = 0;
        uint offerCount = 0;
        for (uint i = 1; i <= totalOfferCount; i++) {
            if (idToMarketOffer[i].isActive && (idToMarketOffer[i].seller == msg.sender)) {
                offerCount += 1;
            }
        }
        MarketOffer[] memory offers = new MarketOffer[](offerCount);
        for (uint i = 1; i <= totalOfferCount; i++) {
            if (idToMarketOffer[i].isActive && (idToMarketOffer[i].seller == msg.sender)) {
                MarketOffer storage currentOffer = idToMarketOffer[i];
                offers[currentIndex] = currentOffer;
                currentIndex += 1;
            }
        }
        return offers;
    }

    /* Devuelve los tokens del usuario */
    function fetchOwnedItems() public view returns (MarketItem[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        for (uint i = 1; i <= totalItemCount; i++) {
            if (balanceOf(msg.sender, i) > 0) {
                itemCount += 1;
            }
        }
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 1; i <= totalItemCount; i++) {
            if (balanceOf(msg.sender, i) > 0) {
                MarketItem storage currentItem = idToMarketItem[i];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}
