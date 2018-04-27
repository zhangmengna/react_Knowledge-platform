// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select, Upload, Icon, Modal} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;
const Option = Select.Option;

class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            busiTypeArray: [], //业务类型
            priorityArray: [], //优先级
            statusArray: [], //状态
            busiType: "", //业务类型
            priority: "", //-- 优先级
            content: "", //-- 需求内容
            analysis: "", // --需求分析
            implement: "", // -- 系统实现
            status: "", // -- 状态（见码表3.42）
            fileList:[],
            previewVisible:false,
            previewImage:''
        }
    }
    componentWillMount() {
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'busiType,priority,req_status'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    busiTypeArray: data.datas[0],
                    priorityArray: data.datas[1], //优先级
                    statusArray: data.datas[2], //状态
                })
            } else {
                message.warning(data.result);
            }
        }).catch((error) => {
            message.error(error.message);
        });
        if(this.state.query.rmId){
            window.Fetch(urlBefore + '/base/query_requirementManage.action', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({"rmId":this.state.query.rmId })
            }).then(res =>
                res.json()
            ).then(data => {
                if (data.result === 'success') {
                    let arr = [];
                    data.datas&&data.datas[0]&&data.datas[0]['requirementFiles'].map((item,key)=>{
                        let obj = new File([item.fileName], item.fileName, {
                            type: item.fileType,
                        });
                        obj.uid = item.rfId;
                        obj.url = item.filePath;
                        console.log(obj);
                        /*var file = new File([item.fileName], item.filePath, {
                            type: item.fileType,
                        });*/
                        // arr.push({
                        //     name:item.fileName,
                        //     filename:item.fileName,
                        //     type:item.fileType,
                        //     'Content-Type':item.fileType,
                        //     url:item.filePath,
                        //     uid:item.rfId
                        // })
                        arr.push(obj);
                    })
                   this.setState({
                       fileList : arr
                   })

                } else {
                    message.warning(data.result);
                }
            }).catch((error) => {
                message.error(error.message);
            });
        }
    }

    // submit
    submit = (e) => {
        e.preventDefault();
        const {fileList} = this.state;
        let arr = [],objThis = {};
        this.state.fileList&&this.state.fileList.forEach((item,i)=>{
            if(!objThis[item.name]){
                objThis[item.name] = 1;
            }else{
                message.warning('上传文件重复！');
                return false;
            }
        })
        debugger;
        console.log(this.state.fileList);
        const formData = new FormData();
        fileList.forEach((file)=>{
            formData.append('files',file)
        })

        //

        let obj = {}
        const url = this.state.query.rmId ? "/base/modify_requirementManage.action" : "/base/insert_requirementManage.action"
        this.props.form.validateFields((err, values) => {
            if(!err) {
                obj = {
                    busiType: values.busiType,
                    priority: values.priority,
                    content: values.content,
                    analysis: values.analysis,
                    implement: values.implement,
                    status: values.status,
                    rmId:this.state.query.rmId
                }
                formData.append('data',JSON.stringify(obj))
                window.Fetch(urlBefore + url, {
                    method: 'POST',
                     headers: {},
                    credentials: 'include',
                    //body: "data=" + JSON.stringify(obj)
                    body:formData
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        if(this.state.query.rmId ){
                            message.success("修改成功！")
                        }else{
                            message.success("新增成功！")
                        }
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
    handleCancel = () => this.setState({ previewVisible: false })
    render() {
        const props ={
            action:'',
            listType: 'picture',
            onRemove:(file)=>{
                console.log(file);
                this.setState(({fileList}) =>{
                    const index = fileList.indexOf(file);
                    const newFileList = fileList.slice();
                    newFileList.splice(index,1);
                    return {
                        fileList:newFileList
                    }

                })
            },
            onPreview:(file) => {
                console.log(file);
                if(file.type === 'image/jpeg'||file.type === 'image/png'){
                    this.setState({
                        previewImage: file.url || file.thumbUrl,
                        previewVisible: true,
                    });
                }

            },
            beforeUpload:(file,fileList) =>{
                console.log(file);
                console.log(fileList);
                this.setState(({fileList}) =>({
                    fileList:[...fileList, file]
                }));
                return false
            },
            fileList:this.state.fileList
        }
        const {getFieldDecorator} = this.props.form;
        const {query, busiType, priority, content, analysis, implement, status, busiTypeArray, priorityArray, statusArray} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 8}
            },
            wrapperCol: {
                xs: {span: 16}
            },
        };

        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second} />
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={24} style={{ padding: "20px"}}>
                                <Row  >
                                    <Col span={9}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="业务类型"
                                        >
                                            {getFieldDecorator("busiType", {
                                                initialValue: query.busiType,
                                                rules: [
                                                    { required: true, message: '必填' }
                                                ]
                                            })(
                                                <Select placeholder="请选择业务类型" style={{width: '100%'}}>
                                                    {
                                                        busiTypeArray ? busiTypeArray.map((item, i) => {
                                                            return <Option value={item.fact_value}
                                                                           key={i}>{item.display_name}</Option>
                                                        }) : ""
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={9} offset={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="优先级"
                                        >
                                            {getFieldDecorator("priority", {
                                                initialValue: query.priority,
                                                rules: [
                                                    { required: true, message: '必填' }
                                                ]
                                            })(
                                                <Select placeholder="请选择业务类型" style={{width: '100%'}}>
                                                    {
                                                        priorityArray ? priorityArray.map((item, i) => {
                                                            return <Option value={item.fact_value}
                                                                           key={i}>{item.display_name}</Option>
                                                        }) : ""
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row >
                                    <Col span={24}>
                                        <FormItem
                                            labelCol= {{
                                            xs: {span: 3}
                                            }}
                                            wrapperCol={{
                                            xs: {span: 21}
                                            }}
                                            label="需求内容"
                                        >
                                            {getFieldDecorator("content", {
                                                initialValue: query.content
                                            })(
                                                <Input rows={4} type="textarea"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row >
                                    <Col span={24}>
                                        <FormItem
                                            labelCol= {{
                                                xs: {span: 3}
                                            }}
                                            wrapperCol={{
                                                xs: {span: 21}
                                            }}
                                            label="需求分析"
                                        >
                                            {getFieldDecorator("analysis", {
                                                initialValue: query.analysis
                                            })(
                                                <Input rows={4} type="textarea"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row >
                                    <Col span={24}>
                                        <FormItem
                                            labelCol= {{
                                                xs: {span: 3}
                                            }}
                                            wrapperCol={{
                                                xs: {span: 21}
                                            }}
                                            label="系统实现"
                                        >
                                            {getFieldDecorator("implement", {
                                                initialValue: query.implement
                                            })(
                                                <Input rows={4} type="textarea"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row >
                                    <Col span={9}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="状态"
                                        >
                                            {getFieldDecorator("status", {
                                                initialValue: query.status,
                                                rules: [
                                                    { required: true, message: '必填' }
                                                ]
                                            })(
                                                <Select placeholder="请选择业务类型" style={{width: '100%'}}>
                                                    {
                                                        statusArray ? statusArray.map((item, i) => {
                                                            return <Option value={item.fact_value}
                                                                           key={i}>{item.display_name}</Option>
                                                        }) : ""
                                                    }
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col  span={3}>
                                        附件上传：
                                    </Col>
                                    <Col span={21}>
                                        <Upload {...props} className="upload-list-inline">
                                            <Button>
                                                <Icon type="upload" />上传
                                            </Button>
                                        </Upload>
                                    </Col>
                                </Row>
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
                        .upload-list-inline .ant-upload-list-item {
                          float: left;
                          width: 200px;
                          margin-right: 8px;
                        }
                        .upload-list-inline .ant-upload-animate-enter {
                          animation-name: uploadAnimateInlineIn;
                        }
                        .upload-list-inline .ant-upload-animate-leave {
                          animation-name: uploadAnimateInlineOut;
                        }
                    `}
                </style>
                <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>
            </div>
        )
    }
}

Add = Form.create()(Add);
export default Add;
