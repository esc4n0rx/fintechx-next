"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Home, Users, Briefcase, User, XCircle } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<{ nome: string; saldo_inicial: number; total_convite: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "convites" | "investimentos" | "conta">("home");
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const telefone = localStorage.getItem("user_phone");
      if (!telefone) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("fintechx_usuarios")
        .select("nome, saldo_inicial, total_convite")
        .eq("telefone", telefone)
        .single();

      if (error || !data) {
        window.location.href = "/login";
      } else {
        setUser(data);
      }
    }

    fetchUser();
  }, []);

  const profileImages = [
    "profile1.png", "profile2.png", "profile3.png", "profile4.png", "profile5.png"
  ];
  const randomProfile = profileImages[Math.floor(Math.random() * profileImages.length)];

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      {/* Popup do Telegram */}
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-sm text-center relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowPopup(false)}>
              <XCircle size={24} />
            </button>
            <h3 className="text-xl font-semibold">💬 Entre no Grupo do Telegram</h3>
            <p className="mt-2 text-gray-300">Fique por dentro das novidades e dicas exclusivas.</p>
            <a
              href="https://t.me/fintechxy"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              Acessar Grupo
            </a>
          </div>
        </div>
      )}

      <div className="w-full max-w-md p-6 bg-gray-800 text-white rounded-2xl shadow-lg border border-gray-700 flex flex-col justify-between h-full">
        
        {/* Seção Principal */}
        {activeTab === "home" && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3">
              <img src={`/profiles/${randomProfile}`} alt="Profile" className="w-12 h-12 rounded-full border border-gray-600" />
              <h2 className="text-2xl font-semibold">{user ? user.nome : "Carregando..."}</h2>
            </div>
            <p className="text-lg text-gray-300 mt-2">
              Saldo Inicial: <span className="text-green-400">R$ {user?.saldo_inicial.toFixed(2)}</span>
            </p>
            <p className="text-lg text-gray-300">
              Total de Convidados: <span className="text-blue-400">{user?.total_convite}</span>
            </p>

            {/* FAQ dentro de um Subcard */}
            <div className="mt-6 bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold mb-2 text-center">❓ Perguntas Frequentes</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>📌 Como funciona?</strong> A FintechX permite investir e convidar amigos para obter retornos.</p>
                <p><strong>💰 Como sacar meu saldo?</strong> Basta acessar sua conta e configurar sua chave Pix.</p>
                <p><strong>🎯 Como faço para investir?</strong> Acesse a aba de investimentos na navbar abaixo.</p>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Convites */}
        {activeTab === "convites" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Convites</h2>
            <p className="text-gray-400 mt-2">Gerencie seus convites e veja quem entrou usando seu código.</p>
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <p className="text-white">📢 Em breve, você poderá acompanhar seus convites aqui!</p>
            </div>
          </div>
        )}

        {/* Seção de Investimentos */}
        {activeTab === "investimentos" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Investimentos</h2>
            <p className="text-gray-400 mt-2">Veja oportunidades de investimento disponíveis.</p>
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <p className="text-white">📊 Em breve, detalhes sobre seus investimentos!</p>
            </div>
          </div>
        )}

        {/* Seção de Conta */}
        {activeTab === "conta" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Minha Conta</h2>
            <p className="text-gray-400 mt-2">Gerencie suas configurações pessoais.</p>
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <p className="text-white">⚙️ Configurações da conta estarão disponíveis em breve.</p>
            </div>
          </div>
        )}

        {/* Navbar Fixa na Base */}
        <nav className="flex justify-around bg-gray-900 p-3 rounded-lg mt-6 border border-gray-700">
          <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center ${activeTab === "home" ? "text-blue-400" : "text-white"}`}>
            <Home size={20} />
            <span className="text-xs">Início</span>
          </button>
          <button onClick={() => setActiveTab("convites")} className={`flex flex-col items-center ${activeTab === "convites" ? "text-blue-400" : "text-white"}`}>
            <Users size={20} />
            <span className="text-xs">Convites</span>
          </button>
          <button onClick={() => setActiveTab("investimentos")} className={`flex flex-col items-center ${activeTab === "investimentos" ? "text-blue-400" : "text-white"}`}>
            <Briefcase size={20} />
            <span className="text-xs">Investimentos</span>
          </button>
          <button onClick={() => setActiveTab("conta")} className={`flex flex-col items-center ${activeTab === "conta" ? "text-blue-400" : "text-white"}`}>
            <User size={20} />
            <span className="text-xs">Conta</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
