import React, {Component} from 'react';
import {Row, Col, Button, Input, Tag, Transfer, Select, Table, AutoComplete, Tabs, Modal, message} from 'antd';
import {urlBefore} from '../../../data.js';
import style from './../../../components/modules/addTag/add.less';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import AddTag from './../../../components/modules/addTag/addTag';
import TransferChange from './transferData';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Search = Input.Search;
const EditableCell = ({doTimes, column, value, onChange}) => {
    if (column === 'doNums') {
        return <Input value={value} style={{width: '100%'}} onChange={e => onChange(e.target.value)}/>
    } else if (column === 'doTime') {
        return (<Select style={{width: '100%'}} value={value} onChange={onChange}>
            {doTimes.map((item) => {
                return <Option key={item.fact_value} value={item.fact_value}>{item.display_name}</Option>
            })}
        </Select>)
    } else {
        return (<Select style={{width: '100%'}} value={value} onChange={onChange}>
            <Option value='0'>否</Option>
            <Option value='1'>是</Option>
        </Select>)
    }
};

class Person extends Component {
    constructor(props) {
        super(props);
        this.newTabIndex = 0;
        this.state = {
            pagerow: 100,
            treatGroupCode: '',
            treatGroupName: '',
            itemTypeCommon: '', //通用项目类别
            codeOrNameCommon: '',//通用名称


            panesPublic: [],//公共项目数据

            visible: false, //modal
            nameAdd: '',  //新增-名称
            descrAdd: '', //新增-描述
            codeAdd: '',//手术编码
            treatType: '',//治疗方式
            tagsIds: [],//右侧tag

            doTimes: [],
            doTimeFilter: [],
            three: '专属服务包',
            dataAuto: [], //分类信息
            itemTypes: [], //项目类别
            treatTypes: [], //治疗方式
            spgId: this.props.query.spgId, //-- 服务包类型id
            serPkgType: '3',//服务包类型
            panes: [],   //tabs
            activeKey: '0',
            value: '', //input的值，搜索标签
            tags: [], //标签集合
            data: [], //可选数据
            targetKeys: [], //已选中数据key数组
            tagSelect: [],  //标签条件选中
            itemTypeL: '',  //项目分类左边选中
            itemTypeR: '',  //项目分类右边选中
        }
    }

    componentWillMount() {
        //获取可选标签
        window.Fetch(urlBefore + '/base/queryPkgTags_tags.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                tagOrDiag: ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    tags: data.datas
                })
            }
        }).then(data => {
            //判断回显--获取已选数据
            if (this.props.query.spgId) {
                //查询诊断分类
                window.Fetch(urlBefore + '/jcxx/query_treatGroup.action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        aka120: this.props.query.serPkgCode
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            treatGroupCode: data.datas && data.datas[0] ? data.datas[0].treatGroupCode : '',
                            treatGroupName: data.datas && data.datas[0] ? data.datas[0].treatGroupName : ''
                        }, () => {
                            if (this.state.treatGroupCode && this.state.treatGroupName) {
                                this.getPublicData();
                            }

                        })
                    }
                })
                window.Fetch(urlBefore + '/bzpznew/queryChosedItems_servicePkg.action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/x-www-form-urlencoded"
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        spgId: this.state.spgId,
                        serPkgType: this.state.serPkgType
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        let panes = [];
                        if (data.datas && data.datas.length > 0) {
                            data.datas.forEach((item, i) => {
                                item.key = i + '';
                                panes.push(item)
                                let arr = [];
                                if (item.pkgItems && item.pkgItems.length > 0) {
                                    item.pkgItems.forEach((child) => {
                                        arr.push(child.dataId);
                                    })
                                }
                                this.setState({
                                    ['tags' + i]: this.state.tags,
                                    ['targetKeys' + i]: arr,
                                    ['dataSelect' + i]: item.pkgItems,
                                    ['pagesize' + i]: 1,
                                    ['pagerow' + i]: 100,
                                    ['itemType' + i]: '', //--项目类别 （见码表3.17）
                                    ['codeOrName' + i]: '', //--项目（分类）编码或名称
                                    ['tagId' + i]: '',
                                    ['stdScore' + i]: item.stdScore,
                                    ['fee' + i]: item.fee,
                                    ['exeCycle' + i]: item.exeCycle
                                }, () => {
                                    //获取已选的左侧未选数据
                                    this.searchSelect(i);
                                })
                            });
                            this.newTabIndex = data.datas.length;
                        }
                        this.setState({
                            serPkgName: this.props.query.serPkgName,
                            serPkgCode: this.props.query.serPkgCode,
                            panes: panes
                        })

                    }
                })

            }
            if (this.props.query.zdInfo) {
                this.setState({
                    serPkgName: this.props.query.serPkgName,
                    serPkgCode: this.props.query.serPkgCode
                })
                //查询诊断分类
                window.Fetch(urlBefore + '/jcxx/query_treatGroup.action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        aka120: this.props.query.serPkgCode
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            treatGroupCode: data.datas && data.datas[0] ? data.datas[0].treatGroupCode : '',
                            treatGroupName: data.datas && data.datas[0] ? data.datas[0].treatGroupName : ''
                        }, () => {
                            if (this.state.treatGroupCode && this.state.treatGroupName) {
                                this.getPublicData();
                            }

                        })
                    }
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
        //获取项目类别
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'AKE003,doTime,treatType'})
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let doTimeFilter = data.datas[1].map(item => {
                    return {
                        text: item.display_name,
                        value: item.fact_value
                    }
                });
                this.setState({
                    itemTypes: data.datas[0] ? data.datas[0] : [],
                    doTimes: data.datas[1] ? data.datas[1] : [],
                    treatTypes: data.datas[2] ? data.datas[2] : [],
                    doTimeFilter: doTimeFilter
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
        //初始的可选数据
        window.Fetch(urlBefore + '/bzpznew/queryItems_servicePkgItem.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=1&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                datas: '',
                itemType: '', //--项目类别 （见码表3.17）
                codeOrName: '', //--项目（分类）编码或名称
                tagId: ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    data: data.datas,
                    countL: data.count
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
        this.autoSearch()
        //
        //获取通用已选数据
        this.getCommonData();
    }

    //、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、
    //通用
    codeOrNameCommon = (value) => {
        this.setState({
            codeOrNameCommon: value
        }, () => {
            this.getCommonData();
        })
    }
    itemTypeCommon = (value) => {
        this.setState({
            itemTypeCommon: value
        }, () => {
            this.getCommonData();
        })
    }
    //获取通用数据
    getCommonData = () => {
        //获取通用已选数据
        window.Fetch(urlBefore + '/bzpznew/queryChosedItems_servicePkg.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                serPkgType: '1',
                itemType: this.state.itemTypeCommon,
                codeOrName: this.state.codeOrNameCommon ? encodeURIComponent(encodeURIComponent(this.state.codeOrNameCommon)) : ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    dataCommon: data.datas[0] && data.datas[0].pkgItems && data.datas[0].pkgItems.length > 0 ? data.datas[0].pkgItems : []
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //、、``````````````````````````````````````````````````````````````````````````````````````````````````
    //公共服务包
    getPublicData = () => {
        window.Fetch(urlBefore + '/bzpznew/queryChosedItems_servicePkg.action', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                treatGroupCode: this.state.treatGroupCode,
                serPkgType: '2'
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let panes = [];
                if (data.datas && data.datas.length > 0) {
                    data.datas.forEach((item, i) => {
                        item.key = i + '';
                        panes.push(item)
                        this.setState({
                            ['dataSelectPublic' + i]: item.pkgItems,
                            ['serPkgId' + i]: item.serPkgId
                        })
                    });
                }
                this.setState({
                    panesPublic: panes
                })

            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //公共服务包 分类改变
    itemTypeLPublicChange = (value, key) => {
        window.Fetch(urlBefore + '/bzpznew/queryChosedItems_servicePkg.action', {
            method: 'POST',
            headers: {
                'Content-Type': "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                treatGroupCode: this.state.treatGroupCode,
                itemType: value,
                serPkgType: '2',
                serPkgId: this.state['serPkgId' + key]
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                if (data.datas && data.datas.length > 0) {
                    this.setState({
                        ['dataSelectPublic' + key]: data.datas[0].pkgItems
                    })
                } else {
                    this.setState({
                        ['dataSelectPublic' + key]: []
                    })
                }
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //新增或删除回调///////////////////////////////////////////tab/////////////////////////////////
    codeChange = (e) => {//名称
        this.setState({
            codeAdd: e.target.value
        })
    }
    treatTypeChange = (value) => {//治疗方式
        this.setState({
            treatType: value
        })
    }
    nameChange = (e) => {//名称
        this.setState({
            nameAdd: e.target.value
        })
    }
    descrChange = (e) => {
        this.setState({
            descrAdd: e.target.value
        })
    }
    //确认
    handleOk = (e) => {
        if (this.state.nameAdd && this.state.treatType) {
            const panes = this.state.panes;
            let arrTreat = [];
            panes.forEach((item) => {
                arrTreat.push(item.treatType);
            })
            if (arrTreat.join(',').indexOf(this.state.treatType) === -1) {
                const activeKey = `${this.newTabIndex++}`;
                panes.push({
                    pkgName: this.state.nameAdd,
                    key: activeKey,
                    descr: this.state.descrAdd,
                    treatType: this.state.treatType,
                    opsCode: this.state.codeAdd
                });
                this.setState({
                    panes,
                    activeKey,
                    visible: false,
                    nameAdd: '',
                    descrAdd: '',
                    treatType: '',
                    codeAdd: '',
                    ['data' + activeKey]: this.state.data,
                    ['countL' + activeKey]: this.state.countL,
                    ['tags' + activeKey]: this.state.tags,
                    ['targetKeys' + activeKey]: [],
                    ['dataSelect' + activeKey]: [],
                    ['pagesize' + activeKey]: 1,
                    ['itemTypeL' + activeKey]: '1',
                    ['stdScore' + activeKey]: '',
                    ['fee' + activeKey]: '',
                    ['exeCycle' + activeKey]: '',
                });
            } else {
                message.warning('治疗方式不能重复！');
            }

        } else {
            message.warning('请输入新增内容！');
        }

    }
    //取消
    handleCancel = (e) => {
        this.setState({
            visible: false,
            nameAdd: '',
            descrAdd: '',
            treatType: '',
            codeAdd: ''
        });
    }
    showConfirm = (targetKey) => {
        let that = this;
        Modal.confirm({
            title: '是否删除该分类数据?',
            content: '',
            onOk() {
                let activeKey = that.state.activeKey;
                let lastIndex;
                that.state.panes.forEach((pane, i) => {
                    if (pane.key === targetKey) {
                        lastIndex = i - 1;
                    }
                });
                const panes = that.state.panes.filter(pane => pane.key !== targetKey);
                if (lastIndex >= 0 && activeKey === targetKey) {
                    activeKey = panes[lastIndex].key;
                } else {
                    activeKey = panes && panes.length > 0 ? panes[0].key : '';
                }
                that.setState({panes, activeKey});
            },
            onCancel() {},
        });
    }
    onEdit = (targetKey, action) => {
        this[action](targetKey);
    }
    add = () => {
        this.setState({
            visible: true,
        });
    }
    remove = (targetKey) => {
        this.showConfirm(targetKey);
    }
    tabChange = (activeKey) => {
        this.setState({activeKey})
    }
    /////////////////////////////////////////////////////////tab//////////////////////////////////////////////
    //诊断信息查询
    autoSearch = (value) => {
        window.Fetch(urlBefore + '/jcxx/querylistNP_icd10.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                codeOrName: value,
                busiType: '07'
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    dataAuto: data.datas
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    autoChange = (value) => {
        this.setState({
            serPkgName: value,
            serPkgCode:''
        }, () => {
            this.autoSearch(value);
        })
    }
    onSelect = (value, option) => { //分类选择
        this.setState({
            serPkgCode: option.props.code,
            serPkgName: option.props.codeName,
            treatGroupName: option.props.treatGroupName,
            treatGroupCode: option.props.treatGroupCode
        }, () => {
            if (this.state.treatGroupCode && this.state.treatGroupName) {
                this.getPublicData();
            }
        })
    }
    //右侧打标签
    tagsChange = (id) => {
        this.setState({
            tagsIds: id
        })
    }
    //标签查询
    tagSearch = (key) => {
        window.Fetch(urlBefore + '/base/queryPkgTags_tags.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                tagOrDiag: this.state['value' + key]
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    ['tags' + key]: data.datas,
                    ['tagSelect' + key]: [],
                    ['pagesize' + key]: 1,
                    ['data' + key]: []
                }, () => {
                    this.searchSelect(key);
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //对标签进行搜索
    valueChange = (e, key) => {
        this.setState({
            ['value' + key]: e.target.value
        }, () => {
            this.tagSearch(key);
        })
    }
    //输入项
    inputValue = (e, param, key) => {
        this.setState({
            [param + key]: e.target.value
        })
    }
    //选中标签条件
    clickVL = (id, i, key) => {
        let data = this.state['tags' + key];
        let arrData = [];
        let arr = []
        data.forEach((item) => {
            if (item.tagId === id) {
                arrData.push({
                    tagId: item.tagId,
                    tagName: item.tagName,
                    checkedThe: !item.checkedThe
                })
            } else {
                arrData.push({
                    tagId: item.tagId,
                    tagName: item.tagName,
                    checkedThe: item.checkedThe
                })
            }
        });
        arrData.forEach((item) => {
            if (item.checkedThe) {
                arr.push(item.tagId);
            }
        })
        this.setState({
            ['tagSelect' + key]: arr,
            ['tags' + key]: arrData,
            ['pagesize' + key]: 1,
            ['data' + key]: []
        }, () => {
            this.searchSelect(key);
        })
    }
    //左侧项目类别变化
    itemTypeLChange = (value, key) => {
        let arr = [];
        if (this.state['dataSelect' + key].length > 0 && value) {
            this.state['dataSelect' + key].forEach((item) => {
                if (item.itemType === value) {
                    arr.push(item.dataId)
                }
            })
        } else {
            this.state['dataSelect' + key].forEach((item) => {
                arr.push(item.dataId)
            })
        }
        this.setState({
            ['targetKeys' + key]: arr,
            ['itemTypeL' + key]: value,
            ['pagesize' + key]: 1,
            ['data' + key]: []
        }, () => {
            this.searchSelect(key);
        })
    }
    //查询可选择项
    searchSelect = (key) => {
        /////
        let arrData = [];
        if (this.state['itemTypeL' + key] && this.state['dataSelect' + key].length > 0) {
            arrData = this.state['dataSelect' + key].filter((item) => (item.itemType === this.state['itemTypeL' + key]));
        } else {
            arrData = this.state['dataSelect' + key];
        }
        window.Fetch(urlBefore + '/bzpznew/queryItems_servicePkgItem.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state['pagesize' + key] + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                datas: arrData.length > 0 ? arrData : '',
                itemType: this.state['itemTypeL' + key], //--项目类别 （见码表3.17）
                codeOrName: this.state['codeOrName' + key], //--项目（分类）编码或名称
                tagId: this.state['tagSelect' + key] && this.state['tagSelect' + key].length > 0 ? this.state['tagSelect' + key].join(',') : ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let arr = [];
                //右侧合到左侧数据中
                if (this.state['pagesize' + key] === 1) {
                    arr = arrData.concat(data.datas);
                } else {
                    arr = arrData.concat(data.datas, this.state['data' + key]);
                }
                this.setState({
                    ['data' + key]: arr,
                    ['countL' + key]: data.count
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //穿梭框移动
    handleChange = (key, nextTargetKeys, direction, moveKeys) => {
        if (direction === 'right') {  //向右侧移动
            let count = this.state['countL' + key];
            count = count - moveKeys.length;
            let arr = this.state['dataSelect' + key];
            this.state['data' + key].forEach((item, i) => {
                moveKeys.forEach((key, j) => {
                    if (item.dataId === key) {
                        item.isBase = "1";
                        item.isMust = "1";
                        item.isSpecial = "1";
                        item.isChoice = "1";
                        item.doNums = 1;
                        item.doTime = "01";
                        arr.push(item);
                    }
                })
            })
            this.setState({
                ['targetKeys' + key]: nextTargetKeys, //右侧选中key集合
                ['dataSelect' + key]: arr, //右侧key对应数据
                ['countL' + key]: count
            }, () => {
                if (this.state['data' + key].length === nextTargetKeys.length && this.state['countL' + key] > 0) {
                    this.setState({
                        pagesize: 1
                    }, () => {
                        this.searchSelect(key);
                    })
                }
            })
        } else {      //向侧左移动
            let count = this.state['countL' + key];
            count = count + moveKeys.length;
            let arr = this.state['dataSelect' + key].concat([]);
            let arrData = [], deleteArr = [], deleteString = [];
            arr.forEach((item, i) => {
                if (moveKeys.join(',').indexOf(item.dataId) === -1) {
                    arrData.push(item)
                } else {
                    if (item.cloneTgId) {
                        deleteArr.push({
                            tgId: item.dataId
                        });
                        deleteString.push(item.dataId)
                    }
                }
            })
            //左侧数据
            let arrDataLeft = [];
            this.state['data' + key].forEach((item) => {
                if (deleteString.join(',').indexOf(item.dataId) === -1) {
                    arrDataLeft.push(item)
                }
            })
            if (deleteArr && deleteArr.length > 0) {
                window.Fetch(urlBefore + '/jcxx/deleteClone_treatGroup.action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        datas: deleteArr && deleteArr.length > 0 ? deleteArr : ''
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {

                    } else {
                        message.error(data.message);
                    }
                }).catch(error => {
                    message.error(error.message);
                })
            }
            this.setState({
                ['data' + key]: arrDataLeft,
                ['targetKeys' + key]: nextTargetKeys, //右侧选中key集合
                ['dataSelect' + key]: arrData, //右侧key对应数据
                ['countL' + key]: count - deleteString.length
            })


        }
    }
    //穿梭框选中
    handleSelectChange = (key, sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({['selectedKeys' + key]: [...sourceSelectedKeys, ...targetSelectedKeys]});
    }
    //左侧搜索框输入
    onSearchChange = (key, direction, e) => {
        if (direction === 'left') {
            this.setState({
                ['codeOrName' + key]: e.target.value,
                ['pagesize' + key]: 1,
                ['data' + key]: []
            }, () => {
                this.searchSelect(key);
            })
        }
    }
    handleScroll = (key, direction, e) => {

        let heightTop = e.target.scrollTop;
        //穿梭框滚动到底部
        if (direction === 'left' && e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight && e.target.offsetHeight !== e.target.scrollHeight) {
            if (this.state['data' + key].length < this.state['countL' + key]) {
                let html = e.target;
                this.setState({
                    ['pagesize' + key]: this.state['pagesize' + key] + 1
                }, () => {
                    let arrData = [];
                    if (this.state['itemTypeL' + key] && this.state['dataSelect' + key].length > 0) {
                        arrData = this.state['dataSelect' + key].filter((item) => (item.itemType === this.state['itemTypeL' + key]));
                    } else {
                        arrData = this.state['dataSelect' + key];
                    }
                    window.Fetch(urlBefore + '/bzpznew/queryItems_servicePkgItem.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'pagesize=' + this.state['pagesize' + key] + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                            datas: arrData.length > 0 ? arrData : '',
                            itemType: this.state['itemTypeL' + key], //--项目类别 （见码表3.17）
                            codeOrName: this.state['codeOrName' + key], //--项目（分类）编码或名称
                            tagId: this.state['tagSelect' + key] && this.state['tagSelect' + key].length > 0 ? this.state['tagSelect' + key].join(',') : ''
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            let arr = [];
                            //右侧合到左侧数据中
                            /*if(this.state['pagesize'+key] === 1){
                                arr = this.state['dataSelect'+key].concat(data.datas);
                            }else{
                                arr = this.state['dataSelect'+key].concat(data.datas,this.state['data'+key]);
                            }*/
                            arr = arr.concat(data.datas, this.state['data' + key]);
                            let obj = {};
                            let result = [];
                            arr.forEach((item) => {
                                let key = item.dataId;
                                if (!obj[key]) {
                                    obj[key] = true;
                                    result.push(item);
                                }
                            })
                            this.setState({
                                ['data' + key]: result,
                                ['countL' + key]: data.count
                            }, () => {
                                html.scrollTop = heightTop;
                            })
                        }
                    }).catch(error => {
                        message.error(error.message);
                    })
                })
            }
        }
    }

    //table
    renderColumns(num, text, record, column) {
        return (
            <EditableCell
                doTimes={this.state.doTimes}
                column={column}
                value={text}
                onChange={value => this.tableHandleChange(num, value, record.dataId, column)}
            />
        );
    }

    //table
    tableHandleChange(num, value, key, column) {
        const newData = this.state['dataSelect' + num].concat([]);
        const target = newData.filter(item => key === item.dataId)[0];
        if (target) {
            target[column] = value;
            this.setState({['dataSelect' + num]: newData});
        }
    }

    submitThis = () => {
        if (this.state.serPkgCode) {
            let arr = [];
            this.state.panes.forEach((item, i) => {
                item.stdScore = this.state['stdScore' + item.key];
                item.fee = this.state['fee' + item.key];
                item.exeCycle = this.state['exeCycle' + item.key];
                arr.push(item);
                arr[i].pkgItems = this.state['dataSelect' + item.key];
            })
            window.Fetch(urlBefore + '/bzpznew/insertOrUpdate_servicePkg.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({
                    serPkgType: this.state.serPkgType,
                    spgId: this.state.spgId,
                    serPkgCode: this.state.serPkgCode,
                    serPkgName: this.state.serPkgName,
                    pkgs: arr,
                    tags: this.state.tagsIds.length > 0 ? this.state.tagsIds : ''
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    if (this.props.query.spgId) {
                        message.success('修改成功！');
                    } else {
                        message.success('新增成功！');
                    }
                    this.props.back();
                }
            }).catch(error => {
                message.error(error.message);
            })
        } else {
            message.warning('请先选择疾病类型!');
        }
    }
    //详情
    detailShow = (key, id, itemType, name, cloneTgId) => {
        this.setState({
            transferQuery: {
                id: id,
                itemType: itemType,
                cloneTgId: cloneTgId ? cloneTgId : '',
                key: key
            },
            nameDetail: name,
            visibleDetail: true
        })
    }
    cancelDetail = () => {
        this.setState({
            visibleDetail: false
        })
    }
    liSave = (key, dataId, ake001, cloneTgId, dataId_before) => {
        if (key) {
            let arr = this.state['dataSelect' + key].concat([]);
            arr.forEach((item) => {
                if (item.dataId === dataId_before) {
                    item.dataId = dataId
                    item.ake001 = ake001
                    item.cloneTgId = cloneTgId
                }
            })
            let arrKeys = [];
            arr.forEach((item) => {
                arrKeys.push(item.dataId);
            })
            this.setState({
                ['dataSelect' + key]: arr,
                ['targetKeys' + key]: arrKeys,
                ['pagesize' + key]: 1,
                visibleDetail: false
            }, () => {
                this.searchSelect(key)
            })
        } else {
            let arr = this.state.dataSelect.concat([]);
            arr.forEach((item) => {
                if (item.dataId === dataId_before) {
                    item.dataId = dataId
                    item.ake001 = ake001
                    item.cloneTgId = cloneTgId
                }
            })
            let arrKeys = [];
            arr.forEach((item) => {
                arrKeys.push(item.dataId);
            })
            this.setState({
                dataSelect: arr,
                targetKeys: arrKeys,
                pagesize: 1,
                visibleDetail: false
            }, () => {
                this.searchSelect()
            })
        }
    }

    render() {
        let classGet = function (status) {
            if (sessionStorage.getItem('libType') === 'xm') {
                if (status && status === '1') {
                    return '全部-';
                } else if (status && status === '2') {
                    return '部分-';
                } else if (status && status === '3') {
                    return '未映射-';
                }
                return '';
            }
            return '';
        }
        const columns = (key) => {
            return [
                {
                    title: '诊疗项目',
                    dataIndex: 'ake002',
                    className: 'text-left',
                    width: '15%',
                    render: (text, record) => {
                        if (record.groupFlag === '1') {
                            return <div className="textBox" title={record.ake002}><span
                                onClick={() => this.detailShow(key, record.dataId, record.itemType, record.ake002)}
                                style={{cursor: "pointer", color: 'rgb(75, 76, 157)'}}>{record.ake002}</span></div>
                        } else {
                            return <div className="textBox" title={record.ake002}>{record.ake002}</div>
                        }
                    }
                }, {
                    title: '编码',
                    className: 'text-left',
                    dataIndex: 'ake001',
                    render: (text, record) => <div className="textBox" title={record.ake001}>{record.ake001}</div>
                }, {
                    title: '基础项',
                    dataIndex: 'isBase',
                    filters: [{
                        text: '是',
                        value: '1',
                    }, {
                        text: '否',
                        value: '0',
                    }],
                    onFilter: (value, record) => record.isBase.indexOf(value) === 0,
                    render: (text, record) => this.renderColumns(key, text, record, 'isBase')
                }, {
                    title: '必须项',
                    width: 100,
                    dataIndex: 'isMust',
                    filters: [{
                        text: '是',
                        value: '1',
                    }, {
                        text: '否',
                        value: '0',
                    }],
                    onFilter: (value, record) => record.isMust.indexOf(value) === 0,
                    render: (text, record) => this.renderColumns(key, text, record, 'isMust')
                }, {
                    title: '选择项',
                    width: 100,
                    dataIndex: 'isChoice',
                    filters: [{
                        text: '是',
                        value: '1',
                    }, {
                        text: '否',
                        value: '0',
                    }],
                    onFilter: (value, record) => record.isChoice.indexOf(value) === 0,
                    render: (text, record) => this.renderColumns(key, text, record, 'isChoice')
                }, {
                    title: '特异性',
                    width: 100,
                    dataIndex: 'isSpecial',
                    filters: [{
                        text: '是',
                        value: '1',
                    }, {
                        text: '否',
                        value: '0',
                    }],
                    onFilter: (value, record) => record.isSpecial.indexOf(value) === 0,
                    render: (text, record) => this.renderColumns(key, text, record, 'isSpecial')
                }, {
                    title: '执行次数',
                    width: 100,
                    dataIndex: 'doNums',
                    render: (text, record) => this.renderColumns(key, text, record, 'doNums')
                }, {
                    title: '执行时间',
                    width: 120,
                    dataIndex: 'doTime',
                    filters: this.state.doTimeFilter,
                    onFilter: (value, record) => record.doTime.indexOf(value) === 0,
                    render: (text, record) => this.renderColumns(key, text, record, 'doTime')
                }
            ];
        };
        const columns1 = [
            {
                title: '诊疗项目',
                dataIndex: 'ake002',
                className: 'text-left',
                width: '15%',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '诊疗编码',
                dataIndex: 'ake001',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '基础项',
                width: 100,
                dataIndex: 'isBase',
                render: (text, record) => (
                    <div className="textBox" title={text === '0' ? '否' : '是'}>{text === '0' ? '否' : '是'}</div>
                )
            }, {
                title: '必须项',
                width: 100,
                dataIndex: 'isMust',
                render: (text, record) => (
                    <div className="textBox" title={text === '0' ? '否' : '是'}>{text === '0' ? '否' : '是'}</div>
                )
            }, {
                title: '选择项',
                width: 100,
                dataIndex: 'isChoice',
                render: (text, record) => (
                    <div className="textBox" title={text === '0' ? '否' : '是'}>{text === '0' ? '否' : '是'}</div>
                )
            }, {
                title: '特异性',
                width: 100,
                dataIndex: 'isSpecial',
                render: (text, record) => (
                    <div className="textBox" title={text === '0' ? '否' : '是'}>{text === '0' ? '否' : '是'}</div>
                )
            }, {
                title: '执行次数',
                width: 100,
                dataIndex: 'doNums',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '执行时间',
                width: 150,
                dataIndex: 'doTimeName',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ];
        const columnsDetail = [
            {
                title: '项目编码',
                width: 200,
                dataIndex: 'ake001',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text} </div>
                )
            }, {
                title: '项目名称',
                width: 200,
                dataIndex: 'ake002',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text} </div>
                )
            }
        ]
        return (
            <div>
                <BreadcrumbCustom first={this.props.query.first} second={this.props.query.second}
                                  three={this.state.three}/>
                <Row>
                    <Col span={18} style={{borderRight: '1px solid #ccc', padding: '20px', 'minHeight': '500px'}}>
                        <h4 className={this.props.query.zdInfo ? 'hidden' : ''}>
                            {this.props.query.spgId ? "修改" : "新增"}{this.state.three}
                        </h4>
                        <h4 className={this.props.query.zdInfo ? '' : 'hidden'}>
                            配置服务包信息
                        </h4>
                        <AutoComplete
                            disabled={!!this.props.query.spgId || this.props.query.zdInfo}  //或者诊断信息的服务包
                            //dataSource={this.state.dataAuto}
                            style={{width: '100%', marginBottom: '10px'}}
                            onSelect={this.onSelect}
                            value={this.state.serPkgName}
                            onSearch={this.autoChange}
                            placeholder="请选择疾病"
                        >
                            {
                                this.state.dataAuto.map((item, i) => (
                                    <AutoComplete.Option key={i} value={item.aka121 + '(' + item.aka120 + ')'}
                                                         code={item.aka120} codeName={item.aka121}
                                                         treatGroupCode={item.treatGroupCode}
                                                         treatGroupName={item.treatGroupName}>
                                        {item.aka121 + '(' + item.aka120 + ')'}
                                    </AutoComplete.Option>
                                ))
                            }
                        </AutoComplete>
                        <Tabs defaultActiveKey="3">
                            <TabPane tab="通用项目" key="1" style={{paddingTop: '10px'}}>
                                <Row style={{marginBottom: '10px'}}>
                                    <Col span={12}>
                                        <Search
                                            placeholder="请输入分类编码或名称！"
                                            onSearch={this.codeOrNameCommon}
                                        />
                                    </Col>
                                </Row>
                                <Row style={{marginBottom: '10px'}}>
                                    <Col span={12}>
                                        <Select allowClear placeholder="请选择项目类别" style={{width: '100%'}}
                                                onChange={this.itemTypeCommon}>
                                            {this.state['itemTypes'].map((item) => (
                                                <Option key={item.fact_value}
                                                        value={item.fact_value}>{item.display_name}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                </Row>
                                <Table bordered columns={columns1} dataSource={this.state.dataCommon}
                                       rowKey={record => record.dataId} pagination={false}/>
                            </TabPane>
                            <TabPane tab="共用项目" key="2" style={{paddingTop: '10px'}}>
                                <Row style={{marginBottom: '10px'}}>
                                    <Col span={12}>
                                        <Input value={this.state.treatGroupName} disabled/>
                                    </Col>
                                </Row>
                                <Tabs defaultActiveKey={'0'}>
                                    {
                                        this.state.panesPublic.map(pane => (
                                            <TabPane tab={pane.pkgName} key={pane.key}>
                                                <div style={{marginTop: '10px'}}>

                                                    <div style={{overflow: 'hidden', marginBottom: '10px'}}>
                                                        <div
                                                            style={{width: '40%', marginRight: '102px', float: 'left'}}>
                                                            <Select allowClear placeholder="请选择项目类别"
                                                                    style={{width: '100%'}}
                                                                    onChange={(value) => {this.itemTypeLPublicChange(value, pane.key)}}>
                                                                {this.state['itemTypes'].map((item) => (
                                                                    <Option key={item.fact_value}
                                                                            value={item.fact_value}>{item.display_name}</Option>
                                                                ))}
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <Table
                                                        dataSource={this.state['dataSelectPublic' + pane.key]}
                                                        rowKey={record => record.dataId}
                                                        columns={columns1}
                                                        pagination={false}
                                                    />
                                                </div>
                                            </TabPane>
                                        ))
                                    }
                                </Tabs>
                            </TabPane>
                            <TabPane tab="专属项目" key="3" style={{paddingTop: '10px'}}>
                                <Tabs
                                    onChange={this.tabChange}
                                    activeKey={this.state.activeKey}
                                    type="editable-card"
                                    onEdit={this.onEdit}
                                >
                                    {
                                        this.state.panes.map(pane => (
                                            <TabPane tab={pane.pkgName} key={pane.key}>
                                                <div style={{marginTop: '10px'}}>
                                                    <Row gutter={10}>
                                                        <Col span={4} style={{
                                                            'height': '28px',
                                                            'lineHeight': '28px',
                                                            marginBottom: '10px',
                                                            textAlign: 'right'
                                                        }}>
                                                            治疗费用
                                                        </Col>
                                                        <Col span={8} style={{
                                                            'height': '28px',
                                                            'lineHeight': '28px',
                                                            marginBottom: '10px'
                                                        }}>
                                                            <Input value={this.state['fee' + pane.key]}
                                                                   onChange={(e) => this.inputValue(e, 'fee', pane.key)}
                                                                   placeholder="请输入治疗费用"/>
                                                        </Col>
                                                        <Col span={4} style={{
                                                            'height': '28px',
                                                            'lineHeight': '28px',
                                                            marginBottom: '10px',
                                                            textAlign: 'right'
                                                        }}>
                                                            住院周期
                                                        </Col>
                                                        <Col span={8}>
                                                            <Input value={this.state['exeCycle' + pane.key]}
                                                                   onChange={(e) => this.inputValue(e, 'exeCycle', pane.key)}
                                                                   placeholder="请输入住院周期"/>
                                                        </Col>
                                                    </Row>
                                                    <Row gutter={10}>
                                                        <Col span={4} style={{
                                                            'height': '28px',
                                                            'lineHeight': '28px',
                                                            marginBottom: '10px',
                                                            textAlign: 'right'
                                                        }}>
                                                            治疗方式分值
                                                        </Col>
                                                        <Col span={8}>
                                                            <Input value={this.state['stdScore' + pane.key]}
                                                                   onChange={(e) => this.inputValue(e, 'stdScore', pane.key)}
                                                                   placeholder="请输入治疗方式分值"/>
                                                        </Col>
                                                    </Row>
                                                    <Input value={this.state['value' + pane.key]}
                                                           onChange={(e) => this.valueChange(e, pane.key)}
                                                           placeholder="请输入要查询的标签名称或疾病名称，支持通配符?/*"/>
                                                    <div style={{padding: '10px'}}>
                                                        {
                                                            this.state['tags' + pane.key] && this.state['tags' + pane.key].length > 0
                                                                ?
                                                                this.state['tags' + pane.key].map((item, i) => (
                                                                    <Tag style={{marginBottom: '5px'}}
                                                                         title={item.tagName}
                                                                         color={item.checkedThe ? 'geekblue' : ''}
                                                                         key={item.tagId}
                                                                         onClick={() => this.clickVL(item.tagId, i, pane.key)}>{item.tagName}</Tag>
                                                                ))
                                                                : ''
                                                        }
                                                    </div>
                                                    <div style={{overflow: 'hidden', marginBottom: '10px'}}>
                                                        <Select allowClear placeholder="请选择项目类别" style={{width: '100%'}}
                                                                onChange={(value) => {this.itemTypeLChange(value, pane.key)}}>
                                                            {this.state['itemTypes'].map((item) => (
                                                                <Option key={item.fact_value}
                                                                        value={item.fact_value}>{item.display_name}</Option>
                                                            ))}
                                                        </Select>
                                                    </div>
                                                    <style>
                                                        {`
															.myTransfer .ant-transfer-list-search-action{ display:none !important; }
														`}
                                                    </style>
                                                    <Transfer
                                                        className="myTransfer"
                                                        listStyle={{
                                                            width: '44%',
                                                            height: '300px',
                                                            marginBottom: '10px'
                                                        }}
                                                        dataSource={this.state['data' + pane.key]}
                                                        showSearch
                                                        searchPlaceholder='搜索'
                                                        titles={[`${'可选项目列表(' + this.state['countL' + pane.key] + ')'}`, '已选项目列表']}
                                                        operations={['加入右侧', '加入左侧']}
                                                        targetKeys={this.state['targetKeys' + pane.key]}
                                                        onChange={(nextTargetKeys, direction, moveKeys) => this.handleChange(pane.key, nextTargetKeys, direction, moveKeys)}
                                                        onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => this.handleSelectChange(pane.key, sourceSelectedKeys, targetSelectedKeys)}
                                                        onSearchChange={(direction, e) => this.onSearchChange(pane.key, direction, e,)}
                                                        onScroll={(direction, e) => this.handleScroll(pane.key, direction, e)}
                                                        render={item => (classGet(item.mappingStatus) + item.ake002 + '(' + item.ake001 + ')')}
                                                        rowKey={record => record.dataId}
                                                    />
                                                    <Table
                                                        scroll={{y: 300}}
                                                        dataSource={this.state['dataSelect' + pane.key]}
                                                        rowKey={record => record.dataId}
                                                        columns={columns(pane.key)}
                                                        pagination={false}
                                                    />
                                                </div>
                                            </TabPane>
                                        ))
                                    }
                                </Tabs>
                                <p className={this.state.panes && this.state.panes.length > 0 ? 'hidden' : ''}
                                   style={{height: '200px', lineHeight: '200px', textAlign: 'center'}}>请点击右侧按钮添加数据!</p>
                            </TabPane>
                        </Tabs>

                    </Col>
                    <Col span={6} style={{padding: "20px"}}>
                        <AddTag searchObj={{
                            busiType: this.props.query.service ? '07' : this.props.query.busiType, //如果是诊断信息页面过来，取服务包07
                            libId: this.props.query.libId,
                            libType: this.props.query.libType,
                            dataId: this.props.query.spgId ? this.props.query.spgId : ''
                        }}
                                tagsChange={this.tagsChange}
                        />
                    </Col>
                </Row>
                <footer>
                    <Button onClick={this.props.back}>取消</Button>
                    <Button type="primary" onClick={this.submitThis}>确定</Button>
                </footer>
                {
                    this.state.visible
                        ?
                        <Modal
                            title="新增分类"
                            visible={this.state.visible}
                            onOk={this.handleOk}
                            onCancel={this.handleCancel}
                        >
                            <Row style={{marginBottom: '10px'}}>
                                <Col span={4}>
                                    名称
                                </Col>
                                <Col span={20}>
                                    <Input placeholder="请输入分类名称！" value={this.state.nameAdd}
                                           onChange={this.nameChange}/>
                                </Col>
                            </Row>
                            <Row style={{marginBottom: '10px'}}>
                                <Col span={4}>
                                    治疗方式
                                </Col>
                                <Col span={20}>
                                    <Select placeholder="请选择治疗方式" style={{width: '100%'}}
                                            onChange={this.treatTypeChange}>
                                        {this.state['treatTypes'].map((item) => (
                                            <Option key={item.fact_value}
                                                    value={item.fact_value}>{item.display_name}</Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>
                            <Row style={{marginBottom: '10px'}}>
                                <Col span={4}>
                                    手术编码
                                </Col>
                                <Col span={20}>
                                    <Input placeholder="请输入手术编码！" value={this.state.codeAdd}
                                           onChange={this.codeChange}/>
                                </Col>
                            </Row>
                            <Row style={{marginBottom: '10px'}}>

                                <Col span={4}>
                                    描述
                                </Col>
                                <Col span={20}>
                                    <Input value={this.state.descrAdd} onChange={this.descrChange} type="textarea"
                                           placeholder="请输入描述信息" rows={6} autosize={{minRows: 6, maxRows: 6}}/>
                                </Col>
                            </Row>
                        </Modal>
                        : ''
                }
                {
                    this.state.visibleDetail
                        ?
                        <Modal
                            title={`项目明细-${this.state.nameDetail}`}
                            visible={this.state.visibleDetail}
                            onCancel={this.cancelDetail}
                            bodyStyle={{
                                height: 400
                            }}
                            width={800}
                            footer={null}
                        >
                            {
                                this.state.visibleDetail
                                    ?
                                    <TransferChange
                                        query={this.state.transferQuery}
                                        back={this.cancelDetail}
                                        liSave={this.liSave}
                                    />
                                    : ''
                            }
                        </Modal>
                        : ''
                }

            </div>
        )
    }
}

export default Person;