 /* ==========================================================
   dados.js — TODO o conteúdo da caçada fica aqui.
   Edite à vontade; o resto do código lê deste arquivo.

   Dicas rápidas:
   - Textos ficam entre aspas "..." ou crases `...`.
     Use crases quando o texto tiver várias linhas (cartas).
   - Não esqueça a vírgula entre um item e outro.
   - As respostas são HASHES. Gere em gerar-hash.html
     (abra no navegador, digite as respostas, copie o resultado).
   - Até 15 perguntas.
   ========================================================== */

const DADOS = {

  /* ---------- Tela inicial ---------- */
  inicio: {
    sobretitulo: "Feliz aniversário, meu amor",
    titulo: "Uma caçada ao tesouro",
    texto: `Escondi alguns pedacinhos da nossa história por aqui.
Cada enigma que você resolver abre um tesouro.
Sem pressa: dá pra parar e voltar quando quiser.`,
    botao: "Começar a caçada"
  },

  /* ---------- Música de fundo (opcional) ----------
     Coloque o arquivo na pasta musica/ e escreva o nome aqui.
     Para não ter música, deixe vazio: musica: ""            */
  musica: "musica/nossa-musica.mp3",

  /* ---------- Frases quando ela erra (sorteadas) ---------- */
  mensagensErro: [
    "Quase! Mas não é bem isso 😅",
    "Hmm… tenta de novo, amor",
    "Errou, mas continua linda.",
    "Nãããão! Pensa mais um pouquinho 🤔",
    "Eu lembro disso melhor que você? 👀",
    "Passou perto! Quer uma dica?"
  ],

  /* ---------- Perguntas ----------
     Cada pergunta tem:
       pergunta:   o enigma
       respostas:  lista de hashes das respostas aceitas
       dica:       texto que aparece no botão "Pedir dica"
       recompensa: UM destes três formatos:

       { tipo: "foto",  imagem: "fotos/arquivo.jpg", legenda: "..." }
       { tipo: "carta", titulo: "...", texto: `...`, assinatura: "..." }
       { tipo: "vale",  titulo: "...", descricao: "...", codigo: "VALE-001", validade: "..." }
  */
  perguntas: [

    // EXEMPLO 1 — recompensa FOTO
    // Respostas aceitas: "praia", "a praia", "na praia"
    {
      pergunta: "Onde foi nossa primeira viagem?",
      respostas: [
      "5226821eaaa0ce85d99f6a311b187dbef55ec6b6926617dd458c7a2aaa4f5c6f",
      "7ba9b19fc81560f436f0836f42831eb60f08e152a09d044881f60f224d425209"
    ],
      dica: "Tinha areia, barulho de mar e um pôr do sol que eu nunca esqueci.",
      recompensa: {
        tipo: "foto",
        imagem: "fotos/exemplo-praia.jpeg",
        legenda: "Nossa primeira viagem ♥"
      }
    },

    // EXEMPLO 2 — recompensa CARTA
    // Respostas aceitas: "março", "em março", "mês de março", "3"
    {
      pergunta: "Qual a data que começamos a namorar?",
      respostas: [
  "d28bd9d6d23a67ed92d6d772fed6557e388cafbf83c374c390840e3a40ffe816",
  "0d86dab6bfceb0e7f132ab82ffac603d7fb689cfcda9d25feef6e3c347d0f2cc",
  "92b8642aceed8fbf51a4be2f30c16bd20fb21a6c53f054ed6ae3f252e0f96808"
],
      dica: "Aniversário do seu BESTIE MODA",
      recompensa: {
        tipo: "carta",
        titulo: "Meu amor,",
        texto: `Lembro direitinho daquele mês. Você tinha me dado um pacote de Amandita, me desesperei tanto com o gesto que tive que oficializar na hora, foi meio ruim, mas foi com a maior sinceridade do mundo. Quem sabe eu possa ter a chance de fazer um pedido melhor em breve?

Obrigado por cada dia desde então. Pelos dias fáceis e pelos difíceis também.

Esse é só mais um aniversário que eu quero comemorar do seu lado.`,
        assinatura: "Com todo o meu amor, eu"
      }
    },

    // EXEMPLO 3 — recompensa VALE-PRESENTE
    // Respostas aceitas: "amor", "meu amor", "mozão"
    {
      pergunta: "Como se escreve Omo Biblin?",
      respostas: [
  "70cb205a3123268316e7204cfeef340596731a431aad894956bfca57dd67c78f"
],
      dica: "Oitava letra do alfabeto",
      recompensa: {
        tipo: "vale",
        titulo: "Vale uma flor",
        descricao: "Uma flor entregue em mãos, no dia que você escolher, com direito a beijo junto.",
        codigo: "VALE-001",
        validade: "Válido para sempre"
      }
    },

    {
      pergunta: "Onde foi o nosso primeiro beijo?",
      respostas: [
  "49c4d6c272e709866be13baaf649a60a25269affc946cc8daf98e260974a30e8"
],
      dica: "Apresentador esquerdista",
      recompensa: {
        tipo: "vale",
        titulo: "Vale uma massagem nas costas",
        descricao: "Uma massagem nas costas por tempo indeterminado, do jeito que você gosta",
        codigo: "VALE-002",
        validade: "Válido para sempre"
      }
    },

    {
      pergunta: "Qual nome da nossa futura filha?",
      respostas: [
  "b2471d941bf888366cf43813752ea2ebfef08254773cf116187cdd6d0463a50a"
],
      dica: "Musica do One Direction",
      recompensa: {
        tipo: "vale",
        titulo: "Vale um date",
        descricao: "Vale um date em qualquer lugar que você escolher",
        codigo: "VALE-003",
        validade: "Válido para sempre"
      }
    },

    {
      pergunta: "Qual série da disney você me viciou?",
      respostas: [
      "7bcaa9064edaed068815079747479ed805a846e9dd73f9a08fa2d847a957d079",
    ],
      dica: "O loiro tem uma banda e é infiel na vida real",
      recompensa: {
        tipo: "foto",
        imagem: "fotos/maozona.jpeg",
        legenda: "Fotassa ♥"
      }
    },

    {
      pergunta: "Qual era o nome do nosso mood?",
      respostas: [
      "0a2327a188d1c93a77da85e50517cdf747cc9be3931eb00a0a1bd231df349f10",
      "7c366516769f41ad99c44511c58e599ea55aa47c51524f2d2d0c3a26b37334a0"
    ],
      dica: "Cookie",
      recompensa: {
        tipo: "foto",
        imagem: "fotos/biscoito.jpeg",
        legenda: "Te amo ♥"
      }
    },

    {
      pergunta: "Como é o jeito específico que apenas você me chama?",
      respostas: [
      "04ad331aa63de9965762ad27834f1ac3b2c26aa60823df29ea04241afee2650f",
    ],
      dica: "É só para pentelhar",
      recompensa: {
        tipo: "carta",
        titulo: "Um ser que ilumina minha vida",
        texto: 'A habilidade de pentelhice é tão especial quanto você mesma como pessoa. Temos um senso de humor tão parecido que parece que temos o mesmo cérebro. Só me prova cada vez mais que fomos feitos um para o outro.',
        assinatura: 'O amor da sua vida',
      }
    },
  ],

  /* ---------- Tela final ---------- */
  final: {
    titulo: "Você encontrou todos os tesouros",
    mensagem: `Mas o maior tesouro dessa história é você.

Feliz aniversário. Obrigado por existir e fazer parte da minha vida e da minha história. Que isso continue por toda eternidade.
Te amo mais do que cabe nesse site.`,
    assinatura: "Seu, para sempre",
    conquista: "Amor da minha vida"
  }
};
