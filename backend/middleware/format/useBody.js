

const bodyConditions = {
    email: [
        (email) => typeof email === 'string',
        (email) => email?.includes('@'),
        (email) => email?.split('@')?.at(-1)?.includes('.')
    ],
    password: [
        (password) => typeof password === 'string',
        (password) => password?.length >= 6
    ],
    confPassword: [
        (password) => typeof password === 'string'
    ],
    emailAuthStr: [
        (emailAuthStr) => typeof emailAuthStr === 'string'
    ],
    resetPasswordAuthStr: [
        (resetPasswordAuthStr) => typeof resetPasswordAuthStr === 'string'
    ],
    check: (body) => {
        for (const key in body) {
            if (bodyConditions[key] === undefined) continue;

            for (let i = 0; i < bodyConditions[key].length; i++) {
                const condition = bodyConditions[key][i];
                if (!condition(body[key])) return false;
            }
        }
        return true;
    }
};

function useBody(req, res, next, requiredKeys = []) {
    for (let i = 0; i < requiredKeys.length; i++) {
        if (!req.body[requiredKeys[i]]) {
            res.status(400).json({ success: false, message: `Request body missing argument: ${requiredKeys[i]}` });
            return null;
        }
    }

    if (req.body) {
        const validBody = bodyConditions.check(req.body);
        if (!validBody) {
            res.status(400).json({ success: false, message: 'Invalid request body.' });
            return null;
        }
    }

    next();
}



module.exports = useBody;
