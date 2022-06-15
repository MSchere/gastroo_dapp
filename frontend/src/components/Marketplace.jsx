import React from "react";
import axios from "axios";
import { getExplorer } from "helpers/networks";
import { Card, Modal, Tooltip, Skeleton, Input } from "antd";
import { CardContent, ImageCard } from "./NFTCard";
import { VideoContent } from "./VideoContent";
import Text from "antd/lib/typography/Text";
import {
  FileSearchOutlined,
  ShoppingCartOutlined,
  CodeSandboxOutlined,
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
  const [offers, setOffers] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [visible, setVisibility] = useState(false);
  const [visible2, setVisibility2] = useState(false);
  const [selectedNFT, setSelectedOffer] = useState(null);
  const [nftToBuy, setOffer] = useState(null);
  const [amountToBuy, setamount] = useState(null);

  const contract = new web3.eth.Contract(
    MarketplaceContract.abi,
    marketplaceAddress.Marketplace,
  );

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    /* create a generic provider and query for unsold market items */
    const data = await contract.methods
      .fetchMarketOffers()
      .call({ from: account });

    //Asignacion y formateo de los elementos devueltos
    console.log(data);
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.methods
          .uri(i.item.tokenId)
          .call({ from: account });
        const meta = await axios.get(tokenUri).catch(function (error) {
          console.log(error);
        });
        let price = Moralis.Units.FromWei(i.price.toString());
        let item = {
          offerId: i.offerId,
          tokenId: i.item.tokenId,
          seller: i.seller,
          owner: i.owner,
          amount: i.amount,
          price,
          totalAmount: i.item.totalAmount,
          isPrivate: i.item.isPrivate,
          image: meta.data.image,
          video: meta.data.video,
          name: meta.data.name,
          description: meta.data.description,
          ingredients: meta.data.ingredients,
          categories: meta.data.categories,
        };
        console.log(item);
        return item;
      }),
    );
    setOffers(items);
    setLoadingState("loaded");
  }

  async function buyNft(offer, amountToBuy) {
    console.log(offer.tokenId);
    console.log(offer.offerId);
    const formattedPrice =
      Moralis.Units.ETH(offer.price.toString()) * amountToBuy;
    await contract.methods
      .createMarketSale(offer.offerId, amountToBuy)
      .send({ from: account, value: formattedPrice });
    loadOffers();
  }

  async function fetchIPFSDoc(tokenUri) {
    const url = `https://ipfs.io/ipfs/${tokenUri}`;
    const response = await fetch(url);
    return await response.json;
  }

  const handleTransferClick = (nft) => {
    setOffer(nft);
    setVisibility(true);
  };

  const handleTransferClick2 = (nft) => {
    setSelectedOffer(nft);
    setVisibility2(true);
  };

  const handleChange = (e) => {
    setamount(e.target.value);
  };

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>🛒 Mercado de NFTs</h1>
      <div style={styles.NFTs}>
        <Skeleton loading={!loadingState}>
          {offers.map((offer, i) => {
            return (
              <Card
                hoverable
                actions={[
                  <Tooltip title="Ver en Etherscan">
                    <CodeSandboxOutlined
                      onClick={() =>
                        window.open(
                          `${getExplorer(chainId)}address/${
                            offer.item.token_address
                          }`,
                          "_blank",
                        )
                      }
                    />
                  </Tooltip>,
                  <Tooltip title="Ver contenido">
                    <FileSearchOutlined
                      onClick={() => handleTransferClick2(offer)}
                    />
                  </Tooltip>,
                  <Tooltip title="Comprar NFT">
                    <ShoppingCartOutlined
                      onClick={() => handleTransferClick(offer)}
                    />
                  </Tooltip>,
                ]}
                key={i}
              >
                <ImageCard image={offer.image} />
                <CardContent
                  name={offer.name}
                  description={offer.token_address}
                  amount={offer.amount + " / " + offer.totalAmount}
                  sellerAddress={""}
                  price={offer.price}
                />
              </Card>
            );
          })}
        </Skeleton>
      </div>
      <Modal
        title={`Comprar ${nftToBuy?.name || "offer"}`}
        visible={visible}
        cancelText="Cancelar"
        onCancel={() => setVisibility(false)}
        onOk={() => buyNft(nftToBuy, amountToBuy)}
        confirmLoading={isPending}
        okText="Comprar"
      >
        {nftToBuy && (
          <Input placeholder="cantidad" onChange={(e) => handleChange(e)} />
        )}
      </Modal>
      <Modal
        title={`Contenido de ${selectedNFT?.name || "offer"}`}
        visible={visible2}
        onOk={() => setVisibility2(false)}
        onCancel={() => setVisibility2(false)}
        cancelText="Cerrar"
      >
        <VideoContent
          name={selectedNFT?.name}
          video={selectedNFT?.video}
          description={selectedNFT?.description}
          ingredients={selectedNFT?.ingredients}
          categories={selectedNFT?.categories}
          owner={selectedNFT?.owner}
        />
      </Modal>
    </div>
  );
}

export default Marketplace;
