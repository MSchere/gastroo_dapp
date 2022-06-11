import NativeBalance from "./NativeBalance";
import Address from "./Address/Address";
import Blockie from "./Blockie";
import { Card } from "antd";
import React from "react";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
import axios from "axios";
import Marketplace from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";

const styles = {
  title: {
    fontSize: "30px",
    fontWeight: "600",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
    textAlign: "center",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "1rem",
    width: "650px",
    fontSize: "16px",
    fontWeight: "500",
    alignItems: "center",
  },
  input: {
    width: "100%",
    outline: "none",
    fontSize: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textverflow: "ellipsis",
    appearance: "textfield",
    color: "#041836",
    fontWeight: "700",
    border: "none",
    backgroundColor: "transparent",
  },
  select: {
    width: "500px",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
  },
  textWrapper: { maxWidth: "150px", width: "100%" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexDirection: "row",
  },
};

function CreatorDashboard() {
  const { Moralis } = useMoralis();
  const { account } = useMoralis();
  const web3 = new Web3(Moralis.provider);
  const [nfts, setNfts] = useState([]);

  const [loadingState, setLoadingState] = useState("not-loaded");
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
        const tokenUri = await contract.methods
          .tokenURI(i.tokenId)
          .call({ from: account });
        const meta = await axios.get(tokenUri);
        let price = Moralis.Units.FromWei(i.price.toString());
        let item = {
          price,
          tokenId: i.tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
        };
        return item;
      }),
    );

    setNfts(items);
    setLoadingState("loaded");
  }
  return (
    <Card
      style={styles.card}
      title={
        <div style={styles.header}>
          <Blockie scale={5} avatar currentWallet style />
          <Address size="6" copyable />
          <NativeBalance />
        </div>
      }
    >
      <div style={styles.header}>
        <h3>Elementos publicados: </h3>
      </div>
      {nfts.map((nft, i) => (
        <div key={i} className="border shadow rounded-xl overflow-hidden">
          <video src={nft.image} controls />

          <div className="p-4 bg-black">
            <p className="text-2xl font-bold text-white">
              Precio: {nft.price} ETH
            </p>
          </div>
        </div>
      ))}
    </Card>
  );
}

export default CreatorDashboard;
