/** Change these values to configure the application for your own use. **/

// Your smart contract address (available on the thirdweb dashboard)
// For existing collections: import your existing contracts on the dashboard: https://thirdweb.com/dashboard

//export const contractConst = "0x1D949bEAd4B8Cc799da70295c3103cC84f0EbB95"; //sepolia test
export const contractConst = "0x7E849C1616BEd1B10CA854A53c9ae8Ec03Be9293" //sepolia test
//export const contractConst = "0x8FbA3ebe77D3371406a77EEaf40c89C1Ed55364a" //mainnet

// It is IMPORTANT to provide your own API key to use the thirdweb SDK and infrastructure.
// Please ensure that you define the correct domain for your API key from the API settings page.
// You can get one for free at https://thirdweb.com/create-api-key
// Learn more here: https://blog.thirdweb.com/changelog/api-keys-to-access-thirdweb-infra
export const clientIdConst = import.meta.env.VITE_TEMPLATE_CLIENT_ID || "";

// The alchmey infrastructure is used to fetch the NFTs owned by the user. An API key is required to use the alchemy infrastructure.
// You can get one for free at https://www.alchemy.com/
// You can restrict the api key to your domain to prevent unauthorized use.
export const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY;
//export const ALCH_NET = "eth-mainnet"; //for mainner
export const ALCH_NET = "eth-sepolia";

// Configure the primary color for buttons and other UI elements
export const primaryColorConst = "#ccc";

// Choose between "light" and "dark" mode
export const themeConst = "dark";

// Gasless relayer configuration options
export const relayerUrlConst = ""; // OpenZeppelin relayer URL
export const biconomyApiKeyConst = ""; // Biconomy API key
export const biconomyApiIdConst = ""; // Biconomy API ID
