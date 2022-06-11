# Gastroo Web3: Monetiza tu contenido culinario

_Un marketplace para la venta de NFTs de recetas y videos culinarios._

El contrato está basado en el creado por [migueloxx](https://github.com/migueloxx/tienda-nft/commits?author=migueloxx) e implementa un Marketplace de NFTs del estandar ERC-1155.

Para la realizacion de este proyecto se han utilizado las siguientes tecnologias:
* React.js
* Solidity
* IPFS
* Hardhat
* Web3.js
* Moralis

## Comandos para el despliegue en un entorno local:

###  Instalación de dependencias de Node en el directorio raiz y en el del frontend:

```
npm install
cd frontend && npm install
```

### Despliegue de la red local de Hardhat y del contrato inteligente en localhost:
(En el directorio raiz)
```
npx hardhat node
npm run deploy
```

### Importamos cuentas creadas por hardhat a metamask

### Seguidamente lanzamos la app

```
cd frontend && npm run start
```




