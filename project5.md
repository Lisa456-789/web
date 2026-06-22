# 2.2：详情查看与“不守规矩”的越权

**目标**：实现点击卡片查看详情，增加“加入搭子”的互动功能，并理解为什么“我不能删你的帖子”。

---

### 第一步：实现“模拟页面跳转”（使用 v-if）

**讲解**：真正的 App 有很多页面。为了降低难度，我们今天不学习复杂的路由插件，而是用 Vue 的“隐身斗篷”(`v-if`) 来实现页面切换。

1. 在 `<script setup>` 中，定义一个变量来记录我们当前在哪：
    
    ```jsx
    const currentPage = ref('list') // 可选值：'list'（列表页）, 'detail'（详情页）
    const currentBuddy = ref(null) // 记录正在看哪一个搭子的详情
    ```
    
2. 编写切换页面的函数：
    
    ```jsx
    const showDetail = (item) => {
      currentBuddy.value = item
      currentPage.value = 'detail'
    }
    
    const goBack = () => {
      currentPage.value = 'list'
    }
    ```
    

---

### 第二步：重构网页结构（列表 vs 详情）

1. 修改 `<template>` 部分，用 `v-if` 把页面分成两块：
    
    ```
    <template>
      <div class="container">
        <!-- 第一块：列表页（只在 currentPage 为 'list' 时显示） -->
        <div v-if="currentPage === 'list'">
          <h1>校园万能搭子广场</h1>
          <!-- ... 这里保留早上的搜索框、发布框和列表循环 ... -->
    
          <!-- 注意：给循环的卡片加一个点击事件 -->
          <div class="buddy-card" v-for="item in buddyList" @click="showDetail(item)">
             <h3>{{ item.title }}</h3>
             <!-- 其他内容保持不变 -->
          </div>
        </div>
    
        <!-- 第二块：详情页（只在 currentPage 为 'detail' 时显示） -->
        <div v-else-if="currentPage === 'detail'">
          <button @click="goBack" class="back-btn">⬅ 返回列表</button>
          <div class="detail-card">
            <h2>{{ currentBuddy.title }}</h2>
            <div class="info-tag">{{ currentBuddy.category }}</div>
            <p><strong>发布时间：</strong> {{ currentBuddy.time }}</p>
            <p><strong>联系方式：</strong> {{ hidePhone(currentBuddy.contact) }}</p>
    
            <hr>
            <button class="join-btn" @click="joinBuddy">🙋‍♂️ 我要加入</button>
            <button class="del-btn" @click="deleteBuddy">🗑 删除此帖</button>
          </div>
        </div>
      </div>
    </template>
    ```
    
2. 在 `<style>` 中添加按钮样式（红色代表危险操作）：
    
    ```css
    .back-btn { margin-bottom: 20px; cursor: pointer; }
    .detail-card { background: white; padding: 20px; border-radius: 12px; }
    .join-btn { background: #42b983; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px; }
    .del-btn { background: #ff4757; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
    ```
    

---

### 第三步：互动功能——“我要加入”

1. 在 `<script setup>` 中编写申请加入的逻辑：
    
    ```jsx
    const joinBuddy = () => {
      alert('申请已发送！请等待发起人联系你~')
    }
    ```
    

---

### 第四步：安全挑战——“我删了你的帖？”（越权访问）

**讲解**：在详情页，我们放了一个“删除此帖”的按钮。如果谁都能点这个按钮，那系统就乱套了！

1. **编写删除逻辑（目前的漏洞版本）**：
    
    ```jsx
    const deleteBuddy = () => {
      if (confirm('确定要删除这个搭子邀请吗？')) {
        // 在全量数据里找到并删掉它
        const index = allBuddies.findIndex(b => b.id === currentBuddy.value.id)
        allBuddies.splice(index, 1)
        // 删完回列表
        buddyList.value = [...allBuddies]
        goBack()
      }
    }
    ```
    
2. **实验操作**：
    - 打开浏览器，点开一个别人发的搭子。
    - 点击“删除此帖”。
    - **现象**：你会发现，你竟然可以随手删掉任何人的帖子！这就是**越权漏洞**。

---

### 第五步：修复越权——“对暗号”校验

**讲解**：我们需要知道“当前登录的人是谁”，并且只有“发帖的人”才能看到删除按钮。

1. **模拟登录信息**：
在 `<script setup>` 顶部定义一个“当前登录用户”：
    
    ```jsx
    // 假设当前登录的是“小明”，ID 是 100
    const currentUser = ref({
      id: 100,
      name: '小明'
    })
    ```
    
2. **修改数据结构**：
给早上的 `allBuddies` 数据加上 `creatorId`（代表是谁发的）：
    
    ```jsx
    const allBuddies = [
      { id: 1, title: '东操场打篮球', creatorId: 101, ... }, // 别人发的
      { id: 2, title: '食堂二楼干饭', creatorId: 100, ... }, // 我发的
    ]
    ```
    
3. **在网页上限制显示（前端拦截）**：
修改详情页的删除按钮，增加 `v-if` 判断：
    
    ```
    <!-- 只有当“我的 ID”等于“发帖人 ID”时，才显示删除按钮 -->
    <button v-if="currentUser.id === currentBuddy.creatorId" class="del-btn" @click="deleteBuddy">
      🗑 删除此帖
    </button>
    ```
    
4. **看结果**：
现在去点别人的帖子，删除按钮是不是“隐身”了？只有点你自己发的帖子，才能看到删除按钮。

---

### 第六步：逻辑漏洞——“看不见就删不掉吗？”

**讲解（拔高思考）**：

- 虽然我们把按钮藏起来了，但聪明的黑客可以通过控制台直接调用 `deleteBuddy()` 函数。
- **安全金句**：**“前端的限制都是为了用户体验，后端的校验才是真的安全。”**
- 虽然我们在 Vue 里做了拦截，但未来写后端代码时，一定要在接口里再查一遍身份！

---

### 第二日下午小结

1. **动态切换**：学会了用 `v-if` 模拟简单的页面跳转。
2. **逻辑处理**：学会了在数组中查找 (`findIndex`) 并删除 (`splice`) 数据。
3. **越权意识 (Broken Access Control)**：通过删除功能，理解了“身份校验”的重要性，知道了不能信任客户端传来的每一个指令。

**【第二天大挑战】**：
能不能在详情页增加一个“浏览量”功能？每次点开详情页，这个搭子的 `views` 数量就加 1。思考一下：这个浏览量数据如果由前端直接修改，会不会被黑客恶意刷票？

---

**下节课预告**：
明天（最后一天）我们将实现真正的“用户登录”，并学习如何保护我们的系统不被**重放攻击**，以及进行上线前的最后安全自检！