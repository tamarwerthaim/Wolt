// import express and create an instance of it. app will be our server.
import express from 'express';
const app = express();

// app will use express.json() middleware to parse JSON request bodies
app.use(express.json());

// import routes
// const restaurantRouter = require('./routes/restaurantRouter');
const userRouter = require('./routes/userRouter');
const tokenRouter = require('./routes/tokenRouter');
// const productRouter = require('./routes/productRouter');
// const orderRouter = require('./routes/orderRouter');
// const searchRouter = require('./routes/searchRouter');

// connect URL paths to routers
// app.use('/api/restaurants', restaurantRouter);
app.use('/api/users', userRouter);
app.use('/api/tokens', tokenRouter);
// app.use('/api/products', productRouter);
// app.use('/api/orders', orderRouter);
// app.use('/api/search', searchRouter);

// TODO- delete
app.get('/ping', (req, res) => {
    res.status(200).send('Server worked successfully! Well done Roni, Moriya and Tamar! 👑❤️');
});

// export the app instance 
export default app;