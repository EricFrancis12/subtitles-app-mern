const User = require('../../models/User');

const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth/auth');
const useBody = require('../../middleware/format/useBody');



router.post('/reset', (req, res, next) => useBody(req, res, next, ['email']), async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(404).json({ success: false, message: 'No such user found.' });

    try {
        await user.initResetPassword();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered error resetting password. Please try again later.' });
    }

    res.status(200).json({ success: true });
});



router.post('/reset/auth', (req, res, next) => useBody(req, res, next, ['resetPasswordAuthStr']), async (req, res) => {
    let user = await User.findOne({ resetPasswordAuthStr: req.body.resetPasswordAuthStr })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid password reset link...' });

    try {
        // Here we are removing the 'resetPasswordAuthStr' property from user in DB,
        // and setting it in an expiring signed cookie, for added security.
        // The PATCH request to '/password/reset/enter-new-password' will ONLY check for the signed cookie.
        // This effecitvely makes the email link a ONE TIME USE.
        await user.setResetPasswordCookie(res);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered error resetting password. Please try again later.' });
    }

    res.status(200).json({ success: true });
});



router.patch('/reset/enter-new-password', (req, res, next) => useBody(req, res, next, ['password', 'confPassword']), async (req, res) => {
    const { resetPasswordAuthStr } = req.signedCookies;
    if (!resetPasswordAuthStr) return res.status(401).json({ success: false, message: 'Unauthorized.' });

    let user = await User.findOne({ resetPasswordAuthStr: resetPasswordAuthStr })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (req.body.password !== req.body.confPassword || req.body.password === '') return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    const hashedPassword = await User.hashPassword(req.body.password);

    try {
        await user.setNewPassword(hashedPassword, res);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered error setting new password. Please try again later.' });
    }

    res.status(201).json({ success: true });
});



router.patch('/change', auth, (req, res, next) => useBody(req, res, next, ['password', 'confPassword']), async (req, res) => {
    const { user } = req;

    if (req.body.password !== req.body.confPassword || req.body.password === '') return res.status(400).json({ success: false, message: 'Erorr. Passwords do not match.' });
    const hashedPassword = await User.hashPassword(req.body.password);

    try {
        await user.setNewPassword(hashedPassword);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered error setting new password. Please try again later.' });
    }

    res.status(201).json({ success: true });
});



module.exports = router;