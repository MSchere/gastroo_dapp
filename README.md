# MarketPlace de videos NFT

Creacion de una marketPlace para la venta de NFT de video.
Para su realizacion se ha implementado un contrato estandar ERC721 importado directamente de  @OpenZeppelin.
 Para la realizacion de este proyecto se han utilizado las siguientes tecnologias.

 Next.js
 Solidity
 IPFS
 Polygon(Matic)
 Hardhat
 Tailwind

Para el uso de la aplicacion es necesario tener previamente Metamask instalado como extension en el navegador Google Chrome paa poder importar las cuentas que se nos crearan en la red local de prueba, asi como en Mumbay.

Se añaden a continuacion los comandos necesarios para el despliegue de la aplicacion en un entorno local con Node.js

// Despliegue de la red local (se crean las cuentas)

npx hardhat node

// Desplegamos el contrato inteligente:

npx hardhat run scripts/deploy.js --network localhost

// Importamos cuentas creadas por hardhat a metamask

//Seguidamente lanzamos la app

npm run dev





