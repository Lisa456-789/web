### 第一步：回顾与热身

打开早上的 `campus-buddy` 项目，确保 `npm run dev` 还在运行。
我们要给页面增加几个按钮，点击“运动”就只看运动，点击“全部”就看所有。

---

### 第二步：增加筛选按钮（使用 @click）

1. 在 `src/App.vue` 的 `<template>` 中，在 `<h1>` 标签下方加入一组按钮：
    
    ```
    <div class="filter-box">
      <button @click="filterCategory('全部')">全部</button>
      <button @click="filterCategory('运动')">运动</button>
      <button @click="filterCategory('学习')">学习</button>
      <button @click="filterCategory('美食')">美食</button>
    </div>
    ```
    
2. 在 `<style>` 中给按钮加点样式：
    
    ```css
    .filter-box {
      text-align: center;
      margin-bottom: 20px;
    }
    .filter-box button {
      margin: 0 5px;
      padding: 8px 15px;
      border: none;
      border-radius: 20px;
      background-color: #42b983;
      color: white;
      cursor: pointer;
    }
    .filter-box button:hover {
      background-color: #3aa876;
    }
    ```
    

---

### 第三步：编写筛选逻辑（JavaScript 基础）

我们需要一段代码，根据点击的按钮来决定显示哪些卡片。

1. 在 `<script setup>` 中，先备份一份“原始完整数据”，再创建一个“正在显示的数据”：
    
    ```jsx
    // 1. 原始数据（不动它）
    const allBuddies = [
      { id: 1, title: '东操场打篮球', category: '运动', time: '周五 16:00', contact: '13812345678' },
      { id: 2, title: '食堂二楼干饭', category: '美食', time: '今天中午', contact: '13988887777' },
      { id: 3, title: '图书馆五楼自习', category: '学习', time: '周六全天', contact: '13566665555' }
    ]
    
    // 2. 正在显示的数据（默认是全部）
    const buddyList = ref([...allBuddies])
    
    // 3. 筛选功能
    const filterCategory = (cat) => {
      if (cat === '全部') {
        buddyList.value = [...allBuddies]
      } else {
        // 过滤出分类一致的搭子
        buddyList.value = allBuddies.filter(item => item.category === cat)
      }
    }
    ```
    
2. **看结果**：回到浏览器，点击不同的按钮，你会发现列表会自动变化。这就是 Vue 的“响应式”魅力。

---

### 第四步：安全意识课——消失的“暗号”（环境变量）

**情境**：假设我们的平台要连接一个发短信的服务器，需要一个“管理员暗号”（API Key）。
**错误做法**：直接把暗号写在代码里。

1. **危险演示**（不要这样做）：
在 `<script setup>` 里写：`const secretKey = "shiyanlou123456"`。
*老师讲解：如果这段代码上传到 GitHub，全世界都能看到你的暗号，黑客会盗用你的额度去发骚扰短信。*
2. **正确做法：使用 .env 文件**
    - 在 VS Code 左侧列表的根目录下（和 `package.json` 同级），右键新建文件，命名为 `.env`（注意前面有个点）。
    - 在 `.env` 文件里输入：
        
        ```
        VITE_ADMIN_KEY=my_secure_password_999
        ```
        
    - 保存文件。
3. **在代码里读取暗号**：
在 `App.vue` 的 `<script setup>` 中输入：
    
    ```jsx
    console.log("正在尝试连接服务器...")
    // 使用 import.meta.env 读取暗号，而不是直接写死在代码里
    console.log("当前使用的安全暗号是:", import.meta.env.VITE_ADMIN_KEY)
    ```
    
4. **看结果**：按 `F12` 打开浏览器开发者工具的 **Console（控制台）**，你会看到暗号被打印出来了。但在代码源文件里，我们只写了变量名，没有写具体的密码。

---

### 第五步：搜索框初体验（双向绑定 v-model）

除了点按钮，用户还想搜索标题。

1. 在 `<template>` 的筛选按钮上方，加入输入框：
    
    ```
    <div class="search-box">
      <input type="text" v-model="searchText" placeholder="搜索搭子标题..." @input="searchBuddy">
    </div>
    ```
    
2. 在 `<script setup>` 中添加逻辑：
    
    ```jsx
    const searchText = ref('') // 记录用户输入的内容
    
    const searchBuddy = () => {
      // 在所有数据中搜索包含关键词的内容
      buddyList.value = allBuddies.filter(item =>
        item.title.includes(searchText.value)
      )
    }
    ```
    
3. 给搜索框加点 CSS：
    
    ```css
    .search-box {
      margin-bottom: 15px;
      text-align: center;
    }
    .search-box input {
      padding: 10px;
      width: 80%;
      border-radius: 8px;
      border: 1px solid #ccc;
    }
    ```
    

---

### 第六步：今日安全总结与清理

作为开发者，我们要养成“不泄露隐私”的习惯。

1. **检查控制台**：刚才为了测试，我们用 `console.log` 打印了暗号。
2. **清理代码**：现在请删掉刚才那两行 console.log。
讲解：在正式发布的项目里，绝对不能在控制台留下任何敏感信息。