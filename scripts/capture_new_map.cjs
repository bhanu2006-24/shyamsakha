const http = require('http');
const fs = require('fs');
const path = require('path');

function getWebSocketUrl() {
    return new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json/list', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const list = JSON.parse(data);
                const page = list.find(t => t.type === 'page') || list[0];
                resolve(page.webSocketDebuggerUrl);
            });
        }).on('error', reject);
    });
}

async function run() {
    const wsUrl = await getWebSocketUrl();
    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();
    const consoleLogs = [];

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.method === 'Runtime.consoleAPICalled') {
            consoleLogs.push(data.params.args.map(a => a.value).join(' '));
        }
        if (data.id && callbacks.has(data.id)) {
            const cb = callbacks.get(data.id);
            callbacks.delete(data.id);
            cb(data);
        }
    };

    if (ws.readyState !== 1) {
        await new Promise(r => { ws.onopen = r; });
    }

    const send = (method, params = {}) => {
        return new Promise((resolve) => {
            const reqId = id++;
            callbacks.set(reqId, resolve);
            ws.send(JSON.stringify({ id: reqId, method, params }));
        });
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.reload');
    console.log('Reloaded page with new map data');

    await new Promise(r => setTimeout(r, 2000));

    const artifactDir = '/Users/bhanupratapsaini/.gemini/antigravity-ide/brain/76d1bf98-fa05-4d3b-94c6-50e6c56bf62d';

    async function takeScreenshot(name) {
        const res = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(artifactDir, name);
        fs.writeFileSync(filePath, Buffer.from(res.result.data, 'base64'));
        console.log(`Saved screenshot: ${name}`);
        return filePath;
    }

    // 1. Hub with new lush surroundings
    await takeScreenshot('shot9_filled_hub.png');

    // 2. Move to West Mango Orchard
    await send('Runtime.evaluate', {
        expression: 'window.game.player.x = 4800; window.game.player.y = 8000; window.game.camera.setTarget(window.game.player);'
    });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('shot10_west_mango_amrai.png');

    // 3. Move to Kamal Sarovar (South)
    await send('Runtime.evaluate', {
        expression: 'window.game.player.x = 8000; window.game.player.y = 11700; window.game.camera.setTarget(window.game.player);'
    });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('shot11_south_kamal_sarovar.png');

    // 4. Move to Yamuna Sandbank Shore & Volleyball (East)
    await send('Runtime.evaluate', {
        expression: 'window.game.player.x = 13200; window.game.player.y = 7800; window.game.camera.setTarget(window.game.player);'
    });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('shot12_yamuna_sandbank_court.png');

    // 5. Move to Govardhan Foothills (South-West)
    await send('Runtime.evaluate', {
        expression: 'window.game.player.x = 4200; window.game.player.y = 11800; window.game.camera.setTarget(window.game.player);'
    });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('shot13_govardhan_boulder_groves.png');

    console.log('Console logs count:', consoleLogs.length);
    console.log('All zone captures completed successfully!');
    ws.close();
    process.exit(0);
}

run().catch(err => {
    console.error('Error running capture script:', err);
    process.exit(1);
});
