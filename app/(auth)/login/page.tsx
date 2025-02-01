"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Lock, Phone, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const onSubmit = async (data: any) => {
    setMessage(null);
    setLoading(true);

    // Buscar usuário no Supabase
    const { data: user, error } = await supabase
      .from("fintechx_usuarios")
      .select("telefone")
      .eq("telefone", data.phone)
      .eq("senha", data.password)
      .single();

    if (error || !user) {
      setMessage({ type: "error", text: "Credenciais inválidas. Verifique seus dados." });
      setLoading(false);
      return;
    }

    // Salvar telefone no Local Storage
    localStorage.setItem("user_phone", user.telefone);

    setMessage({ type: "success", text: "Login bem-sucedido! Redirecionando..." });

    setTimeout(() => router.push("/dashboard"), 1500);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md p-6 bg-gray-800 text-white rounded-2xl shadow-lg border border-gray-700">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Logo" className="w-16 h-16" />
          <h2 className="text-2xl font-semibold text-center mt-2">FintechX</h2>
        </div>

        {/* Notificação dentro do card */}
        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
              message.type === "error" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {message.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Telefone" type="tel" icon={<Phone size={18} />} {...register("phone", { required: true })} />
          <Input label="Senha" type="password" icon={<Lock size={18} />} {...register("password", { required: true })} />
          <Button type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Não tem uma conta?{" "}
            <button onClick={() => router.push("/register")} className="text-blue-500 hover:underline ml-1">
              Crie uma agora
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
