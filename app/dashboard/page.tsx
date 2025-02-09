"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { Home, Users, Briefcase, User, XCircle, Copy } from "lucide-react";

export default function DashboardPage() {

  const [user, setUser] = useState<{
    nome: string;
    saldo_inicial: number;
    total_convite: number;
    codigo_convite_new?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "convites" | "investimentos" | "conta">("home");
  const [showPopup, setShowPopup] = useState(true);
  const [invites, setInvites] = useState<any[]>([]);

  async function fetchInvites(codigoConvite: string) {
    const { data, error } = await supabase
      .from("fintechx_convites")
      .select("*")
      .eq("codigo_convite", codigoConvite);

    if (!error) setInvites(data || []);
  }

  useEffect(() => {
    async function fetchUser() {
      const telefone = localStorage.getItem("user_phone");
      if (!telefone) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("fintechx_usuarios")
        .select("nome, saldo_inicial, total_convite, codigo_convite_new")
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

  useEffect(() => {
    if (user?.codigo_convite_new) {
      fetchInvites(user.codigo_convite_new);
    }
  }, [user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copiado!");
  };

  const profileImages = [
    "profile1.png",
  ];
  const randomProfile = profileImages[Math.floor(Math.random() * profileImages.length)];

  const cryptocurrencies = [
    {
      name: "Bitcoin",
      logo: "/logos/btc.png",
      yield: 15,    
      price: 70,
    },
    {
      name: "Ethereum",
      logo: "/logos/ethereum.png",
      yield: 25,
      price: 100,
    },
    {
      name: "Solana",
      logo: "/logos/sol",
      yield: 35,
      price: 120,
    },
    {
      name: "Litecoin",
      logo: "/logos/litecoin.png",
      yield: 45,
      price: 150,
    },
    {
      name: "Hedera",
      logo: "/logos/hedera.png",
      yield: 50,
      price: 200,
    },
    {
      name: "Polkadot",
      logo: "/logos/polkadot.png",
      yield: 65,
      price: 250,
    },
    {
      name: "Tron",
      logo: "/logos/tron.png",
      yield: 75,
      price: 300,
    },
    {
      name: "Dogecoin",
      logo: "/logos/doge.png",
      yield: 140,
      price: 340,
    },
    {
      name: "Monero",
      logo: "/logos/monero.png",
      yield: 170,
      price: 370,
    },
    {
      name: "Sui",
      logo: "/logos/sui.png",
      yield: 200,
      price: 400,
    },
  ];

const comprarProduto = async (crypto: { name: string; price: number; yield: number }) => {
  if (!user) {
    Swal.fire({
      title: "Erro",
      text: "Usuário não autenticado.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }

  const userPhone = localStorage.getItem("user_phone");

  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userPhone,
      productName: crypto.name,
      price: crypto.price,
      yieldPerDay: crypto.yield,
    }),
  });

  const result = await response.json();

  if (response.ok) {
    setUser((prevUser) =>
      prevUser
        ? { ...prevUser, saldo_inicial: prevUser.saldo_inicial - crypto.price }
        : prevUser
    );
    Swal.fire({
      title: "Sucesso",
      text: result.message,
      icon: "success",
      confirmButtonText: "OK",
    });
  } else {
    Swal.fire({
      title: "Erro",
      text: result.error,
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};



  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      {/* Popup do Telegram */}
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-sm text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setShowPopup(false)}
            >
              <XCircle size={24} />
            </button>
            <h3 className="text-xl font-semibold">💬 Entre no Grupo do Telegram</h3>
            <p className="mt-2 text-gray-300">
              Fique por dentro das novidades e dicas exclusivas.
            </p>
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
              <img
                src={`/profiles/${randomProfile}`}
                alt="Profile"
                className="w-12 h-12 rounded-full border border-gray-600"
              />
              <h2 className="text-2xl font-semibold">{user ? user.nome : "Carregando..."}</h2>
            </div>
            <p className="text-lg text-gray-300 mt-2">
              Saldo Inicial:{" "}
              <span className="text-green-400">
                R$ {user?.saldo_inicial.toFixed(2)}
              </span>
            </p>
            <p className="text-lg text-gray-300">
              Total de Convidados:{" "}
              <span className="text-blue-400">{user?.total_convite}</span>
            </p>

            {/* FAQ dentro de um Subcard */}
            <div className="mt-6 bg-gray-700 p-4 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold mb-2 text-center">
                ❓ Perguntas Frequentes
              </h3>
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>📌 Como funciona?</strong> A FintechX permite investir e
                  convidar amigos para obter retornos.
                </p>
                <p>
                  <strong>💰 Como sacar meu saldo?</strong> Basta acessar sua conta
                  e configurar sua chave Pix.
                </p>
                <p>
                  <strong>🎯 Como faço para investir?</strong> Acesse a aba de
                  investimentos na navbar abaixo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Convites */}
        {activeTab === "convites" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Convites</h2>
            <p className="text-gray-400 mt-2">
              Convide amigos e ganhe 37% quando eles fizerem um depósito.
            </p>

            {/* Link de Convite */}
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <p className="text-sm">Compartilhe este link:</p>
              <div className="flex items-center justify-center bg-gray-900 p-2 rounded-lg mt-2">
                <span className="text-sm">
                  {`https://fintechx-next.vercel.app/register?invite=${user?.codigo_convite_new}`}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `https://fintechx-next.vercel.app/register?invite=${user?.codigo_convite_new}`
                    )
                  }
                >
                  <Copy size={18} className="ml-2 text-blue-400" />
                </button>
              </div>
            </div>

            {/* Subcard de Convites */}
            <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <h3 className="text-lg font-semibold mb-2 text-center">
                📜 Convites Enviados
              </h3>
              {invites.length > 0 ? (
                invites.map((invite: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border-b border-gray-600"
                  >
                    <span>{invite.telefone_convidado}</span>
                    <span
                      className={
                        invite.bonus_pago ? "text-green-400" : "text-yellow-400"
                      }
                    >
                      {invite.bonus_pago ? "Bônus Recebido" : "Aguardando Depósito"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Nenhum convite registrado.</p>
              )}
            </div>
          </div>
        )}

    {activeTab === "investimentos" && (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Investimentos</h2>
        <p className="text-gray-400 mt-2">
          Confira abaixo um tutorial rápido e as oportunidades de investimento disponíveis.
        </p>

        <div className="mt-4 p-4 bg-gray-700 rounded-lg text-left">
          <p><strong>1.</strong> Selecione uma criptomoeda na lista.</p>
          <p><strong>2.</strong> Veja o rendimento diário e o preço unitário.</p>
          <p><strong>3.</strong> Clique em "Comprar" para adquirir o produto.</p>
          <p><strong>4.</strong> O rendimento será creditado a cada 24h (caso o produto esteja ativo).</p>
          <p><strong>5.</strong> Cada produto tem validade de 7 dias.</p>
        </div>

              <div className="mt-6 h-64 overflow-y-auto p-4 bg-gray-800 rounded-lg border border-gray-700">
                {cryptocurrencies.map((crypto, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border-b border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <img
                        src={crypto.logo}
                        alt={crypto.name}
                        className="w-8 h-8 mr-2"
                      />
                      <div>
                        <p className="font-semibold">{crypto.name}</p>
                        <p className="text-sm text-gray-400">
                          Rendimento: R$ {crypto.yield} / dia
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Preço: R$ {crypto.price}</p>
                      <button
                        onClick={() => comprarProduto(crypto)}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


        {/* Seção de Conta */}
        {activeTab === "conta" && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Minha Conta</h2>
            <p className="text-gray-400 mt-2">
              Gerencie suas configurações pessoais.
            </p>
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <p className="text-white">
                ⚙️ Configurações da conta estarão disponíveis em breve.
              </p>
            </div>
          </div>
        )}

        {/* Navbar Fixa na Base */}
        <nav className="flex justify-around bg-gray-900 p-3 rounded-lg mt-6 border border-gray-700">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center ${
              activeTab === "home" ? "text-blue-400" : "text-white"
            }`}
          >
            <Home size={20} />
            <span className="text-xs">Início</span>
          </button>
          <button
            onClick={() => setActiveTab("convites")}
            className={`flex flex-col items-center ${
              activeTab === "convites" ? "text-blue-400" : "text-white"
            }`}
          >
            <Users size={20} />
            <span className="text-xs">Convites</span>
          </button>
          <button
            onClick={() => setActiveTab("investimentos")}
            className={`flex flex-col items-center ${
              activeTab === "investimentos" ? "text-blue-400" : "text-white"
            }`}
          >
            <Briefcase size={20} />
            <span className="text-xs">Investimentos</span>
          </button>
          <button
            onClick={() => setActiveTab("conta")}
            className={`flex flex-col items-center ${
              activeTab === "conta" ? "text-blue-400" : "text-white"
            }`}
          >
            <User size={20} />
            <span className="text-xs">Conta</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
