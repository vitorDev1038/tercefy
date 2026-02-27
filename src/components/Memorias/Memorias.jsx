import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Certifique-se que o caminho está correto
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
            // 1. Gerar um nome único para a imagem para não sobrescrever
            const nomeArquivo = `${Date.now()}_${foto.name}`;

            // 2. Fazer o Upload para o Storage (Bucket 'fotos')
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('fotos')
                .upload(nomeArquivo, foto);

            if (uploadError) throw uploadError;

            // 3. Pegar a URL pública da imagem que acabamos de subir
            const { data: publicUrlData } = supabase.storage
                .from('fotos')
                .getPublicUrl(nomeArquivo);

            const urlFinal = publicUrlData.publicUrl;

            // 4. Salvar os dados na tabela 'memorias'
            const { error: dbError } = await supabase
                .from('memorias')
                .insert([
                    { 
                        legenda: "Memória Tercefy", // Você pode adicionar um input de legenda depois
                        imagem_url: urlFinal 
                    }
                ]);

            if (dbError) throw dbError;

            // Sucesso!
            if (onUploadSuccess) {
                await onUploadSuccess();
            }

            alert("Memória eternizada no Supabase com sucesso! ✨");
            navigate('/'); 

        } catch (error) {
            console.error("Erro na operação:", error);
            alert("Erro ao salvar: " + (error.message || "Verifique o console"));
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
                        {enviando ? "SALVANDO NO SUPABASE..." : "ETERNIZAR MOMENTO"}
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