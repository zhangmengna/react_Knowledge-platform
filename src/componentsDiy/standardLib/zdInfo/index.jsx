import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown,
    Icon,
    Table,
    Button,
    Modal,
    Menu,
    Row,
    Col,
    Input,
    message,
    Popconfirm,
    Select,
    Breadcrumb
} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './../ypInfo/index.less';
import SearchModule from '../../../components/modules/searchCom/search';
import Tags from '../../../components/modules/tag/tags';
import Add from './add';
import Sign from './sign';
import Norm from './normInfo';
import Scene from './scene';
import Person from '../servicePackage/person_use';
import tags from './../../../utils/tags'


const Option = Select.Option;

class Particular extends Component {
    constructor(props) {
        super(props);
        this.state = {
            libId: sessionStorage.getItem('libId'),
            tagId: [],  //选中标签id
            condition: [],
            first: '',
            second: '',
            busiType: '04', //业务类型
            libType: sessionStorage.getItem('libType'), //库类型
            pagesize: 1,	 	//当前页
            pagerow: 15, //每页显示条数
            sortname: "",
            sortorder: "",
            count: '',
            pageShow: true,     // 页面显示状态
            addShow: false,     // 新增页面显示状态
            ZztzState: false,   //症状体征状态
            addQuery: {},
            ZztzQuery: {},
            tableList: [],      // 表格内容
            TabModalState: false,           // 菜单下标签显示状态
            tags: [],
            tagValue: '',
            selectedRows: [], //列表选中
            selectedRowKeys: [],
            serviceState: false,
            expandedData: {},
            fsxx: [],   // 附属信息
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
        })
        this.searchEvent();
    }

    // 菜单下标签点击
    menuClick = (e) => {
        switch (e.key) {
            case "1":
                if (this.state.selectedRows.length > 0) {
                    this.setState({
                        TabModalState: !this.state.TabModalState
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
                        }).catch((error) => {
                            message.error(error.message);
                        });
                    })
                } else {
                    message.warning('请选择列表项！')
                }
                break;
            case "2":
                if (this.state.selectedRows.length === 1) {
                    window.Fetch(urlBefore + '/bzpznew/query_serPkgGroup.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            serPkgCode: this.state.selectedRows[0].aka120,
                            serPkgType: "3"
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            if (data.datas[0]) {
                                this.setState({
                                    serviceState: true,
                                    ZztzState: false,
                                    pageShow: false,
                                    addShow: false,
                                    serviceQuery: {
                                        service: true,
                                        first: this.state.first,
                                        second: this.state.second,
                                        busiType: this.state.busiType,
                                        libType: this.state.libType,
                                        libId: this.state.libId,
                                        spgId: data.datas[0].dataId,
                                        serPkgName: this.state.selectedRows[0].aka121,
                                        serPkgCode: this.state.selectedRows[0].aka120
                                    }
                                })
                            } else {
                                this.setState({
                                    serviceState: true,
                                    ZztzState: false,
                                    pageShow: false,
                                    addShow: false,
                                    serviceQuery: {
                                        zdInfo: true,
                                        first: this.state.first,
                                        second: this.state.second,
                                        busiType: this.state.busiType,
                                        libType: this.state.libType,
                                        libId: this.state.libId,
                                        //spgId:spgId,
                                        serPkgName: this.state.selectedRows[0].aka121,
                                        serPkgCode: this.state.selectedRows[0].aka120
                                    }
                                })
                            }
                        } else {
                            message.warning(data.result);
                        }
                    }).catch((error) => {
                        message.error(error.message);
                    });

                } else {
                    message.warning('请选择一条列表项！')
                }
                break;
            case "3":
                if (this.state.selectedRows.length === 1) {
                    this.setState({
                        normState: true,
                        pageShow: false,
                        normQuery: {
                            first: this.state.first,
                            second: this.state.second,
                            busiType: this.state.busiType,
                            libType: this.state.libType,
                            libId: this.state.libId,
                            aka120: this.state.selectedRows[0].aka120,
                            aka121: this.state.selectedRows[0].aka121
                        }
                    })
                } else {
                    message.warning('请选择一条列表项！')
                }
                break;
            case "4":
                if (this.state.selectedRows.length === 1) {
                    this.setState({
                        sceneState: true,
                        pageShow: false,
                        sceneQuery: {
                            first: this.state.first,
                            second: this.state.second,
                            busiType: this.state.busiType,
                            libType: this.state.libType,
                            libId: this.state.libId,
                            aka120: this.state.selectedRows[0].aka120,
                            aka121: this.state.selectedRows[0].aka121
                        }
                    })
                } else {
                    message.warning('请选择一条列表项！')
                }
                break;
            case "5":
                if (this.state.selectedRows.length === 1) {
                    this.setState({
                        ZztzState: true,
                        pageShow: false,
                        addShow: false,
                        ZztzQuery: {
                            first: this.state.first,
                            second: this.state.second,
                            busiType: this.state.busiType,
                            libType: this.state.libType,
                            libId: this.state.libId,
                            //spgId:spgId,
                            aka120: this.state.selectedRows[0].aka120,
                            aka121: this.state.selectedRows[0].aka121
                        }
                    })
                } else {
                    message.warning('请选择一条列表项！')
                }
                break;
            default:
                break;
        }
    }
    // 刷新页面
    refresh = () => {
        window.location.reload()
    }
    //列表搜索
    searchEvent = () => {
        //查询
        window.Fetch(urlBefore + '/jcxx/querylist_icd10.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&sortname=' + this.state.sortname + '&sortorder=' + this.state.sortorder + '&data=' + JSON.stringify({
                tagId: this.state.tagId.length > 0 ? this.state.tagId.join(',') : '',
                libType: this.state.libType,
                libId: this.state.libId,
                condition: this.state.condition.length > 0 ? this.state.condition : ''
            })
        }).then((res) => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    tableList: data.datas,
                    count: data.count,
                    selectedRows: [],
                    selectedRowKeys: []
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
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
            addShow: true,     // 新增页面显示状态
            pageShow: false,     // 页面显示状态
            ZztzState: false,   // 症状体征显示状态
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
    amend = (icd10Id) => {
        this.setState({
            pageShow: false,     // 页面显示状态
            addShow: true,     // 新增页面显示状态
            ZztzState: false,   // 症状体征显示状态
            addQuery: {
                first: this.state.first,
                second: this.state.second,
                busiType: this.state.busiType,
                libType: this.state.libType,
                libId: this.state.libId,
                icd10Id: icd10Id
            }
        })
    }
    back = () => {
        this.setState({
            pageShow: true,
            addShow: false,
            serviceState: false,
            ZztzState: false,   // 症状体征显示状态
            normState: false,
            sceneState: false
        }, () => {
            this.searchEvent()
        })
    }
    //删除
    delete = (id) => {
        window.Fetch(urlBefore + '/jcxx/delete_icd10.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'credentials': 'include',
            body: 'data=' + JSON.stringify({
                icd10Id: id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('删除成功！');
                this.searchEvent()
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
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
        }).catch((error) => {
            message.error(error.message);
        });
    }
    //详情改变
    descrChange = (e) => {
        this.setState({
            descrAdd: e.target.value
        })
    }
    // 菜单下标签弹框   点击确定
    TabModaOk = (e) => {
        this.tagAdd();
        this.setState({
            TabModalState: false,
        }, () => this.searchEvent());
    }
    // 菜单下标签弹框   点击取消
    TabModalCancel = (e) => {
        this.setState({
            TabModalState: false,
        }, () => this.searchEvent());
    }
    columns = () => {
        if (this.state.libType === 'dz') {
            return [
                {
                    title: '疾病编码',
                    dataIndex: 'aka120',
                    className: 'text-right',
                    width: '90px',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '疾病名称',
                    dataIndex: 'aka121',
                    className: 'text-left',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '分类名称',
                    dataIndex: 'treatGroupName',
                    className: 'text-left',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '亚目编码',
                    dataIndex: 'suborderCode',
                    width: '90px',
                    sorter: true,
                    className: 'text-right',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '亚目名称',
                    dataIndex: 'suborderName',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    //     title: '章编码',
                    //     dataIndex: 'chapterCode',
                    //     sorter: true,
                    //     className: 'text-left',
                    //     render: (text, record) => (
                    //         <div className="textBox" title={text}>{text}</div>
                    //     )
                    // }, {
                    //     title: '章名称',
                    //     dataIndex: 'chapterName',
                    //     sorter: true,
                    //     className: 'text-left',
                    //     render: (text, record) => (
                    //         <div className="textBox" title={text}>{text}</div>
                    //     )
                    // }, {
                    //     title: '节编码',
                    //     dataIndex: 'sectionCode',
                    //     sorter: true,
                    //     className: 'text-left',
                    //     render: (text, record) => (
                    //         <div className="textBox" title={text}>{text}</div>
                    //     )
                    // }, {
                    //     title: '节名称',
                    //     dataIndex: 'sectionName',
                    //     sorter: true,
                    //     className: 'text-left',
                    //     render: (text, record) => (
                    //         <div className="textBox" title={text}>{text}</div>
                    //     )
                    // }, {
                    title: '类目编码',
                    dataIndex: 'categoryCode',
                    width: '90px',
                    className: 'text-right',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '类目名称',
                    dataIndex: 'categoryName',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作员',
                    dataIndex: 'modifyUserName',
                    width: '130px',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作日期',
                    dataIndex: 'modifyDate',
                    width: '130px',
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
        } else {
            return [
                {
                    title: '操作类型',
                    width: '100px',
                    render: (text, record) => (
                        <div style={{color: '#007cfd'}}>
                            <span className={style.cursor} title="修改"
                                  onClick={() => this.amend(record.icd10Id)}>修改</span>&nbsp;|&nbsp;
                            <Popconfirm title="是否确认删除?" onConfirm={() => this.delete(record.icd10Id)}>
                                <span className={style.cursor} title="删除">删除</span>
                            </Popconfirm>
                        </div>
                    )
                },
                {
                    title: '疾病编码',
                    dataIndex: 'aka120',
                    className: 'text-right',
                    width: '90px',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '疾病名称',
                    dataIndex: 'aka121',
                    className: 'text-left',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '分类名称',
                    dataIndex: 'treatGroupName',
                    className: 'text-left',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '亚目编码',
                    dataIndex: 'suborderCode',
                    width: '90px',
                    sorter: true,
                    className: 'text-right',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '亚目名称',
                    dataIndex: 'suborderName',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    //     title: '章编码',
                    //     dataIndex: 'chapterCode',
                    //     sorter: true,
                    //     className: 'text-left',
                    //     render: (text, record) => (
                    //         <div className="textBox" title={text}>{text}</div>
                    //     )
                    // }, {
                    //     title: '章名称',
                    //     dataIndex: 'chapterName',
                    //     sorter: true,
                    //     className: 'text-left',
                    //     render: (text, record) => (
                    //         <div className="textBox" title={text}>{text}</div>
                    //     )
                    // }, {
                    //     title: '节编码',
                    //     dataIndex: 'sectionCode',
                    //     sorter: true,
                    //     className: 'text-left',
                    //     render: (text, record) => (
                    //         <div className="textBox" title={text}>{text}</div>
                    //     )
                    // }, {
                    //     title: '节名称',
                    //     dataIndex: 'sectionName',
                    //     sorter: true,
                    //     className: 'text-left',
                    //     render: (text, record) => (
                    //         <div className="textBox" title={text}>{text}</div>
                    //     )
                    // }, {
                    title: '类目编码',
                    dataIndex: 'categoryCode',
                    width: '90px',
                    sorter: true,
                    className: 'text-right',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '类目名称',
                    dataIndex: 'categoryName',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作员',
                    dataIndex: 'modifyUserName',
                    width: '130px',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作日期',
                    dataIndex: 'modifyDate',
                    width: '130px',
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
        }
    }

    onExpand = (expanded, record) => {
        window.Fetch(urlBefore + '/bzpznew/queryExtInfo_diagExtInfo.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: "include",
            body: 'data=' + JSON.stringify({
                aka120: record.aka120
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    expandedData: data.datas,
                    fsxx: record
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });

    }

    render() {
        // 菜单下标签
        const menu = <Menu style={{width: 170}} onClick={this.menuClick}>
            <Menu.Item key="1"> 标签 </Menu.Item>
            <Menu.Item key="2"> 服务包 </Menu.Item>
            <Menu.Item key="3"> 指标组 </Menu.Item>
            <Menu.Item key="4"> 特殊场景 </Menu.Item>
            <Menu.Item key="5"> 病状体征 </Menu.Item>
        </Menu>
        const children = this.state.tags.map((tag) => {
            return <Option key={tag.tagName} tagId={tag.tagId} descr={tag.descr}
                           title={tag.tagName}>{tag.tagName + "（" + tag.tagType + "--" + tag.createUserName + "）"}</Option>;
        });
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRows: selectedRows,
                    selectedRowKeys: selectedRowKeys
                })
            }
        };
        const {fsxx, expandedData} = this.state;
        const expandedRowRender = <div style={{textAlign: "left", paddingLeft: '45px'}}>
            <h5>附属信息</h5>
            <p>
                章编码：{fsxx.chapterCode ? fsxx.chapterCode : "无"}，章名称：{fsxx.chapterName ? fsxx.chapterName : '无'}，节编码：{fsxx.sectionCode ? fsxx.sectionCode : "无"}，节名称：{fsxx.sectionName ? fsxx.sectionName : "无"}</p>
            <h5>病状体征</h5>
            <Breadcrumb>
                {
                    expandedData.symptoms ? expandedData.symptoms.map((symptoms, i) => {
                        return <Breadcrumb.Item>{symptoms.symptomCode + " | " + symptoms.symptomName}</Breadcrumb.Item>
                    }) : <Breadcrumb.Item>无</Breadcrumb.Item>
                }
            </Breadcrumb>
            <h5>特殊场景</h5>
            {
                expandedData.exceptScenes ?
                    <div>
                        <p>
                            场景条件：{expandedData.exceptScenes.conColumn + expandedData.exceptScenes.opera + expandedData.exceptScenes.condition}</p>
                        <p>执行动作：{expandedData.exceptScenes.exeAction ? expandedData.exceptScenes.exeAction : "无"} </p>
                    </div>
                    : "无"
            }
        </div>
        return (
            <div className={this.context.withScreen === 'wide' ? style.wrap : style.wrapLittle}>
                <div className={this.state.pageShow ? "" : "hidden"}>
                    <div className={style.header}>
                        <BreadcrumbCustom first={this.state.first} second={this.state.second}/>
                        <div className={style.headerRight}>
                            {
                                this.state.libType === 'dz' ? '' :
                                    <Dropdown className={this.state.libType === 'dz' ? "hidden" : ""} overlay={menu}
                                              trigger={['click']}>
                                        <Button className={style.menuButton}>
                                            菜单 <Icon type="caret-down"/>
                                        </Button>
                                    </Dropdown>
                            }
                            <Button className={style.refresh} onClick={this.refresh}>刷新</Button>
                            <Button className={this.state.libType === 'dz' ? "hidden" : ""}
                                    style={{width: '100px', heigth: '30px'}} type="primary"
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
                                columns={this.columns()}
                                rowSelection={rowSelection}
                                dataSource={this.state.tableList}
                                rowKey={record => record.icd10Id}
                                onChange={this.onChange}
                                scroll={{x: 1600}}
                                expandedRowRender={record => expandedRowRender}
                                onExpand={this.onExpand}
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
                </div>
                <div className={this.state.addShow ? style.cont : style.cont + ' hidden'}>
                    {
                        this.state.addShow ? <Add query={this.state.addQuery} back={this.back}/> : ''
                    }
                </div>
                <div className={this.state.ZztzState ? style.cont : style.cont + ' hidden'}>
                    {
                        this.state.ZztzState ? <Sign query={this.state.ZztzQuery} back={this.back}/> : ''
                    }
                </div>
                <div className={this.state.serviceState ? '' : ' hidden'}>
                    {
                        this.state.serviceState ? <Person query={this.state.serviceQuery} back={this.back}/> : ''
                    }
                </div>
                <div className={this.state.normState ? '' : ' hidden'}>
                    {
                        this.state.normState ? <Norm query={this.state.normQuery} back={this.back}/> : ''
                    }
                </div>
                <div className={this.state.sceneState ? '' : ' hidden'}>
                    {
                        this.state.sceneState ? <Scene query={this.state.sceneQuery} back={this.back}/> : ''
                    }
                </div>
            </div>
        )
    }
}

Particular.contextTypes = {
    withScreen: PropTypes.string,
    pageNum: PropTypes.number
}
export default Particular;
