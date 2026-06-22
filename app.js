// import express and create an instance of it. app will be our server.
import express from 'express';
import cors from 'cors';

// import routes
import restaurantRoutes from './routes/restaurantRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import productRoutes from './routes/productRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import mongoose from 'mongoose';
import { seedDefaultAdmin } from './models/userModel.js';
import { seedDefaultRestaurants } from './models/restaurantModel.js';

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wolt';
mongoose.connect(mongoURI)
  .then(async () => {
      await seedDefaultAdmin();
      await seedDefaultRestaurants();
  })
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

const app = express();
app.use(cors());

// app will use express.json() middleware to parse JSON request bodies
app.use(express.json());

// connect URL paths to routers
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants/:id/products', productRoutes);
app.use('/api/search', searchRoutes);
app.use('/uploads', express.static('uploads'));

// export the app instance 
export default app;