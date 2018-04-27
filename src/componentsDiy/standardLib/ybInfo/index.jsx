import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Dropdown, Icon, Table, Button, Modal, Menu, Row, Col, Input, message, Popconfirm, Select, Transfer} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './../ypInfo/index.less';
import SearchModule from '../../../components/modules/searchCom/search';
import Tags from '../../../components/modules/tag/tags';
import Add from './add'
import tags from './../../../utils/tags'

const Option = Select.Option;
const confirm = Modal.confirm;

class Particular extends Component {
    constructor(props) {
        super(props);
        this.state = {
            libId: sessionStorage.getItem('libId'),
            tagId: [],  //选中标签id
            condition: [],
            first: '',
            second: '',
            busiType: '13', //业务类型
            libType: sessionStorage.getItem('libType'), //库类型
            pagesize: 1,	 	//当前页
            pagerow: 15, //每页显示条数
            sortname: "",
            sortorder: "",
            count: '',
            pageShow: true,     // 页面显示状态
            addShow: false,     // 新增页面显示状态
            tableList: [],      // 表格内容
            TabModalState: false,           // 菜单下标签显示状态
            ypModalState: false,            // 菜单下关联药品显示状态
            tags: [],
            tagValue: '',
            selectedRows: [], //列表选中
            selectedRowKeys: [],
            leftBase: [],
            ypLeftData: [],
            ypRightData: [],
            AllData: [],
            selectedKeys: [],
            pagesize_16: 1,
            pagerow_16: 100,
            codeOrName: "",
            counts: 0,
            confirms:[],
            confirm:'0'
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
            second: this.props.location.query.name,
            pagerow: this.context.pageNum
        }, () => {
            this.searchEvent();
        })

        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({ "dict_code": 'confirm' })
        }).then(res=>res.json()
        ).then(data=>{
            if(data.result === 'success'){
                this.setState({
                    confirms:data.datas[0]?data.datas[0]:[]
                })
            }
        }).catch((error)=>{
            message.error(error.message);
        })
    }

    // 点击菜单
    menuClick = (e) => {
        if (e.key === '1') {
            if (this.state.selectedRows.length > 0) {
                this.setState({
                    TabModalState: true
                }, () => {
                    //获取标签
                    window.Fetch(urlBefore + '/base/queryTagsByBusiType_tags.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            busiType: this.state.busiType,
                            libId: this.state.libId,
                            libType: sessionStorage.getItem('libType')
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            this.setState({
                                tags: data.datas
                            })
                        } else {
                            message.warning(data.result)
                        }
                    }).catch(error => {
                        message.error(error.message);
                    })
                })
            } else {
                message.warning('请选择列表项！')
            }
        } else if (e.key === "2") {
            if (this.state.selectedRows.length === 1) {
                this.setState({
                    ypModalState: true,
                    pagesize_16: 1
                }, () => this.SearchYB())
            } else {
                message.warning('请选择一条医保药品信息！')
            }
        }
    }

    // 刷新页面
    refresh = () => {
        window.location.reload()
    }
    //列表搜索
    searchEvent = () => {
        //查询
        window.Fetch(urlBefore + '/jcxx/querylist_ka01Insurance.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&sortname=' + this.state.sortname + '&sortorder=' + this.state.sortorder + '&data=' + JSON.stringify({
                tagId: this.state.tagId.length > 0 ? this.state.tagId.join(',') : '',
                libType: this.state.libType,
                libId: this.state.libId,
                condition: this.state.condition.length > 0 ? this.state.condition : []
            })
        }).then((res) => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    data: data.datas,
                    count: data.count,
                    selectedRows: [],
                    selectedRowKeys: [],
                })
            } else {
                message.warning(data.result)
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //tagId选中
    tagIdChange = (arr) => {
        let stringIds = [];
        arr.forEach((item) => {
            stringIds.push(item.tagId);
        })
        this.setState({
            tagId: stringIds,
            pagesize: 1
        }, () => {
            this.searchEvent()
        })
    }
    //搜索条件改变
    conditionChange = (arr) => {
        this.setState({
            condition: arr,
            pagesize: 1
        }, () => {
            this.searchEvent()
        })
    }
    //页码相关
    onChange = (pagination, filters, sorter) => {
        this.setState({
            pagesize: pagination.current,
            pagerow: pagination.pageSize,
            sortname: sorter.field ? sorter.field : '',
            sortorder: sorter.order ? sorter.order.replace('end', '') : '',
        }, () => {
            this.searchEvent()
        })
    }
    // 点击新增
    clickAdd = () => {
        this.setState({
            pageShow: false,     // 页面显示状态
            addShow: true,     // 新增页面显示状态
            addQuery: {
                first: this.state.first,
                second: this.state.second,
                busiType: this.state.busiType,
                libType: this.state.libType,
                libId: this.state.libId
            }
        })
    }
    // 点击修改
    amend = (ybDrugId) => {
        this.setState({
            pageShow: false,     // 页面显示状态
            addShow: true,       // 新增页面显示状态
            addQuery: {
                first: this.state.first,
                second: this.state.second,
                busiType: this.state.busiType,
                libType: this.state.libType,
                libId: this.state.libId,
                ybDrugId: ybDrugId
            }
        })
    }
    back = () => {
        this.setState({
            pageShow: true,
            addShow: false
        }, () => {
            this.searchEvent()
        })
    }
    //删除
    delete = (id) => {
        window.Fetch(urlBefore + '/jcxx/delete_ka01Insurance.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'credentials': 'include',
            body: 'data=' + JSON.stringify({
                ybDrugId: id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('删除成功！');
                this.searchEvent()
            } else {
                message.warning(data.result)
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //打标签--部分
    searchChange = (value) => {
        this.setState({
            tagValue: value,
            tagIdAdd: null,
            tagNameAdd: value,
            descrAdd: ''
        })
    }
    //选中
    selectChange = (value, option) => {
        this.setState({
            tagValue: option.props.title,
            tagIdAdd: option.props.tagId,
            tagNameAdd: option.props.title,
            descrAdd: option.props.descr
        })
    }
    //打标签
    tagAdd = () => {
        window.Fetch(urlBefore + '/base/insert_tagsDataRela.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: "include",
            body: 'data=' + JSON.stringify({
                busiType: this.state.busiType,
                tagName: this.state.tagNameAdd,
                tagId: this.state.tagIdAdd,
                descr: this.state.descrAdd,
                datas: this.state.selectedRows
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    tagValue: '',
                    descrAdd: ''
                })
                this.searchEvent();
            } else {
                message.warning(data.result)
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //详情改变
    descrChange = (e) => {
        this.setState({
            descrAdd: e.target.value
        })
    }
    // 标签弹框 
    TabModaOk = (e) => {
        this.tagAdd();
        this.setState({
            TabModalState: false,
        }, () => this.searchEvent());
    }
    // 标签弹框 
    TabModalCancel = (e) => {
        this.setState({
            TabModalState: false,
        }, () => this.searchEvent());
    }
    // 查询医保信息
    SearchYB = () => {
        const ypRightData = [], AllData = []

        // 已关联
        window.Fetch(urlBefore + '/jcxx/queryBandedCode16_ka01Insurance.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: '&data=' + JSON.stringify({
                ybCode: this.state.selectedRows[0].ybCode,  // 医保编码
                ybName: this.state.selectedRows[0].ybName, // 医保名称
                ybAka070: this.state.selectedRows[0].ybAka070, // 医保剂型
            })
        }).then((res) => res.json()
        ).then(data => {
            if (data.result === 'success') {
                data.datas.forEach((datas, i) => {
                    AllData.push({
                        key: datas.bkz177,
                        title: datas.bkz177 + " -- " + datas.chemicalName + " -- " + datas.aka070Name + " -- " + datas.mateRate,
                        description: datas.bkz177 + " -- " + datas.chemicalName + " -- " + datas.aka070Name + " -- " + datas.mateRate,
                    })

                    ypRightData.push(datas.bkz177);
                })

                this.setState({
                    confirm:this.state.selectedRows[0].confirm,
                    ypRightData,
                    AllData,
                    pagesize_16: 1,
                    details: data.datas ? data.datas : []
                }, () => {
                    let rightdata = [];
                    this.state.ypRightData.forEach((ypRightData, i) => {
                        // rightdata.push(ypRightData.substring(0, ypRightData.length - 1))
                        rightdata.push(ypRightData)
                    })
                    // 未关联
                    window.Fetch(urlBefore + '/jcxx/queryUnBandCode16_ka01Insurance.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'pagesize=' + this.state.pagesize_16 + '&pagerow=' + this.state.pagerow_16 + '&data=' + JSON.stringify({
                            ybCode: this.state.selectedRows[0].ybCode,  // 医保编码
                            ybName: this.state.selectedRows[0].ybName, // 医保名称
                            ybAka070: this.state.selectedRows[0].ybAka070, // 医保剂型
                            dataId: rightdata.join(','),
                            codeOrName: this.state.codeOrName
                        })
                    }).then((res) => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            let ypLeftData = [], leftBase = [];
                            if (Number(this.state.pagesize_16) === 1) {
                                ypLeftData = this.state.AllData.concat([]);
                                leftBase = this.state.details.concat(data.datas);
                            } else {
                                ypLeftData = this.state.ypLeftData.concat([])
                                leftBase = this.state.leftBase.concat(data.datas);
                            }
                            for (let i = 0; i < data.datas.length; i++) {
                                let datas = data.datas[i];
                                ypLeftData.push({
                                    key: datas.bkz177,
                                    title: datas.bkz177 + " -- " + datas.chemicalName + " -- " + datas.aka070Name + " -- " + datas.mateRate,
                                    description: datas.bkz177 + " -- " + datas.chemicalName + " -- " + datas.aka070Name + " -- " + datas.mateRate,
                                })
                            }
                            console.log(leftBase)
                            console.log(ypLeftData)
                            this.setState({
                                counts: data.count,
                                leftBase: leftBase,
                                ypLeftData: ypLeftData
                            })
                        } else {
                            message.warning(data.result)
                        }
                    }).catch(error => {
                        message.error(error.message);
                    })
                })
            } else {
                message.warning(data.result)
            }
        }).catch(error => {
            message.error(error.message);
        })

    }

    onSearchChange = (direction, event) => {
        if (direction === "left") {
            this.setState({
                codeOrName: event.target.value,
                pagesize_16: 1,
                ypLeftData: [],
                leftBase: []
            }, () => this.SearchLeft())
        }
    }

    // 查询未关联数据
    SearchLeft = () => {
        let rightdata = [];
        this.state.ypRightData.forEach((ypRightData, i) => {
            // rightdata.push(ypRightData.substring(0, ypRightData.length - 1))
            rightdata.push(ypRightData)
        })
        // 未关联
        window.Fetch(urlBefore + '/jcxx/queryUnBandCode16_ka01Insurance.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize_16 + '&pagerow=' + this.state.pagerow_16 + '&data=' + JSON.stringify({
                ybCode: this.state.selectedRows[0].ybCode,  // 医保编码
                ybName: this.state.selectedRows[0].ybName, // 医保名称
                ybAka070: this.state.selectedRows[0].ybAka070, // 医保剂型
                dataId: rightdata.join(','),
                codeOrName: this.state.codeOrName
            })
        }).then((res) => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let ypLeftData = [], leftBase = [];
                if (Number(this.state.pagesize_16) === 1) {
                    ypLeftData = this.state.AllData.concat([]);
                    leftBase = this.state.details.concat(data.datas);
                } else {
                    ypLeftData = this.state.ypLeftData.concat([])
                    leftBase = this.state.leftBase.concat(data.datas);
                }
                for (let i = 0; i < data.datas.length; i++) {
                    let datas = data.datas[i];
                    ypLeftData.push({
                        key: datas.bkz177,
                        title: datas.bkz177 + " -- " + datas.chemicalName + " -- " + datas.aka070Name + " -- " + datas.mateRate,
                        description: datas.bkz177 + " -- " + datas.chemicalName + " -- " + datas.aka070Name + " -- " + datas.mateRate,
                    })
                }
                this.setState({
                    leftBase: leftBase,
                    ypLeftData: ypLeftData
                })
            } else {
                message.warning(data.result)
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    handleScroll = (direction, e) => {
        if (e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight && e.target.offsetHeight !== e.target.scrollHeight && direction === "left") {
            if (this.state.counts > this.state.ypLeftData.length) {
                this.setState({
                    pagesize_16: ++this.state.pagesize_16
                }, () => {
                    this.SearchLeft();
                })
            }
        }
    }
    // 关联药品
    bandCode = () => {
        const code16s = []
        this.state.ypRightData.forEach((ypRightData, i) => {
            code16s.push({
                bkz177: ypRightData
            })
        })
        window.Fetch(urlBefore + '/jcxx/bandCode16_ka01Code16YbRela.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: "include",
            body: 'data=' + JSON.stringify({
                ybCode: this.state.selectedRows[0].ybCode,
                code16s: code16s,
                ybAka070:this.state.selectedRows[0].ybAka070,
                confirm:this.state.confirm

            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('关联成功！')
                this.setState({
                    ypModalState: false,
                    codeOrName:''
                }, () => this.searchEvent());
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    // 关联药品 
    ypModaOk = (e) => {
        confirm({
            title: '是否确认已选择的关联确认状态？',
            content: '',
            onOk() {
                this.bandCode()
            },
            onCancel() {
            },
        });
    }
    // 关联药品弹框 
    ypModalCancel = (e) => {
        this.setState({
            ypModalState: false,
            codeOrName:''
        }, () => this.searchEvent());
    }

    handleChange = (nextTargetKeys, direction, moveKeys) => {
        let AllData = this.state.AllData.concat([]), details = this.state.details.concat([]), counts = this.state.counts
        if (direction === 'right') {
            console.log(this.state.leftBase)
            counts = counts - moveKeys.length;

            this.state.leftBase.forEach((base, i) => {
                moveKeys.forEach((item, j) => {
                    if (base.bkz177 === item) {
                        details.push(base);
                        AllData.push({
                            key: base.bkz177,
                            title: base.bkz177 + " -- " + base.chemicalName + " -- " + base.aka070Name + " -- " + base.mateRate,
                            description: base.bkz177 + " -- " + base.chemicalName + " -- " + base.aka070Name + " -- " + base.mateRate,
                        })
                    }
                })
            })
            console.log(AllData)
        } else {
            console.log(details.bkz177)
            counts = counts + moveKeys.length;
            moveKeys.forEach((item, j) => {
                details.forEach((detail, i) => {
                    if (detail.bkz177 === item) {
                        details.splice(i, 1);
                        i--;
                    }
                })
                AllData.forEach((detail, i) => {
                    if (detail.key === item) {
                        AllData.splice(i, 1);
                        i--;
                    }
                })
            })
        }
        this.setState({
            ypRightData: nextTargetKeys,
            AllData,
            counts,
            details
        }, () => {
            console.log(direction)
            if (this.state.leftBase.length === nextTargetKeys.length && this.state.counts > 0 && direction === 'right') {
                this.setState({
                    pagesize_16: 1
                }, () => {
                    this.SearchLeft();
                })
            }
        });
    }

    handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({
            selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys]
        });
    }
    selectEvent=(value)=>{
        this.setState({
            confirm:value
        })
    }
    render() {
        // 菜单
        const menu = <Menu style={{width: 170}} onClick={this.menuClick}>
            <Menu.Item key="1"> 标签 </Menu.Item>
            <Menu.Item key="2"> 关联药品16位码 </Menu.Item>
        </Menu>
        const columns = [
            {
                title: '操作类型',
                width: '100px',
                render: (text, record) => (
                    <div style={{color: '#007cfd'}}>
                        <span className={style.cursor} title="修改"
                              onClick={() => this.amend(record.ybDrugId)}>修改</span>&nbsp;|&nbsp;
                        <Popconfirm title="是否确认删除?" onConfirm={() => this.delete(record.ybDrugId)}>
                            <span className={style.cursor} title="删除">删除</span>
                        </Popconfirm>
                    </div>
                )
            },
            {
                title: '医保编码',
                width: '150px',
                dataIndex: 'ybCode',
                className: 'text-left',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '医保名称',
                width: '200px',
                dataIndex: 'ybName',
                className: 'text-left',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '关联状态',
                width: '100px',
                dataIndex: 'confirmName',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '剂型',
                dataIndex: 'ybAka070Name',
                width: '100px',
                sorter: true,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
                // }, {
                //     title: '用药途径',
                //     dataIndex: 'ybAka081',
                //     className: 'text-left',
                //     render: (text, record) => (
                //         <div className="textBox" title={text}>{text}</div>
                //     )
            }, {
                title: '报销类别',
                width: '100px',
                dataIndex: 'ybAka065',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '目录版本',
                dataIndex: 'cateVersion',
                width: '100px',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '政策提醒',
                dataIndex: 'tip',
                width: '100px',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作员',
                dataIndex: 'modifyUserName',
                width: '100px',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作日期',
                dataIndex: 'modifyDate',
                width: '100px',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '标签',
                render: (text, record) => (
                    <div className="textBox" title={record.tags.map((item, i) => {
                        return " " + item.tagName
                    })}
                    >{tags(record)}
                    </div>
                )
            }
        ]
        const children = this.state.tags.map((tag) => {
            return <Option key={tag.tagName} tagId={tag.tagId} descr={tag.descr}
                           title={tag.tagName}>{tag.tagName + "（" + tag.tagType + "--" + tag.createUserName + "）"}</Option>;
        });
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys,
                    selectedRows
                })
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
            }),
        };
        return (
            <div className={this.context.withScreen === 'wide' ? style.wrap : style.wrapLittle}>
                <div className={this.state.pageShow ? "" : "hidden"}>
                    <div className={style.header}>
                        <BreadcrumbCustom first={this.state.first} second={this.state.second}/>
                        <div className={style.headerRight}>
                            <Dropdown overlay={menu} trigger={['click']}>
                                <Button className={style.menuButton}>
                                    菜单 <Icon type="caret-down"/>
                                </Button>
                            </Dropdown>
                            <Button className={style.refresh} onClick={this.refresh}>刷新</Button>
                            <Button style={{width: '100px', heigth: '30px'}} type="primary"
                                    onClick={this.clickAdd}>新增</Button>
                        </div>
                    </div>
                    <div className={style.header}>
                        <Tags tagValue={this.state.tagValue} libId={this.state.libId} busiType={this.state.busiType}
                              select={this.tagIdChange}/>
                        <SearchModule busiType={this.state.busiType} search={this.conditionChange}/>
                        <div className={style.tableZone}>
                            <Table
                                bordered
                                columns={columns}
                                rowSelection={rowSelection}
                                expandedRowRender={record => <TableChild record={record} />}
                                scroll={{x: 1500}}
                                dataSource={this.state.data}
                                rowKey={record => record.ybDrugId}
                                onChange={this.onChange}
                                pagination={{
                                    current: this.state.pagesize,
                                    showTotal: () => (`总数 ${this.state.count} 条`),
                                    total: this.state.count,
                                    pageSize: this.state.pagerow,
                                    showSizeChanger: true,
                                    pageSizeOptions: this.context.withScreen === 'wide' ? ['15', '30', '45', '60'] : ['10', '20', '30', '40'],
                                    showQuickJumper: true,
                                }}
                            />
                        </div>
                    </div>
                    <Modal
                        title="标签(TAG)"
                        visible={this.state.TabModalState}
                        onCancel={this.TabModalCancel}
                        footer={[
                            <Button key="submit" type="primary" onClick={this.TabModaOk}>确定</Button>,
                            <Button key="back" onClick={this.TabModalCancel}>
                                取消
                            </Button>
                        ]}
                    >
                        <Row style={{marginBottom: '10px'}}>
                            <Col span={4}>
                                标签名称
                            </Col>
                            <Col span={20}>
                                <Select
                                    mode="combobox"
                                    style={{width: 200}}
                                    onSelect={this.selectChange}
                                    onSearch={this.searchChange}
                                    value={this.state.tagValue}
                                >
                                    {children}
                                </Select>
                            </Col>
                        </Row>
                        <Row style={{marginBottom: '10px'}}>
                            <Col span={4}>
                                标签描述
                            </Col>
                            <Col span={20}>
                                <Input value={this.state.descrAdd} onChange={this.descrChange} type="textarea"
                                       placeholder="请输入描述信息" rows={6} autosize={{minRows: 6, maxRows: 6}}/>
                            </Col>
                        </Row>
                    </Modal>
                    <Modal
                        title="关联药品16位码"
                        visible={this.state.ypModalState}
                        onCancel={this.ypModalCancel}
                        className="modal"
                        footer={[
                            <Button key="submit" type="primary" onClick={this.ypModaOk}>确定</Button>,
                            <Button key="back" onClick={this.ypModalCancel}>
                                取消
                            </Button>
                        ]}
                    >
                        <Row style={{marginBottom: '10px'}}>
                            <Col span={11}>
                                <Row>
                                    <Col span={5} style={{lineHeight: '28px', textAlign: 'right'}}>医保药品编码：</Col>
                                    <Col span={19}>
                                        <Input readOnly
                                               value={this.state.ypModalState ? this.state.selectedRows[0].ybCode : ""}/>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={2}/>
                            <Col span={11}>
                                <Row>
                                    <Col span={5} style={{lineHeight: '28px', textAlign: 'right'}}>医保药品名称：</Col>
                                    <Col span={19}>
                                        <Input readOnly
                                               value={this.state.ypModalState ? this.state.selectedRows[0].ybName : ""}/>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row style={{marginBottom: '10px'}}>
                            <Col span={11}>
                                <Row>
                                    <Col span={5} style={{lineHeight: '28px', textAlign: 'right'}}>医保药品剂型：</Col>
                                    <Col span={19}>
                                        <Input readOnly
                                               value={this.state.ypModalState ? this.state.selectedRows[0].ybAka070Name : ""}/>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={2}/>
                            <Col span={11}>
                                <Row>
                                    <Col span={5} style={{lineHeight: '28px', textAlign: 'right'}}>关联确认状态：</Col>
                                    <Col span={19}>
                                        <Select onSelect={this.selectEvent} style={{width:'100%'}} value={this.state.confirm}>
                                            {
                                                this.state.confirms.map((item,i)=>{
                                                    return <Option value={item.fact_value} key={item.fact_value}>{item.display_name}</Option>
                                                })
                                            }
                                        </Select>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        { this.state.ypModalState
                            ?
                            <Transfer
                                dataSource={this.state.ypLeftData && this.state.ypLeftData.length > 0 ? this.state.ypLeftData : []}
                                titles={['可选项目(' + this.state.counts + ')', '已关联']}
                                targetKeys={this.state.ypRightData}
                                onChange={this.handleChange}
                                onScroll={this.handleScroll}
                                showSearch
                                onSearchChange={this.onSearchChange}
                                listStyle={{
                                    width: '46%',
                                    height: 300,
                                }}
                                onSelectChange={this.handleSelectChange}
                                render={item => item.title}
                            />
                            :''
                        }
                    </Modal>
                </div>
                <div className={this.state.addShow ? style.cont : style.cont + ' hidden'}>
                    {
                        this.state.addShow ? <Add query={this.state.addQuery} back={this.back}/> : ''
                    }
                </div>
                <style>
                    {
                        `
                            .ant-modal.modal{ width: 1000px !important; height: 470px}
                            .ant-transfer-operation{ margin: 0 24px; }
                        `
                    }
                </style>
            </div>
        )
    }
}

Particular.contextTypes = {
    withScreen: PropTypes.string,
    pageNum: PropTypes.number
}

class TableChild extends Component{
    constructor(props){
        super(props);
        this.state={
            data:[],
            record:this.props.record
        }
    }
    componentWillMount(){
        // 已关联
        window.Fetch(urlBefore + '/jcxx/queryBandedCode16_ka01Insurance.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: '&data=' + JSON.stringify({
                ybCode: this.state.record.ybCode,  // 医保编码
                ybName: this.state.record.ybName, // 医保名称
                ybAka070: this.state.record.ybAka070 // 医保剂型
            })
        }).then((res) => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    data:data.datas&&data.datas.length>0 ? data.datas : []
                })
            }
        })
    }
    render(){
        const columns = [
            {
                title: '16位药品编码',
                dataIndex: 'bkz177',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },{
                title: '16位药品名称',
                dataIndex: 'ake002',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },{
                title: '剂型',
                dataIndex: 'aka070Name',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },{
                title: 'ATC5编码',
                dataIndex: 'bkz254',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },{
                title: 'ATC7编码',
                dataIndex: 'bkz255',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },{
                title: '给药途径',
                dataIndex: 'aka081',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ];
        return(
            <Table
                bordered
                columns={columns}
                dataSource={this.state.data}
                rowKey={record => record.bkz177}
                pagination={false}
            />
        )
    }
}

export default Particular;
