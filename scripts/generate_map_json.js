const fs = require('fs');
const path = require('path');

// 16000 x 16000 Hardcoded Vrindavan Map Generator
const trees = [];
const bushes = [];
const rocks = [];

// Helper to check clearance from key landmark safe zones
function isSafeZone(x, y) {
    // Border margin
    if (x < 600 || x > 14350 || y < 600 || y > 15400) return false;

    // East Yamuna River (x >= 14400)
    if (x > 14350) return false;

    // Central Sacred Meeting Glade (Center: 8000, 7800)
    // Generous 1050px clearance so the central meeting place is open, spacious, and uncluttered!
    const distCenter = Math.hypot(x - 8000, y - 7800);
    if (distCenter < 1050) return false;

    const distKadamba = Math.hypot(x - 8000, y - 7400);
    if (distKadamba < 750) return false;

    // Volleyball Court Safety Box (Court: 13200-14100, 7720-8280)
    if (x >= 13000 && x <= 14250 && y >= 7500 && y <= 8500) return false;

    // Kamal Sarovar Pond Water Bed (Center: 8000, 12000, r: 340)
    const distSarovar = Math.hypot(x - 8000, y - 12000);
    if (distSarovar < 360) return false;

    return true;
}

function addTree(x, y, type, r, res) {
    if (!isSafeZone(x, y)) return;
    for (const t of trees) {
        if (Math.hypot(x - t.x, y - t.y) < 145) return;
    }
    trees.push({ x, y, type, r, res });
}

function addBush(x, y, r = 40, res = 'flower') {
    if (!isSafeZone(x, y)) return;
    // Don't overlap directly on tree trunks (keep >= 55px)
    for (const t of trees) {
        if (Math.hypot(x - t.x, y - t.y) < 55) return;
    }
    for (const b of bushes) {
        if (Math.hypot(x - b.x, y - b.y) < 70) return;
    }
    bushes.push({ x, y, r, res });
}

function addRock(x, y, r = 46) {
    if (!isSafeZone(x, y)) return;
    for (const t of trees) {
        if (Math.hypot(x - t.x, y - t.y) < 55) return;
    }
    for (const rk of rocks) {
        if (Math.hypot(x - rk.x, y - rk.y) < 65) return;
    }
    rocks.push({ x, y, r });
}

// ----------------------------------------------------------------------
// 1. CENTRAL GLADE PERIMETER RING (Radius ~1150 - 1500 from 8000, 7800)
// Stripped tight inner trees so the central meeting glade is wide open and peaceful!
// ----------------------------------------------------------------------
for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
    const dist1 = 1180 + (Math.sin(angle * 3) * 60);
    const tx1 = Math.round(8000 + Math.cos(angle) * dist1);
    const ty1 = Math.round(7800 + Math.sin(angle) * dist1);
    addTree(tx1, ty1, (Math.floor(angle * 2) % 2 === 0) ? 'kadamba' : 'parijat', 88, (Math.floor(angle * 2) % 2 !== 0) ? 'flower' : null);

    const dist2 = 1450 + (Math.cos(angle * 2) * 80);
    const tx2 = Math.round(8000 + Math.cos(angle + 0.2) * dist2);
    const ty2 = Math.round(7800 + Math.sin(angle + 0.2) * dist2);
    addTree(tx2, ty2, 'kadamba', 92, null);

    // Accenting bushes on outer perimeter
    const bx = Math.round(8000 + Math.cos(angle + 0.1) * (dist1 + 180));
    const by = Math.round(7800 + Math.sin(angle + 0.1) * (dist1 + 180));
    addBush(bx, by, 42, 'flower');
}

// ----------------------------------------------------------------------
// 2. NORTH: ANCIENT KADAMBA FOREST (कदम्ब कानन - x: 6200-9800, y: 1200-6400)
// ----------------------------------------------------------------------
for (let y = 1400; y <= 6400; y += 620) {
    for (let x = 6400; x <= 9600; x += 580) {
        // Stagger every second row
        const offsetX = (Math.floor(y / 620) % 2 === 0) ? 0 : 260;
        const tx = x + offsetX;
        const ty = y + ((tx % 3) * 20);
        addTree(tx, ty, 'kadamba', 90, null);

        if ((x + y) % 580 === 0) {
            addBush(tx + 130, ty + 100, 40, 'flower');
        }
    }
}

// ----------------------------------------------------------------------
// 3. NORTH-WEST: DIVINE NIKUNJA & PARIJAT GROVES (x: 1400-6200, y: 1200-6400)
// ----------------------------------------------------------------------
for (let y = 1400; y <= 6400; y += 640) {
    for (let x = 1600; x <= 6200; x += 600) {
        const offsetY = (Math.floor(x / 600) % 2 === 0) ? 0 : 250;
        const tx = x;
        const ty = y + offsetY;
        const treeType = (x + y) % 1200 === 0 ? 'kadamba' : 'parijat';
        addTree(tx, ty, treeType, 82, treeType === 'parijat' ? 'flower' : null);

        if ((x + y) % 600 === 0) {
            addBush(tx + 130, ty - 90, 42, 'flower');
            addBush(tx - 120, ty + 90, 40, 'flower');
        }
    }
}

// ----------------------------------------------------------------------
// 4. WEST: GRAND SWEET MANGO ORCHARDS (आम्र वाटिका - x: 1400-6400, y: 6600-9800)
// ----------------------------------------------------------------------
for (let y = 6800; y <= 9800; y += 560) {
    for (let x = 1600; x <= 6400; x += 560) {
        const offsetX = (Math.floor(y / 560) % 2 === 0) ? 0 : 240;
        const tx = x + offsetX;
        const ty = y;
        addTree(tx, ty, 'mango', 90, 'fruit');

        if ((x + y) % 560 === 0) {
            addBush(tx + 120, ty + 80, 40, 'flower');
        }
    }
}

// ----------------------------------------------------------------------
// 5. SOUTH-WEST: GOVARDHAN HILL & BOULDER GROVES (x: 1400-6400, y: 10200-14800)
// ----------------------------------------------------------------------
for (let y = 10400; y <= 14800; y += 680) {
    for (let x = 1600; x <= 6400; x += 640) {
        const offsetY = (Math.floor(x / 640) % 2 === 0) ? 0 : 280;
        const tx = x;
        const ty = y + offsetY;
        const isBanyan = ((x + y) % 1280 === 0);
        addTree(tx, ty, isBanyan ? 'banyan' : 'kadamba', isBanyan ? 112 : 90, null);

        // Govardhan mossy boulders
        if ((x + y) % 680 === 0) {
            addRock(tx + 160, ty + 120, 52);
            addRock(tx - 150, ty - 110, 46);
            addBush(tx + 120, ty - 100, 40, 'flower');
        }
    }
}

// ----------------------------------------------------------------------
// 6. SOUTH: SACRED KAMAL SAROVAR PERIMETER & GROVES (x: 6400-9600, y: 10200-14800)
// ----------------------------------------------------------------------
// Perimeter ring around Kamal Sarovar (radius 440 to 750)
for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
    const dist = 480 + (Math.sin(angle * 2) * 50);
    const tx = Math.round(8000 + Math.cos(angle) * dist);
    const ty = Math.round(12000 + Math.sin(angle) * dist);
    addTree(tx, ty, 'parijat', 82, 'flower');

    // Stepping stones and shoreline flora
    const sx = Math.round(8000 + Math.cos(angle + 0.25) * 390);
    const sy = Math.round(12000 + Math.sin(angle + 0.25) * 390);
    addRock(sx, sy, 38);

    const bx = Math.round(8000 + Math.cos(angle + 0.15) * 580);
    const by = Math.round(12000 + Math.sin(angle + 0.15) * 580);
    addBush(bx, by, 42, 'flower');
}

// Surrounding south glade trees
for (let y = 10400; y <= 14800; y += 650) {
    for (let x = 6500; x <= 9600; x += 650) {
        addTree(x, y, (x % 1300 === 0) ? 'kadamba' : 'parijat', 88, (x % 1300 === 0) ? null : 'flower');
        if ((x + y) % 650 === 0) {
            addBush(x + 120, y + 90, 40, 'flower');
        }
    }
}

// ----------------------------------------------------------------------
// 7. SOUTH-EAST: SURABHI COW GRAZING MEADOWS & ORCHARDS (x: 9800-12800, y: 9800-14800)
// ----------------------------------------------------------------------
for (let y = 10200; y <= 14800; y += 660) {
    for (let x = 9800; x <= 12600; x += 620) {
        const offsetX = (Math.floor(y / 660) % 2 === 0) ? 0 : 250;
        const tx = x + offsetX;
        const ty = y;
        const type = ((x + y) % 1240 === 0) ? 'banyan' : (((x * 2 + y) % 1860 === 0) ? 'mango' : 'kadamba');
        addTree(tx, ty, type, type === 'banyan' ? 110 : (type === 'mango' ? 88 : 92), type === 'mango' ? 'fruit' : null);

        if ((x + y) % 660 === 0) {
            addBush(tx + 120, ty + 100, 42, 'flower');
        }
    }
}

// ----------------------------------------------------------------------
// 8. NORTH-EAST: AKSHAY VAT & BANYAN SANCTUARY (x: 9800-12800, y: 1200-6400)
// ----------------------------------------------------------------------
for (let y = 1400; y <= 6400; y += 650) {
    for (let x = 9800; x <= 12600; x += 620) {
        const offsetY = (Math.floor(x / 620) % 2 === 0) ? 0 : 260;
        const tx = x;
        const ty = y + offsetY;
        const isBanyan = ((x + y) % 1240 === 0);
        addTree(tx, ty, isBanyan ? 'banyan' : 'kadamba', isBanyan ? 115 : 90, null);

        if ((x + y) % 650 === 0) {
            addBush(tx + 130, ty - 80, 42, 'flower');
        }
    }
}

// ----------------------------------------------------------------------
// 9. EAST: YAMUNA SANDBANK SHORE & TALL PALM TALA VANA (x: 12750-14300, y: 1200-14800)
// ----------------------------------------------------------------------
for (let y = 1400; y <= 14800; y += 460) {
    // Left Sandbank Edge
    addTree(12920, y, 'palm', 56, 'fruit');
    // Right Sandbank Shore
    addTree(14260, y + 210, 'palm', 56, 'fruit');

    // Sand reeds & beach boulders along the Yamuna water edge
    addRock(14220, y + 100, 48);
    addBush(12960, y + 50, 38, 'flower');
}

console.log(`Generated: ${trees.length} trees, ${bushes.length} bushes, ${rocks.length} rocks.`);

// Full Map Configuration
const mapData = {
    name: "Vrindavan Pastures",
    hindiName: "वृन्दावन गोचारण",
    width: 16000,
    height: 16000,
    centerX: 8000,
    centerY: 8000,
    riverWidth: 1600,
    court: {
        x: 13200,
        y: 7720,
        w: 900,
        h: 560,
        netX: 13650,
        playerSide: { minX: 13200, maxX: 13640 },
        krishnaSide: { minX: 13660, maxX: 14100 }
    },
    centralKadamba: {
        x: 8000,
        y: 7400,
        radius: 52,
        visualRadius: 160,
        treeType: 'kadamba'
    },
    restingAsana: {
        x: 8000,
        y: 8000,
        w: 320,
        h: 180
    },
    sarovar: {
        x: 8000,
        y: 12000,
        radius: 340,
        visualRadius: 340
    },
    flowerCarpets: [
        { name: "Central Kadamba Flower Carpet", x: 8000, y: 6850, r: 180 },
        { name: "Central Southern Glade Carpet", x: 8000, y: 8850, r: 180 },
        { name: "West Mango Orchard Flower Carpet", x: 4400, y: 8000, r: 200 },
        { name: "North-West Nikunja Flower Carpet", x: 4200, y: 4400, r: 190 },
        { name: "North Kadamba Grove Flower Carpet", x: 8000, y: 4200, r: 190 },
        { name: "North-East Banyan Sanctuary Carpet", x: 11400, y: 4400, r: 200 },
        { name: "South Kamal Sarovar Shore Carpet", x: 8000, y: 10800, r: 190 },
        { name: "South-West Govardhan Glade Carpet", x: 4400, y: 11400, r: 190 },
        { name: "South-East Pasture Flower Carpet", x: 11400, y: 11400, r: 190 },
        { name: "East Yamuna Sands Riverbank Carpet", x: 12600, y: 6800, r: 180 },
        { name: "East Yamuna Sands Southern Carpet", x: 12600, y: 9200, r: 180 },
        { name: "West Forest Pathway Carpet", x: 6200, y: 8000, r: 170 },
        { name: "East Pasture Trail Carpet", x: 9800, y: 8000, r: 170 }
    ],
    windStreams: [
        {
            id: "north_zephyr",
            name: "Kadamba Zephyr Stream",
            hindi: "कदम्ब पावन समीर (उत्तर से दक्षिण)",
            x: 7850, y: 2400, w: 300, h: 4600,
            dirX: 0, dirY: 1, speedBoost: 220,
            color: "#fde047"
        },
        {
            id: "west_floral_rush",
            name: "Nikunja Floral Rush",
            hindi: "निकुंज पुष्प प्रवाह (पश्चिम से पूर्व)",
            x: 2800, y: 7850, w: 4600, h: 300,
            dirX: 1, dirY: 0, speedBoost: 220,
            color: "#f472b6"
        },
        {
            id: "south_sarovar_breeze",
            name: "Sarovar Lotus Breeze",
            hindi: "सरस्वती व कमल समीर (उत्तर से दक्षिण)",
            x: 7850, y: 9000, w: 300, h: 2600,
            dirX: 0, dirY: 1, speedBoost: 200,
            color: "#a7f3d0"
        },
        {
            id: "yamuna_beach_gale",
            name: "Yamuna Sandbank Gale",
            hindi: "यमुना बालुका समीर (दक्षिण से उत्तर)",
            x: 12850, y: 3200, w: 300, h: 8600,
            dirX: 0, dirY: -1, speedBoost: 240,
            color: "#38bdf8"
        }
    ],
    trees,
    bushes,
    rocks
};

// Write data/vrindavan_pastures.json
fs.writeFileSync(
    path.join(__dirname, '../data/vrindavan_pastures.json'),
    JSON.stringify(mapData, null, 2),
    'utf-8'
);

// Write maps/vrindavan_pastures_data.js
const jsContent = `/**
 * Vrindavan Pastures Hardcoded Map Data (16,000 x 16,000)
 * 100% Handcrafted Layout - ZERO Randomness for perfect deterministic gameplay.
 * Features ${trees.length} majestic trees, ${bushes.length} flowering bushes, ${rocks.length} rocks, and sacred landmarks.
 */
export const VRINDAVAN_PASTURES_DATA = ${JSON.stringify(mapData, null, 2)};
`;

fs.writeFileSync(
    path.join(__dirname, '../maps/vrindavan_pastures_data.js'),
    jsContent,
    'utf-8'
);

console.log("Successfully generated vrindavan_pastures.json and vrindavan_pastures_data.js!");
