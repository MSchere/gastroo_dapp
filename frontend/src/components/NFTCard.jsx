import React from "react";
import { Avatar, Col, Divider, Image, Row, Space, Typography } from "antd";
import { MdRemoveRedEye } from "react-icons/md";
import { FaEthereum } from "react-icons/fa";
import { useState } from "react";

export const ImageCard = ({ image }) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Image
        src={image}
        alt="Header-Card-Img"
        preview={{
          visible,
          src: image,
          onVisibleChange: (value) => {
            setVisible(value);
          },
        }}
        width={175}
        onClick={() => setVisible(true)}
      />
    </>
  );
};

export const CardContent = ({
  name,
  description,
  sellerAddress,
  amount,
  price,
}) => {
  return (
    <>
      <Typography.Title level={4}>{name}</Typography.Title>

      <Typography.Text>{description}</Typography.Text>

      <Row justify="space-between" style={{ marginTop: 15 }}>
        <Col>
          <FaEthereum style={{ marginRight: 3 }} />
          <Typography.Text strong>{price}</Typography.Text>
        </Col>
        <Col>
          <Typography.Text strong>{amount}</Typography.Text>
        </Col>
      </Row>
      <Row justify="space-between" style={{ marginTop: 15 }}>
        <Col>
          <Typography.Text type="secondary">{sellerAddress}</Typography.Text>
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
