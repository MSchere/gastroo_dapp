import React from "react";
import axios from "axios";
import { getExplorer } from "helpers/networks";
import { Card, Modal, Tooltip, Spin, Input } from "antd";
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
  const [isLoaded, setLoaded] = useState(false);
  const [visible, setVisibility] = useState(false);
  const [visible2, setVisibility2] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [nftToBuy, setOffer] = useState(null);
  const [amountToBuy, setamount] = useState(null);

  const contract = new web3.eth.Contract(
    MarketplaceContract.abi,
    marketplaceAddress.Marketplace,
  );

  useEffect(() => {
    loadOffers(0);
  }, []);

  async function loadOffers(tokenType) {
    try {
      /* create a generic provider and query for unsold market items */
      const data = await contract.methods
        .fetchMarketOffers(tokenType)
        .call({ from: account });

      //Asignacion y formateo de los elementos devueltos
      console.log(data);
      const items = await Promise.all(
        data.map(async (i) => {
          const tokenUri = await contract.methods
            .uri(i.item.tokenId)
            .call({ from: account });
          if (i.offerId != 0) {
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
          }
        }),
      );
      setOffers(items);
      setLoaded(true);
    } catch (error) {
      console.log("Error loading web3js");
      console.log(error);
    }
  }

  async function buyNft(offer, amountToBuy) {
    let fee = await contract.methods.getCreatorFee().call({ from: account });
    const formattedPrice =
      Moralis.Units.ETH(offer.price.toString()) * amountToBuy;
    fee = formattedPrice / fee;
    await contract.methods
      .createMarketSale(offer.offerId, amountToBuy)
      .send({ from: account, value: formattedPrice + fee });
    setVisibility(false);
    loadOffers(0);
  }

  async function fetchIPFSDoc(tokenUri) {
    const url = `https://ipfs.io/ipfs/${tokenUri}`;
    const response = await fetch(url);
    return await response.json;
  }

  const handleTransferClick = (offer) => {
    setOffer(offer);
    setVisibility(true);
  };

  const handleTransferClick2 = (offer) => {
    setSelectedOffer(offer);
    setVisibility2(true);
  };

  const handleChange = (e) => {
    setamount(e.target.value);
  };

  if (isLoaded) {
    return (
      <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
        <h1>🛒 Mercado de NFTs</h1>
        <div style={styles.NFTs}>
          {offers.map((offer, i) => {
            if (offer != null) {
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
            }
          })}
        </div>
        <Modal
          title={`Comprar ${nftToBuy?.name || "offer"}`}
          visible={visible}
          cancelText="Cancelar"
          onCancel={() => setVisibility(false)}
          onOk={() => {
            buyNft(nftToBuy, amountToBuy);
          }}
          okText="Comprar"
        >
          {nftToBuy && (
            <Input placeholder="cantidad" onChange={(e) => handleChange(e)} />
          )}
        </Modal>
        <Modal
          title={`Contenido de ${selectedOffer?.name || "offer"}`}
          visible={visible2}
          onOk={() => setVisibility2(false)}
          onCancel={() => setVisibility2(false)}
          cancelText="Cerrar"
        >
          <VideoContent
            name={selectedOffer?.name}
            video={selectedOffer?.video}
            description={selectedOffer?.description}
            ingredients={selectedOffer?.ingredients}
            categories={selectedOffer?.categories}
            owner={selectedOffer?.owner}
          />
        </Modal>
      </div>
    );
  } else {
    return <Spin size="large" />;
  }
}

export default Marketplace;
