/**
 * MapManager - Manages loading, updating, rendering, and collision for maps
 */
export class MapManager {
    constructor() {
        this.currentMap = null;
        this.maps = {};
    }

    registerMap(name, mapInstance) {
        this.maps[name] = mapInstance;
        if (!this.currentMap) {
            this.currentMap = mapInstance;
        }
    }

    loadMap(name) {
        if (this.maps[name]) {
            this.currentMap = this.maps[name];
            this.currentMap.init();
            return this.currentMap;
        }
        console.warn(`Map ${name} not found!`);
        return this.currentMap;
    }

    update(dt) {
        if (this.currentMap && this.currentMap.update) {
            this.currentMap.update(dt);
        }
    }

    drawGround(ctx, camera) {
        if (this.currentMap) {
            this.currentMap.drawGround(ctx, camera);
        }
    }

    drawProps(ctx, camera) {
        if (this.currentMap) {
            this.currentMap.drawProps(ctx, camera);
        }
    }

    drawCanopy(ctx, camera, player = null) {
        if (this.currentMap) {
            this.currentMap.drawCanopy(ctx, camera, player);
        }
    }

    getObstacles() {
        return this.currentMap ? this.currentMap.obstacles : [];
    }

    getWidth() {
        return this.currentMap ? this.currentMap.width : 4500;
    }

    getHeight() {
        return this.currentMap ? this.currentMap.height : 4500;
    }
}
