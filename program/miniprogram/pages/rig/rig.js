// pages/rig/rig.js
const app = getApp();
// let username = '';
// let password = '';
// let password_again = '';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        username: '',
        password: '',
        password_again: '',
    },

    username(e) {
        this.setData({
            username : e.detail.value
        })
    },
    password(e) {
        this.setData({
            password : e.detail.value
        })
    },
    password_again(e) {
        this.setData({
            password_again : e.detail.value
        })
    },

    rigester() {
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
        } else if (this.data.password_again == '') {
            wx.showToast({
                icon: 'none',
                title: '确认密码不能为空',
            })
        } else {
            //const db = await getApp().database()
            const db = wx.cloud.database()
            db.collection(app.globalData2.collection).where({
                user: this.data.username
            }).get().then(res => {
                const {
                    data
                } = res
                if (data.length > 0) {
                    wx.showToast({  //显示密码错误信息
                        title: '账户已存在！！',
                        icon: 'error',
                        duration: 2500
                    });
                } else {
                    if (this.data.password !== this.data.password_again) {
                        wx.showToast({  //显示密码错误信息
                            title: '确认密码错误',
                            icon: 'error',
                            duration: 2500
                        });
                    } else {
                        db.collection(app.globalData2.collection).add({
                            data: {
                                username: this.data.username,
                                password: this.data.password
                            }
                        })
                        wx.showToast({  //显示登录成功信息
                            title: '注册成功！！',
                            icon: 'success',
                            duration: 2500
                        })
                        wx.navigateTo({
                            url: '../../pages/loginp/index',
                        })
                    }
                }
            })
        }
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