import React from "react";
import { auth } from "./firebase";

export default function App() {
  const handleLogin = async () => {
    try {
      await auth.signInAnonymously();
      alert("Logged in anonymously!");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center text-white">
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-amber-500 rounded-lg font-bold"
      >
        Login Anonymously
      </button>
    </div>
  );
}
