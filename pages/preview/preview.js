// pages/preview/preview.js
Page({

  /**
   * Page initial data
   */
  data: {
    imgPath:null
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {

  },
   /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow(options) {
    // console.log(getApp().globalData.new_imgPath)
    var app = getApp()
    this.setData({
      imgPath: app.globalData.new_imgPath
    })
    console.log(this.data)
  },
  goBack: function(){
    wx.navigateBack({
      delta: 1,
    })
  },
  saveImg:function(){
      wx.showLoading({
          title: '加载中...'
      });
      //wx.saveImageToPhotosAlbum方法：保存图片到系统相册
      wx.saveImageToPhotosAlbum({
                  filePath: getApp().globalData.new_imgPath, //图片文件路径
                  success: function (data) {
                      wx.hideLoading(); //隐藏 loading 提示框
                      wx.showModal({
                          title: '提示',
                          content: '保存成功',
                          modalType: false,
                      })
                  },
                  // 接口调用失败的回调函数
                  fail: function (err) {
                      if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
                          wx.showModal({
                              title: '提示',
                              content: '需要您授权保存相册',
                              modalType: false,
                              success: modalSuccess => {
                                  wx.openSetting({
                                      success(settingdata) {
                                          console.log("settingdata", settingdata)
                                          if (settingdata.authSetting['scope.writePhotosAlbum']) {
                                              wx.showModal({
                                                  title: '提示',
                                                  content: '获取权限成功,再次点击图片即可保存',
                                                  modalType: false,
                                              })
                                          } else {
                                              wx.showModal({
                                                  title: '提示',
                                                  content: '获取权限失败，将无法保存到相册哦~',
                                                  modalType: false,
                                              })
                                          }
                                      },
                                      fail(failData) {
                                          console.log("failData", failData)
                                      },
                                      complete(finishData) {
                                          console.log("finishData", finishData)
                                      }
                                  })
                              }
                          })
                      }
                  },
                  complete(res) {
                      wx.hideLoading(); //隐藏 loading 提示框
                  }
              })
  },
 
  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  }
})