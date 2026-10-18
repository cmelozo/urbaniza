import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import { getUsuarioLogado } from "../../auth";
import {
  CLASSE_PRIORIDADE,
  CLASSE_STATUS,
  PRIORIDADES,
  STATUS,
  formatarDataHora,
  urlImagem,
} from "../Denuncias/rotulos";
import "../Denuncias/Denuncias.css";
import "./PainelGestao.css";

const POR_PAGINA = 5;

// Painel da prefeitura: só enxerga (e só edita) as denúncias do próprio município.
function PainelGestao() {
  const sessao = getUsuarioLogado();
  const cidade = sessao?.usuario?.cidade;

  const [denuncias, setDenuncias] = useState([]);
  const [filtro, setFiltro] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);

  useEffect(() => {
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
  }, []);

  const contagem = useMemo(() => {
    const total = { Todas: denuncias.length };
    STATUS.forEach((s) => (total[s] = denuncias.filter((d) => d.status === s).length));
    return total;
  }, [denuncias]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return denuncias.filter((d) => {
      if (filtro !== "Todas" && d.status !== filtro) return false;
      if (!termo) return true;
      return [d.idDenuncia, d.categoria, d.descricao, d.localizacao, d.autor]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(termo));
    });
  }, [denuncias, filtro, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const naPagina = filtradas.slice(inicio, inicio + POR_PAGINA);

  function trocarFiltro(novo) {
    setFiltro(novo);
    setPagina(1);
  }

  function aoSalvar(atualizada) {
    setDenuncias((lista) => lista.map((d) => (d.idDenuncia === atualizada.idDenuncia ? atualizada : d)));
    setEditando(null);
  }

  return (
    <div className="painel-page">
      <div className="painel-topo">
        <div>
          <h1>Denúncias{cidade ? ` de ${cidade.nome}` : ""}</h1>
          <p>Acompanhe e gerencie as denúncias recebidas no seu município.</p>
        </div>
        <input
          type="search"
          className="painel-busca"
          placeholder="Buscar denúncia..."
          aria-label="Buscar denúncia"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
        />
      </div>

      <div className="filtros" role="group" aria-label="Filtrar por status">
        {["Todas", ...STATUS].map((opcao) => (
          <button
            key={opcao}
            type="button"
            className={`filtro ${filtro === opcao ? "ativo" : ""}`}
            aria-pressed={filtro === opcao}
            onClick={() => trocarFiltro(opcao)}
          >
            {opcao}
            <span className="filtro-contagem">{contagem[opcao]}</span>
          </button>
        ))}
      </div>

      {carregando && <p className="status-msg">Carregando...</p>}
      {erro && <p className="status-msg erro">{erro}</p>}

      {!carregando && !erro && filtradas.length === 0 && (
        <p className="status-msg">
          {denuncias.length === 0
            ? "Nenhuma denúncia recebida até o momento."
            : "Nenhuma denúncia encontrada com esses filtros."}
        </p>
      )}

      {naPagina.length > 0 && (
        <div className="tabela-wrap">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Foto</span></th>
                <th scope="col">ID</th>
                <th scope="col">Problema</th>
                <th scope="col">Local</th>
                <th scope="col">Data</th>
                <th scope="col">Apoios</th>
                <th scope="col">Status</th>
                <th scope="col">Prioridade</th>
                <th scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {naPagina.map((d) => {
                const foto = urlImagem(d);
                return (
                  <tr key={d.idDenuncia}>
                    <td>
                      {foto ? (
                        <img className="tabela-foto" src={foto} alt="" />
                      ) : (
                        <span className="tabela-foto vazia" aria-hidden="true">📷</span>
                      )}
                    </td>
                    <td className="tabela-id">#{d.idDenuncia}</td>
                    <td className="tabela-problema">
                      <strong>{d.categoria || "Sem categoria"}</strong>
                      <span>{d.descricao}</span>
                    </td>
                    <td className="tabela-local">{d.localizacao}</td>
                    <td className="tabela-data">{formatarDataHora(d.data)}</td>
                    <td className="tabela-apoios">♥ {d.totalCurtidas}</td>
                    <td><span className={`tag ${CLASSE_STATUS[d.status] || ""}`}>{d.status}</span></td>
                    <td>
                      {d.prioridade && (
                        <span className={`tag ${CLASSE_PRIORIDADE[d.prioridade] || ""}`}>{d.prioridade}</span>
                      )}
                    </td>
                    <td>
                      <button type="button" className="link-acao" onClick={() => setEditando(d)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="tabela-rodape">
            <span>
              Mostrando {inicio + 1} a {inicio + naPagina.length} de {filtradas.length}{" "}
              {filtradas.length === 1 ? "denúncia" : "denúncias"}
            </span>
            {totalPaginas > 1 && (
              <nav className="paginacao" aria-label="Paginação">
                <button type="button" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)} aria-label="Página anterior">‹</button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === paginaAtual ? "ativa" : ""}
                    aria-current={n === paginaAtual ? "page" : undefined}
                    onClick={() => setPagina(n)}
                  >
                    {n}
                  </button>
                ))}
                <button type="button" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)} aria-label="Próxima página">›</button>
              </nav>
            )}
          </div>
        </div>
      )}

      {editando && <EditarDenuncia denuncia={editando} onFechar={() => setEditando(null)} onSalvo={aoSalvar} />}
    </div>
  );
}

function EditarDenuncia({ denuncia, onFechar, onSalvo }) {
  const [status, setStatus] = useState(denuncia.status);
  const [prioridade, setPrioridade] = useState(denuncia.prioridade || "Média");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const foto = urlImagem(denuncia);

  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const atualizada = await api(`/Denuncias/${denuncia.idDenuncia}`, {
        method: "PUT",
        body: { status, prioridade },
      });
      onSalvo(atualizada);
    } catch (error) {
      setErro(error.message);
      setSalvando(false);
    }
  }

  return (
    <div className="modal-fundo" onClick={onFechar}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
        onSubmit={salvar}
      >
        <h2 id="modal-titulo">Denúncia #{denuncia.idDenuncia}</h2>
        <p className="modal-resumo">
          <strong>{denuncia.categoria || "Sem categoria"}</strong> · {denuncia.localizacao}
        </p>
        {foto && <img className="modal-foto" src={foto} alt="Foto enviada pelo cidadão" />}
        <p className="modal-descricao">{denuncia.descricao}</p>

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label>
          Emergência (prioridade)
          <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        {erro && <p className="perfil-status erro">{erro}</p>}

        <div className="modal-acoes">
          <button type="button" className="botao-secundario" onClick={onFechar}>Cancelar</button>
          <button type="submit" className="botao-primario" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PainelGestao;
