const UserClient = require('../../models/UserClient');

const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth/auth');



router.get('/', auth, (req, res) => {
    const { user } = req;
    const userClient = new UserClient(user);
    res.status(200).json({ userClient });
});



module.exports = router;
