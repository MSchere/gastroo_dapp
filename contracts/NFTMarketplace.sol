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
    Counters.Counter private _tokenIds;
    Counters.Counter private _offerIds;
    Counters.Counter private _offersInMarket;


    //1/fee
    uint256 fee = 100;

    bool public paused;

    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => MarketOffer) private idToMarketOffer;

    struct MarketItem {
        uint256 tokenId;
        address payable creator;
        uint256 totalAmount;
        bool isPrivate;
    }

    struct MarketOffer {
        MarketItem item;
        uint256 offerId;
        address payable seller;
        uint256 price;
        uint256 amount;
        bool isActive;
    }

    event MarketOfferCreated(
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        uint256 amount
    );

    function updateFee(uint _fee) public payable onlyOwner{
        fee = _fee;
    }

    /* Devuelve el precio de la cotizacion del contrato */
    function getFee() public view returns (uint256) {
        return fee;
    }

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
    constructor() ERC1155("") {}

    /*
    Actualiza el precio de la cotizacion del contrato 
    Esta cotizacion fijada la recibirá el proietario del marketplace
    por cada una de las ventas realizadas 
    */
    function updateMarketFee(uint _fee) public payable onlyOwner {
        fee = _fee;
    }

    /* Devuelve el precio de la cotizacion del contrato */
    function getMarketFee() public view returns (uint256) {
        return fee;
    }

    /* 
    Con estas funciones el usuario podra realizar la creacion del NFT
    siendo este listado a continuacion en el Marketplace
     */
    function createToken(
        string memory tokenURI,
        uint256 amount,
        bool isPrivate
    ) public payable returns (uint) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        bytes memory data;
        _mint(msg.sender, newTokenId, amount, data);
        _setURI(newTokenId, tokenURI);
        idToMarketItem[newTokenId] = MarketItem(
            newTokenId,
            payable(msg.sender),
            amount,
            isPrivate        
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
        require(
            msg.value == ((price * amount) / fee),
            "Value must match the required fee"
        );
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

    /* realiza la venta de un token en el MarketPlace */
    /* Se transfiere la propiedad del Token y los fondos correspondientes a la transaccion entre las partes */
    function createMarketSale(uint256 offerId, uint256 amount) public payable {
        uint tokenId = idToMarketOffer[offerId].item.tokenId;
        address creator = idToMarketOffer[offerId].item.creator;
        uint price = idToMarketOffer[offerId].price * amount;
        address seller = idToMarketOffer[offerId].seller;
        uint remainingAmount = idToMarketOffer[offerId].amount - amount;
        bytes memory data;
        require(
            msg.value == price,
            "Insufficient value sent to create the sale"
        );
        _safeTransferFrom(address(this), msg.sender, tokenId, amount, data);
        
        payable(creator).transfer(price / fee);
        payable(seller).transfer(msg.value);
        idToMarketOffer[offerId].amount = remainingAmount;
        if (remainingAmount <= 0) {
            idToMarketOffer[offerId].seller = payable(address(0));
            idToMarketOffer[offerId].isActive = false;
            _offersInMarket.decrement();
        }
    }

    /* Devuelve todos las ofertas activas del Marketplace*/
    function fetchMarketOffers() public view returns (MarketOffer[] memory) {
        uint currentIndex = 0;
        MarketOffer[] memory offers = new MarketOffer[](_offersInMarket.current());
        for (uint i = 1; i <= _offerIds.current(); i++) {
            if (idToMarketOffer[i].isActive) {
                MarketOffer storage currentOffer = idToMarketOffer[i];
                offers[currentIndex] = currentOffer;
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

    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
    }
}
