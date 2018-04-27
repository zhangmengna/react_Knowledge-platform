// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select, InputNumber} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;
const Option = Select.Option;

class DDD extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            tags: [],               // 选中标签的id
            ypdata: {},             // 药品信息
            AKE118data: [],         // 剂量单位
            AKE130data: [],         // 包装单位
            rowNo: this.props.query.rowNo, // 当前行的总行数
        }
    }

    componentDidMount() {
        // 查询修改信息
        this.queryPreOrNext()

        // 字典
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'AKE118,AKE130'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const AKE118data = [],          // 剂量单位
                    AKE130data = []             // 包装单位
                data.datas[0].forEach((option, i) => {
                    AKE118data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    AKE130data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    AKE118data,
                    AKE130data
                })
            } else {
                message.warning(data.result);
            }
        }).catch((error) => {
            message.error(error);
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({
                query: nextProps.query
            })
        }
    }

    // 点击上一页
    prevCleck = () => {
        this.setState({
            rowNo: this.state.rowNo - 1
        }, () => this.queryPreOrNext())
    }

    // 点击下一页
    nextCleck = () => {
        this.setState({
            rowNo: this.state.rowNo + 1
        }, () => this.queryPreOrNext())
    }

    // 点击上一页  下一页 查询信息 
    queryPreOrNext = () => {
        window.Fetch(urlBefore + "/jcxx/queryDDD_ka01.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                rowNo: String(this.state.rowNo), // 当前行的总行数
                data: {
                    tagId: this.state.query.tagId, //标签id
                    libType: this.state.query.libType, //库类型
                    condition: this.state.query.condition
                }
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    ypdata: data.datas[0],
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error);
        })
    }

    // 规格和日最大剂量失去焦点
    blur = () => {
        this.props.form.validateFields((err, values) => {
            if (values.ake128 && values.aka075) {
                this.CountValue()
            } else if (!values.aka075) {
                message.warning('请输入规格!')
            }
        })
    }

    // 计算日最大使用量 ----- 使用天数/单位 ----- 月最大开药剂量
    CountValue = () => {
        let ake129Value = "", ake131Value = "", ake133Value = ""
        this.props.form.validateFields((err, values) => {
            ake129Value = values.ake128 / values.aka075
            ake131Value = values.bka097 / ake129Value
            ake133Value = 30 / ake131Value
        })
        this.props.form.setFieldsValue({
            ake129: ake129Value.toFixed(2),
            ake131: ake131Value.toFixed(2),
            ake133: ake133Value.toFixed(2)
        })
    }

    // submit
    submit = (e) => {
        e.preventDefault();
        let obj = {}
        this.props.form.validateFields((err, values) => {
            obj = {
                drugId: this.state.query.drugId, // 数据id
                aka075: values.aka075,           // 规格(数)
                ake128: values.ake128,           // 日最大剂量(数值)
                ake118: values.ake118,           // 剂量单位(码表3.39)
                ake129: values.ake129,           // 日最大使用数量
                ake130: values.ake130,           // 包装单位(码表3.38)
                ake131: values.ake131,           // 每单位用几天=转化比/日最大使用数量
                ake133: values.ake133,           // 月最大开药剂量 = 30/每单位用几天
            }
            window.Fetch(urlBefore + "/jcxx/saveDDD_ka01.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify(obj)
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success("保存成功！");
                    this.props.back()
                } else {
                    message.warning(data.result);
                }
            }).catch(error => {
                message.error(error);
            })
        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {query, ypdata, AKE118data, AKE130data} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };

        // 剂量单位
        const AKE118Tag = AKE118data ? AKE118data.map((AKE118, i) => {
            return <Option value={AKE118.value} key={i}>{AKE118.text}</Option>
        }) : ""

        // 包装单位
        const AKE130Tag = AKE130data ? AKE130data.map((AKE130, i) => {
            return <Option value={AKE130.value} key={i}>{AKE130.text}</Option>
        }) : ""

        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second} three="DDD信息"/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={12} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4> 药品信息 </h4>
                                <Row>
                                    <Col span={10}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品编码"
                                        >
                                            {getFieldDecorator("ake001", {
                                                initialValue: ypdata ? ypdata.ake001 : ''
                                            })(
                                                <Input readOnly/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={13}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品名称"
                                        >
                                            {getFieldDecorator("ake002", {
                                                initialValue: ypdata ? ypdata.ake002 : ''
                                            })(
                                                <Input readOnly/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <FormItem
                                    {...formItemLayout}
                                    label="剂型"
                                >
                                    {getFieldDecorator("aka070", {
                                        initialValue: ypdata ? ypdata.aka070 : ''
                                    })(
                                        <Input readOnly/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="规格"
                                >
                                    {getFieldDecorator("aka074", {
                                        initialValue: ypdata ? ypdata.aka074 : ''
                                    })(
                                        <Input readOnly/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="转换比"
                                >
                                    {getFieldDecorator("bka097", {
                                        initialValue: ypdata ? ypdata.bka097 : ''
                                    })(
                                        <Input readOnly/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="用法用量"
                                >
                                    {getFieldDecorator("ake132", {
                                        initialValue: ypdata ? ypdata.ake132 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12} style={{padding: "20px"}}>
                                <h4>
                                    DDD信息
                                    <Button type="primary" className="fr" onClick={this.nextCleck}
                                            readOnly={this.state.rowNo === this.props.query.count}> 下一页 </Button>
                                    <Button type="primary" className="fr" onClick={this.prevCleck}
                                            readOnly={this.state.rowNo === 1}> 上一页 </Button>
                                </h4>
                                <Row>
                                    <Col span={10}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="规格"
                                        >
                                            {getFieldDecorator("aka075", {
                                                initialValue: ypdata ? ypdata.aka075 : ""
                                            })(
                                                <InputNumber min={0} onBlur={this.blur} style={{width: '100%'}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={13}/>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="日最大剂量"
                                        >
                                            {getFieldDecorator("ake128", {
                                                initialValue: ypdata ? ypdata.ake128 : ""
                                            })(
                                                <InputNumber min={0} onBlur={this.blur} style={{width: '100%'}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={13}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="剂量单位"
                                        >
                                            {getFieldDecorator("ake118", {
                                                initialValue: ypdata ? ypdata.ake118 : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择剂量单位">
                                                    {AKE118Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="日最大使用量"
                                        >
                                            {getFieldDecorator("ake129", {
                                                initialValue: ypdata ? ypdata.ake129 : ''
                                            })(
                                                <InputNumber min={0} style={{width: '100%'}} readOnly/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={13}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="最小使用包装"
                                        >
                                            {getFieldDecorator("ake130", {
                                                initialValue: ypdata ? ypdata.ake130 : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择包装单位">
                                                    {AKE130Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="使用天数/单位"
                                        >
                                            {getFieldDecorator("ake131", {
                                                initialValue: ypdata ? ypdata.ake131 : ''
                                            })(
                                                <InputNumber min={0} readOnly style={{width: '100%'}}/>
                                            )}
                                        </FormItem>

                                    </Col>
                                    <Col span={1}/>
                                    <Col span={13}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="月最大开药剂量"
                                        >
                                            {getFieldDecorator("ake133", {
                                                initialValue: ypdata ? ypdata.ake133 : ''
                                            })(
                                                <InputNumber min={0} readOnly style={{width: '100%'}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <footer>
                            <Button onClick={this.props.back}>取消</Button>
                            <Button type="primary" htmlType="submit">确定</Button>
                        </footer>
                    </Form>
                </div>
                <style>
                    {`
                        .fr{float: right;margin-left: 15px;}
                    `}
                </style>
            </div>
        )
    }
}

DDD = Form.create()(DDD);
export default DDD;
