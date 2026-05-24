// import express and create an instance of it. app will be our server.
import express from 'express';

// import routes
import restaurantRouter from './routes/restaurantRoutes.js';
import userRouter from './routes/userRoute.js';
import tokenRouter from './routes/tokenRoute.js';
import productRouter from './routes/productRoutes.js';
import searchRouter from './routes/searchRouter.js';
import orderRouter from './routes/orderRoute.js';

const app = express();

// app will use express.json() middleware to parse JSON request bodies
app.use(express.json());

// connect URL paths to routers
app.use('/api/restaurants', restaurantRouter);
app.use('/api/users', userRouter);
app.use('/api/tokens', tokenRouter);
app.use('/api/orders', orderRouter);
app.use('/api/restaurants/:id/products', productRouter);
app.use('/api/search', searchRouter);

// TODO- delete
app.get('/ping', (req, res) => {
    res.status(200).send('Server worked successfully! Well done Roni, Moriya and Tamar! 👑❤️');
});

// export the app instance 
export default app;