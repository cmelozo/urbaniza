// Cadastra os municípios atendidos e gera o token (código de acesso) de cada prefeitura.
//
//   npm run seed
//
// Rodar de novo é seguro: cidades que já existem mantêm o token. Para incluir
// uma cidade nova, basta acrescentá-la na lista abaixo e rodar o seed outra vez.
//
// IMPORTANTE: confirme esta lista com o recorte territorial que vocês adotarem
// para o "agreste sul litorâneo" do RN.
const crypto = require("crypto");
const prisma = require("./client");

const CIDADES = [
  "Arez",
  "Baía Formosa",
  "Canguaretama",
  "Espírito Santo",
  "Goianinha",
  "Montanhas",
  "Pedro Velho",
  "Senador Georgino Avelino",
  "Tibau do Sul",
  "Vila Flor",
];

function gerarToken() {
  const parte = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `URB-${parte()}-${parte()}-${parte()}`;
}

async function main() {
  const novas = [];

  for (const nome of CIDADES) {
    const existente = await prisma.cidade.findUnique({
      where: { nome_uf: { nome, uf: "RN" } },
    });
    if (existente) continue;

    const cidade = await prisma.cidade.create({
      data: { nome, uf: "RN", token: gerarToken() },
    });
    novas.push(cidade);
  }

  const todas = await prisma.cidade.findMany({ orderBy: { nome: "asc" } });
  console.log("\nCidades e códigos de acesso das prefeituras:\n");
  for (const c of todas) {
    const marca = novas.some((n) => n.idCidade === c.idCidade) ? " (nova)" : "";
    console.log(
      `${c.nome.padEnd(28)} ${c.token}  ${c.cadastrada ? "[cadastrada]" : "[aguardando cadastro]"}${marca}`,
    );
  }
  console.log(
    "\nEntregue cada código só à prefeitura correspondente, fora da plataforma.\n",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
