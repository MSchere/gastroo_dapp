import NativeBalance from "./NativeBalance";
import Address from "./Address/Address";
import Blockie from "./Blockie";
import { Card } from "antd";
import React from "react";

import { Button, Input, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Web3 from "web3";

import OrderTrackerArtifact from "../contracts/OrderTracker.json";
import orderTrackerAddress from "../contracts/orderTracker-address.json";

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

function OrderCreator() {
  const { Moralis } = useMoralis();
  const { account } = useMoralis();
  const web3 = new Web3(Moralis.provider);
  const [tx, setTx] = useState();

  const [restaurant, setRestaurantAddress] = useState();
  const [homeAddress, setHomeAddress] = useState();
  const [items, setItems] = useState();
  const [price, setPrice] = useState();
  const [deliveryTime, setDeliveryTime] = useState();
  const [temp, setTemp] = useState();

  const contract = new web3.eth.Contract(
    OrderTrackerArtifact.abi,
    orderTrackerAddress.OrderTracker,
  );

  contract.events
    .CreateOrder()
    .on("data", (event) => {
      console.log("Caught event!");
      console.log(event);
      openNotification({
        message: event.returnValues[0] + "😊",
        description: "Your oder id: " + event.returnValues[2],
      });
    })
    .on("error", (error) => console.log(error));

  web3.eth
    .subscribe(
      "logs",
      {
        reconnect: {
          auto: true,
          delay: 5000, // ms
          maxAttempts: 5,
          onTimeout: false,
        },
        address: orderTrackerAddress.OrderTracker,
        topics: [
          web3.utils.sha3("CreateOrder(string,address,uint,string,uint256)"),
        ],
      },
      function (error, result) {
        if (!error) console.log(result);
      },
    )
    .on("data", (event) => {
      console.log(event);
      openNotification({
        message: event.returnValues[0] + "😊",
        description: "Your oder id: " + event.returnValues[2],
      });
    })
    .on("changed", (event) => {
      console.log("changed");
    });

  const openNotification = ({ message, description }) => {
    notification.open({
      placement: "bottomRight",
      message,
      description,
    });
  };

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    restaurant && homeAddress && items && price && deliveryTime && temp
      ? setTx({
          restaurant,
          homeAddress,
          items,
          price,
          deliveryTime,
          temp,
        })
      : setTx();
  }, [restaurant, homeAddress, items, price, deliveryTime, temp]);

  async function createOrder() {
    const itemArr = items.split(",");

    console.log(restaurant, homeAddress, itemArr, price, deliveryTime, temp);

    await contract.methods
      .createOrder(restaurant, homeAddress, itemArr, price, deliveryTime, temp)
      .send({ from: account });
    openNotification({
      message: "Order created! 😊",
      description: "Enjoy!",
    });
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
        <h3>Create New Order</h3>
      </div>
      <div style={styles.select}>
        <div style={styles.textWrapper}>
          <Text strong>Restaurant address:</Text>
        </div>
        <Input
          size="large"
          onChange={(e) => {
            setRestaurantAddress(`${e.target.value}`);
          }}
        />
      </div>
      <div style={styles.select}>
        <div style={styles.textWrapper}>
          <Text strong>Home address:</Text>
        </div>
        <Input
          size="large"
          onChange={(e) => {
            setHomeAddress(`${e.target.value}`);
          }}
        />
      </div>
      <div style={styles.select}>
        <div style={styles.textWrapper}>
          <Text strong>Food items: </Text>
        </div>
        <Input
          size="large"
          onChange={(e) => {
            setItems(`${e.target.value}`);
          }}
        />
      </div>
      <div style={styles.select}>
        <div style={styles.textWrapper}>
          <Text strong>Price: </Text>
        </div>
        <Input
          size="large"
          onChange={(e) => {
            setPrice(`${e.target.value}`);
          }}
        />
      </div>
      <div style={styles.select}>
        <div style={styles.textWrapper}>
          <Text strong>Delivery time:</Text>
        </div>
        <Input
          size="large"
          onChange={(e) => {
            setDeliveryTime(`${e.target.value}`);
          }}
        />
      </div>
      <div style={styles.select}>
        <div style={styles.textWrapper}>
          <Text strong>Food temperature:</Text>
        </div>
        <Input
          size="large"
          onChange={(e) => {
            setTemp(`${e.target.value}`);
          }}
        />
      </div>
      <Button
        type="primary"
        size="large"
        loading={isPending}
        style={{ width: "100%", marginTop: "25px" }}
        disabled={false}
        onClick={() => createOrder()}
      >
        Order! 🍔
      </Button>
    </Card>
  );
}

export default OrderCreator;
