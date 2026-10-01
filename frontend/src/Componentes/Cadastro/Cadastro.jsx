import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Login/Login.css";

const API_URL = "http://localhost:3000";

const PERFIS = {
  cidadao: {
    rotulo: "Cidadão",
    endpoint: "/Cidadaos",
    hero: "Crie sua conta e comece a ajudar a transformar a gestão urbana da sua cidade.",
    subtitulo: "Registre problemas da cidade e acompanhe cada denúncia",
    nome: "Nome",
    nomePlaceholder: "Digite seu nome",
  },
  gestao: {
    rotulo: "Gestão municipal",
    endpoint: "/Gestao",
    hero: "Cadastre a gestão municipal para receber e acompanhar as denúncias dos cidadãos.",
    subtitulo: "Acesso para prefeituras e secretarias",
    nome: "Nome do órgão ou responsável",
    nomePlaceholder: "Ex: Secretaria de Obras",
  },
};

const FORM_VAZIO = { nome: "", email: "", senha: "", telefone: "", codigoAcesso: "" };

function Cadastro() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState("cidadao");
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const config = PERFIS[perfil];
  const ehGestao = perfil === "gestao";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function trocarPerfil(novoPerfil) {
    setPerfil(novoPerfil);
    setErro("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    const corpo = ehGestao
      ? {
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          codigoAcesso: form.codigoAcesso,
        }
      : {
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          telefone: form.telefone,
        };

    try {
      const response = await fetch(`${API_URL}${config.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível cadastrar.");
      }

      navigate("/login");
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <h1>Urbaniza+</h1>
        <p>{config.hero}</p>
      </section>

      <section className="login-card">
        <h2>Criar conta</h2>
        <p className="login-subtitulo">{config.subtitulo}</p>

        <div className="perfil-seletor" role="tablist" aria-label="Tipo de conta">
          {Object.entries(PERFIS).map(([chave, item]) => (
            <button
              key={chave}
              type="button"
              role="tab"
              aria-selected={perfil === chave}
              className={perfil === chave ? "ativo" : ""}
              onClick={() => trocarPerfil(chave)}
            >
              {item.rotulo}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            {config.nome}
            <input
              type="text"
              name="nome"
              placeholder={config.nomePlaceholder}
              value={form.nome}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              name="email"
              placeholder={ehGestao ? "E-mail institucional" : "Digite seu e-mail"}
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          {!ehGestao && (
            <label>
              Telefone
              <input
                type="tel"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={handleChange}
              />
            </label>
          )}

          <label>
            Senha
            <input
              type="password"
              name="senha"
              placeholder="Crie uma senha"
              value={form.senha}
              onChange={handleChange}
              required
            />
          </label>

          {ehGestao && (
            <label>
              Código de acesso
              <input
                type="password"
                name="codigoAcesso"
                placeholder="Fornecido pela prefeitura"
                value={form.codigoAcesso}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </label>
          )}

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" disabled={carregando}>
            {carregando
              ? "Cadastrando..."
              : ehGestao
                ? "CADASTRAR GESTÃO"
                : "CADASTRAR"}
          </button>
        </form>

        <p className="login-rodape">
          Já tem uma conta? <Link to="/login">ENTRAR</Link>
        </p>
      </section>
    </div>
  );
}

export default Cadastro;