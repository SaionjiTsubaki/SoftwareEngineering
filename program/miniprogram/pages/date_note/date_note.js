// pages/date_note/date_note.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dateList: [], //日历主体渲染数组
    selectDay: {}, //选中日期
    selectDayData: [], //选中日期的记录[{title: , content: , ...}, {}, ...]
    today: {}, //今日日期
    spot: [], //有记录的日期 "Y-M-D"格式
  },

  /**
   * 组件的方法列表
   */

  /**
   * 时间戳转化为年 月 日 时 分 秒
   * time: 需要被格式化的时间，可以被new Date()解析即可
   * format：格式化之后返回的格式，年月日时分秒分别为Y, M, D, h, m, s，这个参数不填的话则显示多久前
   */
  formatTime(time, format){
    function formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }

    function getDate(time, format){
      const formateArr = ['Y', 'M', 'D', 'h', 'm', 's']
      const returnArr = []
      const date = new Date(time)
      returnArr.push(date.getFullYear())
      returnArr.push(formatNumber(date.getMonth() + 1))
      returnArr.push(formatNumber(date.getDate()))
      returnArr.push(formatNumber(date.getHours()))
      returnArr.push(formatNumber(date.getMinutes()))
      returnArr.push(formatNumber(date.getSeconds()))
      for(const i in returnArr){
        format = format.replace(formateArr[i], returnArr[i])
      }
      return format
    }

    function getDateDiff(time){
      let r = ''
      const ft = new Date(time)
      const nt = new Date()
      const nd = new Date(nt)
      nd.setHours(23)
      nd.setMinutes(59)
      nd.setSeconds(59)
      nd.setMilliseconds(999)
      const d = parseInt((nd - ft) / 86400000)
      switch (true) {
        case d === 0:
          const t = parseInt(nt / 1000) - parseInt(ft / 1000)
          switch (true) {
            case t < 60:
              r = '刚刚'
              break
            case t < 3600:
              r = parseInt(t / 60) + '分钟前'
              break
            default:
              r = parseInt(t / 3600) + '小时前'
          }
          break
        case d === 1:
          r = '昨天'
          break
        case d === 2:
          r = '前天'
          break
        case d > 2 && d < 30:
          r = d + '天前'
          break
        default:
          r = getDate(time, 'Y-M-D')
      }
      return r
    }
    if(!format){
      return getDateDiff(time)
    }
    else{
      return getDate(time, format)
    }
  },
  //picker设置月份
  editMonth(e){
    const arr = e.detail.value.split("-")
    const year = parseInt(arr[0])
    const month = parseInt(arr[1])
    this.setMonth(year, month)
  },
  //上月切换按钮点击
  lastMonth(){
    const lastMonth = new Date(this.data.selectDay.year, this.data.selectDay.month - 2)
    const year = lastMonth.getFullYear()
    const month = lastMonth.getMonth() + 1
    this.setMonth(year, month)
  },
  //下月切换按钮点击
  nextMonth(){
    const nextMonth = new Date(this.data.selectDay.year, this.data.selectDay.month)
    const year = nextMonth.getFullYear()
    const month = nextMonth.getMonth() + 1
    this.setMonth(year, month)
  },
  //设置月份
  setMonth(setYear, setMonth, setDay){
    if (this.data.selectDay.year !== setYear || this.data.selectDay.month !== setMonth) {
      const day = Math.min(new Date(setYear, setMonth, 0).getDate(), this.data.selectDay.day)
      const time = new Date(setYear, setMonth - 1, setDay ? setDay : day)
      const data = {
        selectDay: {
          year: setYear,
          month: setMonth,
          day: setDay ? setDay : day,
          dateString: this.formatTime(time, "Y-M-D")
        }
      }
      if(setDay){
        data.open = true
      }
      this.setData(data)
      this.dateInit(setYear, setMonth)
      this.setSpot()
      if(this.data.selectDay.spot){
        //如果初始化时当天有记录，则从云服务器down下来全部的记录并setData
        this.getNote()
      }
      else{
        this.setData({
          selectDayData: [] //没有记录则清空selectDayData
        })
      }
    }
  },
  //展开收起
  openChange(){
    this.setData({
      open: !this.data.open
    })
    this.dateInit()
    this.setSpot()
  },

  //设置日历底下是否展示小圆点
  setSpot(){
    this.data.dateList.forEach(item => {
      if (this.data.spot.indexOf(item.dateString) == -1){
        item.spot = false
      } 
      else{
        item.spot = true
      }
    })
    if (this.data.spot.indexOf(this.data.selectDay.dateString) == -1){
      this.data.selectDay.spot = false
    } 
    else{
      this.data.selectDay.spot = true
    }
    this.setData({
      dateList: this.data.dateList,
      selectDay: this.data.selectDay
    })
  },

  //日历主体的渲染方法
  dateInit(setYear = this.data.selectDay.year, setMonth = this.data.selectDay.month){
    let dateList = []; //需要遍历的日历数组数据
    let now = new Date(setYear, setMonth - 1)//当前月份的1号
    let startWeek = now.getDay(); //目标月1号对应的星期几
    let dayNum = new Date(setYear, setMonth, 0).getDate() //当前月有多少天
    let forNum = Math.ceil((startWeek + dayNum) / 7) * 7 //总共要显示的天数
    if (this.data.open) {
      //展开状态，需要渲染完整的月份
      for(let i = 0; i < forNum; i++){
        const now2 = new Date(now)
        now2.setDate(i - startWeek + 2)        
        let obj = {};
        obj = {
          day: now2.getDate(),
          month: now2.getMonth() + 1,
          year: now2.getFullYear(),
          dateString: this.formatTime(now2, "Y-M-D"),
        };
        dateList[i] = obj;
      }
    } 
    else{
      //非展开状态，只需要渲染当前周
      for(let i = 0; i < 7; i++){
        const now2 = new Date(now)
        //当前周的7天
        now2.setDate(Math.ceil((this.data.selectDay.day - 1 + startWeek) / 7) * 7 - 6 - startWeek + i + 1)
        let obj = {};
        obj = {
          day: now2.getDate(),
          month: now2.getMonth() + 1,
          year: now2.getFullYear(),
          dateString: this.formatTime(now2, "Y-M-D")
        };
        dateList[i] = obj;
      }
    }     
    this.setData({
      dateList: dateList      
    })
    var a = 1;
  },
  //一天被点击时
  selectChange(e){
    const year = e.currentTarget.dataset.year
    const month = e.currentTarget.dataset.month
    const day = e.currentTarget.dataset.day
    const dateString = e.currentTarget.dataset.dateString
    const selectDay = {
      year: year,
      month: month,
      day: day,
      dateString: dateString
    }
    if (this.data.spot.indexOf(selectDay.dateString) == -1){
      selectDay.spot = false
    } 
    else{
      selectDay.spot = true
    }
    if(this.data.selectDay.year !== year || this.data.selectDay.month !== month){
      this.setMonth(year, month, day)
    } 
    else if(this.data.selectDay.day !== day){
      this.setData({
        selectDay: selectDay
      })
    }
    if(this.data.selectDay.spot){
      // 如果选择到的日期有记录，则从云服务器down下来全部的记录并setData
      this.getNote()
    }
    else{
      this.setData({
        selectDayData: [] // 没有记录则清空selectDayData
      })
    }
  },

  // 增加新的记事本内容
  toNote(){
    let newNote = true
    let date = this.data.selectDay.dateString
    console.log("to note");
    wx.navigateTo({
      url: '../add/index',
      success: function (res) {
        res.eventChannel.emit('date', date)
      } 
    })
  },

  // 修改记事本内容
  updateNote(e){
    let newNote = false
    let title = e.currentTarget.dataset.title
    let content = e.currentTarget.dataset.content
    let date = this.data.selectDay.dateString
    console.log("update note");
    wx.navigateTo({
      url: '../note/note?newNote='+newNote,
      success: function (res) {
        res.eventChannel.emit('title', title)
        res.eventChannel.emit('content', content)
        res.eventChannel.emit('date', date)
      }
    })
  },

  // 删除记录
  delNote(e){
    let that = this
    wx.showModal({
      title: '删除',
      content: '确定删除这条记录？',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showLoading()
          let temp_spot = that.data.spot
          let date = that.data.selectDay.dateString
          wx.cloud.callFunction({
            name: 'delNote',
            data: {
              userId: getApp().globalData.userId,
              date: date,
              title: e.currentTarget.dataset.title
            }
          }).then((res) => {
            console.log(res.result)  
            temp_spot.splice(temp_spot.indexOf(date), 1)
            wx.setStorageSync('spot', temp_spot)
            that.setData({
              spot: temp_spot
            })
            that.setSpot()
            if(that.data.selectDay.spot){
              that.getNote()
            }
            else{
              that.setData({
                selectDayData : []
              })
            }
            
          })
          wx.hideLoading()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 获得选择的日期记录
  getNote(){
    let that = this
    wx.cloud.callFunction({
      name: 'getCollection',
      data: {
        userId: getApp().globalData.userId,
        date: that.data.selectDay.dateString
      }
    }).then((res) => {
      console.log(res.result.data)
      let temp = []
      if(res.result.data!=undefined){
        temp = res.result.data
      }
      that.setData({
        selectDayData: temp
      })
    })
  },

  // spot初始化
  getSpot(){
    let that = this
    wx.cloud.callFunction({
      name: 'getSpot',
      data: {
        userId: getApp().globalData.userId
      }
    }).then((res) => {
      console.log(res.result)
      let temp_spot = []
      if(res.result.data!=undefined){
        res.result.data.forEach(item => {
          temp_spot.push(item.date)
        })
      }     
      that.setData({
        spot: temp_spot
      })
      wx.setStorageSync('spot', temp_spot)
      that.setSpot()
      // 获取今日有无记录
      that.getNote()
    })
  },

  // 数据库初始化
  dbInit(){ 
    let that = this
    wx.cloud.callFunction({
      name: 'createMyCollection',
      data: {
        userId: getApp().globalData.userId
      },
      config: {
        env: getApp().globalData.envId
      },
    }).then((res) => {
      console.log(res.result)
      // spot初始化
      that.getSpot()      
    })
  },

  onLoad(){
    let now = new Date()
    let selectDay = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      dateString: this.formatTime(now, "Y-M-D")
    }
    this.setData({
      today:{
        year: selectDay.year,
        month: selectDay.month,
        day: selectDay.day
      }
    });
    wx.showLoading()
    //数据库及初始数据初始化
    this.setMonth(selectDay.year, selectDay.month, selectDay.day)
    this.dbInit()
    wx.hideLoading()
  },

  onReady: function() {

  },

  onShow: function () {
    //内存读取新的spot
    //云端下载新的selectDayData
    //this.setData({})
    wx.showLoading()
    let temp_spot = wx.getStorageSync('spot')
    this.setData({
      spot: temp_spot
    })
    this.setSpot()
    if(this.data.selectDay.spot){
      this.getNote()
    }
    wx.hideLoading()
  },
})

