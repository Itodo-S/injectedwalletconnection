import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const useWallet = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const network = await web3Provider.getNetwork();
        setProvider(web3Provider);
        setSigner(web3Provider.getSigner());
        setAddress(accounts[0]);
        setNetwork(network);
        setIsConnected(true);
      } catch (err) {
        console.error(err);
        setError("Failed to connect to wallet");
      }
    } else {
      setError("No wallet found. Install MetaMask.");
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setNetwork(null);
    setIsConnected(false);
  }, []);

  // Handle account and network change
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAddress(accounts[0]);
      });

      window.ethereum.on("chainChanged", (chainId) => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  return {
    provider,
    signer,
    address,
    network,
    isConnected,
    connectWallet,
    disconnectWallet,
    error,
  };
};

export default useWallet;
