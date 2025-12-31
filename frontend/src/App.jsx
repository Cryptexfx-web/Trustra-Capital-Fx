import React, { useState, useEffect, createContext, useContext, useMemo } from "react";
import { auth, db } from "./firebase";
import { signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { LineChart, Wallet, ArrowUpRight, PieChart, Target, Zap, LayoutDashboard, LogOut } from "lucide-react";

// --- AUTH CONTEXT ---
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setUserData(snap.data());
      else {
        const data = { balance: 1000, invested: 450, profit: 125, createdAt: serverTimestamp() };
        setDoc(ref, data);
        setUserData(data);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const logout = async () => await signOut(auth);
  const value = useMemo(() => ({ user, userData, loading, logout }), [user, userData, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// --- BUTTON & CARD ---
const Button = ({ children, onClick }) => (
  <button onClick={onClick} className="px-4 py-2 rounded bg-amber-500 text-black font-bold">{children}</button>
);

const Card = ({ children }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">{children}</div>
);

// --- DASHBOARD ---
const Dashboard = () => {
  const { userData, logout } = useAuth();
  const stats = [
    { label: "Balance", value: userData?.balance || 0, icon: Wallet },
    { label: "Invested", value: userData?.invested || 0, icon: PieChart },
    { label: "Profit", value: userData?.profit || 0, icon: ArrowUpRight }
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 p-6 bg-slate-900">
        <LineChart size={24} /> <span className="font-bold text-white">TrustraCapitalFx</span>
        <div className="mt-6 space-y-2">
          <button className="flex items-center gap-2" onClick={logout}><LogOut /> Sign Out</button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-slate-950 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {stats.map((s) => (
            <Card key={s.label}>
              <div className="flex justify-between">
                <div>
                  <p className="text-slate-400 text-xs">{s.label}</p>
                  <h2 className="text-xl font-bold">${s.value}</h2>
                </div>
                <s.icon size={24} />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

// --- APP ---
export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  return user ? <Dashboard /> : <Button onClick={() => signInAnonymously(auth)}>Login Anonymously</Button>;
}
