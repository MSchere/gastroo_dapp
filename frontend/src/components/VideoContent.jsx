import React from "react";
import { Avatar, Col, Divider, Row, Space, Typography } from "antd";

export const VideoContent = ({
  name,
  video,
  description,
  ingredients,
  categories,
  owner,
}) => {
  return (
    <>
      <Typography.Title level={2}>{name}</Typography.Title>
      <video src={video} controls />
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
    </>
  );
};
