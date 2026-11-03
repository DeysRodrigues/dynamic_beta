import { Edit3 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { DEFAULT_AVATAR } from "@/lib/defaultAvatar";
import NotificationBell from "@/components/layout/NotificationBell";

export function SidebarProfile({ onEditProfile }: { onEditProfile: () => void }) {
  const { name, subtitle, avatar } = useUserStore();

  return (
    <div className="flex flex-col items-center gap-4 w-full mb-8 pt-2">
 
      <div className="w-full flex justify-end -mr-2">
        <NotificationBell />
      </div>

      <div
        className="relative group cursor-pointer flex flex-col items-center"
        onClick={onEditProfile}
        title="Editar Perfil"
      >
        <div className="relative">
          <img
            src={avatar || DEFAULT_AVATAR}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover transition shadow-lg"
          />
          <div className="absolute bottom-0 right-0 bg-white text-black p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity scale-75 shadow-md">
            <Edit3 size={14} />
          </div>
        </div>
        <div className="text-center mt-3 group-hover:scale-105 transition-transform">
          <h2 className="font-bold text-lg tracking-tight text-white">
            {name}
          </h2>
          <p className="text-xs text-white/50 font-medium bg-black/10 px-3 py-1 rounded-full mt-1">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
