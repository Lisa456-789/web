# 4.2：智能交互与动画美化

**目标**：利用 Vue 的“监听器”实现实时搜索，通过“过渡动画”提升 App 质感，并理解前端校验的局限性。

---

### 第一步：实时搜索——不用点按钮的搜索框

**讲解**：现在的用户很懒，不想每输入一个字都去点一下“搜索”按钮。我们要用 `watch`（监听器）来监控用户的输入，只要用户一打字，我们就自动去数据库查。

1. 在 `src/App.vue` 的 `<script setup>` 中，添加对搜索文字的监听：
    
    ```jsx
    import { ref, onMounted, computed, watch } from 'vue' // 确保引入了 watch
    
    // 监听 searchText 变量的变化
    watch(searchText, async (newValue) => {
      console.log('正在搜索：', newValue)
    
      // 调用后端那个“有漏洞”的搜索接口
      const res = await axios.get(`http://localhost:3000/api/search?q=${newValue}`)
      buddyList.value = res.data
    })
    ```
    
2. **看结果**：现在你在搜索框打字，下方的列表是不是实时在跳动？

---

### 第二步：表单智能校验（实时变红）

**场景**：用户输入手机号时，如果没写满 11 位，我们想让输入框变红提醒他。

1. 在 `<script setup>` 中增加一个判断逻辑：
    
    ```jsx
    // 判断手机号是否合法（简单的长度判断）
    const isContactInvalid = computed(() => {
      const contact = newBuddy.value.contact
      // 如果写了内容但不是 11 位，就认为是非法的
      return contact.length > 0 && contact.length !== 11
    })
    ```
    
2. 修改 `<template>` 中的联系方式输入框，动态绑定一个 CSS 类：
    
    ```
    <input
      type="text"
      v-model="newBuddy.contact"
      placeholder="你的 11 位手机号"
      :class="{ 'error-border': isContactInvalid }"
    >
    <p v-if="isContactInvalid" class="error-msg">请输入正确的 11 位手机号</p>
    ```
    
3. 在 `<style>` 中添加红框样式：
    
    ```css
    .error-border { border: 2px solid #ff4757 !important; }
    .error-msg { color: #ff4757; font-size: 12px; margin-top: -8px; margin-bottom: 10px; }
    ```
    

---

### 第三步：给列表穿上“丝滑”的动画

**讲解**：Vue 提供了一个神奇的标签 `<TransitionGroup>`，可以让列表在增加、删除、搜索过滤时，不再是硬生生地闪现，而是有淡入淡出的效果。

1. 在 `<template>` 中，找到 `v-for` 循环卡片的地方，用 `<TransitionGroup>` 包裹它：
    
    ```
    <!-- tag="div" 表示这个包裹层本身是个 div -->
    <TransitionGroup name="list" tag="div" class="buddy-list">
      <div class="buddy-card" v-for="item in buddyList" :key="item.id">
        <!-- 卡片内容不变 -->
      </div>
    </TransitionGroup>
    ```
    
2. 在 `<style>` 中添加动画定义的“暗号”：
    
    ```css
    /* 刚进入和离开时的状态 */
    .list-enter-from, .list-leave-to {
      opacity: 0;
      transform: translateX(30px);
    }
    /* 整个动起来的过程 */
    .list-enter-active, .list-leave-active {
      transition: all 0.5s ease;
    }
    ```
    

---

### 第四步：安全思辨——“前端校验”真的安全吗？

**讲解（重要）**：
刚才我们写了手机号必须是 11 位的校验。

1. **提问**：如果黑客绕过网页，直接通过代码发一个手机号只有 1 位的请求给后端，后端会报错吗？
2. **实验**：由于我们早上的后端 `server.js` 没写校验逻辑，后端**会照单全收**并存入数据库。
3. **结论**：前端的校验（变红、弹窗）只是为了给普通用户看的（UX），**不能作为安全保障**。真正的安全必须在后端（SQLite 操作前）再做一次检查。

---

### 第五步：加分挑战——“清空数据库”功能

为了方便调试，我们给管理员加一个一键清空的按钮。

1. 在 `server/server.js` 中增加一个危险接口：
    
    ```jsx
    app.delete('/api/clear', (req, res) => {
      db.run("DELETE FROM buddies", () => {
        res.json({ message: "数据已清空" });
      });
    });
    ```
    
    *(记得重启 Node 进程：Ctrl+C 然后重新运行 node server/server.js)*
    
2. 在 Vue 页面底部增加一个“系统维护”按钮。