const {v1: uuidv1} = require('uuid');
var express = require('express');
var router = express.Router();

const checkUserRequest = require('./checkUserRequest');

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
  if(checkUserRequest(req, 'post')) {
    data['success'] = false;
    data['message'] = 'Body format is not correct'
    res.status(400).json(data);
  }
  const newId = uuidv1();
  let sql = 
  `INSERT INTO Users(id, email, password, name, age, type_id)
  VALUES ('${newId}', '${req.body.email}', '${req.body.password}', '${req.body.name}', '${req.body.age}', '${req.body.type_id}')`;
  // Users 테이블에 추가
  conn.query(sql, (err, rows, fields) => {
    if(err){
      data['success'] = false;
      data['message'] = 'Bad Query';
      res.status(400).json(data);
    }
  });
  // Customers 테이블 입력 쿼리
  if(req.body.type_id == 1) {
    sql = 
    `INSERT INTO Customers(id, nickname)
    VALUES('${newId}', '${req.body.nickname}')`;
  }
  // Sellers 테이블 입력 쿼리
  else {
    sql = 
    `INSERT INTO Sellers(id, bank, account)
    VALUES('${newId}', '${req.body.bank}', '${req.body.account}')`;
  }
  conn.query(sql, (err, rows, fields) => {
    if(err){
      data['success'] = false;
      data['message'] = 'Bad Query';
      res.status(400).json(data);
    }
    // req.body에 newId를 추가해서 반환한다
    data['success'] = true;
    req.body.id = newId;
    data['data'] = req.body;
    res.status(201).json(data);
  });
})


/* PUT Users */
router.put('/:userId', (req, res, next) => {
  const data = {};
  if(checkUserRequest(req, 'put')) {
    data['success'] = false;
    data['message'] = 'Body format is not correct'
    res.status(400).json(data);
  }
  
  let sql = 
  `UPDATE Users
  SET password='${req.body.password}', name='${req.body.name}', age='${req.body.age}'
  WHERE id='${req.params.userId}'`;
  // Users 테이블에 추가
  conn.query(sql, (err, rows, fields) => {
    const isUpdated = (rows['affectedRows'] >= 1);
    if(err || !isUpdated){
      data['success'] = false;
      data['message'] = 'Bad Query';
      res.status(400).json(data);
    }
  });
  // Customers 테이블 입력 쿼리
  if(req.body.type_id == 1) {
    sql = 
    `UPDATE Customers
    SET nickname='${req.body.nickname}'
    WHERE id='${req.params.userId}'`;
  }
  // Sellers 테이블 입력 쿼리
  else {
    sql = 
    `UPDATE Sellers
    SET bank='${req.body.bank}', account='${req.body.account}'
    WHERE id='${req.params.userId}'`;
  }
  conn.query(sql, (err, rows, fields) => {
    if(err){
      data['success'] = false;
      data['message'] = 'Bad Query';
      res.status(400).json(data);
    }
    // req.body에 userId를 추가해서 반환한다
    data['success'] = true;
    req.body.id = req.params.userId;
    data['data'] = req.body;
    res.status(201).json(data);
  });
})

/* DELETE Users */
router.delete('/:userId', (req, res, next) => {
  const data = {};
  const sql = `DELETE FROM Users WHERE id='${req.params.userId}'`;
  conn.query(sql, (err, rows, fields) => {
    const isDeleted = (rows['affectedRows'] >= 1);
    if(err || !isDeleted) {
      data['success'] = false;
      data['message'] = 'There is no user';
      res.status(409).json(data);
    }
    data['success'] = true;
    data['message'] = 'A user was successfully deleted';
    res.status(200).json(data);
  })
})

module.exports = router;
