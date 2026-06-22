### 第三步：清理战场（把没用的东西删掉）

为了让我们能从头开始写，我们需要清空 Vue 默认生成的代码。

1. 用 **VS Code** 打开 `campus-buddy` 文件夹。
2. 在左侧文件栏找到 `src/App.vue`，删除里面的所有内容，换成以下最简单的代码：
    
    ```
    <template>
      <h1>我的校园搭子广场</h1>
    </template>
    
    <script setup>
    // 这里以后写逻辑
    </script>
    
    <style>
    /* 这里以后写样式 */
    </style>
    ```
    
3. 保存文件（Ctrl + S），观察浏览器，网页应该已经变成了白底黑字的“我的校园搭子广场”。

---

### 第四步：准备搭子数据（定义你的内容）

我们要显示搭子，首先要在代码里准备好这些搭子的信息。

1. 修改 `src/App.vue` 中的 `<script setup>` 部分，复制以下代码：
    
    ```jsx
    <script setup>
    import { ref } from 'vue'
    
    // 这里就是我们的“搭子仓库”，用 ref 包起来，网页才能自动更新
    const buddyList = ref([
      { id: 1, title: '东操场打篮球', category: '运动', time: '周五 16:00', contact: '13812345678' },
      { id: 2, title: '食堂二楼干饭', category: '美食', time: '今天中午', contact: '13988887777' },
      { id: 3, title: '图书馆五楼自习', category: '学习', time: '周六全天', contact: '13566665555' }
    ])
    </script>
    ```
    

---

### 第五步：让数据变卡片（使用 v-for 指令）

我们要让 Vue 自动帮我们把数据“画”出来。

1. 修改 `src/App.vue` 的 `<template>` 部分：
    
    ```
    <template>
      <div class="container">
        <h1>校园万能搭子广场</h1>
    
        <!-- v-for 就像是一个复印机，把 buddyList 里的每个搭子都复印成一个 div -->
        <div class="buddy-card" v-for="item in buddyList" :key="item.id">
          <h3>{{ item.title }}</h3>
          <p>分类：{{ item.category }}</p>
          <p>时间：{{ item.time }}</p>
          <p class="contact">联系方式：{{ item.contact }}</p>
        </div>
      </div>
    </template>
    ```
    

---

### 第六步：穿上漂亮的衣服（添加简单样式）

现在的网页很丑，我们需要在 `<style>` 部分添加一些 CSS，让它看起来像个真正的 App。

1. 修改 `src/App.vue` 的 `<style>` 部分：
    
    ```css
    <style>
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
      font-family: 'PingFang SC', sans-serif;
    }
    h1 {
      text-align: center;
      color: #333;
    }
    .buddy-card {
      background: white;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-left: 5px solid #42b983; /* 侧边加一条绿色的线 */
    }
    .buddy-card h3 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }
    .contact {
      color: #e67e22;
      font-weight: bold;
    }
    </style>
    ```
    

---

### 第七步：安全小练习：隐私脱敏

**场景**：作为开发者，直接显示同学完整的手机号是不安全的。我们要学习如何简单地隐藏手机号中间四位。

1. 在 `<script setup>` 中添加一个简单的处理函数：
    
    ```jsx
    const hidePhone = (phone) => {
      // 这里的逻辑是将字符串中间四位换成星号
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
    ```
    
2. 回到 `<template>` 部分，修改联系方式的显示代码：
    
    ```
    <!-- 把原来的 {{ item.contact }} 改成下面的样子 -->
    <p class="contact">联系方式：{{ hidePhone(item.contact) }}</p>
    ```
    
3. **看结果**：现在网页上的手机号是不是变成了 `138****5678`？这就是最基础的隐私数据保护意识。