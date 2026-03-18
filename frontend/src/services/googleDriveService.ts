// src/services/googleDriveService.ts

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// src/services/googleDriveService.ts

const SCOPES = "https://www.googleapis.com/auth/drive.file";
const BACKUP_FILE_NAME = "dynabox_backup_v1.json";
const STORAGE_TOKEN_KEY = "gdrive_access_token";
const STORAGE_EXPIRY_KEY = "gdrive_token_expiry";

let tokenClient: any;
let accessToken: string | null = null;

// --- GERENCIAMENTO DE TOKEN LOCAL ---

const saveTokenLocally = (token: string, expiresInSeconds: number) => {
  const expiryTime = Date.now() + (expiresInSeconds * 1000);
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_EXPIRY_KEY, expiryTime.toString());
};

const clearTokenLocally = () => {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_EXPIRY_KEY);
  accessToken = null;
};

const loadTokenFromStorage = () => {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  const expiry = localStorage.getItem(STORAGE_EXPIRY_KEY);

  if (token && expiry) {
    if (Date.now() < parseInt(expiry)) {
      // Token ainda é válido
      accessToken = token;
      return true;
    } else {
      // Token venceu
      clearTokenLocally();
      return false;
    }
  }
  return false;
};

// --- FUNÇÕES EXPORTADAS ---

export const initGoogleAuth = (onSuccess: (token?: string) => void) => {
  // 1. Tenta recuperar token salvo antes de tudo
  const hasValidToken = loadTokenFromStorage();
  if (hasValidToken && accessToken) {
    onSuccess(accessToken);
  }

  // 2. Carrega o script do Google para login futuro
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = () => {
   
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.access_token) {
          const token = response.access_token;
          accessToken = token;
          // Salva o token (o Google geralmente retorna expires_in = 3599 segundos)
          saveTokenLocally(token, response.expires_in || 3600);
          onSuccess(token);
        } else {
            console.error("Erro ao obter token:", response);
        }
      },
    });
  };
  document.body.appendChild(script);
};

export const loginToGoogle = () => {
  if (tokenClient) {
    // Solicita novo token (popup)
    tokenClient.requestAccessToken({ prompt: 'consent' }); 
  }
};

export const logoutGoogle = () => {
  clearTokenLocally();
  // Revoga permissão no Google (Opcional, mas recomendado para logout real)
  if (accessToken && (window as any).google) {
    (window as any).google.accounts.oauth2.revoke(accessToken, () => {
      console.log('Permissão revogada');
    });
  }
};

// --- FETCH COM AUTH ---

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (!accessToken) throw new Error("Não autenticado");

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (res.status === 401) {
        clearTokenLocally(); // Limpa se estiver inválido
        throw new Error("SESSAO_EXPIRADA"); 
    }

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro API (${res.status}): ${errorText}`);
    }

    return res;
};

// --- MÉTODOS DE ARQUIVO (IGUAIS AO ANTERIOR) ---

export const findBackupFile = async () => {
  const query = `name = '${BACKUP_FILE_NAME}' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name, modifiedTime)`;
  const res = await fetchWithAuth(url);
  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
};

export const saveBackupToDrive = async (jsonData: any) => {
  const fileContent = new Blob([JSON.stringify(jsonData)], { type: "application/json" });
  const existingFile = await findBackupFile();

  if (existingFile) {
    await fetchWithAuth(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`, {
      method: "PATCH",
      body: fileContent,
    });
    return { status: "updated", time: existingFile.modifiedTime };
  } else {
    const metadata = { name: BACKUP_FILE_NAME, mimeType: "application/json" };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", fileContent);
    await fetchWithAuth("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      body: form,
    });
    return { status: "created" };
  }
};

export const downloadBackupFromDrive = async () => {
  const file = await findBackupFile();
  if (!file) throw new Error("Nenhum backup encontrado.");
  const res = await fetchWithAuth(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`);
  return await res.json();
};