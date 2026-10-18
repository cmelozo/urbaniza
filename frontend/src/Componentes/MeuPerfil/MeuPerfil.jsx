import { useEffect, useState } from "react";
import { api } from "../../api";
import { getUsuarioLogado, salvarUsuarioLogado } from "../../auth";
import "./MeuPerfil.css";

function MeuPerfil() {
  const sessao = getUsuarioLogado();
  const [form, setForm] = useState({
    nome: sessao?.usuario?.nome || "",
    email: sessao?.usuario?.email || "",
    telefone: sessao?.usuario?.telefone || "",
    cidadeId: sessao?.usuario?.Cidade_idCidade ? String(sessao.usuario.Cidade_idCidade) : "",
    senha: "",
  });
  const [cidades, setCidades] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    api("/Cidades")
      .then(setCidades)
      .catch(() => setErro("Não foi possível carregar a lista de cidades."));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem("");
    setErro("");
    setSalvando(true);

    try {
      const corpo = { ...form };
      if (!corpo.cidadeId) delete corpo.cidadeId;

      const data = await api(`/Cidadaos/${sessao.usuario.idCidadao}`, { method: "PUT", body: corpo });

      // o token novo carrega a cidade atualizada
      salvarUsuarioLogado("cidadao", data.usuario, data.token);
      setMensagem("Perfil atualizado com sucesso!");
      setForm((prev) => ({ ...prev, senha: "" }));
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (!sessao) {
    return <p>Você precisa estar logado para ver esta página.</p>;
  }

  return (
    <div className="perfil-page">
      <h1>Meu perfil</h1>
      <p className="perfil-sub">Atualize seus dados de cadastro.</p>

      <form className="perfil-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </label>
        <label>
          E-mail
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Telefone
          <input name="telefone" value={form.telefone} onChange={handleChange} />
        </label>
        <label>
          Cidade
          <select name="cidadeId" value={form.cidadeId} onChange={handleChange} required>
            <option value="">Selecione sua cidade</option>
            {cidades.map((cidade) => (
              <option key={cidade.idCidade} value={cidade.idCidade}>
                {cidade.nome} - {cidade.uf}
              </option>
            ))}
          </select>
          <small className="perfil-ajuda">
            Você vê e curte as denúncias da cidade escolhida, e suas novas denúncias vão para a prefeitura dela.
          </small>
        </label>
        <label>
          Nova senha
          <input
            type="password"
            name="senha"
            placeholder="Deixe em branco para manter a atual"
            value={form.senha}
            onChange={handleChange}
          />
        </label>

        {erro && <p className="perfil-status erro">{erro}</p>}
        {mensagem && <p className="perfil-status sucesso">{mensagem}</p>}

        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}

export default MeuPerfil;
