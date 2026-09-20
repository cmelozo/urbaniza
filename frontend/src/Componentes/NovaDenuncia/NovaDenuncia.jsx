import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsuarioLogado } from "../../auth";
import "./NovaDenuncia.css";

const API_URL = "http://localhost:3000/Denuncias";

function NovaDenuncia() {
  const navigate = useNavigate();
  const sessao = getUsuarioLogado();
  const inputFotoRef = useRef(null);

  const [descricao, setDescricao] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [foto, setFoto] = useState(null);
  const [previaFoto, setPreviaFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function handleFotoChange(event) {
    const arquivo = event.target.files?.[0];
    setFoto(arquivo || null);
    setPreviaFoto(arquivo ? URL.createObjectURL(arquivo) : null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    if (!sessao) {
      setErro("Você precisa estar logado para enviar uma denúncia.");
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("descricao", descricao);
      formData.append("localizacao", localizacao);
      formData.append("categoria", categoria);
      formData.append("cidadaoId", sessao.usuario.idCidadao);
      if (foto) formData.append("foto", foto);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível enviar a denúncia.");
      }

      setMensagem("Denúncia enviada com sucesso!");
      setDescricao("");
      setLocalizacao("");
      setCategoria("");
      setFoto(null);
      setPreviaFoto(null);
      if (inputFotoRef.current) inputFotoRef.current.value = "";

      setTimeout(() => navigate("/denuncias"), 900);
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="denuncia-page">
      <h1>Nova denúncia</h1>

      <form className="denuncia-form" onSubmit={handleSubmit}>
        <label>
          Descreva o problema
          <textarea
            placeholder="Informe o que está acontecendo com o máximo de detalhes possível"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={1000}
            rows={4}
            required
          />
        </label>

        <label>
          Categoria
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Selecione (opcional)</option>
            <option value="Iluminação pública">Iluminação pública</option>
            <option value="Buraco na via">Buraco na via</option>
            <option value="Coleta de lixo">Coleta de lixo</option>
            <option value="Saneamento">Saneamento</option>
            <option value="Outro">Outro</option>
          </select>
        </label>

        <label>
          Foto (opcional)
          <div className="foto-upload" onClick={() => inputFotoRef.current?.click()}>
            {previaFoto ? (
              <img src={previaFoto} alt="Pré-visualização da denúncia" />
            ) : (
              <>
                <span className="foto-icone">📷</span>
                <span>Adicione uma imagem para ajudar na identificação do problema</span>
              </>
            )}
          </div>
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            hidden
          />
        </label>

        <label>
          Local
          <input
            type="text"
            placeholder="Ex: Rua das Flores, 123 – Centro"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            required
          />
        </label>

        {erro && <p className="denuncia-status erro">{erro}</p>}
        {mensagem && <p className="denuncia-status sucesso">{mensagem}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "ENVIAR DENÚNCIA"}
        </button>
      </form>
    </div>
  );
}

export default NovaDenuncia;
