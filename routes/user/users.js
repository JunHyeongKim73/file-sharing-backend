const {v1: uuidv1} = require('uuid');
var express = require('express');
var router = express.Router();

const dotenv = require('dotenv').config();
const mysqlObj = require('../../config/mysql.js');
const conn = mysqlObj.init();

conn.connect();

/* GET Users */
router.get('/', (req, res, next) => {
  const sql = `SELECT * FROM Users`;
  const data = {};
  conn.query(sql, (err, rows, fields) => {
    if(err){
      data['success'] = false;
      data['message'] = 'There is no user';
      res.status(409).json(data);
    }
    // DB에서 불러온 데이터를 JSON 형태로 변환
    result = JSON.parse(JSON.stringify(rows));  
    data['success'] = true;
    data['data'] = result;
    console.log(data);
    res.status(200).json(data);
  });
});

/* POST Users */
router.post('/', (req, res, next) => {
  const data = {};
  if(req.body.email == null || req.body.password == null || req.body.name == null || req.body.age == null || req.body.type_id == null) {
    data['success'] = false;
    data['message'] = 'Body format is not correct'
    res.status(400).json(data);
  }
  const userId = uuidv1();
  const sql = 
  `INSERT INTO Users(id, email, password, name, age, type_id)
  VALUES ('${userId}', '${req.body.email}', '${req.body.password}', '${req.body.name}', '${req.body.age}', '${req.body.type_id}')`;
  // Users 테이블에 추가
  conn.query(sql, (err, rows, fields) => {
    if(err){
      data['success'] = false;
      data['message'] = 'Bad Query';
      res.status(400).json(data);
    }
  });
  // Customers 테이블에 추가
  if(req.body.type_id == 1) {
    if(req.body.nickname == null) {
      data['success'] = false;
      data['message'] = 'Body format is not correct'
      res.status(400).json(data);
    }
    const sql = 
    `INSERT INTO Customers(id, nickname)
    VALUES('${userId}', '${req.body.nickname}')`;
    conn.query(sql, (err, rows, fields) => {
      if(err){
        data['success'] = false;
        data['message'] = 'Bad Query';
        res.status(400).json(data);
      }
      // req.body에 userId를 추가해서 반환한다
      data['success'] = true;
      req.body.id = userId;
      data['data'] = req.body;
      res.status(201).json(data);
    });
  }
  // Sellers 테이블에 추가
  else {
    if(req.body.bank == null || req.body.account == null) {
      data['success'] = false;
      data['message'] = 'Body format is not correct'
      res.status(400).json(data);
    }
    const sql = 
    `INSERT INTO Sellers(id, bank, account)
    VALUES('${userId}', '${req.body.bank}', '${req.body.account}')`;
    conn.query(sql, (err, rows, fields) => {
      if(err){
        data['success'] = false;
        data['message'] = 'Bad Query';
        res.status(400).json(data);
      }
      // req.body에 userId를 추가해서 반환한다
      data['success'] = true;
      req.body.id = userId;
      data['data'] = req.body;
      res.status(201).json(data);
    });
  }
})

module.exports = router;
