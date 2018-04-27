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
        if (this.state.query.insId) {
            window.Fetch(urlBefore + "/jcxx/query_ka01Instruct.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({insId: this.state.query.insId ? this.state.query.insId : ""})
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
        const url = this.state.query.insId ? "/jcxx/modify_ka01Instruct.action" : "/jcxx/insert_ka01Instruct.action"
        this.props.form.validateFields((err, values) => {
            if (!values.aka061) {
                message.warning("请输入药品通用名");
                return false;
            } else {
                obj = {
                    bkz149: values.bkz149,                                                                // 药品说明书编码
                    aka061: values.aka061 ? encodeURIComponent(encodeURIComponent(values.aka061)) : "",   // 药品通用名
                    aka062: values.aka062 ? encodeURIComponent(encodeURIComponent(values.aka062)) : "",   // 商品名
                    ake123: values.ake123 ? encodeURIComponent(encodeURIComponent(values.ake123)) : "",   // 适应症
                    ake132: values.ake132 ? encodeURIComponent(encodeURIComponent(values.ake132)) : "",   // 用法用量
                    bkz182: values.bkz182 ? encodeURIComponent(encodeURIComponent(values.bkz182)) : "",   // 禁忌症
                    bkz193: values.bkz193 ? encodeURIComponent(encodeURIComponent(values.bkz193)) : "",   // 药物不良反应
                    bkz183: values.bkz183 ? encodeURIComponent(encodeURIComponent(values.bkz183)) : "",   // 孕妇和哺乳期用药描述
                    aka187: values.aka187 ? encodeURIComponent(encodeURIComponent(values.aka187)) : "",   // 儿童用药描述
                    bkz184: values.bkz184 ? encodeURIComponent(encodeURIComponent(values.bkz184)) : "",   // 老年人用药描述
                    bkz185: values.bkz185 ? encodeURIComponent(encodeURIComponent(values.bkz185)) : "",   // 药物相互作用
                    aka074: values.aka074 ? encodeURIComponent(encodeURIComponent(values.aka074)) : "",   // 规格
                    ake112: values.ake112 ? encodeURIComponent(encodeURIComponent(values.ake112)) : "",   // 包装
                    bkz195: values.bkz195 ? encodeURIComponent(encodeURIComponent(values.bkz195)) : "",   // 药物过量
                    bka249: values.bka249 ? encodeURIComponent(encodeURIComponent(values.bka249)) : "",   // 其他注意事项
                    bkz196: values.bkz196 ? encodeURIComponent(encodeURIComponent(values.bkz196)) : "",   // 贮藏
                    aka098: values.aka098 ? encodeURIComponent(encodeURIComponent(values.aka098)) : "",   // 生产单位
                    tags: this.state.tags,                                                                // 标签信息
                    insId: this.state.query.insId ? this.state.query.insId : ""
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
                        this.state.query.insId ?
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
                                    {query.insId ? "修改" : "新增"}{query.second}
                                </h4>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品说明书编码"
                                        >
                                            {getFieldDecorator("bkz149", {
                                                initialValue: amendData ? amendData.bkz149 : ''
                                            })(
                                                <Input placeholder="请输入药品说明书编码"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={9}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品通用名"
                                        >
                                            {getFieldDecorator("aka061", {
                                                initialValue: amendData ? amendData.aka061 : ''
                                            })(
                                                <Input placeholder="请输入药品通用名"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={7}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="商品名"
                                        >
                                            {getFieldDecorator("aka062", {
                                                initialValue: amendData ? amendData.aka062 : ''
                                            })(
                                                <Input placeholder="请输入商品名"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <FormItem
                                    {...formItemLayout}
                                    label="适应症"
                                >
                                    {getFieldDecorator("ake123", {
                                        initialValue: amendData ? amendData.ake123 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入适应症" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="用法用量"
                                >
                                    {getFieldDecorator("ake132", {
                                        initialValue: amendData ? amendData.ake132 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入用法用量" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="禁忌症"
                                >
                                    {getFieldDecorator("bkz182", {
                                        initialValue: amendData ? amendData.bkz182 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入禁忌症" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="药物不良反应"
                                >
                                    {getFieldDecorator("bkz193", {
                                        initialValue: amendData ? amendData.bkz193 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入药物不良反应" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="孕妇和哺乳期用药描述"
                                >
                                    {getFieldDecorator("bkz183", {
                                        initialValue: amendData ? amendData.bkz183 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入孕妇和哺乳期用药描述" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="儿童用药描述"
                                >
                                    {getFieldDecorator("aka187", {
                                        initialValue: amendData ? amendData.aka187 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入儿童用药描述" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="老年人用药描述"
                                >
                                    {getFieldDecorator("bkz184", {
                                        initialValue: amendData ? amendData.bkz184 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入老年人用药描述" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="药物相互作用"
                                >
                                    {getFieldDecorator("bkz185", {
                                        initialValue: amendData ? amendData.bkz185 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入药物相互作用" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="规格"
                                >
                                    {getFieldDecorator("aka074", {
                                        initialValue: amendData ? amendData.aka074 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入规格" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="包装"
                                >
                                    {getFieldDecorator("ake112", {
                                        initialValue: amendData ? amendData.ake112 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入包装" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>

                                <FormItem
                                    {...formItemLayout}
                                    label="药物过量"
                                >
                                    {getFieldDecorator("bkz195", {
                                        initialValue: amendData ? amendData.bkz195 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入药物过量" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="其他注意事项"
                                >
                                    {getFieldDecorator("bka249", {
                                        initialValue: amendData ? amendData.bka249 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入其他注意事项" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="贮藏"
                                >
                                    {getFieldDecorator("bkz196", {
                                        initialValue: amendData ? amendData.bkz196 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入贮藏" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <Row>
                                    <Col span={24}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="生产单位"
                                        >
                                            {getFieldDecorator("aka098", {
                                                initialValue: amendData ? amendData.aka098 : ''
                                            })(
                                                <Input placeholder="请输入生产单位"/>
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
                                    dataId: this.state.query.insId
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
