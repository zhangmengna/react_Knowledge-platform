// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select, Icon, InputNumber} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import styleAdd from './add.less';
import AddTag from './../../../components/modules/addTag/addTag';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import Cwaj from './cwaj'

const FormItem = Form.Item;
const Option = Select.Option;

class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            tags: [],   // 选中标签的id
            zblxdata: [],    // 指标分类
            ysfwdata: [], // 运算范围
            sysTypedata: [],   // 适合项目
            shzfzddata: [],  // 适合支付制度
            cwaj: [],      // 除外案件
            cataNameList: [],    // 除外案件值
            amendData: {},
            czfdata: [], //操作符
            zhnamedata: [],  // 变量
            visualExp: "",   // 计算公式中文
            exp: "",
            addShow: true,
            cwajShow: false,
            cwajQuery: {}
        }
    }

    componentWillMount() {
        this.cwajSearch()

        // 查询修改信息
        if (this.state.query.kpiId) {
            window.Fetch(urlBefore + "/kpi/query_kpi.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({
                    kpiId: this.state.query.kpiId ? this.state.query.kpiId : ""
                })
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

        // 查询操作符
        window.Fetch(urlBefore + '/kpi/queryBdsyxList_kpi.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: {}
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    czfdata: data.datas.czf,
                    zhnamedata: data.datas.zhname
                })
            } else {
                message.warning(data.result);
            }
        }).catch((error) => {
            message.error(error.message);
        });

        // 字典
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'zblx,ysfw,sysType,shzfzd,cwaj'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const zblxdata = [],    // 指标分类
                    ysfwdata = [],      // 运算范围
                    sysTypedata = [],   // 适合项目
                    shzfzddata = [],    // 适合支付制度
                    cwajdata = []       // 除外案件
                data.datas[0].forEach((option, i) => {
                    zblxdata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    ysfwdata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[2].forEach((option, i) => {
                    sysTypedata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[3].forEach((option, i) => {
                    shzfzddata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[4].forEach((option, i) => {
                    cwajdata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    zblxdata,
                    ysfwdata,
                    sysTypedata,
                    shzfzddata,
                    cwajdata
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

    cwajSearch = () => {
        // 查询除外案件
        window.Fetch(urlBefore + '/kpi/querylistNP_exceptCatalog.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                cataName: ""
            })
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const cataNameList = [];
                data.datas.forEach((datas, i) => {
                    cataNameList.push({
                        text: datas.cataName,
                        value: datas.exceptId
                    })
                })
                this.setState({
                    cataNameList: cataNameList
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }

    // 点击操作符
    czfClick = (e, ename, value) => {
        let visualExp = this.state.visualExp, exp = this.state.exp;
        this.setState({
            visualExp: visualExp += value,
            exp: exp += ename,
        }, () => {
            this.props.form.setFieldsValue({
                exp: this.state.visualExp,
            })
        })
    }

    // 重置计算公式
    czChange = () => {
        this.setState({
            visualExp: "",
            exp: "",
        }, () => {
            this.props.form.setFieldsValue({
                exp: "",
            })
        })
    }

    // 校验操作符
    expChange = () => {
        const visualExp = this.state.visualExp,
            amendvisualExp = this.state.amendData.visualExp
        if (visualExp.length > 0 || amendvisualExp.length > 0) {
            window.Fetch(urlBefore + "/kpi/check_kpi.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({
                    visualExp: encodeURIComponent(encodeURIComponent(visualExp)) ||     // 计算公式（中文）
                    encodeURIComponent(encodeURIComponent(amendvisualExp))
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success(data.message);
                } else {
                    message.warning(data.result);
                }
            }).catch(error => {
                message.error(error.message);
            })
        } else {
            message.warning('计算公式不能为空！')
        }
    }

    tagsChange = (id) => {
        this.setState({
            tags: id
        })
    }

    back = () => {
        this.setState({
            addShow: true,
            cwajShow: false,
        }, () => this.cwajSearch())
    }

    // 除外案件1查看
    check = () => {
        this.props.form.validateFields((err, values) => {
            if (values.except) {
                let exceptId = '';
                exceptId = values.except
                this.setState({
                    cwajShow: true,
                    addShow: false,
                    cwajQuery: {
                        first: this.state.query.first,
                        second: this.state.query.second,
                        exceptId
                    }
                })
            } else {
                message.warning("请选择除外案件1")
            }
        })
    }

    // 除外案件2查看
    check2 = () => {
        this.props.form.validateFields((err, values) => {
            if (values.except2) {
                let exceptId = '';
                exceptId = values.except2
                this.setState({
                    cwajShow: true,
                    addShow: false,
                    cwajQuery: {
                        first: this.state.query.first,
                        second: this.state.query.second,
                        exceptId
                    }
                })
            } else {
                message.warning("请选择除外案件2")
            }
        })
    }

    // 除外案件3查看
    check3 = () => {
        this.props.form.validateFields((err, values) => {
            if (values.except3) {
                let exceptId = '';
                exceptId = values.except3
                this.setState({
                    cwajShow: true,
                    addShow: false,
                    cwajQuery: {
                        first: this.state.query.first,
                        second: this.state.query.second,
                        exceptId
                    }
                })
            } else {
                message.warning("请选择除外案件3")
            }
        })
    }

    // 除外案件新增
    insert = () => {
        this.setState({
            cwajShow: true,
            addShow: false,
            cwajQuery: {
                first: this.state.query.first,
                second: this.state.query.second,
            }
        })
    }

    exp2Change = (e) => {
        const value = e.target.value;
        valueexp2(value)
    }

    // submit
    submit = (e) => {
        e.preventDefault();
        let obj = {}
        const url = this.state.query.kpiId ? "/kpi/modify_kpi.action" : "/kpi/insert_kpi.action"
        this.props.form.validateFields((err, values) => {
            if (!values.kpiCode) {
                message.error("请输入指标编码");
                return false;
            } else if (!values.name) {
                message.error("请输入指标名称");
                return false;
            } else if (!values.type) {
                message.error("请输入指标分类");
                return false;
            } else if (!this.state.amendData.visualExp && !this.state.visualExp) {
                message.error("请输入计算公式");
                return false;
            } else {
                if (values.exp2 && !valueexp2(values.exp2)) {
                    values.exp2 = '';
                }
                obj = {
                    kpiCode: values.kpiCode,
                    name: values.name,//指标名称
                    sys: values.sys,// 适合项目 （见码表3.21）
                    type: values.type,//指标分类 （见码表3.20）
                    visualExp: encodeURIComponent(encodeURIComponent(this.state.visualExp)) ||
                    encodeURIComponent(encodeURIComponent(this.state.amendData.visualExp)),//计算公式(中文展示)
                    exp: this.state.exp,//计算公式
                    range: values.range,// 运算范围
                    threshold: values.threshold,// 指标阈值
                    exp2: values.exp2,// 可疑度量表达式
                    // kpiWeight: values.kpiWeight,//指标权重
                    // step: values.step,//指标展示顺序（筛查结论用）
                    payType: values.payType,//支付制度
                    except: values.except,// 除外案件
                    except2: values.except2,// 除外案件
                    except3: values.except3,// 除外案件
                    referValue: values.referValue,// 参考值
                    useLevel: values.useLevel,// 实施分级
                    descr: values.descr,
                    tags: this.state.tags,
                    kpiId: this.state.query.kpiId ? this.state.query.kpiId : ""
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
                        this.state.query.kpiId ?
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
        const {query, amendData, czfdata, zhnamedata, zblxdata, ysfwdata, sysTypedata, shzfzddata, cataNameList} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };

        // 操作符
        const czfTag = czfdata ? czfdata.map((czf, i) => {
            return <Button onClick={(e, ename, value) => this.czfClick(e, czf.ename, czf.ename)}
                           className={styleAdd.czfLeft} data-ename={czf.ename} value={czf.ename}
                           key={i}>{czf.ename}</Button>
        }) : ""

        // 操作符变量
        const zhnameTag = zhnamedata ? zhnamedata.map((zhname, i) => {
            return <Button onClick={(e, ename, value) => this.czfClick(e, zhname.ename, zhname.zhname)}
                           className={styleAdd.czfRight} data-ename={zhname.ename} value={zhname.zhname}
                           key={i}>{zhname.zhname}</Button>
        }) : ""

        // 指标分类
        const zblxTag = zblxdata ? zblxdata.map((zblx, i) => {
            return <Option value={zblx.value} key={i}>{zblx.text}</Option>
        }) : ""

        // 运算范围
        const ysfwTag = ysfwdata ? ysfwdata.map((ysfw, i) => {
            return <Option value={ysfw.value} key={i}>{ysfw.text}</Option>
        }) : ""

        // 适合项目  
        const sysTypeTag = sysTypedata ? sysTypedata.map((sysType, i) => {
            return <Option value={sysType.value} key={i}>{sysType.text}</Option>
        }) : ""

        // 适合支付制度
        const shzfzdTag = shzfzddata ? shzfzddata.map((shzfzd, i) => {
            return <Option value={shzfzd.value} key={i}>{shzfzd.text}</Option>
        }) : ""

        // 除外案件1
        const cataNameTag = cataNameList ? cataNameList.map((cataNameList, i) => {
            return <Option value={cataNameList.value} key={i}>{cataNameList.text}</Option>
        }) : ""


        return (
            <div>
                <div className={this.state.addShow ? "" : "hidden"}>
                    <BreadcrumbCustom first={query.first} second={query.second}/>
                    <div className={style.add}>
                        <Form onSubmit={this.submit}>
                            <Row>
                                <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                    <h4>
                                        {query.kpiId ? "修改" : "新增"}{query.second}
                                    </h4>
                                    <Row>
                                        <Col span={6}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="指标编码"
                                            >
                                                {getFieldDecorator("kpiCode", {
                                                    initialValue: amendData ? amendData.kpiCode : ''
                                                })(
                                                    <Input placeholder="请输入编码" disabled={query.kpiId ? true : false}/>
                                                )}
                                            </FormItem></Col>
                                        <Col span={1}/>
                                        <Col span={9}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="指标名称"
                                            >
                                                {getFieldDecorator("name", {
                                                    initialValue: amendData ? amendData.name : ''
                                                })(
                                                    <Input placeholder="请输入名称"/>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={1}/>
                                        <Col span={6}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="分类"
                                            >
                                                {getFieldDecorator("type", {
                                                    initialValue: amendData ? amendData.type : ''
                                                })(
                                                    <Select style={{width: '100%'}} placeholder="请选择分类">
                                                        {zblxTag}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    </Row>
                                    <Row>
                                        <Col span={20}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="计算公式"
                                            >
                                                {getFieldDecorator("exp", {
                                                    initialValue: amendData ? amendData.visualExp : ""
                                                })(
                                                    <Input type="textarea" placeholder="请输入计算公式" rows={3}
                                                           autosize={{minRows: 3, maxRows: 3}} readOnly/>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={3}>
                                            <Button type="primary" onClick={this.expChange} style={{
                                                margin: "33px 0 10px 10px",
                                                display: "block",
                                                width: "75px"
                                            }}>校验</Button>
                                            <Button onClick={this.czChange}
                                                    style={{width: "75px", display: "block"}}>重置</Button>
                                        </Col>
                                        <Col span={1}/>
                                    </Row>
                                    <Row style={{marginBottom: "10px"}}>
                                        <Col span={18}>{zhnameTag}</Col>
                                        <Col span={1}/>
                                        <Col span={4}>{czfTag}</Col>
                                        <Col span={1}/>
                                    </Row>
                                    <Row>
                                        <Col span={6}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="运算范围"
                                            >
                                                {getFieldDecorator("range", {
                                                    initialValue: amendData ? amendData.range : ''
                                                })(
                                                    <Select style={{width: '100%'}} placeholder="请选择运算范围">
                                                        {ysfwTag}
                                                    </Select>
                                                )}
                                            </FormItem></Col>
                                        <Col span={1}/>
                                        <Col span={9}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="适合项目"
                                            >
                                                {getFieldDecorator("sys", {
                                                    initialValue: amendData ? amendData.sys : ''
                                                })(
                                                    <Select style={{width: '100%'}} placeholder="请选择适合项目">
                                                        {sysTypeTag}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                        <Col span={6}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="适合支付制度"
                                            >
                                                {getFieldDecorator("payType", {
                                                    initialValue: amendData ? amendData.payType : ''
                                                })(
                                                    <Select style={{width: '100%'}} placeholder="请选择适合支付制度">
                                                        {shzfzdTag}
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
                                                label="阈值"
                                            >
                                                {getFieldDecorator("threshold", {
                                                    initialValue: amendData ? amendData.threshold : ''
                                                })(
                                                    <InputNumber style={{width: "100%"}} placeholder="请输入阈值"/>
                                                )}
                                            </FormItem></Col>
                                        <Col span={1}/>
                                        <Col span={16}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="可疑度量化表达式"
                                            >
                                                {getFieldDecorator("exp2", {
                                                    initialValue: amendData ? amendData.exp2 : ''
                                                })(
                                                    <Input onBlur={this.exp2Change} placeholder="请输入表达式"/>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={1}/>
                                    </Row>
                                    <Row>
                                        <Col span={16}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="除外案件1"
                                            >
                                                {getFieldDecorator("except", {
                                                    initialValue: amendData ? amendData.except : ''
                                                })(
                                                    <Select style={{width: '100%'}} placeholder="请选择">
                                                        {cataNameTag}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={1}/>
                                        <Col span={3}>
                                            <Button type="primary" onClick={this.check} style={{
                                                margin: "33px 0 10px 10px",
                                                display: "block",
                                                width: "75px"
                                            }}>查看</Button>
                                        </Col>
                                        <Col span={3}>
                                            <Button onClick={this.insert} style={{
                                                margin: "33px 0 10px 10px",
                                                display: "block",
                                                width: "75px"
                                            }}>新增</Button>
                                        </Col>
                                        <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    </Row>
                                    <Row>
                                        <Col span={16}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="除外案件2"
                                            >
                                                {getFieldDecorator("except2", {
                                                    initialValue: amendData ? amendData.except2 : ''
                                                })(
                                                    <Select style={{width: '100%'}} placeholder="请选择">
                                                        {cataNameTag}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={1}/>
                                        <Col span={3}>
                                            <Button type="primary" onClick={this.check2} style={{
                                                margin: "33px 0 10px 10px",
                                                display: "block",
                                                width: "75px"
                                            }}>查看</Button>
                                        </Col>
                                        <Col span={3}>
                                            <Button onClick={this.insert} style={{
                                                margin: "33px 0 10px 10px",
                                                display: "block",
                                                width: "75px"
                                            }}>新增</Button>
                                        </Col>
                                        <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    </Row>
                                    <Row>
                                        <Col span={16}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="除外案件3"
                                            >
                                                {getFieldDecorator("except3", {
                                                    initialValue: amendData ? amendData.except3 : ''
                                                })(
                                                    <Select style={{width: '100%'}} placeholder="请选择">
                                                        {cataNameTag}
                                                    </Select>
                                                )}
                                            </FormItem>
                                        </Col>
                                        <Col span={1}/>
                                        <Col span={3}>
                                            <Button type="primary" onClick={this.check3} style={{
                                                margin: "33px 0 10px 10px",
                                                display: "block",
                                                width: "75px"
                                            }}>查看</Button>
                                        </Col>
                                        <Col span={3}>
                                            <Button onClick={this.insert} style={{
                                                margin: "33px 0 10px 10px",
                                                display: "block",
                                                width: "75px"
                                            }}>新增</Button>
                                        </Col>
                                        <Col span={1}><Icon type="plus-circle" className={style.IconPlus}/></Col>
                                    </Row>
                                    <Row>
                                        <Col span={6}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="参考值"
                                            >
                                                {getFieldDecorator("referValue", {
                                                    initialValue: amendData ? amendData.referValue : ''
                                                })(
                                                    <InputNumber style={{width: "100%"}} placeholder="请输入参考值"/>
                                                )}
                                            </FormItem></Col>
                                        <Col span={1}/>
                                        <Col span={16}>
                                            <FormItem
                                                {...formItemLayout}
                                                label="实施分级"
                                            >
                                                {getFieldDecorator("useLevel", {
                                                    initialValue: amendData ? amendData.useLevel : ''
                                                })(
                                                    <Input placeholder="请输入实施分级"/>
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
                                        dataId: this.state.query.kpiId
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
                        <style>
                            {`.ant-form-item { margin-bottom: 10px; }`}
                        </style>
                    </div>
                </div>
                <div className={this.state.cwajShow ? style.cont : style.cont + ' hidden'}>
                    {
                        this.state.cwajShow ? <Cwaj query={this.state.cwajQuery} back={this.back}/> : ''
                    }
                </div>
            </div>
        )
    }
}

Add = Form.create()(Add);
export default Add;

function valueexp2(value) {
    if (value.substring(0, 1) !== '{') {
        message.warning("表达式以{开头");
    }
    if (value.substring(value.length - 1, value.length) !== '}') {
        message.warning("表达式以}结尾");
    }
    if (value.length < 7) {
        message.warning("表达式长度不能小于7");
    }
    if (value.length > 512) {
        message.warning("可疑度量化表达式长度必须小于512");
    }
    var rs2 = /\[\((-)?\d+(.\d+)?,(-)?\d+(.\d+)?\),(-)?\d+(.\d+)?\]/gi;
    var valueStr = value.substring(1, value.length - 1);
    if (valueStr.match(rs2) != null && valueStr.split("[") != null) {
        var macthCounts = valueStr.match(rs2).length;
        var size = valueStr.split("[").length - 1;
        if (macthCounts !== size) {
            message.error('error');
        } else {
            return true
        }
    } else {
        message.error('error');
    }
}