import { useLocation } from "react-router";
import { Menu, Divider, Space } from "antd";
import { NavLink } from "react-router-dom";
import {
  ShoppingCartOutlined,
  TransactionOutlined,
  SwapOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
function MenuItems() {
  const { pathname } = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      style={{
        display: "flex",
        fontSize: "17px",
        fontWeight: "500",
        width: "100%",
        justifyContent: "center",
      }}
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item
        key="/marketplace"
        style={{ fontSize: 25 }}
        icon={<ShoppingCartOutlined style={{ fontSize: 25 }} />}
      >
        <NavLink to="/marketplace">Mercado</NavLink>
      </Menu.Item>
      <Menu.SubMenu
        title="Mis contenidos 🔻"
        style={{ fontSize: 25 }}
        icon={<VideoCameraOutlined style={{ fontSize: 25 }} />}
      >
        <Menu.Item key="/wallet">
          <NavLink to="/wallet">👛 Mi cartera</NavLink>
        </Menu.Item>
        <Menu.Item key="/myOffers">
          <NavLink to="/myOffers">💸 Mis ofertas</NavLink>
        </Menu.Item>
        <Menu.Item key="/contentCreator">
          <NavLink to="/contentCreator">🍲 Creador de contenido</NavLink>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item
        key="/transactions"
        icon={<TransactionOutlined style={{ fontSize: 15 }} />}
      >
        <NavLink to="/transactions">Transacciones</NavLink>
      </Menu.Item>
      <Menu.Item key="/1inch" icon={<SwapOutlined style={{ fontSize: 15 }} />}>
        <NavLink to="/1inch">Exchange</NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default MenuItems;
