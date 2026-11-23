// Todo HTML do site passa por aqui (em dev e no build estático) para o nome da marca sair sempre "musà".
// Regra em src/lib/nome.ts.
import { defineMiddleware } from "astro:middleware";
import { grafarMusa } from "./lib/nome";

export const onRequest = defineMiddleware(async (_contexto, seguir) => {
  const resposta = await seguir();
  if (!resposta.headers.get("content-type")?.includes("text/html")) return resposta;
  const html = await resposta.text();
  const cabecalhos = new Headers(resposta.headers);
  cabecalhos.delete("content-length"); // o texto pode mudar de tamanho
  return new Response(grafarMusa(html), { status: resposta.status, statusText: resposta.statusText, headers: cabecalhos });
});
