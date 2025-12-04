/* =========================================
   第一部分：获取 DOM 元素
   目的：先拿到页面上的“遥控器”，后面才能操作它们
   ========================================= */
const input = document.querySelector('.input')    // 输入框
const btnAdd = document.querySelector('.btn-add') // 添加按钮
const taskBar = document.querySelector('.taskbar')// 任务列表容器 (UL)

/* =========================================
   第二部分：数据初始化 (核心：数据持久化)
   逻辑：
   1. 打开页面时，先去浏览器仓库 (localStorage) 找名字叫 'todoData' 的东西。
   2. localStorage 存的是字符串，必须用 JSON.parse 变成数组。
   3. || [] 的意思是：如果仓库是空的（null），就给我初始化一个空数组，防止后面报错。
   ========================================= */
let todoList = JSON.parse(localStorage.getItem('todoData')) || [] 


/* =========================================
   第三部分：Render 渲染函数 (核心：数据驱动视图)
   这是 React 的心脏。它的唯一任务：把 todoList 数组 变成 HTML。
   ========================================= */
function render() {
  // 【关键一步】保存数据
  // 每次重画页面，说明数据肯定变了，顺手把新数据存回浏览器仓库。
  // JSON.stringify 是把数组变成字符串，因为 localStorage 只能存字符串。
  localStorage.setItem('todoData', JSON.stringify(todoList))

  // 1. 清空画布
  // 必须先清空，否则每次 render 都会把旧的重复画一遍。
  taskBar.innerHTML = ''
  
  // 2. 遍历数据生成 HTML
  todoList.forEach((item) => {
    // 创建一个 li 标签
    const newLi = document.createElement('li')
    newLi.className = 'task-item'
    
    // 【核心逻辑：埋藏身份证】
    // 页面上看不见 dataset.id，但它把数据的 ID 绑在了这个 li 标签上。
    // 等会儿点击删除时，我们就靠这个 ID 知道要杀谁。
    newLi.dataset.id = item.id
    
    const textClass = item.isDone ? 'task-text completed' : 'task-text'
    // 填充内容
    newLi.innerHTML = `
      <span class="${textClass}">${item.text}</span>
      <span class="task-time">${item.time}</span>
      <button class="delete-btn">删除</button>
    `
    // 挂载到父容器
    taskBar.appendChild(newLi)
  })
}

/* =========================================
   第四部分：添加逻辑 (Add)
   逻辑：改数组 -> 喊 render 重新画
   ========================================= */
btnAdd.addEventListener('click', () => {
  const taskText = input.value.trim() // 去除首尾空格
  
  // 校验：没写东西不准提交
  if (!taskText) {
      alert('空内容无法加入')
      return 
  }
  
  // 1. 构造新数据对象
  const newTask = {
    id: Date.now(), // 用当前毫秒数做 ID，保证全球唯一，不会重复
    text: taskText,
    time: new Date().toLocaleDateString(),
    isDone: false
  }
  
  // 2. 更新数据源
  todoList.push(newTask)
  
  // 3. 更新视图 (告诉 Render 函数：数据变了，重新根据数组画页面)
  render()
  
  // 4. 用户体验优化 (清空输入框，光标自动回去)
  input.value = ''
  input.focus()
})

/* =========================================
   第五部分：交互逻辑 (删除 & 标记完成)
   技术点：事件委托 (Event Delegation)
   ========================================= */
taskBar.addEventListener('click', (e) => {
  // 1. 无论点哪里，先通过 closest 找到这一行的老祖宗 li 标签
  const parentLi = e.target.closest('.task-item')
  
  // 安全校验：如果点击空白处没找到 li，直接结束
  if (!parentLi) return 

  // 2. 统一获取 ID (大家都要用，所以提取到最外面)
  const id = Number(parentLi.dataset.id)

  // --- 分支 A: 删除逻辑 ---
  if (e.target.classList.contains('delete-btn')) {
    if (!confirm('确定删除？')) return
    
    // 过滤掉这个 ID
    todoList = todoList.filter(item => item.id !== id)
    render()
  }

  // --- 分支 B: 标记完成逻辑 ---
  if (e.target.classList.contains('task-text')) {
    // 找到对应的那条数据
    const task = todoList.find(item => item.id === id)
    
    if (task) {
        task.isDone = !task.isDone // 状态取反
        render() // 重新保存并渲染
    }
  }
})

/* =========================================
   第六部分：初始化执行
   逻辑：页面刚加载完（刷新后），手动调一次 render。
   目的：把 localStorage 里存的旧数据画出来。如果不加这行，刷新后页面是白的。
   ========================================= */
render()
input.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    // 模拟点击按钮，这样就不用重写一遍添加逻辑了
    btnAdd.click()
  }
})