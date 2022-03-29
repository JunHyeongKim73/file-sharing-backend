const {v1: uuidv1} = require('uuid');
var express = require('express');
var router = express.Router();

const checkUserRequest = require('./user-request');

const dotenv = require('dotenv').config();
const mysqlObj = require('../../config/mysql.js');
const conn = mysqlObj.init();

/* GET users */
router.get('/', async (req, res, next) => {
  const sql = `SELECT * FROM users`;
  const data = {};
  try{
    let [result, fields] = await conn.query(sql);
    // DB에서 불러온 데이터를 JSON 형태로 변환
    result = JSON.parse(JSON.stringify(result));

    data['success'] = true;
    data['data'] = result;
    res.status(200).json(data);
  } catch(e) {
    data['success'] = false;
    data['message'] = 'There is no user';
    res.status(409).json(data); 
  }
});

/* POST users */
router.post('/', async (req, res, next) => {
  const data = {};
  if(checkUserRequest(req, 'post')) {
    data['success'] = false;
    data['message'] = 'Body format is not correct'
    res.status(400).json(data);
  }
  const newId = uuidv1();
  let sql = 
  `INSERT INTO users(id, email, password, name, age, type_id)
  VALUES ('${newId}', '${req.body.email}', '${req.body.password}', '${req.body.name}', '${req.body.age}', '${req.body.type_id}')`;
  // users 테이블에 추가
  try{
    await conn.query(sql);
  } catch(e){
    data['success'] = false;
    data['message'] = 'Bad Query';
    res.status(400).json(data);
  }
  // customers 테이블 입력 쿼리
  if(req.body.type_id == 1) {
    sql = 
    `INSERT INTO customers(id, nickname)
    VALUES('${newId}', '${req.body.nickname}')`;
  }
  // sellers 테이블 입력 쿼리
  else {
    sql = 
    `INSERT INTO sellers(id, bank, account)
    VALUES('${newId}', '${req.body.bank}', '${req.body.account}')`;
  }
  try{
    await conn.query(sql);

    data['success'] = true;
    req.body.id = newId;
    data['data'] = req.body;
    res.status(201).json(data);
  } catch(e){
    data['success'] = false;
    data['message'] = 'Bad Query';
    res.status(400).json(data);
  }
})


/* PUT users */
router.put('/:userId', async (req, res, next) => {
  const data = {};
  if(checkUserRequest(req, 'put')) {
    data['success'] = false;
    data['message'] = 'Body format is not correct'
    res.status(400).json(data);
  }
  
  let sql = 
  `UPDATE users
  SET password='${req.body.password}', name='${req.body.name}', age='${req.body.age}'
  WHERE id='${req.params.userId}'`;
  // users 테이블에 추가
  try{
    const [result, fields] = await conn.query(sql);
    const isUpdated = (result['affectedRows'] >= 1);
    if(!isUpdated) throw Error('query error');
  } catch(e) {
    data['success'] = false;
    data['message'] = 'Bad Query';
    res.status(400).json(data);
  }
  // customers 테이블 입력 쿼리
  if(req.body.type_id == 1) {
    sql = 
    `UPDATE customers
    SET nickname='${req.body.nickname}'
    WHERE id='${req.params.userId}'`;
  }
  // sellers 테이블 입력 쿼리
  else {
    sql = 
    `UPDATE sellers
    SET bank='${req.body.bank}', account='${req.body.account}'
    WHERE id='${req.params.userId}'`;
  }
  // customers 테이블 혹은 sellers 테이블을 업데이트한다
  try{
    await conn.query(sql);

    // req.body에 userId를 추가해서 반환한다
    data['success'] = true;
    req.body.id = req.params.userId;
    data['data'] = req.body;
    res.status(201).json(data);
  } catch(e) {
    data['success'] = false;
    data['message'] = 'Bad Query';
    res.status(400).json(data);
  }
})

/* DELETE users */
router.delete('/:userId', async (req, res, next) => {
  const data = {};
  const sql = `DELETE FROM users WHERE id='${req.params.userId}'`;
  
  try{
    const [result, fields] = await conn.query(sql);
    const isDeleted = (result['affectedRows'] >= 1);
    if(!isDeleted) throw Error('query error');

    data['success'] = true;
    data['message'] = 'A user was successfully deleted';
    res.status(200).json(data);
  } catch(e) {
    data['success'] = false;
    data['message'] = 'There is no user';
    res.status(409).json(data);
  }
})

module.exports = router;
