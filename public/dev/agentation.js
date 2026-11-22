// Agentation (anotações visuais para o agente) só no servidor local. Nunca carrega no site publicado.
// React e o Agentation vêm do esm.sh (o Vite reescreveria os imports de React do node_modules).
// Nem nas folhas de impressão (?impressao=, de onde saem os PDFs e as prévias) nem no mapa dentro de quadros (?vitrine).
if (["127.0.0.1", "localhost", "[::1]"].includes(location.hostname) && !["impressao", "vitrine"].some((k) => new URLSearchParams(location.search).has(k))) {
  // o react-dom do esm.sh lê process.env.NODE_ENV, que não existe no navegador
  globalThis.process ??= { env: { NODE_ENV: "development" } };
  const [{ createElement }, { createRoot }, { Agentation }] = await Promise.all([
    import("react"), import("react-dom/client"), import("agentation")
  ]);
  const host = document.createElement("div");
  host.id = "agentation-root";
  document.body.appendChild(host);
  // endpoint: servidor local do agentation-mcp (npx agentation-mcp server), de onde o Claude lê as notas
  createRoot(host).render(createElement(Agentation, { endpoint: "http://localhost:4747" }));
}
