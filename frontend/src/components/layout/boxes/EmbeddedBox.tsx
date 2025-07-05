import React, { useState, useEffect } from "react";

const EmbeddedBox: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>("https://youtu.be/9kzE8isXlQY?si=AQVX6yVFqDXfRZMc");
  const [embedUrl, setEmbedUrl] = useState<string>("");

  useEffect(() => {
    const converted = convertToEmbed(inputUrl);
    setEmbedUrl(converted);
  }, [inputUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setInputUrl(url);
    const converted = convertToEmbed(url);
    setEmbedUrl(converted);
  };

  const convertToEmbed = (url: string): string => {
    // Link curto do YouTube
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Link normal do YouTube
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Se já for embed ou formato desconhecido, mantém como está
    return url;
  };

  return (
    <div className="bg-gray-100 rounded-3xl p-6 shadow flex flex-col gap-4 overflow-hidden h-full w-full">
      <h2 className="text-lg font-semibold">Conteúdo Embutido Youtube</h2>
      <p>Adicione o que voce quiser :)</p>

      <input
        type="text"
        placeholder="Cole o link normal (YouTube, etc)"
        className="px-3 py-2 rounded bg-white border border-gray-300 w-full"
        value={inputUrl}
        onChange={handleUrlChange}
      />

      {embedUrl && (
        <div className="relative w-full pt-[56.25%] rounded overflow-hidden">
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full rounded no-invert"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default EmbeddedBox;
