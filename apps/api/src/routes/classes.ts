import { Router } from 'express';


export const classesRouter = Router();

classesRouter.get('/', (req, res) => {
  res.send('Health check successful!');
});