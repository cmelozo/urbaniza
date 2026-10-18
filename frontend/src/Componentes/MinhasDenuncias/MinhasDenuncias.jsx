import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { getUsuarioLogado } from "../../auth";
import { CLASSE_PRIORIDADE, CLASSE_STATUS, formatarData, urlImagem } from "../Denuncias/rotulos";
import "./MinhasDenuncias.css";
import "../Denuncias/Denuncias.css";

// Denúncias que o próprio cidadão registrou, com o andamento dado pela prefeitura.
function MinhasDenuncias() {
  const semCidade = !getUsuarioLogado()?.usuario?.Cidade_idCidade;
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(!semCidade);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (semCidade) return;

    async function carregar() {
      try {
        setDenuncias(await api("/Denuncias?mine=1"));
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [semCidade]);

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

      {semCidade && (
        <p className="aviso-perfil">
          Escolha a sua cidade no <Link to="/perfil">perfil</Link> para registrar e acompanhar denúncias.
        </p>
      )}

      {carregando && <p className="status-msg">Carregando...</p>}
      {erro && <p className="status-msg erro">{erro}</p>}

      {!carregando && !erro && !semCidade && denuncias.length === 0 && (
        <p className="status-msg">Você ainda não registrou nenhuma denúncia.</p>
      )}

      <div className="denuncia-lista">
        {denuncias.map((denuncia) => {
          const foto = urlImagem(denuncia);
          return (
            <article className={`denuncia-item ${foto ? "com-foto" : ""}`} key={denuncia.idDenuncia}>
              {foto && <img className="denuncia-foto" src={foto} alt={`Foto da denúncia: ${denuncia.categoria || "problema"}`} />}

              <div className="denuncia-corpo">
                <div className="denuncia-item-topo">
                  <span className="denuncia-categoria">{denuncia.categoria || "Sem categoria"}</span>
                  <span className="denuncia-tags">
                    {denuncia.prioridade && (
                      <span className={`tag ${CLASSE_PRIORIDADE[denuncia.prioridade] || ""}`}>
                        Prioridade {denuncia.prioridade.toLowerCase()}
                      </span>
                    )}
                    <span className={`tag ${CLASSE_STATUS[denuncia.status] || ""}`}>{denuncia.status}</span>
                  </span>
                </div>

                <p className="denuncia-descricao">{denuncia.descricao}</p>
                <p className="denuncia-local">📍 {denuncia.localizacao}</p>
                <p className="denuncia-data">
                  {formatarData(denuncia.data)} · ♥ {denuncia.totalCurtidas}{" "}
                  {denuncia.totalCurtidas === 1 ? "curtida" : "curtidas"}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default MinhasDenuncias;
