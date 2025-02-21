// app/api/payment/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Iniciando requisição de pagamento...");
    const {
      amount,         // Valor do depósito em BRL (ex: 50.00)
      externalId,     // Um ID único do seu sistema para o produto/depósito
      productName,    // Nome do produto, por exemplo, "Depósito FintechX"
      description,    // Descrição do produto/deposito
      returnUrl,      // URL para redirecionar o cliente se ele clicar em "Voltar"
      completionUrl,  // URL para redirecionar o cliente quando o pagamento for concluído
      customer        // (Opcional) Dados do cliente para cadastro
    } = await req.json();

    console.log("Dados recebidos:", { amount, externalId, productName, returnUrl, completionUrl, customer });

    // Define valores padrão para returnUrl e completionUrl se estiverem vazios
    const defaultUrl = "http://localhost:3000/dashboard";
    const effectiveReturnUrl = returnUrl && returnUrl.trim() !== "" ? returnUrl : defaultUrl;
    const effectiveCompletionUrl = completionUrl && completionUrl.trim() !== "" ? completionUrl : defaultUrl;

    // Validação dos campos obrigatórios
    if (!amount || !externalId || !productName || !effectiveReturnUrl || !effectiveCompletionUrl) {
      console.error("Erro: Campos obrigatórios ausentes", {
        amount,
        externalId,
        productName,
        effectiveReturnUrl,
        effectiveCompletionUrl,
      });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Define um objeto customer base com dados fictícios, se não enviados ou incompletos
    let customerObj = customer || {
      name: "Paulo Nathan da Cunha",
      cellphone: "34984330930",
      email: "paulo_dacunha@solarisbrasil.com.br",
      taxId: "20760198470"
    };

    if (!customerObj.name) customerObj.name = "Paulo Nathan da Cunha";
    if (!customerObj.cellphone) customerObj.cellphone = "34984330930";
    if (!customerObj.email) customerObj.email = "paulo_dacunha@solarisbrasil.com.br";
    if (!customerObj.taxId) customerObj.taxId = "20760198470";

    const body = {
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          externalId: externalId,
          name: productName,
          description: description || "",
          quantity: 1,
          price: Math.max(Math.round(amount * 100), 100) // preço em centavos, mínimo 100
        }
      ],
      returnUrl: effectiveReturnUrl,
      completionUrl: effectiveCompletionUrl,
      customer: customerObj
    };

    console.log("Corpo da requisição para Abacate Pay:", body);
    console.log("Verificando API Key:", process.env.ABACATE_PAY_API_KEY ? "existe" : "faltando");

    const abacatePayResponse = await fetch("https://api.abacatepay.com/v1/billing/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ABACATE_PAY_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const result = await abacatePayResponse.json();
    console.log("Resposta do Abacate Pay:", result);

    if (!abacatePayResponse.ok) {
      console.error("Erro na resposta da Abacate Pay:", result);
      return NextResponse.json({ error: result }, { status: abacatePayResponse.status });
    }
    console.log("Cobrança criada com sucesso.");
    return NextResponse.json({ billing: result.data }, { status: 200 });
  } catch (error) {
    console.error("Erro na API de pagamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
