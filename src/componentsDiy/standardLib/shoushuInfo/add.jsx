// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import AddTag from './../../../components/modules/addTag/addTag';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;
const Option = Select.Option;


class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            byCode_default: {},     // 面包屑
            tags: [],   // 选中标签的id
            attrdata: [],  // 收费类别
            versiondata: [],  // 计价单位
            amendData: {}
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.icd9Id) {
            window.Fetch(urlBefore + "/jcxx/query_icd9.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({icd9Id: this.state.query.icd9Id ? this.state.query.icd9Id : ""})
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        amendData: data.datas[0]
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
            body: 'data=' + JSON.stringify({"dict_code": 'attr,icd9bb'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const attrdata = [],     // 属性
                    versiondata = []   //版本
                data.datas[0].forEach((option, i) => {
                    attrdata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    versiondata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    attrdata: attrdata,
                    versiondata: versiondata,
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

    tagsChange = (id) => {
        this.setState({
            tags: id
        })
    }

    // submit
    submit = (e) => {
        e.preventDefault();
        let obj = {}
        const url = this.state.query.icd9Id ? "/jcxx/modify_icd9.action" : "/jcxx/insert_icd9.action"
        this.props.form.validateFields((err, values) => {
            if (!values.opsCode) {
                message.error("请输入手术编码");
                return false;
            } else if (!values.opsName) {
                message.error("请输入手术名称");
                return false;
            } else {
                obj = {
                    opsCode: values.opsCode,  // 手术编码
                    opsName: values.opsName,  // 手术名称	                           
                    attr: values.attr,  // 属性	                             
                    version: values.version,  // 版本
                    descr: values.descr,    // 备注	  
                    tags: this.state.tags,   // 标签信息
                    icd9Id: this.state.query.icd9Id ? this.state.query.icd9Id : ""
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
                        this.state.query.icd9Id ?
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
        const {query, amendData, attrdata, versiondata} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };

        // 属性
        const attrTag = attrdata ? attrdata.map((attr, i) => {
            return <Option value={attr.value} key={i}>{attr.text}</Option>
        }) : ""

        // 版本
        const versionTag = versiondata ? versiondata.map((version, i) => {
            return <Option value={version.value} key={i}>{version.text}</Option>
        }) : ""

        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.icd9Id ? "修改" : "新增"}{query.second}
                                </h4>
                                <Row>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="手术编码"
                                        >
                                            {getFieldDecorator("opsCode", {
                                                initialValue: amendData ? amendData.opsCode : ''
                                            })(
                                                <Input placeholder="请输入编码" disabled={query.icd9Id ? true : false}/>
                                            )}
                                        </FormItem></Col>
                                    <Col span={1}/>
                                    <Col span={15}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="手术名称"
                                        >
                                            {getFieldDecorator("opsName", {
                                                initialValue: amendData ? amendData.opsName : ''
                                            })(
                                                <Input placeholder="请输入名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="属性"
                                        >
                                            {getFieldDecorator("attr", {
                                                initialValue: amendData ? amendData.attr : ''
                                            })(
                                                <Select placeholder="请选择属性" style={{width: '100%'}}>
                                                    {attrTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={15}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="版本"
                                        >
                                            {getFieldDecorator("version", {
                                                initialValue: amendData ? amendData.version : ''
                                            })(
                                                <Select placeholder="请选择版本" style={{width: '100%'}}>
                                                    {versionTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <FormItem
                                    {...formItemLayout}
                                    label="备注"
                                >
                                    {getFieldDecorator("descr", {
                                        initialValue: amendData ? amendData.descr : ''
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
                                    dataId: this.state.query.icd9Id
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
            </div>
        )
    }
}

Add = Form.create()(Add);
export default Add;
