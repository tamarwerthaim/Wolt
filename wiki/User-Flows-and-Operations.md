# User Flows and Mobile App Operations Guide

This guide details how to perform the main application workflows—Registration, Login, and managing Restaurants, Products, and Orders—on the React Native Mobile Client (Expo).

---

## 1. User Authentication

### Registration
1. Tap the **Profile** button in the top-right corner of the HomeScreen.
2. Tap **Log In** in the dropdown.
3. At the bottom of the Login screen, tap the link **New to Wolt? Sign Up**.
4. Fill out the form fields: Username, Display Name, Phone Number, Latitude, Longitude, Password, Confirm Password, and tap the profile picture picker to select/upload a photo.
5. **Manager Privilege Option:** To gain admin/owner privileges, tap the checkbox at the bottom that says **"I am a restaurant owner"**. When checked, it will display a checkmark.
6. Tap the **Sign Up** button to complete registration.

![Registration Screen](../mobile/assets/wiki/guest/sign_up.png)

### Login
1. Tap the **Profile** button in the top-right corner of the sticky header on the HomeScreen.
2. In the profile dropdown that slides open, tap the blue **Log In** button.
3. Input your Username and Password, then tap the **Next** button.

![Login Screen](../mobile/assets/wiki/guest/log_in.png)

---

## 2. Managing Restaurants

### Create
1. Log in as an administrator/manager.
2. Tap the **Add Restaurant (+)** button in the header of the HomeScreen.
3. Fill out the form fields: Name, Description, Image URL, and Location Coordinates.
4. Tap **Save** to add the restaurant.

![Create Restaurant Form](../mobile/assets/wiki/user/admin_add_restaurant.png)

### Edit
1. Locate the restaurant card on the HomeScreen.
2. Tap the **Edit (pencil)** icon on the top right of the card.
3. Modify the desired fields and tap **Update**.

![Edit Restaurant Form](../mobile/assets/wiki/user/admin_edit_and_delete_restuarnt.png)

### Delete
1. Tap the **Edit (pencil)** icon on the restaurant card.
2. Scroll to the bottom of the edit screen and tap **Delete Restaurant**.

---

## 3. Managing Products

### Create
1. Open the restaurant details page of a restaurant **that you created** by tapping the restaurant card.
2. Tap the **Add Product** button at the bottom of the list.
3. Enter details: Name, Description, Price, and Image URL.
4. Tap **Create Product**.

![Create Product Form](../mobile/assets/wiki/user/admin_add_product.png)

### Edit
1. Open the restaurant details page.
2. Tap the **Edit (pencil)** icon overlaying the product card you wish to edit.
3. Modify the Name, Description, Price, or Image and tap **Save**.

![Edit Product Form](../mobile/assets/wiki/user/admin_edit_and_delete_product.png)

### Delete
1. Tap the **Edit (pencil)** icon on the product card.
2. Scroll to the bottom of the edit screen and tap **Delete Product**.

---

## 4. Ordering System

### Create Order
1. Open a restaurant details page.
2. Add dishes to your cart by tapping the **+** button on the product cards.
3. Open the **Cart Modal** (tap the floating cart bar at the bottom).
4. Tap **Proceed to Checkout**. Upon success, you will be redirected to the Order Success screen.

![Restaurant Details](../mobile/assets/wiki/user/Restaurant_details.png)
![Cart Modal](../mobile/assets/wiki/user/cart.png)
![Order Success Screen](../mobile/assets/wiki/user/Order_confirmed.png)

### View History
1. Tap the **Profile** button in the header of the HomeScreen.
2. In the profile dropdown that slides open, tap the **Order History** button to open the screen showing all past orders.
3. Tap a specific order card in the list to open the **Order Details Modal**.
4. **Edit/Cancel Order:** Within the details modal:
   - Tap **Edit Order** to load the items back into the cart for modification/re-ordering.
   - Tap **Cancel Order** to delete/cancel the order from the database.

![Order History Icon](../mobile/assets/wiki/user/user_profil.png)
![Order History Screen](../mobile/assets/wiki/user/Order_history.png)
![Order Details Modal](../mobile/assets/wiki/user/edit_and_delete_order.png)

---

## 5. Additional Features

### Real-Time Search System
- **How to Use:** 
  1. Tap the **Search** icon in the header of the HomeScreen.
  2. Start typing a restaurant name or dish in the search bar.
  3. Toggle the filter chips (**All**, **Restaurants**, or **Dishes**) to refine search results.
  4. Tap any search result to navigate directly to its restaurant page.

![Search Screen](../mobile/assets/wiki/user/search.jpeg)

### Dynamic Theme Customization (Dark Mode)
- **How to Use:**
  1. Tap the **Profile** button on the HomeScreen.
  2. Toggle the **Light Mode / Dark Mode** switch. 
  3. The application will instantly switch color palettes and styling across all screens.

![Dark Mode / Profile Dropdown](../mobile/assets/wiki/user/user_profil.png)
![Dark Mode](../mobile/assets/wiki/user/dark_mode.jpeg)

### Edit Profile
- **How to Use:**
  1. Tap the **Profile** button on the HomeScreen.
  2. If logged in, tap the **Edit (pencil)** button next to your avatar in the dropdown.
  3. Modify your profile details (e.g., Name, Phone, Coordinates) and save to update.

![Edit Profile Icon](../mobile/assets/wiki/user/user_profil.png)
![Edit Profile Screen](../mobile/assets/wiki/user/edit_profile.jpeg)

### Product & Restaurant Recommendation Engine
Powered by a high-performance C++ backend engine, this feature dynamically analyzes user order histories and viewing actions to provide personalized suggestions:
- **Personalized Restaurant Recommendations:**
  1. Select the **Recommended** tab (located below the horizontal marquee on the HomeScreen).
  2. If you are logged in, the app queries the C++ engine to generate a customized list of restaurants serving products you are likely to enjoy (filtering out restaurants you have already ordered from to encourage discovery).
  3. If you are logged out, a message will prompt you to log in to unlock recommendations.

![Recommended Tab](../mobile/assets/wiki/user/Restaurant_recommendation.png)
![Logged Out Recommendations Blocked](../mobile/assets/wiki/guest/Blocking_Recommendations.png)

- **Product co-view suggestions:**
  1. Navigate to any restaurant's details screen.
  2. Scroll down to the bottom of the menu to view the horizontal scroll section titled **"Maybe you want:"**.
  3. This section presents products from the restaurant that other users frequently co-viewed or ordered in relation to your history, allowing you to quickly add them to your cart.

![Product Recommendations Section](../mobile/assets/wiki/user/Product_details.png)

### Location-Based Distance Sorting
- **How it works:**
  1. When a user logs in, the application retrieves their coordinates from their profile.
  2. The app dynamically calculates the straight-line distance (in kilometers) using the Haversine formula between the user's location and each restaurant's coordinates.
  3. **Visual Distance & Time Indicators:** On each restaurant card, the app displays the computed distance (e.g., `📍 1.2 km`) and the estimated travel time (e.g., ` 4 min` computed as `distance * 3`).
  4. **Automatic Sorting:** The HomeScreen automatically sorts all restaurants (in both the horizontal marquee and the main vertical list) from shortest to longest delivery time (travel time + prep time), ensuring that the closest restaurants are presented first.
  5. If logged out, the cards default to displaying standard coordinate markers without distance estimations.

![Distance Sorted HomeScreen](../mobile/assets/wiki/user/user_home.jpeg)

### Restaurant Rating System
- **How it works:**
  1. Users can view the average score (e.g., `4.5 ★`) and the number of total ratings (e.g., `(12 ratings)`) on the restaurant details page.
  2. **Access Restrictions:** Only logged-in users can submit ratings.
  3. **Guest Warning:** If a guest user attempts to select a star to rate, they are shown a **Login Required** popup alert instructing them to log in to vote.
  4. **Interactive Stars:** Authenticated users can tap the 1-to-5 star component to rate the restaurant. This submits a POST request to `/api/restaurants/:id/rate` and updates the stats in real-time.

![Restaurant Details and Rating Component](../mobile/assets/wiki/user/Restaurant_details.png)
![Rate Restaurant](../mobile/assets/wiki/user/rating.jpeg)
