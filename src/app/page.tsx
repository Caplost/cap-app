"use client"

import { parseEther } from "viem";
import { Button,message } from "antd";

import { http , useReadContract , useWriteContract,useWatchContractEvent} from "wagmi"; 
import { Mainnet,WagmiWeb3ConfigProvider,MetaMask } from "@ant-design/web3-wagmi";
import { Address,NFTCard ,Connector,ConnectButton,useAccount} from "@ant-design/web3";
import { useEffect, useState } from 'react';
import { userAgent } from "next/server";

const CallWrite = () => {
  const {writeContract} = useWriteContract();

  return (
    <div>
      <Button onClick={() => writeContract({
        address: "0xEcd0D12E21805803f70de03B72B1C162dB0898d9",
        abi: [
          {
            type: "function",
            name: "mint",
            stateMutability: "payable",
            inputs: [{
              internalType: "uint256",
              name: "quantity",
              type: "uint256",
            }],
            outputs: [],
          }
        ],
        functionName: "mint",
        args: [BigInt(1)],
        value: parseEther("0.01"),
      })}>CallWrite</Button>
    </div>
  );

}

const CallTest = () => {
  const {account} = useAccount();
  const result = useReadContract({
    address: "0xEcd0D12E21805803f70de03B72B1C162dB0898d9",
    abi: [
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs:[{
          name:"account",
          type:"address",
        }],
        outputs:[{
          type:"uint256",
        }],
      }
    ],
    functionName: "balanceOf",
    args:[account?.address as `0x${string}`],
  });
  return (
    <div>{result.data?.toString()}</div>
  );
}

export default function Home() {
  const [hasMetaMask, setHasMetaMask] = useState<boolean>(false);

  useWatchContractEvent({
    address: "0xEcd0D12E21805803f70de03B72B1C162dB0898d9",
    abi: [
      {
        anonymous: false,
        type: "event",
        name: "Minted",
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "minter",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          }
        ]
      }
    ],
    eventName: "Minted",
    onLogs: (logs) => {
      message.success(`${logs[0].args.minter} minted ${logs[0].args.amount} tokens`);
    } 
  });

  useEffect(() => {
    // 检查是否存在 MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      const isMetaMask = window.ethereum.isMetaMask;
      setHasMetaMask(isMetaMask);
    }
  }, []);

  if (!hasMetaMask) {
    return (
      <div className="p-4">
        <p>请先安装 MetaMask 插件</p>
        <a 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          下载 MetaMask
        </a>
      </div>
    );
  }

  return (
    <WagmiWeb3ConfigProvider
      eip6963={{
        autoAddInjectedWallets: true,
      }}
      chains={[Mainnet]}
      transports={{
        [Mainnet.id]: http('https://api.zan.top/node/v1/eth/mainnet/d5a4aa8dfeb34838b1aef401ea2c5565'),
      }}
      wallets={[MetaMask()]}
    >
      <Address format address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9" />
      <NFTCard 
        address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9"
        tokenId={641}
      />
      <Connector>
        <ConnectButton />
      </Connector>
      <CallTest />
      <CallWrite />
    </WagmiWeb3ConfigProvider>
  )
}
