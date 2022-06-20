import NativeBalance from "./NativeBalance";
import Address from "./Address/Address";
import Blockie from "./Blockie";
import { create as ipfsHttpClient } from "ipfs-http-client";
import React from "react";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
import {
  Card,
  Button,
  Input,
  Divider,
  Upload,
  message,
  notification,
  Switch,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import Marketplace from "../contracts/Marketplace.json";
import marketplaceAddress from "../contracts/marketplace-address.json";
const { Dragger } = Upload;
const { TextArea } = Input;

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
  textArea: {
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

function CreateNFT() {
  const { Moralis } = useMoralis();
  const { account } = useMoralis();
  const web3 = new Web3(Moralis.provider);
  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploadState, setUploadState] = useState(0);
  const [formInput, updateFormInput] = useState({
    name: "",
    amount: "",
    isPrivate: false,
    isFungible: false,
    description: "",
    ingredients: "",
    categories: "",
  });

  const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

  const contract = new web3.eth.Contract(
    Marketplace.abi,
    marketplaceAddress.Marketplace,
  );

  async function uploadToIPFS() {
    const { name, description, ingredients, categories } = formInput;
    console.log(imageUrl);
    console.log(videoUrl);

    if (!name || !description || !imageUrl || !videoUrl) return;
    //Subimos el json con los metadartos a IPFS
    const data = JSON.stringify({
      name,
      description,
      ingredients,
      categories,
      image: imageUrl,
      video: videoUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      //Despues de la subida del Json, se devuelve la URL para utilizarla en la transaccion
      console.log("Metadatos subidos correctamente");
      return url;
    } catch (error) {
      console.log("Upss...Algo ha ido mal subiendo tu archivo: ", error);
    }
  }

  async function createNFT() {
    const url = await uploadToIPFS();

    //Creacion del NFT
    const amount = formInput.amount;
    const isPrivate = formInput.isPrivate;
    const isFungible = formInput.isFungible;
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
    openNotification({
      message: "¡NFTs creados! 😊",
      description: "¡Disfrútalos!",
    });
  }

  async function onChange(e) {
    let { status } = "loading";
    //Comprobamos que el archivo introducido es del formato correcto(mp4).
    var allowedExtensions;
    var n = 0;
    if (uploadState == 0) {
      allowedExtensions = /(.jpg|.jpeg|.png|.gif)$/i;
    } else if (uploadState == 1) {
      allowedExtensions = /(.mp4)$/i;
      n = n + 1;
    } else {
      message.error(`No se pueden subir más archivos`);
      status = "error";
    }
    if (!allowedExtensions.exec(e.fileList[n].name)) {
      message.error(`${e.file.name} formato de archivo incorrecto`);
      status = "error";
    }
    //subimos el video a IPFS
    const myfile = e.fileList[n].originFileObj;
    try {
      /*El método add devuelve un resultado de tipo AddResult, que 
   contiene las siguientes propiedades cid, mode, mtime, path y size */
      if (status != "error") {
        const added = await client.add(myfile, {
          progress: (prog) => console.log(`received: ${prog}`),
        });
        /*Usaremos path para mostrar el archivo subido a IPFS en nuestra aplicacion*/
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        if (uploadState == 0) {
          setImageUrl(url);
          setUploadState(1);
        } else if (uploadState == 1) {
          setVideoUrl(url);
          setUploadState(2);
        }
        console.log("STATE: " + uploadState);
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

  const openNotification = ({ message, description }) => {
    notification.open({
      placement: "bottomLeft",
      message,
      description,
    });
  };

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
        <h3>🖼️ Creador de NFTs</h3>
      </div>
      <div style={styles.select}>
        <div style={styles.textWrapper}>
          <Text strong>Nombre del NFT</Text>
        </div>
        <Input
          placeholder="El nombre de tu plato"
          maxLength={25}
          onChange={(e) => {
            updateFormInput({ ...formInput, name: e.target.value });
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
            updateFormInput({ ...formInput, description: e.target.value });
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
            updateFormInput({ ...formInput, ingredients: e.target.value });
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
            updateFormInput({ ...formInput, categories: e.target.value });
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
            updateFormInput({ ...formInput, amount: e.target.value });
          }}
        />
      </div>
      <div style={styles.select}>
        <div style={styles.textWrapper}>
          <Text strong>¿Contenido privado?</Text>
        </div>
        <Switch
          style={{ marginLeft: 3 }}
          checked={formInput.isPrivate}
          checkedChildren="Privado"
          unCheckedChildren="Público"
          onChange={(e) => {
            updateFormInput({ ...formInput, isPrivate: !formInput.isPrivate });
          }}
        />
      </div>

      <Divider></Divider>
      <Dragger beforeUpload={true} onChange={onChange}>
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
        onClick={() => createNFT()}
      >
        ¡Crear!
      </Button>
    </Card>
  );
}

export default CreateNFT;
