# 3.1：谁登录了？——身份验证与爆破防范

**目标**：实现一个正式的登录界面，学习将登录信息保存在浏览器中，并了解如何防止黑客“暴力猜密码”。

---

### 第一步：创建登录界面（UI 布局）

**讲解**：之前我们的“小明”是写死在代码里的。现在我们要让用户通过输入账号密码来进入系统。

1. 在 `src/App.vue` 的 `<script setup>` 中增加一个新的状态：
    
    ```jsx
    // 增加一个 'login' 页面状态
    const currentPage = ref('login')
    
    // 用来记录用户在登录框输入的账号密码
    const loginForm = ref({
      username: '',
      password: ''
    })
    
    // 真正的用户信息（默认为空）
    const currentUser = ref(null)
    ```
    
2. 修改 `<template>` 部分，增加登录页的 HTML：
    
    ```
    <template>
      <div class="container">
        <!-- 1. 登录页 -->
        <div v-if="currentPage === 'login'" class="login-box">
          <h2>🔑 校园搭子平台登录</h2>
          <input type="text" v-model="loginForm.username" placeholder="请输入学号/用户名">
          <input type="password" v-model="loginForm.password" placeholder="请输入密码">
          <button @click="handleLogin" class="login-btn">进入广场</button>
          <p class="tip">提示：学号 100，密码 123456</p>
        </div>
    
        <!-- 2. 列表页（只有登录后才能看） -->
        <div v-else-if="currentPage === 'list'">
           <!-- 增加一个顶栏，显示谁在登录 -->
           <div class="header">
             <span>欢迎你，{{ currentUser.name }}</span>
             <button @click="handleLogout" class="exit-btn">退出</button>
           </div>
           <!-- ... 昨天的搜索、发布和列表内容 ... -->
        </div>
    
        <!-- 3. 详情页 ... 保持不变 ... -->
      </div>
    </template>
    ```
    

---

### 第二步：编写登录逻辑（模拟匹配）

1. 在 `<script setup>` 中编写登录和退出的函数：
    
    ```jsx
    const handleLogin = () => {
      // 模拟账号密码匹配
      if (loginForm.username === '100' && loginForm.password === '123456') {
        currentUser.value = { id: 100, name: '小明' }
        currentPage.value = 'list' // 登录成功，跳到列表页
        alert('登录成功！')
      } else {
        alert('账号或密码错误！')
      }
    }
    
    const handleLogout = () => {
      currentUser.value = null
      currentPage.value = 'login' // 退出后跳回登录页
    }
    ```
    

---

### 第三步：持久化登录（使用 localStorage）

**讲解**：现在的系统有个毛病，一刷新网页，登录就消失了。我们要把登录信息存进浏览器的“长期记忆”里。

1. 修改 `handleLogin` 函数，存入信息：
    
    ```jsx
    const handleLogin = () => {
      if (loginForm.username === '100' && loginForm.password === '123456') {
        const userData = { id: 100, name: '小明' }
        currentUser.value = userData
    
        // 【关键】存入浏览器，名字叫 'my_app_user'
        localStorage.setItem('my_app_user', JSON.stringify(userData))
    
        currentPage.value = 'list'
      }
      // ... else 保持不变
    }
    ```
    
2. **页面一打开就读取记忆**：
在 `<script setup>` 的末尾加上：
    
    ```jsx
    // 检查浏览器记忆里有没有用户
    const savedUser = localStorage.getItem('my_app_user')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
      currentPage.value = 'list' // 直接进列表，不用再登录
    }
    ```
    
3. **退出时清除记忆**：
在 `handleLogout` 里加上：`localStorage.removeItem('my_app_user')`。

---

### 第四步：安全挑战——“暴力破解”密码

**讲解**：黑客如果想进你的账号，他会写个程序，一秒钟尝试几千次密码。如果我们的“登录”按钮没有限制，他很快就能猜出来。

1. **模拟攻击**：演示快速点击登录按钮。
2. **防御手段：登录冷却时间**：
在 `<script setup>` 中增加：
    
    ```jsx
    const isLock = ref(false) // 是否被锁住
    
    const handleLogin = () => {
      if (isLock.value) return // 如果锁住了，点击无效
    
      if (loginForm.username === '100' && loginForm.password === '123456') {
        // ... 登录成功逻辑
      } else {
        alert('密码错误！为了安全，请等待3秒后再试')
        isLock.value = true // 锁住按钮
        setTimeout(() => {
          isLock.value = false // 3秒后解锁
        }, 3000)
      }
    }
    ```
    

---

### 第五步：安全挑战——为什么 XSS 必须死？（Session 安全）

**讲解（核心理论课）**：

- 大家还记得昨天的 **XSS 弹窗** 吗？
- 黑客不仅能弹窗，他还能写代码：`alert(localStorage.getItem('my_app_user'))`。
- **实验**：在浏览器 F12 的 Console 里输入上面这行代码。
- **结论**：你会发现，你的登录信息、名字、ID 全部暴露了！所以，保护页面不被注入脚本（XSS），本质上是在保护用户的“通行证”不被偷走。

---

### 第六步：完善 CSS 样式

给登录页加点漂亮的样式：

```css
.login-box {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
.login-box input {
  display: block; width: 100%; margin-bottom: 15px; padding: 12px;
  border: 1px solid #ddd; border-radius: 8px;
}
.login-btn {
  width: 100%; padding: 12px; background: #42b983; color: white;
  border: none; border-radius: 8px; cursor: pointer;
}
.header {
  display: flex; justify-content: space-between; align-items: center;
  background: white; padding: 10px 20px; border-radius: 8px; margin-bottom: 20px;
}
.exit-btn { background: #eee; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
```

---

### 第三日上午小结

1. **登录流程**：理解了从输入表单到匹配数据的过程。
2. **数据持久化**：学会了用 `localStorage` 让登录状态在刷新后依然存在。
3. **暴力破解防护**：知道了可以通过“限速（Throttling）”来提高黑客的攻击成本。
4. **安全闭环**：深刻理解了为什么保护前端代码不被注入（XSS）是保护用户隐私的第一道防线。

**【如果你已完成，请尝试挑战】**：
如果用户输入密码错误超过 3 次，能不能把登录按钮彻底禁用，并显示“账号已锁定，请联系管理员”？（提示：增加一个 `errorCount` 变量）。