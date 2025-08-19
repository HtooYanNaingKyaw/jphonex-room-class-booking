import { Router } from 'express';


export const eventsRouter = Router();

eventsRouter.get('/', (req, res) => {
  res.send('Health check successful!');
});