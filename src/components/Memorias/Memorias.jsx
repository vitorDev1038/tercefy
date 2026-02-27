import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import './memorias.css';

function Memorias({ onUploadSuccess }) {
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [listaMemorias, setListaMemorias] = useState([]); // Estado para armazenar fotos existentes
    const navigate = useNavigate();

    // Carregar fotos ao abrir a aba
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
            setFoto(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foto) return alert("Por favor, selecione uma foto!");
        setEnviando(true);

        try {
            const nomeArquivo = `${Date.now()}_${foto.name}`;

            // 1. Upload Storage
            const { error: uploadError } = await supabase.storage
                .from('fotos')
                .upload(nomeArquivo, foto);
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
            setFoto(null);
            setPreview(null);
            fetchMemorias(); // Atualiza a lista abaixo
            if (onUploadSuccess) onUploadSuccess();

        } catch (error) {
            alert("Erro ao salvar: " + error.message);
        } finally {
            setEnviando(false);
        }
    };

    // FUNÇÃO PARA REMOVER FOTO
    const handleDeletar = async (id, url) => {
        if (!confirm("Deseja realmente excluir esta memória?")) return;

        try {
            // Extrair o nome do arquivo da URL para deletar no Storage
            const nomeArquivo = url.split('/').pop();

            // 1. Deletar do Storage
            await supabase.storage.from('fotos').remove([nomeArquivo]);

            // 2. Deletar do Banco de Dados
            const { error } = await supabase
                .from('memorias')
                .delete()
                .eq('id', id);

            if (error) throw error;

            alert("Memória removida!");
            fetchMemorias(); // Atualiza a lista
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            alert("Erro ao deletar: " + error.message);
        }
    };

    return (
        <div className="memoria-container">
            <div className="memoria-card">
                <h2>Gerenciar Memórias 📸</h2>
                
                {/* FORMULÁRIO DE ADICIONAR */}
                <form onSubmit={handleSubmit} className="memoria-form">
                    <div className="upload-section">
                        <label htmlFor="file-upload" className="custom-file-upload">
                            {foto ? `✅ ${foto.name}` : "Escolher Nova Foto"}
                        </label>
                        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                    </div>

                    {preview && (
                        <div className="preview-container">
                            <img src={preview} alt="Preview" className="img-preview" />
                        </div>
                    )}

                    <button type="submit" className="btn-eternizar" disabled={enviando}>
                        {enviando ? "SALVANDO..." : "ADICIONAR MOMENTO"}
                    </button>
                </form>

                <hr className="divisor" />

                {/* LISTA DE REMOÇÃO */}
                <div className="lista-remocao">
                    <h3>Fotos Existentes</h3>
                    <div className="mini-grid">
                        {listaMemorias.map((item) => (
                            <div key={item.id} className="item-remocao">
                                <img src={item.imagem_url} alt="Thumbnail" />
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