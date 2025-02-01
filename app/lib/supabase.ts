import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);


export async function createUser(userData: {
  nome: string;
  telefone: string;
  senha: string;
  codigo_convite_ini?: string;
  codigo_convite_new?: string;
  saldo_inicial?: number;
  total_convite?: number;
  chave_pix?: string;
  total_produtos?: number;
}) {
  const { data, error } = await supabase.from("fintechx_usuarios").insert([userData]);
  if (error) throw error;
  return data;
}

export async function getUserByPhone(telefone: string, senha: string) {
  const { data, error } = await supabase
    .from("fintechx_usuarios")
    .select("*")
    .eq("telefone", telefone)
    .eq("senha", senha)
    .single();
  if (error) return null;
  return data;
}

export async function getAllUsers() {
  const { data, error } = await supabase.from("fintechx_usuarios").select("*");
  if (error) throw error;
  return data;
}
