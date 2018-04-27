import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Table, Button, Input, Carousel, Row, Col, Form, Select, message, Checkbox, Tag, Tabs} from 'antd';
import style from './establish.less';
import {hashHistory} from 'react-router';
import {urlBefore} from '../../data';
import SearchModule from '../../components/modules/searchCom/search';
import tags from '../../utils/tags'
import Tags from '../../components/modules/tag/tags';

const Search = Input.Search;
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;

class Establish extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            firstId: 'dz',
            genre: '定制库',
            libNameKey: '',  //定制库查询 关键词
            pagesize: 1,	 	//当前页
            pagerow: 15, //每页显示条数
            sortname: "",
            sortorder: "",
            count: '',
            data: [],
            libName: '', //创建定制库名称
            scenes: [],  //使用场景
            scene: [],   //定制库场景
            sceneValue: '',
            descr: '',   //定制库描述
            info: ['04'],   //定制选中信息
            checkOptions: [], //信息
            selected: [],
            current: 0, //走马灯位置
            activeKey: '0'
        }
    }

    componentWillMount() {
        this.setState({
            pagerow: this.context.pageNum
        }, () => {
            this.searchEvent(this.state.libNameKey);
        })
        //获取字典项--适用场景
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'scene'})
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                console.log('适用场景！', data.datas);
                this.setState({
                    scenes: data.datas[0]
                })
            }
        }).catch((error) => {
            message.error(error.message);
        })
        //获取表类型
        window.Fetch(urlBefore + '/base/queryTables_library.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: {}
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
    }

    //上一步
    caraouselPrev = (param) => {
        let current = parseInt(this.state.activeKey, 10) - 1;
        if (param === 'cancel') {
            this.setState({
                "activeKey": current.toString(),
                "libName": '',
                "scene": [],
                "sceneValue": '',
                "descr": '',
                "info": ['04'],
                "selected": []
            })

        } else {
            this.setState({
                activeKey: current.toString()
            })
        }
    }
    //前两项-下一步
    caraouselNext = (e, value) => {
        console.log(value);
        if (value === 0) {
            this.setState({activeKey: '1'});
        } else if (value === 1) {
            if (this.state.libName && this.state.sceneValue) {
                let arr = [];
                this.state.info.forEach((value, i) => {
                    this.state.checkOptions.forEach((item, j) => {
                        if (value === item.busiType) {
                            arr.push(item)
                        }
                    })
                })
                this.setState({
                    selected: arr
                }, () => {
                    console.log('arr', arr)
                })
                window.Fetch(urlBefore + '/base/createDZSession_library.action', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        "libName": this.state.libName,
                        "libType": sessionStorage.getItem('libType'),
                        "scene": this.state.sceneValue,
                        "descr": this.state.descr
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.afterChange('2');
                    } else {
                        message.error(data.error)
                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            } else {
                message.warning('请输入定制库名称和使用场景！');
            }

        }
    }
    //后面项-下一步
    nextStep = (e, num, bool, busiType) => {
        let arr = [];
        if (this.state['selectedRowKeys' + num] && this.state['selectedRowKeys' + num].length > 0) {
            this.state['selectedRowKeys' + num].forEach((item) => {
                arr.push({
                    dataId: item
                })
            })
        }
        window.Fetch(urlBefore + '/base/updateDZSession_library.action', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                'busiType': busiType,
                'confirm': bool,
                'libType': 'dz',
                'datas': arr.length > 0 ? arr : ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                console.log('下一页！');
                if (!bool) {
                    this.afterChange((num + 1).toString());
                } else {
                    this.setState({
                        activeKey: '0',
                        "libName": '',    //完成后初始化信息
                        "scene": [],
                        "sceneValue": '',
                        "descr": '',
                        "info": ['04']
                    });
                    //this.state.['selectedRows'+this.state.activeKey]
                    //新增完成后，回到列表页，刷新
                    this.searchEvent(this.state.libNameKey);
                }
            } else {
                message.error(data.error)
            }
        }).catch((error) => {
            message.error(error.message);
        })
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
                    "libType": "dz",
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
    manage = (id) => {
        sessionStorage.setItem('libId', id);
        hashHistory.push('/app/index2/list')
    }
    //创建定制库-名称
    libNameChange = (e) => {
        this.setState({
            libName: e.target.value
        })
    }
    //创建定制库-场景
    sceneChange = (value) => {
        console.log(value);
        let arr = [];
        this.state.scenes.forEach((item, i) => {
            value.forEach((val) => {
                if (item.display_name === val) {
                    arr.push(item.fact_value);
                }
            })
        })
        this.setState({
            scene: value,
            sceneValue: arr.length > 0 ? arr.join(',') : ''
        })
    }
    //创建定制库-描述
    descrChange = (e) => {
        this.setState({
            descr: e.target.value
        })
    }
    infoChange = (value) => {
        console.log(value);
        this.setState({
            info: value
        })
    }
    //变化后
    afterChange = (current) => {
        console.log('下一页 --- 后');
        this.setState({
            activeKey: current,
            ['pagesize' + current]: 1,
            ['pagerow' + current]: this.context.pageNum,
            ['condition' + current]: [],
            ['tagId' + current]: []
        }, () => {
            console.log('activeKey', current);
            if (parseInt(current, 10) !== 0 && parseInt(current, 10) !== 1) {
                window.Fetch(urlBefore + '/base/queryBusiData_library.action', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    credentials: 'include',
                    body: 'pagesize=' + this.state['pagesize' + current] + '&pagerow=' + this.state['pagerow' + current] + '&sortname=' + this.state['sortname' + current] + '&sortorder=' + this.state['sortorder' + current] + '&data=' + JSON.stringify({
                        'busiType': this.state.selected[parseInt(current, 10) - 2].busiType,
                        'tagId': this.state['tagId' + current] && this.state['tagId' + current].length > 0 ? this.state['tagId' + current].join(',') : '',
                        'condition': this.state['condition' + current] && this.state['condition' + current].length > 0 ? this.state['condition' + current] : ''
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            ['data' + current]: data.datas,
                            ['count' + current]: data.count,
                            ['selectedRowKeys' + this.state.activeKey]: []
                        })
                    } else {
                        message.error(data.message)
                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            }
        })
    }
    //删除定制库
    delete = (id) => {
        window.Fetch(urlBefore + '/base/delete_library.action', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                'libType': 'dz',
                'libId': id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('删除成功！');
                this.searchEvent(this.state.libNameKey);
            } else {
                message.error(data.message);
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    onChange = (activeKey) => {
        this.setState({activeKey});
    }
    searchCondition = (arr, num) => {
        console.log(arr, num);
        //this.state[string] ? this.state[string]:[]
        this.setState({
            ['pagesize' + num]: 1,
            ['condition' + num]: arr
        }, () => {
            window.Fetch(urlBefore + '/base/queryBusiData_library.action', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: 'pagesize=' + this.state['pagesize' + num] + '&pagerow=' + this.state['pagerow' + num] + '&sortname=' + this.state['sortname' + num] + '&sortorder=' + this.state['sortorder' + num] + '&data=' + JSON.stringify({
                    'busiType': this.state.selected[parseInt(num, 10) - 2].busiType,
                    'tagId': this.state['tagId' + num] && this.state['tagId' + num].length > 0 ? this.state['tagId' + num].join(',') : '',
                    'condition': this.state['condition' + num] && this.state['condition' + num].length > 0 ? this.state['condition' + num] : ''
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        ['data' + num]: data.datas,
                        ['count' + num]: data.count
                    })
                } else {
                    message.error(data.error)
                }
            }).catch((error) => {
                message.error(error.message);
            })

        })
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
    //信息页码相关
    infoTableChange = (pagination, filters, sorter, num) => {
        console.log(sorter.field, sorter.order);
        this.setState({
            ['pagesize' + num]: pagination.current,
            ['pagerow' + num]: pagination.pageSize,
            ['sortname' + num]: sorter.field ? sorter.field : '',
            ['sortorder' + num]: sorter.order ? sorter.order.replace('end', '') : '',
        }, () => {
            window.Fetch(urlBefore + '/base/queryBusiData_library.action', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: 'pagesize=' + this.state['pagesize' + num] + '&pagerow=' + this.state['pagerow' + num] + '&sortname=' + this.state['sortname' + num] + '&sortorder=' + this.state['sortorder' + num] + '&data=' + JSON.stringify({
                    'busiType': this.state.selected[parseInt(num, 10) - 2].busiType,
                    'tagId': this.state['tagId' + num] && this.state['tagId' + num].length > 0 ? this.state['tagId' + num].join(',') : '',
                    'condition': this.state['condition' + num] && this.state['condition' + num].length > 0 ? this.state['condition' + num] : ''
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        ['data' + num]: data.datas,
                        ['count' + num]: data.count
                    })
                } else {
                    message.error(data.error)
                }
            }).catch((error) => {
                message.error(error.message);
            })

        })
    }
    //tagId选中
    tagIdChange = (arr, key) => {
        let stringIds = [];
        arr.forEach((item) => {
            stringIds.push(item.tagId);
        })
        this.setState({
            ['tagId' + key]: stringIds,
            ['pagesize' + key]: 1
        }, () => {
            window.Fetch(urlBefore + '/base/queryBusiData_library.action', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: 'pagesize=' + this.state['pagesize' + key] + '&pagerow=' + this.state['pagerow' + key] + '&sortname=' + this.state['sortname' + key] + '&sortorder=' + this.state['sortorder' + key] + '&data=' + JSON.stringify({
                    'busiType': this.state.selected[parseInt(key, 10) - 2].busiType,
                    'tagId': this.state['tagId' + key] && this.state['tagId' + key].length > 0 ? this.state['tagId' + key].join(',') : '',
                    'condition': this.state['condition' + key] && this.state['condition' + key].length > 0 ? this.state['condition' + key] : ''
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        ['data' + key]: data.datas,
                        ['count' + key]: data.count
                    })
                } else {
                    message.error(data.error)
                }
            }).catch((error) => {
                message.error(error.message);
            })
        })
    }

    render() {
        const columns = [
            {
                title: '定制库名称',
                dataIndex: 'libName',
                sorter: true,
                width: 100,
                className: 'text-left',
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
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作员',
                dataIndex: 'userName',
                width: 200,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作日期',
                dataIndex: 'createTime',
                width: 200,
                sorter: true,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作类型',
                width: '12%',
                width: 100,
                render: (text, record) => (
                    <div className="textBox" style={{color: '#007cfd'}}>
                        <span className={style.cursor} onClick={() => this.manage(record.libId)}>管理</span> | <span
                        className={style.cursor} onClick={() => this.delete(record.libId)}>删除</span>
                    </div>
                )
            }
        ]
        const columns1 = [
            {
                title: '项目编码',
                dataIndex: 'itemCode',
                className: 'text-left',
                width: 100,
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '项目名称',
                dataIndex: 'itemName',
                className: 'text-left',
                width: 100,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '标签',
                className: 'text-left',
                width: 200,
                render: (text, record) => (
                    <div className="textBox" title={record.tags.map((item, i) => {
                        return " " + item.tagName
                    })}
                    >{tags(record)}
                    </div>
                )
            }
        ];
        const rowSelection = {
            selectedRowKeys: this.state['selectedRowKeys' + this.state.activeKey],
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(this.state['selectedRowKeys' + this.state.activeKey])
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                if (this.state.activeKey !== '0') {
                    this.setState({
                        ['selectedRows' + this.state.activeKey]: selectedRows,
                        ['selectedRowKeys' + this.state.activeKey]: selectedRowKeys
                    }, () => {
                        console.log(this.state['selectedRows' + this.state.activeKey])
                        console.log(this.state['selectedRowKeys' + this.state.activeKey])
                    })
                }
            },
            getCheckboxProps: (record) => ({
                //defaultChecked: record.choseFlag,
                disabled: record.choseFlag
            }),
        };
        return (
            <div className={style.wrap}>
                <style>
                    {`
                        .myTabs .ant-tabs-bar{ display:none; }
                        .ant-table-selection-column .ant-checkbox.ant-checkbox-disabled{ display:none; }
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
                                        showQuickJumper: true,
                                    }}
                                />
                            </div>
                        </div>
                    </TabPane>
                    {
                        this.state.activeKey !== '0'
                            ?
                            <TabPane tab={'输入'} key={1}>
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
                                                        <Input placeholder="请输入定制库名称" value={this.state.libName}
                                                               onChange={this.libNameChange}/>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col span={2}/>
                                            <Col span={8}>
                                                <Row>
                                                    <Col span={24}>
                                                        <lable className={style.name}>适用场景</lable>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Select
                                                            mode="multiple"
                                                            style={{width: '100%'}}
                                                            value={this.state.scene}
                                                            placeholder="请选择适用场景"
                                                            onChange={this.sceneChange}
                                                        >
                                                            {
                                                                this.state.scenes.map((item, i) => {
                                                                    return <Option
                                                                        key={item.display_name}>{item.display_name}</Option>
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
                                                        <lable className={style.name}>信息</lable>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Checkbox.Group value={this.state.info}
                                                                        onChange={this.infoChange}>
                                                            <Row>
                                                                {
                                                                    this.state.checkOptions.map((item, i) => {
                                                                        return <Col style={{marginBottom: '10px'}}
                                                                                    key={i} span={6}><Checkbox
                                                                            disabled={item.busiType === '04' ? true : false}
                                                                            value={item.busiType}>{item.tableComment}</Checkbox></Col>
                                                                    })
                                                                }
                                                            </Row>
                                                        </Checkbox.Group>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className={style.bottom}>
                                        <Button onClick={() => this.caraouselPrev('cancel')}>取消</Button>
                                        <Button style={{float: 'right'}} type="primary"
                                                onClick={(e) => this.caraouselNext(e, 1)}>下一步</Button>
                                    </div>
                                </div>
                            </TabPane>
                            : ''
                    }
                    {
                        this.state.selected.map((item, i) => {
                                let num = i + 2;
                                let string = 'data' + num;
                                if (this.state.activeKey !== '0') {
                                    if (this.state.selected.length === i + 1) {
                                        return (
                                            <TabPane tab={item.tableComment} key={i + 2}>
                                                <div
                                                    className={this.context.withScreen === 'wide' ? style.found : style.foundLittle}
                                                    key={i + 2}>
                                                    <h5>
                                                        <span className={style.title}>请选择{item.tableComment}</span>
                                                    </h5>

                                                    <div style={{padding: '0 20px'}}>
                                                        <Tags tagValue={this.state.tagValue} dzKu={true} libId=''
                                                              busiType={this.state.selected[i].busiType}
                                                              select={(arr) => this.tagIdChange(arr, num)}/>
                                                        <SearchModule busiType={this.state.selected[i].busiType}
                                                                      search={(arr) => this.searchCondition(arr, num)} replace={true}/>
                                                        <Table
                                                            bordered
                                                            columns={columns1}
                                                            pagination={{
                                                                current: this.state['pagesize' + num],
                                                                showTotal: () => (`总数 ${this.state['count' + num]} 条`),
                                                                total: this.state['count' + num],
                                                                pageSize: this.state['pagerow' + num],
                                                                showSizeChanger: true,
                                                                pageSizeOptions: this.context.withScreen === 'wide' ? ['15', '30', '45', '60'] : ['10', '20', '30', '40'],
                                                                showQuickJumper: true,
                                                            }}
                                                            onChange={(pagination, filters, sorter) => this.infoTableChange(pagination, filters, sorter, num)}
                                                            rowSelection={rowSelection}
                                                            dataSource={this.state[string] ? this.state[string] : []}
                                                            rowKey={record => record.dataId}
                                                        />
                                                    </div>
                                                    <div className={style.bottom}>
                                                        <Button onClick={this.caraouselPrev}>上一步</Button>
                                                        <Button style={{float: 'right'}} type="primary"
                                                                onClick={(e) => this.nextStep(e, num, true, item.busiType)}>完成</Button>
                                                    </div>
                                                </div>
                                            </TabPane>
                                        )
                                    } else {
                                        return (
                                            <TabPane tab={item.tableComment} key={i + 2}>
                                                <div
                                                    className={this.context.withScreen === 'wide' ? style.found : style.foundLittle}
                                                    key={i + 2}>
                                                    <h5>
                                                        <span className={style.title}>请选择{item.tableComment}</span>
                                                    </h5>
                                                    <div style={{padding: '0 20px'}}>
                                                        <Tags tagValue={this.state.tagValue} dzKu={true} libId=''
                                                              busiType={this.state.selected[i].busiType}
                                                              select={(arr) => this.tagIdChange(arr, num)}/>
                                                        <SearchModule busiType={this.state.selected[i].busiType}
                                                                      search={(arr) => this.searchCondition(arr, num)}
                                                                      replace={true}
                                                        />
                                                        <Table
                                                            bordered
                                                            columns={columns1}
                                                            rowSelection={rowSelection}
                                                            pagination={{
                                                                current: this.state['pagesize' + num],
                                                                showTotal: () => (`总数 ${this.state['count' + num]} 条`),
                                                                total: this.state['count' + num],
                                                                pageSize: this.state['pagerow' + num],
                                                                showSizeChanger: true,
                                                                pageSizeOptions: this.context.withScreen === 'wide' ? ['15', '30', '45', '60'] : ['10', '20', '30', '40'],
                                                                showQuickJumper: true,
                                                            }}
                                                            onChange={(pagination, filters, sorter) => this.infoTableChange(pagination, filters, sorter, num)}
                                                            dataSource={this.state[string] ? this.state[string] : []}
                                                            rowKey={record => record.dataId}
                                                        />
                                                    </div>
                                                    <div className={style.bottom}>
                                                        <Button onClick={this.caraouselPrev}>上一步</Button>
                                                        <Button style={{float: 'right'}} type="primary"
                                                                onClick={(e) => this.nextStep(e, num, false, item.busiType)}>下一步</Button>
                                                    </div>
                                                </div>
                                            </TabPane>
                                        )
                                    }
                                } else {
                                    return ''
                                }
                            }
                        )
                    }
                </Tabs>
            </div>
        )
    }
}

Establish.contextTypes = {
    withScreen: PropTypes.string,
    pageNum: PropTypes.number
}
Establish = Form.create()(Establish);
export default Establish;
