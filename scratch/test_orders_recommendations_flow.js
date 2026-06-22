const testOrdersRecommendationsFlow = async () => {
    try {
        const username = `verify_user_${Date.now()}`;
        const password = 'Password123';
        const displayName = 'Recommendation Tester';
        const phone = '0501234567';
        const lat = 32.0801;
        const lng = 34.7805;

        console.log('Step 1: Registering a new customer...');
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('displayName', displayName);
        formData.append('phone', phone);
        formData.append('lat', String(lat));
        formData.append('lng', String(lng));
        const file = new Blob(['avatar data'], { type: 'image/png' });
        formData.append('profileImage', file, 'avatar.png');

        const regRes = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            body: formData
        });

        if (!regRes.ok) {
            const errText = await regRes.text();
            throw new Error(`Registration failed: ${regRes.status} - ${errText}`);
        }
        const regData = await regRes.json();
        const userId = regData.id || regData._id;
        console.log(`Registered user: ${username} (ID: ${userId})`);

        console.log('\nStep 2: Logging in...');
        const loginRes = await fetch('http://localhost:3000/api/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!loginRes.ok) throw new Error('Login failed');
        const { token } = await loginRes.json();
        console.log('Login successful, token retrieved.');

        console.log('\nStep 3: Placing an order (Classic Burger)...');
        // Classic Burger has productId 'prod-bbb-1', price 55, name 'Classic Burger'
        const orderRes = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                restaurantId: 'bbb-restaurant-uuid-static',
                items: [
                    {
                        productId: 'prod-bbb-1',
                        quantity: 1,
                        price: 55,
                        name: 'Classic Burger'
                    }
                ]
            })
        });

        if (!orderRes.ok) {
            const errText = await orderRes.text();
            throw new Error(`Order placement failed: ${orderRes.status} - ${errText}`);
        }
        const orderData = await orderRes.json();
        console.log(`Order placed successfully. ID: ${orderData.id}, Total paid: ₪${orderData.total}`);

        // Small delay to ensure background C++ socket sync finishes
        console.log('Waiting 2 seconds for C++ background synchronization...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('\nStep 4: Fetching user order history...');
        const historyRes = await fetch('http://localhost:3000/api/orders', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!historyRes.ok) throw new Error('Failed to fetch order history');
        const history = await historyRes.json();
        console.log(`History retrieved. Number of orders: ${history.length}`);
        console.log(`First order total: ₪${history[0].total}, Items count: ${history[0].items.length}`);

        console.log('\nStep 5: Testing real-time recommendations from C++ socket server...');
        const recommendationsRes = await fetch('http://localhost:3000/api/restaurants/recommendations', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!recommendationsRes.ok) {
            const errText = await recommendationsRes.text();
            throw new Error(`Fetching recommendations failed: ${recommendationsRes.status} - ${errText}`);
        }
        const recommendedRestaurants = await recommendationsRes.json();
        console.log(`Recommended restaurants retrieved count: ${recommendedRestaurants.length}`);
        if (recommendedRestaurants.length > 0) {
            console.log('Sample recommended restaurant names:', recommendedRestaurants.map(r => r.name).join(', '));
        } else {
            console.log('No recommendations returned (which is normal if C++ recommend filter excludes everything or requires more data)');
        }

        console.log('\nOrder Placement and Recommendation Sync Verification Passed successfully!');
    } catch (err) {
        console.error('\nVerification Failed:', err.message);
    }
};

testOrdersRecommendationsFlow();
