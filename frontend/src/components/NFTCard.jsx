import React from "react";
import { Avatar, Col, Divider, Image, Row, Space, Typography } from "antd";
import { MdRemoveRedEye } from "react-icons/md";
import { FaEthereum } from "react-icons/fa";
import { ImFileVideo, ImEyeBlocked, ImCoinDollar } from "react-icons/im";
import { isObject } from "url/util";

export const ImageCard = ({ image, isPrivate, isFungible }) => {
  let Icon;
  if (isPrivate) {
    Icon = ImEyeBlocked;
  } else if (isFungible) {
    Icon = ImCoinDollar;
  } else {
    Icon = ImFileVideo;
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
          mask: <MdRemoveRedEye style={{ fontSize: 40 }} />,
        }}
      />
      <Icon size={25} style={{ position: "absolute", top: 7, left: 7 }} />
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
          <CurrencyIcon style={{ marginRight: 3 }} />
          <Typography.Text strong>{price}</Typography.Text>
        </Col>
        <Col className="align-items-center">
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
