const mysql = require("mysql");

const mysqlConnection = {
  // 객체 생성
  init: () => {
    return mysql.createConnection({
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database,
    });
  }
};
// 모듈화
module.exports = mysqlConnection;
