import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { ConfigProvider } from "antd";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
} from "react-router-dom";
import Account from "components/Account/Account";
import Chains from "components/Chains";
import TokenPrice from "components/TokenPrice";
import DEX from "components/DEX";
import { Layout, Tabs } from "antd";
import NativeBalance from "components/NativeBalance";
import Marketplace from "components/Marketplace";
import Text from "antd/lib/typography/Text";
import MenuItems from "components/MenuItems";
import ContentCreator from "components/ContentCreator";
import Wallet from "components/Wallet";
import MyOffers from "components/MyOffers";

import cubes from "./image/cubes.png";
import gastroo from "./image/gastroo_blanco_transparente.png";
import MarketplaceTransactions from "components/MarketplaceTransactions";
const { Header, Footer } = Layout;

ConfigProvider.config({
  theme: {
    primaryColor: "hsl(44, 100%, 50%)",
  },
});

const App = ({ isServerInfo }) => {
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } =
    useMoralis();

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading)
      enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  return (
    <Layout style={{ height: "100vh", overflow: "auto" }}>
      <Router>
        <Header className="header">
          <Logo />
          <MenuItems />
          <div className="header-right">
            <Chains />
            <NativeBalance />
            <TokenPrice
              address="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
              chain="eth"
              image="https://cryptologos.cc/logos/ethereum-eth-logo.png?v=022"
              size="40px"
            />
            <Account />
          </div>
        </Header>
        <div
          style={{
            position: "relative",
            color: "white",
            top: "0",
            left: "0",
          }}
        >
          <img className="header-img" src={cubes} />
          <img className="logo-img" src={gastroo} />
          <div className="menu-background" />
        </div>
        <div className="content">
          <Switch>
            <Route exact path="/marketplace">
              <Marketplace />
            </Route>
            <Route exact path="/contentCreator">
              <ContentCreator />
            </Route>
            <Route path="/wallet">
              <Wallet />
            </Route>
            <Route path="/myOffers">
              <MyOffers />
            </Route>
            <Route path="/transactions">
              <MarketplaceTransactions />
            </Route>
            <Route path="/1inch">
              <Tabs defaultActiveKey="1" style={{ alignItems: "center" }}>
                <Tabs.TabPane tab={<span>Ethereum</span>} key="1">
                  <DEX chain="eth" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>Binance Smart Chain</span>} key="2">
                  <DEX chain="bsc" />
                </Tabs.TabPane>
                <Tabs.TabPane tab={<span>Polygon</span>} key="3">
                  <DEX chain="polygon" />
                </Tabs.TabPane>
              </Tabs>
            </Route>
            <Route path="/">
              <Redirect to="/marketplace" />
            </Route>
          </Switch>
        </div>
      </Router>
      <Footer style={{ textAlign: "center" }}>
        <Text style={{ display: "block" }}>
          ⭐️ Dale una estrella a nuestro proyecto en{" "}
          <a
            href="https://github.com/MSchere/gastroo_dapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
        </Text>

        <Text style={{ display: "block" }}>
          📖 ¿Tienes dudas? Léete la{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/MSchere/gastroo_dapp#readme"
          >
            Documentación
          </a>
        </Text>
      </Footer>
    </Layout>
  );
};

export const Logo = () => (
  <Link
    to="/marketplace"
    style={{
      display: "flex",
      gap: 5,
      borderRadius: 50,
      backgroundColor: "hsl(44, 100%, 50%)",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50.000000pt"
      height="50.000000pt"
      viewBox="0 0 400.000000 400.000000"
    >
      <g
        transform="translate(0.000000,400.000000) scale(0.10000,-0.100000)"
        fill="#000000"
        stroke="none"
      >
        <path
          d="M1811 3290 c-213 -56 -390 -200 -484 -393 -60 -122 -77 -197 -77
-339 0 -183 55 -344 160 -472 22 -26 40 -50 40 -53 0 -3 -22 -29 -49 -59 -84
-92 -121 -190 -121 -324 0 -139 38 -235 131 -334 95 -103 217 -156 354 -156
129 0 235 40 338 128 99 85 191 88 268 11 84 -84 71 -208 -30 -276 -68 -46
-144 -40 -216 17 -76 60 -157 64 -220 9 -41 -36 -60 -92 -51 -144 10 -49 80
-123 155 -163 192 -103 417 -73 574 77 106 101 149 202 150 351 0 204 -98 360
-283 449 -74 36 -76 36 -205 36 -129 0 -131 0 -205 -36 -41 -20 -95 -54 -120
-76 -60 -53 -100 -73 -149 -73 -51 0 -89 15 -124 48 -42 39 -57 75 -57 132 0
61 17 96 64 138 40 35 88 47 149 38 196 -31 264 -30 395 5 258 68 467 278 532
535 39 151 24 356 -36 492 l-23 53 34 45 c58 76 62 191 9 266 -74 105 -239
121 -335 32 l-26 -24 -46 20 c-139 62 -348 78 -496 40z m372 -327 c90 -43 177
-129 220 -220 30 -64 32 -74 32 -183 0 -109 -2 -119 -32 -183 -21 -44 -53 -89
-92 -128 -39 -39 -84 -71 -128 -92 -64 -30 -74 -32 -183 -32 -109 0 -119 2
-183 32 -91 43 -177 129 -220 220 -30 64 -32 74 -32 183 0 109 2 119 32 183
37 78 125 172 193 207 81 42 120 50 225 47 89 -2 108 -6 168 -34z"
        />
      </g>
    </svg>
  </Link>
);

export default App;
