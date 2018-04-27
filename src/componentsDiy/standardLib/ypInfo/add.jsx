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
            tags: [],   // 选中标签的id
            AKA070data: [],     // 剂型值
            aka070: '',
            largeClass: '',
            midClass: '',
            minClass: '',  // 通过16位编码获取的对象
            BKA219data: [],     // 剂型值
            instructName: "",   // 药品说明书
            instructData: [],
            instructValue: "",  // 药品说明书默认值
            instructCode: "",
            atcText: "",      // atc查询条件
            atcLevel: "5",     // atc等级
            ATCshow: true,      // ATC-5 ATC-7 
            item_id: "",        // ATC-5  item_id
            ATC_5Data: [],
            ATC_7Data: [],
            ATC_5Value: "",
            ATC_7Value: "",
            ATC_5Code: "",
            ATC_7Code: "",
            amendData: {}    // 修改回显数据
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.drugId) {
            window.Fetch(urlBefore + "/jcxx/query_ka01.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({drugId: this.state.query.drugId ? this.state.query.drugId : ""})
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        amendData: data.datas[0],
                        instructValue: data.datas[0].bkz150,
                        aka070: data.datas[0].aka070,
                        largeClass: data.datas[0].largeClass,
                        midClass: data.datas[0].midClass,
                        minClass: data.datas[0].minClass,
                        ATC_5Value: data.datas[0].bkz256,
                        ATC_7Value: data.datas[0].bkz257,
                        ATC_5Code: data.datas[0].bkz254,
                        ATC_7Code: data.datas[0].bkz255,
                    })
                } else {
                    message.warning(data.result);
                }
            }).catch(error => {
                message.error(error);
            })
        }

        // 字典
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'AKA070,BKA219'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const AKA070data = [],     // 剂型值
                    BKA219data = []    // 用药途径
                data.datas[0].forEach((option, i) => {
                    AKA070data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    BKA219data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    AKA070data: AKA070data,
                    BKA219data: BKA219data
                })
            } else {
                message.warning(data.result);
            }
        }).catch((error) => {
            message.error(error);
        });
        this.instructSearch()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({
                query: nextProps.query
            })
        }
    }

    ypxxChange = (value) => {
        if (value === "02") {
            this.setState({
                ATCshow: false
            })
        } else {
            this.setState({
                ATCshow: true
            })
        }
    }

    // 20位药品编码
    ake001Blur = () => {
        this.props.form.validateFields((err, values) => {
            values.ake001 && values.ake001.length === 20 ?
                window.Fetch(urlBefore + '/jcxx/queryByCode16_ka01.action', {
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
                            aka070: data.datas.aka070,
                            largeClass: data.datas.largeClass,
                            midClass: data.datas.midClass,
                            minClass: data.datas.minClass
                        })
                    } else {
                        message.warning(data.result);
                    }
                }).catch((error) => {
                    message.error(error);
                })
                : message.error("请输入20位编码");
        })
    }

    // ATC
    atcSearch = () => {
        window.Fetch(urlBefore + "/jcxx/queryAtcInfos_ka01.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                atcText: "",      // atc查询条件
                atcLevel: this.state.atcLevel,     // atc等级
                item_id: this.state.atcLevel === "7" ? this.state.item_id : ""
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                const ATC_5Data = [],
                    ATC_7Data = []
                data.datas.forEach((datas, i) => {
                    if (datas.itemlevel === 5) {
                        ATC_5Data.push({
                            value: datas.fact_value,
                            text: datas.display_name + "(" + datas.fact_value + ")",
                            item_id: datas.item_id
                        })
                    } else if (datas.itemlevel === 7) {
                        ATC_7Data.push({
                            value: datas.fact_value,
                            text: datas.display_name + "(" + datas.fact_value + ")"
                        })
                    }
                })
                this.setState({
                    ATC_5Data: ATC_5Data,
                    ATC_7Data: ATC_7Data
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error);
        })
    }

    atcDataSearch = () => {
        window.Fetch(urlBefore + "/jcxx/queryAtcInfos_ka01.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                atcText: this.state.atcText,      // atc查询条件
                atcLevel: this.state.atcLevel,     // atc等级
                item_id: this.state.atcLevel === "7" ? this.state.item_id : ""
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let ATC_5Value = this.state.ATC_5Value, ATC_5Code = this.state.ATC_5Code,
                    ATC_7Data = []
                if (data.datas[0]) {
                    if (data.datas[0].itemlevel && data.datas[0].itemlevel === 5) {
                        data.datas[0].subList.forEach((subList, i) => {
                            ATC_7Data.push({
                                value: subList.fact_value,
                                text: subList.display_name + "(" + subList.fact_value + ")"
                            })
                        })
                    } else if (data.datas[0].itemlevel && data.datas[0].itemlevel === 7) {
                        ATC_5Value = data.datas[0].parent.display_name + "(" + data.datas[0].parent.fact_value + ")"
                        ATC_5Code = data.datas[0].parent.fact_value
                    }
                }
                this.setState({
                    ATC_5Value: ATC_5Value,
                    ATC_5Code: ATC_5Code,
                    ATC_7Data: ATC_7Data
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error);
        })
    }

    // 药品说明书模糊查询
    searchChange = (value) => {
        this.setState({
            instructName: value,
            instructValue: value
        }, () => this.instructSearch())
    }

    selectChange = (value, option) => {
        this.setState({
            instructName: value,
            instructValue: value,
            instructCode: option.props.id
        })
    }

    // 药品说明书搜索
    instructSearch = () => {
        window.Fetch(urlBefore + '/jcxx/querylistNP_ka01Instruct.action', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            body: 'data=' + JSON.stringify({instructName: this.state.instructName})
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                const instructData = []
                data.datas.forEach((datas, i) => {
                    instructData.push({
                        value: datas.bkz149,
                        text: datas.bkz150
                    })
                })
                this.setState({
                    instructData
                })
            } else {
                message.warning(data.message);
            }
        }).catch((error) => {
            message.error(error);
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
        if (this.state.query.drugId) {
            this.props.form.validateFields((err, values) => {
                if (!values.ake002) {
                    message.error("请输入药品名称");
                    return false;
                }
                obj = {
                    ake001: values.ake001, // 药品编码
                    ake002: values.ake002, // 药品名称
                    aka081: values.aka081, // 用药途径
                    aka074: values.aka074, // 规格
                    bka097: values.bka097, // 转换比
                    aka063: values.ypxx, // 收费类别（见码表3.8）
                    bkz149: this.state.instructCode,  // 说明书编码
                    bkz254: this.state.ATC_5Code, // ATC5编码
                    bkz255: this.state.ATC_7Code, //  ATC7编码
                    bkz256: this.state.ATC_5Value, //  ATC5名称
                    bkz257: this.state.ATC_7Value, //  ATC7名称
                    descr: values.descr,  // 备注
                    tags: this.state.tags,   // 标签信息
                    drugId: this.state.query.drugId
                }
            })
            window.Fetch(urlBefore + "/jcxx/modify_ka01.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify(obj)
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success("修改成功！");
                    this.props.back()
                } else {
                    message.warning(data.result);
                }
            }).catch(error => {
                message.error(error);
            })
        } else {
            this.props.form.validateFields((err, values) => {
                if (!values.ake002) {
                    message.error("请输入药品名称");
                    return false;
                } else if (!values.ake001) {
                    message.error("请输入20位药品编码");
                    return false;
                }
                if (values.ake001.length === 20) {
                    obj = {
                        ake001: values.ake001, // 药品编码
                        ake002: values.ake002, // 药品名称
                        aka081: values.aka081, // 用药途径
                        aka074: values.aka074, // 规格
                        bka097: values.bka097, // 转换比
                        aka063: values.ypxx, // 收费类别（见码表3.8）
                        bkz149: this.state.instructCode,  // 说明书编码
                        bkz254: this.state.ATC_5Code, // ATC5编码
                        bkz255: this.state.ATC_7Code, //  ATC7编码
                        bkz256: this.state.ATC_5Value, //  ATC5名称
                        bkz257: this.state.ATC_7Value, //  ATC7名称
                        descr: values.descr,  // 备注
                        tags: this.state.tags,   // 标签信息
                        drugId: this.state.query.drugId
                    }
                    window.Fetch(urlBefore + "/jcxx/insert_ka01.action", {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        credentials: 'include',
                        body: "data=" + JSON.stringify(obj)
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            message.success("新增成功！");
                            this.props.back()
                        } else {
                            message.warning(data.result);
                        }
                    }).catch(error => {
                        message.error(error);
                    })
                }
            })


        }
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {
            query, AKA070data, BKA219data, ATCshow, aka070, largeClass, midClass, minClass, instructData,
            instructValue, ATC_5Value, ATC_7Value, ATC_5Data, ATC_7Data, amendData
        } = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };
        // 剂型
        const AKA070Tag = AKA070data ? AKA070data.map((AKA070, i) => {
            return <Option value={AKA070.value} key={i}>{AKA070.text}</Option>
        }) : ""
        // 用药途径
        const BKA219Tag = BKA219data ? BKA219data.map((BKA219, i) => {
            return <Option value={BKA219.value} key={i}>{BKA219.text}</Option>
        }) : ""
        // ATC_5
        const ATC_5Tag = ATC_5Data ? ATC_5Data.map((ATC_5Data, i) => {
            return <Option key={ATC_5Data.text} id={ATC_5Data.value} item_id={ATC_5Data.item_id}
                           title={ATC_5Data.text}>{ATC_5Data.text}</Option>
        }) : ""
        // ATC_7
        const ATC_7Tag = ATC_7Data.map((ATC_7Data, i) => {
            return <Option key={ATC_7Data.text} id={ATC_7Data.value} title={ATC_7Data.text}>{ATC_7Data.text}</Option>
        })
        // 药品说明书
        const instructDataTag = instructData.map((instructData, i) => {
            return <Option key={instructData.text} id={instructData.value}
                           title={instructData.text}>{instructData.text}</Option>
        })
        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.drugId ? "修改" : "新增"}{query.second}
                                </h4>
                                <Row>
                                    <Col span={23}>
                                        <FormItem>
                                            {getFieldDecorator("ypxx", {
                                                initialValue: "01"
                                            })(
                                                <Select style={{width: '100%'}} onChange={this.ypxxChange}>
                                                    <Option value="01">西药</Option>
                                                    <Option value="02">中成药</Option>
                                                    <Option value="03" disabled>中草药</Option>
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品编码"
                                        >
                                            {getFieldDecorator("ake001", {
                                                initialValue: amendData ? amendData.ake001 : ''
                                            })(
                                                <Input placeholder="请输入20位编码" onBlur={this.ake001Blur}
                                                       disabled={query.drugId ? true : false}/>
                                            )}
                                        </FormItem></Col>
                                    <Col span={1}/>
                                    <Col span={16}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="通用名"
                                        >
                                            {getFieldDecorator("ake002", {
                                                initialValue: amendData ? amendData.ake002 : ''
                                            })(
                                                <Input placeholder="请输入名称"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                </Row>
                                <div className={largeClass ? "" : "hidden"}>
                                    <Icon type="info-circle" className={style.IconInfo}/>
                                    <Breadcrumb>
                                        <Breadcrumb.Item>{largeClass}</Breadcrumb.Item>
                                        <Breadcrumb.Item>{midClass}</Breadcrumb.Item>
                                        <Breadcrumb.Item>{minClass}</Breadcrumb.Item>
                                    </Breadcrumb>
                                </div>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="剂型"
                                        >
                                            {getFieldDecorator("aka070", {
                                                initialValue: aka070
                                            })(
                                                <Select style={{width: '100%'}} disabled>
                                                    {AKA070Tag}
                                                </Select>
                                            )}
                                        </FormItem></Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    <Col span={9}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="给药途径"
                                        >
                                            {getFieldDecorator("aka081", {
                                                initialValue: amendData ? amendData.aka081 : ''
                                            })(
                                                <Select disabled style={{width: '100%'}}>
                                                    {BKA219Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
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
                                    <Col span={1}/>
                                </Row>
                                <Row className={ATCshow ? "" : "hidden"}>
                                    <Col span={16}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="ATC-5"
                                        >
                                            <Select
                                                style={{width: '100%'}}
                                                value={ATC_5Value}
                                                disabled
                                            >
                                                {ATC_5Tag}
                                            </Select>
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="转换比"
                                        >
                                            {getFieldDecorator("bka097", {
                                                initialValue: amendData ? amendData.bka097 : ''
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
                                <Row>
                                    <Col span={16}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="ATC-7"
                                        >
                                            <Select
                                                style={{width: '100%'}}
                                                value={ATC_7Value}
                                                disabled
                                            >
                                                {ATC_7Tag}
                                            </Select>
                                        </FormItem>
                                    </Col>
                                    <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品说明书"
                                        >
                                            <Select
                                                mode="combobox"
                                                style={{width: '100%'}}
                                                placeholder="请选择药品说明书"
                                                onFocus={this.instructSearch}
                                                onSelect={this.selectChange}
                                                onSearch={this.searchChange}
                                                value={instructValue}
                                            >
                                                {instructDataTag}
                                            </Select>
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
                                    dataId: this.state.query.drugId
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
