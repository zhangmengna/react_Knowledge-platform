import React, {Component} from 'react';
import {Row, Col, Button, Input, Tag, Transfer, Select, Table, AutoComplete, Tabs, Modal, message} from 'antd';
import {urlBefore} from '../../../data.js';
import style from './../../../components/modules/addTag/add.less';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import AddTag from './../../../components/modules/addTag/addTag';
import TransferChange from './transferData';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

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

class Public extends Component {
    constructor(props) {
        super(props);
        this.newTabIndex = 0;
        this.state = {
            visible: false, //modal
            nameAdd: '',  //新增-名称
            descrAdd: '', //新增-描述
            codeAdd: '',//手术编码
            treatType: '',//治疗方式
            tagsIds: [],//右侧tag

            doTimes: [],
            doTimeFilter: [],
            three: '共用服务包',
            dataAuto: [], //分类信息
            itemTypes: [], //项目类别
            treatTypes: [], //治疗方式
            spgId: this.props.query.spgId, //-- 服务包类型id
            serPkgType: '2',//服务包类型
            panes: [],   //tabs
            activeKey: '0',
            value: '', //input的值，搜索标签
            tags: [], //标签集合
            data: [], //可选数据
            targetKeys: [], //已选中数据key数组
            tagSelect: [],  //标签条件选中
            itemTypeL: '',  //项目分类左边选中
            itemTypeR: '',  //项目分类右边选中
            pagerow: 100
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
                                    ['data' + i]: []
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
                itemType: '1', //--项目类别 （见码表3.17）
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
                });
            } else {
                message.warning('治疗方式不能重复！');
            }

        } else {
            message.warning('请输入名称和治疗方式！');
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
        this.showConfirm(targetKey)

    }
    tabChange = (activeKey) => {
        this.setState({activeKey})
    }
    /////////////////////////////////////////////////////////tab//////////////////////////////////////////////
    //疾病分类查询
    autoSearch = (value) => {
        window.Fetch(urlBefore + '/jcxx/querylistNoBand_treatGroup.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                treatGroupName: value,
                itemType: "4"
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
            serPkgCode:'',
        }, () => {
            this.autoSearch(value);
        })
    }
    onSelect = (value, option) => { //分类选择
        this.setState({
            serPkgCode: option.props.code,
            serPkgName: option.props.codeName
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
    //选中标签条件
    clickVL = (id, i, key) => {
        let data = this.state['tags' + key];
        let arrData = [];
        let arr = []
        data.map((item) => {
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
        arrData.map((item) => {
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
        //
        let arr = [];
        if (this.state['dataSelect' + key].length > 0 && value) {
            this.state['dataSelect' + key].map((item) => {
                if (item.itemType === value) {
                    arr.push(item.dataId)
                }
            })
        } else {
            this.state['dataSelect' + key].map((item) => {
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
                    arr = arr.concat(data.datas, this.state['data' + key]);
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
    //指定到
    assignEvent = (key, moveKeys) => {
        this.setState({
            visibleAssign: true,
            dataAssign: [],
            keyAssign: key,
            moveKeysAssign: moveKeys
        })
        window.Fetch(urlBefore + '/jcxx/queryDiagsByGroup_treatGroup.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                treatGroupCode: this.state.serPkgCode
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    dataAssign: data.datas
                })
            } else {
                message.error(data.message);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    cancelAssign = () => {
        this.setState({
            visibleAssign: false,
            keyAssign: null,
            moveKeysAssign: []
        })
    }
    okAssign = () => {
        if (this.state.selectedRowsAssign && this.state.selectedRowsAssign.length > 0) {
            this.assignEventAfter(this.state.keyAssign, this.state.moveKeysAssign);
        } else {
            message.warning('请选择数据，再确认！')
        }
    }
    //制定后移到左侧
    assignEventAfter = (key, moveKeys) => {
        let nextTargetKeys = [], pkgItems = [];
        let count = this.state['countL' + key];
        count = count + moveKeys.length;
        let arr = this.state['dataSelect' + key].concat([]);
        let arrData = [], deleteArr = [], deleteString = [];
        arr.forEach((item, i) => {
            if (moveKeys.join(',').indexOf(item.dataId) === -1) {
                arrData.push(item);
                nextTargetKeys.push(item.dataId);
            } else {
                pkgItems.push(item);
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

        window.Fetch(urlBefore + '/bzpznew/saveToAppointDiags_serPkgGroup.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                treatType: this.state.panes[this.state.keyAssign].treatType,
                pkgName: this.state.panes[this.state.keyAssign].pkgName,
                descr: '',
                pkgItems: pkgItems,
                diags: this.state.selectedRowsAssign
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                if (deleteArr && deleteArr.length > 0) {
                    window.Fetch(urlBefore + '/jcxx/deleteClone_treatGroup.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            datas: deleteArr
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {

                        } else {
                            message.error(data.message);
                        }
                    })
                }
                this.setState({
                    ['data' + key]: arrDataLeft,
                    ['targetKeys' + key]: nextTargetKeys, //右侧选中key集合
                    ['dataSelect' + key]: arrData, //右侧key对应数据
                    ['countL' + key]: count - deleteString.length,
                    visibleAssign: false,
                    keyAssign: null,
                    moveKeysAssign: [],
                    ['targetSelectedKeys' + key]: []
                })
            } else {
                message.error(data.message);
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
        } else {
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
                        datas: deleteArr
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
        /*console.log(sourceSelectedKeys, targetSelectedKeys);*/
        this.setState({['targetSelectedKeys' + key]: targetSelectedKeys});
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
    //
    handleScroll = (key, direction, e) => {
        let heightTop = e.target.scrollTop;
        //穿梭框滚动到底部
        if (direction === 'left' && e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight && e.target.offsetHeight !== e.target.scrollHeight && this.state['data' + key].length < this.state['countL' + key]) {
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
            message.warning('请先选择疾病分类!');
        }
    }
    //详情
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
        console.log(this.state);
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
                    width: '15%',
                    className: 'text-left',
                    render: (text, record) => {
                        if (record.groupFlag === '1') {
                            return <div className="textBox" title={record.ake002}><span
                                onClick={() => this.detailShow(key, record.dataId, record.itemType, record.ake002, record.cloneTgId)}
                                style={{cursor: "pointer", color: 'rgb(75, 76, 157)'}}>{record.ake002}</span></div>
                        } else {
                            return <div className="textBox" title={record.ake002}>{record.ake002}</div>
                        }
                    }
                }, {
                    title: '编码',
                    dataIndex: 'ake001',
                    className: 'text-left',
                    render: (text, record) => <div className="textBox" title={record.ake001}>{record.ake001}</div>
                }, {
                    title: '基础项',
                    width: 100,
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
            ]
        }
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
        const columnsAssign = [
            {
                title: '诊断编码',
                width: 200,
                dataIndex: 'itemCode',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text} </div>
                )
            }, {
                title: '诊断名称',
                width: 200,
                className: 'text-left',
                dataIndex: 'itemName',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text} </div>
                )
            }
        ]
        const rowSelectionAssign = {
            //selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowsAssign: selectedRows
                })
            }
        };
        return (
            <div>
                <BreadcrumbCustom first={this.props.query.first} second={this.props.query.second}
                                  three={this.state.three}/>
                <Row>
                    <Col span={18} style={{borderRight: '1px solid #ccc', padding: '20px', 'minHeight': '500px'}}>
                        <h4>
                            {this.props.query.spgId ? "修改" : "新增"}{this.state.three}
                        </h4>
                        <AutoComplete
                            disabled={!!this.props.query.spgId}
                            //dataSource={this.state.dataAuto}
                            style={{width: '100%', marginBottom: '10px'}}
                            onSelect={this.onSelect}
                            onSearch={this.autoChange}
                            //onChange={this.autoChange}
                            value={this.state.serPkgName}
                            placeholder="选择疾病分类名称，提示将影响的疾病数"
                        >
                            {
                                this.state.dataAuto.map((item, i) => (
                                    <AutoComplete.Option key={i}
                                                         value={item.treatGroupName + '(' + item.treatGroupCode + ')'}
                                                         code={item.treatGroupCode} codeName={item.treatGroupName}>
                                        {item.treatGroupName + '(' + item.treatGroupCode + ')'}
                                    </AutoComplete.Option>
                                ))
                            }
                        </AutoComplete>
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
                                            <Input value={this.state['value' + pane.key]}
                                                   onChange={(e) => this.valueChange(e, pane.key)}
                                                   placeholder="请输入要查询的标签名称或疾病名称，支持通配符?/*"/>
                                            <div style={{padding: '10px'}}>
                                                {
                                                    this.state['tags' + pane.key] && this.state['tags' + pane.key].length > 0
                                                        ?
                                                        this.state['tags' + pane.key].map((item, i) => (
                                                            <Tag style={{marginBottom: '5px'}} title={item.tagName}
                                                                 color={item.checkedThe ? 'geekblue' : ''}
                                                                 key={item.tagId}
                                                                 onClick={() => this.clickVL(item.tagId, i, pane.key)}>{item.tagName}</Tag>
                                                        ))
                                                        : ''
                                                }
                                            </div>
                                            <div style={{overflow: 'hidden', marginBottom: '10px'}}>
                                                <Select value={this.state['itemTypeL' + pane.key]} allowClear
                                                        placeholder="请选择项目类别" style={{width: '100%'}}
                                                        onChange={(value) => {this.itemTypeLChange(value, pane.key)}}>
                                                    {this.state['itemTypes'].map((item) => (
                                                        <Option key={item.fact_value}
                                                                value={item.fact_value}>{item.display_name}</Option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <div style={{position: 'relative'}}>
                                                <Button
                                                    onClick={() => this.assignEvent(pane.key, this.state['targetSelectedKeys' + pane.key])}
                                                    disabled={this.state['targetSelectedKeys' + pane.key] && this.state['targetSelectedKeys' + pane.key].length > 0 ? false : true}
                                                    type="primary" size="small" style={{
                                                    width: '76px',
                                                    margin: '0px 8px 0px',
                                                    position: 'absolute',
                                                    left: '44%',
                                                    top: '183px',
                                                    zIndex: '10'
                                                }}>指定到...</Button>
                                            </div>
                                            <Transfer
                                                className="myTransfer"
                                                listStyle={{width: '44%', height: '300px', marginBottom: '10px'}}
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
                    </Col>
                    <Col span={6} style={{padding: "20px"}}>
                        <AddTag searchObj={{
                            busiType: this.props.query.busiType,
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
                {/*指定*/}
                {
                    this.state.visibleAssign ?
                        <Modal
                            title="指定诊断"
                            visible={this.state.visibleAssign}
                            onOk={this.okAssign}
                            onCancel={this.cancelAssign}
                            width={800}
                            okText="确认"
                            cancelText="取消"
                        >
                            <Table
                                scroll={{y: 300}}
                                rowSelection={rowSelectionAssign}
                                dataSource={this.state.dataAssign}
                                rowKey={record => record.dataId}
                                columns={columnsAssign}
                                pagination={false}
                            />
                        </Modal>
                        : ''
                }
                <style>
                    {`
						.myTransfer .ant-transfer-list-search-action{ display:none !important; }
						.purple{ color:purple; }
						.red{ color:red }
					`}
                </style>
            </div>
        )
    }
}

export default Public;