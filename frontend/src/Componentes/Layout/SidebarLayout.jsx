import { NavLink, useNavigate } from "react-router-dom";
import { getUsuarioLogado, logout } from "../../auth";
import "./SidebarLayout.css";

function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const sessao = getUsuarioLogado();
  const nome = sessao?.usuario?.nome || "Usuário";
  const inicial = nome.charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-topo">
          <span className="sidebar-logo">Urbaniza+</span>
          <div className="sidebar-usuario">
            <span className="avatar">{inicial}</span>
            <span>{nome.split(" ")[0]}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/denuncias/nova" className="sidebar-link">
            Nova denúncia
          </NavLink>
          <NavLink to="/denuncias" end className="sidebar-link">
            Início
          </NavLink>
          <NavLink to="/perfil" className="sidebar-link">
            Meu perfil
          </NavLink>
        </nav>

        <div className="sidebar-ajuda">
          <p className="ajuda-titulo">Precisa de ajuda?</p>
          <p className="ajuda-texto">Fale com nosso suporte</p>
        </div>

        <button
          className="sidebar-sair"
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Sair
        </button>
      </aside>

      <main className="conteudo">{children}</main>
    </div>
  );
}

export default SidebarLayout;
