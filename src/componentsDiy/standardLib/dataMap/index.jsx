import React, {Component} from 'react';
import {Dropdown, Icon, Tag, Table, Button, Menu, Row, Col, Checkbox, Form, Input, message, Select, Modal} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './index.less';
import Product from './product.jsx';
import subString from './../../../utils/subString'

let throttle = function (fn, context, delay) {
    clearTimeout(fn.timer);
    fn._cur = Date.now();
    if (!fn._start) {
        fn._start = fn._cur;
    }
    if (fn._cur - fn._start > delay) {
        fn.call(context);
        fn._start = fn._cur;
    } else {
        fn.timer = setTimeout(function () {
            fn.call(context);
        }, delay)
    }
}


const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;

class DataMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            libType: sessionStorage.getItem('libType'), //库类型
            libId: sessionStorage.getItem('libId'),
            first: '',
            second: '',
            dataThe: '', //数据类别
            selectedRowKeys: [],
            dataTypes: [
                {
                    'code': '',
                    'name': '全部'
                },
                {
                    'code': '1',
                    'name': '同码同名'
                },
                {
                    'code': '2',
                    'name': '同码不同名'
                },
                {
                    'code': '3',
                    'name': '同名不同码'
                },
                {
                    'code': '4',
                    'name': '不同码不同名'
                }
            ],
            itemThe: '1',//项目类别
            itemTypes: [
                {
                    'code': '1',
                    'name': '药品'
                },
                {
                    'code': '2',
                    'name': '诊疗'
                },
                {
                    'code': '3',
                    'name': '耗材'
                },
                {
                    'code': '4',
                    'name': '诊断'
                }
            ],
            mapTypes: [
                {
                    code: '',
                    name: '全部'
                },
                {
                    code: '1',
                    name: '已映射'
                },
                {
                    code: '0',
                    name: '未映射'
                }
            ],
            ake001: '',
            ake003: '',
            aka070: '',
            chemicalName: '',
            checked: true,
            direction: 'right',
            mapType: '', //映射类别
            data1: [],
            data2: [],
            leftValues: [], //搜索后左侧标签
            leftValue: '',   //搜索左侧标签 key
            leftValueS: [],   //选中的左侧标签
            codeOrNameL: '',//项目名称或项目编码

            rightValues: [], //搜索后左侧标签
            rightValue: '',   //搜索左侧标签 key
            rightValueS: [],   //选中的左侧标签
            codeOrNameR: '',//项目名称或项目编码
            leftLoading: false,
            rightLoading: false,

            pagesizeL: 1,
            pagerowL: 10,
            countL: 0,
            pagesizeR: 1,
            pagerowR: 10,
            countR: 0,
            autoShow:false,
            autoDatas:[],
            mapLoading:false
        }
    }

    componentWillMount() {
        const libType = this.state.libType;
        let stringF = '';
        if (libType === 'bz') {
            stringF = "标准库"
        } else if (libType === 'dz') {
            stringF = "定制库"
        } else if (libType === 'xm') {
            stringF = "项目库"
        }
        this.setState({
            first: stringF,
            second: this.props.location.query.name
        })
        //左侧标签查询
        this.labelLeft();
        //this.getDataBase();
        //右侧
        this.labelRight();
        //this.getData();
        //自动映射数据
        //this.getMapDatas();
    }

    //点击下拉
    menuClick = (e) => {
        if (e.key === '1') {
            this.setState({
                show: true
            })
        }else if(e.key === '2'){
            this.getMapDatas();
        }
    }
    // 刷新页面
    refresh = () => {
        window.location.reload()
    }
    dataClick = (code) => {
        this.setState({
            dataThe: code,
            pagesizeL: 1,
            pagesizeR: 1
        }, () => {
            if (this.state.direction === 'right') {
                this.getDataBase();
            } else {
                this.getData();
            }

        })
    }
    itemClick = (code) => {
        this.setState({
            itemThe: code,
            pagesizeL: 1,
            pagesizeR: 1
        }, () => {
            this.labelLeft();
            this.labelRight();
            /*if (this.state.direction === 'right') {
                this.getDataBase();
            } else {
                this.getData();
            }*/
        })
    }
    //映射状态
    selectChange = (value) => {
        this.setState({
            mapType: value,
            pagesizeL: 1,
            pagesizeR: 1
        }, () => {
            if (this.state.direction === 'right') {
                this.getDataBase();
            } else {
                this.getData();
            }
        })
    }
    //多选框
    checkChange = (e) => {
        this.setState({
            checked: e.target.checked,
            pagesizeL: 1,
            pagesizeR: 1
        }, () => {
            if (this.state.direction === 'right') {
                this.getDataBase();
            } else {
                this.getData();
            }
        })
    }
    //点击
    rowClick = (record) => {

        if (this.state.direction === 'right') {
            let arr = this.state.data1;
            arr.map((item) => {
                if (item.ake001 === record.ake001) {
                    item.activeThe = true;
                } else {
                    item.activeThe = false;
                }
                return false;
            })
            this.setState({
                ake001: record.ake001,
                ake002: record.ake002,
                aka070: record.aka070,
                chemicalName: record.chemicalName,
                data1: arr,
                pagesizeR: 1
            }, () => {
                this.MappingItems();
            })
        } else {
            let arr = this.state.data2;
            arr.map((item) => {
                if (item.ake001 === record.ake001) {
                    item.activeThe = true;
                } else {
                    item.activeThe = false;
                }
                return false;
            })
            this.setState({
                ake001: record.ake001,
                ake002: record.ake002,
                aka070: record.aka070,
                chemicalName: record.chemicalName,
                data2: arr,
                pagesizeL: 1
            }, () => {
                this.MappingItems();
            })
        }
    }
    //
    directionToR = () => {
        this.setState({
            direction: 'right',
            mapType: '',
            pagesizeL: 1,
            pagesizeR: 1
        }, () => {
            this.getDataBase();
        })
    }
    directionToL = () => {
        this.setState({
            direction: 'left',
            mapType: '',
            pagesizeL: 1,
            pagesizeR: 1
        }, () => {
            this.getData();
        })
    }
    //根据选中项目获取映射项目
    MappingItems = () => {
        let objThe = {};
        if (this.state.direction === 'right') {
            objThe = {
                useDict: this.state.checked,
                ake001: this.state.ake001 ? encodeURIComponent(encodeURIComponent(this.state.ake001)) : '',
                ake002: this.state.ake002 ? encodeURIComponent(encodeURIComponent(this.state.ake002)) : '',
                aka070: this.state.aka070,
                chemicalName: this.state.chemicalName,
                libId: this.state.libId,
                itemType: this.state.itemThe,
                dataType: this.state.dataThe,
                codeOrName: this.state.codeOrNameR ? encodeURIComponent(encodeURIComponent(this.state.codeOrNameR)) : '',
                tagId: this.state.rightValueS.length > 0 ? this.state.rightValueS.join(',') : '',
                arrow: this.state.direction
            }
            this.setState({
                rightLoading: true
            })
        } else {
            objThe = {
                useDict: this.state.checked,
                ake001: this.state.ake001 ? encodeURIComponent(encodeURIComponent(this.state.ake001)) : '',
                ake002: this.state.ake002 ? encodeURIComponent(encodeURIComponent(this.state.ake002)) : '',
                aka070: this.state.aka070,
                chemicalName: this.state.chemicalName,
                libId: this.state.libId,
                itemType: this.state.itemThe,
                dataType: this.state.dataThe,
                codeOrName: this.state.codeOrNameL ? encodeURIComponent(encodeURIComponent(this.state.codeOrNameL)) : '',
                tagId: this.state.leftValueS.length > 0 ? this.state.leftValueS.join(',') : '',
                arrow: this.state.direction
            }
            this.setState({
                leftLoading: true
            })
        }
        let pagesize = this.state.direction === 'right' ? this.state.pagesizeR : this.state.pagesizeL;
        let pagerow = this.state.direction === 'right' ? this.state.pagerowR : this.state.pagerowL;
        window.Fetch(urlBefore + '/jcxx/queryMappingItems_itemMapping.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + pagesize + '&pagerow=' + pagerow + '&data=' + JSON.stringify(objThe)
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let arr = [];
                if (data.datas && data.datas.length > 0) {
                    arr = data.datas.map((item) => {
                        if (item.mapping) {
                            return item.ake001;
                        }
                    })
                }

                if (this.state.direction === 'right') {
                    this.setState({
                        countR: data.count,
                        data2: data.datas && data.datas.length > 0 ? data.datas : [],
                        selectedRowKeys: arr,
                        rightLoading: false
                    })
                } else {
                    this.setState({
                        countL: data.count,
                        data1: data.datas && data.datas.length > 0 ? data.datas : [],
                        selectedRowKeys: arr,
                        leftLoading: false
                    })
                }
            } else {
                message.error(data.message);
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    //左侧标签查询
    labelLeft = () => {
        window.Fetch(urlBefore + '/base/queryTagsByBusiType_tags.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                busiType: '0' + this.state.itemThe,
                tagName: this.state.leftValue ? encodeURIComponent(encodeURIComponent(this.state.leftValue)) : '',
                libId: sessionStorage.getItem('dzId'),
                libType: 'dz'
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                if (this.state.direction === 'right') {
                    this.setState({
                        leftValues: data.datas,
                        leftValueS: [],
                        pagesizeL: 1,
                        pagesizeR: 1
                    }, () => {
                        this.getDataBase()
                    })
                } else {
                    this.setState({
                        leftValues: data.datas,
                        leftValueS: [],
                        pagesizeL: 1
                    }, () => {
                        this.MappingItems();
                    })
                }
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    leftValueChange = (e) => {
        this.setState({
            leftValue: e.target.value
        }, () => {
            throttle(this.labelLeft, this, 300);
        })
    }
    clickVL = (id, i) => {
        let data = this.state.leftValues;
        data[i].checked = !data[i].checked;
        this.setState({
            leftValues: data
        }, () => {
            let arr = [];
            this.state.leftValues.map((item, i) => {
                if (item.checked) {
                    arr.push(item.tagId)
                }
            });
            if (this.state.direction === 'right') {
                this.setState({
                    leftValueS: arr,
                    pagesizeL: 1,
                    pagesizeR: 1
                }, () => {
                    this.getDataBase();
                })
            } else {
                this.setState({
                    leftValueS: arr,
                    pagesizeL: 1
                }, () => {
                    this.MappingItems();
                })
            }
        })
    }
    //查询项目数据
    getDataBase = () => {
        this.setState({
            leftLoading: true
        })
        window.Fetch(urlBefore + '/jcxx/queryItems_itemMapping.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesizeL + '&pagerow=' + this.state.pagerowL + '&data=' + JSON.stringify({
                libId: sessionStorage.getItem('dzId'),
                itemType: this.state.itemThe,
                dataType: this.state.dataThe,
                mapType: this.state.mapType,
                codeOrName: this.state.codeOrNameL ? encodeURIComponent(encodeURIComponent(this.state.codeOrNameL)) : '',
                tagId: this.state.leftValueS.length > 0 ? this.state.leftValueS.join(',') : '',
                arrow: "right"
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    data1: data.datas,
                    ake001: data.datas.length > 0 ? data.datas[0].ake001 : '',
                    ake002: data.datas.length > 0 ? data.datas[0].ake002 : '',
                    aka070: data.datas.length > 0 ? data.datas[0].aka070 : '',
                    chemicalName: data.datas.length > 0 ? data.datas[0].chemicalName : '',
                    leftLoading: false,
                    countL: data.count,
                }, () => {
                    if (this.state.data1.length > 0) {
                        this.state.data1[0].activeThe = true
                    }
                    this.MappingItems();
                })
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    searchLeft = (value) => {
        if (this.state.direction === 'right') {
            this.setState({
                codeOrNameL: value,
                pagesizeL: 1,
                pagesizeR: 1
            }, () => {
                this.getDataBase()
            })

        } else {
            this.setState({
                codeOrNameL: value,
                pagesizeL: 1
            }, () => {
                this.MappingItems();
            })
        }
    }
    ///////////////////////////////////
    //右侧标签查询
    labelRight = () => {
        window.Fetch(urlBefore + '/base/queryTagsByBusiType_tags.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                busiType: '0' + this.state.itemThe,
                tagName: this.state.rightValue ? encodeURIComponent(encodeURIComponent(this.state.rightValue)) : '',
                libId: this.state.libId,
                libType: 'xm'
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    rightValues: data.datas,
                    rightValueS: [],
                    pagesizeL: 1,
                    pagesizeR: 1
                }, () => {
                    if (this.state.direction === 'right') {
                        this.MappingItems();
                    } else {
                        this.getData();
                    }
                })
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    rightValueChange = (e) => {
        this.setState({
            rightValue: e.target.value
        }, () => {
            this.labelRight();
        })
    }
    clickVR = (id, i) => {
        let data = this.state.rightValues;
        data[i].checked = !data[i].checked;
        this.setState({
            rightValues: data
        }, () => {
            let arr = [];
            this.state.rightValues.map((item, i) => {
                if (item.checked) {
                    arr.push(item.tagId)
                }
                return false;
            });
            if (this.state.direction === 'right') {
                this.setState({
                    rightValueS: arr,
                    pagesizeR: 1
                }, () => {
                    this.MappingItems();
                })
            } else {
                this.setState({
                    rightValueS: arr,
                    pagesizeL: 1,
                    pagesizeR: 1
                }, () => {
                    this.getData();
                })
            }
        })
    }
    //查询数据
    getData = () => {
        this.setState({
            rightLoading: true
        })
        window.Fetch(urlBefore + '/jcxx/queryItems_itemMapping.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesizeR + '&pagerow=' + this.state.pagerowR + '&data=' + JSON.stringify({
                libId: this.state.libId,
                itemType: this.state.itemThe,
                dataType: this.state.dataThe,
                mapType: this.state.mapType,
                codeOrName: this.state.codeOrNameR ? encodeURIComponent(encodeURIComponent(this.state.codeOrNameR)) : '',
                tagId: this.state.rightValueS.length > 0 ? this.state.rightValueS.join(',') : '',
                arrow: "left"
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                if (data.result === 'success') {
                    this.setState({
                        countR: data.count,
                        data2: data.datas,
                        ake001: data.datas.length > 0 ? data.datas[0].ake001 : '',
                        ake002: data.datas.length > 0 ? data.datas[0].ake002 : '',
                        aka070: data.datas.length > 0 ? data.datas[0].aka070 : '',
                        chemicalName: data.datas.length > 0 ? data.datas[0].chemicalName : '',
                        rightLoading: false
                    }, () => {
                        if (this.state.data2.length > 0) {
                            this.state.data2[0].activeThe = true
                        }
                        this.MappingItems();
                    })
                } else {
                    message.error(data.message);
                }
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    searchRight = (value) => {
        if (this.state.direction === 'right') {
            this.setState({
                codeOrNameR: value,
                pagesizeR: 1
            }, () => {
                this.MappingItems();
            })

        } else {
            this.setState({
                codeOrNameR: value,
                pagesizeL: 1,
                pagesizeR: 1
            }, () => {
                this.getData();
            })

        }
    }
    //页码相关
    onChangeL = (pagination, filters, sorter) => {
        if (this.state.direction === 'right') {
            this.setState({
                pagesizeL: pagination.current,
                pagerowL: pagination.pageSize,
                pagesizeR: 1
            }, () => {
                this.getDataBase();
            })
        } else {
            this.setState({
                pagesizeL: pagination.current,
                pagerowL: pagination.pageSize,
            }, () => {
                this.MappingItems();
            })
        }
    }
    onChangeR = (pagination, filters, sorter) => {
        if (this.state.direction === 'left') {
            this.setState({
                pagesizeR: pagination.current,
                pagerowR: pagination.pageSize,
                pagesizeL: 1
            }, () => {
                this.getData();
            })
        } else {
            this.setState({
                pagesizeR: pagination.current,
                pagerowR: pagination.pageSize,
            }, () => {
                this.MappingItems();
            })
        }
    }
    //查询自动映射数据
    getMapDatas = ()=>{
        window.Fetch(urlBefore + '/jcxx/queryMappingResult_itemMapping.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                autoFlag:'true'
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    autoDatas:data.datas ? data.datas :[],
                    autoShow:true
                })
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    //自动映射
    mapDo =()=>{
        this.setState({
            mapLoading:true
        },()=>{
            window.Fetch(urlBefore + '/jcxx/autoMapping_itemMapping.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({
                    libId:sessionStorage.getItem('libId')
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success('自动映射完成！');
                    this.setState({
                        autoShow:false,
                        mapLoading:false
                    })
                    if (this.state.direction === 'right') {
                        this.getDataBase();
                    } else {
                        this.getData();
                    }
                }
            }).catch((error) => {
                message.error(error.message);
            })
        })
    }
    render() {
        const rowSelection1 = {
            selectedRowKeys: this.state.selectedRowKeys,
            onSelect: (record, selected, selectedRows) => {
                let url = '';
                if (selected) {
                    url = '/jcxx/insert_itemMapping.action';
                } else {
                    url = '/jcxx/delete_itemMapping.action';
                }
                window.Fetch(urlBefore + url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        ake001: record.ake001,
                        ake002: record.ake002,
                        ake003: record.ake003,
                        ake001Map: this.state.ake001,
                        ake002Map: this.state.ake002
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        if (selected) {
                            message.success('映射完成！');
                            let arr = this.state.selectedRowKeys;
                            arr.push(record.ake001);
                            this.setState({
                                selectedRowKeys: arr
                            })
                        } else {
                            let arr = this.state.selectedRowKeys;
                            let arr1 = arr.map((item) => {
                                if (item !== record.ake001) {
                                    return item;
                                }
                            })
                            this.setState({
                                selectedRowKeys: arr1
                            })
                            message.success('映射取消！');
                        }

                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            },
            onSelectAll:(selected, selectedRows, changeRows)=>{
                if(selected){
                    window.Fetch(urlBefore+'/jcxx/checkOrCancelAll_itemMapping.action',{
                        method:'POST',
                        headers:{
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            checked:selected,
                            arrow:this.state.direction,
                            itemCode:this.state.ake001,
                            itemName:this.state.ake003 ,
                            mapDatas:selectedRows
                        })
                    }).then(res=>res.json()
                    ).then(data=>{
                        if(data.result === 'success'){
                            if (this.state.direction === 'right') {
                                this.getDataBase();
                            } else {
                                this.getData();
                            }
                        }
                    }).catch(error=>{
                        message.error(error.message);
                    })
                }else{
                    window.Fetch(urlBefore+'/jcxx/checkOrCancelAll_itemMapping.action',{
                        method:'POST',
                        headers:{
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            checked:selected,
                            arrow:this.state.direction,
                            itemCode:this.state.ake001,
                            itemName:this.state.ake003 ,
                            mapDatas:changeRows
                        })
                    }).then(res=>res.json()
                    ).then(data=>{
                        if(data.result === 'success'){
                            if (this.state.direction === 'right') {
                                this.getDataBase();
                            } else {
                                this.getData();
                            }
                        }
                    }).catch(error=>{
                        message.error(error.message);
                    })
                }
            }
        };
        const rowSelection2 = {
            selectedRowKeys: this.state.selectedRowKeys,
            onSelect: (record, selected, selectedRows) => {
                let url = '';
                if (selected) {
                    url = '/jcxx/insert_itemMapping.action';
                } else {
                    url = '/jcxx/delete_itemMapping.action';
                }
                window.Fetch(urlBefore + url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        ake001: this.state.ake001,
                        ake002: this.state.ake002,
                        ake003: record.ake003,
                        ake001Map: record.ake001,
                        ake002Map: record.ake002
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        if (selected) {
                            message.success('映射完成！');
                            let arr = this.state.selectedRowKeys;
                            arr.push(record.ake001);
                            this.setState({
                                selectedRowKeys: arr
                            })
                        } else {
                            let arr = this.state.selectedRowKeys;
                            let arr1 = arr.map((item) => {
                                if (item !== record.ake001) {
                                    return item;
                                }
                            })
                            this.setState({
                                selectedRowKeys: arr1
                            })
                            message.success('映射取消！');
                        }

                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            },
            onSelectAll:(selected, selectedRows, changeRows)=>{
                console.log(selected, selectedRows, changeRows)
                if(selected){
                    window.Fetch(urlBefore+'/jcxx/checkOrCancelAll_itemMapping.action',{
                        method:'POST',
                        headers:{
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            checked:selected,
                            arrow:this.state.direction,
                            itemCode:this.state.ake001,
                            itemName:this.state.ake003 ,
                            mapDatas:selectedRows
                        })
                    }).then(res=>res.json()
                    ).then(data=>{
                        if(data.result === 'success'){
                            if (this.state.direction === 'right') {
                                this.getDataBase();
                            } else {
                                this.getData();
                            }
                        }
                    }).catch(error=>{
                        message.error(error.message);
                    })
                }else{
                    window.Fetch(urlBefore+'/jcxx/checkOrCancelAll_itemMapping.action',{
                        method:'POST',
                        headers:{
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            checked:selected,
                            arrow:this.state.direction,
                            itemCode:this.state.ake001,
                            itemName:this.state.ake003 ,
                            mapDatas:changeRows
                        })
                    }).then(res=>res.json()
                    ).then(data=>{
                        if(data.result === 'success'){
                            if (this.state.direction === 'right') {
                                this.getDataBase();
                            } else {
                                this.getData();
                            }
                        }
                    }).catch(error=>{
                        message.error(error.message);
                    })
                }

            },
        };
        // 菜单下标签
        const menu = <Menu style={{width: 170}} onClick={this.menuClick}>
            <Menu.Item key="1"> 生成服务包 </Menu.Item>
            <Menu.Item key="2"> 自动映射 </Menu.Item>
        </Menu>
        const columnsAuto =[
            {
                title: '项目类别',
                dataIndex: 'itemType',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">
                        {
                            (function(record){
                                if(record.itemType === '1'){
                                    return '药品'
                                }else if(record.itemType === '2'){
                                    return '诊疗'
                                }else if(record.itemType === '3'){
                                    return '耗材'
                                }else if(record.itemType === '4'){
                                    return '诊断'
                                }
                            })(record)
                        }
                    </div>
                )
            },{
                title: '总数',
                dataIndex: 'count',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            },{
                title: '映射数',
                dataIndex: 'mappCount',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            },{
                title: '未映射数',
                dataIndex: 'unMapCount',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }
        ]
        const columns1 = [
            {
                title: '编码',
                dataIndex: 'ake001',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '名称',
                width: 100,
                dataIndex: 'ake002',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '匹配度',
                width: 50,
                dataIndex: 'mateRate',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }
        ];
        const columns11 = [
            {
                title: '编码',
                dataIndex: 'ake001',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '名称',
                width: 100,
                dataIndex: 'ake002',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '匹配度',
                width: 100,
                dataIndex: 'mateRate',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '剂型',
                width: 80,
                dataIndex: 'aka070Name',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '化学名',
                width: 80,
                dataIndex: 'chemicalName',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }
        ];
        const columns2 = [
            {
                title: '编码',
                dataIndex: 'ake001',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '名称',
                width: 100,
                dataIndex: 'ake002',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }
        ];
        const columns22 = [
            {
                title: '编码',
                dataIndex: 'ake001',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '名称',
                width: 100,
                dataIndex: 'ake002',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '剂型',
                width: 50,
                dataIndex: 'aka070Name',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }, {
                title: '化学名',
                width: 100,
                dataIndex: 'chemicalName',
                className: 'text-left',
                render: (text, record) => (
                    <div title={text} className="textBox">{text}</div>
                )
            }
        ];
        let leftColumn = () => {
            if (this.state.direction === 'right') {
                if (this.state.itemThe === '1') {
                    return columns22;
                } else {
                    return columns2;
                }
            } else {
                if (this.state.itemThe === '1') {
                    return columns11;
                } else {
                    return columns1;
                }
            }
        }
        let RightColumn = () => {
            if (this.state.direction === 'right') {
                if (this.state.itemThe === '1') {
                    return columns11;
                } else {
                    return columns1;
                }
            } else {
                if (this.state.itemThe === '1') {
                    return columns22;
                } else {
                    return columns2;
                }
            }
        }
        const query = {
            first: this.state.first,
            second: this.state.second
        }
        return (
            <div className={style.wrap}>
                {this.state.show ? <Product show={() => { this.setState({show: false}) }} query={query}/> : ''}

                <div className={this.state.show ? 'hidden' : style.header}>
                    <BreadcrumbCustom first={this.state.first} second={this.state.second}/>
                    <div className={style.headerRight}>
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Button className={style.menuButton}>
                                菜单 <Icon type="caret-down"/>
                            </Button>
                        </Dropdown>
                        <Button className={style.refresh} onClick={this.refresh}>刷新</Button>
                    </div>
                </div>
                <div className={this.state.show ? 'hidden' : style.content}>
                    <Row>
                        <Col span={14}>
                            <ul className={style.ul}>
                                {this.state.dataTypes.map((item, i) => (
                                    <li key={item.code} onClick={() => this.dataClick(item.code)}
                                        className={`${style.li} ${this.state.dataThe === item.code ? style.active : ''}`}>
                                        <span>{item.name}</span></li>))}
                            </ul>
                        </Col>
                        <Col span={14}>
                            <ul className={style.ul}>
                                {this.state.itemTypes.map((item, i) => (
                                    <li key={item.code} onClick={() => this.itemClick(item.code)}
                                        className={`${style.li} ${this.state.itemThe === item.code ? style.active : ''}`}>
                                        <span>{item.name}</span></li>))}
                            </ul>
                        </Col>

                        <Col span={6} style={{height: 48, lineHeight: '48px'}}>
                            <Checkbox checked={this.state.checked} onChange={this.checkChange}>使用词表</Checkbox>
                        </Col>

                    </Row>
                    <Row className={style.rowBox} gutter={20}>
                        <Col className={style.leftBox} span={18}>
                            <Row>
                                <Col span={10}>
                                    <Input value={this.state.leftValue} onChange={this.leftValueChange}
                                           placeholder="请输入要查询的标签名称或疾病名称，支持通配符?/*"/>
                                    <div className={style.tagDiv}>
                                        {
                                            this.state.leftValues.map((item, i) => (
                                                <Tag style={{marginBottom: '5px'}} title={item.tagName}
                                                     color={item.checked ? 'geekblue' : ''} key={item.tagId}
                                                     onClick={() => this.clickVL(item.tagId, i)}>{subString(item.tagName)}</Tag>
                                            ))
                                        }
                                    </div>
                                </Col>
                                <Col span={4}></Col>
                                <Col span={10}>
                                    <Input value={this.state.rightValue} onChange={this.rightValueChange}
                                           placeholder="请输入要查询的标签名称或疾病名称，支持通配符?/*"/>
                                    <div className={style.tagDiv}>
                                        {
                                            this.state.rightValues.map((item, i) => (
                                                <Tag style={{marginBottom: '5px'}} title={item.tagName}
                                                     color={item.checked ? 'geekblue' : ''} key={item.tagId}
                                                     onClick={() => this.clickVR(item.tagId, i)}>{subString(item.tagName)}</Tag>
                                            ))
                                        }
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={10}>

                                    <Select value={this.state.direction === 'right' ? this.state.mapType : ''}
                                            disabled={this.state.direction !== 'right'}
                                            style={{width: '100%', marginBottom: '10px'}} allowClear={true}
                                            placeholder="请选择映射状态！" onChange={this.selectChange}>
                                        {
                                            this.state.mapTypes.map((item, i) => (
                                                <Option key={item.code} value={item.code}>{item.name}</Option>
                                            ))
                                        }
                                    </Select>
                                    <Search style={{width: '100%', marginBottom: '10px'}} placeholder="编码/名称，支持通配符?/*"
                                            onSearch={this.searchLeft}/>
                                    <Table
                                        bordered
                                        loading={this.state.leftLoading}
                                        rowClassName={(record) => {
                                            if (record.activeThe) {
                                                return `${style.columnS}`
                                            }
                                        }}
                                        columns={leftColumn()}
                                        onRowClick={this.state.direction === 'right' ? this.rowClick : () => { }}
                                        rowSelection={this.state.direction === 'right' ? null : rowSelection1}
                                        dataSource={this.state.data1}
                                        rowKey={record => record.ake001}
                                        onChange={this.onChangeL}
                                        pagination={{
                                            current: this.state.pagesizeL,
                                            showTotal: () => (`总数 ${this.state.countL} 条`),
                                            total: this.state.countL,
                                            pageSize: this.state.pagerowL,
                                            showSizeChanger: true,
                                            showQuickJumper: true,
                                        }}
                                        //scroll={{ y: 450 }}
                                    />
                                </Col>
                                <Col span={4}>
                                    <div style={{textAlign: 'center', 'marginTop': '150px'}}>
                                        <img style={{cursor: 'pointer'}} onClick={this.directionToR}
                                             className={this.state.direction === 'left' ? '' : 'hidden'}
                                             src={require('../../../style/imgs/converLeft.png')}/>
                                        <img style={{cursor: 'pointer'}} onClick={this.directionToL}
                                             className={this.state.direction === 'right' ? '' : 'hidden'}
                                             src={require('../../../style/imgs/convertRight.png')}/>
                                    </div>
                                </Col>
                                <Col span={10}>

                                    <Select value={this.state.direction === 'left' ? this.state.mapType : ''}
                                            disabled={this.state.direction === 'right'}
                                            style={{width: '100%', marginBottom: '10px'}} allowClear
                                            placeholder="请选择映射状态！" onChange={this.selectChange}>
                                        {
                                            this.state.mapTypes.map((item, i) => (
                                                <Option key={item.code} value={item.code}>{item.name}</Option>
                                            ))
                                        }
                                    </Select>
                                    <Search style={{width: '100%', marginBottom: '10px'}} placeholder="编码/名称，支持通配符?/*"
                                            onSearch={this.searchRight}/>
                                    <Table
                                        bordered
                                        columns={RightColumn()}
                                        loading={this.state.rightLoading}
                                        rowClassName={(record) => {
                                            if (record.activeThe) {
                                                return `${style.columnS}`
                                            }
                                        }}
                                        onRowClick={this.state.direction === 'left' ? this.rowClick : () => { }}
                                        rowSelection={this.state.direction === 'left' ? null : rowSelection2}
                                        dataSource={this.state.data2}
                                        rowKey={record => record.ake001}
                                        onChange={this.onChangeR}
                                        pagination={{
                                            current: this.state.pagesizeR,
                                            showTotal: () => (`总数 ${this.state.countR} 条`),
                                            total: this.state.countR,
                                            pageSize: this.state.pagerowR,
                                            showSizeChanger: true,
                                            showQuickJumper: true,
                                        }}
                                        //scroll={{ y: 450 }}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col className={style.keyBox} span={6}>
                            <KeyBox/>
                        </Col>
                    </Row>
                </div>
                <style>
                    {`
						.ant-tag-has-color{
							color: #2f54eb;
						    background: #f0f5ff;
						    border-color: #adc6ff;
						}
						.ant-table-content{
							min-height:410px;
							border-right:1px solid #ddd;
							border-left:1px solid #ddd;
							border-bottom:1px solid #ddd;
						}
                	`}
                </style>
                <Modal
                    title="自动映射"
                    visible={this.state.autoShow}
                    onCancel={()=>{this.setState({ autoShow:false })}}
                    footer={null}
                >
                    <p style={{height:30,lineHeight:'30px'}}>已自动映射信息：</p>
                    <div style={{height:152,overflow:'hidden'}}>
                        <Table
                            bordered
                            columns={columnsAuto}
                            dataSource={this.state.autoDatas}
                            rowKey={record => record.itemType}
                            pagination={false}
                        />
                    </div>
                    <p style={{height:40,lineHeight:'40px'}}>点击下面自动映射按钮，可自动映射</p>
                    <Button loading={this.state.mapLoading} style={{float:'right'}} type="primary" onClick={this.mapDo}>自动映射</Button>

                </Modal>
            </div>
        )
    }
}

class KeyBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keyData: [],//词表数据
            selectedRowKeys: [],
            nameKey: '', //搜索key
            sourse: '', //源
            dest: '' //目标
        }
    }

    componentWillMount() {
        this.keySearch()
    }

    //查询词表
    keySearch = () => {
        window.Fetch(urlBefore + '/jcxx/querylistNP_itemMappingDict.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                name: this.state.nameKey
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    keyData: data.datas
                })
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                window.Fetch(urlBefore + '/jcxx/insert_itemMappingDict.action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        source: values.sourse,
                        dest: values.dest
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        message.success('词表添加成功！');
                        this.props.form.resetFields();
                        this.keySearch();
                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            }
        })
    }
    delete = () => {
        if (this.state.selectedRowKeys.length > 0) {
            window.Fetch(urlBefore + '/jcxx/delete_itemMappingDict.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({
                    dicts: this.state.selectedRowKeys
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success('词表删除成功！');
                    this.keySearch();
                }
            }).catch((error) => {
                message.error(error.message);
            })
        } else {
            message.warning('请选择要删除词表数据！')
        }

    }

    render() {

        const rowSelection1 = {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                this.setState({
                    selectedRowKeys: selectedRows
                })
            }
        };
        const columns1 = [
            {
                title: '源',
                dataIndex: 'source',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '目标',
                dataIndex: 'dest',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ];
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                md: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                md: {span: 18},
            },
        };
        return (
            <div>
                <h3 className={style.h3}>词表（Word List）</h3>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem
                        label="源"
                        {...formItemLayout}
                        style={{marginBottom: '10px !important', textAlign: 'right'}}
                    >
                        {getFieldDecorator('sourse', {
                            rules: [{required: true, message: '请输入源!'}],
                        })(
                            <Input placeholder="请输入源"/>
                        )}
                    </FormItem>
                    <FormItem
                        label="目标"
                        {...formItemLayout}
                        style={{marginBottom: '10px !important', textAlign: 'right'}}
                    >
                        {getFieldDecorator('dest', {
                            rules: [{required: true, message: '请输入目标!'}],
                        })(
                            <Input placeholder="请输入目标"/>
                        )}
                    </FormItem>
                    <Row>
                        <Col span={24} className={style.iconBox}>
                            <Button shape="circle" icon="plus" htmlType="submit" title="添加"> </Button>
                            <Button shape="circle" icon="minus" onClick={this.delete} title="删除"/>
                            <style>
                                {`
									.ant-btn > .anticon + span, .ant-btn > span + .anticon{ margin-left:0px; }
								`}
                            </style>
                        </Col>
                    </Row>
                </Form>
                <Table
                    bordered
                    columns={columns1}
                    rowSelection={rowSelection1}
                    dataSource={this.state.keyData}
                    rowKey={record => record.mdId}
                    pagination={false}
                    scroll={{y: 450}}
                />
            </div>
        )
    }
}

KeyBox = Form.create()(KeyBox);
export default DataMap;