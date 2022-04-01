var express = require('express');
var fs = require('fs/promises');
var router = express.Router();
var path = require('path');

const multer = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    }
  })
})

const mysqlObj = require('../../config/mysql.js');
const conn = mysqlObj.init();

/* GET Contents of A file */
router.get('/:fileId/content', async (req, res, next) => {
  const sql = `SELECT * FROM files WHERE id='${req.params.fileId}'`;
  const data = {};
  try{
    let [result, fields] = await conn.query(sql);

    data['success'] = true;
    data['data'] = result[0];
    res.status(200).json(data);
  } catch(e) {
    console.error(e);
    data['success'] = false;
    data['message'] = 'There is no file';
    res.status(409).json(data); 
  }
});

/**
 * GET Data of A file
 * 이미지, 동영상, 문서 등의 데이터를 보낸다
 */
router.get('/:fileId/data', async (req, res, next) => {
  const sql = `SELECT * FROM files WHERE id='${req.params.fileId}'`;
  const path = '/home/rla5764v/file-sharing-backend/';
  try{
    let [result, fields] = await conn.query(sql);
    res.status(200).sendFile(path + result[0]['path']);
  } catch(e) {
    console.error(e);
    data['success'] = false;
    data['message'] = 'There is no file';
    res.status(409).json(data); 
  }
});

/**
 * GET files
 * 파일들의 정보를 보낸다
 * 카테고리별, 셀러별, 이름별 검색 가능
 */
router.get('/', async (req, res, next) => {
  let sql = `SELECT * FROM files`;
  if(req.query.category_id) sql += ` WHERE category_id=${req.query.category_id}`;
  else if(req.query.seller_id) sql += ` WHERE seller_id='${req.query.seller_id}'`;
  else if(req.query.name) sql += ` WHERE name LIKE '%${req.query.name}%'`;
  

  console.log(sql);
  const data = {};
  try{
    let [result, fields] = await conn.query(sql);
    if(result.length == 0) throw Error('NoFileException');
    data['success'] = true;
    data['data'] = result;
    res.status(200).json(data);
  } catch(e) {
    console.error(e);
    data['success'] = false;
    data['message'] = 'No Such File';
    res.status(409).json(data); 
  }
});

/* POST A file */
router.post('/', upload.single('file'), async (req, res, next) => {
  const data = {};
  if(!req.body.name || !req.body.description || !req.body.price || !req.body.seller_id || !req.body.category_id) {
    data['success'] = false;
    data['message'] = 'Body format is not correct'
    res.status(400).json(data);
  }
  // 프론트로부터 받은 파일 데이터
  const fileData = req.file;
  const nowTime = new Date(+new Date() + 3240 * 10000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
  
  const sql = 
  `INSERT INTO files(seller_id, category_id, name, extension, description, price, path, date)
  VALUES('${req.body.seller_id}', ${req.body.category_id}, '${req.body.name}', '${fileData['mimetype']}', 
  '${req.body.description}', '${req.body.price}', '${fileData['path']}', '${nowTime}')`;
  try{
    const [result, fields] = await conn.query(sql);
    req.body.id = result['insertId'];
    req.body.extension = fileData['mimetype'];
    req.body.path = fileData['path'];
    req.body.date = nowTime;

    data['success'] = true;
    data['data'] = req.body;
    res.status(201).json(data);
  } catch(e) {
    data['success'] = false;
    data['message'] = 'Bad Query';
    res.status(400).json(data);
  }
})

/* PUT A file */
router.put('/:fileId', upload.single('file'), async (req, res, next) => {
  const data = {};
  if(!req.body.name || !req.body.description || !req.body.price) {
    data['success'] = false;
    data['message'] = 'Body format is not correct'
    res.status(400).json(data);
  }
  const path = '/home/rla5764v/file-sharing-backend/';
  // 프론트로부터 받은 파일 데이터
  const fileData = req.file;
  
  // 파일 정보만 바꾼다
  if(fileData === undefined){
    let sql = 
    `UPDATE files
    SET name='${req.body.name}', description='${req.body.description}', price=${req.body.price}
    WHERE id='${req.params.fileId}'`;
    try{
      let [result, field] = await conn.query(sql);
      if(result['affectedRows'] == 0) throw Error('NoFileException');
      
      sql = `SELECT * FROM files WHERE id='${req.params.fileId}'`;
      [result, field] = await conn.query(sql);

      data['success'] = true;
      data['message'] = result[0];
      res.status(201).json(data);
    } catch(e) {
      console.error(e);
      data['success'] = false;
      data['message'] = 'No Such File';
      res.status(409).json(data);
    }
  } 
  // 파일 자체를 바꾼다
  else {
    let sql = `SELECT path FROM files WHERE id='${req.params.fileId}'`;
    try{
      let [result, fields] = await conn.query(sql);
      
      if(result.length == 0) {
        await fs.unlink(path + fileData['path']);
        throw Error('NoFileException');
      }
      // 원래 파일을 지운다
      await fs.unlink(path + result[0]['path'])

      sql = 
      `UPDATE files
      SET name='${req.body.name}', extension='${fileData['mimetype']}', description='${req.body.description}', 
      price=${req.body.price}, path='${fileData['path']}'
      WHERE id='${req.params.fileId}'`;

      [result, fields] = await conn.query(sql);
      if(result['affectedRows'] == 0) throw Error();
      res.send('hi');
    } catch(e) {
      data['success'] = false;
      if(e.name == 'NoFileException'){
        data['message'] = 'No Such File';
        res.status(409).json(data);
      }
      else{
        data['message'] = 'Query Error';
        res.status(400).json(data);
      }
    }
  }
})

/* DELETE A file */
router.delete('/:fileId', async (req, res, next) => {
  const data = {};
  
  try{
    let sql = `SELECT path FROM files WHERE id='${req.params.fileId}'`;
    let [result, fields] = await conn.query(sql);
    if(result.length == 0) throw Error('NoFileException');
    
    const path = '/home/rla5764v/file-sharing-backend/';
    // 해당 파일을 스토리지에서 삭제한다
    await fs.unlink(path + result[0]['path']);
    // 해당 파일을 DB에서 삭제한다
    sql = `DELETE FROM files WHERE id='${req.params.fileId}'`;
    [result, fields] = await conn.query(sql);

    data['success'] = true;
    data['message'] = 'A file was successfully deleted';
    res.status(200).json(data);
  } catch(e) {
    console.error(e);
    data['success'] = false;
    data['message'] = 'No Such File';
    res.status(409).json(data);
  }
})

module.exports = router;
