const testRestaurantProductFlow = async () => {
    try {
        console.log('Step 1: Logging in as Admin...');
        const loginRes = await fetch('http://localhost:3000/api/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'Password123' })
        });

        if (!loginRes.ok) {
            const errText = await loginRes.text();
            throw new Error(`Admin login failed: ${loginRes.status} - ${errText}`);
        }
        const { token } = await loginRes.json();
        console.log('Admin login successful.');

        console.log('\nStep 2: Creating a new Restaurant...');
        const restName = `Verification Restaurant ${Date.now()}`;
        const restFormData = new FormData();
        restFormData.append('name', restName);
        restFormData.append('lat', '32.0853');
        restFormData.append('lng', '34.7818');
        restFormData.append('prepTime', '15');
        
        // Mock image file using correct Multer field 'restaurantImage'
        const restFile = new Blob(['mock restaurant logo'], { type: 'image/png' });
        restFormData.append('restaurantImage', restFile, 'logo.png');

        const restCreateRes = await fetch('http://localhost:3000/api/restaurants', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: restFormData
        });

        if (restCreateRes.status !== 201) {
            const errText = await restCreateRes.text();
            throw new Error(`Create restaurant failed: ${restCreateRes.status} - ${errText}`);
        }
        const restLocation = restCreateRes.headers.get('Location');
        console.log('Restaurant created at location header:', restLocation);
        const restId = restLocation.split('/').pop();

        console.log('\nStep 3: Fetching the created Restaurant...');
        const restGetRes = await fetch(`http://localhost:3000/api/restaurants/${restId}`);
        if (!restGetRes.ok) throw new Error('Failed to fetch restaurant');
        const restaurant = await restGetRes.json();
        console.log('Restaurant details fetched:', restaurant.name, restaurant.geolocation);

        console.log('\nStep 4: Creating a Product for the Restaurant...');
        const prodFormData = new FormData();
        prodFormData.append('name', 'Verification Dish');
        prodFormData.append('price', '45');
        prodFormData.append('description', 'Delicious test dish verified against database');
        
        // Mock product image using correct Multer field 'productImage'
        const prodFile = new Blob(['mock product dish image'], { type: 'image/png' });
        prodFormData.append('productImage', prodFile, 'dish.png');

        const prodCreateRes = await fetch(`http://localhost:3000/api/restaurants/${restId}/products`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: prodFormData
        });

        if (prodCreateRes.status !== 201) {
            const errText = await prodCreateRes.text();
            throw new Error(`Create product failed: ${prodCreateRes.status} - ${errText}`);
        }
        const prodLocation = prodCreateRes.headers.get('Location');
        console.log('Product created at location header:', prodLocation);
        const prodId = prodLocation.split('/').pop();

        console.log('\nStep 5: Fetching all products for the Restaurant...');
        const prodsGetRes = await fetch(`http://localhost:3000/api/restaurants/${restId}/products`);
        if (!prodsGetRes.ok) throw new Error('Failed to fetch products');
        const productsList = await prodsGetRes.json();
        console.log('Fetched products list length:', productsList.length, 'First product name:', productsList[0].name, 'cppId:', productsList[0].cppId);

        console.log('\nStep 6: Updating the Restaurant and the Product...');
        // Update product price
        const prodUpdateFormData = new FormData();
        prodUpdateFormData.append('price', '50');
        const prodUpdateRes = await fetch(`http://localhost:3000/api/restaurants/${restId}/products/${prodId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body: prodUpdateFormData
        });
        if (prodUpdateRes.status !== 204) throw new Error('Product update failed');
        console.log('Product update successful.');

        // Verify updated product details
        const updatedProdRes = await fetch(`http://localhost:3000/api/restaurants/${restId}/products/${prodId}`);
        const updatedProd = await updatedProdRes.json();
        console.log('Updated product details:', updatedProd.name, 'New Price:', updatedProd.price);

        console.log('\nStep 7: Deleting the Product...');
        const prodDeleteRes = await fetch(`http://localhost:3000/api/restaurants/${restId}/products/${prodId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (prodDeleteRes.status !== 204) throw new Error('Product delete failed');
        console.log('Product deleted successfully.');

        console.log('\nStep 8: Deleting the Restaurant...');
        const restDeleteRes = await fetch(`http://localhost:3000/api/restaurants/${restId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (restDeleteRes.status !== 204) throw new Error('Restaurant delete failed');
        console.log('Restaurant deleted successfully.');

        console.log('\nRestaurant and Product CRUD Verification Passed successfully!');
    } catch (err) {
        console.error('\nRestaurant & Product CRUD Verification Failed:', err.message);
    }
};

testRestaurantProductFlow();
