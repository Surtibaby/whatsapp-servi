const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const app = express();

let currentQr = null;

app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});

client.on('qr', (qr) => {
    currentQr = qr; // Guarda el QR para mostrarlo después
    console.log('QR recibido. Escanea con tu teléfono.');
});

client.on('ready', () => {
    console.log('Cliente de WhatsApp listo!');
});

client.initialize();

// Ruta para mostrar el QR como imagen PNG
app.get('/qr', async (req, res) => {
    if (!currentQr) {
        return res.send('QR no disponible aún, intenta en unos segundos...');
    }

    try {
        const qrImage = await qrcode.toDataURL(currentQr);
        const html = `
            <html>
                <body style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
                    <h2>Escanea el QR con WhatsApp</h2>
                    <img src="${qrImage}" />
                </body>
            </html>
        `;
        res.send(html);
    } catch (err) {
        res.status(500).send('Error al generar el QR');
    }
});

// Ruta para enviar mensajes
app.post('/send', async (req, res) => {
    const { number, name, orderNumber } = req.body;
    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;

    const message = `
🛎️ *Confirmación de Pedido*

Hola ${name}, tu pedido *#${orderNumber}* ha sido confirmado con éxito. Estará llegando entre 2 y 3 días hábiles.

----------------------------------------
📦 Gracias por comprar con nosotros | Surtibaby 💛
`;

    try {
        const response = await client.sendMessage(chatId, message);
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// Ruta base opcional para que no muestre error
app.get('/', (req, res) => {
    res.send('Servicio WhatsApp API funcionando. Ve a <a href="/qr">/qr</a> para escanear el código QR.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
