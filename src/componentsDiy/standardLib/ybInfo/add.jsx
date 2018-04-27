// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select, Icon} from 'antd';
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
            tags: [],   // 选中标签的id
            ybAka070data: [],  // 医保剂型
            ybAka081data: [],  // 用药途径
            ybAka065data: [],  // 报销类别
            cateVersiondata: [],  // 目录版本
            amendData: {}
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.ybDrugId) {
            window.Fetch(urlBefore + "/jcxx/query_ka01Insurance.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({ybDrugId: this.state.query.ybDrugId ? this.state.query.ybDrugId : ""})
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
            body: 'data=' + JSON.stringify({"dict_code": 'ybAKA070,BKA219,AKA065,cateVersion'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const ybAka070data = [],     // 医保剂型
                    ybAka081data = [],  // 用药途径
                    ybAka065data = [],  // 报销类别
                    cateVersiondata = []  // 目录版本
                data.datas[0].forEach((option, i) => {
                    ybAka070data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    ybAka081data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[2].forEach((option, i) => {
                    ybAka065data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[3].forEach((option, i) => {
                    cateVersiondata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    ybAka070data: ybAka070data,
                    ybAka081data: ybAka081data,
                    ybAka065data: ybAka065data,
                    cateVersiondata: cateVersiondata
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
        const url = this.state.query.ybDrugId ? "/jcxx/modify_ka01Insurance.action" : "/jcxx/insert_ka01Insurance.action"
        this.props.form.validateFields((err, values) => {
            if (!values.ybCode) {
                message.warning("请输入医保编码");
                return false;
            } else if (!values.ybName) {
                message.warning("请输入医保名称");
                return false;
            } else {
                obj = {
                    ybCode: values.ybCode,     // 医保编码                     
                    ybName: values.ybName,     // 医保名称
                    ybAka070: values.ybAka070, // 医保剂型
                    ybAka081: values.ybAka081, // 医保用药途径
                    ybAka065: values.ybAka065, // 医保报销类别
                    cateVersion: values.cateVersion, //目录版本
                    tip: values.tip,// 政策提醒 
                    tags: this.state.tags,   // 标签信息
                    descr: values.descr,    // 备注	  
                    ybDrugId: this.state.query.ybDrugId ? this.state.query.ybDrugId : ""
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
                        this.state.query.ybDrugId ?
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
        const {query, amendData, ybAka070data, ybAka081data, ybAka065data, cateVersiondata} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };

        // 医保剂型
        const ybAka070Tag = ybAka070data ? ybAka070data.map((ybAka070, i) => {
            return <Option value={ybAka070.value} key={i}>{ybAka070.text}</Option>
        }) : ""

        // 用药途径
        const ybAka081Tag = ybAka081data ? ybAka081data.map((ybAka081, i) => {
            return <Option value={ybAka081.value} key={i}>{ybAka081.text}</Option>
        }) : ""

        // 报销类别
        const ybAka065Tag = ybAka065data ? ybAka065data.map((ybAka065, i) => {
            return <Option value={ybAka065.value} key={i}>{ybAka065.text}</Option>
        }) : ""

        // 目录版本
        const cateVersionTag = cateVersiondata ? cateVersiondata.map((cateVersion, i) => {
            return <Option value={cateVersion.value} key={i}>{cateVersion.text}</Option>
        }) : ""

        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.ybDrugId ? "修改" : "新增"}{query.second}
                                </h4>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="医保编码"
                                        >
                                            {getFieldDecorator("ybCode", {
                                                initialValue: amendData ? amendData.ybCode : ''
                                            })(
                                                <Input placeholder="请输入编码" onBlur={this.ybCodeBlur}
                                                       disabled={query.ybDrugId ? true : false}/>
                                            )}
                                        </FormItem></Col>
                                    <Col span={1}/>
                                    <Col span={16}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="医保名称"
                                        >
                                            {getFieldDecorator("ybName", {
                                                initialValue: amendData ? amendData.ybName : ''
                                            })(
                                                <Input placeholder="请输入名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                </Row>

                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="报销类别"
                                        >
                                            {getFieldDecorator("ybAka065", {
                                                initialValue: amendData ? amendData.ybAka065 : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择报销类别">
                                                    {ybAka065Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    <Col span={16}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="目录版本"
                                        >
                                            {getFieldDecorator("cateVersion", {
                                                initialValue: amendData ? amendData.cateVersion : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择目录版本">
                                                    {cateVersionTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="剂型"
                                        >
                                            {getFieldDecorator("ybAka070", {
                                                initialValue: amendData ? amendData.ybAka070 : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择剂型">
                                                    {ybAka070Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    {/*<Col span={16}>*/}
                                        {/*<FormItem*/}
                                            {/*{...formItemLayout}*/}
                                            {/*label="用药途径"*/}
                                        {/*>*/}
                                            {/*{getFieldDecorator("ybAka081", {*/}
                                                {/*initialValue: amendData ? amendData.ybAka081 : ''*/}
                                            {/*})(*/}
                                                {/*<Select style={{width: '100%'}} placeholder="请选择用药途径">*/}
                                                    {/*{ybAka081Tag}*/}
                                                {/*</Select>*/}
                                            {/*)}*/}
                                        {/*</FormItem>*/}
                                    {/*</Col>*/}
                                    {/*<Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>*/}
                                </Row>
                                <Row>
                                    <Col span={23}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="政策提醒"
                                        >
                                            {getFieldDecorator("tip", {
                                                initialValue: amendData ? amendData.tip : ''
                                            })(
                                                <Input type="textarea" placeholder="请输入政策提醒" rows={3}
                                                       autosize={{minRows: 3, maxRows: 3}}/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                </Row>
                                <Row>
                                    <Col span={23}>
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
                                    <Col span={1}/>
                                </Row>
                            </Col>
                            <Col span={8} style={{padding: "20px"}}>
                                <AddTag searchObj={{
                                    busiType: query.busiType,
                                    libId: query.libId,
                                    libType: query.libType,
                                    dataId: this.state.query.ybDrugId
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
