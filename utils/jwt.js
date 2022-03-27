const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
    try{
        return jwt.verify(token, process.env.JWT_KEY);
    }
    catch(e) {
        return null;
    }
}

const signToken = (payload, type) => {
    const tokenOptions = {
        'access' : {
            expiresIn: '1h',
            issuer: 'JiBro'
        },
        'refresh' : {
            expiresIn: '14d',
            issuer: 'JiBro'
        }
    };
    if(type == 'refresh') {
        payload = {};
    }
    console.log(payload);
    const token = jwt.sign(payload, process.env.JWT_KEY, tokenOptions[type]);

    return token;
}

module.exports = {
    verifyToken,
    signToken
};
