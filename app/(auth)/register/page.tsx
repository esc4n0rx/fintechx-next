"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Captcha } from "@/components/ui/Captcha";
import { Button } from "@/components/ui/Button";
import { Lock, Phone, User, Key, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue } = useForm();
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get("invite");
    if (inviteCode) {
      setValue("inviteCode", inviteCode);
    }
  }, [setValue]);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const onSubmit = async (data: any) => {
    setMessage(null);
  
    if (data.captcha !== captcha) {
      setMessage({ type: "error", text: "Captcha incorreto!" });
      return;
    }
  
    setLoading(true);
  
    const { data: existingUser, error: checkError } = await supabase
      .from("fintechx_usuarios")
      .select("telefone")
      .eq("telefone", data.phone)
      .single();
  
    if (existingUser) {
      setMessage({ type: "error", text: "Usuário já cadastrado! Faça login." });
      router.push("/login");
      setLoading(false);
      return;
    }
  
    if (checkError && checkError.code !== "PGRST116") {
      console.error("Erro ao verificar usuário:", checkError);
      setMessage({ type: "error", text: "Erro ao verificar usuário. Tente novamente." });
      setLoading(false);
      return;
    }
  
    const { error } = await supabase.from("fintechx_usuarios").insert([
      {
        nome: data.name,
        telefone: data.phone,
        senha: data.password,
        codigo_convite_ini: data.inviteCode || null,
        codigo_convite_new: crypto.randomUUID().slice(0, 8),
        saldo_inicial: 30.0,
        total_convite: 0,
        chave_pix: null,
        total_produtos: 0,
      },
    ]);
  
    if (error) {
      console.error("Erro ao registrar usuário:", error);
      setMessage({ type: "error", text: "Erro ao criar conta. Tente novamente." });
      setLoading(false);
      return;
    }
  

    if (data.inviteCode) {

      const { data: inviterData, error: fetchInviterError } = await supabase
        .from("fintechx_usuarios")
        .select("total_convite")
        .eq("codigo_convite_new", data.inviteCode)
        .single();
  
      if (!fetchInviterError && inviterData) {

        const newTotal = inviterData.total_convite + 1;
        const { error: updateError } = await supabase
          .from("fintechx_usuarios")
          .update({ total_convite: newTotal })
          .eq("codigo_convite_new", data.inviteCode);
        if (updateError) {
          console.error("Erro ao atualizar total de convites:", updateError);
        }
      } else {
        console.error("Usuário que gerou o convite não encontrado:", fetchInviterError);
      }
  
      const { error: insertInviteError } = await supabase
        .from("fintechx_convites")
        .insert([
          {
            codigo_convite: data.inviteCode,
            telefone_convidado: data.phone,
            bonus_pago: false,
          },
        ]);
      if (insertInviteError) {
        console.error("Erro ao inserir convite:", insertInviteError);
      }
    }
  
    setMessage({ type: "success", text: "Conta criada com sucesso! Redirecionando para login..." });
    setTimeout(() => router.push("/login"), 2000);
  };
  

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="w-full max-w-md p-6 bg-gray-800 text-white rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-center mb-6">Criar Conta</h2>

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
          <Input label="Nome" icon={<User size={18} />} {...register("name", { required: true })} />
          <Input label="Telefone" type="tel" icon={<Phone size={18} />} {...register("phone", { required: true })} />
          <Input label="Senha" type="password" icon={<Lock size={18} />} {...register("password", { required: true })} />
          <Input label="Código de Convite" icon={<Key size={18} />} {...register("inviteCode")} disabled />

          <Captcha value={captcha} onGenerate={() => setCaptcha(generateCaptcha())} />
          <Input label="Digite o Captcha" {...register("captcha", { required: true })} />

          <Button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Já tem uma conta?{" "}
            <button onClick={() => router.push("/login")} className="text-blue-500 hover:underline ml-1">
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
