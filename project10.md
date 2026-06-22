### 第七步：进阶——防抖（Debounce）性能安全

**讲解**：加分同学要注意，如果有人写个脚本，一秒钟往你的搜索接口发 10000 个请求，你的 SQLite 数据库会直接崩溃。我们要给前端加个“限速器”。

1. 修改 `src/App.vue` 中的 `watch` 逻辑，增加一个定时器：
    
    ```jsx
    let timer = null
    watch(searchText, (newValue) => {
      // 只要还在打字，就清除上一次的定时器
      clearTimeout(timer)
    
      // 等用户停手 500 毫秒后，再发请求
      timer = setTimeout(async () => {
        const res = await axios.get(`http://localhost:3000/api/search?q=${newValue}`)
        buddyList.value = res.data
      }, 500)
    })
    ```