// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select, Radio, Table} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;

class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            pagesize: 1,	 	// 当前页
            pagerow: 10,        // 每页显示条数
            selectedRows: [],   // 列表选中
            selectedRowKeys: [],
            tableList: [],      // 列表内容
            count: 0,
            codeOrName: this.props.query.aka061
        }
    }

    componentWillMount() {
        window.Fetch(urlBefore + "/jcxx/queryCode16Info_ka01Code16.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + "&data=" + JSON.stringify({
                bkz149: this.state.query.bkz149, // 药品说明书编码,
                codeOrName: this.state.codeOrName
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                const selectedRowKeys = [];
                if (data.datas && data.datas.bandDatas) {
                    data.datas.bandDatas.forEach((bandDatas, i) => {
                        selectedRowKeys.push(bandDatas.ake001)
                    })
                }
                this.setState({
                    selectedRowKeys,
                    tableList: data.datas.pageDatas ? data.datas.pageDatas : [],
                    count: data.count
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
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
            this.Search()
        })
    }

    SearchTab = (e) => {
        this.setState({
            codeOrName: e.target.value  // 项目（分类）编码或名称
        }, () => this.Search())
    }

    Search = () => {
        // 模糊查询16位药品信息
        window.Fetch(urlBefore + "/jcxx/queryCode16Info_ka01Code16.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + "&data=" + JSON.stringify({
                bkz149: this.state.query.bkz149, // 药品说明书编码,
                codeOrName: this.state.codeOrName
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    tableList: data.datas.pageDatas ? data.datas.pageDatas : [],
                    count: data.count
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }

    // submit
    submit = (e) => {
        e.preventDefault();
        let obj = {}, code16Datas = [];
        this.state.selectedRowKeys.forEach((codedata, i) => {
            code16Datas.push({
                code16: codedata
            })
        })
        this.props.form.validateFields((err, values) => {
            obj = {
                bkz149: this.state.query.bkz149, // 药品说明书编码,
                code16Datas
            }
            window.Fetch(urlBefore + "/jcxx/bandCode16_ka01Instruct.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify(obj)
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success("关联成功！")
                    this.props.back()
                } else {
                    message.warning(data.result);
                }
            }).catch(error => {
                message.error(error.message);
            })
        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {query, selectedRowKeys} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 5}
            },
            wrapperCol: {
                xs: {span: 19}
            },
        };
        const columns = [
            {
                title: '16位药品编码',
                dataIndex: 'ake001',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '16位药品名称',
                dataIndex: 'ake002',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ]

        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys: selectedRowKeys
                })
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
            }),
        };

        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second} three="关联药品16位编码"/>
                <div className={style.add} style={{padding: "20px"}}>
                    <Form>
                        <Row>
                            <Col span={11}>
                                <FormItem
                                    {...formItemLayout}
                                    label="药品说明书编码"
                                >
                                    {getFieldDecorator("bkz149", {
                                        initialValue: this.state.query.bkz149
                                    })(
                                        <Input readOnly/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={2}/>
                            <Col span={11}>
                                <FormItem
                                    {...formItemLayout}
                                    label="药品说明书名称"
                                >
                                    {getFieldDecorator("aka061", {
                                        initialValue: this.state.query.aka061
                                    })(
                                        <Input readOnly/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <FormItem>
                            {getFieldDecorator("codeOrName", {
                                initialValue: this.state.query.aka061
                            })(
                                <Input
                                    style={{width: '100%'}}
                                    onChange={this.SearchTab}
                                    placeholder="输入查询关键字"
                                />
                            )}
                        </FormItem>
                        <Table
                            bordered
                            columns={columns}
                            rowSelection={rowSelection}
                            selections
                            dataSource={this.state.tableList}
                            rowKey={record => record.ake001}
                            onChange={this.onChange}
                            pagination={{
                                current: this.state.pagesize,
                                showTotal: () => (`总数 ${this.state.count} 条`),
                                total: this.state.count,
                                pageSize: this.state.pagerow,
                                showSizeChanger: true,
                                showQuickJumper: true
                            }}
                        />
                    </Form>
                    <footer>
                        <Button onClick={this.props.back}>取消</Button>
                        <Button type="primary" onClick={this.submit}>确定</Button>
                    </footer>
                </div>
                <style>
                    {`
                        form .ant-select, form .ant-cascader-picker{ width: auto; }
                        footer{ margin-right: -20px; border: 0; height: 80px; padding-right: 0; }
                    `}
                </style>
            </div>
        )
    }
}

Add = Form.create()(Add);
export default Add;