const axios = require("axios");

// Link do seu túnel Ngrok atualizado
const API_URL = "https://expressly-noninclusive-bea.ngrok-free.dev";
const API_TOKEN = "TOKEN_SECRETO_AQUI"; 

async function getSaldo(userId) {
    try {
        const res = await axios.get(`${API_URL}/saldo/${userId}`, {
            headers: { 
                // Removi o Authorization temporariamente para teste
                "ngrok-skip-browser-warning": "true" 
            }
        });
        return res.data; 
    } catch (error) {
        // Se der erro, ele vai imprimir a URL exata aqui para conferirmos
        console.error(`Erro ao buscar saldo na URL: ${API_URL}/saldo/${userId}`);
        console.error("Mensagem:", error.message);
        throw error;
    }
}

// Criando a função que estava faltando para o erro sumir
async function depositar(userId, valor) {
    try {
        const res = await axios.post(`${API_URL}/deposito`, {
            userId,
            valor
        }, {
            headers: { 
                Authorization: API_TOKEN,
                "ngrok-skip-browser-warning": "true"
            }
        });
        return res.data;
    } catch (error) {
        console.error("Erro ao realizar depósito:", error.message);
        throw error;
    }
}

// Exportando ambas as funções corretamente
module.exports = {
    getSaldo,
    depositar
};