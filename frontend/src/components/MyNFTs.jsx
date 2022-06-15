import { Card, Divider, Input, Image, Modal, Tooltip, Skeleton } from "antd";
import Text from "antd/lib/typography/Text";
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
  const [loadingState, setLoadingState] = useState("not-loaded");
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
        let item = {
          tokenId: i.tokenId,
          owner: account,
          isPrivate: i.isPrivate,
          ownedAmount: ownedAmount,
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

  async function listNFT(nft, price, amount) {
    if (!price) return;
    const priceFormatted = Moralis.Units.ETH(price);
    let fee = await contract.methods.getFee().call({ from: account });
    fee = Moralis.Units.ETH((price * amount) / fee);
    const tokenId = nft.tokenId;
    const transaction = await contract.methods
      .createMarketOffer(tokenId, amount, priceFormatted)
      .send({ from: account, value: fee });
    loadNFTs();
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
                  <Tooltip title="Ver en el Etherscan">
                    <CodeSandboxOutlined
                      onClick={() =>
                        window.open(
                          `${getExplorer(chainId)}address/${nft.token_address}`,
                          "_blank",
                        )
                      }
                    />
                  </Tooltip>,
                  <Tooltip title="Ver contenido">
                    <FileSearchOutlined
                      onClick={() => handleTransferClick2(nft)}
                    />
                  </Tooltip>,
                  <Tooltip title="Poner NFT en venta">
                    <DollarOutlined onClick={() => handleTransferClick(nft)} />
                  </Tooltip>,
                ]}
                key={i}
              >
                <ImageCard image={nft.image} />
                <CardContent
                  name={nft.name}
                  description={nft.token_address}
                  sellerAddress={nft.seller}
                  amount={"x" + nft.ownedAmount}
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
        onOk={() => listNFT(nftToSell, formInput.price, formInput.amount)}
        confirmLoading={isPending}
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
        title={`Contenido de ${selectedNFT?.name || "NFT"}`}
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

export default MyNFTs;
