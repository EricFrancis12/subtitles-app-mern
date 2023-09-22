const User = require('../../models/User');

const express = require('express');
const router = express.Router();

const useBody = require('../../middleware/format/useBody');



router.post('/', (req, res, next) => useBody(req, res, next, ['email', 'password']), async (req, res) => {    
    let user = await User.findOne({ email: req.body.email })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return res.status(404).json({ success: false, message: 'No such user found.' });

    let authenticated;
    try {
        authenticated = await user.authenticate(req);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
    if (!authenticated) return res.status(400).json({ success: false, message: 'Incorrect password.' });

    try {
        await user.login(req, res);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Encountered login error. Please try again later.' });
    }

    res.status(200).json({ success: true, loggedIn: true });
});



module.exports = router;
