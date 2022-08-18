// pages/switchface/switchface.js
Page({

  /**
   * Page initial data
   */
  data: {

  },
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        getApp().globalData.imgPath=res.tempImagePath
        // this.setData({
        //   src: res.tempImagePath
        // })
        wx.navigateTo({
          url: '/pages/preview/preview',
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {

  },

  findFace: function(){
    //TODO
  },

  fuseImgs: function(){
    //TODO
  }
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

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
  goBack: function(){
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  }
})