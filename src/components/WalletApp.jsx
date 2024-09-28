import { useState, useEffect } from "react";
import useWallet from "../hooks/useWallet";
import { ethers } from "ethers";

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

  // Fetch balance of the input address
  const getBalance = async () => {
    if (!inputAddress) {
      alert("Please enter an address.");
      return;
    }

    if (ethers && ethers.isAddress(inputAddress)) {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(inputAddress);
        const formattedBalance = ethers.formatEther(balance);
        setBalance(formattedBalance);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    } else {
      alert("Invalid address");
    }
  };

  // When the user connects, autofill their wallet balance
  useEffect(() => {
    if (address) {
      setInputAddress(address);
      getBalance();
    }
  }, [address]);

  return (
    <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-4 bg-white min-w-[450px]">
      <h1 className="font-semibold text-xl mb-4">Wallet Connection</h1>
      {!isConnected ? (
        <div className="w-full mb-3">
          <button onClick={connectWallet} className="w-full">Connect Wallet</button>
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

      {error && <p className="error">{error}</p>}

      {/* Input to enter address */}
      <div className="flex flex-col w-full gap-3 mb-4">
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="Enter address"
        />
        <button onClick={getBalance}>Get Balance</button>
      </div>

      {/* Display balance */}
      {loading ? (
        <p>Loading balance...</p>
      ) : balance !== null ? (
        <p>Balance: {balance} ETH</p>
      ) : null}
    </div>
  );
};

export default WalletApp;
