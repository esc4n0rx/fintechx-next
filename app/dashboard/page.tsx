"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import { Home, Users, Briefcase, User, XCircle, Copy } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<{
    nome: string;
    saldo_inicial: number;
    total_convite: number;
    codigo_convite_new?: string;
    codigo_convite_ini?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "convites" | "investimentos" | "conta">("home");
  const [showPopup, setShowPopup] = useState(true);
  const [invites, setInvites] = useState<any[]>([]);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transactionHistory, setTransactionHistory] = useState<
    Array<{ type: "deposit" | "withdrawal"; amount: number; date: string }>
  >([]);

  const [hasProducts, setHasProducts] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  async function fetchInvites(codigoConvite: string) {
    const { data, error } = await supabase
      .from("fintechx_convites")
      .select("*")
      .eq("codigo_convite", codigoConvite);
    if (!error && data) {
      const invitesWithStatus = await Promise.all(
        data.map(async (invite: any) => {
          const { data: depositData, error: depositError } = await supabase
            .from("fintechx_deposits")
            .select("status, bonus_creditado, saldo")
            .eq("telefone", invite.telefone_convidado)
            .limit(1)
            .single();
          return { ...invite, bonus_pago: (!depositError && depositData && depositData.status === true && depositData.bonus_creditado === true) };
        })
      );
      setInvites(invitesWithStatus);
    }
  }

  useEffect(() => {
    async function checkProducts() {
      const telefone = localStorage.getItem("user_phone");
      if (telefone) {
        const { data, error } = await supabase
          .from("fintechx_products")
          .select("id")
          .eq("telefone", telefone)
          .limit(1);
        if (data && data.length > 0) {
          setHasProducts(true);
        } else {
          setHasProducts(false);
        }
      }
    }
    checkProducts();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const telefone = localStorage.getItem("user_phone");
      if (telefone) {
        const { data, error } = await supabase
          .from("fintechx_products")
          .select("*")
          .eq("telefone", telefone);
        if (!error && data) {
          setProducts(data);
        }
      }
    }
    if (hasProducts) {
      fetchProducts();
    }
  }, [hasProducts]);

  useEffect(() => {
    async function fetchUser() {
      const telefone = localStorage.getItem("user_phone");
      if (!telefone) {
        window.location.href = "/login";
        return;
      }
      const { data, error } = await supabase
        .from("fintechx_usuarios")
        .select("nome, saldo_inicial, total_convite, codigo_convite_new, codigo_convite_ini")
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
    Swal.fire({
      title: "Link Copiado",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const profileImages = ["profile1.png"];
  const randomProfile = profileImages[Math.floor(Math.random() * profileImages.length)];

  const cryptocurrencies = [
    { name: "Bitcoin", logo: "/logos/btc.png", yield: 15, price: 70 },
    { name: "Ethereum", logo: "/logos/ethereum.png", yield: 25, price: 100 },
    { name: "Solana", logo: "/logos/sol.png", yield: 35, price: 120 },
    { name: "Litecoin", logo: "/logos/litecoin.png", yield: 45, price: 150 },
    { name: "Hedera", logo: "/logos/hedera.png", yield: 50, price: 200 },
    { name: "Polkadot", logo: "/logos/polkadot.png", yield: 65, price: 250 },
    { name: "Tron", logo: "/logos/tron.png", yield: 75, price: 300 },
    { name: "Dogecoin", logo: "/logos/doge.png", yield: 140, price: 340 },
    { name: "Monero", logo: "/logos/monero.png", yield: 170, price: 370 },
    { name: "Sui", logo: "/logos/sui.png", yield: 200, price: 400 },
  ];

  const cryptoMovements = cryptocurrencies.map((crypto) => {
    let change = 0;
    if (crypto.price >= 200) {
      change = parseFloat((Math.random() * 4 + 1).toFixed(2));
    } else {
      change = parseFloat((-Math.random() * 3).toFixed(2));
    }
    return { ...crypto, change };
  });

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

  const calculateNextPayment = (last_calculo: string) => {
    const last = new Date(last_calculo);
    const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
    return next.toLocaleString();
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Swal.fire({ title: "Erro", text: "Digite um valor válido", icon: "error" });
      return;
    }
    const userPhone = localStorage.getItem("user_phone");

    const { error: updateError } = await supabase
      .from("fintechx_usuarios")
      .update({ saldo_inicial: (user?.saldo_inicial || 0) + amount })
      .eq("telefone", userPhone);
    if (updateError) {
      Swal.fire({ title: "Erro", text: "Erro ao atualizar saldo no banco", icon: "error" });
      return;
    }

    const { error: depositError } = await supabase
      .from("fintechx_deposits")
      .insert([{ telefone: userPhone, status: true, saldo: amount, bonus_creditado: false }]);
    if (depositError) {
      Swal.fire({ title: "Erro", text: "Erro ao registrar depósito", icon: "error" });
      return;
    }

    if (user && user.codigo_convite_ini) {
      const inviterCode = user.codigo_convite_ini;
      const { data: inviterData, error: inviterError } = await supabase
        .from("fintechx_usuarios")
        .select("telefone, saldo_inicial")
        .eq("codigo_convite_new", inviterCode)
        .single();
      if (!inviterError && inviterData) {
        const bonus = amount * 0.37;
        const { error: bonusUpdateError } = await supabase
          .from("fintechx_usuarios")
          .update({ saldo_inicial: inviterData.saldo_inicial + bonus })
          .eq("telefone", inviterData.telefone);
        if (bonusUpdateError) {
          console.error("Erro ao atualizar bônus do convidador", bonusUpdateError);
        }

        const { error: bonusCreditError } = await supabase
          .from("fintechx_deposits")
          .update({ bonus_creditado: true })
          .eq("telefone", userPhone)
          .eq("bonus_creditado", false);
        if (bonusCreditError) {
          console.error("Erro ao marcar bônus creditado", bonusCreditError);
        }
      }
    }

    setUser((prevUser) =>
      prevUser ? { ...prevUser, saldo_inicial: prevUser.saldo_inicial + amount } : prevUser
    );
    setTransactionHistory((prev) => [
      { type: "deposit", amount, date: new Date().toLocaleString() },
      ...prev,
    ]);
    Swal.fire({ title: "Sucesso", text: "Depósito realizado!", icon: "success" });
    setDepositModalOpen(false);
    setDepositAmount("");
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Swal.fire({ title: "Erro", text: "Digite um valor válido", icon: "error" });
      return;
    }
    if (user && amount > user.saldo_inicial) {
      Swal.fire({ title: "Erro", text: "Saldo insuficiente", icon: "error" });
      return;
    }
    setUser((prevUser) =>
      prevUser ? { ...prevUser, saldo_inicial: prevUser.saldo_inicial - amount } : prevUser
    );
    setTransactionHistory((prev) => [
      { type: "withdrawal", amount, date: new Date().toLocaleString() },
      ...prev,
    ]);
    Swal.fire({ title: "Sucesso", text: "Saque realizado!", icon: "success" });
    setWithdrawModalOpen(false);
    setWithdrawAmount("");
  };

  const simulatedActivity = useMemo(() => {
    const names = [
      "Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda", "Gabriel", "Helena",
      "Isabela", "João", "Kevin", "Larissa", "Marcos", "Natália", "Otávio", "Patrícia",
      "Quirino", "Rafaela", "Samuel", "Tatiane", "Ulisses", "Valéria", "William", "Xavier",
      "Yasmin", "Zé", "Alessandra", "Breno", "Cristiane", "Diego", "Eliane", "Fábio",
      "Gustavo", "Heloísa", "Ícaro", "Jéssica", "Luciano", "Manuela", "Nelson", "Orlando",
      "Priscila", "Renato", "Sérgio", "Talita", "Ubirajara", "Vanessa", "Wellington",
      "Ximena", "Yuri", "Zilda"
    ];
    const activities = [];
    for (let i = 0; i < 30; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const action = Math.random() < 0.7 ? "comprou" : "sacou";
      if (action === "comprou") {
        const crypto = cryptocurrencies[Math.floor(Math.random() * cryptocurrencies.length)];
        activities.push({
          name,
          action,
          detail: `comprou ${crypto.name}`
        });
      } else {
        const amount = (Math.random() * 100 + 10).toFixed(2);
        activities.push({
          name,
          action,
          detail: `sacou R$ ${amount}`
        });
      }
    }
    return activities;
  }, [cryptocurrencies]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      {/* Modal de Depósito */}
      {depositModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-11/12 max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Depositar</h3>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full p-2 rounded mb-4 text-black"
              placeholder="Digite o valor"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setDepositModalOpen(false); setDepositAmount(""); }}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
              >
                Cancelar
              </button>
              <button onClick={handleDeposit} className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded">
                Depositar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Saque */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-11/12 max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Saque</h3>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full p-2 rounded mb-4 text-black"
              placeholder="Digite o valor"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setWithdrawModalOpen(false); setWithdrawAmount(""); }}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
              >
                Cancelar
              </button>
              <button onClick={handleWithdraw} className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded">
                Sacar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup do Telegram */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg text-white w-full max-w-sm text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setShowPopup(false)}
            >
              <XCircle size={24} />
            </button>
            <h3 className="text-xl sm:text-2xl font-semibold">💬 Entre no Grupo do Telegram</h3>
            <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-300">
              Fique por dentro das novidades e dicas exclusivas.
            </p>
            <a
              href="https://t.me/fintechxy"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 sm:mt-6 block bg-blue-600 hover:bg-blue-700 text-sm sm:text-base text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg"
            >
              Acessar Grupo
            </a>
          </div>
        </div>
      )}

      <div className="w-full max-w-full sm:max-w-xl p-4 sm:p-8 bg-gray-800 text-white rounded-2xl shadow-lg border border-gray-700 flex flex-col justify-between">
        {/* Seção Principal */}
        {activeTab === "home" && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              <img
                src={`/profiles/${randomProfile}`}
                alt="Profile"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-gray-600"
              />
              <h2 className="text-2xl sm:text-3xl font-semibold">{user ? user.nome : "Carregando..."}</h2>
            </div>
            <p className="text-base sm:text-xl text-gray-300 mt-2 sm:mt-4">
              Saldo Inicial: <span className="text-green-400">R$ {user?.saldo_inicial.toFixed(2)}</span>
            </p>
            <p className="text-base sm:text-xl text-gray-300">
              Total de Convites: <span className="text-blue-400">{user?.total_convite}</span>
            </p>
            {hasProducts ? (
              // Card de Gerenciamento de Ativos
              <div className="mt-4 sm:mt-8 bg-gray-700 p-4 sm:p-8 rounded-lg border border-gray-600">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center">Gerenciamento de Ativos</h3>
                {products.length > 0 ? (
                  products.map((prod: any, index: number) => (
                    <div key={index} className="border-b border-gray-600 py-2 text-sm sm:text-base">
                      <p><strong>Produto:</strong> {prod.product}</p>
                      <p><strong>Rendimento Diário:</strong> R$ {prod.rendimento.toFixed(2)}</p>
                      <p><strong>Próximo Pagamento:</strong> {calculateNextPayment(prod.last_calculo)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm sm:text-base text-gray-400">Nenhum produto registrado.</p>
                )}
              </div>
            ) : (
              <div className="mt-4 sm:mt-8 bg-gray-700 p-4 sm:p-8 rounded-lg border border-gray-600">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">❓ Perguntas Frequentes</h3>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-300">
                <p><strong>📌 Como funciona?</strong> Nossa IA opera day trade de criptomoedas automaticamente, gerando lucros.</p>
                <p><strong>💰 Como ganho dinheiro?</strong> Invista e receba uma parte dos lucros das operações.</p>
                <p><strong>🚀 O que nos diferencia?</strong> IA otimizada para máximo ganho com mínima intervenção.</p>
                <p><strong>🎯 Como começar?</strong> Escolha uma criptomoeda na aba de investimentos e configure seu investimento.</p>
                <p><strong>🏦 Como sacar?</strong> Cadastre sua chave Pix e transfira rapidamente.</p>
              </div>
            </div>
            )}
            <div className="mt-4 sm:mt-8 bg-gray-700 p-4 sm:p-8 rounded-lg border border-gray-600">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center">Atividade Recente</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto text-xs sm:text-sm">
                {simulatedActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-semibold">{activity.name}</span>
                    <span>{activity.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Seção de Convites */}
        {activeTab === "convites" && (
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold">Convites</h2>
            <p className="text-sm sm:text-base text-gray-400 mt-2">Convide amigos e ganhe 37% quando eles fizerem um depósito.</p>
            {/* Link de Convite */}
            <div className="mt-4 sm:mt-6 bg-gray-700 p-4 sm:p-8 rounded-lg">
              <p className="text-sm sm:text-base">Compartilhe este link:</p>
              <div className="flex items-center justify-center bg-gray-900 p-3 sm:p-4 rounded-lg mt-2">
                <span className="text-sm sm:text-base">{`https://fintechx-next.vercel.app/register?invite=${user?.codigo_convite_new}`}</span>
                <button onClick={() => copyToClipboard(`https://fintechx-next.vercel.app/register?invite=${user?.codigo_convite_new}`)}>
                  <Copy size={20} className="ml-2 sm:ml-3 text-blue-400" />
                </button>
              </div>
            </div>
            {/* Subcard de Convites */}
            <div className="mt-4 sm:mt-6 bg-gray-700 p-4 sm:p-8 rounded-lg border border-gray-600">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">📜 Convites Enviados</h3>
              {invites.length > 0 ? (
                invites.map((invite: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 sm:p-4 border-b border-gray-600 last:border-b-0 text-sm sm:text-base">
                    <span>{invite.telefone_convidado}</span>
                    <span className={invite.bonus_pago ? "text-green-400" : "text-yellow-400"}>
                      {invite.bonus_pago ? "Bônus Recebido" : "Aguardando Depósito"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm sm:text-base">Nenhum convite registrado.</p>
              )}
            </div>
          </div>
        )}

        {/* Seção de Investimentos */}
        {activeTab === "investimentos" && (
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold">Investimentos</h2>
            <p className="text-sm sm:text-base text-gray-400 mt-2">Confira abaixo um tutorial rápido e as oportunidades de investimento disponíveis.</p>
            {/* Card de Tutorial */}
            <div className="mt-4 sm:mt-6 bg-gray-700 p-4 sm:p-8 rounded-lg text-left">
              <p className="text-sm sm:text-base"><strong>1.</strong> Selecione uma criptomoeda na lista.</p>
              <p className="text-sm sm:text-base"><strong>2.</strong> Veja o rendimento diário e o preço unitário.</p>
              <p className="text-sm sm:text-base"><strong>3.</strong> Clique em "Comprar" para adquirir o produto.</p>
              <p className="text-sm sm:text-base"><strong>4.</strong> O rendimento será creditado a cada 24h (caso o produto esteja ativo).</p>
              <p className="text-sm sm:text-base"><strong>5.</strong> Cada produto tem validade de 7 dias.</p>
            </div>
            {/* Banner de Moedas em Alta/Queda */}
            <div className="mt-4 sm:mt-6 bg-gray-600 p-3 rounded-lg overflow-hidden">
              <div className="whitespace-nowrap animate-marquee flex space-x-4 sm:space-x-8">
                {cryptoMovements.map((crypto, index) => (
                  <div key={index} className="inline-flex items-center space-x-1 sm:space-x-2">
                    <img src={crypto.logo} alt={crypto.name} className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm font-medium">{crypto.name}</span>
                    <span className={`text-xs sm:text-sm font-medium ${crypto.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {crypto.change >= 0 ? `+${crypto.change}%` : `${crypto.change}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Lista de Criptomoedas */}
            <div className="mt-4 sm:mt-6 bg-gray-800 p-4 sm:p-8 rounded-lg border border-gray-700 overflow-y-auto max-h-64 sm:max-h-72">
              {cryptocurrencies.map((crypto, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 border-b border-gray-600 last:border-b-0">
                  <div className="flex items-center">
                    <img src={crypto.logo} alt={crypto.name} className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-4" />
                    <div>
                      <p className="text-sm sm:text-lg font-semibold">{crypto.name}</p>
                      <p className="text-xs sm:text-base text-gray-400">Rendimento: R$ {crypto.yield} / dia</p>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 text-right">
                    <p className="text-xs sm:text-base">Preço: R$ {crypto.price}</p>
                    <button onClick={() => comprarProduto(crypto)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-base text-white py-1 sm:py-2 px-3 sm:px-6 rounded">
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
            <h2 className="text-2xl sm:text-3xl font-semibold">Minha Conta</h2>
            <p className="text-sm sm:text-base text-gray-400 mt-2">Gerencie suas configurações pessoais.</p>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => setDepositModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm sm:text-base">
                Depositar
              </button>
              <button onClick={() => setWithdrawModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm sm:text-base">
                Sacar
              </button>
            </div>
            <div className="mt-4 sm:mt-6 bg-gray-700 p-4 sm:p-6 rounded-lg border border-gray-600 max-h-64 overflow-y-auto">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center">Histórico de Transações</h3>
              {transactionHistory.length > 0 ? (
                transactionHistory.map((tx, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-600 py-1 text-xs sm:text-sm">
                    <span>{tx.date}</span>
                    <span className={tx.type === "deposit" ? "text-green-400" : "text-red-400"}>
                      {tx.type === "deposit" ? `+ R$ ${tx.amount.toFixed(2)}` : `- R$ ${tx.amount.toFixed(2)}`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs sm:text-sm text-gray-400">Nenhuma transação registrada.</p>
              )}
            </div>
          </div>
        )}

        {/* Navbar */}
        <nav className="flex justify-around bg-gray-900 p-2 sm:p-4 rounded-lg mt-4 border border-gray-700">
          <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center ${activeTab === "home" ? "text-blue-400" : "text-white"}`}>
            <Home size={20} />
            <span className="text-xs sm:text-sm">Início</span>
          </button>
          <button onClick={() => setActiveTab("convites")} className={`flex flex-col items-center ${activeTab === "convites" ? "text-blue-400" : "text-white"}`}>
            <Users size={20} />
            <span className="text-xs sm:text-sm">Convites</span>
          </button>
          <button onClick={() => setActiveTab("investimentos")} className={`flex flex-col items-center ${activeTab === "investimentos" ? "text-blue-400" : "text-white"}`}>
            <Briefcase size={20} />
            <span className="text-xs sm:text-sm">Investimentos</span>
          </button>
          <button onClick={() => setActiveTab("conta")} className={`flex flex-col items-center ${activeTab === "conta" ? "text-blue-400" : "text-white"}`}>
            <User size={20} />
            <span className="text-xs sm:text-sm">Conta</span>
          </button>
        </nav>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
}