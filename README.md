#知识数据处理平台
# react-admin
- [GitHub地址](https://github.com/yezihaohao/react-admin)
- [预览地址](http://cheng_haohao.oschina.io/reactadmin/#/app/dashboard/index)(还没做响应式，不建议手机预览😕)

# 本项目以github开源项目react—admin为基础，搭建完成

### 代码目录
```js
+-- build/                                  ---打包的文件目录
+-- config/                                 ---npm run eject 后的配置文件目录
+-- node_modules/                           ---npm下载文件目录
+-- public/                                 
|   --- index.html							---首页入口html文件
+-- src/                                    ---核心代码目录
|   +-- componentsDiy                       ---具体页面组件存放目录
|   |    --- index.js
|   +-- components                          ---提取的组件存放目录
|   |    --- module                         ---可复用组件存放目录
|   |    --- BreadcrumbCustom.jsx           ---面包屑组件
|   |    --- HeaderComponent                ---顶部导航组件
|   |    --- Page.jsx                       ---页面容器
|   |    --- SiderCustom.jsx                ---左边菜单组件
|   +-- style                               ---项目的样式存放目录，主要采用less编写
|   +-- utils                               ---共用方法存放目录
|   --- App.js                              ---组件入口文件
|   --- index.js                            ---项目的整体js入口文件，包括路由配置等
|	--- data.js                             ---全局可用变量
--- .env                                    ---启动项目自定义端口配置文件
--- .eslintrc                               ---自定义eslint配置文件，包括增加的react jsx语法限制
--- package.json                                    
```
### 安装运行
##### 1.下载或克隆项目源码
##### 2.安装相关包文件
```js
yarn install
```
##### 3.启动项目
```js
yarn start
```
##### 4.打包项目
```js
yarn build
```



#大屏幕显示17行，小屏幕默认8行
#App.js中

#定义了window.Fetch方法，统一拦截304,500，项目中fetch请求都使用window.fetch,并且后面要加catch
#处理请求throw错误时的提示
#index.js中
#2018-3-29