import React, { useState } from "react";
import { Avatar, Col, Divider, Image, Row, Space, Typography } from "antd";
import { MdRemoveRedEye } from "react-icons/md";
import { FaEthereum } from "react-icons/fa";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
export const ImageCard = ({ image, isPrivate, isFungible }) => {
  const [visible, setVisible] = useState(false);
  let Icon;
  let bgColor;
  if (isPrivate) {
    Icon = EyeInvisibleOutlined;
    bgColor = "cyan";
  } else if (isFungible) {
    Icon = DollarOutlined;
    bgColor = "hsl(44, 100%, 50%)";
  } else {
    Icon = EyeOutlined;
    bgColor = "hsl(117, 100%, 50%)";
  }
  return (
    <div
      className="image-mask"
      style={{ position: "relative", top: "0", left: "0" }}
    >
      <Image
        style={{
          position: "relative",
          zIndex: 0,
        }}
        src={image}
        alt="Header-Card-Img"
        preview={{
          visible: false,
          mask: <MdRemoveRedEye style={{ fontSize: 40 }} />,
        }}
      />
      <span
        className="dot"
        style={{
          position: "absolute",
          backgroundColor: bgColor,
          top: 9,
          left: 9,
        }}
      />
      <Icon style={{ fontSize: 25, position: "absolute", top: 7, left: 7 }} />
    </div>
  );
};

export const CardContent = ({
  name,
  description,
  sellerAddress,
  amount,
  price,
}) => {
  let CurrencyIcon;
  if (price != "") {
    CurrencyIcon = FaEthereum;
  } else {
    CurrencyIcon = Typography.Text;
  }
  return (
    <div>
      <Typography.Title level={1}>{name}</Typography.Title>
      <Typography.Text>{description}</Typography.Text>
      <Row justify="space-between" style={{ marginTop: 15 }}>
        <Col className="align-items-center">
          <CurrencyIcon
            style={{ marginRight: 3, marginBottom: 2, background: "white" }}
          />
          <Typography.Text strong>{price}</Typography.Text>
        </Col>
        <Col className="align-items-center">
          <Typography.Text
            type="secondary"
            style={{ marginRight: 5, marginBottom: 5, fontSize: "12px" }}
          >
            Cantidad:
          </Typography.Text>
          <Typography.Text strong>{amount}</Typography.Text>
        </Col>
      </Row>
      <Row justify="space-between" style={{ marginTop: 15 }}>
        <Col>
          <Typography.Text type="secondary">{sellerAddress}</Typography.Text>
        </Col>
      </Row>
    </div>
  );
};

export const FooterCard = (avatar) => {
  return (
    <>
      <Divider />

      <Space size={"middle"}>
        <Avatar src={avatar} alt="Avatar-Img" />
        <span>
          <Typography.Text className="secondary-text">
            Creation of
          </Typography.Text>{" "}
          <Typography.Text className="link">Jules Wyvern</Typography.Text>
        </span>
      </Space>
    </>
  );
};
