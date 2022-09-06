# 青芝坞旅游小程序 - 灵隐街道项目

## 文件组织结构简介，快速入门。
- 小程序的入口是app.js，目前其调用pages/index下的文件进行显示。pages文件夹下每一个子文件夹都是一个单独的页面，彼此间通过wx.navigateTo()跳转。

- 以pages/switchface为例。这个页面包含一个相机拍照界面。按下按照键后捕捉到的图片被存为本地临时文件，临时文件的路径存为一个全局变量（也即getApp().globalData下），然后在pages/preview页面中会根据这个路径将图片显示出来。

- 现在需要尽快加入的是基于纯前端方法实现的人脸识别和图片拼接。这两个函数应该写在pages/switchface/switchface.js中（也即findFace和fuseImgs），然后在ctx.takePhoto()成功后的函数success: (res) => {…… 内调用他们。输入的参数显然只有图片文件的地址，输出时可以选择直接把这个文件覆盖。

请使用WeChat_devtools打开此工程，并确保关闭了IDE的网络安全通信检查。后端代码请移步[这里](https://github.com/Dootmaan/QZW_backend)。
