import { createContext, useReducer, useCallback, useContext, useEffect } from "react";
import { ethers } from "ethers";

// Initial state
const initialState = {
  provider: null,
  signer: null,
  address: null,
  network: null,
  isConnected: false,
  error: null,
};

// Reducer function
const walletReducer = (state, action) => {
  switch (action.type) {
    case "CONNECT_WALLET":
      return {
        ...state,
        provider: action.payload.provider,
        signer: action.payload.signer,
        address: action.payload.address,
        network: action.payload.network,
        isConnected: true,
        error: null,
      };
    case "DISCONNECT_WALLET":
      return {
        ...state,
        provider: null,
        signer: null,
        address: null,
        network: null,
        isConnected: false,
        error: null,
      };
    case "UPDATE_ADDRESS":
      return {
        ...state,
        address: action.payload,
      };
    case "UPDATE_NETWORK":
      return {
        ...state,
        network: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const WalletContext = createContext();

// WalletProvider component with useReducer
export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const network = await web3Provider.getNetwork();

        dispatch({
          type: "CONNECT_WALLET",
          payload: {
            provider: web3Provider,
            signer: web3Provider.getSigner(),
            address: accounts[0],
            network: network,
          },
        });
      } catch (err) {
        console.error(err);
        dispatch({ type: "SET_ERROR", payload: "Failed to connect to wallet" });
      }
    } else {
      dispatch({ type: "SET_ERROR", payload: "No wallet found. Install MetaMask." });
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    dispatch({ type: "DISCONNECT_WALLET" });
  }, []);

  // Handle account and network change
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        // Update the address state on account change
        if (accounts.length > 0) {
          dispatch({
            type: "UPDATE_ADDRESS",
            payload: accounts[0],
          });
        } else {
          // If no accounts are available, disconnect the wallet
          disconnectWallet();
        }
      });

      window.ethereum.on("chainChanged", async () => {
        // Update the network state on chain change without reloading
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const network = await web3Provider.getNetwork();

        dispatch({
          type: "UPDATE_NETWORK",
          payload: network,
        });
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, [disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = () => {
  return useContext(WalletContext);
};
