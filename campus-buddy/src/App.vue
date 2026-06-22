<template>
  <div class="container">
    <h1>校园万能搭子广场</h1>

    <!-- 搜索框：v-model 双向绑定 searchText，@input 实时搜索 -->
    <div class="search-box">
      <input type="text" v-model="searchText" placeholder="搜索搭子标题..." @input="searchBuddy">
    </div>

    <!-- 筛选按钮：@click 触发 filterCategory 函数 -->
    <div class="filter-box">
      <button @click="filterCategory('全部')">全部</button>
      <button @click="filterCategory('运动')">运动</button>
      <button @click="filterCategory('学习')">学习</button>
      <button @click="filterCategory('美食')">美食</button>
    </div>

    <!-- v-for 就像是一个复印机，把 buddyList 里的每个搭子都复印成一个 div -->
    <div class="buddy-card" v-for="item in buddyList" :key="item.id">
      <!-- ⚠️ 故意使用 v-html 制造 XSS 漏洞，教学演示用 -->
      <h3 v-html="item.title"></h3>
      <p>分类：{{ item.category }}</p>
      <p>时间：{{ item.time }}</p>
      <!-- 使用 hidePhone 函数对手机号进行隐私脱敏 -->
      <p class="contact">联系方式：{{ hidePhone(item.contact) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

console.log("正在尝试连接服务器...")
// 使用 import.meta.env 读取暗号，而不是直接写死在代码里
console.log("当前使用的安全暗号是:", import.meta.env.VITE_ADMIN_KEY)

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

// 4. 搜索功能：根据标题关键词搜索
const searchText = ref('') // 记录用户输入的内容

const searchBuddy = () => {
  // 在所有数据中搜索包含关键词的内容
  buddyList.value = allBuddies.filter(item =>
    item.title.includes(searchText.value)
  )
}

// 隐私脱敏：将手机号中间四位替换为星号
const hidePhone = (phone) => {
  // 这里的逻辑是将字符串中间四位换成星号
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
</script>

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

/* 搜索框样式 */
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

/* 筛选按钮样式 */
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

/* 搭子卡片样式 */
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
