const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');

const mysqlObj = require('../config/mysql.js');
const conn = mysqlObj.init();

const verifyAccessToken = (token) => {
    try{
        return jwt.verify(token, process.env.JWT_KEY);
    }
    catch(e) {
        return null;
    }
}

const verifyRefreshToken = async (token) => {
    const refreshToken = verifyAccessToken(token);
    try{
        // 토큰이 유효하지 않은 경우
        if(refreshToken == null) throw Error('NullError');
        const sql = `SELECT token_num FROM tokens WHERE id='${refreshToken['id']}'`;

        const [result, fields] = await conn.query(sql);
        // 해당 유저의 Refresh 토큰이 존재하지 않는 경우
        if(result.length == 0) throw Error('NoTokenError');
        // 전달받은 Refresh 토큰과 DB에 저장된 Refresh 토큰이 서로 같지 않은 경우
        if(token != result[0]['token_num']) throw Error('TokenValidError');
        return refreshToken;
    } catch(e) {
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
    
    const token = jwt.sign(payload, process.env.JWT_KEY, tokenOptions[type]);

    return token;
}

module.exports = {
    verifyAccessToken,
    verifyRefreshToken,
    signToken
};
