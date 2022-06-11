import React from "react";
import axios from "axios";
import { getExplorer } from "helpers/networks";
import { Card, Modal, Tooltip, Skeleton, Input } from "antd";
import { CardContent } from "./NFTCard";
import Text from "antd/lib/typography/Text";
import {
  FileSearchOutlined,
  ShoppingCartOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
const { Meta } = Card;

import MarketplaceContract from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
};

function Marketplace() {
  const { Moralis, account, chainId } = useMoralis();
  const web3 = new Web3(Moralis.provider);
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [visible, setVisibility] = useState(false);
  const [visible2, setVisibility2] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [nftToBuy, setNftToBuy] = useState(null);
  const [cuantity, setCuantity] = useState(null);

  const contract = new web3.eth.Contract(
    MarketplaceContract.abi,
    marketplaceAddress.Marketplace,
  );

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const data = await contract.methods
      .fetchMarketItems()
      .call({ from: account });

    //Asignacion y formateo de los elementos devueltos
    console.log(data);
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.methods
          .uri(i.tokenId)
          .call({ from: account });
        //const meta = await fetchIPFSDoc(tokenUri);
        const meta = await axios.get(tokenUri);
        let price = Moralis.Units.FromWei(i.price.toString());
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          cuantity: i.cuantity,
          isPrivate: i.isPrivate,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      }),
    );
    setNfts(items);
    setLoadingState("loaded");
  }

  async function buyNft(nft, cuantity) {
    //Peticion de pago al usuario par que se realice la transaccion
    const price = Moralis.Units.ETH(nft.price.toString()) * cuantity;
    await contract.methods
      .createMarketSale(nft.tokenId, cuantity)
      .send({ from: account, value: price });
    loadNFTs();
  }

  async function fetchIPFSDoc(tokenUri) {
    const url = `https://ipfs.io/ipfs/${tokenUri}`;
    const response = await fetch(url);
    return await response.json;
  }

  const handleTransferClick = (nft) => {
    setNftToBuy(nft);
    setVisibility(true);
  };

  const handleTransferClick2 = (nft) => {
    setSelectedNFT(nft);
    setVisibility2(true);
  };

  const handleChange = (e) => {
    setCuantity(e.target.value);
  };

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>🛒 Mercado de NFTs</h1>
      <div style={styles.NFTs}>
        <Skeleton loading={!loadingState}>
          {nfts.map((nft, i) => {
            return (
              <Card
                hoverable
                actions={[
                  <Tooltip title="Ver en el explorador">
                    <FileSearchOutlined
                      onClick={() =>
                        window.open(
                          `${getExplorer(chainId)}address/${nft.token_address}`,
                          "_blank",
                        )
                      }
                    />
                  </Tooltip>,
                  <Tooltip title="Ver receta">
                    <CoffeeOutlined onClick={() => handleTransferClick2(nft)} />
                  </Tooltip>,
                  <Tooltip title="Comprar NFT">
                    <ShoppingCartOutlined
                      onClick={() => handleTransferClick(nft)}
                    />
                  </Tooltip>,
                ]}
                style={{ width: 240, border: "2px solid #e7eaf3" }}
                cover={<video src={nft.image} controls />}
                key={i}
              >
                <CardContent
                  name={nft.name}
                  description={nft.token_address}
                  cuantity={nft.cuantity}
                  price={nft.price}
                />
              </Card>
            );
          })}
        </Skeleton>
      </div>
      <Modal
        title={`Comprar ${nftToBuy?.name || "NFT"}`}
        visible={visible}
        cancelText="Cancelar"
        onCancel={() => setVisibility(false)}
        onOk={() => buyNft(nftToBuy, cuantity)}
        confirmLoading={isPending}
        okText="Listar"
      >
        {nftToBuy && (
          <Input placeholder="cantidad" onChange={(e) => handleChange(e)} />
        )}
      </Modal>
      <Modal
        title={`Receta de ${selectedNFT?.name || "NFT"}`}
        visible={visible2}
        onOk={() => setVisibility2(false)}
        onCancel={() => setVisibility2(false)}
        cancelText="Cerrar"
      >
        <Text>{selectedNFT?.description || "NFT"}</Text>
      </Modal>
    </div>
  );
}

export default Marketplace;
