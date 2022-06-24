import React from "react";
import axios from "axios";
import crypto from "crypto";
import { getExplorer } from "helpers/networks";
import { Card, Modal, Tooltip, Menu, Spin, notification } from "antd";
import { CardContent, ImageCard } from "./NFTCard";
import { VideoContent } from "./VideoContent";
import Text from "antd/lib/typography/Text";
import {
  CloseSquareOutlined,
  FileSearchOutlined,
  CodeSandboxOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
import AES_key from "../contracts/aes_key.json";

import MarketplaceContract from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";

function MyOffers() {
  const { Moralis, account, chainId } = useMoralis();
  const web3 = new Web3(Moralis.provider);
  const [offers, setOffers] = useState([]);
  const [isLoaded, setLoaded] = useState(false);
  const [visible, setVisibility] = useState(false);
  const [visible2, setVisibility2] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerToCancel, setOffer] = useState(null);

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
    const data = await contract.methods.fetchMyOffers().call({ from: account });

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
        let item;
        let price = Moralis.Units.FromWei(i.price.toString());
        if (i.item.isPrivate) {
          item = {
            offerId: i.offerId,
            tokenId: i.item.tokenId,
            seller: i.seller,
            owner: i.owner,
            amount: i.amount,
            price,
            totalAmount: i.item.totalAmount,
            isPrivate: i.item.isPrivate,
            image: meta.data.image,
            video: decrypt(meta.data.video),
            name: meta.data.name,
            description: decrypt(meta.data.description),
            ingredients: decrypt(meta.data.ingredients),
            categories: meta.data.categories,
          };
        } else {
          item = {
            offerId: i.offerId,
            tokenId: i.item.tokenId,
            seller: i.seller,
            owner: i.owner,
            amount: i.amount,
            price,
            totalAmount: i.item.totalAmount,
            isPrivate: i.item.isPrivate,
            isFungible: i.item.isFungible,
            image: meta.data.image,
            video: meta.data.video,
            name: meta.data.name,
            description: meta.data.description,
            ingredients: meta.data.ingredients,
            categories: meta.data.categories,
          };
        }
        console.log(item);
        return item;
      }),
    );
    setOffers(items);
    setLoaded(true);
  }

  async function cancelOffer(offer) {
    await contract.methods
      .cancelMarketOffer(offer.offerId)
      .send({ from: account });
    openNotification();
    setVisibility(false);
    loadOffers();
  }

  function decrypt(content) {
    const KEY = AES_key.AES_KEY;
    const IV = AES_key.AES_IV;
    let decipher = crypto.createDecipheriv("aes-256-cbc", KEY, IV);
    let decrypted = decipher.update(content, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  const openNotification = () => {
    notification["success"]({
      placement: "bottomLeft",
      message: "¡Oferta cancelada! 😢",
    });
  };

  const handleTransferClick = (offer) => {
    setOffer(offer);
    setVisibility(true);
  };

  const handleTransferClick2 = (offer) => {
    setSelectedOffer(offer);
    setVisibility2(true);
  };

  if (isLoaded) {
    return (
      <div>
        <Menu className="menu-content" style={{ marginBottom: "15px" }}>
          <Menu.Item>
            <h1>💸 Mis ofertas</h1>
          </Menu.Item>
        </Menu>
        <div className="NFT-wallet">
          {offers.map((offer, i) => {
            return (
              <Card
                className="nft-card"
                hoverable
                bordered={false}
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
                  <Tooltip title="Cancelar oferta">
                    <CloseSquareOutlined
                      onClick={() => handleTransferClick(offer)}
                    />
                  </Tooltip>,
                ]}
                key={i}
              >
                <ImageCard
                  image={offer.image}
                  isPrivate={offer.isPrivate}
                  isFungible={offer.isFungible}
                />{" "}
                <CardContent
                  name={offer.name}
                  description={offer.token_address}
                  amount={offer.amount + " / " + offer.totalAmount}
                  sellerAddress={""}
                  price={offer.price}
                  isOffer={true}
                />
              </Card>
            );
          })}
        </div>
        <Modal
          title={`Borrar oferta de ${offerToCancel?.name || "offer"}`}
          visible={visible}
          cancelText="Mantener oferta"
          onCancel={() => setVisibility(false)}
          onOk={() => cancelOffer(offerToCancel)}
          confirmLoading={isPending}
          okText="Borrar oferta"
        >
          <Text bold>¿Cancelar esta oferta?</Text>
        </Modal>
        <Modal
          title={`Contenido de ${selectedOffer?.name || "offer"}`}
          width={620}
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
            isFungible={selectedOffer?.isFungible}
          />
        </Modal>
      </div>
    );
  } else {
    return (
      <div>
        <Menu className="menu-content" style={{ marginBottom: "15px" }}>
          <Menu.Item>
            <h1>💸 Mis ofertas</h1>
          </Menu.Item>
        </Menu>
        <Spin size="large" className="spinner" />
      </div>
    );
  }
}

export default MyOffers;
