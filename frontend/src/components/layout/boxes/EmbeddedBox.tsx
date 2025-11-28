import { useState, useEffect } from "react";

export default function EmbeddedBox() {
  const [inputUrl, setInputUrl] = useState<string>("https://youtu.be/9kzE8isXlQY?si=AQVX6yVFqDXfRZMc");
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [isCleanMode, setIsCleanMode] = useState<boolean>(false); // Estado para controlar a visibilidade

  const tags = [
    { name: "YouTube", color: "bg-red-100 text-red-600 border-red-200" },
    { name: "Spotify", color: "bg-green-100 text-green-600 border-green-200" },
    { name: "Figma", color: "bg-purple-100 text-purple-600 border-purple-200" },
    { name: "CodePen", color: "bg-gray-100 text-gray-800 border-gray-300" },
    { name: "Loom", color: "bg-blue-100 text-blue-600 border-blue-200" },
  ];

  useEffect(() => {
    setEmbedUrl(convertToEmbed(inputUrl));
  }, [inputUrl]);

 const convertToEmbed = (url: string): string => {
    try {
      if (!url) return "";

      // --- YOUTUBE (Lógica Atualizada para Playlists) ---
      
      // Caso 1: Link direto da Playlist (youtube.com/playlist?list=...)
      if (url.includes("youtube.com/playlist")) {
        const listId = url.split("list=")[1]?.split("&")[0];
        return `https://www.youtube.com/embed/videoseries?list=${listId}`;
      }

      // Caso 2: Vídeo normal OU Vídeo dentro de Playlist
      if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("v=")[1]?.split("&")[0];
        let embedLink = `https://www.youtube.com/embed/${videoId}`;
        
        // Se tiver o parâmetro &list=, a gente adiciona ele de volta no embed
        if (url.includes("&list=")) {
          const listId = url.split("&list=")[1]?.split("&")[0];
          embedLink += `?list=${listId}`;
        }
        
        return embedLink;
      }
      
      if (url.includes("youtu.be/")) {
        return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]?.split("?")[0]}`;
      }

      if (url.includes("codepen.io")) {
         return url.replace(/\/pen\/|\/full\//, "/embed/").split("?")[0] + "?theme-id=dark&default-tab=html,result&editable=true";
      }


      return url;
    } catch {
      return url;
    }
  };
  return (
    <div className={`box-padrao flex flex-col w-full max-w-2xl mx-auto transition-all duration-300 ${isCleanMode ? 'p-0 bg-transparent shadow-none' : 'p-4 bg-white shadow-sm'}`}>
      
      {/* Cabeçalho com Título e Botão de Toggle */}
      <div className="flex justify-between items-center mb-3">
        {!isCleanMode && (
           <h2 className="text-lg font-semibold text-gray-800">Embed Universal</h2>
        )}
        
        {/* Botão para mostrar/esconder controles */}
        <button 
          onClick={() => setIsCleanMode(!isCleanMode)}
          className={`p-2 rounded-full hover:bg-gray-100 transition-colors ml-auto ${isCleanMode ? 'bg-white shadow-md mb-2' : ''}`}
          title={isCleanMode ? "Mostrar controles" : "Esconder controles (Modo Foco)"}
        >
          {isCleanMode ? (
            // Ícone de "Olho Aberto" (Mostrar)
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          ) : (
            // Ícone de "Olho Fechado" (Esconder) - ou Maximizar
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
          )}
        </button>
      </div>

      {/* Área de Controles (Tags e Input) - Só renderiza se NÃO estiver no modo Clean */}
      {!isCleanMode && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span key={tag.name} className={`px-2 py-1 rounded-md text-xs font-medium border ${tag.color}`}>
                {tag.name}
              </span>
            ))}
          </div>

          <input
            type="text"
            placeholder="Cole seu link aqui..."
            className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm w-full mb-4 outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
        </div>
      )}

      {/* Container do Embed */}
      <div className={`flex-1 relative w-full bg-gray-900 overflow-hidden shadow-lg border border-gray-100 transition-all duration-500 ${isCleanMode ? 'rounded-none min-h-[500px]' : 'rounded-xl min-h-[400px]'}`}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; presentation"
            allowFullScreen
            loading="lazy"
            title="Embedded Content"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm bg-gray-50">
            Insira um link válido para visualizar
          </div>
        )}
      </div>
    </div>
  );
}