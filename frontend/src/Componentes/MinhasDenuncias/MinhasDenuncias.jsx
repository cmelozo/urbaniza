import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsuarioLogado } from "../../auth";
import "./MinhasDenuncias.css";

const API_URL = "http://localhost:3000/Denuncias";

const CORES_STATUS = {
  Pendente: "status-pendente",
  "Em análise": "status-analise",
  Resolvida: "status-resolvida",
};

function MinhasDenuncias() {
  const sessao = getUsuarioLogado();
  const ehGestao = sessao?.tipo === "gestao";
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const idCidadao = sessao?.usuario?.idCidadao;
        const url = ehGestao ? API_URL : `${API_URL}?cidadaoId=${idCidadao}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível carregar suas denúncias.");
        }

        setDenuncias(data);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [sessao?.usuario?.idCidadao, ehGestao]);

  return (
    <div className="inicio-page">
      <div className="inicio-header">
        <div>
          <h1>{ehGestao ? "Denúncias do município" : "Minhas denúncias"}</h1>
          <p>
            {ehGestao
              ? "Veja as denúncias registradas pelos cidadãos."
              : "Acompanhe o andamento das denúncias que você registrou."}
          </p>
        </div>
        {!ehGestao && (
          <Link className="botao-nova" to="/denuncias/nova">
            + Nova denúncia
          </Link>
        )}
      </div>

      {carregando && <p className="status-msg">Carregando...</p>}
      {erro && <p className="status-msg erro">{erro}</p>}

      {!carregando && !erro && denuncias.length === 0 && (
        <p className="status-msg">
          {ehGestao
            ? "Nenhuma denúncia registrada até o momento."
            : "Você ainda não registrou nenhuma denúncia."}
        </p>
      )}

      <div className="denuncia-lista">
        {denuncias.map((denuncia) => (
          <article className="denuncia-item" key={denuncia.idDenuncia}>
            <div className="denuncia-item-topo">
              <span className="denuncia-categoria">{denuncia.categoria || "Sem categoria"}</span>
              <span className={`denuncia-status-tag ${CORES_STATUS[denuncia.status] || "status-pendente"}`}>
                {denuncia.status}
              </span>
            </div>
            <p className="denuncia-descricao">{denuncia.descricao}</p>
            <p className="denuncia-local">📍 {denuncia.localizacao}</p>
            {ehGestao && denuncia.cidadao?.nome && (
              <p className="denuncia-data">Enviada por {denuncia.cidadao.nome}</p>
            )}
            <p className="denuncia-data">
              {new Date(denuncia.data).toLocaleDateString("pt-BR")}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default MinhasDenuncias;