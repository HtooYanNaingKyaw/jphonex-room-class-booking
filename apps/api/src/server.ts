import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { roomsRouter } from './routes/rooms';
import { bookingsRouter } from './routes/bookings';
import { classesRouter } from './routes/classes';
import { paymentsRouter } from './routes/payments';
import { eventsRouter } from './routes/events';
import { policiesRouter } from './routes/policies';
import { analyticsRouter } from './routes/analytics';

const app = express();
const logger = pino({ transport: { target: 'pino-pretty' } });

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/v1/auth', authRouter);
app.use('/v1/users', usersRouter);
app.use('/v1/rooms', roomsRouter);
app.use('/v1/classes', classesRouter);
app.use('/v1/bookings', bookingsRouter);
app.use('/v1/payments', paymentsRouter);
app.use('/v1/events', eventsRouter);
app.use('/v1/policies', policiesRouter);
app.use('/v1/analytics', analyticsRouter);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => logger.info(`API listening on http://localhost:${port}`));
