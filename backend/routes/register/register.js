const User = require('../../models/User');

const express = require('express');
const router = express.Router();

const useBody = require('../../middleware/format/useBody');



router.post('/', (req, res, next) => useBody(req, res, next, ['email', 'password']), async (req, res) => {
    let existingUser = await User.findOne({ email: req.body.email })
        .catch(err => {
            console.error(err);
            existingUser = null;
        });
    if (existingUser) return res.status(401).json({ success: false, message: 'This email already exists.' });

    const hashedPassword = await User.hashPassword(req.body.password);
    const user = new User({
        email: req.body.email,
        hashedPassword
    });

    try {
        await user.register(req, res);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered registration error. Please try again later.' });
    }

    res.status(200).json({ success: true });
});



router.post('/auth', (req, res, next) => useBody(req, res, next, ['emailAuthStr']), async (req, res) => {
    let user = await User.findOne({ emailAuthStr: req.body.emailAuthStr })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(201).json({ success: false, message: 'Invalid email authorization link.' });

    try {
        await user.activateAccount();
    } catch (err) {
        console.error(err);
        return res.status(201).json({ success: false, message: 'Encountered error processing authentication. Please try again later.' });
    }

    res.status(201).json({ success: true });
});



router.post('/resend', (req, res, next) => useBody(req, res, next, ['email']), async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(404).json({ success: false, message: 'No such user found.' });
    if (user.emailVerified) return res.status(400).json({ success: false, message: 'Your account is already activated.' });

    try {
        await user.register();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered registration error. Please try again later.' });
    }

    res.status(201).json({ success: true });
});



module.exports = router;
