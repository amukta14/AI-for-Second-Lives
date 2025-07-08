"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    // Local mock: any email/password is accepted
    localStorage.setItem("mockUser", JSON.stringify({ email }));
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0071CE]">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg flex flex-col items-center">
        {/* Walmart Logo */}
        <div className="mb-6 flex flex-col items-center">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#0071CE"/>
            <g fill="#FFC220">
              <circle cx="16" cy="7" r="2"/>
              <circle cx="16" cy="25" r="2"/>
              <circle cx="7" cy="16" r="2"/>
              <circle cx="25" cy="16" r="2"/>
              <circle cx="10.93" cy="10.93" r="2"/>
              <circle cx="21.07" cy="21.07" r="2"/>
              <circle cx="10.93" cy="21.07" r="2"/>
              <circle cx="21.07" cy="10.93" r="2"/>
            </g>
          </svg>
          <span className="font-bold text-3xl text-[#0071CE] mt-2 mb-1 tracking-tight">Walmart</span>
          <span className="text-lg text-gray-700 font-semibold">Sign {isLogin ? "In" : "Up"}</span>
        </div>
        <form onSubmit={handleAuth} className="space-y-4 w-full">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 p-3 rounded text-lg focus:outline-none focus:ring-2 focus:ring-[#0071CE]"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded text-lg focus:outline-none focus:ring-2 focus:ring-[#0071CE]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-[#0071CE] hover:bg-[#005fa3] text-white py-3 rounded font-bold text-lg transition-colors">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-700 text-base">
          {isLogin ? "Don't have an account?" : "Already have an account?"} {" "}
          <button className="text-[#FFC220] underline font-bold" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
} 