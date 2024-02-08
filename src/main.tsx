import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "./styles/globals.css";
import { Toaster } from "./components/ui/Toaster";
import { getGasless } from "./utils/getGasless";
import {
  biconomyApiIdConst,
  biconomyApiKeyConst,
  relayerUrlConst,
  clientIdConst,
} from "./consts/parameters";
import { Sepolia } from "@thirdweb-dev/chains"; // Add desired chain here Ethereum or Sepolia

const container = document.getElementById("root");
const root = createRoot(container!);
const urlParams = new URL(window.location.toString()).searchParams;

const relayerUrl = urlParams.get("relayUrl") || relayerUrlConst || "";
const biconomyApiKey =
  urlParams.get("biconomyApiKey") || biconomyApiKeyConst || "";
const biconomyApiId =
  urlParams.get("biconomyApiId") || biconomyApiIdConst || "";
const sdkOptions = getGasless(relayerUrl, biconomyApiKey, biconomyApiId);

const clientId = urlParams.get("clientId") || clientIdConst || "";

root.render(
  <React.StrictMode>
    <ThirdwebProvider activeChain={Sepolia} sdkOptions={sdkOptions} clientId={clientId}>
      <Toaster />
      <App />
    </ThirdwebProvider>
  </React.StrictMode>,
);
