import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown,
    Icon,
    Tag,
    Table,
    Button,
    Modal,
    Menu,
    Row,
    Col,
    Form,
    Input,
    message,
    Popconfirm,
    AutoComplete,
    Select
} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from '../ypInfo/index.less';
import SearchModule from '../../../components/modules/searchCom/search';
import Tags from '../../../components/modules/tag/tags';
import Common from './common_use.jsx';
import Public from './public_use.jsx';
import Person from './person_use.jsx';
import subString from './../../../utils/subString'
import tags from './../../../utils/tags'

const Option = Select.Option;

class Particular extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sortname: '',
            sortorder: '',
            query: {},
            libId: sessionStorage.getItem('libId'),
            tagId: [],  //选中标签id
            condition: [],
            first: '',
            second: '',
            busiType: '07', //业务类型
            libType: sessionStorage.getItem('libType'), //库类型
            pagesize: 1,	 	//当前页
            pagerow: 15, //每页显示条数
            count: '',
            pageShow: true,     // 页面显示状态
            comStatus: false,     // 新增通用服务包页面显示状态
            publicStatus: false,   //新增共用服务包
            personStatus: false,
            //tableList: [],      // 表格内容
            TabModalState: false,           // 菜单下标签显示状态
            tags: [],
            tagValue: '',
            selectedRowKeys: [],
            selectedRows: []
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

    // 菜单下标签点击////////////////////////////////////////////////////////////////////////////////////
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
                    }).catch(error => {
                        message.error(error.message);
                    })
                })
            } else {
                message.warning('请选择列表项！')
            }

        } else if (e.key === '2') {
            this.setState({
                pageShow: false,
                comStatus: true,
                query: {
                    first: this.state.first,
                    second: this.state.second,
                    busiType: this.state.busiType,
                    libType: this.state.libType,
                    libId: this.state.libId,
                    spgId: ''
                }
            })
        } else if (e.key === '3') {
            this.setState({
                pageShow: false,
                publicStatus: true,
                query: {
                    first: this.state.first,
                    second: this.state.second,
                    busiType: this.state.busiType,
                    libType: this.state.libType,
                    libId: this.state.libId,
                    spgId: ''
                }
            })
        }
    }
    // 刷新页面
    refresh = () => {
        window.location.reload()
    }
    //列表搜索
    searchEvent = () => {
        //查询
        window.Fetch(urlBefore + '/bzpznew/querylist_serPkgGroup.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&sortname=' + this.state.sortname + '&sortorder=' + this.state.sortorder + '&data=' + JSON.stringify({
                tagId: this.state.tagId.length > 0 ? this.state.tagId.join(',') : '',
                libType: this.state.libType,
                condition: this.state.condition.length > 0 ? this.state.condition : '',
                libId: this.state.libId
            })
        }).then((res) => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    data: data.datas,
                    count: data.count,
                    selectedRowKeys: [],
                    selectedRows: []
                })
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
            //filters: filters
        }, () => {
            this.searchEvent()
        })
    }
    // 点击新增
    clickAdd = () => {
        this.setState({
            pageShow: false,
            personStatus: true,
            query: {
                first: this.state.first,
                second: this.state.second,
                busiType: this.state.busiType,
                libType: this.state.libType,
                libId: this.state.libId,
                spgId: ''
            }
        })
    }
    // 点击修改
    amend = (spgId, serPkgType, itemType, serPkgName, serPkgCode) => {
        if (serPkgType === '2') {
            this.setState({
                pageShow: false,
                publicStatus: true,
                query: {
                    first: this.state.first,
                    second: this.state.second,
                    busiType: this.state.busiType,
                    libType: this.state.libType,
                    libId: this.state.libId,
                    spgId: spgId,
                    itemType: itemType,
                    serPkgName: serPkgName,
                    serPkgCode: serPkgCode
                }
            })
        } else if (serPkgType === '1') {
            this.setState({
                pageShow: false,
                comStatus: true,
                query: {
                    first: this.state.first,
                    second: this.state.second,
                    busiType: this.state.busiType,
                    libType: this.state.libType,
                    libId: this.state.libId,
                    spgId: spgId,
                    itemType: itemType
                }
            })
        } else if (serPkgType === '3') {
            this.setState({
                pageShow: false,
                personStatus: true,
                query: {
                    first: this.state.first,
                    second: this.state.second,
                    busiType: this.state.busiType,
                    libType: this.state.libType,
                    libId: this.state.libId,
                    spgId: spgId,
                    itemType: itemType,
                    serPkgName: serPkgName,
                    serPkgCode: serPkgCode
                }
            })
        }
    }
    back = () => {
        this.setState({
            pageShow: true,
            comStatus: false,
            publicStatus: false,
            personStatus: false
        }, () => {
            this.searchEvent();
        })
    }
    //删除
    delete = (id) => {
        window.Fetch(urlBefore + '/bzpznew/delete_serPkgGroup.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'credentials': 'include',
            body: 'data=' + JSON.stringify({
                spgId: id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('删除成功！');
                this.searchEvent()
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
        let descr = '';
        this.state.tags.forEach((item) => {
            if (item.tagId === value) {
                descr = item.descr
            }
        })
        this.setState({
            tagValue: option.props.title,
            tagIdAdd: option.props.tagId,
            tagNameAdd: option.props.title,
            descrAdd: descr
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
                    title: '编码',
                    dataIndex: 'serPkgCode',
                    sorter: true,
                    width: '100px',
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '名称',
                    sorter: true,
                    className: 'text-left',
                    dataIndex: 'serPkgName',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '类型',
                    sorter: true,
                    width: '100px',
                    className: 'text-left',
                    dataIndex: 'serPkgTypecn',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '项目数量',
                    dataIndex: 'itemNums',
                    className: 'text-left',
                    width: '100px',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作员',
                    dataIndex: 'modifyUserName',
                    sorter: true,
                    width: '100px',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作日期',
                    dataIndex: 'modifyDate',
                    sorter: true,
                    width: '100px',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '标签',
                    className: 'text-left',
                    width: '100px',
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
                    sorter: true,
                    width: '100px',
                    render: (text, record) => (
                        <div style={{color: '#007cfd'}}>
                            <span className={style.cursor}
                                  onClick={() => this.amend(record.spgId, record.serPkgType, record.itemType, record.serPkgName, record.serPkgCode)}>修改</span>&nbsp;
                            |&nbsp;
                            <Popconfirm title="是否确认删除?" className={style.cursor}
                                        onConfirm={() => this.delete(record.spgId)}>
                                删除
                            </Popconfirm>
                        </div>
                    )
                },
                {
                    title: '编码',
                    dataIndex: 'serPkgCode',
                    sorter: true,
                    width: '100px',
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '名称',
                    sorter: true,
                    className: 'text-left',
                    dataIndex: 'serPkgName',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '类型',
                    sorter: true,
                    width: '100px',
                    className: 'text-left',
                    dataIndex: 'serPkgTypecn',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '项目数量',
                    dataIndex: 'itemNums',
                    sorter: true,
                    width: '100px',
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作员',
                    dataIndex: 'modifyUserName',
                    sorter: true,
                    width: '100px',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作日期',
                    dataIndex: 'modifyDate',
                    sorter: true,
                    width: '100px',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '标签',
                    className: 'text-left',
                    width: '100px',
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

    render() {

        // 菜单下标签
        const menu = <Menu style={{width: 170}} onClick={this.menuClick}>
            <Menu.Item key="1"> 标签 </Menu.Item>
            <Menu.Item key="2"> 通用服务包 </Menu.Item>
            <Menu.Item key="3"> 共用服务包 </Menu.Item>
        </Menu>


        const children = this.state.tags.map((tag) => {
            return <Option key={tag.tagName} tagId={tag.tagId} title={tag.tagName}>{tag.tagName}</Option>;
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
        return (
            <div className={this.context.withScreen === 'wide' ? style.wrap : style.wrapLittle}>
                <div className={this.state.pageShow ? '' : 'hidden'}>
                    <div className={style.header}>
                        <BreadcrumbCustom first={this.state.first} second={this.state.second}/>
                        <div className={style.headerRight}>
                            {
                                this.state.libType === 'dz'
                                    ?
                                    ''
                                    :
                                    <Dropdown overlay={menu} trigger={['click']}>
                                        <Button className={style.menuButton}>
                                            菜单 <Icon type="caret-down"/>
                                        </Button>
                                    </Dropdown>
                            }

                            <Button className={style.refresh} onClick={this.refresh}>刷新</Button>
                            <Button className={this.state.libType === 'dz' ? 'hidden' : ''}
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
                                dataSource={this.state.data}
                                rowKey={record => record.spgId}
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
                <div className={this.state.comStatus ? '' : ' hidden'}>
                    {
                        this.state.comStatus ? <Common query={this.state.query} back={this.back}/> : ''
                    }
                </div>
                <div className={this.state.publicStatus ? '' : ' hidden'}>
                    {
                        this.state.publicStatus ? <Public query={this.state.query} back={this.back}/> : ''
                    }
                </div>
                <div className={this.state.personStatus ? '' : ' hidden'}>
                    {
                        this.state.personStatus ? <Person query={this.state.query} back={this.back}/> : ''
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
