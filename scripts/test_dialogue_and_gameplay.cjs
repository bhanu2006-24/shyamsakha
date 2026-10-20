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
    console.log('Connecting to WS:', wsUrl);
    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.id && callbacks.has(data.id)) {
            const cb = callbacks.get(data.id);
            callbacks.delete(data.id);
            cb(data);
        }
    };

    const send = (method, params = {}) => {
        return new Promise((resolve) => {
            const reqId = id++;
            callbacks.set(reqId, resolve);
            ws.send(JSON.stringify({ id: reqId, method, params }));
        });
    };

    if (ws.readyState !== 1) {
        await new Promise(r => { ws.onopen = r; });
    }
    console.log('Connected to Chrome DevTools');

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: 'http://localhost:8089/' });
    console.log('Navigated to http://localhost:8089/');

    // Wait for game initialization
    await new Promise(r => setTimeout(r, 2500));

    const artifactDir = '/Users/bhanupratapsaini/.gemini/antigravity-ide/brain/76d1bf98-fa05-4d3b-94c6-50e6c56bf62d';

    async function takeScreenshot(name) {
        const res = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(artifactDir, name);
        fs.writeFileSync(filePath, Buffer.from(res.result.data, 'base64'));
        console.log(`Saved screenshot: ${name}`);
        return filePath;
    }

    // Step 1: Baseline Hub Screen
    await takeScreenshot('shot1_hub_grand_pastures.png');

    // Step 2: Open Krishna Dialogue
    await send('Runtime.evaluate', {
        expression: 'window.game.ui.startDialogueWithKrishna();'
    });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('shot2_krishna_4_options_dialogue.png');

    // Step 3: Click [1] Talk & Bansuri
    await send('Runtime.evaluate', {
        expression: 'window.game.ui.dialogueActions.children[0].click();'
    });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('shot3_krishna_bansuri_talk.png');

    // Step 4: Back to Main Menu then click [2] Offer Seva
    await send('Runtime.evaluate', {
        expression: 'window.game.ui.startDialogueWithKrishna();'
    });
    await new Promise(r => setTimeout(r, 400));
    await send('Runtime.evaluate', {
        expression: 'window.game.ui.dialogueActions.children[1].click();'
    });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('shot4_offer_submenu.png');

    // Step 5: Back to Main Menu then click [3] Play Pastimes
    await send('Runtime.evaluate', {
        expression: 'window.game.ui.startDialogueWithKrishna();'
    });
    await new Promise(r => setTimeout(r, 400));
    await send('Runtime.evaluate', {
        expression: 'window.game.ui.dialogueActions.children[2].click();'
    });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('shot5_play_pastimes_submenu.png');

    // Step 6: Close and open dialogue with a Sakha (Subal / Sudama)
    await send('Runtime.evaluate', {
        expression: 'window.game.ui.closeDialogue(); window.game.ui.startDialogueWithSakha(window.game.sakhas[0]);'
    });
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot('shot6_sakha_4_options_dialogue.png');

    // Step 7: Ask Sakha to play Dām Denā (Sakha runs to Krishna to ask Him!)
    await send('Runtime.evaluate', {
        expression: `
            const sakha = window.game.sakhas[0];
            window.game.ui.triggerPastimeWithNpc('dennertag', sakha);
        `
    });
    await new Promise(r => setTimeout(r, 700));
    await takeScreenshot('shot7_sakha_running_to_krishna.png');

    // Step 8: Wait for Krishna to blow flute and start Denner Tag (दाम देना)
    await new Promise(r => setTimeout(r, 2400));
    await takeScreenshot('shot8_denner_tag_countdown.png');

    console.log('All tests and screenshots completed successfully!');
    ws.close();
    process.exit(0);
}

run().catch(err => {
    console.error('Error running test script:', err);
    process.exit(1);
});
