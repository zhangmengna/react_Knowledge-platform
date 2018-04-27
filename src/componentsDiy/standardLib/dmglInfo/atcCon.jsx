import React, {Component} from 'react';
import {Row, Col, Table, Form, Modal, Input, Icon, Button, message, Select} from 'antd';
import {urlBefore} from '../../../data.js';
import StepsAll from './Steps'
import style from './index.less';

const Option = Select.Option;
const FormItem = Form.Item;
const confirm = Modal.confirm;

class AtcCon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            tableList: [],
            count: 0,
            pagesize: 1,	//当前页
            pagerow: 10,    //每页显示条数
            bmjbdata: [],
            fjmbdata: [],
            codeOrName: "",
            selectedRowKeys: [],
            super_item_id: ""
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
                    const bmjbdata = []      // 版本
                    data.datas[0].forEach((option, i) => {
                        bmjbdata.push({
                            text: option.display_name,
                            value: option.fact_value,
                            super_item_id: option.super_item_id
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

    // 选择编码级别
    onSelect = (value, option) => {
        this.setState({
            super_item_id: option.props.super_item_id
        })
    }

    selectChange = (value, option) => {
        this.props.form.setFieldsValue({
            super_dict_id: value,
            fact_value: option.props.item,
        })
        this.setState({
            codeOrName: value,
            super_dict_id: option.props.item_id
        })
    }

    searchChange = (value, option) => {
        this.props.form.setFieldsValue({
            super_dict_id: value,
        })
        this.setState({
            codeOrName: value
        }, () => this.fjmbSearch())
    }

    fjmbSearch = () => {
        window.Fetch(urlBefore + '/base/queryParentDictItems_dictManager.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                codeOrName: this.state.codeOrName,          //编码或名称
                dict_code: this.state.query.dict_code,      //代码编码
                super_item_id: this.state.super_item_id     //选中的编码级别的父id
            })
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const fjmbdata = []
                data.datas.forEach((option, i) => {
                    fjmbdata.push({
                        text: option.display_name,
                        value: option.fact_value,
                        item_id: option.item_id
                    })
                })
                this.setState({
                    fjmbdata
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
            if (!values.itemlevel) {
                message.warning('请选择编码等级')
            } else if (!this.state.super_dict_id && values.itemlevel !== "1") {
                message.warning('请选择父级编码')
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
                        super_item_id: this.state.super_dict_id,    // 父项目id
                        item_spelling: values.item_spelling,        // 英文名称
                    })
                }).then(res =>
                    res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        message.success('新增成功！')
                        this.props.form.setFieldsValue({
                            itemlevel: '',
                            super_dict_id: "",
                            fact_value: "",
                            display_name: '',
                            item_spelling: ''
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
        const {bmjbdata, fjmbdata, selectedRowKeys} = this.state;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };
        const columns = [
            {
                title: 'ATC编码',
                dataIndex: 'fact_value',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: 'ATC中文名称',
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
        // 编码级别
        const bmjbTag = bmjbdata ? bmjbdata.map((bmjb, i) => {
            return <Option value={bmjb.value} super_item_id={bmjb.super_item_id} key={i}>{bmjb.text}</Option>
        }) : ""

        // 父级编码-名称
        const fjmbTag = fjmbdata ? fjmbdata.map((fjmb, i) => {
            return <Option value={fjmb.value + " - " + fjmb.text} item={fjmb.value} item_id={fjmb.item_id}
                           key={i}>{fjmb.value + " - " + fjmb.text}</Option>
        }) : ""
        return (
            <div className={style.scroll + " " + style.padding}>
                <Row>
                    <Col span={16}>
                        <Button type="primary">ATC编码</Button>
                        <Row>
                            <Col span={7}>
                                <FormItem
                                    {...formItemLayout}
                                    label="编码级别"
                                >
                                    {getFieldDecorator("itemlevel", {})(
                                        <Select style={{width: "100%"}} onSelect={this.onSelect}
                                                placeholder="请选择编码级别1/3/4/5/7">
                                            {bmjbTag}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={1}/>
                            <Col span={16}>
                                <FormItem
                                    {...formItemLayout}
                                    label="父级编码-名称"
                                >
                                    {getFieldDecorator("super_dict_id", {})(
                                        <Select
                                            mode="combobox"
                                            placeholder="请输入编码或名称"
                                            style={{width: '100%'}}
                                            onFocus={this.fjmbSearch}
                                            onSelect={this.selectChange}
                                            onSearch={this.searchChange}
                                        >
                                            {fjmbTag}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={7}>
                                <FormItem
                                    {...formItemLayout}
                                    label="编码"
                                >
                                    {getFieldDecorator("fact_value", {})(
                                        <Input placeholder="自动带入父级编码"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={1}/>
                            <Col span={16}>
                                <FormItem
                                    {...formItemLayout}
                                    label="中文名称"
                                >
                                    {getFieldDecorator("display_name", {})(
                                        <Input placeholder="请输入中文名称"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}/>
                            <Col span={16}>
                                <FormItem
                                    {...formItemLayout}
                                    label="英文名称"
                                >
                                    {getFieldDecorator("item_spelling", {})(
                                        <Input placeholder="请输入英文名称"/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={21}><p>ATC编码列表</p></Col>
                            <Col span={1}><Icon type="plus-circle" title="新增" className={style.IconAdd}
                                                onClick={this.AddClick}/></Col>
                            <Col span={1}><Icon type="minus-circle-o" title="删除" className={style.IconAdd}
                                                onClick={this.deleteTreatGroup}/></Col>
                            {/*<Col span={1}><Icon type="tool" title="修改" className={style.IconAdd} /></Col>*/}
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

AtcCon = Form.create()(AtcCon);
export default AtcCon;

