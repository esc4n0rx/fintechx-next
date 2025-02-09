// app/api/products/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userPhone, productName, price, yieldPerDay } = await req.json();

    // 1. Validar se o usuário possui saldo suficiente
    const { data: userData, error: userError } = await supabase
      .from("fintechx_usuarios")
      .select("saldo_inicial")
      .eq("telefone", userPhone)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 400 }
      );
    }

    if (userData.saldo_inicial < price) {
      return NextResponse.json(
        { error: "Saldo insuficiente para realizar a compra" },
        { status: 400 }
      );
    }

    // 2. Deduzir o valor da compra do saldo do usuário
    const novoSaldo = Number(userData.saldo_inicial) - Number(price);
    const { error: updateError } = await supabase
      .from("fintechx_usuarios")
      .update({ saldo_inicial: novoSaldo })
      .eq("telefone", userPhone);

    if (updateError) {
      return NextResponse.json(
        { error: "Erro ao atualizar o saldo do usuário" },
        { status: 400 }
      );
    }

    // 3. Registrar a compra na tabela fintechx_products
    const agora = new Date();
    const validade = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 dias

    const { error: insertError } = await supabase
      .from("fintechx_products")
      .insert([
        {
          telefone: userPhone,
          product: productName,
          purchase_datetime: agora,
          rendimento: yieldPerDay,
          last_calculo: agora,
          valid_until: validade,
        },
      ]);

    if (insertError) {
      return NextResponse.json(
        { error: "Erro ao registrar a compra" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Compra realizada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na API /api/products:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
