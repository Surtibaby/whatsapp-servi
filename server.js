const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Configuración del cliente. LocalAuth almacena la sesión para evitar re-escaneos
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

// Evento que se dispara al generar el QR
client.on('qr', (qr) => {
    // Mostrar el QR en la terminal
    qrcode.generate(qr, { small: true });
    console.log('Escanea el código QR con WhatsApp en tu teléfono.');
});

// Evento cuando el cliente está listo para enviar mensajes
client.on('ready', () => {
    console.log('Cliente de WhatsApp está listo!');
});

// Inicializar el cliente
client.initialize();

// Endpoint para enviar mensajes
app.post('/send', async (req, res) => {
    const { number, message } = req.body;
    // WhatsApp identifica a cada usuario por su ID (ej: 521234567890@c.us)
    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
    try {
        const response = await client.sendMessage(chatId, message);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint opcional para obtener el QR en caso de querer mostrarlo en la web
// (En este ejemplo solo se muestra por consola)
app.get('/qr', (req, res) => {
    // Puedes implementar la lógica para retornar el código QR actual
    res.send('Esta funcionalidad se puede ampliar para devolver el QR en tiempo real.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Express ejecutándose en el puerto ${PORT}`));
