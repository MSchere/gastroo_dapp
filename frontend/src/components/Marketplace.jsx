import React, { useCallback } from "react";
import axios from "axios";
import { getExplorer } from "helpers/networks";
import {
  Card,
  Modal,
  Tooltip,
  Spin,
  notification,
  Input,
  Row,
  Menu,
} from "antd";
import { CardContent, ImageCard } from "./NFTCard";
import { VideoContent } from "./VideoContent";
import {
  FileSearchOutlined,
  ShoppingCartOutlined,
  CodeSandboxOutlined,
} from "@ant-design/icons";
import { ImFileVideo, ImEyeBlocked, ImCoinDollar } from "react-icons/im";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
import MarketplaceContract from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";
import { Link } from "react-router-dom";

function Marketplace() {
  const { Moralis, account, chainId } = useMoralis();
  const web3 = new Web3(Moralis.provider);

  const [offers, setOffers] = useState([]);
  const [tokenType, setTokenType] = useState(0);
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

  const loadOffers = useCallback(async (tokenType) => {
    if (!isLoaded) {
      try {
        /* create a generic provider and query for unsold market items */
        const data = await contract.methods
          .fetchMarketOffers(tokenType)
          .call({ from: account });

        //Asignacion y formateo de los elementos devueltos
        console.log(data);
        const items = await Promise.all(
          data.map(async (i) => {
            const tokenUri = await contract.methods.uri(i.item.tokenId).call();
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
                isFungible: i.item.isFungible,
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
  });

  useEffect(() => {
    loadOffers(tokenType);
  }, [loadOffers]);

  async function reloadOffers(type) {
    setLoaded(false);
    setTokenType(type);
    loadOffers(tokenType);
  }

  async function buyNft(offer, amountToBuy) {
    let fee = await contract.methods.getCreatorFee().call({ from: account });
    const formattedPrice =
      Moralis.Units.ETH(offer.price.toString()) * amountToBuy;
    fee = formattedPrice / fee;
    await contract.methods
      .createMarketSale(offer.offerId, amountToBuy)
      .send({ from: account, value: formattedPrice + fee });
    openNotification();
    setVisibility(false);
    reloadOffers(tokenType);
  }

  const openNotification = () => {
    notification["success"]({
      placement: "bottomLeft",
      message: "¡Compra completada! 🥳",
      description: "¡Disfrútala!",
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

  const handleChange = (e) => {
    setamount(e.target.value);
  };

  if (isLoaded) {
    return (
      <div>
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={["GastroVideos"]}
          className="menu-content"
          style={{ marginBottom: "15px" }}
        >
          <Menu.Item key="GastroVideos">
            <ImFileVideo />
            <Link onClick={() => reloadOffers(0)}> GastroVideos</Link>
          </Menu.Item>
          <Menu.Item key="GastroVideos Privados">
            <ImEyeBlocked />
            <Link onClick={() => reloadOffers(1)}> GastroVideos Privados</Link>
          </Menu.Item>
          <Menu.Item key="GastroTokens">
            <ImCoinDollar />
            <Link onClick={() => reloadOffers(2)}> GastroTokens</Link>
          </Menu.Item>
        </Menu>
        <div className="NFT-marketplace">
          {offers.map((offer, i) => {
            if (offer != null) {
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
                    <Tooltip title="Comprar NFT">
                      <ShoppingCartOutlined
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
                  />
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
          width={620}
          onOk={() => setVisibility2(false)}
          onCancel={() => setVisibility2(false)}
          cancelText="Cerrar"
        >
          <VideoContent
            name={selectedOffer?.name}
            video={selectedOffer?.video}
            image={selectedOffer?.image}
            description={selectedOffer?.description}
            ingredients={selectedOffer?.ingredients}
            categories={selectedOffer?.categories}
            owner={selectedOffer?.owner}
            isPrivate={selectedOffer?.isPrivate}
            isFungible={selectedOffer?.isFungible}
          />
        </Modal>
      </div>
    );
  } else {
    return (
      <div>
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={["GastroVideos"]}
          disabledOverflow={true}
          className="menu-content"
          style={{ marginBottom: "15px" }}
        >
          <Menu.Item key="GastroVideos">
            <ImFileVideo />
            <Link> GastroVideos</Link>
          </Menu.Item>
          <Menu.Item key="GastroVideos Privados">
            <ImEyeBlocked />
            <Link> GastroVideos Privados</Link>
          </Menu.Item>
          <Menu.Item key="GastroTokens">
            <ImCoinDollar />
            <Link> GastroTokens</Link>
          </Menu.Item>
        </Menu>
        <Spin size="large" className="spinner" />
      </div>
    );
  }
}

export default Marketplace;
