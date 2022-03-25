var express = require('express');
var router = express.Router();

const dotenv = require('dotenv').config();
const mysqlObj = require('../../config/mysql.js');
const conn = mysqlObj.init();

conn.connect();

/* GET cutomers */
router.get('/', (req, res, next) => {
  const sql = 
  `SELECT *
  FROM Users
  JOIN Customers USING(id)`;
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

module.exports = router;
