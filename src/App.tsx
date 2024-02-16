import {
  ConnectWallet,
  detectContractFeature,
  useAddress,
  useContract,
  useContractMetadata,
  useContractEvents,
  useContractRead,
  useNFT,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, utils, ethers } from "ethers";
import { useMemo, useState, useEffect } from "react";
import { HeadingImage } from "./components/HeadingImage";
import { PoweredBy } from "./components/PoweredBy";
import { GitHub } from "./components/GitHub";
import { useToast } from "./components/ui/use-toast";
import { parseIneligibility } from "./utils/parseIneligibility";
import {
  clientIdConst,
  contractConst,
  primaryColorConst,
  themeConst,
} from "./consts/parameters"; //change this parameters.ts when you want to deploy
import { ContractWrapper } from "@thirdweb-dev/sdk/dist/declarations/src/evm/core/classes/internal/contract-wrapper";
import { abi } from "./abi/abi";
import { CID } from 'multiformats/cid';
import { create } from 'multiformats/hashes/digest';
import { keccak256 } from 'ethers/lib/utils';
import { MerkleTree } from 'merkletreejs';
import handleError from "./utils/handleError";
import { GridLoader } from "react-spinners";
import { NFTCard } from "./components/NFTCard";

const urlParams = new URL(window.location.toString()).searchParams;
const contractAddress = urlParams.get("contract") || contractConst || "";
const primaryColor =
  urlParams.get("primaryColor") || primaryColorConst || undefined;

const colors = {
  purple: "#7C3AED",
  blue: "#3B82F6",
  orange: "#F59E0B",
  pink: "#EC4899",
  green: "#10B981",
  red: "#EF4444",
  teal: "#14B8A6",
  cyan: "#22D3EE",
  yellow: "#FBBF24",
} as const;

interface Invite {
  key: string;
  cid: string;
  condition: any;
}

interface ApprovedItem {
  addresses: any | any[];
  name: string;
  cid: string;
  key: any;
  condition: any;
  proof?: string[];
}

interface Quantities {
  [key: string]: number;
}

interface contractAddress {
  contract: any;
}

export default function Home() {
  const contractQuery = useContract(contractAddress, abi);
  const contractMetadata = useContractMetadata(contractQuery.contract);
  const { toast } = useToast();
  let theme = (urlParams.get("theme") || themeConst || "light") as
    | "light"
    | "dark";
  const root = window.document.documentElement;
  root.classList.add(theme);
  const address = useAddress();
  const [quantities, setQuantities] = useState<Quantities>({});
  const [totalSupply, setTotalSupply] = useState(0);
  const [nextTokenId, setNextTokenId] = useState(0);
  const [newInvites, setNewInvites] = useState<Invite[]>([]);
  const [collectionImg, setCollectionImg] = useState("");
  const ipfsGateway = "https://nftstorage.link/ipfs/";
  const [approved, setApproved] = useState<ApprovedItem[]>([]);
  const [uApproved, setUApproved] = useState<ApprovedItem[]>([]);
  const [minting, setMinting] = useState(false);
  const [onMintNFTs, setOnMintNFTs] = useState<boolean>(false);

  //for factoria configuration fetch
  useEffect(() => {
    if (!contractQuery.contract) return;
  
    // Fetch total supply and image
    contractQuery.contract.call("config").then(async (configPromise) => {
      const config = await configPromise; // Await the promise to get the actual config object
      setTotalSupply(BigNumber.from(config.supply).toNumber());
      
      // Convert IPFS URL to HTTP URL
      const ipfsGateway = "https://nftstorage.link/ipfs/";
      const ipfsHash = config.placeholder.split("ipfs://")[1];
      const jsonUrl = `${ipfsGateway}${ipfsHash}`;
    
      try {
        // Fetch the JSON file from IPFS
        const response = await fetch(jsonUrl);
        const data = await response.json();
    
        // Set the IPFS image link from the JSON file
        if (data && data.image) {
          setCollectionImg(data.image); // This will be the IPFS link
        }
  
      } catch (error) {
        console.error("Error fetching IPFS data:", error);
      }
    }).catch(console.error);
  
    // Fetch next token ID
    contractQuery.contract.call("nextId").then((id) => {
      setNextTokenId(BigNumber.from(id).toNumber());
    }).catch(console.error);
  
  }, [contractQuery.contract]);

  // fetch invites from f0 contract
  const invites = useContractEvents(
    contractQuery.contract,
    "Invited",
  );

  //for factoria invite fetch
  useEffect(() => {
    if (invites.data != null) {
      const updateInvitesData = async () => {
        const updatedInvites = await Promise.all(invites.data.map(async invite => { // Make sure to use async here
          // Extract the cid and key from each invite
          const cidHex = invite.data.cid;
          const key = invite.data.key;
  
          const bytes = create(18, Uint8Array.from(Buffer.from(cidHex.slice(2), 'hex')));
          const cid = CID.createV1(0x55, bytes);
          const ipfsUrl = cid.toString();
  
          try {
            // Await the resolution of the condition promise
            if ( contractQuery.contract !== undefined) {
              const condition = await contractQuery.contract.call("invite", [key]);
            
              return {
                key: key,
                cid: ipfsUrl,
                condition: condition,
              };
            } else {
              return {
                key: key,
                cid: ipfsUrl,
                condition: null,
              };
            }
          } catch (error) {
            console.error("Error fetching condition:", error);
            return {
              key: key,
              cid: ipfsUrl,
              condition: null,
            };
          }
        }));
  
        setNewInvites(updatedInvites);
      };
      updateInvitesData().catch(console.error);
    }
  }, [contractQuery.contract, invites.data]);
  
 //console.log("newInvites", newInvites);
 

  useEffect(() => {
    if (address != null && newInvites != null) {
      const checkApprovedInvites = async () => {
        try {
          console.log("Checking approved invites for address:", address);
          // console.log("New invites:", newInvites);
          let anyInviteIncluded = false;
  
          const approvals = await Promise.all(newInvites.map(async (invite) => {
            // console.log("Fetching CID:", invite.cid);
            if (invite.cid == "bafkreiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"){
              if (anyInviteIncluded) {
                return {
                  addresses: "Null",
                  name: "Public Mint",
                  cid: invite.cid,
                  key: invite.key,
                  condition: invite.condition,
                }; // Skip this invite if already included
              }
              anyInviteIncluded = true;
              return {
                addresses: "Any",
                name: "Public Mint",
                cid: invite.cid,
                key: invite.key,
                condition: invite.condition,
              };
            }
            const response = await fetch(`${ipfsGateway}${invite.cid}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();

          // Merge the fetched data with cid, key, and condition from the invite
          return {
            ...jsonData, // Spread the JSON data
            cid: invite.cid,
            key: invite.key,
            condition: invite.condition,
          };
          }));
  
          const uniqueApprovals = approvals.reduce((acc, current) => {
            if (!acc.find((item:any) => item.key === current.key)) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          setUApproved(uniqueApprovals);
        } catch (error) {
          console.error("Error in fetching approvals:", error);
        }
      };
  
      checkApprovedInvites();
    } else {
      toast({
        title: "Login Required",
        description: "Please Login to View Invites",
        duration: 3000,
        className: "bg-green-500",
      });
    }
  }, [address, newInvites]);
  

  // console.log("approved", approved);

  useEffect(() => {
    if (uApproved && address) {
      console.log("Generating proof for address:", address);
      try {
        const updatedApproved = uApproved.map(item => {
          // Skip generating proof for items that don't require it
          if (item.addresses === "Any" || item.addresses === "Null") {
            return { ...item, proof: [] };
          }
  
          // Generate leaf nodes for the item's addresses
          const leafNodes = item.addresses.map((addr:any) => utils.keccak256(utils.solidityPack(["address"], [addr.toLowerCase()])));
  
          // Create a new Merkle tree for this item
          const merkleTree = new MerkleTree(leafNodes, utils.keccak256, { sortPairs: true });
  
          // Generate a proof for the current user's address
          const hashedAddress = utils.keccak256(utils.solidityPack(["address"], [address.toLowerCase()]));
          const merkleProof = merkleTree.getHexProof(hashedAddress);
  
          return { ...item, proof: merkleProof };
        });
  
        setApproved(updatedApproved);
      } catch (error) {
        console.error("Error generating Merkle proof:", error);
      }
    }
  }, [uApproved, address]);
  
  const claimedSupply = nextTokenId - 1;
  const unclaimedSupply = totalSupply - claimedSupply;

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    return BigNumber.from(claimedSupply || 0)
      .add(BigNumber.from(unclaimedSupply || 0))
      .toString();
  }, [claimedSupply, unclaimedSupply]);


  const isLoading = useMemo(() => {
    return (
      !contractQuery.contract
    );
  }, [
    contractQuery.contract,
  ]);

  const buttonLoading = useMemo(
    () => isLoading,
    [isLoading],
  );


  const dropNotReady = useMemo(
    () =>
      approved?.length === 0 ||
      approved?.every((cc) => cc.condition.limit === "0"),
    [approved],
  );

  //thirdweb client id required
  const clientId = urlParams.get("clientId") || clientIdConst || "";
  if (!clientId) {
    return (
      <div className="flex items-center justify-center h-full">
        Client ID is required as a query param to use this page.
      </div>
    );
  }

  //check to determin if contract address provided in parameters
  if (!contractAddress) {
    return (
      <div className="flex items-center justify-center h-full">
        No contract address provided
      </div>
    );
  }

  const isOpenEdition = useMemo(() => {
    if (contractQuery?.contract) {
      const contractWrapper = (contractQuery.contract as any)
        .contractWrapper as ContractWrapper<any>;

      const featureDetected = detectContractFeature(
        contractWrapper,
        "ERC721SharedMetadata",
      );

      return featureDetected;
    }
    return false;
  }, [contractQuery.contract]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (unclaimedSupply &&
          BigNumber.from(unclaimedSupply|| 0).lte(
            0,
          )) ||
        (numberClaimed === numberTotal && !isOpenEdition)
      );
    } catch (e) {
      return false;
    }
  }, [
    numberClaimed,
    numberTotal,
    isOpenEdition,
  ]);

  //mint function for each invite
  const mint = async (key:any, proof:any, quantity:any, cost:any) => {
    setMinting(true);
    const auth = {
      "key": key,
      "proof": proof,
    };
    const count = BigNumber.from(quantity).toNumber();
    console.log("Minting NFT");
    if (quantity !== undefined && contractQuery.contract !== undefined) {
      const totalCost = BigNumber.from(cost._hex).mul(count); 
      await contractQuery.contract.call("mint", [auth, count], {value: totalCost}).then((result) => {
        console.log("Minted:", result);
          toast({
            title: "Successfully minted",
            description:
              "The NFT has been transferred to your wallet",
            duration: 5000,
            className: "bg-green-500",
          });
          setMinting(false);
          setOnMintNFTs(true);
      }).catch((error) => {
        console.error("Error minting:", error);
        const reasonRegex = /Reason:\s+(.+)/;
        const match = error.message.match(reasonRegex);
        const reason = match ? match[1].trim() : 'Unknown Error';
        const message = handleError(reason as string);
        toast({
          title: "Failed to mint drop",
          description: `Reason: ${message}` || "",
          duration: 9000,
          variant: "destructive",
        });
        setMinting(false);
      });
  }
};

const handleDecreaseQuantity = (itemKey: any) => {
  setQuantities((prevQuantities) => ({
    ...prevQuantities,
    [itemKey]: Math.max(1, (prevQuantities[itemKey] || 1) - 1),
  }));
};

const handleIncreaseQuantity = (itemKey:any, limit:any) => {
  setQuantities((prevQuantities) => ({
    ...prevQuantities,
    [itemKey]: Math.min(limit, (prevQuantities[itemKey] || 1) + 1),
  }));
};



  return (
    <div className="w-screen min-h-screen">
      <ConnectWallet className="!absolute !right-4 !top-4" theme={theme} />
      <div className="grid h-screen grid-cols-1 lg:grid-cols-12">
        <div className="items-center justify-center hidden w-full h-full lg:col-span-5 lg:flex lg:px-12">
          <HeadingImage
            src={collectionImg}
            isLoading={isLoading}
          />
        </div>
        <div className="flex items-center justify-center w-full h-full col-span-1 lg:col-span-7">
          <div className="flex flex-col w-full max-w-xl gap-4 p-12 rounded-xl lg:border lg:border-gray-400 lg:dark:border-gray-800">
            <div className="flex w-full mt-8 xs:mb-8 xs:mt-0 lg:hidden">
              <HeadingImage
                src={collectionImg}
                isLoading={isLoading}
              />
            </div>

            <div className="flex flex-col gap-2 xs:gap-4">
              {isLoading ? (
                <div
                  role="status"
                  className="space-y-8 animate-pulse md:flex md:items-center md:space-x-8 md:space-y-0"
                >
                  <div className="w-full">
                    <div className="w-24 h-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  </div>
                </div>
              ) : isOpenEdition ? null : (
                <p>
                  <span className="text-lg font-bold tracking-wider text-gray-500 xs:text-xl lg:text-2xl">
                    {nextTokenId !== 0 ? nextTokenId - 1 : 0}
                  </span>{" "}
                  <span className="text-lg font-bold tracking-wider xs:text-xl lg:text-2xl">
                    / {totalSupply} minted
                  </span>
                </p>
              )}
              <h1 className="text-2xl font-bold line-clamp-1 xs:text-3xl lg:text-4xl">
                {contractMetadata.isLoading ? (
                  <div
                    role="status"
                    className="space-y-8 animate-pulse md:flex md:items-center md:space-x-8 md:space-y-0"
                  >
                    <div className="w-full">
                      <div className="w-48 h-8 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                    </div>
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  contractMetadata.data?.name
                )}
              </h1>
              {contractMetadata.data?.description ||
                contractMetadata.isLoading ? (
                  <div className="text-gray-500 line-clamp-2">
                  {contractMetadata.isLoading ? (
                    <div
                      role="status"
                        className="space-y-8 animate-pulse md:flex md:items-center md:space-x-8 md:space-y-0"
                    >
                      <div className="w-full">
                        <div className="mb-2.5 h-2 max-w-[480px] rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    contractMetadata.data?.description
                  )}
                </div>
              ) : null}
            </div>
            {approved && approved.length > 0 && (
              <table className="w-full divide-y divide-gray-700 bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-2 md:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-2 md:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Limit
                  </th>
                  <th scope="col" className="px-2 md:px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-2 md:px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Invite
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {approved
                  .filter(item => 
                    item.addresses.includes(address) || 
                    item.addresses.includes("Any") ||
                    item.addresses.includes(address && address.toLowerCase())
                  )
                  .map((item, index) => {
                    const itemQuantity = quantities[item.key] || 1;
                    return (
                    <tr key={item.key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {utils.formatEther(item.condition.price._hex)} ETH 
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {BigNumber.from(item.condition.limit._hex).toString()}
                      </td>
                      <td className="whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex w-full px-2 border border-gray-400 rounded-lg h-11 dark:border-gray-800 md:w-full">
                          <button 
                            onClick={() => handleDecreaseQuantity(item.key)}
                            className="flex items-center justify-center h-full px-2 text-2xl text-center rounded-l-md disabled:cursor-not-allowed disabled:text-gray-500 dark:text-white dark:disabled:text-gray-600"
                            disabled={isSoldOut || itemQuantity <= 1} // Disable if sold out or quantity is already at minimum
                          >
                            -
                          </button>
                          <p className="flex items-center justify-center w-full h-full font-mono text-center dark:text-white lg:w-full">
                            {!isLoading && isSoldOut ? "Sold Out" : itemQuantity}
                          </p>
                          <button
                            onClick={() => handleIncreaseQuantity(item.key, BigNumber.from(item.condition.limit._hex).toNumber())}
                            className="flex h-full items-center justify-center rounded-r-md px-2 text-center text-2xl disabled:cursor-not-allowed disabled:text-gray-500 dark:text-white dark:disabled:text-gray-600"
                            disabled={isSoldOut || itemQuantity >= BigNumber.from(item.condition.limit._hex).toNumber() || itemQuantity === unclaimedSupply} // Disable if sold out or quantity is already at limit
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Web3Button
                          contractAddress={
                            contractQuery.contract?.getAddress() || ""
                          }
                          style={{
                            backgroundColor:
                              colors[primaryColor as keyof typeof colors] ||
                              primaryColor,
                            maxHeight: "43px",
                            borderRadius: "18px",
                            width: "10px"
                          }}
                          theme={theme}
                          action={() => {
                            mint(
                            item.key, item.proof, itemQuantity, ethers.BigNumber.from(item.condition.price._hex)
                            );
                          }}         
                          isDisabled={buttonLoading}
                          onError={(err) => {
                            console.error(err);
                            console.log({ err });
                            toast({
                              title: "Failed to mint drop",
                              description: (err as any).reason || "",
                              duration: 9000,
                              variant: "destructive",
                            });
                          }}
                        >
                          {buttonLoading ? (
                            <div role="status">
                              <svg
                                aria-hidden="true"
                                    className="w-4 h-4 mr-2 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                  fill="currentFill"
                                />
                              </svg>
                              <span className="sr-only">Loading...</span>
                            </div>
                          ) : (
                            item.name || "Private Mint"
                          )}
                        </Web3Button>
                      </td>
                    </tr>
                    );
                  })
                }
              </tbody>
            </table>     
            )}
          </div>
        </div>
        {minting && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-black p-5 border border-gray-400 w-2/5 text-center shadow-md rounded-2xl">
              <div className="mb-5">You are minting something amazing!</div>
              <GridLoader color="#7C3AED" size={15} margin={2} />
            </div>
          </div>
        )}
      </div>
        <h1 className="text-center text-[#e9e9e9] text-3xl font-bold mt-5 mb-5">Your Minted NFTs</h1>
        <NFTCard onMintNFTs={onMintNFTs}/>
      <GitHub />
      <PoweredBy />
    </div>
  );
}
