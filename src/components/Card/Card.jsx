import { useRef, useEffect, useState } from 'react';
import './Card.css';

function Card({ aluno, isCurrentlyPlaying, onPlay }) {
  const audioRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ALTERAÇÃO AQUI: Volume inicial alterado de 0.5 para 0.2 (20%)
  const [volume, setVolume] = useState(0.1); 
  
  // ESTADO DO CARROSSEL: 0 para foto atual, 1 para foto criança
  const [fotoIndex, setFotoIndex] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      // Aplica o volume suave ao carregar e ao mudar o slider
      audioRef.current.volume = volume; 
      
      if (isCurrentlyPlaying) {
        audioRef.current.play().catch(err => console.error("Erro ao dar play:", err));
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isCurrentlyPlaying, volume]);

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const novoVolume = parseFloat(e.target.value);
    setVolume(novoVolume);
    if (audioRef.current) {
      audioRef.current.volume = novoVolume;
    }
  };

  // FUNÇÃO PARA TROCAR A FOTO
  const toggleFoto = (e) => {
    e.stopPropagation(); 
    setFotoIndex(prev => (prev === 0 ? 1 : 0));
  };

  return (
    <>
      <div className={`card-aluno ${isCurrentlyPlaying ? 'active' : ''}`} onClick={() => setIsExpanded(true)}>
        <audio ref={audioRef} src={aluno.audioSrc} onEnded={() => onPlay(null)} />
        
        <div className="capa-album">
          <img 
            src={fotoIndex === 0 ? aluno.foto : (aluno.fotoCrianca || aluno.foto)} 
            alt={aluno.nome} 
            className="img-principal"
          />

          {aluno.fotoCrianca && (
            <>
              <button className="seta-carrossel esquerda" onClick={toggleFoto}>❮</button>
              <button className="seta-carrossel direita" onClick={toggleFoto}>❯</button>
              
              <div className="indicadores-carrossel">
                <span className={`ponto ${fotoIndex === 0 ? 'ativo' : ''}`}></span>
                <span className={`ponto ${fotoIndex === 1 ? 'ativo' : ''}`}></span>
              </div>
            </>
          )}
          
          {isCurrentlyPlaying && (
            <div className="equalizer-overlay">
              <div className="equalizer">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            </div>
          )}

          <button className="play-btn" onClick={(e) => { 
            e.stopPropagation();
            onPlay(); 
          }}>
            {isCurrentlyPlaying ? '⏸' : '▶'}
          </button>
        </div>

        <div className="info-aluno">
          <div className="title-row">
            <h3>{aluno.nome}</h3>
            {isCurrentlyPlaying && <span className="playing-dot"></span>}
          </div>
          <p className="musica-tema">🎵 {aluno.musicaNome || "Sem música selecionada"}</p>
          
          <div className="footer-card">
            <span className="badge-skill">{aluno.skillPrincipal || "Estudante"}</span>
            
            <div className="volume-inline-control" onClick={(e) => e.stopPropagation()}>
              <span className="volume-icon">
                {volume === 0 ? '🔇' : volume < 0.5 ? '🔈' : '🔊'}
              </span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onInput={handleVolumeChange}
                className="volume-slider-mini"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isExpanded && (
        <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsExpanded(false)}>&times;</button>
            <div className="modal-header">
              <img src={aluno.foto} alt={aluno.nome} className="modal-foto" />
              <div>
                <h2>{aluno.nome}</h2>
                <p className="modal-apelido">"{aluno.apelido || "---"}"</p>
              </div>
            </div>
            <div className="modal-body">
              <p className="modal-frase">"{aluno.frase || "A música é a linguagem universal."}"</p>
              <hr />
              <h4>Sobre mim</h4>
              <p>{aluno.sobre || "Estudante de Desenvolvimento de Sistemas no SENAI e Ensino Médio no SESI."}</p>
              <h4>Skills</h4>
              <p>{aluno.skillPrincipal || "Desenvolvimento de Sistemas"}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Card;