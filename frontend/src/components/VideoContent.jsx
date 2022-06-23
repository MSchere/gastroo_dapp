import React from "react";
import { Avatar, Col, Divider, Row, Space, Typography } from "antd";

export const VideoContent = ({
  name,
  video,
  image,
  description,
  ingredients,
  categories,
  isPrivate,
  isFungible,
}) => {
  if (!isPrivate && !isFungible) {
    return (
      <div>
        <Typography.Title level={2}>{name}</Typography.Title>
        <div className="video-mask">
          <video src={video} controls />
        </div>
        <Row justify="space-between" style={{ marginTop: 15 }}>
          <Typography.Paragraph>
            <blockquote>{description}</blockquote>
          </Typography.Paragraph>
        </Row>
        <Typography.Title level={4}>🍲 Ingredientes:</Typography.Title>
        <ul>
          <li>
            <Typography.Text strong>{ingredients}</Typography.Text>
          </li>
        </ul>
        <Divider />
        <Typography.Title level={4}>🗃️ Categorías:</Typography.Title>
        <ul>
          <li>
            <Typography.Text strong>{categories}</Typography.Text>
          </li>
        </ul>
      </div>
    );
  } else if (isPrivate) {
    return (
      <div>
        <Typography.Title level={2}>{name}</Typography.Title>
        <div className="video-mask">
          <video src={video} controls />
        </div>
        <Row justify="space-between">
          <Typography.Text
            strong
            style={{
              marginTop: 15,
              marginBottom: 15,
              color: "red",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {
              "¡Necesitas ser propietario de este token para poder ver el contenido!"
            }
          </Typography.Text>
        </Row>
        <Typography.Title level={4}>🍲 Ingredientes:</Typography.Title>
        <ul>
          <li>
            <Typography.Text strong>
              {"Este contenido es privado... ¡Para verlo compra este token!"}
            </Typography.Text>
          </li>
        </ul>
        <Divider />
        <Typography.Title level={4}>🗃️ Categorías:</Typography.Title>
        <ul>
          <li>
            <Typography.Text strong>{categories}</Typography.Text>
          </li>
        </ul>
      </div>
    );
  } else if (isFungible) {
    return (
      <div>
        <Typography.Title level={2}>{name}</Typography.Title>
        <div className="video-mask">
          <img src={image} />
        </div>
        <Row justify="space-between" style={{ marginTop: 15 }}>
          <Typography.Paragraph>
            <blockquote>{description}</blockquote>
          </Typography.Paragraph>
        </Row>
        <Divider />
        <Typography.Title level={4}>🗃️ Categorías:</Typography.Title>
        <ul>
          <li>
            <Typography.Text strong>{categories}</Typography.Text>
          </li>
        </ul>
      </div>
    );
  }
};
