# 5.2：工程重构与安全审计

**目标**：学习开发者的“代码组织艺术”，封装自己的功能模块，并完成最终的项目安全审计。

---

### 第一步：代码大扫除——什么是“组合式函数”（Composables）

**讲解**：
现在你的 `App.vue` 是不是已经超过 200 行了？逻辑、数据、样式全都堆在一起，像一团乱麻。
加分同学要学会把逻辑抽离出来，像“乐高积木”一样把代码分块存放。

1. 在 `src` 目录下新建文件夹 `composables`，并在里面新建文件 `useBuddy.js`。
2. 把有关“获取搭子”和“搜索搭子”的逻辑搬过去：
    
    ```jsx
    // src/composables/useBuddy.js
    import { ref } from 'vue'
    import axios from 'axios'
    
    export function useBuddy() {
      const buddyList = ref([])
    
      const fetchBuddies = async () => {
        const res = await axios.get('<http://localhost:3000/api/buddies>')
        buddyList.value = res.data
      }
    
      return {
        buddyList,
        fetchBuddies
      }
    }
    ```
    
3. **在 `App.vue` 中调用它**：*老师讲解：这就是解耦。你的页面只管显示，逻辑管数据，互不干扰。*
    
    ```jsx
    import { useBuddy } from './composables/useBuddy'
    const { buddyList, fetchBuddies } = useBuddy()
    ```
    

---

### 第二步：增加“加载中”提示（增强用户体验）

**场景**：如果网络很慢，用户点击按钮没反应，会以为程序死机了。我们需要一个“菊花图”或文字提示。

1. 在 `src/App.vue` 中增加：
    
    ```jsx
    const isLoading = ref(false) // 记录是否正在加载
    ```
    
2. 修改请求函数，在请求开始前设为 `true`，结束后设为 `false`：
    
    ```jsx
    const handleLogin = async () => {
      isLoading.value = true
      try {
        // ... 原有的 Axios 请求代码
      } finally {
        isLoading.value = false // 无论成功还是失败，都取消加载状态
      }
    }
    ```
    
3. 在 `<template>` 中，当 `isLoading` 为真时，禁用按钮并显示提示：
    
    ```
    <button :disabled="isLoading" @click="handleLogin">
      {{ isLoading ? '正在连接服务器...' : '进入广场' }}
    </button>
    ```
    

---

### 第三步：终极安全审计清单（白帽子检查）

**讲解**：这是项目上线前的最后一关。请对照以下清单，检查并修改你的代码：

- [ ]  **敏感词过滤**：
在发布搭子前，检查标题是否包含违法词汇（如“代写作业”、“刷课”）。
- [ ]  **控制台清理**：
按 `Ctrl + F` 搜索整个项目，确保没有 `console.log` 打印用户的密码或隐私。
- [ ]  **变量名脱敏**：
检查你的数据结构，不要在前端代码里定义像 `const admin_password = '...'` 这样的变量。
- [ ]  **报错处理**：
确保你的 `axios` 请求都有 `.catch()` 或 `try...catch`，不要让数据库的错误信息直接弹窗给用户看（防止泄露后端路径）。

---

### 第四步：编写“安全开发总结报告”

**任务**：作为加分同学，请在你的项目根目录下创建一个 `REPORT.md` 文件（或者写在纸上），总结你在这个项目中实施的 **5 个安全措施**。

**示例模版：**

> **项目名称**：校园万能搭子 (Secure Edition)
**安全措施总结：**
> 
> 1. **数据脱敏**：使用正则隐藏了手机号中间四位。
> 2. **XSS 防护**：全局禁用 `v-html`，防止留言板弹窗。
> 3. **SQL 注入防护**：后端采用参数化查询（? 占位符）。
> 4. **水平越权防护**：删除按钮仅在 `currentUser.id === creatorId` 时显示。
> 5. **防爆破设计**：登录接口增加了 3 秒点击冷却时间。

---

### 第五步：全班展示（大结局）

**展示你的“加分点”：**

1. 展示你的 **实时搜索 + 搜索词防抖**。
2. 展示你的 **丝滑列表动画**。
3. 演示你如何 **修复了 SQL 注入漏洞**（可以演示修改前后的对比）。
4. 展示你的 **手机号自动纠错（实时变红）**。

---

### 结课总结

**结语：**
五天的实习到此结束。你们已经从一名只会写 HTML 的初学者，成长为了具备 **“安全基因”** 的初级 Web 开发者。
记住：**功能决定了一个产品能走多远，安全决定了一个产品能活多久。**
希望在未来的专业课中，你们能继续保持这种“既会建房子，又会装防盗门”的习惯。

---

**提示：**

1. 提交你的 `dist` 打包文件夹。
2. 提交你的 `server.js` 和 `App.vue`。

**恭喜完成全部实习挑战！**