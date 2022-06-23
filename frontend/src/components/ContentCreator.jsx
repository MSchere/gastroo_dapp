import NativeBalance from "./NativeBalance";
import Address from "./Address/Address";
import Blockie from "./Blockie";
import { create as ipfsHttpClient } from "ipfs-http-client";
import React from "react";
import { useState } from "react";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
import { Link } from "react-router-dom";
import { ImFileVideo, ImCoinDollar } from "react-icons/im";
import crypto from "crypto";
import {
  Card,
  Button,
  Input,
  Divider,
  Upload,
  message,
  notification,
  Switch,
  Menu,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import Marketplace from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";

import AES_key from "../contracts/aes_key.json";
const { Dragger } = Upload;
const { TextArea } = Input;
const styles = {
  title: {
    fontSize: "30px",
    fontWeight: "600",
  },
  textWrapper: { maxWidth: "200px", width: "100%", marginBottom: "5px" },
  select: {
    marginTop: "15px",
  },
};

function CreateNFT() {
  const { Moralis } = useMoralis();
  const { account } = useMoralis();
  const web3 = new Web3(Moralis.provider);
  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadState1, setuploadState1] = useState(0);
  const [uploadState2, setuploadState2] = useState(0);
  const [formType, setFormType] = useState(0);

  const [formInput1, updateformInput1] = useState({
    name: "",
    amount: "",
    isPrivate: false,
    description: "",
    ingredients: "",
    categories: "",
  });

  const [formInput2, updateformInput2] = useState({
    name: "",
    amount: "",
    description: "",
    categories: "",
  });

  const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

  const contract = new web3.eth.Contract(
    Marketplace.abi,
    marketplaceAddress.Marketplace,
  );

  async function uploadToIPFS(isFungible) {
    let data;
    if (isFungible) {
      const { name, description, ingredients, categories } = formInput2;
      if (!name || !description || !imageUrl) return;
      //Subimos el json con los metadartos a IPFS
      data = JSON.stringify({
        name: name,
        description: description,
        ingredients: ingredients,
        categories: categories,
        image: imageUrl,
        video: "",
      });
    } else {
      const { name, description, ingredients, categories, isPrivate } =
        formInput1;
      if (!name || !description || !imageUrl || !videoUrl) return;
      //Subimos el json con los metadartos a IPFS
      if (isPrivate) {
        data = JSON.stringify({
          name: name,
          description: encrypt(description),
          ingredients: encrypt(ingredients),
          categories: categories,
          image: imageUrl,
          video: encrypt(videoUrl),
        });
      } else {
        data = JSON.stringify({
          name: name,
          description: description,
          ingredients: ingredients,
          categories: categories,
          image: imageUrl,
          video: videoUrl,
        });
      }
    }
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      //Despues de la subida del Json, se devuelve la URL para utilizarla en la transaccion
      console.log("Metadatos subidos correctamente en");
      console.log(url);
      return url;
    } catch (error) {
      console.log("Upss...Algo ha ido mal subiendo tu archivo: ", error);
    }
  }

  async function airdrop() {
    const fungMintingFee = await contract.methods
      .getFungMintingFee()
      .call({ from: account });
    const mintingFee = await contract.methods
      .getMintingFee()
      .call({ from: account });
    let fee =
      (35 + 25 + 40 + 50 + 35 + 20 + 100 + 50 + 60 + 55) * mintingFee +
      (1000000 + 100000) * fungMintingFee;
    await contract.methods.airdrop().send({ from: account, value: fee });
    openNotification();
  }

  async function createNFT(isFungible) {
    //Creacion de los Tokens
    let amount;
    let isPrivate;
    if (isFungible) {
      amount = formInput2.amount;
      isPrivate = false;
      setuploadState2(0);
    } else {
      amount = formInput1.amount;
      isPrivate = formInput1.isPrivate;
      setuploadState1(0);
    }
    setImageUrl(null);
    const url = await uploadToIPFS(isFungible);

    let fee;
    if (isFungible) {
      console.log("Fungible token minting");
      fee = await contract.methods.getFungMintingFee().call({ from: account });
    } else {
      console.log("Non-fungible token minting");
      fee = await contract.methods.getMintingFee().call({ from: account });
    }
    fee = fee * amount;

    await contract.methods
      .createToken(url, amount, isPrivate, isFungible)
      .send({ from: account, value: fee });
    openNotification();
  }

  function encrypt(content) {
    const KEY = AES_key.AES_KEY;
    const IV = AES_key.AES_IV;
    const cipher = crypto.createCipheriv("aes-256-cbc", KEY, IV);
    console.log("cypher created");
    let encrypted = cipher.update(content, "utf8", "base64");
    encrypted += cipher.final("base64");
    cipher.end();
    return encrypted;
  }

  async function onChangeDragger1(e) {
    let { status } = e.file;
    //Comprobamos que el archivo introducido es del formato correcto(mp4).
    var allowedExtensions;
    var n = 0;
    try {
      if (uploadState1 == 0) {
        allowedExtensions = /(.jpg|.jpeg|.png|.gif)$/i;
      } else if (uploadState1 == 1) {
        allowedExtensions = /(.mp4)$/i;
        n = n + 1;
      } else {
        message.error(`No se pueden subir más archivos`);
        throw "maximo de archivos alcanzado";
      }
      if (!allowedExtensions.exec(e.fileList[n].name)) {
        message.error(`${e.file.name} formato de archivo incorrecto`);
        throw "error en el formato del archivo";
      }
      //subimos el video a IPFS
      const myfile = e.fileList[n].originFileObj;

      /*El método add devuelve un resultado de tipo AddResult, que 
   contiene las siguientes propiedades cid, mode, mtime, path y size */
      if (status != "error") {
        const added = await client.add(myfile, {
          progress: (prog) => console.log(`received: ${prog}`),
        });
        /*Usaremos path para mostrar el archivo subido a IPFS en nuestra aplicacion*/
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        if (uploadState1 == 0) {
          setImageUrl(url);
          setuploadState1(1);
        } else if (uploadState1 == 1) {
          setVideoUrl(url);
          setuploadState1(2);
        }
        console.log("STATE: " + uploadState1);
        status = "done";
      }
    } catch (error) {
      status = "error";
    }
    if (status !== "uploading") {
      console.log(e.file, e.fileList);
    }
    if (status === "done") {
      message.success(`${e.file.name} archivo cargado correctamente`);
    } else if (status === "error") {
      //message.error(`${e.file.name} error cargando el archivo`);
    }
  }

  async function onChangeDragger2(e) {
    let { status } = e.file;
    //Comprobamos que el archivo introducido es del formato correcto(mp4).
    var allowedExtensions;
    var n = 0;
    try {
      if (uploadState2 == 0) {
        allowedExtensions = /(.jpg|.jpeg|.png|.gif)$/i;
      } else {
        message.error(`No se pueden subir más archivos`);
        throw "maximo de archivos alcanzado";
      }
      if (!allowedExtensions.exec(e.fileList[n].name)) {
        message.error(`${e.file.name} formato de archivo incorrecto`);
        throw "error en el formato del archivo";
      }
      //subimos el video a IPFS
      const myfile = e.fileList[n].originFileObj;

      /*El método add devuelve un resultado de tipo AddResult, que 
   contiene las siguientes propiedades cid, mode, mtime, path y size */
      if (status != "error") {
        const added = await client.add(myfile, {
          progress: (prog) => console.log(`received: ${prog}`),
        });
        /*Usaremos path para mostrar el archivo subido a IPFS en nuestra aplicacion*/
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        if (uploadState2 == 0) {
          setImageUrl(url);
          setuploadState2(1);
        }
        console.log("STATE: " + uploadState2);
        status = "done";
      }
    } catch (error) {
      status = "error";
    }
    if (status !== "uploading") {
      console.log(e.file, e.fileList);
    }
    if (status === "done") {
      message.success(`${e.file.name} archivo cargado correctamente`);
    } else if (status === "error") {
      //message.error(`${e.file.name} error cargando el archivo`);
    }
  }

  const openNotification = () => {
    notification["success"]({
      placement: "bottomLeft",
      message: "¡Tokens creados! 😎",
      description: "¡Disfrútalos!",
    });
  };
  if (formType == 0) {
    return (
      <div>
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={["GastroVideos"]}
          className="menu-content"
          style={{ marginBottom: "30px" }}
        >
          <Menu.Item key="GastroVideos">
            <ImFileVideo />
            <Link onClick={() => setFormType(0)}> GastroVideos</Link>
          </Menu.Item>
          <Menu.Item key="GastroTokens">
            <ImCoinDollar />
            <Link onClick={() => setFormType(1)}> GastroTokens</Link>
          </Menu.Item>
          <Menu.Item key="Airdrop">
            <Button
              type="primary"
              size="small"
              disabled={false}
              onClick={() => airdrop()}
            >
              Recibir airdrop
            </Button>
          </Menu.Item>
        </Menu>
        <Card
          className="creator-card"
          title={
            <div className="address-header">
              <Blockie scale={5} avatar currentWallet style />
              <Address size="6" copyable />
              <NativeBalance />
            </div>
          }
        >
          <div className="address-header">
            <h3>Creador de GastroVideos</h3>
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Nombre del plato</Text>
            </div>
            <Input
              placeholder="El nombre de tu plato"
              maxLength={25}
              onChange={(e) => {
                updateformInput1({ ...formInput1, name: e.target.value });
              }}
            />
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Descripción</Text>
            </div>
            <TextArea
              placeholder="Describe como preparar tu plato..."
              showCount
              maxLength={500}
              style={{
                height: 120,
                width: "100%",
                marginBottom: 10,
              }}
              onChange={(e) => {
                updateformInput1({
                  ...formInput1,
                  description: e.target.value,
                });
              }}
            />
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Ingredientes</Text>
            </div>
            <TextArea
              placeholder="Harina, huevo, azucar, leche, pepitas de chocolate..."
              showCount
              maxLength={100}
              style={{
                height: 60,
                width: "100%",
                marginBottom: 10,
              }}
              onChange={(e) => {
                updateformInput1({
                  ...formInput1,
                  ingredients: e.target.value,
                });
              }}
            />
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Categorías</Text>
            </div>
            <TextArea
              placeholder="Dulce, sin gluten, vegano, postre..."
              showCount
              maxLength={100}
              style={{
                height: 30,
                width: "100%",
                marginBottom: 10,
              }}
              onChange={(e) => {
                updateformInput1({ ...formInput1, categories: e.target.value });
              }}
            />
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Cantidad</Text>
            </div>
            <Input
              style={{
                width: "20%",
              }}
              placeholder="Unidades"
              onChange={(e) => {
                updateformInput1({ ...formInput1, amount: e.target.value });
              }}
            />
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>¿Contenido privado?</Text>
            </div>
            <Switch
              style={{ marginLeft: 3 }}
              checked={formInput1.isPrivate}
              checkedChildren="Privado"
              unCheckedChildren="Público"
              onChange={(e) => {
                updateformInput1({
                  ...formInput1,
                  isPrivate: !formInput1.isPrivate,
                });
              }}
            />
          </div>

          <Divider></Divider>
          <Dragger beforeUpload={true} onChange={onChangeDragger1}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Arrastra un archivo...</p>
            <p className="ant-upload-hint">O haz click aquí</p>
          </Dragger>
          <Button
            type="primary"
            size="large"
            style={{ width: "100%", marginTop: "25px" }}
            disabled={false}
            onClick={() => createNFT(false)}
          >
            ¡Crear!
          </Button>
        </Card>
      </div>
    );
  } else {
    return (
      <div>
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={["GastroTokens"]}
          className="menu-content"
          style={{ marginBottom: "30px" }}
        >
          <Menu.Item key="GastroVideos">
            <ImFileVideo />
            <Link onClick={() => setFormType(0)}> GastroVideos</Link>
          </Menu.Item>
          <Menu.Item key="GastroTokens">
            <ImCoinDollar />
            <Link onClick={() => setFormType(1)}> GastroTokens</Link>
          </Menu.Item>
          <Menu.Item key="Airdrop">
            <Button
              type="primary"
              size="small"
              disabled={false}
              onClick={() => airdrop()}
            >
              Recibir airdrop
            </Button>
          </Menu.Item>
        </Menu>
        <Card
          className="creator-card"
          title={
            <div className="address-header">
              <Blockie scale={5} avatar currentWallet style />
              <Address size="6" copyable />
              <NativeBalance />
            </div>
          }
        >
          <div className="address-header">
            <h3>Creador de GastroTokens</h3>
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Nombre del GastroToken</Text>
            </div>
            <Input
              placeholder="El nombre de tu token"
              maxLength={25}
              onChange={(e) => {
                updateformInput2({ ...formInput2, name: e.target.value });
              }}
            />
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Descripción</Text>
            </div>
            <TextArea
              placeholder="Describe las utilidades o características de tu token"
              showCount
              maxLength={500}
              style={{
                height: 120,
                width: "100%",
                marginBottom: 10,
              }}
              onChange={(e) => {
                updateformInput2({
                  ...formInput2,
                  description: e.target.value,
                });
              }}
            />
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Categorías</Text>
            </div>
            <TextArea
              placeholder="Restaurante, supermercado, utilidades..."
              showCount
              maxLength={100}
              style={{
                height: 30,
                width: "100%",
                marginBottom: 10,
              }}
              onChange={(e) => {
                updateformInput2({ ...formInput2, categories: e.target.value });
              }}
            />
          </div>
          <div style={styles.select}>
            <div style={styles.textWrapper}>
              <Text strong>Cantidad</Text>
            </div>
            <Input
              style={{
                width: "20%",
              }}
              placeholder="Unidades"
              onChange={(e) => {
                updateformInput2({ ...formInput2, amount: e.target.value });
              }}
            />
          </div>

          <Divider></Divider>
          <Dragger beforeUpload={true} onChange={onChangeDragger2}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Arrastra un archivo...</p>
            <p className="ant-upload-hint">O haz click aquí</p>
          </Dragger>
          <Button
            type="primary"
            size="large"
            style={{ width: "100%", marginTop: "25px" }}
            disabled={false}
            onClick={() => createNFT(true)}
          >
            ¡Crear!
          </Button>
        </Card>
      </div>
    );
  }
}

export default CreateNFT;
