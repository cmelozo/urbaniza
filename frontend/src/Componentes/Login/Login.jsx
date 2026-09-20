import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { salvarUsuarioLogado } from "../../auth";
import "./Login.css";

const API_URL = "http://localhost:3000";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
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
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível entrar.");
      }

      salvarUsuarioLogado(data.tipo, data.usuario);
      navigate("/denuncias");
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
        <p>A plataforma completa para transformar a gestão urbana da sua cidade.</p>
      </section>

      <section className="login-card">
        <h2>Acesse sua conta</h2>
        <p className="login-subtitulo">Entre com seu usuário e senha para continuar</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Usuário
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
            Senha
            <input
              type="password"
              name="senha"
              placeholder="Digite sua senha"
              value={form.senha}
              onChange={handleChange}
              required
            />
          </label>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "LOGIN"}
          </button>
        </form>

        <p className="login-rodape">
          Não tem uma conta? <Link to="/cadastro">CADASTRE-SE</Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
