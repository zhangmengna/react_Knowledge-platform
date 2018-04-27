import React, {Component} from 'react';
import {Row, Col, Table, Form, Modal, Input, Icon, message, Select, Button, Breadcrumb} from 'antd';
import {urlBefore} from '../../../data.js';
import style from './index.less';
import StepsAll from './Steps'

const Option = Select.Option;
const FormItem = Form.Item;
const confirm = Modal.confirm;

class YpCon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            bmjbdata: [],   // 编码级别
            tableList: [],
            count: 0,
            pagesize: 1,	//当前页
            pagerow: 10,    //每页显示条数
            selectedRowKeys: [],
            Breaddata: []
        }
    }

    componentDidMount() {
        // 根据code查询字典
        if (this.state.query.levelCode) {
            window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({"dict_code": this.state.query.levelCode})
            }).then(res =>
                res.json()
            ).then(data => {
                if (data.result === 'success') {
                    const bmjbdata = []
                    data.datas[0].forEach((option, i) => {
                        bmjbdata.push({
                            text: option.display_name,
                            value: option.fact_value
                        })
                    })
                    this.setState({
                        bmjbdata
                    })
                } else {
                    message.warning(data.result)
                }
            }).catch((error) => {
                message.error(error.message);
            });
        }
        this.tableSearch()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({
                query: nextProps.query
            })
        }
    }

    // 查询面包屑
    Blur = () => {
        this.props.form.validateFields((err, values) => {
            if (this.state.query.levelCode === "drugLevel" && values.fact_value) {
                // if (values.itemlevel === '1' && values.fact_value.length < 2) {
                //     message.warning('编码不能小于两位')
                // } else if (values.itemlevel === '2' && values.fact_value.length < 4) {
                //     message.warning('编码不能小于四位')
                // } else if (values.itemlevel === '3' && values.fact_value.length < 6) {
                //     message.warning('编码不能小于六位')
                // }
                window.Fetch(urlBefore + "/jcxx/queryByCode16_ka01.action", {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    },
                    body: 'data=' + JSON.stringify({ake001: values.fact_value})
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            Breaddata: data.datas
                        })
                    } else {
                        message.warning(data.message);
                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            } else if (this.state.query.levelCode === "treatLevel" && values.fact_value) {
                window.Fetch(urlBefore + "/jcxx/queryLevelInfos_ka02.action", {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    },
                    body: 'data=' + JSON.stringify({ake001: values.fact_value})
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            Breaddata: data.datas
                        })
                    } else {
                        message.warning(data.message);
                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            }


        })
    }

    BreadcrumbTab = () => {
        const Breaddata = this.state.Breaddata;
        if (this.state.query.levelCode === "drugLevel" && Breaddata) {
            return (
                <Breadcrumb className={Breaddata.largeClass ? "" : "hidden"}>
                    <Breadcrumb.Item>{Breaddata.largeClass}</Breadcrumb.Item>
                    <Breadcrumb.Item>{Breaddata.midClass}</Breadcrumb.Item>
                    <Breadcrumb.Item>{Breaddata.minClass}</Breadcrumb.Item>
                </Breadcrumb>
            )
        } else if (this.state.query.levelCode === "treatLevel" && Breaddata) {
            return (
                <Row>
                    <Col span={13}>
                        <Breadcrumb className={Breaddata.code2 ? "" : "hidden"}>
                            <Breadcrumb.Item>{Breaddata.code2}</Breadcrumb.Item>
                            <Breadcrumb.Item>{Breaddata.code2Name}</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col span={11}>
                        <Breadcrumb className={Breaddata.code4 ? "" : "hidden"}>
                            <Breadcrumb.Item>{Breaddata.code4}</Breadcrumb.Item>
                            <Breadcrumb.Item>{Breaddata.code4Name}</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col span={13}>
                        <Breadcrumb className={Breaddata.code6 ? "" : "hidden"}>
                            <Breadcrumb.Item>{Breaddata.code6}</Breadcrumb.Item>
                            <Breadcrumb.Item>{Breaddata.code6Name}</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col span={11}>
                        <Breadcrumb className={Breaddata.code9 ? "" : "hidden"}>
                            <Breadcrumb.Item>{Breaddata.code9}</Breadcrumb.Item>
                            <Breadcrumb.Item>{Breaddata.code9Name}</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                </Row>
            )
        }
    }

    tableSearch = () => {
        window.Fetch(urlBefore + '/base/queryDictItems_dictManager.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                dict_code: this.state.query.dict_code,      //代码编码
                levelCode: this.state.query.levelCode       //等级code
            })
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const tableList = []
                data.datas.forEach((option, i) => {
                    tableList.push({
                        display_name: option.display_name,
                        fact_value: option.fact_value,
                        item_id: option.item_id,
                        itemlevelcn: option.itemlevelcn
                    })
                })
                this.setState({
                    tableList,
                    count: data.count,
                    selectedRowKeys: []
                })
            } else {
                message.warning(data.result);
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }

    //页码相关
    onChange = (pagination, filters, sorter) => {
        this.setState({
            pagesize: pagination.current,
            pagerow: pagination.pageSize,
            // sortname: sorter.field ? sorter.field : '',
            // sortorder: sorter.order ? sorter.order.replace('end', '') : '',
        }, () => {
            this.tableSearch()
        })
    }

    // 点击 + 
    AddClick = () => {
        this.props.form.validateFields((err, values) => {
            if (!values.itemlevel) {
                message.warning('请选择编码等级')
            } else if (!values.fact_value) {
                message.warning('请输入编码')
            } else if (!values.display_name) {
                message.warning('请输入名称')
            } else {
                window.Fetch(urlBefore + '/base/insertDictItem_dictManager.action', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        dict_code: this.state.query.dict_code,      // 代码编码
                        fact_value: values.fact_value,              // 编码
                        display_name: values.display_name,          // 名称
                        itemlevel: values.itemlevel,                // 编码等级
                    })
                }).then(res =>
                    res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        message.success('新增成功！')
                        this.props.form.setFieldsValue({
                            itemlevel: '',
                            fact_value: "",
                            display_name: '',
                        })
                        this.tableSearch()
                    } else {
                        message.warning(data.result);
                    }
                }).catch((error) => {
                    message.error(error.message);
                });
            }
        })
    }

    // 点击 -
    deleteTreatGroup = () => {
        if (this.state.selectedRowKeys.length === 1) {
            const that = this;
            confirm({
                title: '确定要删除吗？',
                onOk() {
                    window.Fetch(urlBefore + '/base/deleteDictItem_dictManager.action', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            dict_code: that.state.query.dict_code,      // 代码编码
                            item_id: that.state.selectedRowKeys[0]      // 项目id
                        })
                    }).then(res =>
                        res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            message.success('删除成功！')
                            that.setState({
                                selectedRowKeys: []
                            }, () => that.tableSearch())
                        } else {
                            message.warning(data.result);
                        }
                    }).catch((error) => {
                        message.error(error.message);
                    });
                },
                onCancel() { },
            });
        }
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };
        // 编码级别
        const bmjbTag = this.state.bmjbdata ? this.state.bmjbdata.map((bmjb, i) => {
            return <Option value={bmjb.value} key={i}>{bmjb.text}</Option>
        }) : ""
        const columns = [
            {
                title: '编码',
                dataIndex: 'fact_value',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '名称',
                dataIndex: 'display_name',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '编码级别',
                dataIndex: 'itemlevelcn',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }]
        const {selectedRowKeys} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                if (selectedRowKeys.length > 1) {
                    this.setState({
                        selectedRowKeys: [selectedRowKeys[0]]
                    })
                    message.warning('只能选择一条数据！')
                } else {
                    this.setState({
                        selectedRowKeys
                    })
                }
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
            }),
        };

        return (
            <div className={style.scroll + " " + style.padding}>
                <Row>
                    <Col span={16}>
                        <Button type="primary">{this.state.query.dict_name}</Button>
                        <Row>
                            <Col span={4}>
                                <FormItem
                                    {...formItemLayout}
                                    label="编码级别"
                                >
                                    {getFieldDecorator("itemlevel", {})(
                                        <Select style={{width: '100%'}} placeholder="请选择编码级别">
                                            {bmjbTag}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={1}/>
                            <Col span={5}>
                                <FormItem
                                    {...formItemLayout}
                                    label="编码"
                                >
                                    {getFieldDecorator("fact_value", {})(
                                        <Input placeholder="请输入编码" onBlur={this.Blur}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={1}/>
                            <Col span={13}>
                                <FormItem
                                    {...formItemLayout}
                                    label="名称"
                                >
                                    {getFieldDecorator("display_name", {})(
                                        <Input placeholder="请输入名称"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        {this.BreadcrumbTab()}
                        <Row>
                            <Col span={22}><p>编码列表</p></Col>
                            <Col span={1}><Icon type="plus-circle" title="新增" className={style.IconAdd}
                                                onClick={this.AddClick}/></Col>
                            <Col span={1}><Icon type="minus-circle-o" title="删除" className={style.IconAdd}
                                                onClick={this.deleteTreatGroup}/></Col>
                        </Row>
                        <Table
                            bordered
                            columns={columns}
                            rowSelection={rowSelection}
                            dataSource={this.state.tableList}
                            rowKey={record => record.item_id}
                            onChange={this.onChange}
                            pagination={{
                                current: this.state.pagesize,
                                showTotal: () => (`总数 ${this.state.count} 条`),
                                total: this.state.count,
                                pageSize: this.state.pagerow,
                                showSizeChanger: true,
                                showQuickJumper: true,
                            }}
                        />
                    </Col>
                    <Col span={1}/>
                    <Col span={7}>
                        <StepsAll query={{
                            dict_code: this.state.query.dict_code, //代码code
                            item_id: this.state.selectedRowKeys[0], //明细项目id
                        }}
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

YpCon = Form.create()(YpCon);
export default YpCon;

