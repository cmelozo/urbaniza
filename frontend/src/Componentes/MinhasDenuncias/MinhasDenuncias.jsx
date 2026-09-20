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
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const idCidadao = sessao?.usuario?.idCidadao;
        const response = await fetch(`${API_URL}?cidadaoId=${idCidadao}`);
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
  }, [sessao?.usuario?.idCidadao]);

  return (
    <div className="inicio-page">
      <div className="inicio-header">
        <div>
          <h1>Minhas denúncias</h1>
          <p>Acompanhe o andamento das denúncias que você registrou.</p>
        </div>
        <Link className="botao-nova" to="/denuncias/nova">
          + Nova denúncia
        </Link>
      </div>

      {carregando && <p className="status-msg">Carregando...</p>}
      {erro && <p className="status-msg erro">{erro}</p>}

      {!carregando && !erro && denuncias.length === 0 && (
        <p className="status-msg">Você ainda não registrou nenhuma denúncia.</p>
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
