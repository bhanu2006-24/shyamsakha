# 🦚 Shyam Sakha (श्याम सखा)
### *The Transcendental Pastimes of Shree Krishna & His Friends in Vrindavan*

[![Play Live on Cloudflare Pages](https://img.shields.io/badge/Play%20Live-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://shyamsakha.pages.dev/)
[![Play Live on GitHub Pages](https://img.shields.io/badge/Play%20Live-GitHub%20Pages-22c55e?style=for-the-badge&logo=github&logoColor=white)](https://bhanu2006-24.github.io/shyamsakha/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5 / ES6 Modules](https://img.shields.io/badge/Tech-HTML5%20%7C%20Canvas%20%7C%20ES6%20Modules-blue.svg)](#)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural%20Web%20Audio%20Bansuri-emerald.svg)](#)

🎮 **Play Online Directly in Your Browser:**
- 🌐 **Primary Live Site (Cloudflare Pages)**: [https://shyamsakha.pages.dev/](https://shyamsakha.pages.dev/)
- 🌐 **GitHub Pages Mirror**: [https://bhanu2006-24.github.io/shyamsakha/](https://bhanu2006-24.github.io/shyamsakha/)

Welcome to **Shyam Sakha (श्याम सखा)** — a rich, modular 2D web game inspired by the eternal childhood pastimes (*Bal Lilas*) of **Shree Krishna**, His elder brother **Dao Balaram**, the cowherd friends (**Sakhas** like Sudama, Subala, Mansukha, Madhumangala), and the sacred cows (**Gau Mata**) in the holy land of Braj.

---

## 🌟 Highlights & Features

### 🏐 1. Kanduka Kridha (कन्दुक क्रीड़ा - Gopa Volleyball)
Experience the famous Vedic ball game on the golden sands of the Yamuna!
- **True 3D Parabolic Arc Physics**: The ball features position $(x, y)$, height/altitude $(z)$, dynamic vertical gravity, air resistance, and elastic ground bounce.
- **Dynamic Ground Shadow**: Real-time projection shadow that expands and softens as the ball climbs higher.
- **Serving & Hitting**:
  - **Bump / Set**: Position near the ball's shadow and press `SPACE` or Left-Click.
  - **Jump Spike (Power Smash)**: Hold `Shift` or jump with `SPACE` when the ball is airborne to unleash a high-speed spike!
- **AI Coordination**: Shree Krishna and Dao Balaram intelligently pass, set, and perform divine curve shots.
- **Court Rules & Scoreboard**: Garland net boundary, side out detection, rally counter, and victory celebration!

### 🏃‍♂️ 2. Pakad Pakdai (पकड़ पकड़ाई - Tag Chase)
- Fast-paced chase across the pastures!
- Intelligent steering behaviors and obstacle avoidance for Krishna & Dao Balaram as they playfully dodge through groves.
- Stamina management for tactical sprinting (`Shift`).

### 💦 3. Rangotsav (होली उत्सव - Pichkari & Color Fight)
- Spray fragrant colored water with your Pichkari (`Left Click`).
- Dodge water bombs tossed by Krishna and friends.
- Permanent colorful Gulal splats and puddles that decorate the ground.

### 🪈 4. Procedural Bansuri Flute & Gau Seva (बांसुरी धुन)
- Built-in **Web Audio API procedural flute synthesizer** playing authentic classical melodies (*Raag Bhupali / Yaman*).
- Press **`F`** anytime: Krishna plays His flute, causing nearby indigenous cows (*Gau Mata*) and Sakhas to peacefully pause and gather around Him!

### 🌸 5. Gathering & Braj Offerings
- Collect wild lotuses from bushes, ripe forest fruits from trees, cool Yamuna Jal from the riverbanks, and freshly churned butter (*Makhan*).
- Present offerings to Krishna and Dao Balaram to hear heartfelt dialogues and receive blessings.

---

## 🗺️ Multi-Zone Map System

The game features a modular `MapManager` with distinct sacred biomes:

| Map | Hindi Name | Description | Key Landmarks |
|---|---|---|---|
| **Vrindavan Pastures** | वृन्दावन गोचारण | Lush pastoral plains and flower meadows | Sacred Kadamba Tree Hub, Yamuna River, Gau grazing grounds |
| **Yamuna Sandbanks** | यमुना पुलिन | Soft golden beach along the river | Official Kanduka Kridha Volleyball Court, Garland Net, Lotus waters |
| **Govardhan Foothills** | गोवर्धन तलहटी | Sacred mountain trails and springs | Govardhan boulders, Manasi Ganga stream, stepping stones |

Press **`M`** at any time to travel between maps!

---

## 📂 Modular Architecture

Inspired by clean, scalable architectures (like `RamSena`), the codebase is modularized with separation of concerns:

```
shyamsakha/
├── index.html                   # Semantic HTML5 entrypoint with divine UI
├── .gitignore                   # Standard web ignore rules
├── README.md                    # Documentation & architecture guide
│
├── css/                         # Modular CSS styles
│   ├── style.css                # Global design system, divine typography, animations
│   ├── hud.css                  # Top HUD, dialogue system, minimap, toasts
│   └── games.css                # Volleyball scoreboard, modals, map grid
│
├── js/                          # Modular ES6 JavaScript
│   ├── main.js                  # Bootstrapper and UI event dispatcher
│   ├── core/                    # Engine foundations
│   │   ├── Game.js              # Central game loop and state manager
│   │   ├── Camera.js            # Smooth tracking camera with bounds clamping & shake
│   │   ├── Input.js             # Keyboard, mouse, and touch interaction handler
│   │   └── SoundManager.js      # Procedural Web Audio synthesizer & audio asset loader
│   │
│   ├── entities/                # Living world entities
│   │   ├── Entity.js            # Base mobile entity with steering and collisions
│   │   ├── Player.js            # Player controller with stamina, sprint, and jump spikes
│   │   ├── Krishna.js           # Shree Krishna with peacock feather, aura, and flute
│   │   ├── Balram.js            # Dao Balaram with silver-white complexion & strength
│   │   ├── Sakhas.js            # Cowherd friends (Sudama, Subala, Mansukha, etc.)
│   │   ├── GauMata.js           # Sacred Vedic cows with hump, horns, grazing AI
│   │   ├── Volleyball.js        # 3D parabolic physics ball with dynamic shadow
│   │   └── ParticleSystem.js    # Dust, petals, holy water splats, sparkles
│   │
│   ├── games/                   # Mini-game controllers
│   │   ├── VolleyballGame.js    # Kanduka Kridha rules, serving, AI passing/spiking
│   │   ├── TagGame.js           # Pakad Pakdai chase logic
│   │   └── HoliGame.js          # Pichkari streams, dodging, water bombs
│   │
│   └── ui/                      # HUD and Overlay modules
│       ├── UIManager.js         # Dialogues, modal dialogs, and notifications
│       └── Minimap.js           # Real-time radar minimap
│
├── maps/                        # Dedicated Map Folder
│   ├── MapManager.js            # Multi-layer renderer (Ground, Props, Canopy)
│   ├── VrindavanPastures.js     # Pastoral Kadamba Kunj map
│   ├── YamunaBeach.js           # Volleyball sand arena map
│   └── GovardhanFoothills.js    # Mountain foothill boulders map
│
└── assets/                      # Media assets (User can drop custom files here!)
    ├── audio/                   # Drop your MP3/WAV files here (flute, bhajan, hits)
    │   └── README.md
    ├── images/                  # Drop custom sprites and textures here
    │   └── README.md
    ├── textures/
    └── icons/
```

---

## 🎮 Controls & Keybindings

| Key / Action | Function |
|---|---|
| **W, A, S, D** or **Arrow Keys** | Move your Sakha |
| **SHIFT** (Hold) | Sprint (Consumes Stamina) |
| **SPACE** | Interact / Gather Resource / Bump Volleyball |
| **SHIFT + SPACE** | Jump Spike (Smash ball in Volleyball) |
| **F** | Play Krishna's Flute (Cows & Sakhas gather joyfully) |
| **M** | Open Sacred Map Selector |
| **Left Click** | Shoot Pichkari in Holi / Click UI buttons |
| **Touch Controls** | Mobile & tablet tap support for buttons and prompt |

---

## 🚀 How to Run Locally

Since the game uses native ES6 modules (`import` / `export`), serve it with any local static HTTP server:

### Option 1: Python (Built into Mac & Linux)
```bash
python3 -m http.server 8000
```
Then open: [http://localhost:8000](http://localhost:8000)

### Option 2: Node / npx (serve / live-server)
```bash
npx serve .
# or
npx live-server
```

---

## 🎵 Adding Custom Music & Assets

The game works out of the box using procedural canvas drawing and Web Audio synthesizers, but is designed for you to easily plug in your custom music and artwork:

1. **Audio**: Place your MP3 or WAV files inside [`assets/audio/`](assets/audio/README.md).
   - E.g., `assets/audio/flute_bgm.mp3`, `assets/audio/ball_hit.wav`.
   - Update `SoundManager.js` to trigger them on events!
2. **Sprites & Textures**: Place images in [`assets/images/`](assets/images/README.md).
   - Draw them inside `draw()` in the entity or map classes.

---

## 📜 Cultural Significance
- **Kanduka Kridha (कन्दुक क्रीड़ा)**: Documented extensively in Srimad Bhagavatam and Gopal Champu as one of Krishna's favorite pastimes with His Sakhas on the Yamuna sands before the Kaliya Dah pastime.
- **Ved Lakshana Cows (गौ माता)**: Modeled with authentic Vedic indigenous characteristics—the prominent hump (*Surya Ketu Nadi*), curving ivory horns, and loving eyes.
- **Vaijayanti Garland (वैजयन्ती माला)**: The five-colored garland woven from forest flowers that Krishna always cherishes.

---

## 🤝 Contributing
Contributions are welcome! Feel free to submit pull requests for:
- New maps (e.g., *Nandgaon*, *Barsana*, *Kaliya Dah Deep Lake*).
- New mini-games (e.g., *Dahi Handi / Makhan Chori*, *Flute Rhythm game*).
- Enhanced sprite animations and orchestral background music.

*Radhe Radhe! जय श्री कृष्ण!*
