// app/api/monitor/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const telefone = searchParams.get("telefone");

    if (!telefone) {
      return NextResponse.json({ error: "Parâmetro 'telefone' obrigatório" }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabase
      .from("fintechx_usuarios")
      .select("codigo_convite_new")
      .eq("telefone", telefone)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const codigo_convite_new = userData.codigo_convite_new;

    const { data: invitesData, error: invitesError } = await supabase
      .from("fintechx_convites")
      .select("*")
      .eq("codigo_convite", codigo_convite_new);

    if (invitesError) {
      return NextResponse.json({ error: invitesError.message }, { status: 500 });
    }

    const invitesWithDepositStatus = await Promise.all(
      invitesData.map(async (invite: any) => {
        const { data: depositData, error: depositError } = await supabase
          .from("fintechx_deposits")
          .select("status")
          .eq("telefone", invite.telefone_convidado)
          .limit(1)
          .single();

        let deposited = false;
        if (!depositError && depositData && depositData.status === true) {
          deposited = true;
        }
        return { ...invite, deposited };
      })
    );

    return NextResponse.json({ invites: invitesWithDepositStatus }, { status: 200 });
  } catch (error) {
    console.error("Erro na API de monitoramento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
