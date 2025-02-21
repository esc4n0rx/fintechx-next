// app/api/webhook/abacate-pay/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicialize o cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    // 1. Extrair payload do webhook
    const payload = await req.json();
    console.log("Webhook recebido do Abacate Pay:", payload);

    // 2. Verificar assinatura (opcional)
    // const signature = req.headers.get("x-abacate-signature");
    // if (!verifySignature(payload, signature)) { ... }

    // 3. Verificar se é um evento de pagamento confirmado
    if (payload.event === "payment.confirmed" || payload.event === "billing.paid") {
      // 4. Extrair dados importantes
      const billingId = payload.data.id;
      const externalId = payload.data.products[0]?.externalId;
      const amount = payload.data.amount / 100; // Converte de centavos para reais
      
      if (!externalId) {
        console.error("ExternalId não encontrado no payload", payload);
        return NextResponse.json({ error: "ExternalId não encontrado" }, { status: 400 });
      }
      
      // 5. Extrair telefone do usuário do externalId (formato: telefone-timestamp)
      const userPhone = externalId.split('-')[0];
      
      // 6. Obter dados do usuário
      const { data: userData, error: userError } = await supabase
        .from("fintechx_usuarios")
        .select("saldo_inicial, codigo_convite_ini")
        .eq("telefone", userPhone)
        .single();
        
      if (userError) {
        console.error("Erro ao buscar usuário:", userError);
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
      }
      
      // 7. Verificar se o pagamento já foi processado
      const { data: existingDeposit } = await supabase
        .from("fintechx_deposits")
        .select("id")
        .eq("referencia_externa", billingId)
        .single();
        
      if (existingDeposit) {
        console.log(`Pagamento ${billingId} já processado anteriormente`);
        return NextResponse.json({ status: "already_processed" }, { status: 200 });
      }
      
      // 8. Atualizar saldo do usuário
      const { error: updateError } = await supabase
        .from("fintechx_usuarios")
        .update({ saldo_inicial: (userData?.saldo_inicial || 0) + amount })
        .eq("telefone", userPhone);
        
      if (updateError) {
        console.error("Erro ao atualizar saldo:", updateError);
        return NextResponse.json({ error: "Falha ao atualizar saldo" }, { status: 500 });
      }
      
      // 9. Registrar depósito
      const { error: depositError } = await supabase
        .from("fintechx_deposits")
        .insert([{ 
          telefone: userPhone, 
          status: true, 
          saldo: amount, 
          bonus_creditado: false,
          metodo_pagamento: "abacate_pay",
          referencia_externa: billingId
        }]);
        
      if (depositError) {
        console.error("Erro ao registrar depósito:", depositError);
        return NextResponse.json({ error: "Falha ao registrar depósito" }, { status: 500 });
      }
      
      // 10. Processar bônus para o convidador (se aplicável)
      if (userData?.codigo_convite_ini) {
        const inviterCode = userData.codigo_convite_ini;
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
          } else {
            // Marcar que o bônus foi creditado
            const { error: bonusCreditError } = await supabase
              .from("fintechx_deposits")
              .update({ bonus_creditado: true })
              .eq("telefone", userPhone)
              .eq("referencia_externa", billingId);
              
            if (bonusCreditError) {
              console.error("Erro ao marcar bônus creditado", bonusCreditError);
            }
          }
        }
      }
      
      console.log(`Pagamento processado com sucesso. Usuário: ${userPhone}, Valor: R$${amount}`);
      return NextResponse.json({ success: true }, { status: 200 });
    }
    
    // Outros eventos que não são de pagamento confirmado
    return NextResponse.json({ status: "ignored" }, { status: 200 });
    
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}