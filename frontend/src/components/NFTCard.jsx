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
  let Icon;
  if (isPrivate) {
    Icon = EyeInvisibleOutlined;
  } else if (isFungible) {
    Icon = DollarOutlined;
  } else {
    Icon = EyeOutlined;
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
          mask: <MdRemoveRedEye style={{ fontSize: "2.5rem" }} />,
        }}
      />
      <span
        className="dot"
        style={{
          position: "absolute",
          backgroundColor: "white",
          top: "0.7rem",
          left: "0.56rem",
        }}
      />
      <Icon
        style={{
          fontSize: "1.56rem",
          position: "absolute",
          top: "0.44rem",
          left: "0.44rem",
        }}
      />
    </div>
  );
};

export const CardContent = ({
  name,
  description,
  sellerAddress,
  amount,
  totalAmount,
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
            style={{
              marginRight: "0.19rem",
              marginBottom: "0.125rem",
              background: "white",
            }}
          />
          <Typography.Text strong>{price}</Typography.Text>
        </Col>
        <Col className="align-items-center">
          <Typography.Text
            type="secondary"
            style={{
              marginRight: "0.31rem",
              marginBottom: "0.31rem",
              fontSize: "0.75rem",
            }}
          >
            Cant:
          </Typography.Text>
          <Typography.Text strong>{amount}</Typography.Text>
          <Typography.Text
            type="secondary"
            style={{
              marginTop: "0.31rem",
              marginLeft: "0.31rem",
              fontSize: "0.75rem",
            }}
          >
            {totalAmount}
          </Typography.Text>
        </Col>
      </Row>
      <Row justify="space-between" style={{ marginTop: "0.94rem" }}>
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
