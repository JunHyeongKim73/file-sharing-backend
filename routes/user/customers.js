var express = require('express');
var router = express.Router();

const dotenv = require('dotenv').config();
const mysqlObj = require('../../config/mysql.js');
const conn = mysqlObj.init();

/* GET cutomers */
router.get('/', async (req, res, next) => {
  const sql = 
  `SELECT *
  FROM Users
  JOIN Customers USING(id)`;
  const data = {};

  try{
    let [result, fields] = await conn.query(sql);
    if(result.length == 0) throw Error('no customer');
    // DB에서 불러온 데이터를 JSON 형태로 변환
    result = JSON.parse(JSON.stringify(result));

    data['success'] = true;
    data['data'] = result;
    res.status(200).json(data);
  } catch(e) {
    data['success'] = false;
    data['message'] = 'There is no customer';
    res.status(409).json(data);
  }
});

module.exports = router;
