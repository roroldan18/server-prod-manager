import { Router } from 'express';
import productsRouter from './productsRouter';


// Export the base-router
const baseRouter = Router();

// Setup routers
baseRouter.use('/products', productsRouter);

// Export default.
export default baseRouter;
