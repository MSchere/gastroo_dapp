<p align="center">
  <img src="https://user-images.githubusercontent.com/38076357/175780319-9bfbfa7d-e440-48bd-b3b9-2da57cf8a2a4.png">
</p>

# Gastroo Web3: Monetiza tu contenido culinario
_Un marketplace para la venta de recetas y videos culinarios en la web descentralizada._

**Gastroo es un proyecto que busca fusionar el mundo culinario con la web descentralizada y provee una plataforma fácil de usar donde aficionados y profesionales de la cocina puedan sacar partido de su contenido culinario. En Gastroo, existen tres tipos principales de tokens:**
* **GastroVídeos públicos: Cualquiera los puede ver mientras estén disponibles en el mercado.**
* **GastroVídeos privados: Solo el poseedor del token puede ver el contenido.**
* **GastroTokens: Tokens con diversas utilidades emitidos por marcas o establecimientos.**

Para la realizacion de este proyecto se han utilizado las siguientes tecnologias:
* React.js
* SASS
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




