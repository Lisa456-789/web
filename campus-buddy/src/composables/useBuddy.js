import { ref, computed, watch } from 'vue'
import axios from 'axios'

export function useBuddy() {
  // === 搭子列表数据 ===
  const buddyList = ref([])

  // === 获取所有搭子 ===
  const fetchBuddies = async () => {
    const res = await axios.get('http://localhost:3000/api/buddies')
    buddyList.value = res.data
  }

  // === 实时仪表盘（computed） ===
  const stats = computed(() => {
    return {
      total: buddyList.value.length,
      studyCount: buddyList.value.filter(b => b.category === '学习').length,
      sportCount: buddyList.value.filter(b => b.category === '运动').length
    }
  })

  // === 筛选功能 ===
  const filterCategory = async (cat) => {
    if (cat === '全部') {
      const res = await axios.get('http://localhost:3000/api/buddies')
      buddyList.value = res.data
    } else {
      const res = await axios.get('http://localhost:3000/api/buddies')
      buddyList.value = res.data.filter(item => item.category === cat)
    }
  }

  // === 实时搜索功能（带防抖） ===
  const searchText = ref('')

  let timer = null
  watch(searchText, (newValue) => {
    clearTimeout(timer)

    timer = setTimeout(async () => {
      const res = await axios.get(`http://localhost:3000/api/search?q=${newValue}`)
      buddyList.value = res.data
    }, 500)
  })

  // === 新增搭子表单 ===
  const newBuddy = ref({
    title: '',
    category: '运动',
    contact: ''
  })

  const isContactInvalid = computed(() => {
    const contact = newBuddy.value.contact
    return contact.length > 0 && contact.length !== 11
  })

  const addBuddy = async () => {
    if (newBuddy.value.title === '') return

    await axios.post('http://localhost:3000/api/buddies', newBuddy.value)

    const updated = await axios.get('http://localhost:3000/api/buddies')
    buddyList.value = updated.data

    newBuddy.value.title = ''
    newBuddy.value.contact = ''
    alert('已永久存入数据库！')
  }

  // === 清空数据库 ===
  const clearDatabase = async () => {
    if (!confirm('⚠️ 确定要清空全部数据吗？此操作不可恢复！')) return
    await axios.delete('http://localhost:3000/api/clear')
    const updated = await axios.get('http://localhost:3000/api/buddies')
    buddyList.value = updated.data
    alert('数据库已清空！')
  }

  // === 删除搭子 ===
  const deleteBuddy = (currentBuddy, goBack) => {
    if (confirm('确定要删除这个搭子邀请吗？')) {
      buddyList.value = buddyList.value.filter(b => b.id !== currentBuddy.id)
      goBack()
    }
  }

  // === 隐私脱敏 ===
  const hidePhone = (phone) => {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }

  return {
    buddyList,
    fetchBuddies,
    stats,
    filterCategory,
    searchText,
    newBuddy,
    isContactInvalid,
    addBuddy,
    clearDatabase,
    deleteBuddy,
    hidePhone
  }
}
