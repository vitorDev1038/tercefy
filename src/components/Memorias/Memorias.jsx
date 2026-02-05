import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './memorias.css';

function Memorias({ onUploadSuccess }) {
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null); // Para ver a foto antes de enviar
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

    // Função para lidar com a seleção da imagem
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(file);
            setPreview(URL.createObjectURL(file)); // Gera um link temporário para o preview
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foto) return alert("Por favor, selecione uma foto!");

        setEnviando(true);
        const formData = new FormData();
        formData.append('foto', foto);

        try {
            const response = await fetch('http://localhost:5000/api/memorias', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                // ESSENCIAL: Avisa o App.jsx para buscar os dados novos antes de voltar
                if (onUploadSuccess) {
                    await onUploadSuccess();
                }

                alert("Memória eternizada com sucesso! ✨");
                navigate('/'); // Volta para a Home
            } else {
                alert("Erro ao salvar no servidor. Verifique o console.");
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            alert("Não foi possível conectar ao servidor Python.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="memoria-container">
            <div className="memoria-card">
                <h2>Nova Memória 📸</h2>
                <p className="memoria-subtitle">Selecione um momento especial da turma.</p>

                <form onSubmit={handleSubmit} className="memoria-form">
                    <div className="upload-section">
                        <label htmlFor="file-upload" className="custom-file-upload">
                            {foto ? `✅ ${foto.name}` : "Escolher Foto"}
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />
                    </div>

                    {preview && (
                        <div className="preview-container">
                            <img src={preview} alt="Preview" className="img-preview" />
                        </div>
                    )}

                    <button type="submit" className="btn-eternizar" disabled={enviando}>
                        {enviando ? "ESTABELECENDO CONEXÃO..." : "ETERNIZAR MOMENTO"}
                    </button>
                </form>

                <button onClick={() => navigate('/')} className="btn-voltar-link">
                    ← Cancelar e voltar
                </button>
            </div>
        </div>
    );
}

export default Memorias;