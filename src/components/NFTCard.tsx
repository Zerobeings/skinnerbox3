import { MediaRenderer, useAddress } from "@thirdweb-dev/react";
import { useEffect, useState } from 'react';
import {
    ALCH_NET,
    API_KEY,
    contractConst,
  } from "../consts/parameters";

interface Attribute {
  trait_type: string;
  value: any;
}

export function NFTCard() {
    const address = useAddress();
    const [NFTs, setNFTs] = useState<any[]>([])
    const [nftsLoading, setNftsLoading] = useState<boolean>(true);
    const [pageKey, setPageKey] = useState('');
    const [hasMoreNFTs, setHasMoreNFTs] = useState(true);
    const [atBottom, setAtBottom] = useState<boolean>(false); 
    console.log("NFTs", NFTs);

    useEffect(() => {
        setNftsLoading(true);
        if (address !== undefined) {
            (async () => {
            let nfts;
            const baseURL = `https://${ALCH_NET}.g.alchemy.com/nft/v2/${API_KEY}/getNFTs/`;
            const pageCount = 100;
            var pageKey = '';
            
            const fetchURL = `${baseURL}?owner=${address}&contractAddresses[]=${contractConst}&withMetadata=true&pageKey=${pageKey}&pageSize=${pageCount}`;
            await fetch(fetchURL, {
                method: "GET",
            }).then((data) => data.json()).then((nfts) => {
                setNFTs(nfts.ownedNfts);
                setPageKey(nfts.pageKey);
                if(!nfts.pageKey || nfts.ownedNfts.length === 0) {
                setHasMoreNFTs(false);
                }
                setNftsLoading(false);
            });
                    
            })();
        }
      },[address, API_KEY, contractConst]);
    
      const loadMoreNFTs = () => {
        if(pageKey === '' || !hasMoreNFTs) {
          return;
        }
        setNftsLoading(true);
        (async () => {
          let nfts;
          const baseURL = `https://${ALCH_NET}.g.alchemy.com/nft/v2/${API_KEY}/getNFTs/`;
          const pageCount = 100;
          const fetchURL = `${baseURL}?owner=${address}&${contractConst}&pageKey=${pageKey}&pageSize=${pageCount}`;
    
          await fetch(fetchURL, {
            method: "GET",
          }).then((data) => data.json()).then((nfts) => {
            setNFTs([...NFTs, ...nfts.ownedNfts]);
            setPageKey(nfts.pageKey);
            if(!nfts.pageKey || nfts.ownedNfts.length === 0) {
              setHasMoreNFTs(false);
            }
            setNftsLoading(false);
          });
                
        })();
      };
    
      useEffect(() => {
        if (typeof window === "undefined") {
          return;
        }
          const handleScroll = () => {
              setAtBottom(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight-30);
              console.log("At Bottom", atBottom)
              if(atBottom) {
                loadMoreNFTs();
              }
          };
    
            window.addEventListener('scroll', handleScroll);
    
          return () => {
            window.removeEventListener('scroll', handleScroll);
          };
      });

  return (
    <>
    {NFTs && NFTs.length > 0 && !nftsLoading && 
        <div className="flex flex-wrap justify-center p-0 my-7.5 mb-10">
            {NFTs.map((nft, i) => {
            return (
                nft?.metadata?.name !== "Failed to load NFT metadata" &&
                <div key={i} className="w-64 p-2.5 bg-gray-300 rounded-lg mr-2.5 box-border shadow-md border border-[#252405] my-2">
                    <h4 className="text-center text-[#252405] text-lg mt-1 p-0">{nft?.metadata?.name}</h4>
                    <a href={`https://opensea.io/assets/${contractConst}/${Number(nft.id.tokenId)}`} target="_blank" rel="noreferrer">
                        <MediaRenderer src={nft?.metadata?.image} alt="image" className="h-[233px] w-[233px] mx-auto bg-gray-300 transition-transform duration-300 ease-in-out hover:scale-200" />
                    </a>
                    <table className="table-fixed w-full border-separate border-spacing-0 border-white">
                    <tbody>
                        {nft.metadata && nft.metadata.attributes !== undefined &&
                        Object.entries(nft.metadata.attributes).map(([_, attribute]: [string, any], i) => {
                            const traitType = attribute.trait_type;
                            const value = attribute.value;
                            return (
                            <tr key={i} className="rounded-lg shadow-md mb-2.5 hover:bg-[#EC9E72] hover:text-black">
                                <td className="align-top break-words p-1.75 box-border text-xs cursor-pointer text-[#252405] font-bold border-2 border-[#252405]">{traitType}</td>
                                <td className="align-top break-words p-1.75 box-border text-xs cursor-pointer text-[#252405] border-2 border-[#252405]">{String(value)}</td>
                            </tr>
                            );
                        })
                        }
                    </tbody>
                    </table>
                </div>
            );
            })}
        </div>
    }
    </>
  );
}
