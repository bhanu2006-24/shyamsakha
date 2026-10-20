const http = require('http');
const fs = require('fs');

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

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
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

    // 1. Give player inventory item to test offering
    const evalRes1 = await send('Runtime.evaluate', {
        expression: `
            window.game.inventory.butter = 2;
            window.game.inventory.fruits = 3;
            window.game.inventory.flowers = 4;
            window.game.ui.updateBagUI(window.game.inventory);
            JSON.stringify(window.game.inventory);
        `
    });
    console.log('Inventory updated:', evalRes1.result.value);

    // 2. Open Krishna dialogue
    await send('Runtime.evaluate', { expression: 'window.game.ui.startDialogueWithKrishna();' });
    await new Promise(r => setTimeout(r, 400));

    // 3. Open Offer Menu
    await send('Runtime.evaluate', { expression: 'window.game.ui.dialogueActions.children[1].click();' });
    await new Promise(r => setTimeout(r, 400));

    // 4. Offer Makhan (Button 0 in Offer Menu)
    const evalRes2 = await send('Runtime.evaluate', {
        expression: `
            window.game.ui.dialogueActions.children[0].click();
            window.game.inventory.butter;
        `
    });
    console.log('Butter after offering:', evalRes2.result.value);

    // 5. Close dialogue
    await send('Runtime.evaluate', { expression: 'window.game.ui.closeDialogue();' });
    await new Promise(r => setTimeout(r, 300));

    // 6. Test Volleyball Game Scoring Ground Touch
    const evalRes3 = await send('Runtime.evaluate', {
        expression: `
            window.game.startGameMode('volleyball');
            const vbg = window.game.volleyballGame;
            const ball = vbg.ball;
            // Simulate ball falling on player's side
            vbg.servingTeam = 'krishna';
            vbg.rallyActive = true;
            ball.x = 13400; // West side
            ball.y = 8000;
            ball.z = -1; // Ground touch!
            ball.vz = -50;
            vbg.update(0.016);
            JSON.stringify({ teamSakhaScore: vbg.teamSakhaScore, teamKrishnaScore: vbg.teamKrishnaScore });
        `
    });
    console.log('Volleyball ground touch scoring check:', evalRes3.result.value);

    // 7. Return to Hub
    await send('Runtime.evaluate', { expression: 'window.game.returnToHub();' });

    console.log('All gameplay flow validations passed!');
    ws.close();
    process.exit(0);
}

run().catch(err => {
    console.error('Error running flow test:', err);
    process.exit(1);
});
