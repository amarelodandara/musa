// Conteúdo do mapa. Edite aqui, sem tocar na interface.
// Cada item tem uma origem:
//   F(texto, ref) = paráfrase direta da fonte citada
//   A(texto, ref) = adaptação nossa a partir da fonte citada
//   H(texto)      = hipótese de rascunho, sem base documental; validar em campo
const F = (t, r) => ({ t, o: "fonte", r });
const A = (t, r) => ({ t, o: "adaptada", r });
const H = (t) => ({ t, o: "hipotese" });

window.FONTES = {
  M1: "IBRAM. Plano Museológico: planejamento estratégico para os museus. Módulo 1.",
  M2: "IBRAM. Plano Museológico. Módulo 2: caracterização, planejamento conceitual, diagnóstico e objetivos.",
  M3: "IBRAM. Plano Museológico. Módulo 3: elaboração dos programas.",
  M4: "IBRAM. Plano Museológico. Módulo 4: elaboração de projetos.",
  PNEM: "IBRAM. Política Nacional de Educação Museal (Resolução Normativa nº 40/2025).",
};

window.FASES = [
  { id: "antes", nome: "Antes da visita" },
  { id: "durante", nome: "Durante a visita" },
  { id: "depois", nome: "Depois da visita" },
];

window.ETAPAS = [
  { id: "descobrir", fase: "antes", nome: "Descobrir o museu" },
  { id: "decidir", fase: "antes", nome: "Decidir pela visita" },
  { id: "agendar", fase: "antes", nome: "Agendar" },
  { id: "preparar", fase: "antes", nome: "Preparar a visita" },
  { id: "chegar", fase: "durante", nome: "Chegar e ser recebido" },
  { id: "visitar", fase: "durante", nome: "Percorrer a exposição" },
  { id: "pausar", fase: "durante", nome: "Fazer uma pausa" },
  { id: "encerrar", fase: "durante", nome: "Encerrar e sair" },
  { id: "retomar", fase: "depois", nome: "Retomar na escola" },
  { id: "avaliar", fase: "depois", nome: "Dar e receber retorno" },
  { id: "voltar", fase: "depois", nome: "Voltar ao museu" },
];

window.GRUPOS = [
  { id: "escola", nome: "Escola", nota: "Quem vive a visita. Descrição provisória, a checar em campo." },
  { id: "frente", nome: "Linha de frente", nota: "O que a escola vê do museu.", linha: "Linha de interação" },
  { id: "bastidores", nome: "Bastidores", nota: "O que a escola não vê, mas sente.", linha: "Linha de visibilidade" },
];

// Linhas são funções, não cargos: em museus pequenos, uma pessoa pode ocupar várias.
window.LINHAS = [
  { id: "professor", grupo: "escola", nome: "Professor(a)" },
  { id: "estudantes", grupo: "escola", nome: "Estudantes" },
  { id: "comunicacao", grupo: "frente", nome: "Comunicação" },
  { id: "atendimento", grupo: "frente", nome: "Atendimento e vigilância" },
  { id: "mediacao", grupo: "frente", nome: "Mediação" },
  { id: "espaco", grupo: "frente", nome: "Espaço e exposição" },
  { id: "coordenacao", grupo: "bastidores", nome: "Coordenação do educativo" },
  { id: "gestao", grupo: "bastidores", nome: "Gestão" },
];

// Linhas da escola: descrevem o percurso, não trazem recomendação.
window.PERCURSO = {
  professor: {
    descobrir: "Procura opções de passeio para a turma.",
    decidir: "Avalia se o museu faz sentido e se a escola consegue ir; pede aprovação.",
    agendar: "Tenta marcar data, horário e tamanho do grupo.",
    preparar: "Organiza transporte e autorizações; conversa com a turma.",
    chegar: "Conduz e conta o grupo; procura quem vai recebê-lo.",
    visitar: "Acompanha a turma e ajuda a manter o grupo junto.",
    pausar: "Administra banheiro, água e lanche.",
    encerrar: "Reúne o grupo e cuida do horário de volta.",
    retomar: "Retoma ou não a visita em sala.",
    avaliar: "Conta ou não ao museu como foi.",
    voltar: "Decide se repete a visita com outra turma.",
  },
  estudantes: {
    descobrir: "Em geral, ainda não sabem do museu.",
    decidir: "Podem ou não ser ouvidos sobre o passeio.",
    preparar: "Levam a autorização para casa e criam expectativas.",
    chegar: "Entram em um lugar que talvez nunca tenham visitado.",
    visitar: "Olham, perguntam, conversam, se cansam.",
    pausar: "Comem, descansam, vão ao banheiro.",
    encerrar: "Saem com uma impressão do que é um museu.",
    retomar: "Contam o que viram, em sala e em casa.",
    avaliar: "Raramente são perguntados.",
    voltar: "Podem voltar por conta própria, com a família, ou nunca mais.",
  },
};

// Células: linha > etapa > { ajuda: [...], atrapalha: [...] }
window.CELULAS = {
  comunicacao: {
    descobrir: {
      ajuda: [
        A("Reservar nos canais do museu um espaço só para as atividades educativas.", "M3 p.46"),
        A("Divulgar diretamente para escolas e professores.", "M1 p.12; M3 p.46"),
      ],
      atrapalha: [
        A("Depender de um único canal e esperar que a escola o encontre.", "M3 p.105"),
        H("Anunciar só as exposições novas, sem dizer que o museu recebe escolas."),
      ],
    },
    decidir: {
      ajuda: [
        H("Publicar o essencial para decidir: faixa etária, duração, custo e capacidade."),
        A("Informar as condições de acessibilidade em formatos também acessíveis.", "M3 p.105"),
      ],
      atrapalha: [H("Obrigar a escola a telefonar para descobrir o básico.")],
    },
    agendar: {
      ajuda: [H("Deixar claro como, com quem e com que antecedência marcar.")],
      atrapalha: [H("Manter regras e contatos diferentes em cada canal.")],
    },
    preparar: {
      ajuda: [A("Oferecer materiais para a escola usar antes da visita.", "M3 p.49")],
      atrapalha: [H("Enviar apenas regras de conduta, sem nada sobre o que será vivido.")],
    },
    retomar: {
      ajuda: [A("Disponibilizar materiais para continuar o assunto em sala.", "M3 p.49")],
    },
    voltar: {
      ajuda: [
        A("Manter uma lista de contatos para avisar professores sobre novas atividades.", "M3 p.82"),
        H("Convidar estudantes e famílias a voltar por conta própria."),
      ],
      atrapalha: [H("Falar com a escola só quando ela procura o museu de novo.")],
    },
  },
  atendimento: {
    agendar: {
      ajuda: [
        A("Tratar o agendamento como parte do serviço, mesmo fora do planejamento estratégico.", "M3 p.5"),
        H("Responder dentro do prazo de que a escola precisa para se organizar."),
      ],
      atrapalha: [
        H("Confirmar a visita sem perguntar idade, tamanho do grupo e necessidades de acesso."),
        H("Aceitar grupos acima do que a equipe consegue receber."),
      ],
    },
    preparar: {
      ajuda: [H("Reconfirmar os dados da visita poucos dias antes.")],
      atrapalha: [H("Mudar horário ou mediador sem avisar.")],
    },
    chegar: {
      ajuda: [
        A("Receber o grupo como início da experiência: a educação começa já na entrada.", "M3 p.41"),
        A("Indicar um local sinalizado de embarque e desembarque perto da portaria.", "M3 p.105"),
      ],
      atrapalha: [H("Deixar a turma esperando do lado de fora, sem orientação.")],
    },
    visitar: {
      ajuda: [A("Sensibilizar e treinar toda a equipe em condutas inclusivas, inclusive quem vigia.", "M3 p.105")],
      atrapalha: [H("Vigiar os estudantes como risco, em vez de combinar a conduta com a mediação.")],
    },
    pausar: {
      ajuda: [
        H("Indicar onde comer, guardar mochilas e ir ao banheiro."),
        A("Garantir sanitários acessíveis e em rota acessível.", "M3 p.105"),
      ],
      atrapalha: [H("Não prever lugar nenhum para o lanche do grupo.")],
    },
    encerrar: {
      ajuda: [H("Despedir o grupo e dizer como voltar ao museu.")],
      atrapalha: [H("Apressar a saída para receber a próxima turma.")],
    },
  },
  mediacao: {
    preparar: {
      ajuda: [
        F("Planejar com o professor o antes, o durante e o depois da visita.", "M3 p.43"),
        H("Perguntar o que a turma já estudou e o que espera."),
      ],
      atrapalha: [A("Definir toda a visita sem ouvir o professor.", "M3 p.43")],
    },
    chegar: {
      ajuda: [H("Apresentar-se e combinar com a turma o que vai acontecer.")],
      atrapalha: [H("Começar a visita por uma lista de proibições.")],
    },
    visitar: {
      ajuda: [
        F("Mediar pelo diálogo, partindo do que o público também sabe.", "M3 p.50-51"),
        F("Garantir algum momento em que os estudantes escolham percurso e tempo.", "M3 p.43"),
        A("Adaptar atividades e ferramentas a cada turma.", "M3 p.49"),
      ],
      atrapalha: [
        F("Recitar um roteiro decorado, supondo um público que não sabe.", "M3 p.50"),
        F("Repetir a escola: testes, avaliações e exposição linear de conteúdo.", "M3 p.43"),
        F("Contar com a ferramenta, como jogo ou aplicativo, para garantir o caráter educativo.", "M3 p.49"),
      ],
    },
    pausar: {
      ajuda: [H("Prever pausas na duração da visita.")],
      atrapalha: [H("Ocupar todo o tempo até esgotar a atenção da turma.")],
    },
    encerrar: {
      ajuda: [H("Reservar alguns minutos para a turma dizer o que leva da visita.")],
      atrapalha: [H("Terminar porque o tempo acabou, sem nenhum fechamento.")],
    },
    retomar: {
      ajuda: [A("Sugerir ao professor caminhos para retomar a visita em sala.", "M3 p.43")],
      atrapalha: [H("Considerar que o trabalho termina na saída do museu.")],
    },
    avaliar: {
      ajuda: [A("Registrar, a cada visita, o que funcionou e o que não funcionou.", "M3 p.46-47")],
    },
  },
  espaco: {
    chegar: {
      ajuda: [A("Tornar o acesso legível e livre de barreiras: rampas, sinalização e piso tátil.", "M3 p.105")],
    },
    visitar: {
      ajuda: [
        A("Oferecer recursos para públicos diversos: pessoas com deficiência, não alfabetizadas, crianças.", "M3 p.36"),
        A("Considerar a circulação de grupos ao planejar circuito e fluxo.", "M3 p.37"),
      ],
      atrapalha: [A("Deixar exposição e recursos expositivos sem manutenção periódica.", "M3 p.35-36")],
    },
    pausar: {
      ajuda: [
        A("Manter bebedouros e mobiliário acessíveis.", "M3 p.105"),
        H("Ter onde o grupo possa sentar e descansar."),
      ],
    },
  },
  coordenacao: {
    descobrir: {
      ajuda: [A("Mapear quais escolas e faixas etárias vêm e quais não vêm.", "M2 p.9")],
      atrapalha: [A("Avaliar os públicos só pela impressão do dia a dia, sem dados.", "M2 p.10")],
    },
    decidir: {
      ajuda: [A("Investigar o que as escolas do entorno buscam e como podem se associar ao museu.", "M2 p.9")],
    },
    agendar: {
      ajuda: [H("Definir quantas turmas a equipe consegue receber bem por dia.")],
      atrapalha: [H("Encaixar visitas sem olhar a disponibilidade de quem vai mediar.")],
    },
    preparar: {
      ajuda: [
        F("Promover encontros com professores.", "M3 p.50"),
        F("Formar e treinar quem fará a mediação.", "M3 p.50"),
      ],
      atrapalha: [A("Tratar a capacitação como algo eventual, sem planejamento anual.", "M3 p.46")],
    },
    visitar: {
      ajuda: [
        F("Pensar atividades e ferramentas tanto para visitas mediadas quanto para não mediadas.", "M3 p.50"),
        A("Conceber atividades junto com outros setores do museu.", "M3 p.45"),
      ],
      atrapalha: [F("Considerar que a relação com as escolas cabe só ao setor educativo.", "M3 p.43")],
    },
    avaliar: {
      ajuda: [
        F("Definir, ainda no planejamento, como medir os objetivos da ação.", "M3 p.51"),
        F("Avaliar com os públicos depois que participam das ações.", "M3 p.47"),
        F("Reunir a equipe depois das ações para avaliar e registrar.", "M3 p.47"),
      ],
      atrapalha: [
        A("Medir só quantidade, sem indicadores qualitativos.", "M3 p.51"),
        A("Mudar os indicadores a cada ciclo e perder a comparação no tempo.", "M4 p.10"),
      ],
    },
    voltar: {
      ajuda: [F("Manter ações contínuas com as escolas da comunidade.", "M3 p.47")],
      atrapalha: [H("Tratar cada visita como um evento isolado.")],
    },
  },
  gestao: {
    descobrir: {
      ajuda: [A("Incluir no estudo de públicos as escolas que ainda não frequentam o museu.", "M2 p.8-9")],
    },
    decidir: {
      ajuda: [A("Ouvir professores na elaboração do Plano Museológico.", "M1 p.13")],
    },
    preparar: {
      ajuda: [
        A("Reservar verba específica para as atividades educativas.", "M3 p.46"),
        F("Investir na formação continuada de educadores museais.", "PNEM Eixo II, b"),
      ],
    },
    chegar: {
      ajuda: [F("Construir um programa permanente de acessibilidade.", "M3 p.106")],
      atrapalha: [F("Reduzir a acessibilidade a ações pontuais.", "M3 p.107")],
    },
    visitar: {
      ajuda: [F("Compor equipes de educação museal multidisciplinares, inclusivas e diversas.", "PNEM Eixo II, i")],
    },
    avaliar: {
      ajuda: [
        A("Usar os resultados do monitoramento para rever projetos e estratégias.", "M4 p.10"),
        F("Promover diagnósticos e estudos de público com outros setores.", "PNEM Eixo II, h"),
      ],
    },
    voltar: {
      ajuda: [A("Buscar parcerias e redes que sustentem a relação com as escolas.", "M3 p.47")],
    },
  },
};
