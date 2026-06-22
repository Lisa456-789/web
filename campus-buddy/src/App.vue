<template>
  <div class="container">
    <!-- 第一块：列表页（只在 currentPage 为 'list' 时显示） -->
    <div v-if="currentPage === 'list'">
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

      <!-- 新增搭子表单 -->
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

      <!-- 注意：给循环的卡片加一个点击事件 -->
      <div class="buddy-card" v-for="item in buddyList" :key="item.id" @click="showDetail(item)">
        <h3>{{ item.title }}</h3>
        <p>分类：{{ item.category }}</p>
        <p>时间：{{ item.time }}</p>
        <p class="contact">联系方式：{{ hidePhone(item.contact) }}</p>
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

<script setup>
import { ref } from 'vue'

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

// 5. 新增搭子表单数据
const newBuddy = ref({
  title: '',
  category: '运动',
  contact: ''
})

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

  // 3. 把新搭子加到正在显示的列表里，同时也加到"全量仓库"里
  buddyList.value.unshift(buddy)
  allBuddies.unshift(buddy)

  // 4. 发布完后，清空表单，方便下次填写
  newBuddy.value.title = ''
  newBuddy.value.contact = ''
  alert('发布成功！')
}

// 6. 页面切换
const currentPage = ref('list') // 可选值：'list'（列表页）, 'detail'（详情页）
const currentBuddy = ref(null) // 记录正在看哪一个搭子的详情

const showDetail = (item) => {
  currentBuddy.value = item
  currentPage.value = 'detail'
}

const goBack = () => {
  currentPage.value = 'list'
}

// 7. 互动功能
const joinBuddy = () => {
  alert('申请已发送！请等待发起人联系你~')
}

// 8. 删除功能（⚠️ 漏洞版本：任何人都可以删除任意帖子）
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

/* 新增搭子表单样式 */
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

/* 搭子卡片样式 */
.buddy-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-left: 5px solid #42b983; /* 侧边加一条绿色的线 */
  cursor: pointer;
}
.buddy-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}
.contact {
  color: #e67e22;
  font-weight: bold;
}

/* 详情页样式 */
.back-btn { margin-bottom: 20px; cursor: pointer; }
.detail-card { background: white; padding: 20px; border-radius: 12px; }
.join-btn { background: #42b983; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px; }
.del-btn { background: #ff4757; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
</style>
