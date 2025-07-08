import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

import analyzeRouter from './routes/analyze';
import recyclablesRouter from './routes/recyclables';
import usersRouter from './routes/users';
import storesRouter from './routes/stores';

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/analyze', analyzeRouter);
app.use('/recyclables', recyclablesRouter);
app.use('/users', usersRouter);
app.use('/stores', storesRouter);

export default app; 