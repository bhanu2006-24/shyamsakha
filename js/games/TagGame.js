/**
 * TagGame (पकड़ पकड़ाई - Pakad Pakdai)
 * Fast-paced chase game: Pursue Krishna & Dao Balaram across the pastures!
 */
export class TagGame {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.gameTime = 0;
    }

    start() {
        this.isActive = true;
        this.gameTime = 0;

        // Position Krishna & Balram far away
        const width = this.game.mapManager.getWidth();
        const height = this.game.mapManager.getHeight();

        this.game.krishna.x = width * 0.75;
        this.game.krishna.y = height * 0.75;
        this.game.krishna.isCaught = false;

        this.game.balram.x = width * 0.25;
        this.game.balram.y = height * 0.75;
        this.game.balram.isCaught = false;

        this.game.sakhas.forEach((s, idx) => {
            s.isCaught = false;
            s.x = this.game.player.x + (idx - 2) * 60;
            s.y = this.game.player.y + 60;
        });

        this.game.ui.showToast("🏃‍♂️ Pakad Pakdai started! Chase down Krishna & Dao Balram!");
    }

    update(dt) {
        if (!this.isActive) return;
        this.gameTime += dt;

        const player = this.game.player;
        const krishna = this.game.krishna;
        const balram = this.game.balram;
        const sakhas = this.game.sakhas;
        const obstacles = this.game.mapManager.getObstacles();
        const mapW = this.game.mapManager.getWidth();
        const mapH = this.game.mapManager.getHeight();

        const targets = [krishna, balram].filter(t => !t.isCaught);
        const pursuers = [player, ...sakhas].filter(p => !p.isCaught);

        // Check if player tagged Krishna
        if (!krishna.isCaught && Math.hypot(player.x - krishna.x, player.y - krishna.y) < player.radius + krishna.radius + 6) {
            krishna.isCaught = true;
            this.game.particles.createPetals(krishna.x, krishna.y, '#38bdf8', 35);
            this.game.sound.playCheer();
            this.game.ui.showToast("Got Shree Krishna! Now catch Dao Balram! 🦚");
        }

        // Check if player tagged Balram
        if (!balram.isCaught && Math.hypot(player.x - balram.x, player.y - balram.y) < player.radius + balram.radius + 6) {
            balram.isCaught = true;
            this.game.particles.createPetals(balram.x, balram.y, '#f8fafc', 35);
            this.game.sound.playCheer();
            this.game.ui.showToast("Got Dao Balram! Splendid speed! 🌾");
        }

        // AI Fleeing for targets
        for (const target of targets) {
            let tx = 0;
            let ty = 0;

            for (const p of pursuers) {
                const dx = target.x - p.x;
                const dy = target.y - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 1200 && dist > 0) {
                    const weight = 1500 / (dist + 1);
                    tx += (dx / dist) * weight;
                    ty += (dy / dist) * weight;
                }
            }

            const avoid = target.getAvoidanceForce(obstacles, 150);
            tx += avoid.x * 4.5;
            ty += avoid.y * 4.5;

            const len = Math.hypot(tx, ty);
            if (len > 0) {
                tx /= len;
                ty /= len;
            }

            target.applyTerrain(obstacles);
            target.moveWithAnim(tx * target.currentSpeed * target.terrainModifier * dt, ty * target.currentSpeed * target.terrainModifier * dt, obstacles, mapW, mapH, dt);
        }

        // AI Chasing for Sakhas
        for (const s of sakhas) {
            if (targets.length === 0) break;
            const target = targets[0];
            const dx = target.x - s.x;
            const dy = target.y - s.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0) {
                const avoid = s.getAvoidanceForce(obstacles, 110);
                let ax = (dx / dist) + avoid.x * 2.5;
                let ay = (dy / dist) + avoid.y * 2.5;
                const aLen = Math.hypot(ax, ay);
                if (aLen > 0) { ax /= aLen; ay /= aLen; }

                s.applyTerrain(obstacles);
                s.moveWithAnim(ax * s.currentSpeed * s.terrainModifier * dt, ay * s.currentSpeed * s.terrainModifier * dt, obstacles, mapW, mapH, dt);
            }
        }

        // Win condition
        if (krishna.isCaught && balram.isCaught) {
            this.isActive = false;
            this.game.endGame(true, `You caught both Krishna & Dao Balram in ${this.gameTime.toFixed(1)} seconds!`);
        }
    }
}
