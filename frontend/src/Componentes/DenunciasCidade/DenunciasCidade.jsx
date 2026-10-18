import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { getUsuarioLogado } from "../../auth";
import { CLASSE_PRIORIDADE, CLASSE_STATUS, STATUS, formatarData, urlImagem } from "../Denuncias/rotulos";
import "../MinhasDenuncias/MinhasDenuncias.css";
import "../Denuncias/Denuncias.css";

// Início do cidadão: todas as denúncias da cidade onde ele está logado.
function DenunciasCidade() {
  const sessao = getUsuarioLogado();
  const cidade = sessao?.usuario?.cidade;
  const semCidade = !sessao?.usuario?.Cidade_idCidade;

  const [denuncias, setDenuncias] = useState([]);
  const [filtro, setFiltro] = useState("Todas");
  const [carregando, setCarregando] = useState(!semCidade);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (semCidade) return;

    async function carregar() {
      try {
        setDenuncias(await api("/Denuncias"));
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [semCidade]);

  async function alternarCurtida(denuncia) {
    const antes = { curtiu: denuncia.curtiu, totalCurtidas: denuncia.totalCurtidas };
    atualizar(denuncia.idDenuncia, {
      curtiu: !antes.curtiu,
      totalCurtidas: antes.totalCurtidas + (antes.curtiu ? -1 : 1),
    });

    try {
      const resposta = await api(`/Denuncias/${denuncia.idDenuncia}/curtir`, { method: "POST" });
      atualizar(denuncia.idDenuncia, resposta);
    } catch (error) {
      atualizar(denuncia.idDenuncia, antes);
      setErro(error.message);
    }
  }

  function atualizar(id, campos) {
    setDenuncias((lista) => lista.map((d) => (d.idDenuncia === id ? { ...d, ...campos } : d)));
  }

  const visiveis = filtro === "Todas" ? denuncias : denuncias.filter((d) => d.status === filtro);

  return (
    <div className="inicio-page">
      <div className="inicio-header">
        <div>
          <h1>{cidade ? `Denúncias de ${cidade.nome}` : "Denúncias da cidade"}</h1>
          <p>Veja o que a sua cidade está reportando e curta as denúncias que também te afetam.</p>
        </div>
        <Link className="botao-nova" to="/denuncias/nova">
          + Nova denúncia
        </Link>
      </div>

      {semCidade && (
        <p className="aviso-perfil">
          Escolha a sua cidade no <Link to="/perfil">perfil</Link> para ver as denúncias dela.
        </p>
      )}

      {!semCidade && (
        <div className="filtros" role="group" aria-label="Filtrar por status">
          {["Todas", ...STATUS].map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={`filtro ${filtro === opcao ? "ativo" : ""}`}
              aria-pressed={filtro === opcao}
              onClick={() => setFiltro(opcao)}
            >
              {opcao}
            </button>
          ))}
        </div>
      )}

      {carregando && <p className="status-msg">Carregando...</p>}
      {erro && <p className="status-msg erro">{erro}</p>}

      {!carregando && !erro && !semCidade && visiveis.length === 0 && (
        <p className="status-msg">
          {denuncias.length === 0
            ? "Ninguém registrou denúncias na sua cidade ainda. Seja o primeiro."
            : "Nenhuma denúncia com esse status."}
        </p>
      )}

      <div className="denuncia-lista">
        {visiveis.map((denuncia) => {
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

                <div className="denuncia-rodape">
                  <span className="denuncia-data">
                    {denuncia.autor ? `${denuncia.autor} · ` : ""}
                    {formatarData(denuncia.data)}
                  </span>
                  <button
                    type="button"
                    className={`curtir ${denuncia.curtiu ? "curtiu" : ""}`}
                    aria-pressed={denuncia.curtiu}
                    aria-label={denuncia.curtiu ? "Remover curtida" : "Curtir denúncia"}
                    onClick={() => alternarCurtida(denuncia)}
                  >
                    <span aria-hidden="true">{denuncia.curtiu ? "♥" : "♡"}</span>
                    {denuncia.totalCurtidas}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default DenunciasCidade;
