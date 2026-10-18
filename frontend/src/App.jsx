import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./Componentes/Login/Login";
import Cadastro from "./Componentes/Cadastro/Cadastro";
import NovaDenuncia from "./Componentes/NovaDenuncia/NovaDenuncia";
import MinhasDenuncias from "./Componentes/MinhasDenuncias/MinhasDenuncias";
import DenunciasCidade from "./Componentes/DenunciasCidade/DenunciasCidade";
import PainelGestao from "./Componentes/PainelGestao/PainelGestao";
import MeuPerfil from "./Componentes/MeuPerfil/MeuPerfil";
import SidebarLayout from "./Componentes/Layout/SidebarLayout";
import { getUsuarioLogado } from "./auth";
import "./App.css";

// tipo opcional: "cidadao" ou "gestao". Quem não tem o perfil volta para o início.
function RotaPrivada({ children, tipo }) {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  if (tipo && usuario.tipo !== tipo) {
    return <Navigate to="/denuncias" replace />;
  }
  return children;
}

// /denuncias: o cidadão vê o feed da cidade; a prefeitura vê o painel de gestão.
function Inicio() {
  return getUsuarioLogado()?.tipo === "gestao" ? <PainelGestao /> : <DenunciasCidade />;
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
              <Inicio />
            </SidebarLayout>
          </RotaPrivada>
        }
      />
      <Route
        path="/denuncias/minhas"
        element={
          <RotaPrivada tipo="cidadao">
            <SidebarLayout>
              <MinhasDenuncias />
            </SidebarLayout>
          </RotaPrivada>
        }
      />
      <Route
        path="/denuncias/nova"
        element={
          <RotaPrivada tipo="cidadao">
            <SidebarLayout>
              <NovaDenuncia />
            </SidebarLayout>
          </RotaPrivada>
        }
      />
      <Route
        path="/perfil"
        element={
          <RotaPrivada tipo="cidadao">
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
