// import express and create an instance of it. app will be our server.
import express from 'express';

// import routes
import restaurantRoutes from './routes/restaurantRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import productRoutes from './routes/productRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

// app will use express.json() middleware to parse JSON request bodies
app.use(express.json());

// connect URL paths to routers
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants/:id/products', productRoutes);
app.use('/api/search', searchRoutes);

// export the app instance 
export default app;