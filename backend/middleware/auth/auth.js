const User = require('../../models/User');

const { isEmpty } = require('../../utils/utils');



async function validate(req) {
    const session_id = User.getSession_id(req)

    if (isEmpty(session_id)) return null;

    const query = {
        'session._id': session_id,
        'session.IP': req.ip,
        'session.UA': req.headers['user-agent'],
    };

    let user;
    try {
        user = await User.findOne(query);
    } catch (err) {
        console.error(err);
        return null;
    }

    req.session_id = session_id;
    return user;
}



async function auth(req, res, next) {
    const user = await validate(req);

    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    req.user = user;
    next();
}



module.exports = auth;
