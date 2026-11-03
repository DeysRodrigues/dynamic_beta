import { useParams } from "react-router-dom";
import { useCustomWidgetStore } from "@/store/useCustomWidgetStore";
import { useEffect, useState } from "react";
import { HydrationGate } from "@/components/layout/HydrationGate";

function CustomWidget() {
  const { id } = useParams();
  const { getWidget } = useCustomWidgetStore();
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    if (id) {
      const widget = getWidget(id);
      if (widget) {
        // Monta o HTML completo
        const doc = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; overflow: hidden; font-family: sans-serif; }
                /* User CSS */
                ${widget.css}
              </style>
            </head>
            <body>
              ${widget.html}
              
              <script>
                try {
                  ${widget.js}
                } catch (err) {
                  console.error("Erro no Widget:", err);
                }
              </script>
            </body>
          </html>
        `;
        setSrcDoc(doc);
      }
    }
  }, [id, getWidget]);

  if (!srcDoc) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-400">
        Widget não encontrado ou código vazio.
      </div>
    );
  }

  return (
    <iframe
      srcDoc={srcDoc}
      className="w-full h-screen"
      title={`Custom Widget ${id}`}
      sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin" // Basic security
    />
  );
}

export default function CustomWidgetViewer() {
  return (
    <HydrationGate>
      <CustomWidget />
    </HydrationGate>
  );
}
