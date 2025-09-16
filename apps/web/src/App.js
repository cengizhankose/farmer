import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Landing from "./pages/Landing.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import OpportunityDetail from "./pages/OpportunityDetail.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import { Layout } from "./components/Layout.jsx";
import { WalletProvider } from "./contexts/WalletContext.jsx";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  React.useEffect(() => {
    const helloWorldApi = async () => {
      try {
        const response = await axios.get(`${API}/`);
        console.log(response.data.message);
      } catch (e) {
        console.warn("/api root unreachable or not needed right now");
      }
    };
    helloWorldApi();
  }, []);

  return <Landing />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <WalletProvider expected="testnet">
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/opportunities/:id" element={<OpportunityDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </Layout>
        </WalletProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;