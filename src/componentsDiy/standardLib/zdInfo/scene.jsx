// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import AddTag from './../../../components/modules/addTag/addTag';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;
const Option = Select.Option;


class Scene extends Component {
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
            sceneId: '',
            sceneShow: false
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.aka120) {
            window.Fetch(urlBefore + "/bzpznew/query_exceptScene.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({aka120: this.state.query.aka120 ? this.state.query.aka120 : ""})
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        amendData: data.datas[0],
                        sceneId: data.datas[0] ? data.datas[0].sceneId : "",
                        sceneShow: true
                    })
                } else {
                    message.error(data.result);
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
        this.props.form.validateFields((err, values) => {
            obj = {
                aka120: this.state.query.aka120 ? this.state.query.aka120 : "",  //疾病编码
                aka121: this.state.query.aka121 ? this.state.query.aka121 : "",  //疾病名称
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
                sceneId: this.state.sceneId
            }
            window.Fetch(urlBefore + "/bzpznew/insertOrUpdate_exceptScene.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify(obj)
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success("配置成功！")
                    this.props.back()
                } else {
                    message.error(data.result);
                }
            }).catch(error => {
                message.error(error.message);
            })

        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {query, amendData, conColumndata, sceneOperadata, exeActiondata} = this.state;

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
                <BreadcrumbCustom first={query.first} second={query.second} three="特殊场景"/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>维护特殊场景</h4>
                                <Input value={query.aka120 + " - " + query.aka121} disabled/>
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
                                {
                                    this.state.sceneShow ?
                                        <AddTag searchObj={{
                                            busiType: '12',
                                            libId: query.libId,
                                            libType: query.libType,
                                            dataId: this.state.sceneId
                                        }}
                                                tagsChange={this.tagsChange}
                                        /> : ""
                                }

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

Scene = Form.create()(Scene);
export default Scene
