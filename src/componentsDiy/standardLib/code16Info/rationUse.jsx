// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;
const Option = Select.Option;

class RationUse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            tags: [],               // 选中标签的id
            instruct: {},           // 药品说明书
            rationUse: {},          // 合理用药信息
            bkz283data: [],         // 孕妇用药级别
            bkz380data: [],         // FDA妊娠分级
            rowNo: this.props.query.rowNo, // 当前行的总行数
        }
    }

    componentWillMount() {
        this.queryPreOrNext()

        // 字典
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'useDrugLevel,FDA'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const bkz283data = [],          // 孕妇用药级别
                    bkz380data = []             // FDA妊娠分级
                data.datas[0].forEach((option, i) => {
                    bkz283data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    bkz380data.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    bkz283data,
                    bkz380data
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

    // 点击上一页
    prevCleck = () => {
        this.setState({
            rowNo: this.state.rowNo - 1
        }, () => this.queryPreOrNext())
    }

    // 点击下一页
    nextCleck = () => {
        this.setState({
            rowNo: this.state.rowNo + 1
        }, () => this.queryPreOrNext())
    }

    // 点击上一页  下一页 查询信息 
    queryPreOrNext = () => {
        window.Fetch(urlBefore + "/jcxx/queryPreOrNext_ka01Code16.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                rowNo: String(this.state.rowNo), // 当前行的总行数
                data: {
                    tagId: this.state.query.tagId, //标签id
                    libType: this.state.query.libType, //库类型
                    condition: this.state.query.condition
                }

            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    instruct: data.datas.instruct,
                    rationUse: data.datas.rationUse,
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
        this.props.form.validateFields((err, values) => {
            obj = {
                bkz283: values.bkz283,        // 孕妇用药级别 （见码表3.36）
                bkz380: values.bkz380,        // FDA妊娠分级(见码表3.37)
                bkz286: values.bkz286,        // 哺乳期妇女用药级别(见码表3.36)
                aka287: values.aka287,        // 儿童用药级别(见码表3.36)
                bkz284: values.bkz284,        // 老年人用药级别（见码表3.36）
                ake001: values.ake001 ? encodeURIComponent(encodeURIComponent(values.ake001)) : "",     // 药品通用名
                ake123: values.ake123 ? encodeURIComponent(encodeURIComponent(values.ake123)) : "",     // 适应症
                ake132: values.ake132 ? encodeURIComponent(encodeURIComponent(values.ake132)) : "",     // 用法用量
                bkz182: values.bkz182 ? encodeURIComponent(encodeURIComponent(values.bkz182)) : "",     // 禁忌症
                bkz183: values.bkz183 ? encodeURIComponent(encodeURIComponent(values.bkz183)) : "",     // 孕妇用药描述
                bkz186: values.bkz186 ? encodeURIComponent(encodeURIComponent(values.bkz186)) : "",     // 哺乳期妇女用药描述
                aka187: values.aka187 ? encodeURIComponent(encodeURIComponent(values.aka187)) : "",     // 儿童用药描述
                bkz184: values.bkz184 ? encodeURIComponent(encodeURIComponent(values.bkz184)) : "",     // 老年人用药描述
                bkz185: values.bkz185 ? encodeURIComponent(encodeURIComponent(values.bkz185)) : "",     // 药物相互作用
                bkz381: values.bkz381 ? encodeURIComponent(encodeURIComponent(values.bkz381)) : "",     // 药与疾病禁忌
                bkz193: values.bkz193 ? encodeURIComponent(encodeURIComponent(values.bkz193)) : "",     // 药物不良反应
                bkz382: values.bkz382 ? encodeURIComponent(encodeURIComponent(values.bkz382)) : "",     // 过敏史
                bkz383: values.bkz383 ? encodeURIComponent(encodeURIComponent(values.bkz383)) : "",     // 用药安全提醒
                bkz384: values.bkz384 ? encodeURIComponent(encodeURIComponent(values.bkz384)) : "",     // 用药时间提醒
                bkz385: values.bkz385 ? encodeURIComponent(encodeURIComponent(values.bkz385)) : "",     // 肝功能不全者用药禁忌
                bkz386: values.bkz386 ? encodeURIComponent(encodeURIComponent(values.bkz386)) : "",     // 肾功能不全者用药禁忌
                bkz195: values.bkz195 ? encodeURIComponent(encodeURIComponent(values.bkz195)) : "",     // 药物过量
                bka249: values.bka249 ? encodeURIComponent(encodeURIComponent(values.bka249)) : "",     // 其他注意事项
                bkz387: values.bkz387 ? encodeURIComponent(encodeURIComponent(values.bkz387)) : "",     // 对诊断的影响
                bkz196: values.bkz196 ? encodeURIComponent(encodeURIComponent(values.bkz196)) : "",     // 贮藏
            }
            window.Fetch(urlBefore + "/jcxx/saveRationUse_ka01Code16.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify(obj)
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success("保存成功！");
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
        const {query, instruct, rationUse, bkz283data, bkz380data} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };

        // 孕妇用药级别
        const bkz283Tag = bkz283data ? bkz283data.map((bkz283, i) => {
            return <Option value={bkz283.value} key={i}>{bkz283.text}</Option>
        }) : ""

        // FDA妊娠分级
        const bkz380Tag = bkz380data ? bkz380data.map((bkz380, i) => {
            return <Option value={bkz380.value} key={i}>{bkz380.text}</Option>
        }) : ""

        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second} three="合理用药"/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={12} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    <span> 药品说明书 </span>
                                </h4>
                                <Row>
                                    <Col span={10}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品通用名"
                                        >
                                            {getFieldDecorator("aka061", {
                                                initialValue: instruct ? instruct.aka061 : ''
                                            })(
                                                <Input readOnly/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={13}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="商品名"
                                        >
                                            {getFieldDecorator("aka062", {
                                                initialValue: instruct ? instruct.aka062 : ''
                                            })(
                                                <Input readOnly/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <FormItem
                                    {...formItemLayout}
                                    label="适应症"
                                >
                                    {getFieldDecorator("inake123", {
                                        initialValue: instruct ? instruct.ake123 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="用法用量"
                                >
                                    {getFieldDecorator("inake132", {
                                        initialValue: instruct ? instruct.ake132 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="禁忌症"
                                >
                                    {getFieldDecorator("inbkz182", {
                                        initialValue: instruct ? instruct.bkz182 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="药物不良反应"
                                >
                                    {getFieldDecorator("inbkz193", {
                                        initialValue: instruct ? instruct.bkz193 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="孕妇和哺乳期用药描述"
                                >
                                    {getFieldDecorator("inbkz183", {
                                        initialValue: instruct ? instruct.bkz183 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="儿童用药描述"
                                >
                                    {getFieldDecorator("inaka187", {
                                        initialValue: instruct ? instruct.aka187 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="老年人用药描述"
                                >
                                    {getFieldDecorator("inbkz184", {
                                        initialValue: instruct ? instruct.bkz184 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="药物相互作用"
                                >
                                    {getFieldDecorator("inbkz185", {
                                        initialValue: instruct ? instruct.bkz185 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="药物过量"
                                >
                                    {getFieldDecorator("inbkz195", {
                                        initialValue: instruct ? instruct.bkz195 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="其他注意事项"
                                >
                                    {getFieldDecorator("inbka249", {
                                        initialValue: instruct ? instruct.bka249 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="贮藏"
                                >
                                    {getFieldDecorator("inbkz196", {
                                        initialValue: instruct ? instruct.bkz196 : ''
                                    })(
                                        <Input type="textarea" readOnly rows={3} autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12} style={{padding: "20px"}}>
                                <h4>
                                    合理用药信息
                                    <Button type="primary" className="fr" onClick={this.nextCleck}
                                            readOnly={this.state.rowNo === this.props.query.count}> 下一页 </Button>
                                    <Button type="primary" className="fr" onClick={this.prevCleck}
                                            readOnly={this.state.rowNo === 1}> 上一页 </Button>
                                </h4>
                                <Row>
                                    <Col span={10}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="16位药品编码"
                                        >
                                            {getFieldDecorator("ake001", {
                                                initialValue: rationUse.ake001 ? rationUse.ake001 : ""
                                            })(
                                                <Input readOnly/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={13}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="16位药品名称"
                                        >
                                            {getFieldDecorator("ake002", {
                                                initialValue: rationUse.ake002 ? rationUse.ake002 : ""
                                            })(
                                                <Input readOnly/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <FormItem
                                    {...formItemLayout}
                                    label="适应症"
                                >
                                    {getFieldDecorator("ake123", {
                                        initialValue: rationUse ? rationUse.ake123 : ''
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
                                        initialValue: rationUse ? rationUse.ake132 : ''
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
                                        initialValue: rationUse ? rationUse.bkz182 : ''
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
                                        initialValue: rationUse ? rationUse.bkz193 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入药物不良反应" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="孕妇用药描述"
                                >
                                    {getFieldDecorator("bkz183", {
                                        initialValue: rationUse ? rationUse.bkz183 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入孕妇用药描述" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="孕妇用药级别"
                                >
                                    {getFieldDecorator("bkz283", {
                                        initialValue: rationUse ? rationUse.bkz283 : ''
                                    })(
                                        <Select style={{width: '100%'}} placeholder="请选择孕妇用药级别">
                                            {bkz283Tag}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="FDA妊娠分级"
                                >
                                    {getFieldDecorator("bkz380", {
                                        initialValue: rationUse ? rationUse.bkz380 : ''
                                    })(
                                        <Select style={{width: '100%'}} placeholder="请选择FDA妊娠分级">
                                            {bkz380Tag}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="哺乳期妇女用药描述"
                                >
                                    {getFieldDecorator("bkz186", {
                                        initialValue: rationUse ? rationUse.bkz186 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入哺乳期妇女用药描述" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="哺乳期妇女用药级别"
                                >
                                    {getFieldDecorator("bkz286", {
                                        initialValue: rationUse ? rationUse.bkz286 : ''
                                    })(
                                        <Select style={{width: '100%'}} placeholder="请选择哺乳期妇女用药级别">
                                            {bkz283Tag}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="儿童用药描述"
                                >
                                    {getFieldDecorator("aka187", {
                                        initialValue: rationUse ? rationUse.aka187 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入儿童用药描述" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="儿童用药级别"
                                >
                                    {getFieldDecorator("aka287", {
                                        initialValue: rationUse ? rationUse.aka287 : ''
                                    })(
                                        <Select style={{width: '100%'}} placeholder="请选择儿童用药级别">
                                            {bkz283Tag}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="老年人用药描述"
                                >
                                    {getFieldDecorator("bkz184", {
                                        initialValue: rationUse ? rationUse.bkz184 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入老年人用药描述" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="老年人用药级别"
                                >
                                    {getFieldDecorator("bkz284", {
                                        initialValue: rationUse ? rationUse.bkz284 : ''
                                    })(
                                        <Select style={{width: '100%'}} placeholder="请选择老年人用药级别">
                                            {bkz283Tag}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="药物相互作用"
                                >
                                    {getFieldDecorator("bkz185", {
                                        initialValue: rationUse ? rationUse.bkz185 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入药物相互作用" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="药与疾病禁忌"
                                >
                                    {getFieldDecorator("bkz381", {
                                        initialValue: rationUse ? rationUse.bkz381 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入药与疾病禁忌" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="过敏史"
                                >
                                    {getFieldDecorator("bkz382", {
                                        initialValue: rationUse ? rationUse.bkz382 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入过敏史" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="用药安全提醒"
                                >
                                    {getFieldDecorator("bkz383", {
                                        initialValue: rationUse ? rationUse.bkz383 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入用药安全提醒" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="用药时间提醒"
                                >
                                    {getFieldDecorator("bkz384", {
                                        initialValue: rationUse ? rationUse.bkz384 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入用药时间提醒" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="肝功能不全者用药禁忌"
                                >
                                    {getFieldDecorator("bkz385", {
                                        initialValue: rationUse ? rationUse.bkz385 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入肝功能不全者用药禁忌" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="肾功能不全者用药禁忌"
                                >
                                    {getFieldDecorator("bkz386", {
                                        initialValue: rationUse ? rationUse.bkz386 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入肾功能不全者用药禁忌" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="药物过量"
                                >
                                    {getFieldDecorator("bkz195", {
                                        initialValue: rationUse ? rationUse.bkz195 : ''
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
                                        initialValue: rationUse ? rationUse.bka249 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入其他注意事项" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="对诊断的影响"
                                >
                                    {getFieldDecorator("bkz387", {
                                        initialValue: rationUse ? rationUse.bkz387 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入对诊断的影响" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="贮藏"
                                >
                                    {getFieldDecorator("bkz196", {
                                        initialValue: rationUse ? rationUse.bkz196 : ''
                                    })(
                                        <Input type="textarea" placeholder="请输入贮藏" rows={3}
                                               autosize={{minRows: 3, maxRows: 3}}/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <footer>
                            <Button onClick={this.props.back}>取消</Button>
                            <Button type="primary" htmlType="submit">确定</Button>
                        </footer>
                    </Form>
                </div>
                <style>
                    {`
                        .fr{float: right;margin-left: 15px;}
                    `}
                </style>
            </div>
        )
    }
}

RationUse = Form.create()(RationUse);
export default RationUse;
