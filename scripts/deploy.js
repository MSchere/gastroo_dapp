// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
    // This is just a convenience check
    if (network.name === "hardhat") {
      console.warn(
        "You are trying to deploy a contract to the Hardhat Network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }
  
    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log(
      "Deploying the contracts with the account:",
      await deployer.getAddress()
    );
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Token = await ethers.getContractFactory("GastrooToken");
    const token = await Token.deploy();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await NFTMarketplace.deploy();
  
    await token.deployed();
    await nftMarketplace.deployed();
  
    console.log("Token address:", token.address);
    console.log("Marketplace address", nftMarketplace.address)
    // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles(token, nftMarketplace);
  }
  
  function saveFrontendFiles(token, nftMarketplace) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../gastroo_frontend/src/contracts";
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    fs.writeFileSync(
      contractsDir + "/token-address.json",
      JSON.stringify({ Token: token.address }, undefined, 2)
    );

    fs.writeFileSync(
        contractsDir + "/marketplace-address.json",
        JSON.stringify({ Marketplace: nftMarketplace.address }, undefined, 2)
    );
  
    const TokenArtifact = artifacts.readArtifactSync("GastrooToken");
    const MarketplaceArtifact = artifacts.readArtifactSync("NFTMarketplace");

  
    fs.writeFileSync(
      contractsDir + "/Token.json",
      JSON.stringify(TokenArtifact, null, 2)
    );

    fs.writeFileSync(
        contractsDir + "/Marketplace.json",
        JSON.stringify(MarketplaceArtifact, null, 2)
    );
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });