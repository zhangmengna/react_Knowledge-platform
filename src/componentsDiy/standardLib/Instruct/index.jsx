import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Dropdown, Icon, Table, Button, Modal, Menu, Row, Col, Input, message, Popconfirm, Select} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './../ypInfo/index.less';
import SearchModule from '../../../components/modules/searchCom/search';
import Tags from '../../../components/modules/tag/tags';
import Add from './add'
import Code16 from './code16'
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
            busiType: '15', //业务类型
            libType: sessionStorage.getItem('libType'), //库类型
            pagesize: 1,	 	//当前页
            pagerow: 15, //每页显示条数
            sortname: "",
            sortorder: "",
            count: '',
            pageShow: true,     // 页面显示状态
            addShow: false,     // 新增页面显示状态
            code16Show: false,  // 关联code16
            tableList: [],      // 表格内容
            TabModalState: false,           // 菜单下标签显示状态
            tags: [],
            tagValue: '',
            selectedRows: [], //列表选中
            selectedRowKeys: [],
            addQuery: {},
            codeQuery: {}
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
    }

    // 菜单下标签点击
    menuClick = (e) => {
        if (e.key === '1') {
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
                        }
                    }).catch((error) => {
                        message.error(error.message);
                    });
                })
            } else {
                message.warning('请选择列表项！')
            }
        } else if (e.key === '2') {
            if (this.state.selectedRows.length === 1) {
                if (this.state.selectedRows[0].bkz149) {
                    this.setState({
                        code16Show: true,   // 关联code16
                        pageShow: false,    // 页面显示状态
                        addShow: false,     // 新增页面显示状态
                        codeQuery: {
                            first: this.state.first,
                            second: this.state.second,
                            bkz149: this.state.selectedRows[0].bkz149,
                            aka061: this.state.selectedRows[0].aka061,
                        }
                    })
                } else {
                    this.setState({
                        selectedRows: [],
                        selectedRowKeys: []
                    }, () => {
                        message.warning('请先维护说明书编码！')
                    })
                }

            } else {
                message.warning('请选择一条列表项！')
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
        window.Fetch(urlBefore + '/jcxx/querylist_ka01Instruct.action', {
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
                    data: data.datas,
                    count: data.count,
                    selectedRows: [],
                    selectedRowKeys: []
                })
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
            pageShow: false,     // 页面显示状态
            code16Show: false,  // 关联code16
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
    amend = (insId) => {
        this.setState({
            pageShow: false,     // 页面显示状态
            code16Show: false,  // 关联code16
            addShow: true,     // 新增页面显示状态
            addQuery: {
                first: this.state.first,
                second: this.state.second,
                busiType: this.state.busiType,
                libType: this.state.libType,
                libId: this.state.libId,
                insId: insId
            }
        })
    }
    back = () => {
        this.setState({
            pageShow: true,
            addShow: false,
            code16Show: false,  // 关联code16
        }, () => {
            this.searchEvent()
        })
    }
    //删除
    delete = (id) => {
        window.Fetch(urlBefore + '/jcxx/delete_ka01Instruct.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'credentials': 'include',
            body: 'data=' + JSON.stringify({
                insId: id
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
        console.log(this.state.selectedRows)
        window.Fetch(urlBefore + '/base/insert_tagsDataRela.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                // 'Content-Type': 'application/json'
            },
            credentials: "include",
            body: 'data=' + encodeURIComponent(encodeURIComponent(JSON.stringify({
                busiType: this.state.busiType,
                tagName: this.state.tagNameAdd,
                tagId: this.state.tagIdAdd,
                descr: this.state.descrAdd,
                datas: this.state.selectedRows
            })))
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

    render() {
        // 菜单下标签
        const menu = <Menu style={{width: 170}} onClick={this.menuClick}>
            <Menu.Item key="1"> 标签 </Menu.Item>
            <Menu.Item key="2"> 关联药品16位编码 </Menu.Item>
        </Menu>
        const columns = [
            {
                title: '操作类型',
                width: '90px',
                render: (text, record) => (
                    <div style={{color: '#007cfd'}}>
                        <span className={style.cursor} title="修改"
                              onClick={() => this.amend(record.insId)}>修改</span>&nbsp;|&nbsp;
                        <Popconfirm title="是否确认删除?" onConfirm={() => this.delete(record.insId)}>
                            <span className={style.cursor} title="删除">删除</span>
                        </Popconfirm>
                    </div>
                )
            },
            {
                title: '匹配code16',
                width: "120px",
                dataIndex: 'code16Flag',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '药品说明书编码',
                width: "140px",
                dataIndex: 'bkz149',
                className: 'text-left',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '药品通用名',
                width: "150px",
                dataIndex: 'aka061',
                className: 'text-left',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '商品名',
                width: "130px",
                dataIndex: 'aka062',
                sorter: true,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '规格',
                width: "200px",
                dataIndex: 'aka074',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '包装',
                dataIndex: 'ake112',
                width: "200px",
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '生产单位',
                width: "200px",
                dataIndex: 'aka098',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作员',
                width: "160px",
                dataIndex: 'modifyUserName',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作日期',
                width: "130px",
                dataIndex: 'modifyDate',
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
                            {
                                this.state.libType === 'dz' ? '' :
                                    <Dropdown overlay={menu} trigger={['click']}>
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
                                columns={columns}
                                rowSelection={rowSelection}
                                dataSource={this.state.data}
                                scroll={{x: 1600}}
                                rowKey={record => record.insId}
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
                </div>
                <div className={this.state.addShow ? style.cont : style.cont + ' hidden'}>
                    {
                        this.state.addShow ? <Add query={this.state.addQuery} back={this.back}/> : ''
                    }
                </div>
                <div className={this.state.code16Show ? style.cont : style.cont + ' hidden'}>
                    {
                        this.state.code16Show ? <Code16 query={this.state.codeQuery} back={this.back}/> : ''
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
