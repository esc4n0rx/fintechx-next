"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/register");
  }, [router]);

  return null;
}

// Rota de Login
export function LoginPage() {
  const router = useRouter();

  const onSubmit = (data: any) => {
    console.log("Login realizado:", data);
    router.push("/dashboard");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md p-6 bg-gray-800 text-white rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <button onClick={() => router.push("/register")} className="text-blue-500 hover:underline">
          Criar uma conta
        </button>
      </div>
    </div>
  );
}

// Rota do Dashboard
export function DashboardPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4 text-white">
      <h2 className="text-2xl font-semibold">Bem-vindo ao Dashboard</h2>
    </div>
  );
}
