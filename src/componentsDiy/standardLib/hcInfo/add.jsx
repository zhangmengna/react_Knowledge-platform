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
            itemOrigindata: [],  // 收费类别
            aka065data: [],  // 耗材等级
            aka179data: [],  // 耗材类别
            aka176data: [],  // 高/低值
            amendData: {}
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.materialId) {
            window.Fetch(urlBefore + "/jcxx/query_ka03.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({materialId: this.state.query.materialId ? this.state.query.materialId : ""})
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
            body: 'data=' + JSON.stringify({"dict_code": 'itemOrigin,AKA065,AKA179,isOrNot'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const itemOrigindata = [],     // 收费类别
                    aka065data = [],   //耗材等级
                    aka179data = [],     // 耗材类别
                    aka176data = []        // 高/低值
                data.datas[0].forEach((option, i) => {
                    itemOrigindata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    aka065data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[2].forEach((option, i) => {
                    aka179data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[3].forEach((option, i) => {
                    aka176data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    itemOrigindata: itemOrigindata,
                    aka065data: aka065data,
                    aka179data: aka179data,
                    aka176data: aka176data,
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
        const url = this.state.query.materialId ? "/jcxx/modify_ka03.action" : "/jcxx/insert_ka03.action"
        this.props.form.validateFields((err, values) => {
            if (!values.ake001) {
                message.error("请输入耗材编码");
                return false;
            } else if (!values.ake002) {
                message.error("请输入耗材名称");
                return false;
            } else {
                obj = {
                    ake001: values.ake001,          // 项目编码                           
                    ake002: values.ake002,          // 项目名称
                    aka074: values.aka074,          // 规格	                           
                    itemOrigin: values.itemOrigin,  // 产地、项目来源（见码表3.12）
                    aka176: values.aka176,          // 高值耗材标志(见码表3.13)
                    aka179: values.aka179,          // 耗材分类	（见码表3.14）
                    aka065: values.aka065,          // 收费项目等级(见码表3.7)	 
                    aka165: values.aka165,          // 项目分类代码（用于相似度）
                    tags: this.state.tags,          // 标签信息
                    descr: values.descr,            // 备注	  
                    materialId: this.state.query.materialId ? this.state.query.materialId : ""
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
                        this.state.query.materialId ?
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
        const {query, amendData, itemOrigindata, aka065data, aka179data, aka176data} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };

        // 产地分类
        const itemOriginTag = itemOrigindata ? itemOrigindata.map((itemOrigin, i) => {
            return <Option value={itemOrigin.value} key={i}>{itemOrigin.text}</Option>
        }) : ""

        // 耗材等级
        const aka065Tag = aka065data ? aka065data.map((aka065, i) => {
            return <Option value={aka065.value} key={i}>{aka065.text}</Option>
        }) : ""

        // 高/低值
        const aka176Tag = aka176data ? aka176data.map((aka176, i) => {
            return <Option value={aka176.value} key={i}>{aka176.text}</Option>
        }) : ""

        // 耗材分类
        const aka179Tag = aka179data ? aka179data.map((aka179, i) => {
            return <Option value={aka179.value} key={i}>{aka179.text}</Option>
        }) : ""
        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.materialId ? "修改" : "新增"}{query.second}
                                </h4>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="耗材编码"
                                        >
                                            {getFieldDecorator("ake001", {
                                                initialValue: amendData ? amendData.ake001 : ''
                                            })(
                                                <Input placeholder="请输入编码" onBlur={this.ake001Blur}
                                                       disabled={query.materialId ? true : false}/>
                                            )}
                                        </FormItem></Col>
                                    <Col span={1}/>
                                    <Col span={9}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="耗材名称"
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
                                            label="产地分类"
                                        >
                                            {getFieldDecorator("itemOrigin", {
                                                initialValue: amendData ? amendData.itemOrigin : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择，国产/进口">
                                                    {itemOriginTag}
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
                                            label="规格"
                                        >
                                            {getFieldDecorator("aka074", {
                                                initialValue: amendData ? amendData.aka074 : ''
                                            })(
                                                <Input placeholder="请输入"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    <Col span={16}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="耗材等级"
                                        >
                                            {getFieldDecorator("aka065", {
                                                initialValue: amendData ? amendData.aka065 : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择">
                                                    {aka065Tag}
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
                                            label="是否高值耗材"
                                        >
                                            {getFieldDecorator("aka176", {
                                                initialValue: amendData ? amendData.aka176 : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择">
                                                    {aka176Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    <Col span={16}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="耗材类别"
                                        >
                                            {getFieldDecorator("aka179", {
                                                initialValue: amendData ? amendData.aka179 : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择">
                                                    {aka179Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
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
                                    dataId: this.state.query.materialId
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
