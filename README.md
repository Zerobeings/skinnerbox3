
#Repo Under Construction

# Skinnerbox v3

> A dead simple forkable NFT vending machine

![box.png](box.png)

# How is this different from Skinnerbox v1 & v2?

> The original Skinnerbox is at https://github.com/factoria-org/skinnerbox

![skinnerbox2.gif](skinnerbox2.gif)

1. Walletconnect support: v1 only supported Metamask. Skinnerbox2 uses [Walletconnect](https://walletconnect.com/), which means it supports all wallets, including mobile.
2. Better error handling: v1 didn't do much to handle errors. Skinnerbox2 now prints out all errors when something goes wrong, so it's easier to understand what's gone wrong.
3. Requires infura ID: Because walletconnect requires you to insert an Infura ID, you need to set up an Infura account (FREE) and use its project ID.

> Version 2 Skinnerbox is at https://github.com/factoria-org/skinnerbox2
1. v2 uses Walletconnect v1, which has been sunsetted. Skinnerbox3 now uses thirdwebs connect wallet button (which includes Walletconnect v2 configuration options), which is the latest version. This means that Skinnerbox3 now supports all wallets, including mobile (again). Additiaonlly, it supports email login (with paper), local wallet, and many more options. [Connect](https://thirdweb.com/dashboard/wallets/connect) button by thirdweb is the most advanced wallet connect button available.

![connectWallet.png](connectWallet.png)

2. Skinnerbox3 now uses [tailwind](https://tailwindcss.com/docs/installation) for styling, which makes it easier to customize the look and feel of the vending machine.


# Usage

Here's an example walkthrough of how it's used:

![skinnerbox.gif](skinnerbox.gif)

You can try it out here: https://factoria-org.github.io/skinnerbox2

> NOTE: This demo works on Rinkeby (so it's easy to test). Make sure to switch the wallet network to Rinkeby testnet first. (But this repository works both on mainnet and testnet automatically. When you fork this repo and add your own mainnet address, it should automatically work on mainnet too)

# How to use

1. Go deploy an NFT contract with [Factoria](https://factoria.app/)
2. Fork this repository
3. Update the [box.json](box.json) to set your own contract address from step 1, as well as set the network ("rinkeby" or "main")
4. Also, update the `"infura"` attribute inside the box.json file. You can learn more about how to set up an Infura project over here: https://blog.infura.io/getting-started-with-infura-28e41844cc89/ 
5. (optional) Customize style by changing the [style.css](style.css)
6. Create github pages ([tutorial](https://dev.to/byteslash/getting-started-with-github-pages-4jpf))

# Advanced

For those of you who want to hack on it to build custom features. Here are the relevant files:

1. [index.html](index.html): This is the main landing page, which displays the currently signed in user's invite lists
2. [mint.html](mint.html): This is the minting app

The code is super simple because it's powered by **[f0.js](f0.js)**, which abstracts away most of the web3, ipfs, and merkle proof handling into one liner methods.


# ERC721 Drop Claim Page

In this example, you can create your own ERC721 Drop claim page just by customizing the template with your branding and plugging in your NFT Drop contract address.

This template works with the NFT Drop / Signature Drop contract from thirdweb or when using any of the Drop contract bases or if you implement these extensions:

- [ERC721ClaimConditions](https://portal.thirdweb.com/solidity/extensions/erc721claimconditions)
- [ERC721ClaimPhases](https://portal.thirdweb.com/solidity/extensions/erc721claimphases)

## Using This Repo

To create your own version of this template, you can use the following steps:

Run this command from the terminal to clone this project:

```bash
npx thirdweb create --template erc721
```

### 1. Deploy An NFT Drop on thirdweb

If you haven't already deployed your contract, head over to the thirdweb dashboard and create your own NFT Drop contract.

You can learn how to do that with our guide [Release an NFT drop on your own site without writing any code](https://portal.thirdweb.com/guides/release-an-nft-drop-with-no-code#create-a-drop-contract).

Be sure to configure a **name**, **description**, and **image** for your NFT drop in the dashboard.

### 2. Configure Parameters

Go to the [`parameters.ts`](/src/consts/parameters.ts) and update the following values:

1. `contractConst`: The smart contract address of your NFT drop.
2. `chainConst`: The name of the chain that your smart contract is deployed to.

If you are using one of thirdweb's [default supported chains](https://portal.thirdweb.com/react/react.thirdwebprovider#default-chains) You can use the chain name as string.

#### Example

```ts
export const chainConst = "ethereum";
```

If you are using any other chain, you need to provide the chain object from the `@thirdweb-dev/chains` package to `ThirdwebProvider`'s `activeChain` prop as mentioned [here](https://portal.thirdweb.com/react/react.thirdwebprovider#activechain-recommended).


#### Example

```ts
import { Sepolia } from '@thirdweb-dev/chains';

export const chainConst = Sepolia;
```

If your chain is not included in the `@thirdweb-dev/chains` package, you can provide the chain information yourself by creating an object as mentioned [here](https://portal.thirdweb.com/react/react.thirdwebprovider#custom-evm-chains)


### 3. Customize the Styling

You can change the theme and primary color of the page by updating `primaryColorConst` and `themeConst` in [`parameters.ts`](/src/consts/parameters.ts).

If you want to go further, you can also update the styles in the respective components by changing the [Tailwind](https://tailwindcss.com/) classes.

### 4. Optional: Add Gasless Transaction Support

If you want to sponsor the gas fees for your user, you can update the `relayerUrlConst` in [`parameters.ts`](/src/consts/parameters.ts) to point to your Open Zeppelin relayer or `biconomyApiKeyConst` and `biconomyApiIdConst` to use Biconomy.

Learn more: https://portal.thirdweb.com/glossary/gasless-transactions

## Deploying Your Site

### Deploying to IPFS

To deploy your site to IPFS, run the following command:

```bash
yarn deploy
```

This will deploy your site and output the IPFS hash of your site. You can then grab the IPFS hash and replace it with the one you get on the Embed tab on your contract on dashboard, so you get the updated version on your website once you copy it over.

### Deploying to a centralized server

You can also deploy it to any centralized server like any normal website.

## Join our Discord!

For any questions or suggestions, join our discord at [https://discord.gg/thirdweb](https://discord.gg/thirdweb).
