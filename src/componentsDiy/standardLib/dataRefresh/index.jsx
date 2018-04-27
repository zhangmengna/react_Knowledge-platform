import React, {Component} from 'react';
import style from '../ypInfo/index.less';
import PropTypes from 'prop-types';
import {Table, message, Icon, Button, Dropdown, Menu, Modal, Radio, Row, Col, Input} from 'antd';
import {urlBefore} from '../../../data.js';
import SearchModule from '../../../components/modules/searchCom/search';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom.jsx';
import Refresh from './refresh';

const RadioGroup = Radio.Group;
const {TextArea} = Input;

class RefreshCon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            libId: sessionStorage.getItem('libId'),
            data: [],
            selectedRowKeys: [],
            selectedRowKeys: [],
            selectedRows: [],
            busiType: '17', //业务类型
            pagesize: 1,
            pagerow: 10,
            count: 0,
            condition: [],
            dataRefresh: false, //是否补充数据
            visible: false, //审核框
            valueRadio: '4',//默认审核通过

        }
    }

    componentWillMount() {
        this.setState({
            second: this.props.location.query.name,
            pagerow: this.context.pageNum
        }, () => {
            this.searchEvent();
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
    searchEvent = () => {
        window.Fetch(urlBefore + '/jcxx/querylist_supplyData.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                condition: this.state.condition
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    data: data.datas && data.datas.length > 0 ? data.datas : [],
                    count: data.count,
                    selectedRowKeys: [],
                    selectedRows: []
                })
            } else {
                message.error(data.message);
            }
        }).catch((error) => {
            message.error(error.message);
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
    refresh = (record) => {
        this.setState({
            dataRefresh: true,
            record: record
        })
    }
    // 刷新页面
    reload = () => {
        window.location.reload()
    }
    menuClick = (e) => {
        if (e.key === '1') {
            if (this.state.selectedRows && this.state.selectedRows.length > 0) {
                this.setState({
                    visible: true
                })
            } else {
                message.warning('请选择要审核数据！');
            }
        }
    }
    back = (bool) => {
        this.setState({
            dataRefresh: false,
            record: {}
        }, () => {
            if (bool) {
                this.searchEvent();
            }
        })
    }
    //审核框
    handleCancel = () => {
        this.setState({
            visible: false,
            valueRadio: '4',
            textareaValue: ''
        })
    }
    handleOk = () => {
        window.Fetch(urlBefore + '/jcxx/approveSupply_supplyData.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                libId: this.state.libId,
                supplyStatus: this.state.valueRadio,
                supplyDescr: this.state.textareaValue,
                datas: this.state.selectedRows
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    visible: false,
                    valueRadio: '4',
                    textareaValue: ''
                }, () => {
                    message.success(data.message, 3);
                    this.searchEvent();
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //
    onChangeRadio = (e) => {
        this.setState({
            valueRadio: e.target.value
        })
    }
    textareaChange = (e) => {
        this.setState({
            textareaValue: e.target.value
        })
    }

    render() {
        const columns1 = [
            {
                title: '操作',
                width: 100,
                render: (text, record) => {
                    if (record.supplyStatus !== '4') {
                        return <div style={{color: '#007cfd'}}>
                            <span className={style.cursor} title="补充数据" onClick={() => this.refresh(record)}>补充</span>
                        </div>
                    } else {
                        return '';
                    }

                }
            },
            {
                title: '项目类别',
                dataIndex: 'itemType',
                width: 100,
                className: 'text-center',
                render: (text, record) => {
                    if (record.itemType === '1') {
                        return <div className="textBox" title="药品">药品</div>;
                    } else if (record.itemType === '2') {
                        return <div className="textBox" title="诊疗">诊疗</div>;
                    } else if (record.itemType === '3') {
                        return <div className="textBox" title="耗材">耗材</div>;
                    } else if (record.itemType === '4') {
                        return <div className="textBox" title="诊断">诊断</div>;
                    }
                }

            },
            {
                title: '项目编码',
                dataIndex: 'ake001Map',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '项目名称',
                width: 150,
                dataIndex: 'ake002Map',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '补充编码',
                width: 100,
                dataIndex: 'ake001',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '补充名称',
                width: 150,
                dataIndex: 'ake002',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '状态',
                dataIndex: 'supplyStatusName',
                width: 100,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '补充人',
                dataIndex: 'supplyUserName',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '补充日期',
                dataIndex: 'supplyDate',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '审核人',
                dataIndex: 'approveUserName',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '审核日期',
                dataIndex: 'approveDate',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },

        ];
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(selectedRowKeys, selectedRows);
                this.setState({
                    selectedRowKeys,
                    selectedRows
                })
            },
            getCheckboxProps: record => ({
                disabled: record.supplyStatus === '4', // Column configuration not to be checked
            }),
        };
        // 菜单下标签
        const menu = <Menu style={{width: 170}} onClick={this.menuClick}>
            <Menu.Item key="1"> 审核 </Menu.Item>
        </Menu>
        return (
            <div className={this.context.withScreen === 'wide' ? style.wrap : style.wrapLittle}>
                <div className={this.state.dataRefresh ? 'hidden' : ''}>
                    <div className={style.header}>
                        <BreadcrumbCustom first="项目库" second={this.state.second}/>
                        <div className={style.headerRight}>
                            <Dropdown overlay={menu} trigger={['click']}>
                                <Button className={style.menuButton}>
                                    菜单 <Icon type="caret-down"/>
                                </Button>
                            </Dropdown>
                            <Button className={style.refresh} onClick={this.reload}>刷新</Button>
                        </div>
                    </div>
                    <SearchModule busiType={this.state.busiType} search={this.conditionChange}/>
                    <Table
                        bordered
                        columns={columns1}
                        rowSelection={rowSelection}
                        dataSource={this.state.data}
                        rowKey={record => record.dataId}
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
                <div className={this.state.dataRefresh ? '' : 'hidden'}>
                    {this.state.dataRefresh ? <Refresh data={this.state.record} back={this.back}/> : ''}
                </div>
                <Modal title="审核"
                       visible={this.state.visible}
                       onOk={this.handleOk}
                       onCancel={this.handleCancel}
                >
                    <Row style={{marginBottom: '10px'}}>
                        <Col span={6}>审核结果：</Col>
                        <Col span={18}>
                            <RadioGroup onChange={this.onChangeRadio} value={this.state.valueRadio}>
                                <Radio value={'3'}>未通过</Radio>
                                <Radio value={'4'}>通过</Radio>
                            </RadioGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>审核描述：</Col>
                        <Col span={12}>
                            <Input
                                type='textarea'
                                placeholder='请输入描述！'
                                autosize={{minRows: 4}}
                                value={this.state.textareaValue}
                                onChange={this.textareaChange}
                            />
                        </Col>
                    </Row>
                </Modal>
            </div>
        )
    }
}

RefreshCon.contextTypes = {
    withScreen: PropTypes.string,
    pageNum: PropTypes.number
}
export default RefreshCon;
