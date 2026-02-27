import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase'; // Verifique se o arquivo chama-se supabase.js
import './memorias.css';

function Memorias({ onUploadSuccess }) {
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foto) return alert("Por favor, selecione uma foto!");

        setEnviando(true);

        try {
            // 1. Nome único para o arquivo
            const nomeArquivo = `${Date.now()}_${foto.name}`;

            // 2. Upload para o Storage (Bucket 'fotos')
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('fotos')
                .upload(nomeArquivo, foto);

            if (uploadError) throw uploadError;

            // 3. Pegar URL pública da imagem
            const { data: publicUrlData } = supabase.storage
                .from('fotos')
                .getPublicUrl(nomeArquivo);

            // 4. Salvar na Tabela 'memorias' (Sem localhost!)
            const { error: dbError } = await supabase
                .from('memorias')
                .insert([{ 
                    legenda: "Momento Tercefy", 
                    imagem_url: publicUrlData.publicUrl 
                }]);

            if (dbError) throw dbError;

            // Avisa o App.jsx para recarregar as fotos
            if (onUploadSuccess) await onUploadSuccess();

            alert("Memória eternizada no Supabase! ✨");
            navigate('/');

        } catch (error) {
            console.error("Erro detalhado:", error);
            alert("Erro: " + (error.message || "Falha na conexão com o Supabase"));
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="memoria-container">
            <div className="memoria-card">
                <h2>Nova Memória (V2) 📸</h2>
                <p className="memoria-subtitle">A versão (V2) usa conexão direta com Supabase.</p>

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
                        {enviando ? "CONECTANDO AO SUPABASE..." : "ETERNIZAR MOMENTO"}
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