import { Router } from 'express';


export const paymentsRouter = Router();

paymentsRouter.get('/', (req, res) => {
  res.send('Health check successful!');
});