import { useEffect, useState } from "react";
import Web3 from "web3";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { Table, Typography, Space } from "antd";
import { ETHLogo, PolygonLogo } from "./Chains/Logos";
import moment from "moment";

import Marketplace from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";

const styles = {
  table: {
    margin: "0 auto",
    width: "1000px",
  },
};

function MarketplaceTransactions() {
  const { Moralis, account, chainId } = useMoralis();
  const queryItemImages = useMoralisQuery("ItemImages");
  const web3 = new Web3(Moralis.provider);
  const [transactions, setTransactions] = useState([]);
  const contract = new web3.eth.Contract(
    Marketplace.abi,
    marketplaceAddress.Marketplace,
  );

  useEffect(() => {
    //loadTransactions();
  }, []);

  async function loadTransactions() {
    /* create a generic provider and query for unsold market items */
    const data = await contract.getPastEvents("TokenMinted", {
      filter: {
        creator: account,
      }, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: "latest",
    });
    //Asignacion y formateo de los elementos devueltos
    console.log(data);
    const transactions = await Promise.all(
      data.map(async (i) => {
        let date;
        await web3.eth.getBlock(i.blockNumber).then((result) => {
          date = getDate(result.timestamp);
        });
        let tx = {
          blockNumber: i.blockNumber,
          date: date,
          address: i.returnValues.creator,
          tokenId: i.returnValues.tokenId,
          type: "minteo",
          price: "",
        };
        console.log(tx);
        return tx;
      }),
    );
    setTransactions(transactions);
  }

  function getDate(timestamp) {
    let date_ob = new Date(timestamp * 1000);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let hour = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    let formattedTime =
      year +
      "-" +
      month +
      "-" +
      date +
      " " +
      hour +
      ":" +
      minutes +
      ":" +
      seconds;
    return formattedTime;
  }

  const columns = [
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Token ID",
      key: "tokenId",
      render: (text) => (
        <Space size="middle">
          <span>#{text}</span>
        </Space>
      ),
    },
    {
      title: "Address",
      key: "address",
      render: (text) => (
        <Space size="middle">
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Tipo de Transacción",
      key: "tags",
      dataIndex: "tags",
      render: (text) => (
        <Space size="middle">
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Precio",
      key: "price",
      dataIndex: "price",
      render: (e) => (
        <Space size="middle">
          <ETHLogo />
          <span>{e}</span>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div>
        <div style={styles.table}>
          <Table columns={columns} dataSource={transactions} />
        </div>
      </div>
    </>
  );
}

export default MarketplaceTransactions;
const columns = [
  {
    title: "Fecha",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Token ID",
    key: "tokenId",
  },
  {
    title: "Address",
    key: "address",
  },
  {
    title: "Tipo de Transacción",
    key: "tags",
    dataIndex: "tags",
  },
  {
    title: "Precio",
    key: "price",
    dataIndex: "price",
  },
];
