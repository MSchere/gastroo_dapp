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
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.01 ether;

    bool public paused;

    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable tokenOwner;
        uint256 price;
        uint256 cuantity;
        bool isprivate;
        bool sold;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address tokenOwner,
        uint256 price,
        uint256 cuantity,
        bool isprivate,
        bool sold
    );

    /*
    Este es el constructor para nuestro contrato inteligente.
    Aqui especificaremos las propiedades que definiran el contrato. 
    Aqui se inicializaran las variables de estado del contrato.
    */

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

    constructor() ERC1155("") {}

    /*
    Actualiza el precio de la cotizacion del contrato 
    Esta cotizacion fijada la recibirá el proietario del marketplace
    por cada una de las ventas realizadas 
    */
    function updateListingPrice(uint _listingPrice) public payable onlyOwner {
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
    function createToken(
        string memory tokenURI,
        uint256 amount,
        uint256 price,
        bool isprivate
    ) public payable returns (uint) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        bytes memory data;
        _mint(msg.sender, newTokenId, amount, data);
        _setURI(newTokenId, tokenURI);
        createMarketItem(newTokenId, amount, price, isprivate);
        return newTokenId;
    }

    /* Crea un elemento en el Marketplace basándose en un item creado */
    function createMarketItem(
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        bool isprivate
    ) private {
        uint fee = listingPrice * amount;
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == fee, "Value must match the required fee");
        bytes memory data;
        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            amount,
            isprivate,
            false
        );

        _safeTransferFrom(msg.sender, address(this), tokenId, amount, data);
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            amount,
            isprivate,
            false
        );
    }

    /*
    Esta funcion permite la reventa al propietario actual de un token comprado anteriormente
    */
    function resellToken(
        uint256 tokenId,
        uint256 amount,
        uint256 price
    ) public payable {
        uint fee = listingPrice * amount;
        require(
            idToMarketItem[tokenId].tokenOwner == msg.sender,
            "Only the token owner can sell the token"
        );
        require(msg.value == fee, "Value must match the required fee");
        bytes memory data;
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].tokenOwner = payable(address(this));
        _itemsSold.decrement();

        _safeTransferFrom(msg.sender, address(this), amount, tokenId, data);
    }

    /* realiza la venta de un token en el MarketPlace */
    /* Se transfiere la propiedad del Token y los fondos correspondientes a la transaccion entre las partes */
    function createMarketSale(uint256 tokenId, uint256 amount) public payable {
        uint price = idToMarketItem[tokenId].price * amount;
        address seller = idToMarketItem[tokenId].seller;
        bytes memory data;
        require(
            msg.value == price,
            "Insufficient value sent to create the sale"
        );
        idToMarketItem[tokenId].tokenOwner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));
        _itemsSold.increment();
        _safeTransferFrom(address(this), msg.sender, amount, tokenId, data);
        payable(idToMarketItem[tokenId].tokenOwner).transfer(
            listingPrice * amount
        );
        payable(seller).transfer(msg.value);
    }

    /* Devuelve los tokens que han sido comprados por el usuario*/
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].tokenOwner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].tokenOwner == msg.sender) {
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
            if (idToMarketItem[i + 1].tokenOwner == address(this)) {
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

    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
    }
}
