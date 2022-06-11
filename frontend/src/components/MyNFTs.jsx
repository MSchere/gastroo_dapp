import { Card, Divider, Input, Image, Modal, Tooltip, Skeleton } from "antd";
import Text from "antd/lib/typography/Text";
import { CardContent } from "./NFTCard";
import {
  FileSearchOutlined,
  CoffeeOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import React from "react";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
import axios from "axios";
import Marketplace from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";
const { Meta } = Card;

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

function MyNFTs() {
  const { Moralis, chainId, account } = useMoralis();
  const web3 = new Web3(Moralis.provider);
  const [nfts, setNfts] = useState([]);
  const [visible, setVisibility] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [nftToSell, setNftToSell] = useState(null);
  const [price, setPrice] = useState(null);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [visible2, setVisibility2] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  useEffect(() => {
    loadNFTs();
  }, []);

  const contract = new web3.eth.Contract(
    Marketplace.abi,
    marketplaceAddress.Marketplace,
  );
  async function loadNFTs() {
    const data = await contract.methods
      .fetchItemsListed()
      .call({ from: account });

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await contract.methods
          .uri(i.tokenId)
          .call({ from: account });
        const meta = await axios.get(tokenURI);
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
          tokenURI,
        };
        return item;
      }),
    );
    setNfts(items);
    setLoadingState("loaded");
  }

  const handleTransferClick = (nft) => {
    setNftToSell(nft);
    setVisibility(true);
  };

  const handleTransferClick2 = (nft) => {
    setSelectedNFT(nft);
    setVisibility2(true);
  };

  const handleChange = (e) => {
    setPrice(e.target.value);
  };

  async function listNFT(nft, price) {
    if (!price) return;
    const priceFormatted = Moralis.Units.ETH(price);
    let listingPrice = await contract.methods
      .getListingPrice()
      .call({ from: account });
    listingPrice = listingPrice.toString();
    const tokenId = nft.tokenId;
    console.log("Owner: " + nft.owner);
    console.log("Seller: " + nft.seller);
    console.log("Current account: " + account);
    const transaction = await contract.methods
      .resellToken(tokenId, priceFormatted)
      .send({ from: account, value: listingPrice });
  }
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
                  <Tooltip title="Poner NFT en venta">
                    <DollarOutlined onClick={() => handleTransferClick(nft)} />
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
                  price={""}
                />
              </Card>
            );
          })}
        </Skeleton>
      </div>
      <Modal
        title={`Poner en venta ${nftToSell?.name || "NFT"}`}
        visible={visible}
        cancelText="Cancelar"
        onCancel={() => setVisibility(false)}
        onOk={() => listNFT(nftToSell, price)}
        confirmLoading={isPending}
        okText="Listar"
      >
        {nftToSell && (
          <Input placeholder="precio" onChange={(e) => handleChange(e)} />
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

export default MyNFTs;
