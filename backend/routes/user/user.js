import UserClient from '../../models/UserClient.js';

import express from 'express';
export const router = express.Router();

import auth from '../../middleware/auth/auth.js';



router.get('/', auth, (req, res) => {
    const { user } = req;
    const userClient = new UserClient(user);
    res.status(200).json({ userClient });
});
