// src/services/googleDriveService.ts

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!CLIENT_ID) {
  console.error("ERRO CRÍTICO: VITE_GOOGLE_CLIENT_ID não encontrado no arquivo .env");
}

// src/services/googleDriveService.ts
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const BACKUP_FILE_NAME = "dynabox_backup_v1.json";
const STORAGE_TOKEN_KEY = "gdrive_access_token";
const STORAGE_EXPIRY_KEY = "gdrive_token_expiry";

interface GoogleTokenResponse {
    access_token: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
}

interface GoogleTokenClient {
    requestAccessToken: (options?: { prompt?: string }) => void;
}

declare const google: {
    accounts: {
        oauth2: {
            initTokenClient: (config: {
                client_id: string;
                scope: string;
                callback: (response: GoogleTokenResponse) => void;
            }) => GoogleTokenClient;
            revoke: (token: string, callback: () => void) => void;
        };
    };
};

let tokenClient: GoogleTokenClient | null = null;
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
  script.onerror = () => {
    console.error("Erro ao carregar o script do Google GSI");
    alert("Não foi possível carregar o serviço do Google. Verifique sua conexão.");
  };
  script.onload = () => {
    if (!CLIENT_ID) {
        console.error("CLIENT_ID faltando ao inicializar TokenClient");
        return;
    }

    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response: GoogleTokenResponse) => {
                if (response.access_token) {
                    const token = response.access_token;
                    accessToken = token;
                    // Salva o token (o Google geralmente retorna expires_in = 3599 segundos)
                    saveTokenLocally(token, response.expires_in || 3600);
                    onSuccess(token);
                } else {
                    console.error("Erro na resposta do Google:", response);
                    if (response.error) {
                        alert(`Erro de Autenticação: ${response.error_description || response.error}`);
                    }
                }
            },
        });
        console.log("Google Auth inicializado com sucesso");
    } catch (err) {
        console.error("Falha ao inicializar google.accounts.oauth2:", err);
    }
  };
  document.body.appendChild(script);
};

export const loginToGoogle = () => {
  if (tokenClient) {
    console.log("Solicitando acesso ao Google Drive...");
    // Solicita novo token (popup)
    tokenClient.requestAccessToken({ prompt: 'consent' }); 
  } else {
    console.error("tokenClient não inicializado. Verifique se o CLIENT_ID é válido.");
    alert("O serviço do Google ainda não está pronto. Tente novamente em instantes.");
  }
};

export const logoutGoogle = () => {
  clearTokenLocally();
  // Revoga permissão no Google (Opcional, mas recomendado para logout real)
  if (accessToken && typeof (window as unknown as { google: typeof google }).google !== 'undefined') {
    (window as unknown as { google: typeof google }).google.accounts.oauth2.revoke(accessToken, () => {
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
  const data = (await res.json()) as { files?: { id: string; name: string; modifiedTime: string }[] };
  return data.files && data.files.length > 0 ? data.files[0] : null;
};

export const saveBackupToDrive = async (jsonData: unknown) => {
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