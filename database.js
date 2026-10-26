const Database = require('better-sqlite3');
const db = new Database('plants.db');

function initDatabase() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      location TEXT,
      watering_frequency TEXT,
      notes TEXT
    )
  `);

    // 3. Tarkistetaan, onko taulussa jo rivejä (COUNT(*))
    const rowCount = db.prepare('SELECT COUNT(*) AS count FROM plants').get();

    // 4. Database Seeding: Jos count === 0, lisätään 5 esimerkkikasvia Transactionilla
    if (rowCount.count === 0) {
        console.log('Taulu on tyhjä. Lisätään testidata (Seeding)...');

        // Prepared Statement yhdellä rivin lisäykselle
        const insertStmt = db.prepare(`
      INSERT INTO plants (name, species, location, watering_frequency, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

        // Määritellään Transaction, joka ajaa kaikki INSERT-komennot yhtenä atomisena operaationa
        const insertMany = db.transaction((plantsArray) => {
            for (const plant of plantsArray) {
                insertStmt.run(
                    plant.name,
                    plant.species,
                    plant.location,
                    plant.watering_frequency,
                    plant.notes
                );
            }
        });

        // Seed Data Array
        const initialPlants = [
            {
                name: 'Monstera',
                species: 'Monstera deliciosa',
                location: 'Olohuone ikkuna',
                watering_frequency: 'Kerran viikossa',
                notes: 'Kasvaa hyvin'
            },
            {
                name: 'Rauhanlilja',
                species: 'Spathiphyllum',
                location: 'Makuuhuone',
                watering_frequency: 'Kahdesti viikossa',
                notes: 'Pitää varjosta'
            },
            {
                name: 'Kaktus',
                species: 'Echinopsis',
                location: 'Keittiö',
                watering_frequency: 'Kerran kuussa',
                notes: 'Kastele harvoin'
            },
            {
                name: 'Orkidea',
                species: 'Phalaenopsis',
                location: 'Kylpyhuone',
                watering_frequency: 'Kerran viikossa',
                notes: 'Vaatii kosteutta'
            },
            {
                name: 'Joulutähti',
                species: 'Euphorbia pulcherrima',
                location: 'Olohuone pöytä',
                watering_frequency: 'Kahdesti viikossa',
                notes: 'Ei pidä vedosta'
            }
        ];

        // Suoritetaan Transaction
        insertMany(initialPlants);
        console.log('Testidata lisätty onnistuneesti!');
    } else {
        console.log(`Tietokanta valmis (sisältää ${rowCount.count} kasvia).`);
    }
}

// 5. Exportataan db-instanssi ja alustusfunktio CommonJS-syntaksilla
module.exports = { db, initDatabase };