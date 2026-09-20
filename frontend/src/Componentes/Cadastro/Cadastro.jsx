import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Login/Login.css";

const API_URL = "http://localhost:3000/Cidadaos";

function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
  });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        <p>Crie sua conta e comece a ajudar a transformar a gestão urbana da sua cidade.</p>
      </section>

      <section className="login-card">
        <h2>Criar conta</h2>
        <p className="login-subtitulo">Preencha seus dados para se cadastrar</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Nome
            <input
              type="text"
              name="nome"
              placeholder="Digite seu nome"
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
              placeholder="Digite seu e-mail"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

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

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" disabled={carregando}>
            {carregando ? "Cadastrando..." : "CADASTRAR"}
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
