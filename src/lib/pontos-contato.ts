// Pontos de contato: as pills do mapa e do bento da página inicial, com os nomes da planilha e um ícone do Iconoir cada.
import * as Iconoir from "iconoir-react";

// nome do ícone no Iconoir (iconoir.com) → componente
export const icone = (nome: string) => (Iconoir as Record<string, any>)[nome];

// Um ícone por ponto de contato, com o MESMO nome da lista da planilha (aba "Pontos de contato", 25/11/2026). Ponto novo
// na planilha sem ícone aqui aparece sem ícone, até ganhar um.
export const CANAIS: Record<string, { icone: string; rotulo?: string }> = {
  "Site do museu": { icone: "Www" },
  "Redes sociais": { icone: "Instagram" },
  "Mídias e campanhas": { icone: "Megaphone" },
  "E-mail": { icone: "Mail" },
  "Telefone": { icone: "Phone" },
  "Formulário de agendamento": { icone: "Page" },
  "Recepção": { icone: "Desk" },
  "Material de apoio": { icone: "BookStack" },
  "Área de espera": { icone: "Sofa" },
  // uma pessoa, não o escudo: fala das pessoas da segurança
  "Vigilância": { icone: "User" },
  "Mediação": { icone: "UserBadgeCheck" },
  "Exposição": { icone: "Frame" },
  "Formulário de avaliação": { icone: "ClipboardCheck" }
};

const chave = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
export function pillCanal(canal: string): { rotulo: string; icone: string | null } {
  const achado = Object.entries(CANAIS).find(([k]) => chave(k) === chave(canal));
  return { rotulo: canal, icone: achado ? achado[1].icone : null };
}

// Arquivo (só o playground /dev/bento-contato lê): o que ficava fora e as sugestões de 19/11/2026. O site mostra só a planilha.
// o e-mail já cobre a newsletter
export const FORA = ["Newsletter"];

export const SUGESTOES: { canal: string; etapa: string; icone: string }[] = [
  { canal: "WhatsApp", etapa: "agendamento", icone: "ChatBubble" },
  { canal: "Agendamento on-line", etapa: "agendamento", icone: "CalendarCheck" },
  { canal: "Roteiro da visita", etapa: "preparacao", icone: "Page" },
  // o Google Maps, sem dizer a marca
  { canal: "Aplicativo de mapas", etapa: "preparacao", icone: "MapPin" },
  { canal: "Guarda-volumes", etapa: "recepcao", icone: "Archive" },
  { canal: "Sinalização", etapa: "mediacao", icone: "Map" },
  { canal: "Audioguia", etapa: "mediacao", icone: "Headset" },
  { canal: "Lanchonete", etapa: "mediacao", icone: "CoffeeCup" },
  { canal: "Loja do museu", etapa: "encerramento", icone: "Shop" },
  { canal: "Certificado de participação", etapa: "vinculo", icone: "Medal" },
  { canal: "Avaliações on-line", etapa: "vinculo", icone: "Star" }
];

// As pills da página inicial: os pontos de contato do mapa (os mesmos nomes), cada um uma vez, na ordem da jornada
// (pela primeira Etapa em que aparece). Sem sugestões fora da planilha (25/11/2026).
export function pillsContato(etapas: { id: string }[], pontos: { etapa: string; canal: string }[]) {
  const ordem = (id: string) => etapas.findIndex((e) => e.id === id);
  const vistos = [...new Set(pontos.map((p) => p.canal))];
  return vistos
    .map((canal) => ({ rotulo: canal, icone: pillCanal(canal).icone, ordem: Math.min(...pontos.filter((p) => p.canal === canal).map((p) => ordem(p.etapa))) }))
    .sort((a, b) => a.ordem - b.ordem);
}
