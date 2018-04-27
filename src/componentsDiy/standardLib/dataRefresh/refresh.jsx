import React, {Component} from 'react';
import {urlBefore} from '../../../data.js';
import {Form, Button, Row, Col, Input, message, Table} from 'antd';
import style from './../../../components/modules/addTag/add.less';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom.jsx';

const Search = Input.Search;
const FormItem = Form.Item;

class Refresh extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            pagesize: 1,
            pagerow: 10,
            codeOrName: '',
            tableData: [],
            count: 0,
            load: false
        }
    }

    componentDidMount() {
        let data = this.state.data;
        this.props.form.setFieldsValue({
            ake001Map: data.ake001Map,
            ake002Map: data.ake002Map,
            ake001: data.ake001,
            ake002: data.ake002
        });
        this.getData()
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                window.Fetch(urlBefore + '/jcxx/preSupply_supplyData.action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        itemType: this.state.data.itemType,
                        ake001Map: values.ake001Map,
                        ake002Map: values.ake002Map,
                        ake001: values.ake001,
                        ake002: values.ake002
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.props.back(true);
                        message.success('补充成功！');
                    } else {
                        message.error(data.message);
                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            }
        });
    }
    //table
    getData = () => {
        this.setState({
            load: true
        }, () => {
            window.Fetch(urlBefore + '/jcxx/queryBzDatas_supplyData.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'pagerow=' + this.state.pagerow + '&pagesize=' + this.state.pagesize + '&data=' + JSON.stringify({
                    itemType: this.state.data.itemType,
                    codeOrName: this.state.codeOrName
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        tableData: data.datas && data.datas.length > 0 ? data.datas : [],
                        count: data.count,
                        load: false
                    })
                }
            }).catch(error => {
                message.error(error.message);
            })
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
            this.getData()
        })
    }
    InputChange = (e) => {
        this.setState({
            codeOrName: e.target.value
        })
    }
    onSearch = () => {
        this.setState({
            pagesize: 1
        }, () => {
            this.getData();
        })
    }

    render() {
        const columns1 = [
            {
                title: '项目编码',
                dataIndex: 'itemCode',
                className: 'text-left',
                width: '16%',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '项目名称',
                dataIndex: 'itemName',
                className: 'text-left',
                width: '16%',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '亚目编码',
                dataIndex: 'suborderCode',
                className: 'text-left',
                width: '16%',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '亚目名称',
                dataIndex: 'suborderName',
                className: 'text-left',
                width: '16%',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '类目编码',
                dataIndex: 'categoryCode',
                className: 'text-left',
                width: '16%',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '类目名称',
                dataIndex: 'categoryName',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ];
        const columns2 = [
            {
                title: '项目编码',
                dataIndex: 'itemCode',
                className: 'text-left',
                width: '50%',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '项目名称',
                dataIndex: 'itemName',
                className: 'text-left',
                width: '50%',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ]
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 12,},
                sm: {span: 4, offset: 2},
            },
            wrapperCol: {
                xs: {span: 12},
                sm: {span: 6},
            }
        }

        return (
            <div>
                <BreadcrumbCustom first="项目库" second="数据填充" three="填充"/>
                <div className={style.add}>
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem
                            {...formItemLayout}
                            label="项目编码"
                        >
                            {getFieldDecorator('ake001Map', {
                                rules: [{
                                    required: true, message: '必填项!',
                                }],
                            })(
                                <Input/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="项目名称"
                        >
                            {getFieldDecorator('ake002Map', {
                                rules: [{
                                    required: true, message: '必填项!',
                                }],
                            })(
                                <Input/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="补充编码"
                        >
                            {getFieldDecorator('ake001', {
                                rules: [{
                                    required: true, message: '必填项!',
                                }],
                            })(
                                <Input/>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="补充名称"
                        >
                            {getFieldDecorator('ake002', {
                                rules: [{
                                    required: true, message: '必填项!',
                                }],
                            })(
                                <Input/>
                            )}
                        </FormItem>
                        <Row className={this.state.data.supplyStatus === '3' ? '' : 'hidden'}
                             style={{marginBottom: '18px'}}>
                            <Col offset={2} span={4}>未通过原因：</Col>
                            <Col span={12}>
                                {this.state.data.approveDescr ? this.state.data.approveDescr : '未描述'}
                            </Col>
                        </Row>
                        <footer>
                            <Button onClick={() => this.props.back()}>取消</Button>
                            <Button type="primary" htmlType="submit">确定</Button>
                        </footer>
                    </Form>
                    <Row>
                        <Col span={12} style={{marginBottom: '10px'}}>
                            <Search
                                value={this.state.codeOrName}
                                placeholder="请输入项目编码或名称！"
                                onChange={this.InputChange}
                                onSearch={this.onSearch}
                            />
                        </Col>
                    </Row>
                    <Table
                        bordered
                        columns={this.state.data.itemType === '4' ? columns1 : columns2}
                        dataSource={this.state.tableData}
                        rowKey={record => record.itemCode}
                        onChange={this.onChange}
                        loading={this.state.load}
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
        )
    }
}

Refresh = Form.create()(Refresh);
export default Refresh;
