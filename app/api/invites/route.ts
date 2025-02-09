import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Criar um novo convite
export async function POST(req: Request) {
  const { codigo_convite, telefone_convidado } = await req.json();

  const { data, error } = await supabase.from("fintechx_convites").insert([
    {
      codigo_convite,
      telefone_convidado,
      bonus_pago: false
    }
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Convite registrado!", data }, { status: 201 });
}

// Verificar convites de um usuário
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const codigo_convite = searchParams.get("codigo_convite");

  if (!codigo_convite) return NextResponse.json({ error: "Código de convite obrigatório" }, { status: 400 });

  const { data, error } = await supabase.from("fintechx_convites").select("*").eq("codigo_convite", codigo_convite);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ invites: data }, { status: 200 });
}
