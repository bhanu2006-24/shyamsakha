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

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('canvasContainer');

        this.camera = new Camera();
        this.input = new Input(this.canvas, this.container);
        this.sound = soundManager;
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

        this.state = 'hub'; // 'hub', 'volleyball', 'tag', 'holi', 'gameover'
        this.inventory = { flowers: 0, fruits: 0, water: 0, butter: 1 };
        this.lastTime = 0;
        this.interactableTarget = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

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

        // Reposition camera & entities safely inside new map bounds
        if (this.player) {
            this.player.x = map.centerX - 100;
            this.player.y = map.centerY + 50;
            if (this.krishna) {
                this.krishna.x = map.centerX + 30;
                this.krishna.y = map.centerY - 20;
            }
            if (this.balram) {
                this.balram.x = map.centerX - 40;
                this.balram.y = map.centerY - 10;
            }
        }
        this.ui.showToast(`Arrived at ${map.name}! 🌿`);
    }

    initEntitiesHub() {
        const map = this.mapManager.currentMap;
        const cx = map.centerX;
        const cy = map.centerY;

        this.player = new Player(cx - 120, cy + 80);
        this.camera.setTarget(this.player);

        this.krishna = new Krishna(cx + 30, cy - 20);
        this.balram = new Balram(cx - 40, cy - 10);

        // Sakha Friends
        this.sakhas = [];
        for (let i = 0; i < 5; i++) {
            const sx = cx + (Math.random() - 0.5) * 450;
            const sy = cy + (Math.random() - 0.5) * 450;
            this.sakhas.push(new Sakha(sx, sy, i));
        }

        // Gau Mata (Vedic Indigenous Cows)
        this.cows = [];
        const cowColors = ['#fffdd0', '#fef3c7', '#d2b48c', '#b45309', '#f8fafc'];
        for (let i = 0; i < 16; i++) {
            const rx = 150 + Math.random() * (map.width - 700);
            const ry = 150 + Math.random() * (map.height - 300);
            const cColor = cowColors[Math.floor(Math.random() * cowColors.length)];
            this.cows.push(new GauMata(rx, ry, cColor));
        }

        this.state = 'hub';
        this.ui.setPhase("Phase: Resting under the Kadamba Tree", "tag-resting");
        this.ui.updateInventory(this.inventory);

        // Hide specific game HUDs
        const vbScore = document.getElementById('volleyballScoreboard');
        if (vbScore) vbScore.classList.add('hidden');
    }

    bindEvents() {
        // Spacebar interaction or Jump Spike
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ' && this.state === 'hub' && this.interactableTarget) {
                this.handleInteraction();
            }

            // 'F' key: Play Krishna's Flute / Call the Cows
            if ((e.key === 'f' || e.key === 'F') && this.state === 'hub') {
                this.playFluteMelody();
            }

            // 'M' key: Open Map Modal
            if ((e.key === 'm' || e.key === 'M')) {
                this.ui.openMapModal();
            }
        });

        // Prompt button click
        const promptBtn = document.getElementById('interactionPrompt');
        if (promptBtn) {
            promptBtn.addEventListener('click', () => this.handleInteraction());
        }

        // Top HUD buttons
        const soundBtn = document.getElementById('soundToggleBtn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const isOn = this.sound.toggle();
                soundBtn.innerText = isOn ? '🔊 Sound: On' : '🔇 Sound: Off';
            });
        }

        const mapBtn = document.getElementById('mapSelectBtn');
        if (mapBtn) {
            mapBtn.addEventListener('click', () => this.ui.openMapModal());
        }

        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.ui.openHelp());
        }

        const fluteBtn = document.getElementById('fluteCallBtn');
        if (fluteBtn) {
            fluteBtn.addEventListener('click', () => this.playFluteMelody());
        }
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
        const obstacles = this.mapManager.getObstacles();

        // 1. Check Resources
        for (const obs of obstacles) {
            if (obs.hasResource && (obs.type === 'bush' || obs.type === 'tree')) {
                const d = Math.hypot(this.player.x - obs.x, this.player.y - obs.y);
                if (d < (obs.radius || 30) + 70) {
                    this.interactableTarget = { type: obs.type, obj: obs };
                    this.ui.showPrompt(
                        obs.type === 'bush' ? '🌸' : '🍋',
                        obs.type === 'bush' ? 'Press SPACE to Gather Lotus Flower' : 'Press SPACE to Pick Ripe Fruit'
                    );
                    return;
                }
            } else if (obs.type === 'river') {
                const testX = Math.max(obs.x, Math.min(this.player.x, obs.x + obs.w));
                const d = Math.abs(this.player.x - testX);
                if (d < 70) {
                    this.interactableTarget = { type: 'river', obj: obs };
                    this.ui.showPrompt('💧', 'Press SPACE to Fill Yamuna Jal');
                    return;
                }
            }
        }

        // 2. Check Krishna & Friends
        const dK = Math.hypot(this.player.x - this.krishna.x, this.player.y - this.krishna.y);
        if (dK < 150) {
            this.interactableTarget = { type: 'krishna' };
            this.ui.showPrompt('💬', 'Press SPACE to Talk with Krishna & Dau Dada');
            return;
        }

        // 3. Check Sakhas
        for (const s of this.sakhas) {
            if (Math.hypot(this.player.x - s.x, this.player.y - s.y) < 100) {
                this.interactableTarget = { type: 'sakha', obj: s };
                this.ui.showPrompt('💬', `Press SPACE to Talk with ${s.name}`);
                return;
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
            this.ui.showToast("+1 Fragrant Flower added to inventory!");
        } else if (target.type === 'tree' && target.obj.hasResource) {
            this.inventory.fruits++;
            target.obj.hasResource = null;
            target.obj.resourceRegenTimer = 18;
            this.particles.createPetals(this.player.x, this.player.y, '#facc15', 15);
            this.sound.playFluteNote(659.25, 0.25);
            this.ui.showToast("+1 Sweet Vrindavan Fruit gathered!");
        } else if (target.type === 'river') {
            this.inventory.water++;
            this.particles.createDust(this.player.x, this.player.y, '#38bdf8', 15);
            this.sound.playSplash();
            this.ui.showToast("+1 Cool Yamuna Jal collected in pot!");
        } else if (target.type === 'krishna') {
            this.ui.openInteractionMenu();
        } else if (target.type === 'sakha') {
            this.ui.showDialogue(target.obj.name, target.obj.dialogue, '🌿', 'text-yellow-400');
        }

        this.ui.updateInventory(this.inventory);
        this.checkInteractions();
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

    offerItem(type) {
        if (type === 'garland') {
            if (this.inventory.flowers >= 3) {
                this.inventory.flowers -= 3;
                this.ui.showDialogue("Krishna", "This Vaijayanti garland of wild forest flowers is so dear to my heart! Thank you, Sakha.", "🌸", "text-blue-400");
                this.particles.createPetals(this.krishna.x, this.krishna.y, '#f472b6', 45);
                this.sound.playCheer();
            } else {
                this.ui.showToast("You need 3 Flowers to string a sacred garland! 🌸");
            }
        } else if (type === 'butter') {
            if (this.inventory.butter >= 1) {
                this.inventory.butter--;
                this.ui.showDialogue("Krishna", "Aha! Fresh Makhan (Butter)! You are truly my dearest friend in all the three worlds!", "🍯", "text-yellow-400");
                this.particles.createSparkle(this.krishna.x, this.krishna.y, '#fef08a', 40);
                this.sound.playCheer();
            } else {
                this.ui.showToast("No Makhan in pot right now!");
            }
        } else if (type === 'fruit') {
            if (this.inventory.fruits >= 2) {
                this.inventory.fruits -= 2;
                this.ui.showDialogue("Dao Balaram", "These ripe forest fruits give immense strength! Well gathered, little brother!", "🍋", "text-white");
                this.particles.createPetals(this.balram.x, this.balram.y, '#facc15', 35);
                this.sound.playCheer();
            } else {
                this.ui.showToast("You need at least 2 Fruits for this offering!");
            }
        } else if (type === 'water') {
            if (this.inventory.water >= 1) {
                this.inventory.water--;
                this.ui.showDialogue("Krishna", "Ah! Crystal clear Yamuna Jal is so refreshing after tending the cows.", "💧", "text-blue-400");
                this.particles.createDust(this.krishna.x, this.krishna.y, '#38bdf8', 30);
                this.sound.playSplash();
            } else {
                this.ui.showToast("Collect Yamuna Jal from the riverbank first!");
            }
        }
        this.ui.updateInventory(this.inventory);
    }

    startGameMode(mode) {
        this.ui.closeGameChoice();
        this.state = mode;

        if (mode === 'volleyball') {
            // Switch to Yamuna Beach map where the volleyball court is set
            this.loadMap('yamuna');
            this.ui.setPhase("Phase: Kanduka Kridha (Volleyball Match)", "tag-volleyball");
            this.volleyballGame.start(this.yamunaMap.court);
        } else if (mode === 'tag') {
            this.ui.setPhase("Phase: Pakad Pakdai (Chase)", "tag-playing");
            this.tagGame.start();
        } else if (mode === 'holi') {
            this.ui.setPhase("Phase: Rangotsav (Holi Water Fight)", "tag-playing");
            this.holiGame.start();
        }
    }

    endGame(won, message) {
        this.state = 'gameover';
        this.ui.showGameOver(won ? "Victory & Joy!" : "Playful Defeat!", message, won);
    }

    returnToHub() {
        this.ui.hideGameOver();
        this.loadMap('vrindavan');
        this.initEntitiesHub();
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

            // Update stamina bar UI
            const staminaFill = document.getElementById('staminaFill');
            if (staminaFill) {
                staminaFill.style.width = `${this.player.stamina}%`;
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
                // Gentle wandering
                if (Math.random() < 0.02) s.wanderAngle += (Math.random() - 0.5);
                const sx = Math.cos(s.wanderAngle) * 50;
                const sy = Math.sin(s.wanderAngle) * 50;
                s.move(sx * dt, sy * dt, obstacles, mapW, mapH);
            }
        } else if (this.state === 'volleyball') {
            if (this.krishna) this.krishna.update(dt, obstacles, mapW, mapH, this.particles);
            if (this.balram) this.balram.update(dt, obstacles, mapW, mapH, this.particles);
            this.volleyballGame.update(dt);
        } else if (this.state === 'tag') {
            this.tagGame.update(dt);
        } else if (this.state === 'holi') {
            this.holiGame.update(dt);
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

        // 5. Mini-Game Projectiles / Volleyball Ball
        if (this.state === 'volleyball') this.volleyballGame.draw(ctx);
        if (this.state === 'holi') this.holiGame.draw(ctx);

        // 6. Tree Canopy Layer (Leaves above heads)
        this.mapManager.drawCanopy(ctx, this.camera);

        ctx.restore();

        // 7. Minimap
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
