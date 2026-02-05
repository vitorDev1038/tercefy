import { useNavigate } from 'react-router-dom';
import './Footer.css';
import logo from '../../assets/logo-tercefy.png';

function Footer() {
  const anoAtual = new Date().getFullYear();
  const navigate = useNavigate();

  const handleSecretClick = () => {
    navigate('/memorias');
  };

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          {/* O SEGREDO AGORA ESTÁ AQUI */}
          <button className="logo-btn-secreto" onClick={handleSecretClick} title="Acesso Restrito">
            <img src={logo} alt="Tercefy Logo" className="footer-logo" />
          </button>
          <p>A playlist oficial da turma que codifica o futuro.</p>
        </div>

        <div className="footer-links">
          <h4>Navegação</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#sobre">Sobre</a></li>
            <li><a href="#alunos">Artistas</a></li>
            <li><a href="#memorial">Memorial</a></li>
          </ul>
        </div>

        <div className="footer-feedback">
          <h4>Feedback da Turma</h4>
          <p>O que acha da turma?</p>
          <a href="#" className="btn-feedback">Deixar Depoimento</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {anoAtual} Tercefy - Desenvolvido por alunos do <strong>SENAI & SESI</strong></p>
      </div>
    </footer>
  );
}

export default Footer;