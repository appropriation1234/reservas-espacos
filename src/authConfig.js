// src/authConfig.js

export const msalConfig = {
    auth: {
        // Usa as variáveis de ambiente do ficheiro .env
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
        
        // Verifique se a porta aqui é a mesma que você usa para esta aplicação
        redirectUri: "http://localhost:5175" // Porta sugerida para a app de espaços
    },
    cache: {
        cacheLocation: "sessionStorage", 
        storeAuthStateInCookie: false,
    }
};

export const loginRequest = {
    scopes: ["User.Read"]
};