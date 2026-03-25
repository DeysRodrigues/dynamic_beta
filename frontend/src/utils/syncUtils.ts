import { STORAGE_KEYS } from "@/constants/storageKeys";

// Chaves que não estão no seu arquivo de constantes global.
const EXTRA_KEYS = [
  "theme-storage",            // useThemeStore
  "user-profile-storage",     // useUserStore
  "custom-widget-storage",    // useCustomWidgetStore
  "week-storage",             // useWeekStore
  "box-content-storage",      // useBoxContentStore
  "favorite-storage",         // useFavoriteStore (se houver)
  "layout-template-storage",  // useLayoutTemplateStore (se houver)
  "notification-storage"      // useNotificationStore (se houver)
];

export const gatherAllData = () => {
  const bundle: Record<string, unknown> = {};

  // 1. Pega as chaves padronizadas (do constants/storageKeys)
  Object.values(STORAGE_KEYS).forEach((key) => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        bundle[key] = JSON.parse(data);
      } catch {
        bundle[key] = data; // Salva como string se falhar o parse
      }
    }
  });

  // 2. Pega as chaves extras (Temas, Perfil, etc)
  EXTRA_KEYS.forEach((key) => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        bundle[key] = JSON.parse(data);
      } catch {
        bundle[key] = data;
      }
    }
  });

  return {
    metadata: {
      lastSync: Date.now(),
      appVersion: "1.0",
      platform: navigator.userAgent,
    },
    data: bundle,
  };
};

export const restoreAllData = (backupJson: { data?: Record<string, unknown>; metadata?: { lastSync?: number } }) => {
  if (!backupJson || !backupJson.data) return false;

  try {
    // Restaura cada chave no LocalStorage
    Object.keys(backupJson.data).forEach((key) => {
      const value = backupJson.data![key];
      // Garante que seja string para o Zustand ler corretamente
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    });

    // Salva o timestamp para evitar conflitos futuros e mostrar na tela
    if (backupJson.metadata?.lastSync) {
      localStorage.setItem("last_cloud_sync_timestamp", backupJson.metadata.lastSync.toString());
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao restaurar backup:", error);
    return false;
  }
};

// --- A FUNÇÃO QUE FALTAVA ---
export const getLastSyncTime = (): string => {
  const timestamp = localStorage.getItem("last_cloud_sync_timestamp");
  if (!timestamp) return "";
  
  try {
    const date = new Date(parseInt(timestamp));
    // Formata para o padrão brasileiro: DD/MM às HH:MM
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return "";
  }
};