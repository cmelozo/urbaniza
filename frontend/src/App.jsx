import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./Componentes/Login/Login";
import Cadastro from "./Componentes/Cadastro/Cadastro";
import NovaDenuncia from "./Componentes/NovaDenuncia/NovaDenuncia";
import MinhasDenuncias from "./Componentes/MinhasDenuncias/MinhasDenuncias";
import MeuPerfil from "./Componentes/MeuPerfil/MeuPerfil";
import SidebarLayout from "./Componentes/Layout/SidebarLayout";
import { getUsuarioLogado } from "./auth";
import "./App.css";

function RotaPrivada({ children }) {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={getUsuarioLogado() ? "/denuncias" : "/login"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route
        path="/denuncias"
        element={
          <RotaPrivada>
            <SidebarLayout>
              <MinhasDenuncias />
            </SidebarLayout>
          </RotaPrivada>
        }
      />
      <Route
        path="/denuncias/nova"
        element={
          <RotaPrivada>
            <SidebarLayout>
              <NovaDenuncia />
            </SidebarLayout>
          </RotaPrivada>
        }
      />
      <Route
        path="/perfil"
        element={
          <RotaPrivada>
            <SidebarLayout>
              <MeuPerfil />
            </SidebarLayout>
          </RotaPrivada>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
