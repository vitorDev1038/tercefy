import { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../../assets/logo-tercefy.png'; 
import ThemeToggle from "../ThemeToggle/ThemeToggle";

function Navbar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear() + 1, 0, 1);
      const total = end - start;
      const current = now - start;
      const percentage = (current / total) * 100;
      setProgress(percentage.toFixed(1));
    };
    calculateProgress();
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left-section">
        <div className="nav-logo">
          <img src={logo} alt="Tercefy Logo" className="logo-img" />
        </div>

        {/* Contador agora fixado à esquerda, logo após a logo */}
        <div className="nav-year-container">
          <div className="year-label">
             <span>Progresso de 2026</span>
             <span>{progress}%</span>
          </div>
          <div className="year-bar-bg">
            <div className="year-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#alunos">Alunos</a></li>
        <li><a href="#memorial">Memorial</a></li>
        <li className="nav-item-toggle">
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;