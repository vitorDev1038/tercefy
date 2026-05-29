import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Conexão com Supabase
import { supabase } from './supabase.js'; 

// Componentes
import Navbar from "./components/NavBar/Navbar.jsx";
import Card from "./components/Card/Card.jsx";
import Footer from './components/Footer/Footer';
import Memorias from "./components/Memorias/Memorias.jsx";

// Assets
import logoGrande from './assets/logo-tercethunder1.png';
import { alunosData } from './data/alunos';
import trilhaMemorial from './assets/trilha-memorial.mp3';
import qrCodeSpotify from './assets/qrcodeSpotify.jpeg';

function App() {
  const [playingId, setPlayingId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [memoriasDB, setMemoriasDB] = useState([]);

  const memorialRef = useRef(null);
  const trilhaRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  // Função para verificar se o arquivo é vídeo
  const isVideo = (url) => {
    return url?.match(/\.(mp4|webm|ogg|mov)$/i) || url?.includes('video');
  };

  const fetchMemorias = async () => {
    try {
      const { data, error } = await supabase
        .from('memorias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setMemoriasDB(data);
    } catch (error) {
      console.error("Erro ao buscar memórias no Supabase:", error);
    }
  };

  useEffect(() => {
    fetchMemorias();
  }, []);

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
        trilhaRef.current.volume = Math.max(0, Math.min(1, trilhaRef.current.volume + volumeStep));
        currentStep++;
      } else {
        clearInterval(fadeIntervalRef.current);
      }
    }, intervalTime);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playingId && !isMuted) {
          trilhaRef.current.play().then(() => fadeVolume(0.1, 2000)).catch(() => { });
        } else {
          fadeVolume(0, 1000);
        }
      },
      { threshold: 0.1 }
    );
    if (memorialRef.current) observer.observe(memorialRef.current);
    return () => observer.disconnect();
  }, [playingId, isMuted]);

  const handleTogglePlay = (id) => {
    setPlayingId(prevId => {
      const newId = prevId === id ? null : id;
      if (newId !== null) fadeVolume(0, 500);
      return newId;
    });
  };

  const alunosFiltrados = alunosData.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.skillPrincipal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Home = () => (
    <>
      <section id="home" className="hero">
        <div className="hero-content">
          <img src={logoGrande} alt="Logo TerceThunder" className="logo-hero-animada" />
          <p className="subtitle">Como águias, voamos alto rumo ao futuro.</p>
          <a href="#sobre" className="btn-explorar">Alçar voo</a>
        </div>
      </section>

      {/* Seção Sobre Omitida aqui para brevidade, mas deve ser mantida no seu código */}
      <section id="sobre" className="section-padding">
        <div className="container">
          <div className="sobre-grid-master">
            <div className="sobre-esquerda">
              <div className="texto-principal">
                <h3>Por que TerceThunder?</h3>
                <p>
                  O nome <strong>TerceThunder</strong> representa nossa força e visão como águias.
                  Unindo a essência do nosso último ano escolar com a potência que o Desenvolvimento de Sistemas nos proporciona.
                  Somos águias que voam alto, onde cada aluno traz uma centelha de raio essencial para iluminar nosso caminho coletivo.
                </p>
              </div>

              <div className="detalhes-tecnicos">
                <div className="detalhe-card">
                  <h4>⚡ Visão de Águia</h4>
                  <p>Como águias, enxergamos longe. O TerceThunder nasceu para eternizar nossa jornada no SENAI e SESI com precisão e foco.</p>
                </div>
                <div className="detalhe-card">
                  <h4>🦅 Voo em Formação</h4>
                  <p>32 águias únicas, voando juntas rumo ao futuro através da tecnologia e inovação.</p>
                </div>
              </div>
            </div>

            <div className="sobre-direita">
              <div className="qr-card-glass">
                <div className="qr-content-top">
                  <h3>Playlist TerceThunder</h3>
                  <p className="escaneie">Escaneie para ouvir a trilha TerceThunder.</p>
                  <img src={qrCodeSpotify} alt="QR Code" className="qr-code-img" />
                </div>
                <a href="https://spotify.com" target="_blank" rel="noreferrer" className="btn-spotify-link">
                  Abrir no Spotify
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="alunos" className="section-padding bg-darker">
        <div className="container">
          <h2 className='h2Card'>Nossos Alunos</h2>
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="grid-alunos">
            {alunosFiltrados.map(aluno => (
              <Card key={aluno.id} aluno={aluno} isCurrentlyPlaying={playingId === aluno.id} onPlay={() => handleTogglePlay(aluno.id)} />
            ))}
          </div>
        </div>
      </section>

      <section id="memorial" ref={memorialRef} className="section-padding">
        <div className="container">
          <div className="memorial-header">
            <h2 className='h2Memorial'>Nossas Memórias</h2>
            <button onClick={() => setIsMuted(!isMuted)} className="mute-btn">
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          <div className="galeria-mosaico">
            {memoriasDB.length > 0 ? (
              memoriasDB.map((item) => (
                <div key={item.id} className="galeria-item">
                  {isVideo(item.imagem_url) ? (
                    <video 
                      src={item.imagem_url} 
                      className="media-item" 
                      controls 
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.imagem_url}
                      alt="Memória"
                      className="media-item"
                      onError={(e) => { e.target.closest('.galeria-item').style.display = 'none'; }}
                    />
                  )}
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', width: '100%', opacity: 0.5 }}>Carregando momentos eternizados...</p>
            )}
          </div>
        </div>
      </section>
    </>
  );

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <audio ref={trilhaRef} src={trilhaMemorial} loop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/memorias" element={<Memorias onUploadSuccess={fetchMemorias} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;