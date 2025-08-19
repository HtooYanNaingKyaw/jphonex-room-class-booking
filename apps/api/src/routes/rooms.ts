import { Router } from 'express';


export const roomsRouter = Router();

roomsRouter.get('/', (req, res) => {
  res.send('Health check successful!');
});