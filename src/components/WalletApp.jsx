import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";

const WalletApp = () => {
  const {
    connectWallet,
    disconnectWallet,
    address,
    network,
    isConnected,
    error,
  } = useWallet();

  const [inputAddress, setInputAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);

  // Fetch balance of the input address
  const getBalance = async () => {
    if (!inputAddress) {
      alert("Please enter an address.");
      return;
    }

    if (ethers && ethers.isAddress(inputAddress)) {
      try {
        setLoading(true);
        setBalanceError(null); // Reset any previous errors
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Check if the provider exists
        if (!provider) {
          alert("Ethereum provider not found. Connect a wallet.");
          setLoading(false);
          return;
        }

        const balance = await provider.getBalance(inputAddress);
        const formattedBalance = ethers.formatEther(balance);
        setBalance(formattedBalance);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setBalanceError("Failed to fetch balance.");
        setLoading(false);
      }
    } else {
      setBalanceError("Invalid Ethereum address.");
    }
  };

  // Autofill connected wallet's address and balance when wallet is connected
  useEffect(() => {
    if (address) {
      setInputAddress(address);
      getBalance();
    }
  }, [address]);

  // Auto-fetch balance when inputAddress changes
  useEffect(() => {
    if (inputAddress && ethers.isAddress(inputAddress)) {
      getBalance();
    }
  }, [inputAddress]);

  return (
    <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-4 bg-white min-w-[450px]">
      <h1 className="font-semibold text-xl mb-4">Wallet Connection</h1>

      {/* Wallet connection logic */}
      {!isConnected ? (
        <div className="w-full mb-3">
          <button onClick={connectWallet} className="w-full">
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col">
            <p className="font-semibold">
              Connected: <span className="text-gray-400">{address}</span>
            </p>
            <p className="font-semibold">
              Network: <span className="text-gray-400">{network?.name}</span>
            </p>
          </div>
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {/* Input to enter address */}
      <div className="flex flex-col w-full gap-3 mb-4">
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="Enter address"
          className="p-2 border rounded"
        />
        <button onClick={getBalance} className="p-2 bg-blue-500 text-white rounded">
          Get Balance
        </button>
      </div>

      {/* Display balance or errors */}
      {loading ? (
        <p>Loading balance...</p>
      ) : balance !== null ? (
        <p>Balance: {balance} ETH</p>
      ) : balanceError ? (
        <p className="text-red-500">{balanceError}</p>
      ) : null}
    </div>
  );
};

export default WalletApp;
