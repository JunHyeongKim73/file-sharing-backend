var express = require('express');
var router = express.Router();

const mysqlObj = require('../../config/mysql.js');
const conn = mysqlObj.init();

/* GET file categories */
router.get('/', async (req, res, next) => {
  const sql = `SELECT * FROM file_categories`;
  const data = {};
  try{
    const [result, fields] = await conn.query(sql);

    data['success'] = true;
    let nameList = [];
    for(var row of result) {
        nameList.push(row['name']);
    }
    data['data'] = nameList;
    res.status(200).json(data);
  } catch(e) {
    data['success'] = false;
    data['message'] = 'Query Error';
    res.status(400).json(data); 
  }
});

module.exports = router;
