const testUserFlow = async () => {
    try {
        const username = `testuser_${Date.now()}`;
        const password = 'Password123';
        const displayName = 'Test User';
        const phone = '0509876543';
        const lat = 32.0801;
        const lng = 34.7805;

        console.log(`Step 1: Registering user ${username}...`);
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('displayName', displayName);
        formData.append('phone', phone);
        formData.append('lat', String(lat));
        formData.append('lng', String(lng));
        
        // Create a mock image file to satisfy server profileImage validation
        const file = new Blob(['mock image content'], { type: 'image/png' });
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
        console.log('Registration successful, user ID:', regData.id || regData._id);
        const userId = regData.id || regData._id;

        console.log('\nStep 2: Logging in...');
        const loginRes = await fetch('http://localhost:3000/api/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!loginRes.ok) {
            const errText = await loginRes.text();
            throw new Error(`Login failed: ${loginRes.status} - ${errText}`);
        }
        const { token } = await loginRes.json();
        console.log('Login successful, token retrieved.');

        console.log('\nStep 3: Fetching profile...');
        const profileRes = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!profileRes.ok) {
            const errText = await profileRes.text();
            throw new Error(`Fetch profile failed: ${profileRes.status} - ${errText}`);
        }
        const profile = await profileRes.json();
        console.log('Profile retrieved:', profile);

        console.log('\nStep 4: Editing profile...');
        const editFormData = new FormData();
        editFormData.append('displayName', 'Updated Test User');
        editFormData.append('phone', '0541234567');

        const editRes = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: editFormData
        });

        if (!editRes.ok) {
            const errText = await editRes.text();
            throw new Error(`Edit profile failed: ${editRes.status} - ${errText}`);
        }
        const updatedProfile = await editRes.json();
        console.log('Profile updated successfully:', updatedProfile);

        console.log('\nUser Flow Verification Passed successfully!');
    } catch (err) {
        console.error('\nUser Flow Verification Failed:', err.message);
    }
};

testUserFlow();
