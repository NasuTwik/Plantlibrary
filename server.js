const express = require('express');
const path = require('path');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = 3000;

// Middleware JSON-payloadien lukemiseen
app.use(express.json());

// CORS Middleware: Sallii frontendin kutsua API:a myös suoraan tiedostosta tai Live Serveriltä
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// 1. Alustetaan tietokanta heti palvelimen käynnistyessä
initDatabase();

// Tarjoillaan index.html suoraan juuriosoitteesta (http://localhost:3000)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ENDPOINT 1: GET /plants - Hae kaikki kasvit (.all())
app.get('/plants', (req, res) => {
    try {
        const plants = db.prepare('SELECT * FROM plants').all();
        res.status(200).json(plants);
    } catch (error) {
        console.error('GET /plants error:', error.message);
        res.status(500).json({ error: 'Tietokantavirhe kasvien haussa' });
    }
});

// ENDPOINT 2: GET /plants/:id - Hae yksittäinen kasvi Route Parameterin perusteella (.get())
app.get('/plants/:id', (req, res) => {
    try {
        const { id } = req.params;
        const plant = db.prepare('SELECT * FROM plants WHERE id = ?').get(id);

        // Jos .get() palauttaa undefined, kasvia ei ole olemassa -> 404 Not Found
        if (!plant) {
            return res.status(404).json({ error: 'Kasvia ei löytynyt annetulla ID:llä' });
        }

        res.status(200).json(plant);
    } catch (error) {
        console.error('GET /plants/:id error:', error.message);
        res.status(500).json({ error: 'Tietokantavirhe kasvin haussa' });
    }
});

// Käynnistetään palvelin porttiin 3000
app.listen(PORT, () => {
    console.log(`Server käynnissä: http://localhost:${PORT}`);
    console.log(`API Endpointit:  http://localhost:${PORT}/plants`);
});