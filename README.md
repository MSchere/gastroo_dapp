<p align="center">
  <img src="https://user-images.githubusercontent.com/38076357/177832478-8a4e9fd0-a36a-4d2c-9659-4fe04a43de1a.png">
</p>

# Gastroo Web3: Monetiza tu contenido culinario
_Un marketplace en Avalanche para la publicación o venta de recetas y videos culinarios en la web descentralizada._

## Ya puedes probarlo en [gastroo.es](https://gastroo.es)!

**Gastroo es un proyecto que busca fusionar el mundo culinario con la web descentralizada y provee una plataforma fácil de usar donde aficionados y profesionales de la cocina puedan sacar partido de su contenido gastronómico. En Gastroo, existen tres tipos principales de tokens:**
* **GastroVídeos públicos: Cualquiera los puede ver mientras estén disponibles en el mercado.**
* **GastroVídeos privados: Solo el poseedor del token puede ver el contenido.**
* **GastroTokens: Tokens con diversas utilidades emitidos por marcas o establecimientos.**

Para la realizacion de este proyecto se han utilizado las siguientes tecnologias y librerías:

* Avalanche
* Hardhat
* Solidity
* Web3.js
* IPFS
* Moralis
* Google Cloud Run
* React.js
* SASS

Para probarlo tan solo navega a [gastroo.es](http://gastroo.es), clica en "Authenticate" y conecta tu cuenta de Metamask, se te pedirá que firmes para iniciar sesión. Después, selecciona la red de test Avalanche Fuji del desplegable arriba a la derecha.

![network-select](https://user-images.githubusercontent.com/38076357/177833743-9a86dc66-5d18-4d08-9413-033a62780c28.png)

Alternativamente puedes añadir la red Fuji en Metamask yendo a --> Configuración --> Redes e introduciendo:
* Nombre de la red: Avalanche Fuji C-Chain
* Dirrección RPC: https://api.avax-test.network/ext/bc/C/rpc
* ID de cadena: 43113
* Moneda: AVAX
* Explorador: https://testnet.snowtrace.io/

## Instrucciones para el despliegue en un entorno local:

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
* Moneda: AVAX

### Lanzamiento de la aplicación:
```
cd frontend && npm run start
```




