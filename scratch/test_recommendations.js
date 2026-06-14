// Using global fetch

async function runTest() {
    const API_URL = 'http://localhost:3000/api';
    console.log('--- Starting Recommendation Integration Test ---');

    // Generate unique usernames to prevent database collision errors on run
    const rand = Math.floor(Math.random() * 100000);
    const usernameA = `usera_${rand}`;
    const usernameB = `userb_${rand}`;

    const userAData = {
        username: usernameA,
        password: 'password123',
        displayName: 'User A',
        phone: '0501111111',
        lat: '32.08',
        lng: '34.78',
        isAdmin: 'false'
    };

    const userBData = {
        username: usernameB,
        password: 'password123',
        displayName: 'User B',
        phone: '0502222222',
        lat: '32.08',
        lng: '34.78',
        isAdmin: 'false'
    };

    // Helper function to register a user using multipart/form-data logic manually or raw json
    // Since the API accepts multipart/form-data for registration, let's construct a simple multipart boundary request.
    async function registerUser(userData) {
        const boundary = '----TestBoundary' + Math.random().toString(36).substring(2);
        let body = '';
        for (const [key, value] of Object.entries(userData)) {
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
            body += `${value}\r\n`;
        }
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="profileImage"; filename="test.png"\r\n`;
        body += `Content-Type: image/png\r\n\r\n`;
        body += `fake-image-data\r\n`;
        body += `--${boundary}--\r\n`;


        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: body
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to register user ${userData.username}: ${res.statusText} - ${errText}`);
        }
        return await res.json();
    }

    // Helper to log in a user and get token
    async function loginUser(username, password) {
        const res = await fetch(`${API_URL}/tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            throw new Error(`Failed to login user ${username}: ${res.statusText}`);
        }
        const data = await res.json();
        return data.token;
    }

    console.log('1. Registering test users...');
    const regA = await registerUser(userAData);
    const regB = await registerUser(userBData);
    console.log(`Registered User A (ID: ${regA.id}) and User B (ID: ${regB.id})`);

    console.log('2. Logging in test users...');
    const tokenA = await loginUser(usernameA, 'password123');
    const tokenB = await loginUser(usernameB, 'password123');
    console.log('Logged in successfully, tokens acquired.');

    // Get BBB and Golda IDs from the API to be dynamic and correct
    console.log('3. Fetching restaurants and products...');
    const restRes = await fetch(`${API_URL}/restaurants`);
    const restaurants = await restRes.json();
    
    const bbb = restaurants.find(r => r.name === 'BBB');
    const golda = restaurants.find(r => r.name === 'Golda');

    if (!bbb || !golda) {
        throw new Error('Required restaurants "BBB" or "Golda" not found in database.');
    }

    const prod1 = bbb.menu.find(p => p.name === 'Classic Burger');
    const prod2 = bbb.menu.find(p => p.name === 'Double BBB Burger');
    const prod3 = golda.menu.find(p => p.name === 'Cookim Gelato');

    if (!prod1 || !prod2 || !prod3) {
        throw new Error('Required products "Classic Burger", "Double BBB Burger", or "Cookim Gelato" not found in menus.');
    }

    console.log(`Found BBB Burger: ${prod1.name} (${prod1.id})`);
    console.log(`Found BBB Double Burger: ${prod2.name} (${prod2.id})`);
    console.log(`Found Golda Gelato: ${prod3.name} (${prod3.id})`);

    // Verify recommendations for clean user is empty
    console.log('4. Requesting recommendations for clean User A...');
    const recsCleanRes = await fetch(`${API_URL}/restaurants/recommendations`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const recsClean = await recsCleanRes.json();
    console.log('Clean User A recommendations:', recsClean);
    if (recsClean.length !== 0) {
        throw new Error(`Expected empty recommendations array, got length ${recsClean.length}`);
    }
    console.log('Success: Clean recommendations are empty.');

    // User A orders Product 1 and Product 2
    console.log('5. User A placing order with Classic Burger and Double BBB Burger...');
    const orderARes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenA}`
        },
        body: JSON.stringify({
            restaurantId: bbb.id,
            items: [
                { productId: prod1.id, name: prod1.name, price: prod1.price, quantity: 1 },
                { productId: prod2.id, name: prod2.name, price: prod2.price, quantity: 1 }
            ]
        })
    });
    if (!orderARes.ok) {
        const errText = await orderARes.text();
        throw new Error(`User A order checkout failed: ${orderARes.statusText} - ${errText}`);
    }
    const orderA = await orderARes.json();
    console.log('User A order placed successfully. ID:', orderA.id);

    // User B orders Product 1 and Product 2, then Product 3
    console.log('6. User B placing order with Classic Burger and Double BBB Burger...');
    const orderB1Res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenB}`
        },
        body: JSON.stringify({
            restaurantId: bbb.id,
            items: [
                { productId: prod1.id, name: prod1.name, price: prod1.price, quantity: 1 },
                { productId: prod2.id, name: prod2.name, price: prod2.price, quantity: 1 }
            ]
        })
    });
    if (!orderB1Res.ok) {
        throw new Error('User B first order failed');
    }
    console.log('User B first order placed.');

    console.log('7. User B placing order with Golda Cookim Gelato...');
    const orderB2Res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenB}`
        },
        body: JSON.stringify({
            restaurantId: golda.id,
            items: [
                { productId: prod3.id, name: prod3.name, price: prod3.price, quantity: 1 }
            ]
        })
    });
    if (!orderB2Res.ok) {
        const errText = await orderB2Res.text();
        throw new Error(`User B second order failed: ${errText}`);
    }
    console.log('User B second order placed.');

    // We must wait a tiny bit to make sure C++ server database is synced asynchronously.
    console.log('Waiting 1.5 seconds for background C++ socket synchronization...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Request recommendations for User A again
    console.log('8. Fetching recommendations for User A after orders...');
    const recsRes = await fetch(`${API_URL}/restaurants/recommendations`, {
        headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const recs = await recsRes.json();
    console.log('Recommendations returned:', recs.map(r => r.name));

    if (recs.length === 0) {
        throw new Error('Expected Golda to be recommended, but got an empty list.');
    }

    const recommendedGolda = recs.find(r => r.name === 'Golda');
    if (!recommendedGolda) {
        throw new Error('Expected Golda to be recommended, but it was not in the list.');
    }

    console.log('Success: "Golda" was successfully recommended to User A based on collaborative filtering!');
    console.log('--- Recommendation Integration Test Passed Successfully ---');
}

runTest().catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
});
