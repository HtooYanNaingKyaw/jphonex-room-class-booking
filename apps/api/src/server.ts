import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { healthRouter } from './routes/health';
import { roomsRouter } from './routes/rooms';
import { bookingsRouter } from './routes/bookings';
import { classesRouter } from './routes/classes';
import { paymentsRouter } from './routes/payments';
import { eventsRouter } from './routes/events';

const app = express();
const logger = pino({ transport: { target: 'pino-pretty' } });

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/v1/rooms', roomsRouter);
app.use('/v1/classes', classesRouter);
app.use('/v1/bookings', bookingsRouter);
app.use('/v1/payments', paymentsRouter);
app.use('/v1/events', eventsRouter);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => logger.info(`API listening on http://localhost:${port}`));
