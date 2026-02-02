import { useState, useRef, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar/Navbar';
import logoGrande from './assets/logo-tercefy.png';
import { alunosData } from './data/alunos';
import Card from '/components/Card/Card.jsx';
import { memorialData } from './data/memorial';
import Footer from './components/Footer/Footer';

// Imports de Assets
import trilhaMemorial from './assets/trilha-memorial.mp3'; 
import qrCodeSpotify from './assets/qrcodeSpotify.jpeg'; // Certifique-se de que o arquivo está nesta pasta

function App() {
  const [playingId, setPlayingId] = useState(null);
  const [isMuted, setIsMuted] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const memorialRef = useRef(null);
  const trilhaRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  // Função para fazer o Fade do Volume (Fade-in / Fade-out)
  const fadeVolume = (targetVolume, duration = 1500) => {
    if (!trilhaRef.current) return;
    
    clearInterval(fadeIntervalRef.current);
    
    const startVolume = trilhaRef.current.volume;
    const steps = 20;
    const volumeStep = (targetVolume - startVolume) / steps;
    const intervalTime = duration / steps;
    
    let currentStep = 0;
    
    fadeIntervalRef.current = setInterval(() => {
      if (currentStep < steps) {
        const newVolume = Math.max(0, Math.min(1, trilhaRef.current.volume + volumeStep));
        trilhaRef.current.volume = newVolume;
        currentStep++;
      } else {
        clearInterval(fadeIntervalRef.current);
        if (targetVolume === 0) trilhaRef.current.pause();
      }
    }, intervalTime);
  };

  // Monitora a rolagem para tocar a trilha no Memorial
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playingId && !isMuted) {
          trilhaRef.current.play().then(() => {
            fadeVolume(0.1, 2000); 
          }).catch(() => console.log("Interação necessária"));
        } else {
          fadeVolume(0, 1000); 
        }
      },
      { threshold: 0.2 }
    );

    if (memorialRef.current) observer.observe(memorialRef.current);
    return () => {
      observer.disconnect();
      clearInterval(fadeIntervalRef.current);
    };
  }, [playingId, isMuted]);

  const handleTogglePlay = (id) => {
    setPlayingId(prevId => {
      const newId = prevId === id ? null : id;
      if (newId !== null) {
        fadeVolume(0, 500); 
      }
      return newId;
    });
  };

  // Lógica de Filtro
  const alunosFiltrados = alunosData.filter(aluno => 
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.skillPrincipal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Navbar />
      
      <audio ref={trilhaRef} src={trilhaMemorial} loop />

      {/* SEÇÃO 1: HERO */}
      <section id="home" className="hero">
        <div className="hero-content">
          <img src={logoGrande} alt="Logo Tercefy" className="logo-hero-animada" />
          <p className="subtitle">Nossa trilha sonora está apenas começando.</p>
          <a href="#sobre" className="btn-explorar">Descobrir mais</a>
        </div>
      </section>

      {/* SEÇÃO 2: SOBRE (REFORMULADA COM QR CODE) */}
      <section id="sobre" className="section-padding">
        <div className="container">
          <div className="sobre-wrapper">
            
            <div className="sobre-grid-main">
              <div className="sobre-content">
                <div className="texto-principal">
                  <h3>Por que Tercefy?</h3>
                  <p>O nome <strong>Tercefy</strong> representa a nossa sincronia...</p>
                  <p>No <strong>SESI</strong> e no <strong>SENAI</strong>, criamos harmonia perfeita.</p>
                </div>
                <div className="detalhes-tecnicos">
                  <div className="detalhe-card">
                    <h4>Diversidade</h4>
                    <p>32 alunos, 32 trilhas sonoras diferentes, uma só turma.</p>
                  </div>
                  <div className="detalhe-card">
                    <h4>Representação</h4>
                    <p>Cada aluno é representado por um artista no mundo da música.</p>
                  </div>
                </div>
              </div>

              {/* LADO DIREITO: QR CODE E BOTÃO */}
              <div className="playlist-aside">
                <div className="qr-card-glass">
                  <div className="sobre-header">
                    <h3>Bem-vindo à nossa Playlist.</h3><br />
                  </div>
                  <img src={qrCodeSpotify} alt="QR Code Spotify" className="qr-code-img" />
                  <p className='escaneie'>Escaneie a playlist</p>
                  <a 
                    href="https://open.spotify.com/playlist/2H1KGHqTVd8wYcNouk2IwQ?si=031f7db8ccee4e71" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-spotify-link"
                  >
                    Abrir no Spotify
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: ALUNOS */}
      <section id="alunos" className="section-padding bg-darker">
        <div className="container">
          <span className="tagline">Turma</span>
          <h2>Nossos Alunos</h2>

          <div className="search-container" style={{ marginBottom: '40px', maxWidth: '500px' }}>
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou skill (ex: Esforçado)..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid-alunos">
            {alunosFiltrados.map(aluno => (
              <Card
                key={aluno.id}
                aluno={aluno}
                isCurrentlyPlaying={playingId === aluno.id}
                onPlay={() => handleTogglePlay(aluno.id)}
              />
            ))}
          </div>

          {alunosFiltrados.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '20px', opacity: 0.6 }}>
              Nenhum resultado encontrado para "{searchTerm}".
            </p>
          )}
        </div>
      </section>

      {/* SEÇÃO 4: MEMORIAL */}
      <section id="memorial" ref={memorialRef} className="section-padding" style={{ position: 'relative' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <span className="tagline">Backstage</span>
              <h2>Nossas Memórias</h2>
            </div>
            
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="mute-btn"
              title={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          <div className="galeria-mosaico">
            {memorialData.map((item) => (
              <div key={item.id} className={`galeria-item ${item.tamanho}`}>
                <img src={item.src} alt={item.legenda} loading="lazy" />
                <div className="legenda-overlay">
                  <span>{item.legenda}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;