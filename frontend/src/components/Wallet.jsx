import { Card, notification, Input, Menu, Modal, Button, Spin } from "antd";
import { ImageCard, CardContent } from "./NFTCard";
import { VideoContent } from "./VideoContent";
import {
  FileSearchOutlined,
  CodeSandboxOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import React from "react";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
import axios from "axios";
import crypto from "crypto";
import Marketplace from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";
import AES_key from "../contracts/aes_key.json";

function MyNFTs() {
  const { Moralis, chainId, account } = useMoralis();
  const web3 = new Web3(Moralis.provider);
  const [nfts, setNfts] = useState([]);
  const [visible, setVisibility] = useState(false);
  const [nftToSell, setNftToSell] = useState(null);
  const [isLoaded, setLoaded] = useState(false);
  const [visible2, setVisibility2] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    amount: "",
  });
  useEffect(() => {
    loadNFTs();
  }, []);

  const contract = new web3.eth.Contract(
    Marketplace.abi,
    marketplaceAddress.Marketplace,
  );
  async function loadNFTs() {
    const data = await contract.methods
      .fetchOwnedItems()
      .call({ from: account });

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await contract.methods
          .uri(i.tokenId)
          .call({ from: account });
        const ownedAmount = await contract.methods
          .balanceOf(account, i.tokenId)
          .call({ from: account });
        const meta = await axios.get(tokenURI);
        let item;
        if (i.isPrivate) {
          item = {
            tokenId: i.tokenId,
            owner: account,
            creator: i.creator,
            isPrivate: i.isPrivate,
            ownedAmount: ownedAmount,
            image: meta.data.image,
            video: decrypt(meta.data.video),
            name: meta.data.name,
            description: decrypt(meta.data.description),
            ingredients: decrypt(meta.data.ingredients),
            categories: meta.data.categories,
          };
        } else {
          item = {
            tokenId: i.tokenId,
            owner: account,
            creator: i.creator,
            isPrivate: i.isPrivate,
            isFungible: i.isFungible,
            ownedAmount: ownedAmount,
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
    setNfts(items);
    setLoaded(true);
  }

  function decrypt(content) {
    const KEY = AES_key.AES_KEY;
    const IV = AES_key.AES_IV;
    let decipher = crypto.createDecipheriv("aes-256-cbc", KEY, IV);
    let decrypted = decipher.update(content, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  const handleTransferClick = (nft) => {
    setNftToSell(nft);
    setVisibility(true);
  };

  const handleTransferClick2 = (nft) => {
    setSelectedNFT(nft);
    setVisibility2(true);
  };

  async function listNFT(nft, price, amount) {
    if (!price) return;
    const priceFormatted = Moralis.Units.ETH(price);
    const tokenId = nft.tokenId;
    const transaction = await contract.methods
      .createMarketOffer(tokenId, amount, priceFormatted)
      .send({ from: account });
    openNotification();
    setVisibility(false);
    loadNFTs();
  }

  const openNotification = () => {
    notification["success"]({
      placement: "bottomLeft",
      message: "¡Oferta creada! 🤑",
      description: "¡Y ahora ten paciencia!",
    });
  };

  if (isLoaded) {
    return (
      <div>
        <Menu className="menu-content" style={{ marginBottom: "15px" }}>
          <Menu.Item>
            <h1>👛 Mi cartera</h1>
          </Menu.Item>
        </Menu>
        <div className="NFTs">
          {nfts.map((nft, i) => {
            return (
              <Card className="nft-card" hoverable bordered={false} key={i}>
                <div onClick={() => handleTransferClick2(nft)}>
                  <ImageCard
                    image={nft.image}
                    isPrivate={nft.isPrivate}
                    isFungible={nft.isFungible}
                  />
                </div>
                <CardContent
                  name={nft.name}
                  description={nft.token_address}
                  sellerAddress={nft.seller}
                  amount={nft.ownedAmount}
                  price={""}
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={() => handleTransferClick(nft)}
                  icon={<DollarOutlined />}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                  }}
                >
                  Poner en venta
                </Button>
              </Card>
            );
          })}
        </div>
        <Modal
          title={`Poner en venta ${nftToSell?.name || "Token"}`}
          visible={visible}
          cancelText="Cancelar"
          onCancel={() => setVisibility(false)}
          onOk={() => listNFT(nftToSell, formInput.price, formInput.amount)}
          okText="Listar"
        >
          {nftToSell && (
            <>
              <Input
                style={{
                  width: "20%",
                }}
                placeholder="cantidad"
                onChange={(e) => {
                  updateFormInput({ ...formInput, amount: e.target.value });
                }}
              />
              <Input
                style={{
                  width: "20%",
                }}
                placeholder="precio"
                onChange={(e) => {
                  updateFormInput({ ...formInput, price: e.target.value });
                }}
              />
            </>
          )}
        </Modal>
        <Modal
          title={`Contenido de ${selectedNFT?.name || "Token"}`}
          width={620}
          visible={visible2}
          onOk={() => setVisibility2(false)}
          onCancel={() => setVisibility2(false)}
          cancelText="Cerrar"
        >
          <VideoContent
            name={selectedNFT?.name}
            video={selectedNFT?.video}
            image={selectedNFT?.image}
            description={selectedNFT?.description}
            ingredients={selectedNFT?.ingredients}
            categories={selectedNFT?.categories}
            owner={selectedNFT?.owner}
            creator={selectedNFT?.creator}
            isFungible={selectedNFT?.isFungible}
          />
        </Modal>
      </div>
    );
  } else {
    return (
      <div>
        <Menu className="menu-content" style={{ marginBottom: "15px" }}>
          <Menu.Item>
            <h1>🧑‍🍳 Mis contenidos</h1>
          </Menu.Item>
        </Menu>
        <Spin size="large" className="spinner" />
      </div>
    );
  }
}

export default MyNFTs;
