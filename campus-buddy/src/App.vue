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
      <!-- 顶栏，显示谁在登录 -->
      <div class="header">
        <span>欢迎你，{{ currentUser.name }}</span>
        <button @click="handleLogout" class="exit-btn">退出</button>
      </div>

      <h1>校园万能搭子广场</h1>

      <!-- 实时仪表盘 -->
      <div class="stats-bar">
        <span>📊 全校动态：总数 {{ stats.total }}</span> |
        <span>📚 学习 {{ stats.studyCount }}</span> |
        <span>⚽ 运动 {{ stats.sportCount }}</span>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <input type="text" v-model="searchText" placeholder="搜索搭子标题...">
      </div>

      <!-- 筛选按钮 -->
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

        <input
          type="text"
          v-model="newBuddy.contact"
          placeholder="你的 11 位手机号"
          :class="{ 'error-border': isContactInvalid }"
        >
        <p v-if="isContactInvalid" class="error-msg">请输入正确的 11 位手机号</p>
        <button @click="addBuddy" class="pub-btn">立即发布</button>
      </div>

      <!-- 搭子卡片列表，点击进入详情 -->
      <div class="buddy-card" v-for="item in buddyList" :key="item.id" @click="showDetail(item)">
        <h3>{{ item.title }}</h3>
        <p>分类：{{ item.category }}</p>
        <p>时间：{{ item.time }}</p>
        <p class="contact">联系方式：{{ hidePhone(item.contact) }}</p>
      </div>
    </div>

    <!-- 3. 详情页 -->
    <div v-else-if="currentPage === 'detail'">
      <button @click="goBack" class="back-btn">⬅ 返回列表</button>
      <div class="detail-card">
        <h2>{{ currentBuddy.title }}</h2>
        <div class="info-tag">{{ currentBuddy.category }}</div>
        <p><strong>发布时间：</strong> {{ currentBuddy.time }}</p>
        <p><strong>联系方式：</strong> {{ hidePhone(currentBuddy.contact) }}</p>

        <hr>
        <button class="join-btn" @click="joinBuddy">🙋‍♂️ 我要加入</button>
        <!-- 只有发帖人才能看到删除按钮 -->
        <button v-if="currentUser.id === currentBuddy.creatorId" class="del-btn" @click="deleteBuddy">
          🗑 删除此帖
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'

// === 登录相关 ===
const currentPage = ref('login')
const currentUser = ref(null) // 真正的用户信息（默认为空）

// 用来记录用户在登录框输入的账号密码
const loginForm = ref({
  username: '',
  password: ''
})

const isLock = ref(false) // 是否被锁住

const handleLogin = () => {
  if (isLock.value) return // 如果锁住了，点击无效

  // 模拟账号密码匹配
  if (loginForm.value.username === '100' && loginForm.value.password === '123456') {
    const userData = { id: 100, name: '小明' }
    currentUser.value = userData

    // 存入浏览器，名字叫 'my_app_user'
    localStorage.setItem('my_app_user', JSON.stringify(userData))

    currentPage.value = 'list' // 登录成功，跳到列表页
  } else {
    alert('密码错误！为了安全，请等待3秒后再试')
    isLock.value = true // 锁住按钮
    setTimeout(() => {
      isLock.value = false // 3秒后解锁
    }, 3000)
  }
}

const handleLogout = () => {
  currentUser.value = null
  currentPage.value = 'login' // 退出后跳回登录页
  localStorage.removeItem('my_app_user') // 清除记忆
}

// === 数据 ===
const buddyList = ref([]) // 初始为空

// 页面一加载就去服务器拿数据
onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/buddies')
  buddyList.value = res.data
})

// === 实时仪表盘（computed） ===
// 只要 buddyList 变化，stats 就会自动重新计算
const stats = computed(() => {
  return {
    total: buddyList.value.length,
    studyCount: buddyList.value.filter(b => b.category === '学习').length,
    sportCount: buddyList.value.filter(b => b.category === '运动').length
  }
})

// 3. 筛选功能
const filterCategory = async (cat) => {
  if (cat === '全部') {
    const res = await axios.get('http://localhost:3000/api/buddies')
    buddyList.value = res.data
  } else {
    const res = await axios.get('http://localhost:3000/api/buddies')
    buddyList.value = res.data.filter(item => item.category === cat)
  }
}

// 4. 实时搜索功能
const searchText = ref('')

// 监听 searchText 变量的变化
watch(searchText, async (newValue) => {
  console.log('正在搜索：', newValue)

  // 调用后端那个"有漏洞"的搜索接口
  const res = await axios.get(`http://localhost:3000/api/search?q=${newValue}`)
  buddyList.value = res.data
})

// 5. 新增搭子表单
const newBuddy = ref({
  title: '',
  category: '运动',
  contact: ''
})

// 判断手机号是否合法（简单的长度判断）
const isContactInvalid = computed(() => {
  const contact = newBuddy.value.contact
  // 如果写了内容但不是 11 位，就认为是非法的
  return contact.length > 0 && contact.length !== 11
})

const addBuddy = async () => {
  if (newBuddy.value.title === '') return

  // 1. 发给后端保存
  await axios.post('http://localhost:3000/api/buddies', newBuddy.value)

  // 2. 成功后重新刷新页面数据
  const updated = await axios.get('http://localhost:3000/api/buddies')
  buddyList.value = updated.data

  newBuddy.value.title = ''
  newBuddy.value.contact = ''
  alert('已永久存入数据库！')
}

// 6. 页面切换
const currentBuddy = ref(null)

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

// 8. 删除功能
const deleteBuddy = () => {
  if (confirm('确定要删除这个搭子邀请吗？')) {
    buddyList.value = buddyList.value.filter(b => b.id !== currentBuddy.value.id)
    goBack()
  }
}

// 隐私脱敏
const hidePhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// === 页面启动时的"保安"检查 ===
const checkAuth = () => {
  const savedUser = localStorage.getItem('my_app_user')
  if (!savedUser && currentPage.value !== 'login') {
    // 如果没登录 且 不在登录页，强制回登录页
    currentPage.value = 'login'
    alert('请先登录！')
  }
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
    currentPage.value = 'list' // 直接进列表，不用再登录
  }
}

// 执行检查
checkAuth()
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

/* 实时仪表盘 */
.stats-bar {
  text-align: center;
  background: white;
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #555;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

/* 登录页 */
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

/* 顶栏 */
.header {
  display: flex; justify-content: space-between; align-items: center;
  background: white; padding: 10px 20px; border-radius: 8px; margin-bottom: 20px;
}
.exit-btn { background: #eee; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }

/* 搜索框 */
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

/* 筛选按钮 */
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

/* 新增搭子表单 */
.add-box {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px dashed #42b983;
}
.add-box input, .add-box select {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
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

.error-border { border: 2px solid #ff4757 !important; }
.error-msg { color: #ff4757; font-size: 12px; margin-top: -8px; margin-bottom: 10px; }

/* 搭子卡片 */
.buddy-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-left: 5px solid #42b983;
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

/* 详情页 */
.back-btn { margin-bottom: 20px; cursor: pointer; }
.detail-card { background: white; padding: 20px; border-radius: 12px; }
.join-btn { background: #42b983; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px; }
.del-btn { background: #ff4757; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
</style>
