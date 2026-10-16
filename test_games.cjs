const http = require('http');

async function getWsUrl() {
    return new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const list = JSON.parse(data);
                const page = list.find(p => p.type === 'page' && p.url.includes('localhost:8089'));
                if (page) resolve(page.webSocketDebuggerUrl);
                else reject(new Error('Page not found: ' + data));
            });
        }).on('error', reject);
    });
}

async function run() {
    const wsUrl = await getWsUrl();
    const WebSocket = require('ws');
    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();

    ws.on('message', (msg) => {
        const res = JSON.parse(msg);
        if (res.id && callbacks.has(res.id)) {
            const cb = callbacks.get(res.id);
            callbacks.delete(res.id);
            cb(res);
        }
    });

    const send = (method, params = {}) => new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await new Promise(r => ws.on('open', r));
    console.log("Connected to Brave CDP!");

    await send('Runtime.enable');

    const evalJs = async (expr) => {
        const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        return res.result ? res.result.value : res;
    };

    // 1. Check volume slider & adjustVolume
    const volTest = await evalJs(`(() => {
        window.setMusicVolume(1);
        const at1 = { slider: document.getElementById('optVolumeSlider').value, text: document.getElementById('optVolumeText').innerText, vol: window.game.sound.musicVolume };
        window.adjustVolume(10);
        const at11 = { slider: document.getElementById('optVolumeSlider').value, text: document.getElementById('optVolumeText').innerText, vol: window.game.sound.musicVolume };
        window.adjustVolume(-10);
        const at1Again = { slider: document.getElementById('optVolumeSlider').value, text: document.getElementById('optVolumeText').innerText, vol: window.game.sound.musicVolume };
        window.setMusicVolume(50);
        const at50 = { slider: document.getElementById('optVolumeSlider').value, text: document.getElementById('optVolumeText').innerText, vol: window.game.sound.musicVolume };
        return { at1, at11, at1Again, at50 };
    })()`);
    console.log("Volume test:", JSON.stringify(volTest, null, 2));

    // 2. Check defaults: minimap and portrait
    const defaults = await evalJs(`(() => {
        return {
            minimapEnabled: window.game.sound.minimapEnabled,
            bigPortrait: window.game.sound.bigPortrait,
            reopenBtnExists: !!document.getElementById('reopenMinimapBtn'),
            minimapCollapsed: document.getElementById('minimapContainer').classList.contains('collapsed')
        };
    })()`);
    console.log("Defaults test:", JSON.stringify(defaults, null, 2));

    // 3. Test starting Holi Game
    const holiTest = await evalJs(`(() => {
        window.game.startPastimeFromKrishna('holi');
        return {
            state: window.game.state,
            isActive: window.game.holiGame.isActive,
            dialogueHidden: document.getElementById('dialogueBox').classList.contains('hidden'),
            hubBtnVisible: !document.getElementById('topHubReturnBtn').classList.contains('hidden'),
            krishnaCaught: window.game.krishna.isCaught
        };
    })()`);
    console.log("Holi start test:", JSON.stringify(holiTest, null, 2));

    // Wait 1 second and simulate shooting
    await new Promise(r => setTimeout(r, 1000));
    const holiShoot = await evalJs(`(() => {
        window.game.holiGame.shoot(window.game.player.x, window.game.player.y, window.game.krishna.x, window.game.krishna.y, '#ec4899', false, 'player');
        return {
            projectilesCount: window.game.holiGame.projectiles.length
        };
    })()`);
    console.log("Holi shoot test:", JSON.stringify(holiShoot, null, 2));

    // Return to Hub
    await evalJs(`window.game.returnToHub()`);
    const hubAfterHoli = await evalJs(`({ state: window.game.state, hubBtnHidden: document.getElementById('topHubReturnBtn').classList.contains('hidden') })`);
    console.log("Hub after Holi:", JSON.stringify(hubAfterHoli, null, 2));

    // 4. Test starting Tag Game
    const tagTest = await evalJs(`(() => {
        window.game.startPastimeFromKrishna('tag');
        return {
            state: window.game.state,
            isActive: window.game.tagGame.isActive,
            dialogueHidden: document.getElementById('dialogueBox').classList.contains('hidden'),
            hubBtnVisible: !document.getElementById('topHubReturnBtn').classList.contains('hidden'),
            krishnaDist: Math.hypot(window.game.player.x - window.game.krishna.x, window.game.player.y - window.game.krishna.y)
        };
    })()`);
    console.log("Tag start test:", JSON.stringify(tagTest, null, 2));

    // Return to Hub
    await evalJs(`window.game.returnToHub()`);

    // 5. Test starting Volleyball Game
    const vbTest = await evalJs(`(() => {
        window.game.startPastimeFromKrishna('volleyball');
        return {
            state: window.game.state,
            isActive: window.game.volleyballGame.isActive,
            dialogueHidden: document.getElementById('dialogueBox').classList.contains('hidden'),
            hubBtnVisible: !document.getElementById('topHubReturnBtn').classList.contains('hidden'),
            scoreboardVisible: !document.getElementById('volleyballScoreboard').classList.contains('hidden'),
            map: window.game.mapManager.currentMap.name
        };
    })()`);
    console.log("Volleyball start test:", JSON.stringify(vbTest, null, 2));

    // Return to Hub
    await evalJs(`window.game.returnToHub()`);

    // 6. Test Pond & Cow placement
    const mapCheck = await evalJs(`(() => {
        const pond = window.game.mapManager.currentMap.obstacles.find(o => o.type === 'pond');
        const trees = window.game.mapManager.currentMap.obstacles.filter(o => o.type === 'tree' || o.type === 'kadamba');
        const minTreeDist = Math.min(...trees.map(t => Math.hypot(t.x - pond.x, t.y - pond.y) - (t.visualRadius + pond.visualRadius)));
        const cowPondDists = window.game.cows.map(c => Math.hypot(c.x - pond.x, c.y - pond.y) - (c.radius + pond.radius));
        const minCowDist = Math.min(...cowPondDists);
        return {
            pondPos: { x: pond.x, y: pond.y, r: pond.radius },
            minTreeClearance: minTreeDist,
            minCowClearance: minCowDist,
            cowInsidePond: minCowDist <= 0
        };
    })()`);
    console.log("Map Pond & Cow check:", JSON.stringify(mapCheck, null, 2));

    ws.close();
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
