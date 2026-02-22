import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthState {
  walletAddress: string | null;
  isVerified: boolean;
  verificationLevel: "orb" | "device" | null;
  nullifierHash: string | null;
}

interface AuthContextType extends AuthState {
  connectWallet: () => void;
  disconnectWallet: () => void;
  setVerified: (proof: { level: "orb" | "device"; nullifierHash: string }) => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const generateAddress = () => {
  const hex = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * 16)];
  return addr;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    walletAddress: null,
    isVerified: false,
    verificationLevel: null,
    nullifierHash: null,
  });
  const [isModalOpen, setModalOpen] = useState(false);

  const connectWallet = useCallback(() => {
    setState((s) => ({ ...s, walletAddress: generateAddress() }));
  }, []);

  const disconnectWallet = useCallback(() => {
    setState({ walletAddress: null, isVerified: false, verificationLevel: null, nullifierHash: null });
  }, []);

  const setVerified = useCallback((proof: { level: "orb" | "device"; nullifierHash: string }) => {
    setState((s) => ({
      ...s,
      isVerified: true,
      verificationLevel: proof.level,
      nullifierHash: proof.nullifierHash,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, connectWallet, disconnectWallet, setVerified, isModalOpen, setModalOpen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
