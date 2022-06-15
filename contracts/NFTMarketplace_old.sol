// SPDX-License-Identifier: MIT

/* 
Este contrato inteligente implementa un token ERC-721 estandar importado 
desde la libreria de OpenZeppelin.
*/

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarketplace_old is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.025 ether;
    address payable owner;
    bool public paused;

    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    /*createToken
    Este es el constructor para nuestro contrato inteligente.
    Aqui especificaremos las propiedades que definiran el contrato. 
    Aqui se inicializaran las variables de estado del contrato.
    */
    constructor() ERC721("TFG Tokens", "TFGT") {
        owner = payable(msg.sender);
    }

    /*
    Actualiza el precio de la cotizacion del contrato 
    Esta cotizacion fijada la recibirá el proietario del marketplace
    por cada una de las ventas realizadas 
    */
    function updateListingPrice(uint _listingPrice) public payable {
        require(
            owner == msg.sender,
            "Solo el propietario del MarketPlace puede actualizar el listado de precios."
        );
        listingPrice = _listingPrice;
    }

    /* Devuelve el precio de la cotizacion del contrato */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* 
    Con estas funciones el usuario podra realizar la creacion del NFT
    siendo este listado a continuacion en el Marketplace
     */
    function createToken(string memory tokenURI, uint256 price)
        public
        payable
        returns (uint)
    {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        createMarketItem(newTokenId, price);
        return newTokenId;
    }

    /* Crea un elemento en el Marketplace basándose en un item creado */
    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "El precio debe ser al menos 1 wei");
        require(
            msg.value == listingPrice,
            "El precio debe ser el mismo que en la lista de precios"
        );

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    /*
    Esta funcion permite la reventa al propietario actual de un token comprado anteriormente
    */
    function resellToken(uint256 tokenId, uint256 price) public payable {
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Solo el propieario puede realizar esta operacion"
        );
        require(
            msg.value == listingPrice,
            "El precio debe ser el mismo que en la lista de precios"
        );
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));
        _itemsSold.decrement();

        _transfer(msg.sender, address(this), tokenId);
    }

    /* realiza la venta de un token en el MarketPlace */
    /* Se transfiere la propiedad del Token y los fondos correspondientes a la transaccion entre las partes */
    function createMarketSale(uint256 tokenId) public payable {
        uint price = idToMarketItem[tokenId].price;
        address seller = idToMarketItem[tokenId].seller;
        require(
            msg.value == price,
            "Envie el importe solicitado para completar la compra"
        );
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));
        _itemsSold.increment();
        _transfer(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);
        payable(seller).transfer(msg.value);
    }

    /* Devuelve los tokens que han sido comprados por el usuario*/
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Devuelve todos los Tokens no vendidos del Marketplace*/
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _tokenIds.current();
        uint unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Devuelve los tokens publicados por el usuario */
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function setPaused(bool _paused) public {
        require(msg.sender == owner, "You are not the owner");
        paused = _paused;
    }
}