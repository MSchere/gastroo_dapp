import { useEffect, useState } from "react";
import Web3 from "web3";
import { useMoralis } from "react-moralis";
import { Table, Typography, Spin } from "antd";

import Marketplace from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";

const styles = {
  table: {
    margin: "0 auto",
    width: "1000px",
  },
};

function MarketplaceTransactions() {
  const { Moralis, account } = useMoralis();
  const web3 = new Web3(Moralis.provider);
  const [transactions, setTransactions] = useState([]);
  const [isLoaded, setLoaded] = useState(false);
  const contract = new web3.eth.Contract(
    Marketplace.abi,
    marketplaceAddress.Marketplace,
  );

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    /* create a generic provider and query for unsold market items */
    let data = await contract.getPastEvents("TokenMinted", {
      filter: {
        creator: account,
      }, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: "latest",
    });
    //Asignacion y formateo de los elementos devueltos
    console.log(data);
    let key = 0;
    const mintTxs = await Promise.all(
      data.map(async (i) => {
        let date;
        await web3.eth.getBlock(i.blockNumber).then((result) => {
          date = getDate(result.timestamp);
        });
        let tx = {
          key: key,
          blockNumber: i.blockNumber,
          date: date,
          address: i.returnValues.creator,
          tokenId: i.returnValues.tokenId,
          amount: i.returnValues.totalAmount,
          type: "minteo",
          cost: "- " + Moralis.Units.FromWei(i.returnValues.fees),
        };
        key = key + 1;
        return tx;
      }),
    );

    data = await contract.getPastEvents("MarketOfferCreated", {
      filter: {
        seller: account,
      }, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: "latest",
    });
    const offerCreatedTxs = await Promise.all(
      data.map(async (i) => {
        let date;
        await web3.eth.getBlock(i.blockNumber).then((result) => {
          date = getDate(result.timestamp);
        });
        let tx = {
          key: key,
          blockNumber: i.blockNumber,
          date: date,
          address: i.returnValues.seller,
          tokenId: i.returnValues.tokenId,
          amount: i.returnValues.amount,
          type: "oferta creada",
          cost: "",
        };
        key = key + 1;
        return tx;
      }),
    );

    data = await contract.getPastEvents("MarketOfferCancelled", {
      filter: {
        seller: account,
      }, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: "latest",
    });
    const offerCancelledTxs = await Promise.all(
      data.map(async (i) => {
        let date;
        await web3.eth.getBlock(i.blockNumber).then((result) => {
          date = getDate(result.timestamp);
        });
        let tx = {
          key: key,
          blockNumber: i.blockNumber,
          date: date,
          address: i.returnValues.seller,
          tokenId: i.returnValues.tokenId,
          amount: i.returnValues.amount,
          type: "oferta cancelada",
          cost: "",
        };
        key = key + 1;
        return tx;
      }),
    );

    data = await contract.getPastEvents("MarketItemSold", {
      filter: {
        buyer: account,
      }, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: "latest",
    });
    const itemBoughtTxs = await Promise.all(
      data.map(async (i) => {
        let date;
        await web3.eth.getBlock(i.blockNumber).then((result) => {
          date = getDate(result.timestamp);
        });
        let tx = {
          key: key,
          blockNumber: i.blockNumber,
          date: date,
          address: i.returnValues.buyer,
          tokenId: i.returnValues.tokenId,
          amount: i.returnValues.amount,
          type: "tokens comprados",
          cost: "- " + Moralis.Units.FromWei(i.returnValues.price),
        };
        key = key + 1;
        return tx;
      }),
    );

    data = await contract.getPastEvents("MarketItemSold", {
      filter: {
        seller: account,
      }, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: "latest",
    });

    const itemSoldTxs = await Promise.all(
      data.map(async (i) => {
        let date;
        await web3.eth.getBlock(i.blockNumber).then((result) => {
          date = getDate(result.timestamp);
        });
        let tx = {
          key: key,
          blockNumber: i.blockNumber,
          date: date,
          address: i.returnValues.buyer,
          tokenId: i.returnValues.tokenId,
          amount: i.returnValues.amount,
          type: "tokens vendidos",
          cost: "+ " + Moralis.Units.FromWei(i.returnValues.price),
        };
        key = key + 1;
        return tx;
      }),
    );

    //setTransactions(mintTxs);
    let txs = transactions;
    Array.prototype.push.apply(txs, mintTxs);
    Array.prototype.push.apply(txs, offerCreatedTxs);
    Array.prototype.push.apply(txs, offerCancelledTxs);
    Array.prototype.push.apply(txs, itemBoughtTxs);
    Array.prototype.push.apply(txs, itemSoldTxs);

    console.log("TXs:");
    console.log(txs);
    setTransactions(txs);
    setLoaded(true);
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
      dataIndex: "tokenId",
      key: "tokenId",
    },
    {
      title: "Cantidad",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Tipo de Transacción",
      key: "type",
      dataIndex: "type",
    },
    {
      title: "Coste",
      key: "cost",
      dataIndex: "cost",
    },
  ];
  if (isLoaded) {
    return (
      <div style={styles.table}>
        <Table columns={columns} dataSource={transactions} />
      </div>
    );
  } else {
    return <Spin size="large" className="spinner" />;
  }
}

export default MarketplaceTransactions;
