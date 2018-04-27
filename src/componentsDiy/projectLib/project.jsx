// 统计
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Table, Button, Input, Row, Col, Form, Select, message, Checkbox, Tabs} from 'antd';
import style from './project.less';
import {hashHistory} from 'react-router';
import {urlBefore} from '../../data';

const Search = Input.Search;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

class Project extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            genre: '项目库',
            libNameKey: '',  //项目库查询 关键词
            pagesize: 1,	 	//当前页
            pagerow: 15, //每页显示条数
            sortname: "",
            sortorder: "",
            count: '',
            data: [],
            libName: '', //创建项目库名称
            scenes: [],  //使用----定制库
            scene: '',   //项目库场景
            descr: '',   //项目库描述
            checkOptions: [], //信息
            activeKey: '0'
        }
    }

    componentWillMount() {
        this.setState({
            pagerow: this.context.pageNum
        }, () => {
            this.searchEvent(this.state.libNameKey);
        })
        //继承于定制库
        window.Fetch(urlBefore + '/base/querylistNP_library.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"libType": 'dz'})
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    scenes: data.datas
                })
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }

    //取消
    caraouselPrev = () => {
        let current = parseInt(this.state.activeKey, 10) - 1;
        this.setState({
            "activeKey": current.toString(),
            "libName": "",
            "scene": "",
            "descr": "",
            "checkOptions": []
        })
    }
    //前两项-下一步
    caraouselNext = (e, value) => {
        console.log(value);
        if (value === 0) {
            this.setState({activeKey: '1'});
        } else if (value === 1) {
            if (this.state.libName && this.state.scene) {
                window.Fetch(urlBefore + '/base/insert_library.action', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        "libName": this.state.libName,
                        "libType": sessionStorage.getItem('libType'),
                        "dzId": this.state.scene,
                        "descr": this.state.descr
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            "activeKey": "0",
                            "libName": "",
                            "scene": "",
                            "descr": "",
                            "checkOptions": []
                        }, () => {
                            this.searchEvent(this.state.libNameKey);
                        })
                    } else {
                        message.error(data.error)
                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            } else {
                message.warning('请填写项目库名称和继承的定制库！')
            }
        }
    }
    onSearch = (value) => {
        this.setState({
            libNameKey: value
        }, () => {
            this.searchEvent(this.state.libNameKey)
        })
    }
    searchEvent = (value) => {
        this.setState({
            loading: true
        }, () => {
            //获取列表信息
            window.Fetch(urlBefore + '/base/querylist_library.action', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: 'sortname=' + this.state.sortname + '&sortorder=' + this.state.sortorder + '&pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                    "libType": "xm",
                    "libName": value
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        data: data.datas,
                        count: data.count,
                        loading: false
                    })
                } else {
                    message.error(data.error)
                }
            }).catch((error) => {
                message.error(error.message);
            })
        })

    }
    //管理-点击
    manage = (record) => {
        window.Fetch(urlBefore + '/base/choseLib_library.action', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                "libType": record.libType,
                "libName": record.libName
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                sessionStorage.setItem('libName', record.libName);
                sessionStorage.setItem('libId', record.libId);
                sessionStorage.setItem('dzId', record.dzId);
                hashHistory.push('/app/index3/list');
            } else {
                message.error(data.message);
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    //创建项目库-名称
    libNameChange = (e) => {
        this.setState({
            libName: e.target.value
        })
    }
    //选择定制库改变
    sceneChange = (value) => {
        this.setState({
            scene: value
        }, () => {
            //获取定制库下的表
            window.Fetch(urlBefore + '/base/queryDZTables_library.action', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({"dzId": this.state.scene})
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        checkOptions: data.datas
                    })
                }
            }).catch((error) => {
                message.error(error.message);
            })
        })
    }
    //创建项目库-描述
    descrChange = (e) => {
        this.setState({
            descr: e.target.value
        })
    }
    //删除项目库
    delete = (id) => {
        window.Fetch(urlBefore + '/base/delete_library.action', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                'libType': 'xm',
                'libId': id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('删除成功！');
                this.searchEvent(this.state.libNameKey);
            } else {
                message.error(data.error);
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    onChange = (activeKey) => {
        this.setState({activeKey});
    }
    //页码相关
    tableChange = (pagination, filters, sorter) => {
        this.setState({
            pagesize: pagination.current,
            pagerow: pagination.pageSize,
            sortname: sorter.field ? sorter.field : '',
            sortorder: sorter.order ? sorter.order.replace('end', '') : '',
        }, () => {
            this.searchEvent(this.state.libNameKey);
        })
    }

    render() {
        const columns = [
            {
                title: '项目库名称',
                dataIndex: 'libName',
                sorter: true,
                className: 'text-left',
                width: 100,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '内容',
                dataIndex: 'libContent',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '描述',
                dataIndex: 'descr',
                className: 'text-left',
                width: 100,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作员',
                dataIndex: 'userName',
                className: 'text-left',
                width: 200,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作日期',
                dataIndex: 'createTime',
                sorter: true,
                width: 200,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作类型',
                width: '12%',
                width: 100,
                render: (text, record) => (
                    <div className="textBox">
                        <span className={style.cursor} onClick={() => this.manage(record)}>管理</span> | <span
                        className={style.cursor} onClick={() => this.delete(record.libId)}>删除</span>
                    </div>
                )
            }
        ];
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                if (this.state.activeKey !== '0') {
                    this.setState({
                        ['selectedRows' + this.state.activeKey]: selectedRows
                    }, () => {
                        console.log(this.state['selectedRows' + this.state.activeKey])
                    })
                }
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
            }),
        };
        return (
            <div className={style.wrap}>
                <style>
                    {`
                        .myTabs .ant-tabs-bar{ 
                            display:none; 
                        }
                    `}
                </style>
                <Tabs
                    style={{background: '#fff'}}
                    onChange={this.onChange}
                    activeKey={this.state.activeKey}
                    className={`${this.context.withScreen === 'wide' ? style.myTabs : style.myTabsLittle} ${'myTabs'}`}
                >
                    <TabPane tab={'创建'} key={0}>
                        <div>
                            <h5>
                                <Button type="primary" style={{float: 'right'}}
                                        onClick={(e) => this.caraouselNext(e, 0)}>创建{this.state.genre}</Button>
                                <span className={style.title}>请选择{this.state.genre}</span>
                            </h5>
                            <div style={{padding: '0 20px'}}>
                                <Search
                                    placeholder={"请输入" + this.state.genre + "名称"}
                                    onSearch={this.onSearch}
                                    style={{width: '100%', margin: '15px 0 10px'}}
                                />
                                <Table
                                    bordered
                                    loading={this.state.loading}
                                    columns={columns}
                                    //rowSelection={rowSelection}
                                    dataSource={this.state.data}
                                    rowKey={record => record.libId}
                                    onChange={this.tableChange}
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
                    </TabPane>
                    <TabPane tab={'22'} key={1}>
                        {
                            this.state.activeKey === '1'
                                ?
                                <div className={this.context.withScreen === 'wide' ? style.found : style.foundLittle}>
                                    <h5>
                                        <span className={style.title}>创建{this.state.genre}</span>
                                    </h5>
                                    <div className={style.contents}>
                                        <Row>
                                            <Col span={14}>
                                                <Row>
                                                    <Col span={24}>
                                                        <lable className={style.name}>名称</lable>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Input placeholder="请输入项目库名称" value={this.state.libName}
                                                               onChange={this.libNameChange}/>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col span={2}/>
                                            <Col span={8}>
                                                <Row>
                                                    <Col span={24}>
                                                        <lable className={style.name}>继承于定制库</lable>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Select
                                                            style={{width: '100%'}}
                                                            value={this.state.scene}
                                                            onChange={this.sceneChange}
                                                        >
                                                            {
                                                                this.state.scenes.map((item, i) => {
                                                                    return <Option
                                                                        key={item.libId}>{item.libName}</Option>
                                                                })
                                                            }
                                                        </Select>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col span={24}>
                                                <Row>
                                                    <Col span={24}>
                                                        <lable className={style.name}>描述</lable>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Input type="textarea" placeholder="请输入描述信息"
                                                               value={this.state.descr} onChange={this.descrChange}
                                                               rows={4} style={{height: 80}}
                                                               autosize={{minRows: 4, maxRows: 4}}/>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col span={24}>
                                                <Row>
                                                    <Col span={24}>
                                                        <lable className={style.name}>定制表</lable>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Row>
                                                            {
                                                                this.state.checkOptions.map((item, i) => {
                                                                    return <Col style={{marginBottom: '10px'}} key={i}
                                                                                span={6}><Checkbox disabled={true}
                                                                                                   checked={true}
                                                                                                   value={item.busiType}>{item.tableComment}</Checkbox></Col>
                                                                })
                                                            }
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className={style.bottom}>
                                        <Button onClick={this.caraouselPrev}>取消</Button>
                                        <Button style={{float: 'right'}} type="primary"
                                                onClick={(e) => this.caraouselNext(e, 1)}>完成</Button>
                                    </div>
                                </div>
                                : ''
                        }
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

Project.contextTypes = {
    withScreen: PropTypes.string,
    pageNum: PropTypes.number
}
Project = Form.create()(Project);
export default Project;
