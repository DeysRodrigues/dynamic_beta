import React from "react";
import { Loader2 } from "lucide-react";

export const BoxLoader = React.memo(() => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-current/5 animate-pulse rounded-2xl backdrop-blur-sm">
    <Loader2 className="w-6 h-6 animate-spin opacity-50" />
    <span className="text-[10px] font-bold opacity-40 mt-2 uppercase tracking-widest">
      Carregando...
    </span>
  </div>
));
