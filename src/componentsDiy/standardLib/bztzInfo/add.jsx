// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select, AutoComplete, Icon, Modal} from 'antd';
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
            symptomTypedata: [],
            //amendData: {},
            symptomType:'',//类别
            sysNames:[],
            sysCode:'', //系统编码
            typeCode:'',
            visibleType:false
        }
    }

    componentWillMount() {
        // 查询修改信息
        if (this.state.query.symptonId) {
            window.Fetch(urlBefore + "/jcxx/query_symptomSigns.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({symptonId: this.state.query.symptonId ? this.state.query.symptonId : ""})
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
            body: 'data=' + JSON.stringify({"dict_code": 'symptomType'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const symptomTypedata = []    // 体征类别
                data.datas[0].forEach((option, i) => {
                    symptomTypedata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    symptomTypedata: symptomTypedata
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
        this.searchSysName('');
        this.searchTypeName('');
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
        const url = this.state.query.symptonId ? "/jcxx/modify_symptomSigns.action" : "/jcxx/insert_symptomSigns.action"
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if(this.state.query.symptonId){
                    obj = {
                        symptomCode: values.symptomCode,    // 病状体征编码
                        symptomName: values.symptomName,    // 病状体征名称
                        sysCode: values.sysCode,            // 系统编码
                        sysName: values.sysName,            // 系统名称
                        typeCode: values.typeCode,          // 类型编码
                        typeName: values.typeName,          // 类型名称
                        symptomType: values.symptomType,    // 症状体征类别(见码表3.16)
                        tags: this.state.tags,              // 标签信息
                        descr: values.descr,                // 备注
                        symptonId:  this.state.query.symptonId
                    }
                }else{
                    obj = {
                        symptomCode: this.state.symptomCode,    // 病状体征编码
                        symptomName: values.symptomName,    // 病状体征名称
                        sysCode: this.state.sysCode,            // 系统编码
                        sysName: values.sysName,            // 系统名称
                        typeCode: this.state.typeCode,          // 类型编码
                        typeName: values.typeName,          // 类型名称
                        symptomType: values.symptomType,    // 症状体征类别(见码表3.16)
                        tags: this.state.tags,              // 标签信息
                        descr: values.descr,                // 备注
                        symptonId: this.state.query.symptonId ? this.state.query.symptonId : ""
                    }
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
                        this.state.query.symptonId ?
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
    //病状体征类别
    symptomTypeChange=(value)=>{
        this.setState({
            symptomType:value,
            sysCode:'',
            typeCode:'',
            symptomCode:''
        },()=>{
            this.props.form.resetFields(['sysName','typeName','symptomName']);
            this.searchSysName('');
        })

    }
    //系统名称-搜索
    searchSysName=(value)=>{
        window.Fetch(urlBefore + "/jcxx/querySysNames_symptomSigns.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                sysName:value,
                symptomType :this.state.symptomType
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    sysNames: data.datas&&data.datas.length>0 ? data.datas : []
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //系统名称-选中
    selectSysName=(value,option)=>{
        this.setState({
            symptomType:option.props.attr.symptomType,
            sysCode:option.props.real,
            typeCode:'',
            symptomCode:''
        },()=>{
           // this.props.form.resetFields(['typeName','symptomName']);
            this.props.form.setFieldsValue({
                symptomType:option.props.attr.symptomType,
                typeName:'',
                symptomName:''
            })
            this.searchTypeName('');
        })
    }
    //类型名称-搜索
    searchTypeName=(value)=>{
        window.Fetch(urlBefore + "/jcxx/queryTypeNames_symptomSigns.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                typeName:value,
                symptomType :this.state.symptomType,
                sysCode:this.state.sysCode
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    typeNames: data.datas&&data.datas.length>0 ? data.datas : []
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //类型名称-选中
    selectTypeName=(value,option)=>{
        this.setState({
            symptomType:option.props.attr.symptomType,
            sysCode:option.props.attr.sysCode,
            sysName:option.props.attr.sysName,
            typeCode:option.props.real,
            symptomCode:''
        })
        //this.props.form.resetFields(['symptomName']);
        this.props.form.setFieldsValue({
            symptomType:option.props.attr.symptomType,
            sysName:option.props.attr.sysName,
            symptomName:''
        })
    }
    //病状体征
    onBlur=(e)=>{
        if(!this.state.query.symptonId){
            if(this.state.typeCode){
                window.Fetch(urlBefore + "/jcxx/queryNewCode_symptomSigns.action", {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    credentials: 'include',
                    body: "data=" + JSON.stringify({
                        typeCode:this.state.typeCode,
                        symptomType :this.state.symptomType,
                        sysCode:this.state.sysCode
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            symptomCode: data.datas ? data.datas.symptomCode : ''
                        })
                    } else {
                        message.warning(data.result);
                    }
                }).catch(error => {
                    message.error(error.message);
                })
            }else{
                message.error('请先选择类型！');
            }
        }
    }
    sysNameAdd = ()=>{
        this.setState({visible: true})
    }
    sysTemOk = ()=>{
        window.Fetch(urlBefore + "/jcxx/queryNewCode_symptomSigns.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                symptomType :this.state.symptomType
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    sysCode:data.datas.sysCode,
                    typeNames:[],
                    typeCode:'',
                    symptomCode:'',
                    visible:false
                })
                this.props.form.setFields({
                    sysName:this.state.sysNameAdd,
                    typeName:'',
                    symptomName: ''
                })

            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    sysNameAddEvent=(e)=>{
        this.setState({
            sysNameAdd:e.target
        })
    }
    typeNameAdd = ()=>{
        this.setState({visibleType: true})
    }
    typeOk = ()=>{
        window.Fetch(urlBefore + "/jcxx/queryNewCode_symptomSigns.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                symptomType :this.state.symptomType,
                sysCode:this.state.sysCode
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    typeCode:data.datas.typeCode,
                    symptomCode:'',
                    visibleType:false,
                    typeNames:[]
                },()=>{
                    this.props.form.setFields({
                        typeName:this.state.typeNameAdd,
                        symptomName: ''
                    })
                })


            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    typeAddEvent=(e)=>{
        this.setState({
            typeNameAdd:e.target
        })
    }
    reset=()=>{
        this.setState({
            symptomType:'',
            sysCode:'',
            sysName:'',
            typeCode:'',
            typeName:'',
            symptomCode:'',
            symptomName:''
        },()=>{
            this.searchSysName();
            this.searchTypeName();
        })
        this.props.form.resetFields();
    }
    render() {
        const {getFieldDecorator} = this.props.form;
        const {query, amendData, symptomTypedata} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };

        // 类别
        const symptomTypeTag = symptomTypedata ? symptomTypedata.map((symptomType, i) => {
            return <Option value={symptomType.value} key={symptomType.value}>{symptomType.text}</Option>
        }) : ""
        //系统
        const childrenSystem = this.state.sysNames ? this.state.sysNames.map((item,i)=>{
            return <Option key={i} value={item.sysName} real={item.sysCode} attr={item}>{item.sysName}</Option>
        }):''
        //类型
        const childrenTypeName = this.state.typeNames ? this.state.typeNames.map((item,i)=>{
            return <Option key={i} value={item.typeName} real={item.typeCode} attr={item}>{item.typeName}</Option>
        }):''
        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.symptonId ? "修改" : "新增"}{query.second}
                                </h4>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="症状体征类别"
                                        >
                                            {getFieldDecorator("symptomType", {
                                                initialValue: amendData ? amendData.symptomType : '',
                                                rules: [{
                                                    required: true, message: '必填项!',
                                                }]
                                            })(
                                                <Select style={{width: '100%'}} disabled={amendData ? true : false} onSelect={this.symptomTypeChange} placeholder="请选择症状体征类别">
                                                    {symptomTypeTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={16}>
                                        <Button style={{marginTop:32, float:'right'}} type="primary" icon="retweet" onClick={this.reset}>重置</Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="系统编码"
                                        >
                                            {getFieldDecorator("sysCode", {
                                                initialValue: amendData ? amendData.sysCode : this.state.sysCode
                                            })(
                                                <Input placeholder="请输入系统编码" disabled/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={15}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="系统名称"
                                        >
                                            {getFieldDecorator("sysName", {
                                                initialValue: amendData ? amendData.sysName : '',
                                                rules: [{
                                                    required: true, message: '必填项!',
                                                }]
                                            })(
                                                <AutoComplete disabled={amendData ? true : false} onSearch={this.searchSysName} onSelect={this.selectSysName} >
                                                    {childrenSystem}
                                                </AutoComplete>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={1} className={this.state.symptomType && !amendData ? '' : 'hidden'}>
                                        <Row>
                                            <Col span={24}><p style={{ height:'20px' }}></p></Col>
                                            <Col span={24}>
                                                <Icon type="plus-circle" onClick={ this.sysNameAdd } style={{ fontSize:'16px' }} />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="类型编码"
                                        >
                                            {getFieldDecorator("typeCode", {
                                                initialValue: amendData ? amendData.typeCode : this.state.typeCode
                                            })(
                                                <Input placeholder="请输入类型编码" disabled/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={15}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="类型名称"
                                        >
                                            {getFieldDecorator("typeName", {
                                                initialValue: amendData ? amendData.typeName : '',
                                                rules: [{
                                                    required: true, message: '必填项!',
                                                }]
                                            })(
                                                <AutoComplete disabled={amendData ? true : false} onSearch={this.searchTypeName} onSelect={this.selectTypeName} >
                                                    {childrenTypeName}
                                                </AutoComplete>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={1} className={this.state.sysCode && !amendData ? '' : 'hidden'}>
                                        <Row>
                                            <Col span={24}><p style={{ height:'20px' }}></p></Col>
                                            <Col span={24}>
                                                <Icon type="plus-circle" style={{ fontSize:'16px' }} onClick={this.typeNameAdd} />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="病状体征编码 "
                                        >
                                            {getFieldDecorator("symptomCode", {
                                                initialValue: amendData ? amendData.symptomCode : this.state.symptomCode
                                            })(
                                                <Input placeholder="请输入病状体征编码"
                                                       disabled/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={15}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="病状体征名称"
                                        >
                                            {getFieldDecorator("symptomName", {
                                                initialValue: amendData ? amendData.symptomName : '',
                                                rules: [{
                                                    required: true, message: '必填项!',
                                                }]
                                            })(
                                                <Input  placeholder="请输入病状体征名称" onBlur={this.onBlur}/>
                                            )}
                                        </FormItem>
                                    </Col>
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
                                    dataId: this.state.query.symptonId
                                }}
                                        tagsChange={this.tagsChange}
                                />
                            </Col>
                        </Row>
                        <footer>
                            <Button onClick={this.props.back}>取消</Button>
                            <Button type="primary" htmlType="submit" >确定</Button>
                        </footer>
                    </Form>
                </div>
                <Modal
                    title="新增系统名称"
                    visible={this.state.visible}
                    bodyStyle={{
                        height: 300,
                        overflowY: 'auto'
                    }}
                    wrapClassName="vertical-center-modal"
                    width={500}
                    onCancel={() => { this.setState({visible: false}) }}
                    onOk={this.sysTemOk}
                >
                    <Row>
                        <Col span={6} offset={2}>系统名称：</Col>
                        <Col span={14}>
                            <Input placeholder="请输入系统名称！" onChange={this.sysNameAddEvent} />
                        </Col>
                    </Row>
                </Modal>
                <Modal
                    title="新增类型名称"
                    visible={this.state.visibleType}
                    bodyStyle={{
                        height: 300,
                        overflowY: 'auto'
                    }}
                    wrapClassName="vertical-center-modal"
                    width={500}
                    onCancel={() => { this.setState({visibleType: false}) }}
                    onOk={this.typeOk}
                >
                    <Row>
                        <Col span={6} offset={2}>类型名称：</Col>
                        <Col span={14}>
                            <Input placeholder="请输入类型名称！" onChange={this.typeAddEvent} />
                        </Col>
                    </Row>
                </Modal>
            </div>
        )
    }
}

Add = Form.create()(Add);
export default Add;
