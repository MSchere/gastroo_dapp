import React from "react";
import { Avatar, Col, Divider, Image, Row, Space, Typography } from "antd";
import { MdRemoveRedEye } from "react-icons/md";
import { FaEthereum } from "react-icons/fa";

export const ImageCard = (image) => {
  return (
    <>
      <Image
        src={image}
        alt="Header-Card-Img"
        preview={{
          mask: <MdRemoveRedEye style={{ fontSize: 40 }} />,
        }}
      />
    </>
  );
};

export const CardContent = ({ name, description, cuantity, price }) => {
  return (
    <>
      <Typography.Title level={4}>{name}</Typography.Title>

      <Typography.Text>{description}</Typography.Text>

      <Row justify="space-between" style={{ marginTop: 15 }}>
        <Col className="align-items-center color-cyan">
          <FaEthereum style={{ marginRight: 3 }} />
          <Typography.Text strong>{price} ETH</Typography.Text>
        </Col>
        <Col className="align-items-center secondary-text">
          <Typography.Text strong>x{cuantity}</Typography.Text>
        </Col>
      </Row>
    </>
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
