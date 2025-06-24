const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const randomstring = require("randomstring");

const app = express();
app.use(express.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, "data.json");

let DATA = loadData();
let TROOPS = loadTroops();

// Load Data from file
function loadData() {
    try {
        const contents = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(contents);
    } catch (err) {
        return { groups: [], user_groups: {}, user_troops: {} }; // Default empty structure
    }
}

// Load troops data
function loadTroops() {
    const troopNamesPfFlbx = [
        "Amnéville", "Barr", "Bischwiller-Stattmatten", "Carpentras", "Clermont", "Colmar",
        "Crest", "Franconville", "Hurepoix", "Istres", "Lingolsheim", "Lille", "Marne-et-Morin", "Meulan",
        "Montpellier", "Mulhouse", "Nancy", "Nice", "Pau", "Pontarlier", "Rezé", "Rochefort", "Selestat",
        "Sarrebourg", "Soultz-Woerth", "St-Nazaire", "St-Maur", "Strasbourg", "Vendenheim", "Vichy",
        "Wissenbourg-Geissberg", "Wittenheim"
    ];

    const otherTroopNames = [
        "Amis", "Équipe Nationale",
        "Pionniers EST", "Pionniers IDF", "Pionniers Auvergne"
    ];

    let troops = [];
    troopNamesPfFlbx.forEach(city => {
        troops.push({ id: troops.length + 1, name: `PF ${city}` });
        troops.push({ id: troops.length + 1, name: `FLBX ${city}` });
    });

    otherTroopNames.forEach(city => {
        troops.push({ id: troops.length + 1, name: city });
    });

    //Rearrange alphabetically
    troops.sort((a, b) => a.name.localeCompare(b.name)); //Whatever for IDs not in order, we don't really care
    //Add "Autres" option
    troops.push({ id: 0, name: "Autres" });

    return troops;
}

// Save Data to file
function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DATA, null, 2));
}

// Routes
app.get("/map-data", (req, res) => {
    const layers = [
        {
            id: 1,
            name: "économats",
            icon: "🏦",
            center: [44.5955, 5.01055],
            features: [{ id: 1, name: "économat", lat: 44.5955, lng: 5.01055, path: null }]
        },
        {
            id: 2,
            name: "terrains de camps",
            icon: "⛺",
            center: [44.5955, 5.01055],
            features: [{ id: 2, name: "camp", lat: 44.596, lng: 5.011, path: [[44.596, 5.011], [44.596, 5.012], [44.5955, 5.012], [44.5955, 5.011]] }]
        },
        {
            id: 3,
            name: "infirmerie",
            icon: "🏥",
            center: [44.5955, 5.01055],
            features: [{ id: 3, name: "infirmerie", lat: 44.5958, lng: 5.0107, path: null }]
        }
    ];

    res.json({ version: 1, layers });
});

app.get("/troops", (req, res) => {
    res.json(TROOPS);
});

app.post("/groups", (req, res) => {
    const { name, nickname } = req.body;
    const code = generateCode();
    const group = { name, code };
    DATA.groups.push(group);
    if (!DATA.user_groups[nickname]) DATA.user_groups[nickname] = [];
    DATA.user_groups[nickname].push(code);
    saveData();
    res.json(group);
});

app.post("/groups/join", (req, res) => {
    const { code, nickname } = req.body;
    if (DATA.groups.some(group => group.code === code)) {
        if (!DATA.user_groups[nickname]) DATA.user_groups[nickname] = [];
        DATA.user_groups[nickname].push(code);
        saveData();
        res.status(200).send();
    } else {
        res.status(404).send(`Session with code '${code}' not found`);
    }
});

app.post("/groups/leave", (req, res) => {
    const { code, nickname } = req.body;
    if (DATA.user_groups[nickname]) {
        DATA.user_groups[nickname] = DATA.user_groups[nickname].filter(c => c !== code);
        saveData();
        res.status(200).send();
    } else {
        res.status(404).send(`User ${nickname} is not part of any group with code ${code}`);
    }
});

app.post("/users", (req, res) => {
    const { nickname } = req.body;
    if (!DATA.user_groups[nickname]) DATA.user_groups[nickname] = [];
    saveData();
    res.status(200).send();
});

app.get("/groups/:nick", (req, res) => {
    const nick = req.params.nick;
    const codes = DATA.user_groups[nick] || [];
    const result = DATA.groups.filter(group => codes.includes(group.code));
    res.json(result);
});

// Utility functions
function generateCode() {
    return randomstring.generate({ length: 5, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }).toUpperCase();
}

const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
