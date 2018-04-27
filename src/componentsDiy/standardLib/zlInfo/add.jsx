// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select, Breadcrumb, Icon, InputNumber} from 'antd';
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
            aka063data: [],  // 收费类别
            aka052data: [],  // 计价单位
            amendData: {}
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.treatId) {
            window.Fetch(urlBefore + "/jcxx/query_ka02.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({treatId: this.state.query.treatId ? this.state.query.treatId : ""})
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
            body: 'data=' + JSON.stringify({"dict_code": 'AKA063,BKA076'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const aka063data = [],     // 收费类别
                    aka052data = []   //计价单位
                data.datas[0].forEach((option, i) => {
                    aka063data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    aka052data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    aka063data: aka063data,
                    aka052data: aka052data,
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

    // 编码
    ake001Blur = () => {
        this.props.form.validateFields((err, values) => {
            values.ake001 ?
                window.Fetch(urlBefore + '/jcxx/queryLevelInfos_ka02.action', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    },
                    body: 'data=' + JSON.stringify({ake001: values.ake001})
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            byCode_default: data.datas
                        })
                    } else {
                        message.warning(data.message);
                    }
                }).catch((error) => {
                    message.error(error.message);
                })
                : message.error("请输入诊疗编码");
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
        const url = this.state.query.treatId ? "/jcxx/modify_ka02.action" : "/jcxx/insert_ka02.action"
        this.props.form.validateFields((err, values) => {
            if (!values.ake001) {
                message.warning("请输入诊疗编码");
                return false;
            } else if (!values.ake002) {
                message.warning("请输入诊疗名称");
                return false;
            } else {
                obj = {
                    ake001: values.ake001,          // 项目编码                           
                    ake002: values.ake002,          // 项目名称                     
                    aka095: values.aka095,          // 项目内涵	                             
                    aka097: values.aka097,          // 除外内容	                             
                    aka052: values.aka052,          // 计价单位	                             
                    price: values.price,            // 价格	                                 
                    valueDesc: values.valueDesc, 	// 计价说明	                           
                    aka063: values.aka063,          // 收费类别(见附表)	 
                    aka165: values.aka165,          // 项目分类代码（用于相似度）	           
                    threea: values.threea,          // 三级甲等单价	                         
                    threeb: values.threeb,          // 三级乙等单价	                         
                    second: values.second,          // 二级单价	                             
                    first: values.first,            // 一级单价
                    descr: values.descr,            // 备注	  
                    tags: this.state.tags,          // 标签信息
                    treatId: this.state.query.treatId ? this.state.query.treatId : ""
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
                        this.state.query.treatId ?
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
        const {query, amendData, aka063data, aka052data, byCode_default} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };

        // 收费类别
        const aka063Tag = aka063data ? aka063data.map((aka063, i) => {
            return <Option value={aka063.value} key={i}>{aka063.text}</Option>
        }) : ""

        // 计价单位
        const aka052Tag = aka052data ? aka052data.map((aka052, i) => {
            return <Option value={aka052.value} key={i}>{aka052.text}</Option>
        }) : ""

        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.treatId ? "修改" : "新增"}{query.second}
                                </h4>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="诊疗编码"
                                        >
                                            {getFieldDecorator("ake001", {
                                                initialValue: amendData ? amendData.ake001 : ''
                                            })(
                                                <Input placeholder="请输入编码" onBlur={this.ake001Blur}
                                                       disabled={query.treatId ? true : false}/>
                                            )}
                                        </FormItem></Col>
                                    <Col span={1}/>
                                    <Col span={9}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="诊疗名称"
                                        >
                                            {getFieldDecorator("ake002", {
                                                initialValue: amendData ? amendData.ake002 : ''
                                            })(
                                                <Input placeholder="请输入名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="收费类别"
                                        >
                                            {getFieldDecorator("aka063", {
                                                initialValue: amendData ? amendData.aka063 : ''
                                            })(
                                                <Select placeholder="请选择收费类别" style={{width: '100%'}}>
                                                    {aka063Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                </Row>
                                <Row>
                                    <Col span={10} className={byCode_default.code2 || amendData.code2 ? "" : "hidden"}>
                                        <Icon type="info-circle" className={style.IconInfo}/>
                                        <Breadcrumb>
                                            <Breadcrumb.Item>{amendData.code2 ? amendData.code2 : byCode_default.code2 ? byCode_default.code2 : ""}</Breadcrumb.Item>
                                            <Breadcrumb.Item>{amendData.code2Name ? amendData.code2Name : byCode_default.code2Name ? byCode_default.code2Name : ""}</Breadcrumb.Item>
                                        </Breadcrumb>
                                    </Col>
                                    <Col span={12} className={byCode_default.code4 || amendData.code4 ? "" : "hidden"}>
                                        <Icon type="info-circle" className={style.IconInfo}/>
                                        <Breadcrumb>
                                            <Breadcrumb.Item>{amendData.code4 ? amendData.code4 : byCode_default.code4 ? byCode_default.code4 : ""}</Breadcrumb.Item>
                                            <Breadcrumb.Item>{amendData.code4Name ? amendData.code4Name : byCode_default.code4Name ? byCode_default.code4Name : ""}</Breadcrumb.Item>
                                        </Breadcrumb>
                                    </Col>
                                    <Col span={10} className={byCode_default.code6 || amendData.code6 ? "" : "hidden"}>
                                        <Icon type="info-circle" className={style.IconInfo}/>
                                        <Breadcrumb>
                                            <Breadcrumb.Item>{amendData.code6 ? amendData.code6 : byCode_default.code6 ? byCode_default.code6 : ""}</Breadcrumb.Item>
                                            <Breadcrumb.Item>{amendData.code6Name ? amendData.code6Name : byCode_default.code6Name ? byCode_default.code6Name : ""}</Breadcrumb.Item>
                                        </Breadcrumb>
                                    </Col>
                                    <Col span={12} className={byCode_default.code9 || amendData.code9 ? "" : "hidden"}>
                                        <Icon type="info-circle" className={style.IconInfo}/>
                                        <Breadcrumb>
                                            <Breadcrumb.Item>{amendData.code9 ? amendData.code9 : byCode_default.code9 ? byCode_default.code9 : ""}</Breadcrumb.Item>
                                            <Breadcrumb.Item>{amendData.code9Name ? amendData.code9Name : byCode_default.code9Name ? byCode_default.code9Name : ""}</Breadcrumb.Item>
                                        </Breadcrumb>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="计价单位"
                                        >
                                            {getFieldDecorator("aka052", {
                                                initialValue: amendData ? amendData.aka052 : ''
                                            })(
                                                <Select placeholder="请选择计价单位" style={{width: '100%'}}>
                                                    {aka052Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    <Col span={4}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="价格"
                                        >
                                            {getFieldDecorator("price", {
                                                initialValue: amendData ? amendData.price : ''
                                            })(
                                                <InputNumber
                                                    style={{width: '100%'}}
                                                    placeholder="请输入价格"
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={2}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="三级甲等"
                                        >
                                            {getFieldDecorator("threea", {
                                                initialValue: amendData ? amendData.threea : ''
                                            })(
                                                <InputNumber
                                                    style={{width: '100%'}}
                                                    placeholder="请输入"
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={2}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="三级乙等"
                                        >
                                            {getFieldDecorator("threeb", {
                                                initialValue: amendData ? amendData.threeb : ''
                                            })(
                                                <InputNumber
                                                    style={{width: '100%'}}
                                                    placeholder="请输入"
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={2}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="二级"
                                        >
                                            {getFieldDecorator("second", {
                                                initialValue: amendData ? amendData.second : ''
                                            })(
                                                <InputNumber
                                                    style={{width: '100%'}}
                                                    placeholder="请输入"
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={2}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="一级"
                                        >
                                            {getFieldDecorator("first", {
                                                initialValue: amendData ? amendData.first : ''
                                            })(
                                                <InputNumber
                                                    style={{width: '100%'}}
                                                    placeholder="请输入"
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                </Row>
                                <FormItem
                                    {...formItemLayout}
                                    label="项目内涵"
                                >
                                    {getFieldDecorator("aka095", {
                                        initialValue: amendData ? amendData.aka095 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入项目内涵" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="除外内容"
                                >
                                    {getFieldDecorator("aka097", {
                                        initialValue: amendData ? amendData.aka097 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入除外内容" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
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
                                    dataId: this.state.query.treatId
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
