// pages/loginp/index.js
const app = getApp();
let username = '';
let password = '';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loginStatus: app.loginStatus,
        username: '',
        password: ''
    },

    //获取输入款内容
    username(e) {
        this.setData({ username: e.detail.value })
    },
    password(e) {
        this.setData({ password: e.detail.value })
    },

    loginClick() {
        // let flag = false  //表示账户是否存在,false为初始值
        if (this.data.username == '') {
            wx.showToast({
                icon: 'none',
                title: '账号不能为空',
            })
        } else if (this.data.password == '') {
            wx.showToast({
                icon: 'none',
                title: '密码不能为空',
            })
        } else {
            //const db = await getApp().database()
            const db = wx.cloud.database()
            db.collection(app.globalData2.collection).where({
                username: this.data.username
            }).get().then(res => {
                const {
                    data
                } = res
                if (data.length > 0) {
                    if (this.data.password !== data[0].password) {
                        wx.showToast({  //显示密码错误信息
                            title: '密码错误！！',
                            icon: 'error',
                            duration: 2500
                        });
                    } else {
                        app.loginStatus=1
                        app.username=this.data.username
                        wx.showToast({  //显示登录成功信息
                            title: '登陆成功！！',
                            icon: 'success',
                            duration: 2500
                        })
                        // wx.setStorageSync('admin', password)
                        wx.switchTab({
                          url: '/pages/list/index',
                        })
                        //wx.navigateBack({delta:2,})
                    }
                } else {
                    wx.showToast({
                        title: '用户不存在',
                        icon: 'error',
                        duration: 2500
                    })
                }
            })
        }
    },

    // 去注册
    registerClick() {
        wx.navigateTo({
            url: '../../pages/rig/rig',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})