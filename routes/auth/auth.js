var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv').config();
const mysqlObj = require('../../config/mysql.js');
const { verifyToken, signToken } = require('../../utils/jwt.js');
const conn = mysqlObj.init();

router.post('/login', async (req, res, next) => {
    const data = {};
    if(!req.body.email || !req.body.password) {
        data['success'] = false;
        data['message'] = 'Body format is not correct';
        res.status(400).json(data);
    }
    var userId, userType;
    // 비밀번호 받아오는 쿼리
    const sql = `SELECT * FROM Users WHERE email='${req.body.email}'`;
    try{
        let [result, fields] = await conn.query(sql);
        password = result[0]['password'];
        // 이메일 / 비밀번호 불일치
        if(req.body.password != password) {
            data['success'] = false;
            data['message'] = `Email doesn't exist or Password was wrong`;
            res.status(409).json(data);
        }
        userId = result[0].id;
        userType = result[0].type_id;

        const payload = { 
            'id' : userId,
            'type' : userType 
        };
        // Refresh토큰 DB에 저장
        const refreshToken = signToken(payload, 'refresh');
        const refreshSQL = `INSERT INTO Tokens(id, token_num) VALUES('${userId}', '${refreshToken}')`;
        await conn.query(refreshSQL);
        
        // Access토큰 발행
        const accessToken = signToken(payload, 'access');
        data['success'] = true;
        data['accessToken'] = accessToken;
        data['refreshToken'] = refreshToken;
        res.status(200).json(data);
    }
    catch(e) {
        console.error(e);
        data['success'] = false;
        data['message'] = 'Query Error';
        res.status(400).json(data);
    }
});

module.exports = router;