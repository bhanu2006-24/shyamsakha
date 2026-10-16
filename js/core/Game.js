import { Camera } from './Camera.js';
import { Input } from './Input.js';
import { soundManager } from './SoundManager.js';
import { Player } from '../entities/Player.js';
import { Krishna } from '../entities/Krishna.js';
import { Balram } from '../entities/Balram.js';
import { Sakha } from '../entities/Sakhas.js';
import { GauMata } from '../entities/GauMata.js';
import { ParticleSystem } from '../entities/ParticleSystem.js';
import { MapManager } from '../../maps/MapManager.js';
import { VrindavanPastures } from '../../maps/VrindavanPastures.js';
import { YamunaBeach } from '../../maps/YamunaBeach.js';
import { GovardhanFoothills } from '../../maps/GovardhanFoothills.js';
import { UIManager } from '../ui/UIManager.js';
import { Minimap } from '../ui/Minimap.js';
import { VolleyballGame } from '../games/VolleyballGame.js';
import { TagGame } from '../games/TagGame.js';
import { HoliGame } from '../games/HoliGame.js';
import { RaceGame } from '../games/RaceGame.js';
import { assetLoader } from './AssetLoader.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('canvasContainer');

        this.camera = new Camera();
        this.input = new Input(this.canvas, this.container);
        this.sound = soundManager;
        this.assetLoader = assetLoader;
        this.particles = new ParticleSystem();
        this.ui = new UIManager(this);
        this.minimap = new Minimap(document.getElementById('minimapCanvas'));

        // Map Manager
        this.mapManager = new MapManager();
        this.vrindavanMap = new VrindavanPastures();
        this.yamunaMap = new YamunaBeach();
        this.govardhanMap = new GovardhanFoothills();

        this.mapManager.registerMap('vrindavan', this.vrindavanMap);
        this.mapManager.registerMap('yamuna', this.yamunaMap);
        this.mapManager.registerMap('govardhan', this.govardhanMap);

        // Entities
        this.player = null;
        this.krishna = null;
        this.balram = null;
        this.sakhas = [];
        this.cows = [];

        // Mini-Games
        this.volleyballGame = new VolleyballGame(this);
        this.tagGame = new TagGame(this);
        this.holiGame = new HoliGame(this);
        this.raceGame = new RaceGame(this);

        this.state = 'hub'; // 'hub', 'volleyball', 'tag', 'holi', 'race', 'gameover'
        this.inventory = { flowers: 0, lotus: 0, fruits: 0, water: 0, butter: 1, garlands: 0 };
        this.lastTime = 0;
        this.interactableTarget = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Preload character sprite sheets
        assetLoader.loadAll().then(() => {
            this.ui.showToast("All divine character sprites loaded! 🦚");
        });

        // Load Default Map
        this.loadMap('vrindavan');

        // Setup Entities
        this.initEntitiesHub();

        // Bind global keys and UI hooks
        this.bindEvents();

        // Start Loop
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.camera.resize(this.canvas.width, this.canvas.height);
    }

    loadMap(mapKey) {
        const map = this.mapManager.loadMap(mapKey);
        const mapNameEl = document.getElementById('currentMapName');
        if (mapNameEl) mapNameEl.innerText = map.hindiName || map.name;

        // Reposition camera & entities safely inside new map bounds (sunlit open clearing)
        if (this.player) {
            this.player.x = map.centerX;
            this.player.y = map.centerY + 130;
            if (this.krishna) {
                this.krishna.x = map.centerX + 40;
                this.krishna.y = map.centerY + 30;
            }
            if (this.balram) {
                this.balram.x = map.centerX - 50;
                this.balram.y = map.centerY + 25;
            }
        }
        this.ui.showToast(`Arrived at ${map.name}! 🌿`);
    }

    initEntitiesHub() {
        const map = this.mapManager.currentMap;
        const cx = map.centerX;
        const cy = map.centerY;

        // Position player in the sunlit clearing facing north towards Krishna & Balram
        this.player = new Player(cx, cy + 130);
        this.camera.setTarget(this.player);

        // Krishna and Balram standing in clear daylight in the open glade (outside tree canopy)
        this.krishna = new Krishna(cx + 40, cy + 30);
        this.balram = new Balram(cx - 50, cy + 25);

        // 8 Sakha Friends arranged in a wide, spacious pastoral circle around the meadow (no overlapping)
        const sakhaPlacements = [
            { dx: -135, dy: 40 },  // Sudama (left side)
            { dx: 135, dy: 40 },   // Subal (right side)
            { dx: -165, dy: 90 },  // Madhumangal
            { dx: 165, dy: 90 },   // Rishabh
            { dx: -135, dy: 155 }, // Vishal
            { dx: 135, dy: 155 },  // Dama
            { dx: -75, dy: 205 },  // Vasant
            { dx: 75, dy: 205 }    // Arjun
        ];

        this.sakhas = [];
        for (let i = 0; i < 8; i++) {
            const sp = sakhaPlacements[i];
            this.sakhas.push(new Sakha(cx + sp.dx, cy + sp.dy, i));
        }

        // Gau Mata (Vedic Indigenous Cows) grazing peacefully around the clearing & outer meadows
        this.cows = [];
        const cowColors = ['#fffdd0', '#fef3c7', '#d2b48c', '#b45309', '#f8fafc'];
        const clearingCowOffsets = [
            { dx: -220, dy: -40 }, { dx: 220, dy: -40 },
            { dx: -220, dy: 70 },  { dx: 240, dy: 80 },
            { dx: -90, dy: 250 },  { dx: 110, dy: 240 }
        ];

        for (let i = 0; i < clearingCowOffsets.length; i++) {
            const co = clearingCowOffsets[i];
            const cColor = cowColors[i % cowColors.length];
            this.cows.push(new GauMata(cx + co.dx, cy + co.dy, cColor));
        }

        // Additional cows across the wider pastoral meadows (guaranteed away from water)
        for (let i = 0; i < 10; i++) {
            let rx = 200 + Math.random() * (map.width - 900);
            let ry = 200 + Math.random() * (map.height - 400);
            // Ensure no cow spawns in Kamal Sarovar pond
            if (Math.hypot(rx - (cx - 420), ry - (cy + 200)) < 130) {
                rx += 200;
            }
            const cColor = cowColors[Math.floor(Math.random() * cowColors.length)];
            this.cows.push(new GauMata(rx, ry, cColor));
        }

        this.state = 'hub';
        this.ui.setPhase("🌿 Resting", "tag-resting");
        this.ui.updateInventory(this.inventory);

        // Hide specific game HUDs
        const vbScore = document.getElementById('volleyballScoreboard');
        if (vbScore) vbScore.classList.add('hidden');
    }

    bindEvents() {
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            // Dialogue hotkeys: [1] to [9] or Escape/Enter/Space when dialogue is open
            if (this.ui && this.ui.isDialogueOpen()) {
                if (e.key >= '1' && e.key <= '9') {
                    const idx = parseInt(e.key, 10) - 1;
                    if (this.ui.dialogueActions && this.ui.dialogueActions.children[idx]) {
                        e.preventDefault();
                        this.ui.dialogueActions.children[idx].click();
                        return;
                    }
                }
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.ui.closeDialogue();
                    return;
                }
            }

            // Interaction keys: SPACE, E, e, or Enter
            if ((e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') && this.state === 'hub') {
                if (this.interactableTarget) {
                    e.preventDefault();
                    this.handleInteraction();
                    return;
                }
            }

            // 'F' key: Play Krishna's Flute / Call the Cows
            if ((e.key === 'f' || e.key === 'F') && this.state === 'hub') {
                this.playFluteMelody();
            }

            // 'B' key: Toggle Sakha Potli (Bag)
            if (e.key === 'b' || e.key === 'B') {
                if (this.ui.bagModal && !this.ui.bagModal.classList.contains('hidden')) {
                    this.ui.closeBagModal();
                } else {
                    this.ui.openBagModal();
                }
            }

            // 'O' key: Toggle Options & Audio Modal
            if (e.key === 'o' || e.key === 'O') {
                if (this.ui.optionsModal && !this.ui.optionsModal.classList.contains('hidden')) {
                    this.ui.closeOptionsModal();
                } else {
                    this.ui.openOptionsModal();
                }
            }

            // 'Escape' key: Close any active modal or return to hub
            if (e.key === 'Escape') {
                if (this.ui.isAnyModalOpen()) {
                    this.ui.closeAllModals();
                } else if (this.state !== 'hub') {
                    this.returnToHub();
                }
            }

            // 'H' key: Toggle Help / Guide Modal
            if (e.key === 'h' || e.key === 'H') {
                if (this.ui.helpModal && !this.ui.helpModal.classList.contains('hidden')) {
                    this.ui.closeHelp();
                } else {
                    this.ui.openHelp();
                }
            }

            // 'M' key: Toggle Minimap Radar
            if (e.key === 'm' || e.key === 'M') {
                this.toggleMinimap();
            }
        });

        // Prompt button click
        const promptBtn = document.getElementById('interactionPrompt');
        if (promptBtn) {
            promptBtn.addEventListener('click', () => this.handleInteraction());
        }

        // Top HUD buttons
        const topHubReturnBtn = document.getElementById('topHubReturnBtn');
        if (topHubReturnBtn) {
            topHubReturnBtn.addEventListener('click', () => this.returnToHub());
        }

        const bagBtn = document.getElementById('bagBtn');
        if (bagBtn) {
            bagBtn.addEventListener('click', () => this.ui.openBagModal());
        }

        const optionsBtn = document.getElementById('optionsBtn');
        if (optionsBtn) {
            optionsBtn.addEventListener('click', () => this.ui.openOptionsModal());
        }

        const fluteBtn = document.getElementById('fluteCallBtn');
        if (fluteBtn) {
            fluteBtn.addEventListener('click', () => this.playFluteMelody());
        }

        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.ui.openHelp());
        }

        // Minimap Close Button
        const minimapToggleBtn = document.getElementById('minimapToggleBtn');
        if (minimapToggleBtn) {
            minimapToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMinimap();
            });
        }

        // Direct Click Interaction on Canvas (Click directly on Krishna, Balram, Sakhas, Cows, Resources)
        this.container.addEventListener('click', (e) => {
            if (e.target !== this.canvas) return;
            if (this.state !== 'hub' || !this.player) return;

            const wx = this.input.mouse.worldX;
            const wy = this.input.mouse.worldY;

            // Click on Krishna
            if (this.krishna && Math.hypot(wx - this.krishna.x, wy - (this.krishna.y - 30)) < 65) {
                const dist = Math.hypot(this.player.x - this.krishna.x, this.player.y - this.krishna.y);
                if (dist < 180) {
                    this.ui.startDialogueWithKrishna();
                } else {
                    this.ui.showToast("Walk closer to Shree Krishna to talk! 🦚");
                }
                return;
            }

            // Click on Balram
            if (this.balram && Math.hypot(wx - this.balram.x, wy - (this.balram.y - 30)) < 65) {
                const dist = Math.hypot(this.player.x - this.balram.x, this.player.y - this.balram.y);
                if (dist < 180) {
                    this.ui.startDialogueWithBalram();
                } else {
                    this.ui.showToast("Walk closer to Dao Balaram to talk! 🌾");
                }
                return;
            }

            // Click on Sakhas
            for (const s of this.sakhas) {
                if (Math.hypot(wx - s.x, wy - (s.y - 25)) < 55) {
                    const dist = Math.hypot(this.player.x - s.x, this.player.y - s.y);
                    if (dist < 170) {
                        this.ui.startDialogueWithSakha(s);
                    } else {
                        this.ui.showToast(`Walk closer to ${s.name} to talk! 💬`);
                    }
                    return;
                }
            }

            // Click on Gau Mata
            for (const cow of this.cows) {
                if (Math.hypot(wx - cow.x, wy - (cow.y - 15)) < 55) {
                    const dist = Math.hypot(this.player.x - cow.x, this.player.y - cow.y);
                    if (dist < 160) {
                        this.ui.startDialogueWithCow(cow);
                    } else {
                        this.ui.showToast("Walk closer to Gau Mata to pet & feed! 🐮");
                    }
                    return;
                }
            }
        });
    }

    playFluteMelody() {
        if (!this.krishna) return;
        this.krishna.playFlute(4.0);
        this.sound.playDivineFlutePhrase();
        this.ui.showToast("🦚 Krishna plays His divine Bansuri! Cows and Sakhas gather with joy!");
        this.particles.createSparkle(this.krishna.x, this.krishna.y - 30, '#facc15', 25);
    }

    checkInteractions() {
        this.interactableTarget = null;
        if (!this.player) return;

        // 1. Check Shree Krishna (Pastimes & Offerings - Highest Priority!)
        if (this.krishna) {
            const dK = Math.hypot(this.player.x - this.krishna.x, this.player.y - this.krishna.y);
            if (dK < 105) {
                this.interactableTarget = { type: 'krishna' };
                this.ui.showPrompt('🦚', 'Press SPACE / E to Talk with Shree Krishna (Pastimes)');
                return;
            }
        }

        // 2. Check Dao Balaram (Sacred Map Travel & Offerings)
        if (this.balram) {
            const dB = Math.hypot(this.player.x - this.balram.x, this.player.y - this.balram.y);
            if (dB < 105) {
                this.interactableTarget = { type: 'balram' };
                this.ui.showPrompt('🌾', 'Press SPACE / E to Talk with Dao Balaram (Travel to Dhams)');
                return;
            }
        }

        // 3. Check Sakhas (Cowherd Friends)
        for (const s of this.sakhas) {
            if (Math.hypot(this.player.x - s.x, this.player.y - s.y) < 90) {
                this.interactableTarget = { type: 'sakha', obj: s };
                this.ui.showPrompt('💬', `Press SPACE / E to Talk with ${s.name}`);
                return;
            }
        }

        // 4. Check Gau Mata (Cows)
        for (const cow of this.cows) {
            if (Math.hypot(this.player.x - cow.x, this.player.y - cow.y) < 85) {
                this.interactableTarget = { type: 'cow', obj: cow };
                this.ui.showPrompt('🐮', 'Press SPACE / E to Pet & Feed Gau Mata');
                return;
            }
        }

        // 5. Check Gatherable Resources (Bushes, Ponds, Trees, River)
        const obstacles = this.mapManager.getObstacles();
        for (const obs of obstacles) {
            if (obs.hasResource && (obs.type === 'bush' || obs.type === 'pond' || obs.type === 'tree')) {
                const d = Math.hypot(this.player.x - obs.x, this.player.y - obs.y);
                if (d < (obs.radius || 30) + 75) {
                    this.interactableTarget = { type: obs.type, obj: obs };
                    if (obs.type === 'bush') {
                        this.ui.showPrompt('🌸', 'Press SPACE / E to Gather Forest Flowers');
                    } else if (obs.type === 'pond') {
                        this.ui.showPrompt('🪷', 'Press SPACE / E to Gather Sacred Lotus');
                    } else {
                        this.ui.showPrompt('🥭', 'Press SPACE / E to Pick Ripe Mango');
                    }
                    return;
                }
            } else if (obs.type === 'river') {
                const testX = Math.max(obs.x, Math.min(this.player.x, obs.x + obs.w));
                const d = Math.abs(this.player.x - testX);
                if (d < 70) {
                    this.interactableTarget = { type: 'river', obj: obs };
                    this.ui.showPrompt('💧', 'Press SPACE / E to Fill Yamuna Jal');
                    return;
                }
            }
        }

        this.ui.hidePrompt();
    }

    handleInteraction() {
        if (!this.interactableTarget) return;

        const target = this.interactableTarget;

        if (target.type === 'bush' && target.obj.hasResource) {
            this.inventory.flowers++;
            target.obj.hasResource = null;
            target.obj.resourceRegenTimer = 18;
            this.particles.createPetals(this.player.x, this.player.y, '#f472b6', 15);
            this.sound.playFluteNote(587.33, 0.25);
            this.ui.showToast("+1 Fragrant Forest Flower gathered! 🌸");
        } else if (target.type === 'pond' && target.obj.hasResource) {
            this.inventory.lotus = (this.inventory.lotus || 0) + 1;
            target.obj.hasResource = null;
            target.obj.resourceRegenTimer = 22;
            this.particles.createPetals(this.player.x, this.player.y, '#38bdf8', 18);
            this.sound.playFluteNote(523.25, 0.3);
            this.ui.showToast("+1 Sacred Water Lotus gathered from pond! 🪷");
        } else if (target.type === 'tree' && target.obj.hasResource) {
            this.inventory.fruits++;
            target.obj.hasResource = null;
            target.obj.resourceRegenTimer = 18;
            this.particles.createPetals(this.player.x, this.player.y, '#facc15', 18);
            this.sound.playFluteNote(659.25, 0.25);
            this.ui.showToast("+1 Sweet Ripe Mango picked from tree! 🥭");
        } else if (target.type === 'river') {
            this.inventory.water++;
            this.particles.createDust(this.player.x, this.player.y, '#38bdf8', 15);
            this.sound.playSplash();
            this.ui.showToast("+1 Cool Yamuna Jal collected in pot! 💧");
        } else if (target.type === 'cow') {
            this.ui.startDialogueWithCow(target.obj);
        } else if (target.type === 'krishna') {
            this.ui.startDialogueWithKrishna();
        } else if (target.type === 'balram') {
            this.ui.startDialogueWithBalram();
        } else if (target.type === 'sakha') {
            this.ui.startDialogueWithSakha(target.obj);
        }

        this.ui.updateBagUI(this.inventory);
        this.checkInteractions();
    }

    craftGarland() {
        if ((this.inventory.flowers || 0) >= 3) {
            this.inventory.flowers -= 3;
            this.inventory.garlands = (this.inventory.garlands || 0) + 1;
            this.ui.showToast("✨ Beautiful Vaijayanti Garland hand-woven! 📿");
            this.sound.playCheer();
            this.particles.createPetals(this.player.x, this.player.y, '#f472b6', 30);
            this.ui.updateBagUI(this.inventory);
        } else {
            this.ui.showToast("Gather at least 3 Forest Flowers from bushes first! 🌸");
        }
    }

    offerToKrishna(item) {
        if (item === 'butter') {
            if ((this.inventory.butter || 0) > 0) {
                this.inventory.butter--;
                this.particles.createSparkle(this.krishna.x, this.krishna.y - 30, '#fef08a', 45);
                this.sound.playCheer();
                this.ui.startDialogueWithKrishna("Aha! Sweet freshly churned butter from Maiya! Nothing in all three worlds brings Me greater joy, my beloved Sakha! Take some to share with everyone!");
            } else {
                this.ui.showToast("No Makhan in pot! Feed Gau Mata a mango to churn fresh butter! 🐮");
            }
        } else if (item === 'garland') {
            if ((this.inventory.garlands || 0) > 0) {
                this.inventory.garlands--;
                this.particles.createPetals(this.krishna.x, this.krishna.y - 20, '#f472b6', 50);
                this.sound.playCheer();
                this.ui.startDialogueWithKrishna("This sacred Vaijayanti garland smells of the divine love of Vrindavan! How lovingly you strung it!");
            } else {
                this.ui.showToast("String a Vaijayanti Garland in your Sakha Potli (Bag) first! 📿");
            }
        } else if (item === 'lotus') {
            if ((this.inventory.lotus || 0) > 0) {
                this.inventory.lotus--;
                this.particles.createPetals(this.krishna.x, this.krishna.y - 20, '#38bdf8', 40);
                this.sound.playCheer();
                this.ui.startDialogueWithKrishna("A fresh blooming lotus from the Kamal Sarovar pond! Pure and blooming like your loving heart, Sakha.");
            } else {
                this.ui.showToast("Gather a blooming lotus from the Kamal Sarovar lily pond first! 🪷");
            }
        }
        this.ui.updateBagUI(this.inventory);
    }

    offerToBalram(item) {
        if (item === 'fruit') {
            if ((this.inventory.fruits || 0) > 0) {
                this.inventory.fruits--;
                this.particles.createPetals(this.balram.x, this.balram.y - 30, '#facc15', 35);
                this.sound.playCheer();
                this.ui.startDialogueWithBalram("These juicy Vrindavan mangoes give immense strength! Well gathered, little brother!");
            } else {
                this.ui.showToast("Pick some sweet mangoes from the trees first! 🥭");
            }
        } else if (item === 'water') {
            if ((this.inventory.water || 0) > 0) {
                this.inventory.water--;
                this.particles.createDust(this.balram.x, this.balram.y - 20, '#38bdf8', 30);
                this.sound.playSplash();
                this.ui.startDialogueWithBalram("Cool Yamuna Jal is nectar after herding the cows through the pastures!");
            } else {
                this.ui.showToast("Fill water from the Yamuna river first! 💧");
            }
        }
        this.ui.updateBagUI(this.inventory);
    }

    startPastimeFromKrishna(mode) {
        this.ui.closeDialogue();
        const pastimesNames = {
            volleyball: "Kanduka Kridha (Volleyball)",
            tag: "Pakad Pakdai (Tag Chase)",
            holi: "Rangotsav (Holi Pichkari)",
            race: "Dhaavan Spardha (Footrace / दौड़)"
        };
        this.startGameMode(mode);
        this.ui.showToast(`✨ Started ${pastimesNames[mode] || mode}! (Press ESC or Return to Hub anytime)`);
    }

    travelFromBalram(mapKey) {
        this.ui.closeDialogue();
        const mapNames = {
            vrindavan: "Vrindavan Pastures (वृन्दावन गोचारण)",
            yamuna: "Yamuna Sandbanks (यमुना तट)",
            govardhan: "Govardhan Foothills (गिरिराज गोवर्धन)"
        };
        this.loadMap(mapKey);
        this.ui.showToast(`🌿 Guided friends to ${mapNames[mapKey] || mapKey}!`);
    }

    talkToFriends() {
        const quotes = [
            "Look at the gentle calves dancing around the Kadamba grove!",
            "The Yamuna breeze is so fragrant with lotuses today.",
            "Dao Dada and I were just getting ready for a game of Kanduka Kridha (Volleyball)!",
            "Have you tasted Mother Yashoda's freshly churned butter today? It is pure nectar!",
            "Whenever we are together, the whole of Vrindavan rejoices."
        ];
        const text = quotes[Math.floor(Math.random() * quotes.length)];
        this.ui.showDialogue("Krishna", text, "🦚", "text-blue-400");
        this.sound.playFluteNote(493.88, 0.4);
    }

    startGameMode(mode) {
        this.ui.closeAllModals();
        this.ui.hidePrompt();
        this.state = mode;

        const hubBtn = document.getElementById('topHubReturnBtn');
        if (hubBtn) hubBtn.classList.remove('hidden');

        if (mode === 'volleyball') {
            // Switch to Yamuna Beach map where the volleyball court is set
            this.loadMap('yamuna');
            this.ui.setPhase("🏐 Volleyball", "tag-volleyball");
            this.volleyballGame.start(this.yamunaMap.court);
        } else if (mode === 'tag') {
            this.ui.setPhase("🏃 Tag Chase", "tag-playing");
            this.tagGame.start();
        } else if (mode === 'holi') {
            this.ui.setPhase("💦 Holi Battle", "tag-playing");
            this.holiGame.start();
        } else if (mode === 'race') {
            this.ui.setPhase("🏃‍♂️ Footrace", "tag-playing");
            this.raceGame.start();
        }
    }

    endGame(won, message) {
        this.state = 'gameover';
        this.ui.showGameOver(won ? "Victory & Joy!" : "Playful Defeat!", message, won);
    }

    returnToHub() {
        if (this.volleyballGame) {
            this.volleyballGame.isActive = false;
            if (this.volleyballGame.scoreboardEl) this.volleyballGame.scoreboardEl.classList.add('hidden');
        }
        if (this.tagGame) this.tagGame.isActive = false;
        if (this.holiGame) this.holiGame.isActive = false;
        if (this.raceGame) this.raceGame.isActive = false;

        const hubBtn = document.getElementById('topHubReturnBtn');
        if (hubBtn) hubBtn.classList.add('hidden');

        this.state = 'hub';
        this.ui.hideGameOver();
        this.loadMap('vrindavan');
        this.initEntitiesHub();
        this.ui.setPhase("🌿 Resting", "tag-resting");
    }

    update(dt) {
        const obstacles = this.mapManager.getObstacles();
        const mapW = this.mapManager.getWidth();
        const mapH = this.mapManager.getHeight();

        this.mapManager.update(dt);
        this.particles.update(dt);

        // Update player
        if (this.player) {
            this.player.update(dt, this.input, obstacles, mapW, mapH, this.particles);

            // Update dynamic stamina bar UI (Only show when used, hide when full)
            const staminaFill = document.getElementById('staminaFill');
            const staminaWidget = document.getElementById('floatingStaminaWidget');
            if (staminaFill) {
                staminaFill.style.width = `${this.player.stamina}%`;
                // Color transition from emerald to amber to coral
                if (this.player.stamina > 50) {
                    staminaFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
                } else if (this.player.stamina > 20) {
                    staminaFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
                } else {
                    staminaFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
                }
            }
            if (staminaWidget) {
                if (this.player.stamina >= 99.5) {
                    staminaWidget.classList.add('hidden-stamina');
                } else {
                    staminaWidget.classList.remove('hidden-stamina');
                }
            }
        }

        // Update Gau Mata (Cows)
        for (const cow of this.cows) {
            cow.update(dt, obstacles, mapW, mapH, this.krishna);
        }

        // Update Camera
        this.camera.update(dt, mapW, mapH);
        this.input.updateWorldMouse(this.camera);

        if (this.state === 'hub') {
            this.checkInteractions();
            if (this.krishna) this.krishna.update(dt, obstacles, mapW, mapH, this.particles);
            if (this.balram) this.balram.update(dt, obstacles, mapW, mapH, this.particles);
            for (const s of this.sakhas) {
                // Autonomous pastoral routines: gather sweet fruits, offer to Krishna/Dau, initiate polls
                s.updateRoutine(dt, obstacles, mapW, mapH, this.krishna, this.balram, this);
            }
        } else if (this.state === 'volleyball') {
            if (this.krishna) this.krishna.update(dt, obstacles, mapW, mapH, this.particles);
            if (this.balram) this.balram.update(dt, obstacles, mapW, mapH, this.particles);
            this.volleyballGame.update(dt);
        } else if (this.state === 'tag') {
            if (this.krishna) this.krishna.update(dt, obstacles, mapW, mapH, this.particles);
            if (this.balram) this.balram.update(dt, obstacles, mapW, mapH, this.particles);
            this.tagGame.update(dt);
        } else if (this.state === 'holi') {
            if (this.krishna) this.krishna.update(dt, obstacles, mapW, mapH, this.particles);
            if (this.balram) this.balram.update(dt, obstacles, mapW, mapH, this.particles);
            this.holiGame.update(dt);
        } else if (this.state === 'race') {
            if (this.krishna) this.krishna.update(dt, obstacles, mapW, mapH, this.particles);
            if (this.balram) this.balram.update(dt, obstacles, mapW, mapH, this.particles);
            this.raceGame.update(dt);
        }

        this.input.endFrame();
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);

        // 1. Ground Layer
        this.mapManager.drawGround(ctx, this.camera);

        // 2. Ground Splats & Dust
        this.particles.draw(ctx, this.camera);

        // 3. Ground Props (Trunks, Rocks, Bushes, Volleyball Net)
        this.mapManager.drawProps(ctx, this.camera);

        // 4. Entities
        for (const cow of this.cows) cow.draw(ctx);
        for (const s of this.sakhas) s.draw(ctx);
        if (this.balram) this.balram.draw(ctx);
        if (this.krishna) this.krishna.draw(ctx);
        if (this.player) this.player.draw(ctx);

        // 5. Mini-Game Projectiles / Volleyball Ball / Race Checkpoints (World Space)
        if (this.state === 'volleyball') this.volleyballGame.draw(ctx);
        if (this.state === 'holi') this.holiGame.draw(ctx);
        if (this.state === 'race') this.raceGame.drawWorld(ctx);

        // 6. Tree Canopy Layer (Leaves above heads with see-through transparency)
        this.mapManager.drawCanopy(ctx, this.camera, this.player);

        ctx.restore();

        // 7. Mini-Game Screen-Space Overlays (Race Countdown, Standings Bar, Checkpoint Arrow)
        if (this.state === 'race') {
            this.raceGame.drawHud(ctx);
        }

        // 8. Continuous Target Directional Cursors for Krishna & Balram (Off-Screen Radar Tracker)
        if (this.sound && this.sound.compassEnabled) {
            this.drawDirectionalPointers(ctx);
        }

        // 8. Minimap (if enabled)
        if (this.sound && this.sound.minimapEnabled) {
            this.minimap.draw(
                this.mapManager.currentMap,
                this.camera,
                this.player,
                this.krishna,
                this.balram,
                this.sakhas,
                this.cows,
                this.mapManager.getObstacles()
            );
        }
    }

    toggleMinimap() {
        this.sound.toggleMinimap();
        const mmContainer = document.getElementById('minimapContainer');
        const reopenBtn = document.getElementById('reopenMinimapBtn');
        if (this.sound.minimapEnabled) {
            if (mmContainer) mmContainer.classList.remove('collapsed');
            if (reopenBtn) reopenBtn.classList.add('hidden');
            this.ui.showToast("🗺️ Radar Map enabled");
        } else {
            if (mmContainer) mmContainer.classList.add('collapsed');
            if (reopenBtn) reopenBtn.classList.add('hidden');
            this.ui.showToast("🗺️ Radar Map hidden");
        }
        this.ui.updateOptionsUI();
    }

    toggleCompass() {
        this.sound.toggleCompass();
        this.ui.showToast(this.sound.compassEnabled ? "🧭 Target Pointers enabled" : "🧭 Target Pointers disabled");
        this.ui.updateOptionsUI();
    }

    drawDirectionalPointers(ctx) {
        if (!this.player || this.state === 'race') return;

        // Krishna and Balram continuous pointers
        // Active during Tag, Holi, or anytime they are off-screen
        let krishnaIndicator = null;
        let balramIndicator = null;

        if (this.krishna && !this.krishna.isCaught) {
            krishnaIndicator = this.getOffscreenPosition(this.krishna);
        }

        if (this.balram && !this.balram.isCaught) {
            balramIndicator = this.getOffscreenPosition(this.balram);
        }

        // If both indicators land too close on screen edge, slightly separate them so they don't overlap
        if (krishnaIndicator && balramIndicator) {
            const dist = Math.hypot(krishnaIndicator.x - balramIndicator.x, krishnaIndicator.y - balramIndicator.y);
            if (dist < 48) {
                const nx = -(krishnaIndicator.y - this.canvas.height / 2);
                const ny = krishnaIndicator.x - this.canvas.width / 2;
                const len = Math.hypot(nx, ny) || 1;
                balramIndicator.x += (nx / len) * 26;
                balramIndicator.y += (ny / len) * 26;
            }
        }

        if (krishnaIndicator) {
            this.drawIndicatorBadge(ctx, krishnaIndicator, 'Krishna', '🦚', '#facc15', '#00f0ff');
        }

        if (balramIndicator) {
            this.drawIndicatorBadge(ctx, balramIndicator, 'Balram', '🌾', '#ffffff', '#38bdf8');
        }
    }

    getOffscreenPosition(target) {
        if (!target) return null;

        const w = this.canvas.width;
        const h = this.canvas.height;
        const screenX = target.x - this.camera.x;
        const screenY = target.y - this.camera.y;

        // On-screen boundary check (with comfortable margin)
        const pad = 45;
        if (screenX >= pad && screenX <= w - pad && screenY >= pad && screenY <= h - pad) {
            return null; // On-screen! No edge pointer needed
        }

        const cx = w / 2;
        const cy = h / 2;
        const dx = screenX - cx;
        const dy = screenY - cy;
        const angle = Math.atan2(dy, dx);

        const dist = Math.hypot(this.player.x - target.x, this.player.y - target.y);
        const distPaces = Math.max(1, Math.round(dist / 32));

        // Edge padding for pointer badge
        const edgePad = 52;
        const halfW = w / 2 - edgePad;
        const halfH = h / 2 - edgePad;

        const tX = dx !== 0 ? Math.abs(halfW / dx) : Infinity;
        const tY = dy !== 0 ? Math.abs(halfH / dy) : Infinity;
        const t = Math.min(tX, tY);

        return {
            x: cx + dx * t,
            y: cy + dy * t,
            angle: angle,
            distPaces: distPaces
        };
    }

    drawIndicatorBadge(ctx, pos, label, icon, primaryColor, glowColor) {
        const h = this.canvas.height;
        ctx.save();
        ctx.translate(pos.x, pos.y);

        const pulseTime = (Date.now() % 1200) / 1200;

        // 1. Radar Sonic Wave radiating outward in target direction
        ctx.save();
        ctx.rotate(pos.angle);
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.85 * (1 - pulseTime)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(18 + pulseTime * 12, 0);
        ctx.lineTo(8 + pulseTime * 12, -9);
        ctx.lineTo(8 + pulseTime * 12, 9);
        ctx.closePath();
        ctx.stroke();

        // 2. Solid Direction Chevron Arrow pointing outward
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(8, -10);
        ctx.lineTo(11, 0);
        ctx.lineTo(8, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 3. Circular Badge with Avatar Icon
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 16;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 19, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, 0, 1);

        // 4. Compact Name & Distance Tag (e.g. "Krishna 24m")
        ctx.shadowBlur = 0;
        const tagText = `${label} ${pos.distPaces}m`;
        ctx.font = 'bold 11px Outfit, monospace, sans-serif';
        const tagMetrics = ctx.measureText(tagText);
        const tagW = tagMetrics.width + 12;
        const tagH = 18;

        // Offset tag away from screen edge so it's always readable
        let tagOffsetY = 26;
        if (pos.y > h - 70) tagOffsetY = -26;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-tagW / 2, tagOffsetY - tagH / 2, tagW, tagH, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, 0, tagOffsetY);

        ctx.restore();
    }

    gameLoop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        let dt = (timestamp - this.lastTime) / 1000;
        if (dt > 0.1) dt = 0.1;
        this.lastTime = timestamp;

        if (this.state !== 'gameover') {
            this.update(dt);
        }
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }
}
