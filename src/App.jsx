import { WalletProvider } from "./context/WalletContext";
import WalletApp from "./components/WalletApp";

function App() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <WalletProvider>
        <WalletApp />
      </WalletProvider>
    </div>
  );
}

export default App;
