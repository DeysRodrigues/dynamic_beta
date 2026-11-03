import React, { useState, useRef } from "react";
import { Camera, Save, User, X } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { DEFAULT_AVATAR } from "@/lib/defaultAvatar";

export const ProfileEditModal = ({ onClose }: { onClose: () => void }) => {
  const { name, subtitle, avatar, setName, setSubtitle, setAvatar } =
    useUserStore();
  const [localName, setLocalName] = useState(name);
  const [localSub, setLocalSub] = useState(subtitle);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setName(localName);
    setSubtitle(localSub);
    onClose();
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
      <div className="bg-[#18181b] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <X size={24} />
        </button>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <User size={20} /> Editar Perfil
        </h3>
        <div className="flex flex-col items-center gap-4 mb-6">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={avatar || DEFAULT_AVATAR}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/10 group-hover:border-purple-500 transition-all"
              alt="Profile"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFile}
            />
          </div>
          <p className="text-xs text-white/40">Clique para alterar foto</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-white/50 uppercase ml-1">
              Nome
            </label>
            <input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-white/50 uppercase ml-1">
              Subtítulo
            </label>
            <input
              value={localSub}
              onChange={(e) => setLocalSub(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="w-full mt-6 bg-primary hover:opacity-90 text-primary-foreground font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Save size={18} /> Salvar
        </button>
      </div>
    </div>
  );
};
