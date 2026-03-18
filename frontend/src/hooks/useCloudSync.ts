import { useState, useEffect } from "react";
import { initGoogleAuth, loginToGoogle, logoutGoogle, saveBackupToDrive, downloadBackupFromDrive } from "@/services/googleDriveService"; // Adicione logoutGoogle
import { gatherAllData, restoreAllData, getLastSyncTime } from "@/utils/syncUtils";

export const useCloudSync = () => {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [lastSync, setLastSync] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ao iniciar, o initGoogleAuth agora verifica o localStorage
    initGoogleAuth(() => {
      // Se tiver token salvo, já conecta direto
      setIsGoogleConnected(true);
      setSyncStatus("Conectado");
    });
    setLastSync(getLastSyncTime());
  }, []);

  const handleLogin = () => {
    loginToGoogle();
  };

  // --- NOVA FUNÇÃO DE LOGOUT ---
  const handleLogout = () => {
    logoutGoogle();
    setIsGoogleConnected(false);
    setSyncStatus("");
  };

  const handleCloudSave = async () => {
    setIsLoading(true);
    setSyncStatus("Salvando...");
    
    try {
      const data = gatherAllData();
      await saveBackupToDrive(data);
      setSyncStatus("Salvo com sucesso!");
      setLastSync(getLastSyncTime()); 
      setTimeout(() => setSyncStatus("Conectado"), 3000);
    } catch (error: any) {
      console.error(error);
      if (error.message === "SESSAO_EXPIRADA") {
        setSyncStatus("Sessão expirada");
        setIsGoogleConnected(false); // Força reconexão
      } else {
        setSyncStatus("Erro ao salvar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloudLoad = async () => {
    if (!window.confirm("CUIDADO: Isso vai substituir seus dados locais pelos da nuvem. Continuar?")) return;

    setIsLoading(true);
    setSyncStatus("Baixando...");
    
    try {
      const data = await downloadBackupFromDrive();
      const success = restoreAllData(data);
      
      if (success) {
        alert("Backup restaurado! A página será recarregada.");
        window.location.reload(); 
      }
    } catch (error: any) {
      if (error.message === "SESSAO_EXPIRADA") {
        setSyncStatus("Sessão expirada");
        setIsGoogleConnected(false);
      } else {
        setSyncStatus("Erro/Sem Backup");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isGoogleConnected,
    syncStatus,
    lastSync,
    isLoading,
    handleLogin,
    handleLogout, // Não esqueça de retornar isso
    handleCloudSave,
    handleCloudLoad
  };
};