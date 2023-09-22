const User = require('../../models/User');

const express = require('express');
const router = express.Router();



router.post('/', async (req, res) => {
    const session_id = User.getSession_id(req);

    res.clearCookie('loggedIn');
    res.clearCookie('session_id');
    res.status(204).end();

    if (!session_id) return null;

    let user = await User.findOne({ 'session._id': session_id })
        .catch(err => {
            console.error(err);
            user = null;
        });
    if (!user) return null;

    try {
        user.logout()
    } catch (err) {
        console.error(err);
    }
});



module.exports = router;
