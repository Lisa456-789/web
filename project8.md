# 4.1：连接真实数据库

**目标**：运行后端服务器，将 Vue 数据存入 SQLite 数据库，并使用 `computed` 实现实时数据统计。

---

### 第一步：准备“黑客实验室”环境

由于我们要联网，需要安装一个专门发请求的工具 `axios`。

1. 在 VS Code 终端里（如果正在运行项目，按 `Ctrl + C` 停止），输入：
    
    ```bash
    npm install axios
    ```
    
2. 在项目的**根目录下**（和 `src` 平级），新建一个文件夹叫 `server`。
3. 在 `server` 文件夹里新建一个文件叫 `server.js`。

---

### 第二步：启动后端服务器（老师提供的黑盒代码）

请直接复制以下代码到 `server/server.js`。这段代码会帮你创建一个 SQLite 数据库并开启接口。

```jsx
// server/server.js
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

app.listen(3000, () => console.log('后端服务器运行在 <http://localhost:3000>'));
```

**运行后端**：

1. 新建一个终端窗口（点击终端栏的 `+` 号）。
2. 输入 `node server/server.js`。
*预期：* 看到 `后端服务器运行在 http://localhost:3000`。

---

### 第三步：Vue 联网——获取真实数据

现在我们要让 Vue 不再读取本地数组，而是去问服务器要数据。

1. 打开 `src/App.vue`，在 `<script setup>` 顶部引入：
    
    ```jsx
    import { ref, onMounted, computed } from 'vue'
    import axios from 'axios'
    ```
    
2. 修改数据初始化逻辑：
    
    ```jsx
    const buddyList = ref([]) // 初始为空
    
    // 页面一加载就去服务器拿数据
    onMounted(async () => {
      const res = await axios.get('<http://localhost:3000/api/buddies>')
      buddyList.value = res.data
    })
    ```
    

---

### 第四步：使用 `computed` 制作“实时仪表盘”

我们要利用计算属性，实时算出广场上有多少个搭子，不需要手动加减。

1. 在 `<script setup>` 中添加：
    
    ```jsx
    // 只要 buddyList 变化，stats 就会自动重新计算
    const stats = computed(() => {
      return {
        total: buddyList.value.length,
        studyCount: buddyList.value.filter(b => b.category === '学习').length,
        sportCount: buddyList.value.filter(b => b.category === '运动').length
      }
    })
    ```
    
2. 在 `<template>` 的标题下方展示这些数据：
    
    ```
    <div class="stats-bar">
      <span>📊 全校动态：总数 {{ stats.total }}</span> |
      <span>📚 学习 {{ stats.studyCount }}</span> |
      <span>⚽ 运动 {{ stats.sportCount }}</span>
    </div>
    ```
    

---

### 第五步：修改发布逻辑（同步到数据库）

现在点击发布，不仅要更新网页，还要发给后端。

1. 修改 `addBuddy` 函数：
    
    ```jsx
    const addBuddy = async () => {
      if (newBuddy.value.title === '') return
    
      // 1. 发给后端保存
      const res = await axios.post('<http://localhost:3000/api/buddies>', newBuddy.value)
    
      // 2. 成功后重新刷新页面数据
      const updated = await axios.get('<http://localhost:3000/api/buddies>')
      buddyList.value = updated.data
    
      alert('已永久存入数据库！')
    }
    ```
    

---

### 第六步：体验“持久化”的威力

1. 在浏览器里发布一个新搭子。
2. 刷新网页，或者关掉 Vite 重新启动。
3. **看结果**：你会发现刚才发布的搭子还在！因为数据已经存进了 SQLite 数据库，而不是在内存里。

---

### 第四日上午总结（加分点）

1. **前后端分离**：你理解了 Vue 是“前端”，Node.js 是“后端”，它们通过 `axios` 说话。
2. **异步编程**：你接触了 `async` 和 `await`，学会了等待网络请求。
3. **计算属性**：你学会了用 `computed` 来自动统计数据，让代码更聪明。
4. **后端启蒙**：你第一次运行了真正的服务器代码。

**【如果你已完成，请尝试挑战】**：
修改 `stats` 计算属性，增加一个“游戏”类别的统计。并思考：为什么我们要在前端算一遍，而不是每次都问后端要统计结果？（提示：为了减少服务器压力）。