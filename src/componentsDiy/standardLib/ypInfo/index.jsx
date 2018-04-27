import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown,
    Icon,
    Table,
    Button,
    Breadcrumb,
    Modal,
    Menu,
    Row,
    Col,
    Input,
    message,
    Popconfirm,
    Select
} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './index.less';
import SearchModule from '../../../components/modules/searchCom/search';
import Tags from '../../../components/modules/tag/tags';
import Add from './add'
import DDD from './ddd'
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
            busiType: '01', //业务类型
            libType: sessionStorage.getItem('libType'), //库类型
            pagesize: 1,	 	//当前页
            pagerow: 15, //每页显示条数
            sortname: "",
            sortorder: "",
            count: 0,
            pageShow: true,     // 页面显示状态
            addShow: false,     // 新增页面显示状态
            DDDShow: false,     // DDD页面显示状态
            tableList: [],      // 表格内容
            TabModalState: false,           // 菜单下标签显示状态
            tags: [],
            tagValue: '',
            selectedRows: [], //列表选中
            selectedRowKeys: [],
            expandedData: {}
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
                const rowNo = this.state.pagerow * (this.state.pagesize - 1) + (this.state.ake001All.indexOf(this.state.selectedRows[0].ake001) + 1);
                this.setState({
                    DDDShow: true,
                    addShow: false,
                    pageShow: false,    // 页面显示状态
                    DDDQuery: {
                        first: this.state.first,
                        second: this.state.second,
                        drugId: this.state.selectedRows[0].drugId,
                        tagId: this.state.tagId.length > 0 ? this.state.tagId.join(',') : '',
                        libType: this.state.libType,
                        condition: this.state.condition.length > 0 ? this.state.condition : '',
                        count: this.state.count,
                        rowNo
                    }
                })
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
        window.Fetch(urlBefore + '/jcxx/querylist_ka01.action', {
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
                const ake001All = []
                data.datas ? data.datas.forEach((datas, i) => {
                    ake001All.push(datas.ake001)
                }) : ""
                this.setState({
                    ake001All,
                    data: data.datas,
                    count: data.count,
                    selectedRows: [], //列表选中
                    selectedRowKeys: [],
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
        }, () => {
            this.searchEvent()
        })
    }
    // 点击新增
    clickAdd = () => {
        this.setState({
            pageShow: false,     // 页面显示状态
            addShow: true,     // 新增页面显示状态
            DDDShow: false,
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
    amend = (drugId) => {
        this.setState({
            pageShow: false,     // 页面显示状态
            DDDShow: false,
            addShow: true,     // 新增页面显示状态
            addQuery: {
                first: this.state.first,
                second: this.state.second,
                busiType: this.state.busiType,
                libType: this.state.libType,
                libId: this.state.libId,
                drugId: drugId
            }
        })
    }
    back = () => {
        this.setState({
            pageShow: true,
            addShow: false,
            DDDShow: false,
        }, () => {
            this.searchEvent()
        })
    }
    //删除
    delete = (id) => {
        window.Fetch(urlBefore + '/jcxx/delete_ka01.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'credentials': 'include',
            body: 'data=' + JSON.stringify({
                drugId: id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('删除成功！');
                this.searchEvent()
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
            this.setState({
                tagValue: '',
                descrAdd: ''
            })
            this.searchEvent();
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
                    title: '药品编码',
                    dataIndex: 'ake001',
                    className: 'text-left',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '通用名',
                    dataIndex: 'ake002',
                    className: 'text-left',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '剂型',
                    dataIndex: 'aka070',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: 'ATC-5',
                    dataIndex: 'bkz254',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: 'ATC-7',
                    dataIndex: 'bkz255',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '中类',
                    dataIndex: 'midClass',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '小类',
                    dataIndex: 'minClass',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '给药途径',
                    dataIndex: 'aka081',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '规格',
                    dataIndex: 'aka074',
                    width: '220px',
                    className: 'text-left',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '转换比',
                    dataIndex: 'bka097',
                    className: 'text-right',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作员',
                    dataIndex: 'modifyUserName',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作日期',
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
        } else {
            return [
                {
                    title: '操作类型',
                    width: '90px',
                    render: (text, record) => (
                        <div style={{color: '#007cfd'}}>
                            <span className={style.cursor} title="修改"
                                  onClick={() => this.amend(record.drugId)}>修改</span>&nbsp;|&nbsp;
                            <Popconfirm title="是否确认删除?" onConfirm={() => this.delete(record.drugId)}>
                                <span className={style.cursor} title="删除">删除</span>
                            </Popconfirm>
                        </div>
                    )
                },
                {
                    title: '药品编码',
                    dataIndex: 'ake001',
                    className: 'text-left',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '通用名',
                    dataIndex: 'ake002',
                    className: 'text-left',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '剂型',
                    dataIndex: 'aka070',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: 'ATC-5',
                    dataIndex: 'bkz254',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: 'ATC-7',
                    dataIndex: 'bkz255',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '中类',
                    dataIndex: 'midClass',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '小类',
                    dataIndex: 'minClass',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '给药途径',
                    dataIndex: 'aka081',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '规格',
                    dataIndex: 'aka074',
                    width: '220px',
                    sorter: true,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '转换比',
                    dataIndex: 'bka097',
                    className: 'text-right',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作员',
                    dataIndex: 'modifyUserName',
                    sorter: true,
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '操作日期',
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
        }
    }

    onExpand = (expanded, record) => {
        this.setState({
            expandedData: record
        })
    }

    render() {
        // 菜单下标签
        const menu = <Menu style={{width: 170}} onClick={this.menuClick}>
            <Menu.Item key="1"> 标签 </Menu.Item>
            <Menu.Item key="2"> DDD </Menu.Item>
        </Menu>
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
        const expandedData = this.state.expandedData;
        const ybdata = expandedData.ybExt && expandedData.ybExt.length !== 0 ? expandedData.ybExt.map((ybExt, i) => {
            return <Breadcrumb>
                <Breadcrumb.Item>{ybExt.cateVersion}</Breadcrumb.Item>
                <Breadcrumb.Item>{ybExt.ybCode}</Breadcrumb.Item>
                <Breadcrumb.Item>{ybExt.ybName}</Breadcrumb.Item>
                <Breadcrumb.Item>{ybExt.ybAka070}</Breadcrumb.Item>
                <Breadcrumb.Item>{ybExt.ybAka081}</Breadcrumb.Item>
                <Breadcrumb.Item>{ybExt.ybAka065}</Breadcrumb.Item>
            </Breadcrumb>
        }) : <Breadcrumb>
            <Breadcrumb.Item>无</Breadcrumb.Item>
        </Breadcrumb>
        const expandedRowRender = <div style={{textAlign: "left", paddingLeft: '45px'}}>
            <h5>附属信息</h5>
            {
                expandedData.largeClass ?
                    <Breadcrumb>
                        <Breadcrumb.Item>{expandedData.largeClass}</Breadcrumb.Item>
                        <Breadcrumb.Item>{expandedData.midClass}</Breadcrumb.Item>
                        <Breadcrumb.Item>{expandedData.minClass}</Breadcrumb.Item>
                    </Breadcrumb>
                    : <Breadcrumb>
                        <Breadcrumb.Item>无</Breadcrumb.Item>
                    </Breadcrumb>
            }
            <h5>医保信息</h5>
            {ybdata}
            <h5>ATC</h5>
            {
                expandedData.bkz256 ?
                    <Breadcrumb>
                        <Breadcrumb.Item> ATC-5 {expandedData.bkz256}</Breadcrumb.Item>
                        <Breadcrumb.Item> ATC-7 {expandedData.bkz257}</Breadcrumb.Item>
                    </Breadcrumb>
                    : <Breadcrumb>
                        <Breadcrumb.Item>无</Breadcrumb.Item>
                    </Breadcrumb>
            }
            <h5>药品说明书</h5>
            {
                <Breadcrumb>
                    <Breadcrumb.Item> {expandedData.instrExt ? expandedData.instrExt.bkz149 : ''}</Breadcrumb.Item>
                    <Breadcrumb.Item>{expandedData.instrExt ? expandedData.instrExt.bkz150 : '无'}</Breadcrumb.Item>
                </Breadcrumb>
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
                                columns={this.columns()}
                                rowSelection={rowSelection}
                                dataSource={this.state.data}
                                rowKey={record => record.drugId}
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
                <div className={this.state.DDDShow ? style.cont : style.cont + ' hidden'}>
                    {
                        this.state.DDDShow ? <DDD query={this.state.DDDQuery} back={this.back}/> : ''
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
