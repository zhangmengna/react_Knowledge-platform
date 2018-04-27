// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import AddTag from './../../../components/modules/addTag/addTag';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;

class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            tags: [],   // 选中标签的id
            amendData: {}
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.icd10Id) {
            window.Fetch(urlBefore + "/jcxx/query_icd10.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({icd10Id: this.state.query.icd10Id ? this.state.query.icd10Id : ""})
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
        const url = this.state.query.icd10Id ? "/jcxx/modify_icd10.action" : "/jcxx/insert_icd10.action"
        this.props.form.validateFields((err, values) => {
            if (!values.aka120) {
                message.error("请输入诊断编码");
                return false;
            } else if (!values.aka121) {
                message.error("请输入诊断名称");
                return false;
            } else {
                obj = {

                    aka120: values.aka120 ? encodeURIComponent(encodeURIComponent(values.aka120)) : "",                  // 诊断编码
                    aka121: values.aka121,                  // 诊断名称	                           
                    suborderName: values.suborderName,      // 亚目名称	                             
                    suborderCode: values.suborderCode ? encodeURIComponent(encodeURIComponent(values.suborderCode)) : "",      // 亚目编码
                    chapterName: values.chapterName,        // 章名称                         
                    chapterCode: values.chapterCode ? encodeURIComponent(encodeURIComponent(values.chapterCode)) : "",        // 章编码	
                    sectionName: values.sectionName,        // 节名称
                    sectionCode: values.sectionCode ? encodeURIComponent(encodeURIComponent(values.sectionCode)) : "",        // 节编码
                    categoryName: values.categoryName,      // 类目名称
                    categoryCode: values.categoryCode ? encodeURIComponent(encodeURIComponent(values.categoryCode)) : "",      // 类目编码
                    tags: this.state.tags,                  // 标签信息
                    icd10Id: this.state.query.icd10Id ? this.state.query.icd10Id : ""
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
                        this.state.query.icd10Id ?
                            message.success("修改成功！") :
                            message.success("新增成功！");
                        this.props.back()
                    } else {
                        message.error(data.result);
                    }
                }).catch(error => {
                    message.error(error.message);
                })
            }
        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {query, amendData} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };
        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.icd10Id ? "修改" : "新增"}{query.second}
                                </h4>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="诊断编码"
                                        >
                                            {getFieldDecorator("aka120", {
                                                initialValue: amendData ? amendData.aka120 : ''
                                            })(
                                                <Input placeholder="请输入诊断编码" disabled={query.icd10Id ? true : false}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={17}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="诊断名称"
                                        >
                                            {getFieldDecorator("aka121", {
                                                initialValue: amendData ? amendData.aka121 : ''
                                            })(
                                                <Input placeholder="请输入诊断名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="亚目编码"
                                        >
                                            {getFieldDecorator("suborderCode", {
                                                initialValue: amendData ? amendData.suborderCode : ''
                                            })(
                                                <Input placeholder="请输入亚目编码"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={17}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="亚目名称"
                                        >
                                            {getFieldDecorator("suborderName", {
                                                initialValue: amendData ? amendData.suborderName : ''
                                            })(
                                                <Input placeholder="请输入亚目名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="章编码"
                                        >
                                            {getFieldDecorator("chapterCode", {
                                                initialValue: amendData ? amendData.chapterCode : ''
                                            })(
                                                <Input placeholder="请输入章编码"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={17}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="章名称"
                                        >
                                            {getFieldDecorator("chapterName", {
                                                initialValue: amendData ? amendData.chapterName : ''
                                            })(
                                                <Input placeholder="请输入章名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="节编码"
                                        >
                                            {getFieldDecorator("sectionCode", {
                                                initialValue: amendData ? amendData.sectionCode : ''
                                            })(
                                                <Input placeholder="请输入节编码"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={17}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="节名称"
                                        >
                                            {getFieldDecorator("sectionName", {
                                                initialValue: amendData ? amendData.sectionName : ''
                                            })(
                                                <Input placeholder="请输入节名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="类目编码"
                                        >
                                            {getFieldDecorator("categoryCode", {
                                                initialValue: amendData ? amendData.categoryCode : ''
                                            })(
                                                <Input placeholder="请输入类目编码"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={17}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="类目名称"
                                        >
                                            {getFieldDecorator("categoryName", {
                                                initialValue: amendData ? amendData.categoryName : ''
                                            })(
                                                <Input placeholder="请输入类目名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={8} style={{padding: "20px"}}>
                                <AddTag searchObj={{
                                    busiType: query.busiType,
                                    libId: query.libId,
                                    libType: query.libType,
                                    dataId: this.state.query.icd10Id
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
