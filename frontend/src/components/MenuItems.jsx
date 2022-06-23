import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

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
      <Menu.Item key="/marketplace">
        <NavLink to="/marketplace">🛒 Mercado</NavLink>
      </Menu.Item>
      <Menu.Item key="/contentCreator">
        <NavLink to="/contentCreator">🍲 Cocina</NavLink>
      </Menu.Item>
      <Menu.Item key="/wallet">
        <NavLink to="/wallet">🧑‍🍳 Mis contenidos</NavLink>
      </Menu.Item>
      <Menu.Item key="/myOffers">
        <NavLink to="/myOffers">💸 Mis ofertas</NavLink>
      </Menu.Item>
      <Menu.Item key="/transactions">
        <NavLink to="/transactions">🧾 Transacciones</NavLink>
      </Menu.Item>
      <Menu.Item key="/1inch">
        <NavLink to="/1inch">🏦 Exchange</NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default MenuItems;
