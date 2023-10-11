import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import cookieParser from 'cookie-parser';

import express from 'express';
const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL)
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error(`Error connecting to DB: ${err}`));



app.use(express.static(path.resolve(__dirname, './frontend/build')));

import { router as assetsRouter } from './backend/routes/assets/assets.js';
app.use('/assets', assetsRouter);

import { router as loginRouter } from './backend/routes/login/login.js';
app.use('/login', loginRouter);

import { router as logoutRouter } from './backend/routes/logout/logout.js';
app.use('/logout', logoutRouter);

import { router as passwordRouter } from './backend/routes/password/password.js';
app.use('/password', passwordRouter);

import { router as registerRouter } from './backend/routes/register/register.js';
app.use('/register', registerRouter);

import { router as subtitlesRouter } from './backend/routes/subtitles/subtitles.js';
app.use('/subtitles', subtitlesRouter);

import { router as userRouter } from './backend/routes/user/user.js';
app.use('/user', userRouter);



app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './frontend/build', 'index.html'));
});



const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
