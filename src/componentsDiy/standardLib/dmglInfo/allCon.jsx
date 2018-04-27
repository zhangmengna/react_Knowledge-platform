import React, {Component} from 'react';
import {Row, Col, Table, Modal, Form, Input, Icon, message, Button} from 'antd';
import {urlBefore} from '../../../data.js';
import style from './index.less';
// import StepsAll from './Steps'
const FormItem = Form.Item;
const confirm = Modal.confirm;

class AllCon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            tableList: [],
            count: 0,
            pagesize: 1,	//当前页
            pagerow: 10,    //每页显示条数
            selectedRowKeys: []
        }
    }

    componentDidMount() {
        this.tableSearch()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({
                query: nextProps.query
            })
        }
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

    tableSearch = () => {
        window.Fetch(urlBefore + '/base/queryDictItems_dictManager.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                dict_code: this.state.query.dict_code,      //代码编码
            })
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const tableList = []
                data.datas ? data.datas.forEach((option, i) => {
                    tableList.push({
                        display_name: option.display_name,
                        fact_value: option.fact_value,
                        item_id: option.item_id,
                        alias: option.alias
                    })
                }) : ""
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

    // 点击 + 
    AddClick = () => {
        this.props.form.validateFields((err, values) => {
            if (!values.fact_value) {
                message.warning('请输入编码')
            } else if (!values.display_name) {
                message.warning('请输入名称')
            } else if (!values.alias) {
                message.warning('请输入别名')
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
                        alias: values.alias                         // 别名
                    })
                }).then(res =>
                    res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        message.success('新增成功！')
                        this.props.form.setFieldsValue({
                            fact_value: "",
                            display_name: '',
                            alias: ''
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
                title: '别名',
                dataIndex: 'alias',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }]

        return (
            <div className={style.scroll + " " + style.padding}>
                <Row>
                    <Col span={16}>
                        <Button type="primary">{this.state.query.dict_name}</Button>
                        <Row>
                            <Col span={6}>
                                <FormItem
                                    {...formItemLayout}
                                    label="编码"
                                >
                                    {getFieldDecorator("fact_value", {})(
                                        <Input placeholder="请输入编码"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={1}/>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="名称"
                                >
                                    {getFieldDecorator("display_name", {})(
                                        <Input placeholder="请输入名称"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={1}/>
                            <Col span={8}>
                                <FormItem
                                    {...formItemLayout}
                                    label="别名"
                                >
                                    {getFieldDecorator("alias", {})(
                                        <Input placeholder="请输入别名名称"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
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
                        {/*<StepsAll query={{
                            dict_code: this.state.query.dict_code, //代码code
                            item_id: this.state.selectedRowKeys[0], //明细项目id
                        }}
                        />*/}
                    </Col>
                </Row>
            </div>
        )
    }
}

AllCon = Form.create()(AllCon);
export default AllCon;

