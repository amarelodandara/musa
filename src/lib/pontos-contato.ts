// Pills dos pontos de contato no bloco 3 do bento (conceito "marquee"), cada uma com um ícone do Iconoir.
// A lista é revisada no playground /dev/bento-contato.
// CANAIS: os canais que estão no mapa hoje (a coluna "canal" da planilha), um ícone para cada; rotulo = o nome na pill,
//   quando for diferente do da planilha.
// FORA: canais que estão na planilha mas não viram pill (decidido em 19/11/2026).
// SUGESTOES: pontos de contato que ainda não estão no mapa, com a etapa onde apareceriam (mantidos em 19/11/2026).
import * as Iconoir from "iconoir-react";

// nome do ícone no Iconoir (iconoir.com) → componente
export const icone = (nome: string) => (Iconoir as Record<string, any>)[nome];

export const CANAIS: Record<string, { icone: string; rotulo?: string }> = {
  "Site": { icone: "Www", rotulo: "Site do museu" },
  "Redes sociais": { icone: "Instagram" },
  "E-mail": { icone: "Mail" },
  "Telefone": { icone: "Phone" },
  "Recepção": { icone: "Desk" },
  // uma pessoa, não o escudo: fala das pessoas da segurança
  "Segurança": { icone: "User" },
  "Mediador": { icone: "UserBadgeCheck" },
  "Exposição": { icone: "Frame" },
  "Área de convivência": { icone: "Sofa", rotulo: "Área de espera" },
  "Material de apoio": { icone: "BookStack" },
  "Formulário de avaliação": { icone: "ClipboardCheck" }
};

// Pills dos pontos de contato no mapa (mesmo desenho das do bento): o ícone e o nome de CANAIS e, para canais da
// planilha que o bento não tem, os de CANAIS_SO_MAPA. Nomes comparados sem acento, caixa, hífen e espaço ("Email" = "E-mail").
export const CANAIS_SO_MAPA: Record<string, { icone: string; rotulo?: string }> = {
  "Mídias e campanhas": { icone: "Megaphone" },
  "Formulário": { icone: "Page" },
  "Atendimento presencial": { icone: "Desk" }
};
const chave = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
export function pillCanal(canal: string): { rotulo: string; icone: string | null } {
  const achado = Object.entries({ ...CANAIS, ...CANAIS_SO_MAPA }).find(([k]) => chave(k) === chave(canal));
  if (achado) return { rotulo: achado[1].rotulo ?? achado[0], icone: achado[1].icone };
  // equipes do museu ("Equipe de Mediação e Monitoria"): um grupo de pessoas
  if (chave(canal).startsWith("equipe")) return { rotulo: canal, icone: "Group" };
  return { rotulo: canal, icone: null };
}

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

// Todas as pills (as do mapa e as sugestões), na ordem da jornada: cada canal entra na primeira etapa em que aparece
export function pillsContato(etapas: { id: string }[], pontos: { etapa: string; canal: string }[]) {
  const ordem = (id: string) => etapas.findIndex((e) => e.id === id);
  const doMapa = Object.entries(CANAIS).map(([canal, c]) => ({
    rotulo: c.rotulo ?? canal, icone: c.icone,
    ordem: Math.min(...pontos.filter((p) => p.canal === canal).map((p) => ordem(p.etapa)), etapas.length)
  }));
  const novas = SUGESTOES.map((s) => ({ rotulo: s.canal, icone: s.icone, ordem: ordem(s.etapa) }));
  return [...doMapa, ...novas].sort((a, b) => a.ordem - b.ordem);
}
