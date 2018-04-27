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
            tags: [],   // 选中标签的id
            conColumndata: [],  // 场景条件
            sceneOperadata: [],  // 操作符
            exeActiondata: [],  // 执行动作
            amendData: {},
            codeOrName: "",
            aka120data: [],
            aka120: ""
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.sceneId) {
            window.Fetch(urlBefore + "/bzpznew/query_exceptScene.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({sceneId: this.state.query.sceneId ? this.state.query.sceneId : ""})
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
            body: 'data=' + JSON.stringify({"dict_code": 'conColumn,sceneOpera,exeAction'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const conColumndata = [],      // 场景条件
                    sceneOperadata = [],        // 操作符
                    exeActiondata = []          // 执行动作
                data.datas[0].forEach((option, i) => {
                    conColumndata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    sceneOperadata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[2].forEach((option, i) => {
                    exeActiondata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    conColumndata: conColumndata,
                    sceneOperadata: sceneOperadata,
                    exeActiondata: exeActiondata
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

    searchChange = (value) => {
        this.setState({
            codeOrName: value
        }, () => this.aka120Search())
    }

    // 选中
    selectChange = (value, option) => {
        this.setState({
            aka120: option.props.aka120,
            codeOrName: value
        }, () => {
            this.props.form.setFieldsValue({
                aka120: value
            })
        })
    }

    aka120Search = () => {
        window.Fetch(urlBefore + "/jcxx/queryNoScenelist_icd10.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                codeOrName: this.state.codeOrName  //编码或名称
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    aka120data: data.datas
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }

    // submit
    submit = (e) => {
        e.preventDefault();
        let obj = {}
        const url = this.state.query.sceneId ? "/bzpznew/modify_exceptScene.action" : "/bzpznew/insert_exceptScene.action"
        this.props.form.validateFields((err, values) => {
            obj = {
                aka120: this.state.aka120,          // 疾病编码
                conColumn: values.conColumn,    // 场景条件
                opera: values.opera,            // 操作符
                condition: values.condition,    // 条件内容
                exeAction: values.exeAction,    // 执行动作
                exeParam: values.exeParam,      // 执行参数
                exeAction2: values.exeAction2,  // 执行动作
                exeParam2: values.exeParam2,    // 执行参数
                exeAction3: values.exeAction3,  // 执行动作
                exeParam3: values.exeParam3,    // 执行参数
                tags: this.state.tags,          // 标签信息
                sceneId: this.state.query.sceneId ? this.state.query.sceneId : "",
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
                    this.state.query.sceneId ?
                        message.success("修改成功！") :
                        message.success("新增成功！")
                    this.props.back()
                } else {
                    message.warning(data.result);
                }
            }).catch(error => {
                message.error(error.message);
            })
        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {query, amendData, conColumndata, sceneOperadata, exeActiondata, aka120data} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };

        // 疾病编码
        const aka120Tag = aka120data ? aka120data.map((aka120, i) => {
            return <Option key={aka120.aka120} aka120={aka120.aka120}
                           value={aka120.aka120 + ' - ' + aka120.aka121}>{aka120.aka120 + ' - ' + aka120.aka121}</Option>
        }) : ""

        // 场景条件
        const conColumnTag = conColumndata ? conColumndata.map((conColumn, i) => {
            return <Option value={conColumn.value} key={i}>{conColumn.text}</Option>
        }) : ""

        // 操作符
        const sceneOperaTag = sceneOperadata ? sceneOperadata.map((sceneOpera, i) => {
            return <Option value={sceneOpera.value} key={i}>{sceneOpera.text}</Option>
        }) : ""

        // 执行动作
        const exeActionTag = exeActiondata ? exeActiondata.map((exeAction, i) => {
            return <Option value={exeAction.value} key={i}>{exeAction.text}</Option>
        }) : ""

        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.sceneId ? "修改" : "新增"}{query.second}
                                </h4>
                                <FormItem
                                    {...formItemLayout}
                                >
                                    {getFieldDecorator("aka120", {
                                        initialValue: query.sceneId ? this.state.query.aka120 + ' - ' + this.state.query.aka121 : ''
                                    })(
                                        <Select
                                            mode="combobox"
                                            placeholder="请输入疾病编码或名称"
                                            style={{width: '100%'}}
                                            onFocus={this.aka120Search}
                                            onSelect={this.selectChange}
                                            onSearch={this.searchChange}
                                            disabled={query.sceneId ? true : false}
                                        >
                                            {aka120Tag}
                                        </Select>
                                    )}
                                </FormItem>
                                <p>场景条件</p>
                                <Row>
                                    <Col span={7}>
                                        <FormItem>
                                            {getFieldDecorator("conColumn", {
                                                initialValue: amendData ? amendData.conColumn : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择场景条件">
                                                    {conColumnTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={4}>
                                        <FormItem>
                                            {getFieldDecorator("opera", {
                                                initialValue: amendData ? amendData.opera : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="操作符">
                                                    {sceneOperaTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={11}>
                                        <FormItem>
                                            {getFieldDecorator("condition", {
                                                initialValue: amendData ? amendData.condition : ''
                                            })(
                                                <Input placeholder="请输入关键字，支持通配符*/?和数组a,b,c"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={7}><p>场景动作</p></Col>
                                    <Col span={1}/>
                                    <Col span={16}><p>动作参数</p></Col>
                                </Row>
                                <Row>
                                    <Col span={7}>
                                        <FormItem>
                                            {getFieldDecorator("exeAction", {
                                                initialValue: amendData ? amendData.exeAction : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择">
                                                    {exeActionTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={16}>
                                        <FormItem>
                                            {getFieldDecorator("exeParam", {
                                                initialValue: amendData ? amendData.exeParam : ''
                                            })(
                                                <Input placeholder="根据选择动作不同显示不同的形式，如选择服务包、更改分值、修改表达式"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={7}>
                                        <FormItem>
                                            {getFieldDecorator("exeAction2", {
                                                initialValue: amendData ? amendData.exeAction2 : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择">
                                                    {exeActionTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={16}>
                                        <FormItem>
                                            {getFieldDecorator("exeParam2", {
                                                initialValue: amendData ? amendData.exeParam2 : ''
                                            })(
                                                <Input placeholder="根据选择动作不同显示不同的形式，如选择服务包、更改分值、修改表达式"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={7}>
                                        <FormItem>
                                            {getFieldDecorator("exeAction3", {
                                                initialValue: amendData ? amendData.exeAction3 : ''
                                            })(
                                                <Select style={{width: '100%'}} placeholder="请选择">
                                                    {exeActionTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={16}>
                                        <FormItem>
                                            {getFieldDecorator("exeParam3", {
                                                initialValue: amendData ? amendData.exeParam3 : ''
                                            })(
                                                <Input placeholder="根据选择动作不同显示不同的形式，如选择服务包、更改分值、修改表达式"/>
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
                                    dataId: this.state.query.sceneId
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
