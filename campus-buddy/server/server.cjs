// server/server.cjs
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // 允许前端 Vue 访问

const db = new sqlite3.Database(':memory:'); // 实验用：内存数据库，重启即清空

// 初始化表结构
db.serialize(() => {
  db.run("CREATE TABLE buddies (id INTEGER PRIMARY KEY, title TEXT, category TEXT, contact TEXT)");
  db.run("INSERT INTO buddies VALUES (1, '初始搭子：图书馆', '学习', '13800000000')");
});

// 获取所有搭子
app.get('/api/buddies', (req, res) => {
  db.all("SELECT * FROM buddies", (err, rows) => {
    res.json(rows);
  });
});

// 安全警告：这个搜索接口故意留下了 SQL 注入漏洞供明天实验
app.get('/api/search', (req, res) => {
  const q = req.query.q;
  const sql = `SELECT * FROM buddies WHERE title LIKE '%${q}%'`;
  db.all(sql, (err, rows) => {
    res.json(rows);
  });
});

// 插入新搭子
app.post('/api/buddies', (req, res) => {
  const { title, category, contact } = req.body;
  db.run("INSERT INTO buddies (title, category, contact) VALUES (?, ?, ?)", [title, category, contact], function(err) {
    res.json({ id: this.lastID });
  });
});

// 清空数据库（危险接口，供调试使用）
app.delete('/api/clear', (req, res) => {
  db.run("DELETE FROM buddies", () => {
    res.json({ message: "数据已清空" });
  });
});

app.listen(3000, () => console.log('后端服务器运行在 http://localhost:3000'));
