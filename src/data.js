// //生成菜单数据
// //所有请求前缀
export const urlBefore = '/spdata';
export const urlBeforespssa = '/spdata';
export let InitData = [{
    "name": "标准库",
    "english": "Standard Library",
    "menufullcode": "kdpsbzk",
    "libType": "bz",
    "url": "/app/index1",
    "children": [{
        "name": "首页",
        "url": "/app/index1/list", //地址路径
        "iconName": "", //对应
        "component": "./componentsDiy/catalog/catalog.jsx" //对应模块
    }]
}, {
    "name": "定制库",
    "english": "Custome Library",
    "menufullcode": "kdpsdzk",
    "libType": "dz",
    "url": "/app/index2",
    "children": [{
        "name": "首页",
        "url": "/app/index2/index", //地址路径
        "iconName": "", //对应
        "component": "./componentsDiy/customeLib/establish" //对应模块
    }, {
        "name": "列表",
        "url": "/app/index2/list", //地址路径
        "iconName": "", //对应
        "component": "./componentsDiy/catalog/catalog.jsx" //对应模块
    }]
}, {
    "name": "项目库",
    "english": "Project Library",
    "menufullcode": "kdpsxmk",
    "libType": "xm",
    "url": "/app/index3",
    "children": [{
        "name": "首页",
        "url": "/app/index3/index", //地址路径
        "iconName": "", //对应
        "component": "./componentsDiy/projectLib/project" //对应模块
    }, {
        "name": "列表",
        "url": "/app/index3/list", //地址路径
        "iconName": "", //对应
        "component": "./componentsDiy/catalog/catalog.jsx" //对应模块
    }]
}]


// //生成菜单数据
// //所有请求前缀
// export const urlBefore = '/spdata';
// export const urlBeforespssa = '/spdata';
// export const InitData = fetch(urlBefore + '/common/queryLoginUserFirstLevelPCMenu_ybMenu.action', {
//     method: 'POST',
//     header: {
//         "Content-Type": "application/json"
//     },
//     credentials: 'include',
//     body: {}
// }).then(res => res.json()).then(data => {
//     if (data.result === 'success') {
//         return data.datas
//     } else {
//         return []
//     }
// })
// console.log(InitData)