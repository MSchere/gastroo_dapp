// SPDX-License-Identifier: MIT

/* 
Implementación de un marketplace de tokens ERC-1155 empleando los estandares
de OpenZepellin
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

    uint256 creatorFee = 100;
    //tasa del 1% pagada al creador

    uint256 mintingFee = 0.0001 ether;
    //Se tasa al creador cuando mintea tokens de video

    uint256 fungMintingFee = 0.000001 ether;
    //Se tasa al creador cuando mintea tokens fungibles

    /*================Estructuras de datos================*/
    
    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => MarketOffer) private idToMarketOffer;

    //Estructura de datos para los distintos tipos de token
    struct MarketItem {
        uint256 tokenId;
        address payable creator;
        uint256 totalAmount;
        bool isPrivate;
        bool isFungible;
    }

    //Estructura de datos para las ofertas en el mercado
    struct MarketOffer {
        MarketItem item;
        uint256 offerId;
        address payable seller;
        uint256 price;
        uint256 amount;
        bool isActive;
    }

    /*================Eventos================*/

    event TokenMinted(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 totalAmount,
        bool isPrivate,
        bool isFungible,
        uint256 fees
    );

    event MarketOfferCreated(
        uint256 indexed tokenId,
        uint256 offerId,
        address indexed seller,
        uint256 price,
        uint256 amount
    );

    event MarketOfferCancelled(
        uint256 indexed tokenId,
        uint256 offerId,
        address indexed seller,
        uint256 amount
    );

    event MarketItemSold(
        uint256 indexed tokenId,
        uint256 offerId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 amount
    );

    /*================Getters y Setters================*/

    function updateCreatorFee(uint256 _creatorFee) public onlyOwner {
        creatorFee = _creatorFee;
    }

    /* Devuelve el precio de la cotizacion del contrato */
    function getCreatorFee() public view returns (uint256) {
        return creatorFee;
    }

    function updateMintingFee(uint256 _mintingFee) public onlyOwner {
        mintingFee = _mintingFee;
    }

    /* Devuelve el precio de la cotizacion del contrato */
    function getMintingFee() public view returns (uint256) {
        return mintingFee;
    }

    function updateFungMintingFee(uint256 _fungMintingFee) public onlyOwner {
        fungMintingFee = _fungMintingFee;
    }

    /* Devuelve el precio de la cotizacion del contrato */
    function getFungMintingFee() public view returns (uint256) {
        return fungMintingFee;
    }

    /*================Métodos heredados================*/

    constructor() ERC1155("") {}

    /* Estos métodos son obligatorios de implementar ya que existen conflictos entre
    las implementaciones de contratos heredados */
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

    /*================Funciones de Escritura================*/

    /* 
    Crea una colección de tokens ERC-1155 y se paga una tasa de minteo
    Se especifica el URI de IPFS, la cantidad, si es privado y si es fungible
    Los tokens fungibles no deberían ser privados.
    */
    function createToken(
        string memory tokenURI,
        uint256 amount,
        bool isPrivate,
        bool isFungible
    ) public payable returns (uint) {
        uint256 fee = 0;
        if (isFungible) fee = amount * getFungMintingFee();
        else fee = amount * getMintingFee();
        require(msg.value >= fee, "Insufficient minting value sent");
        payable(owner()).transfer(fee); //Fee de minteo para el marketplace
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
        emit TokenMinted(
            newTokenId,
            msg.sender,
            amount,
            isPrivate,
            isFungible,
            fee
        );
        return newTokenId;
    }

    /* Crea una oferta en el markeplace especificando
    el id del token, cantidad en venta y precio  */
    function createMarketOffer(
        uint256 tokenId,
        uint256 amount,
        uint256 price
    ) public {
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
        emit MarketOfferCreated(tokenId, newOfferId, msg.sender, price, amount);
    }

    /* Cancela una oferta del marketplace especificando el id de oferta  */
    function cancelMarketOffer(uint256 offerId) public {
        uint tokenId = idToMarketOffer[offerId].item.tokenId;
        address seller = idToMarketOffer[offerId].seller;
        uint amount = idToMarketOffer[offerId].amount;
        bytes memory data;
        require(msg.sender == seller, "Only the seller can cancel the sale");
        _safeTransferFrom(address(this), msg.sender, tokenId, amount, data);

        idToMarketOffer[offerId].amount = 0;
        idToMarketOffer[offerId].seller = payable(address(0));
        idToMarketOffer[offerId].isActive = false;
        _offersInMarket.decrement();
        emit MarketOfferCancelled(tokenId, offerId, msg.sender, amount);
    }

    /* Realiza la venta de tokens en el MarketPlace
    Se transfiere la propiedad de los tokens y los fondos
	correspondientes a la transaccion entre las partes
    También se paga una tasa del 1% que va al creador */
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
        emit MarketItemSold(
            tokenId,
            offerId,
            msg.sender,
            seller,
            totalPrice,
            amount
        );
    }

    /*================Funciones de Lectura================*/

    /* Devuelve las ofertas activas del Marketplace
    tokenType a: 
    - 0: tokens de video publico
    - 1: tokens de video privado
    - 2: tokens fungibles
    - 3: todos los tokens
    */
    function fetchMarketOffers(uint tokenType)
        public
        view
        returns (MarketOffer[] memory)
    {
        uint currentIndex = 0;
        MarketOffer memory offer;
        MarketOffer[] memory offers = new MarketOffer[](
            _offersInMarket.current()
        );
        for (uint i = 1; i <= _offerIds.current(); i++) {
            offer = idToMarketOffer[i];
            if (
                tokenType == 0 &&
                offer.isActive &&
                !offer.item.isPrivate &&
                !offer.item.isFungible
            ) {
                offers[currentIndex] = offer;
                currentIndex += 1;
            } else if (
                tokenType == 1 &&
                offer.isActive &&
                offer.item.isPrivate &&
                !offer.item.isFungible
            ) {
                offers[currentIndex] = offer;
                currentIndex += 1;
            } else if (
                tokenType == 2 &&
                offer.isActive &&
                !offer.item.isPrivate &&
                offer.item.isFungible
            ) {
                offers[currentIndex] = offer;
                currentIndex += 1;
            } else if (tokenType == 3 && offer.isActive) {
                offers[currentIndex] = offer;
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

    /* Devuelve las ofertas publicadas por el usuario*/
    function fetchMyOffers() public view returns (MarketOffer[] memory) {
        uint totalOfferCount = _offerIds.current();
        uint currentIndex = 0;
        uint offerCount = 0;
        for (uint i = 1; i <= totalOfferCount; i++) {
            if (
                idToMarketOffer[i].isActive &&
                (idToMarketOffer[i].seller == msg.sender)
            ) {
                offerCount += 1;
            }
        }
        MarketOffer[] memory offers = new MarketOffer[](offerCount);
        for (uint i = 1; i <= totalOfferCount; i++) {
            if (
                idToMarketOffer[i].isActive &&
                (idToMarketOffer[i].seller == msg.sender)
            ) {
                MarketOffer storage currentOffer = idToMarketOffer[i];
                offers[currentIndex] = currentOffer;
                currentIndex += 1;
            }
        }
        return offers;
    }

    /* Función de airdop que genera 14 tipos de token para testeo y pone parte en venta */
    function airdrop() public payable onlyOwner {
        string[17] memory uris = [
            "https://gastroo.infura-ipfs.io/ipfs/QmdhVvgsgPc3FCJEJdT3KaepziPKi3dkyeo65wh6zMWMnA", //pizza
            "https://gastroo.infura-ipfs.io/ipfs/QmU56VPKXrVKNwZW5JjMNJUBYKVm8fxZwooyTSSRnQACSv", //albondigas
            "https://gastroo.infura-ipfs.io/ipfs/QmTprQcFBKVDMfK3sTDA4hxNyCmbSzXdf6ZgTMypWF75Ff", //cesar
            "https://gastroo.infura-ipfs.io/ipfs/QmagBJatWuYgSh873wk1C4x9ci7TZS6MsUCS6YWHJkMh9m", //fetuccini
            "https://gastroo.infura-ipfs.io/ipfs/QmZS733Permp7mBQ3SAZDEJ5XZg1Cb7b3bitTcufECRBba", //fried chicken
            "https://gastroo.infura-ipfs.io/ipfs/QmQpjJAqbGy3E7M3yFL9KyZT9WEoWfN3TEhPryRqyipqEr", //lasagna
            "https://gastroo.infura-ipfs.io/ipfs/QmfVtApThAQgzzbbQmCrbuxE9ix3MVSMqKKygF5xNmiwa4", //mapo tofu
            "https://gastroo.infura-ipfs.io/ipfs/QmRytjGb6c8pE523L52v8H1EDiADie9xyyi6eo2869LwqP", //miso ramen
            "https://gastroo.infura-ipfs.io/ipfs/QmSARVAVxsSu9yXrHAcvsMgi49zVZN9AGxUtpdYumcLewq", //cochinillo
            "https://gastroo.infura-ipfs.io/ipfs/QmaRndom8R2WM2Kw6P57KaipnYoXuPdCHhCUaM7KRJVVtj", //bacalao
            "https://gastroo.infura-ipfs.io/ipfs/QmPUKszQ4NUpZbmCxq1DXjCRsSrAopjP6YphmfHL4xsn9V", //pastrami privado
            "https://gastroo.infura-ipfs.io/ipfs/QmYuuSNyHuQqTqLxXU7LwVeipq3r6DGjYhj55KQ9KojJmr", //poke privado
            "https://gastroo.infura-ipfs.io/ipfs/QmThXTTxMoj8NdaNNcFxSxacngRXH4XtgyRmQMJ3Z3Dh5q", //empanada privada
            "https://gastroo.infura-ipfs.io/ipfs/QmWFJHmZF5oNhLZXGLZfzhjNbGims56A7mHbWmw6JDU7w2", //lombarda privada
            "https://gastroo.infura-ipfs.io/ipfs/QmQi97vEmFQUB7EZv3jm9aZHuFVwnXGirwFcEXxLmxBu1U", //mercaToken
            "https://gastroo.infura-ipfs.io/ipfs/QmYQq3iH26RZ7gEU7zKrwuuAbzwomm6kLEcSxFL8hLapbu", //mcDonaldsCoin
            "https://gastroo.infura-ipfs.io/ipfs/QmSUVazUcpHVDNviNzsfuCtkWqt2DeqJ2pV8DjmzSzev5u" //gastrooToken
        ];

        uint24[17] memory amounts = [
            35,
            25,
            40,
            50,
            35,
            20,
            100,
            50,
            35,
            45,
            60,
            55,
            70,
            50,
            1000000,
            100000,
            1000000
        ];
        bool[17] memory privates = [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            true,
            true,
            true,
            false,
            false,
            false
        ];
        bool[17] memory fungibles = [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            true,
            true
        ];

        uint24[17] memory amountsOnSale = [
            15,
            5,
            25,
            40,
            25,
            15,
            80,
            25,
            25,
            40,
            30,
            45,
            60,
            45,
            800000,
            75000,
            900000
        ];
        uint64[17] memory prices = [
            0.01 ether,
            0.02 ether,
            0.015 ether,
            0.007 ether,
            0.025 ether,
            0.001 ether,
            0.002 ether,
            0.0025 ether,
            0.001 ether,
            0.0056 ether,
            0.1 ether,
            0.055 ether,
            0.15 ether,
            0.1 ether,
            0.00001 ether,
            0.000012 ether,
            0.00001 ether
        ];

        for (uint i = 0; i < 17; i++) {
            createToken(uris[i], amounts[i], privates[i], fungibles[i]);
            createMarketOffer(i + 1, amountsOnSale[i], prices[i]);
        }
    }
}
