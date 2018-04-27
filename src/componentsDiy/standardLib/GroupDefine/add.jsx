// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Icon, Select, Table, InputNumber} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import styleAdd from './add.less'
import AddTag from './../../../components/modules/addTag/addTag';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;
const Option = Select.Option;

class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            tags: [],   // 选中标签的id
            amendData: {},
            zdlbdata: [],
            bzbbdata: [],   // 版本
            zdlbKey: '',
            tableList: [],
            codeOrName: "",
            selectedRowKeys: [] //列表选中
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.dgdId) {
            window.Fetch(urlBefore + "/bzpznew/query_diseaseGroupDefine.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({dgdId: this.state.query.dgdId ? this.state.query.dgdId : ""})
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        amendData: data.datas[0],
                        tableList: data.datas[0] ? data.datas[0].diags : ""
                    })
                } else {
                    message.warning(data.result);
                }
            }).catch(error => {
                message.error(error.message);
            })
        }

        // 字典
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'bzbb'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const bzbbdata = []      // 版本
                data.datas[0].forEach((option, i) => {
                    bzbbdata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    bzbbdata
                })
            } else {
                message.warning(data.result);
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({
                query: nextProps.query
            })
        }
    }

    selectChange = (value, option) => {
        this.props.form.setFieldsValue({
            zdlb: value,
        })
        this.setState({
            codeOrName: value,
            zdlbKey: option.props.icd10Id
        })
    }

    searchChange = (value, option) => {
        this.props.form.setFieldsValue({
            zdlb: value,
        })
        this.setState({
            codeOrName: value
        }, () => this.zdlbSearch())
    }

    // 诊断列表查询
    zdlbSearch = () => {
        window.Fetch(urlBefore + "/jcxx/queryExcludelist_icd10.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                codeOrName: this.state.codeOrName,
                diags: this.state.tableList
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    zdlbdata: data.datas
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }

    // 点击 + 添加列表信息
    AddClick = () => {
        let tableList = this.state.tableList, zdlbdata = this.state.zdlbdata;
        if (!this.state.zdlbKey) {
            message.warning('请选择正确的编码和名称！');
        } else {
            zdlbdata.forEach((zdlb, i) => {
                if (zdlb.icd10Id === this.state.zdlbKey) {
                    tableList.push({
                        aka120: zdlb.aka120,
                        aka121: zdlb.aka121
                    })
                }
            })
        }
        this.setState({
            tableList,
            codeOrName: '',
            zdlbKey: ''
        }, () => {
            this.props.form.setFieldsValue({
                zdlb: '',
            })
        })
    }

    // 点击 - 删除列表信息
    delete = () => {
        let tableList = this.state.tableList, selectedRowKeys = this.state.selectedRowKeys;
        for (let i = 0; i < tableList.length; i++) {
            for (let j = 0; j < selectedRowKeys.length; j++) {
                if (selectedRowKeys[j] === tableList[i].aka120) {
                    tableList.splice(i, 1)
                    selectedRowKeys.splice(j, 1)
                    i--;
                }
            }
        }
        this.setState({
            tableList,
            selectedRowKeys
        })
    }

    tagsChange = (id) => {
        this.setState({
            tags: id
        })
    }

    // submit
    submit = (e) => {
        e.preventDefault();
        let obj = {}
        const url = this.state.query.dgdId ? "/bzpznew/modify_diseaseGroupDefine.action" : "/bzpznew/insert_diseaseGroupDefine.action"
        this.props.form.validateFields((err, values) => {
            if (!values.dgdCode) {
                message.error("请输入病种编码");
                return false;
            } else if (!values.dgdName) {
                message.error("请输入病种名称");
                return false;
            } else if (!values.dgdScode) {
                message.error("请输入标准分值");
                return false;
            } else {
                obj = {
                    dgdCode: values.dgdCode,                // 病种编码
                    dgdName: values.dgdName,                // 病种名称
                    dgdScode: values.dgdScode,              // 标准分值
                    dgdVer: values.dgdVer,                  // 病种版本 见码表 3.28
                    levelThree: values.levelThree,          // 3级系数
                    levelTwo: values.levelTwo,              // 2级系数
                    levelTwoBelow: values.levelTwoBelow,    // 1级系数
                    dgdDescr: values.dgdDescr,              // 备注
                    tags: this.state.tags,                  // 标签信息
                    diags: this.state.tableList,
                    dgdId: this.state.query.dgdId ? this.state.query.dgdId : ""
                }
                window.Fetch(urlBefore + url, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    credentials: 'include',
                    body: "data=" + JSON.stringify(obj)
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.state.query.dgdId ?
                            message.success("修改成功！") :
                            message.success("新增成功！");
                        this.props.back()
                    } else {
                        message.warning(data.result);
                    }
                }).catch(error => {
                    message.error(error.message);
                })
            }
        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {query, amendData, zdlbdata, bzbbdata} = this.state;
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
                title: '诊断编码',
                dataIndex: 'aka120',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '诊断名称',
                dataIndex: 'aka121',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ]

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys
                })
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
            }),
        };

        const zdlbTag = zdlbdata ? zdlbdata.map((zdlb, i) => {
            return <Option value={zdlb.aka120 + " - " + zdlb.aka121} icd10Id={zdlb.icd10Id}
                           key={zdlb.icd10Id}>{zdlb.aka120 + " - " + zdlb.aka121}</Option>
        }) : ""

        // 版本
        const bzbbTag = bzbbdata ? bzbbdata.map((bzbb, i) => {
            return <Option value={bzbb.value} key={i}>{bzbb.text}</Option>
        }) : ""
        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.dgdId ? "修改" : "新增"}{query.second}
                                </h4>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="编码"
                                        >
                                            {getFieldDecorator("dgdCode", {
                                                initialValue: amendData ? amendData.dgdCode : ''
                                            })(
                                                <Input placeholder="请输入编码" disabled={query.dgdId ? true : false}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="名称"
                                        >
                                            {getFieldDecorator("dgdName", {
                                                initialValue: amendData ? amendData.dgdName : ''
                                            })(
                                                <Input placeholder="请输入名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="版本"
                                        >
                                            {getFieldDecorator("dgdVer", {
                                                initialValue: amendData ? amendData.dgdVer : ''
                                            })(
                                                <Select placeholder="请选择版本">
                                                    {bzbbTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}><p>标准分值</p></Col>
                                    <Col span={1}/>
                                    <Col span={17}><p>机构系数</p></Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem>
                                            {getFieldDecorator("dgdScode", {
                                                initialValue: amendData ? amendData.dgdScode : ''
                                            })(
                                                <InputNumber style={{width: "100%"}} placeholder="请输入标准分值"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={5}>
                                        <FormItem>
                                            3级 {getFieldDecorator("levelThree", {
                                            initialValue: amendData ? amendData.levelThree : ''
                                        })(
                                            <InputNumber placeholder="请输入" className={styleAdd.input}/>
                                        )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={5}>
                                        <FormItem>
                                            2级 {getFieldDecorator("levelTwo", {
                                            initialValue: amendData ? amendData.levelTwo : ''
                                        })(
                                            <InputNumber placeholder="请输入" className={styleAdd.input}/>
                                        )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={5}>
                                        <FormItem>
                                            1级 {getFieldDecorator("levelTwoBelow", {
                                            initialValue: amendData ? amendData.levelTwoBelow : ''
                                        })(
                                            <InputNumber placeholder="请输入" className={styleAdd.input}/>
                                        )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={22}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="诊断列表"
                                        >
                                            {getFieldDecorator("zdlb", {})(
                                                <Select
                                                    mode="combobox"
                                                    placeholder="请输入编码或名称"
                                                    style={{width: '100%'}}
                                                    onFocus={this.zdlbSearch}
                                                    onSelect={this.selectChange}
                                                    onSearch={this.searchChange}
                                                >
                                                    {zdlbTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={styleAdd.IconAdd}
                                                        onClick={this.AddClick}/></Col>
                                    <Col span={1}><Icon type="minus-circle-o" className={styleAdd.IconAdd}
                                                        onClick={this.delete}/></Col>
                                </Row>
                                <Table
                                    bordered
                                    columns={columns}
                                    rowSelection={rowSelection}
                                    dataSource={this.state.tableList}
                                    rowKey={record => record.aka120}
                                    onChange={this.onChange}
                                    pagination={false}
                                />
                                <FormItem
                                    {...formItemLayout}
                                    label="备注"
                                >
                                    {getFieldDecorator("dgdDescr", {
                                        initialValue: amendData ? amendData.dgdDescr : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入备注内容" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={8} style={{padding: "20px"}}>
                                <AddTag searchObj={{
                                    busiType: query.busiType,
                                    libId: query.libId,
                                    libType: query.libType,
                                    dataId: this.state.query.dgdId
                                }}
                                        tagsChange={this.tagsChange}
                                />
                            </Col>
                        </Row>
                        <footer>
                            <Button onClick={this.props.back}>取消</Button>
                            <Button type="primary" htmlType="submit">确定</Button>
                        </footer>
                    </Form>
                </div>
                <style>
                    {` .ant-form-item{ margin-bottom: 6px; } `}
                </style>
            </div>
        )
    }
}

Add = Form.create()(Add);
export default Add;
