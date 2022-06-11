<p align="center">
  <img width="400" height="196" src="https://user-images.githubusercontent.com/38076357/173185461-4b0b5685-16c5-44b5-bb6f-2f6c64582b31.png">
</p>

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
### Importar las cuentas creadas por Hardhat en Metamask:
* 1. Copiamos de la consola de Hardhat alguna de las claves privadas generadas
* 2. Abrimos Metamask -> Importar Cuenta -> pegamos la clave
* 3. Configuramos la red local de Hardhat yendo a Metamask --> Configuración --> Redes
* Nombre de la red: Hardhat
* Dirrección RPC: http://localhost:8545
* ID de cadena: 1337
* Moneda: ETH


### Lanzamiento de la aplicación:
```
cd frontend && npm run start
```




