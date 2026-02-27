import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import './memorias.css';

function Memorias({ onUploadSuccess }) {
    const [arquivo, setArquivo] = useState(null); // Alterado de 'foto' para 'arquivo'
    const [preview, setPreview] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [listaMemorias, setListaMemorias] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMemorias();
    }, []);

    const fetchMemorias = async () => {
        const { data, error } = await supabase
            .from('memorias')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setListaMemorias(data);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validação de tamanho (50MB limite Supabase Free)
            if (file.size > 50 * 1024 * 1024) {
                alert("O arquivo é muito grande! O limite é 50MB.");
                return;
            }
            setArquivo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!arquivo) return alert("Por favor, selecione uma foto ou vídeo!");
        setEnviando(true);

        try {
            const nomeArquivo = `${Date.now()}_${arquivo.name}`;

            // 1. Upload Storage
            const { error: uploadError } = await supabase.storage
                .from('fotos')
                .upload(nomeArquivo, arquivo);
            if (uploadError) throw uploadError;

            // 2. Pegar URL
            const { data: publicUrlData } = supabase.storage
                .from('fotos')
                .getPublicUrl(nomeArquivo);

            // 3. Salvar no Banco
            const { error: dbError } = await supabase
                .from('memorias')
                .insert([{ 
                    legenda: "Momento Tercefy", 
                    imagem_url: publicUrlData.publicUrl 
                }]);
            if (dbError) throw dbError;

            alert("Memória eternizada! ✨");
            setArquivo(null);
            setPreview(null);
            fetchMemorias();
            if (onUploadSuccess) onUploadSuccess();

        } catch (error) {
            alert("Erro ao salvar: " + error.message);
        } finally {
            setEnviando(false);
        }
    };

    const handleDeletar = async (id, url) => {
        if (!confirm("Deseja realmente excluir esta memória?")) return;

        try {
            const nomeArquivo = url.split('/').pop();
            await supabase.storage.from('fotos').remove([nomeArquivo]);
            const { error } = await supabase.from('memorias').delete().eq('id', id);

            if (error) throw error;

            alert("Memória removida!");
            fetchMemorias();
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            alert("Erro ao deletar: " + error.message);
        }
    };

    // Função para verificar se a URL é de vídeo
    const isVideo = (url) => {
        return url?.match(/\.(mp4|webm|ogg|mov)$/i) || url?.includes('video');
    };

    return (
        <div className="memoria-container">
            <div className="memoria-card">
                <h2>Gerenciar Memórias 📸🎬</h2>
                
                <form onSubmit={handleSubmit} className="memoria-form">
                    <div className="upload-section">
                        <label htmlFor="file-upload" className="custom-file-upload">
                            {arquivo ? `✅ ${arquivo.name}` : "Escolher Foto ou Vídeo"}
                        </label>
                        <input 
                            id="file-upload" 
                            type="file" 
                            accept="image/*,video/*" 
                            onChange={handleFileChange} 
                        />  
                    </div>

                    {preview && (
                        <div className="preview-container">
                            {arquivo?.type.startsWith('video') ? (
                                <video src={preview} controls className="img-preview" />
                            ) : (
                                <img src={preview} alt="Preview" className="img-preview" />
                            )}
                        </div>
                    )}

                    <button type="submit" className="btn-eternizar" disabled={enviando}>
                        {enviando ? "SALVANDO..." : "ADICIONAR MOMENTO"}
                    </button>
                </form>

                <hr className="divisor" />

                <div className="lista-remocao">
                    <h3>Arquivos Existentes</h3>
                    <div className="mini-grid">
                        {listaMemorias.map((item) => (
                            <div key={item.id} className="item-remocao">
                                {isVideo(item.imagem_url) ? (
                                    <video src={item.imagem_url} muted className="mini-media" />
                                ) : (
                                    <img src={item.imagem_url} alt="Thumbnail" className="mini-media" />
                                )}
                                <button 
                                    onClick={() => handleDeletar(item.id, item.imagem_url)}
                                    className="btn-deletar"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => navigate('/')} className="btn-voltar-link">
                    ← Voltar para a Home
                </button>
            </div>
        </div>
    );
}

export default Memorias;