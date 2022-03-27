const mysql = require("mysql2/promise");

const mysqlConnection = {
  // 객체 생성
  init: () => {
    return mysql.createPool({
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database,
    });
  }
};
// 모듈화
module.exports = mysqlConnection;
