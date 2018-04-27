// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select, Icon, Modal, Table, AutoComplete} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import AddTag from './../../../components/modules/addTag/addTag';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;

class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            tags: [],   // 选中标签的id
            AKA070data: [],     // 剂型值
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
            item_id: "",        // ATC-5  item_id
            ATC_5Data: [],
            ATC_7Data: [],
            ATC_5Value: "",
            ATC_7Value: "",
            ATC_5Code: "",
            ATC_7Code: "",
            amendData: {},    // 修改回显数据
            chemicalName:'',
            visible:false,
            data12:[],
            pagesize:1,
            pagerow:10,
            count:0,
            atcText5:'',
            atcText7:''
        }
    }
    componentWillMount() {
        // 查询修改信息
        if (this.state.query.code16Id) {
            window.Fetch(urlBefore + '/jcxx/query_ka01Code16.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: "include",
                body: 'data=' + JSON.stringify({
                    code16Id: this.state.query.code16Id            //16药品id
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        ake001:data.datas[0] ? data.datas[0].ake001 : "",
                        ATC_5Value: data.datas[0] ? data.datas[0].bkz256 : "",
                        ATC_7Value: data.datas[0] ? data.datas[0].bkz257 : "",
                        ATC_5Code: data.datas[0] ? data.datas[0].bkz254 : "",
                        ATC_7Code: data.datas[0] ? data.datas[0].bkz255 : "",
                    }, () => {
                        this.props.form.setFieldsValue({
                            ake001:data.datas[0] ? data.datas[0].ake001 : "",
                            ake002: data.datas[0] ? data.datas[0].ake002 : "",
                            name1: data.datas[0] ? data.datas[0].name1 : "",
                            name2: data.datas[0] ? data.datas[0].name2 : "",
                            name3: data.datas[0] ? data.datas[0].name3 : "",
                            name4: data.datas[0] ? data.datas[0].name4 : "",
                            chemicalName: data.datas[0] ? data.datas[0].chemicalName : "",  // 化学名
                            aka081: data.datas[0] ? data.datas[0].aka081 : "",              // 用药途径
                            aka070: data.datas[0] ? data.datas[0].aka070 : "",              // 剂型
                        })
                    })
                } else {
                    message.warning(data.result)
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
            message.error(error.message);
        });
        this.atcSearch5();
        this.atcSearch7();
    }
    atcSearch5 = () => {
        window.Fetch(urlBefore + "/jcxx/queryAtcInfos_ka01.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                atcText: this.state.atcText5,      // atc查询条件
                atcLevel: '5',     // atc等级,
                item_id:''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let ATC_5Data = [];
                    data.datas&&data.datas.forEach((datas, i) => {
                        ATC_5Data.push({
                            value: datas.fact_value,
                            text: datas.display_name + "(" + datas.fact_value + ")",
                            item_id: datas.item_id
                        })
                })
                this.setState({
                    ATC_5Data: ATC_5Data
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    atcSearch7 = ()=>{
        window.Fetch(urlBefore + "/jcxx/queryAtcInfos_ka01.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                atcText: this.state.atcText7,      // atc查询条件
                atcLevel: 7,     // atc等级
                item_id: this.state.item_id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let ATC_7Data = [];
                data.datas.forEach((datas, i) => {
                    ATC_7Data.push({
                        value: datas.fact_value,
                        text: datas.display_name + "(" + datas.fact_value + ")",
                        parent:datas.parent
                    })
                })
                this.setState({
                    ATC_7Data: ATC_7Data
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    search_5Change = (value) => {

        this.setState({
            ATC_5Value: value,
            ATC_5Code: null,
            atcText5: value,
            ATC_7Value: "",
            ATC_7Code: "",
            item_id: null
        }, () => {
            this.atcSearch5();
            this.props.form.resetFields(['ATC_7Value,ATC_5Value'])
        })
    }
    atc_5Change = (value, option) => {
        this.setState({
            ATC_5Value: value,
            ATC_5Code: option.props.id,
            atcText: value,
            ATC_7Value: "",
            ATC_7Code: "",
            item_id: option.props.item_id
        })
        this.props.form.resetFields(['ATC_7Value'])
    }
    search_7Change = (value, option) => {
        this.setState({
            ATC_7Value: value,
            ATC_7Code: null,
            atcText7: value,
        },()=>{
            this.props.form.resetFields(['ATC_7Value'])
            this.atcSearch7();
        })
    }
    atc_7Change = (value, option) => {
        this.setState({
            ATC_7Value: value,
            ATC_7Code: option.props.id,
            ATC_5Value: option.props.parent.display_name,
            ATC_5Code: option.props.parent.fact_value,
        })
    }
    tagsChange = (id) => {
        this.setState({
            tags: id
        })
    }
    //化学名点击
    chemicalNameChange=()=>{
        this.setState({
            visible:true
        },()=>{
            this.getCode12();
        })
    }
    //code 12查询
    getCode12 = ()=>{
        window.fetch(urlBefore+'/jcxx/querylist_ka01Code12.action',{
            method:'POST',
            headers:{
                'Content-Type':'application/x-www-form-urlencoded'
            },
            credentials:'include',
            body:'pagesize='+this.state.pagesize+'&pagerow='+this.state.pagerow+'&data='+JSON.stringify({
                codeOrName:this.state.codeOrName
            })
        }).then(res=>res.json()
        ).then(data=>{
            if(data.result === 'success'){
                this.setState({
                    data12:data.datas && data.datas.length>0 ? data.datas : [],
                    count:data.count
                })
            }
        }).catch((error)=>{
            message.error(error.message)
        })
    }
    //
    codeValueChange=(value)=>{
        this.setState({
            codeOrName:value,
            pagesize:1,
            pagerow:10
        },()=>{
            this.getCode12();
        })
    }
    // submit
    submit = (e) => {
        e.preventDefault();
        let obj = {}
        this.props.form.validateFields((err, values) => {
            if(!err){
                if(values.ake001.length === 16){
                    let objPost = {
                        ake002: values.ake002,
                        name1: values.name1,
                        name2: values.name2,
                        name3: values.name3,
                        name4: values.name4,
                        chemicalName: values.chemicalName,  // 化学名
                        aka081: values.aka081,              // 用药途径
                        aka070: values.aka070,              // 剂型
                        bkz254: this.state.ATC_5Code,       // ATC5编码
                        bkz255: this.state.ATC_7Code,       // ATC7编码
                        bkz256: this.state.ATC_5Value,      // ATC5名称
                        bkz257: this.state.ATC_7Value,      // ATC7名称
                        ake001:values.ake001,
                        tags: this.state.tags,   // 标签信息
                        code16Id:this.props.query.code16Id ? this.props.query.code16Id :''
                    }
                    if(this.props.query.code16Id){
                        window.Fetch(urlBefore + '/jcxx/modify_ka01Code16.action', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            credentials: "include",
                            body: 'data=' + JSON.stringify(objPost)
                        }).then(res => res.json()
                        ).then(data => {
                            if (data.result === 'success') {
                                message.success("修改成功！");
                                this.props.back();
                            } else {
                                message.warning(data.result);
                            }
                        }).catch(error => {
                            message.error(error.message);
                        })
                    }else{
                        window.Fetch(urlBefore + '/jcxx/insert_ka01Code16.action', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            credentials: "include",
                            body: 'data=' + JSON.stringify(objPost)
                        }).then(res => res.json()
                        ).then(data => {
                            if (data.result === 'success') {
                                message.success("新增成功！");
                                this.props.back();
                            } else {
                                message.warning(data.result);
                            }
                        }).catch(error => {
                            message.error(error.message);
                        })
                    }


                }else{
                    message.error('16位编码字段长度错误！')
                }
            }
        })
    }
    //页码相关
    onChange = (pagination, filters, sorter) => {
        this.setState({
            pagesize: pagination.current,
            pagerow: pagination.pageSize,
            sortname: sorter.field ? sorter.field : '',
            sortorder: sorter.order ? sorter.order.replace('end', '') : '',
        }, () => {
            this.getCode12();
        })
    }
    rowClick=(record, index, event)=>{
        this.setState({
            chemicalName:record.ake002,
            visible:false,
            ake001:record.ake001
        })
        this.props.form.setFieldsValue({
            ake001:record.ake001,
            aka070:''
        })
    }
    ake001Change=()=>{
        this.props.form.setFieldsValue({
            aka070:''
        })
    }
    drugChange=(value)=>{
        const ake001Value = this.props.form.getFieldValue('ake001');
        if(ake001Value&&ake001Value.length === 12){
            this.props.form.setFieldsValue({
                ake001:ake001Value+''+value
            })
        }else if(ake001Value&&ake001Value.length === 16){
            this.props.form.setFieldsValue({
                ake001:ake001Value.slice(0,12)+''+value
            })
        }else{
            message.warning('请先输入16编码（12位或16位）！');
        }
    }
    render() {
        const {getFieldDecorator} = this.props.form;
        const {query, AKA070data, BKA219data, ATC_5Value, ATC_7Value, ATC_5Data, ATC_7Data, amendData} = this.state;
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
            return <Option key={ATC_7Data.text} id={ATC_7Data.value} parent={ATC_7Data.parent} title={ATC_7Data.text}>{ATC_7Data.text}</Option>
        })
        //
        const columns12 = [
            {
                title:'12位编码',
                dataIndex:'ake001',
                width:'50%',
                className:'text-left',
                render:(text,record)=>{
                    return <div className="textBox" title={text}>{text}</div>
                }
            },
            {
                title:'12位名称',
                dataIndex:'ake002',
                width:'50%',
                className:'text-left',
                render:(text,record)=>{
                    return <div className="textBox" title={text}>{text}</div>
                }
            }
        ]
        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4>
                                    {query.code16Id ? '修改' : '新增'}{query.second}
                                </h4>
                                <Row gutter={30}>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="化学名"
                                        >
                                            {getFieldDecorator("chemicalName", {
                                                initialValue:this.state.chemicalName
                                            })(
                                                <Input className={this.props.query.code16Id ? '' :'colorWhite'}  placeholder="请输入化学名" onClick={this.chemicalNameChange} readOnly disabled={this.props.query.code16Id ? true :false }  />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="16位编码"
                                        >
                                            {getFieldDecorator("ake001", {
                                                initialValue:this.state.ake001,
                                                rules:[{
                                                    required:true, message:'必填项'
                                                }]
                                            })(
                                                <Input placeholder="请输入12位或16位编码" onChange={this.ake001Change} disabled={this.props.query.code16Id ? true :false } />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="剂型"
                                        >
                                            {getFieldDecorator("aka070", {})(
                                                <Select  onSelect={this.drugChange} placeholder="请选择剂型" disabled={this.props.query.code16Id ? true :false } >
                                                    {AKA070Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={30}>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品通用名"
                                        >
                                            {getFieldDecorator("ake002", {})(
                                                <Input placeholder="请输入药品通用名"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品通用名1"
                                        >
                                            {getFieldDecorator("name1", {})(
                                                <Input placeholder="请输入药品通用名1"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品通用名2"
                                        >
                                            {getFieldDecorator("name2", {})(
                                                <Input placeholder="请输入药品通用名2"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={30}>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品通用名3"
                                        >
                                            {getFieldDecorator("name3", {})(
                                                <Input placeholder="请输入药品通用名3"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="药品通用名4"
                                        >
                                            {getFieldDecorator("name4", {})(
                                                <Input placeholder="请输入药品通用名4"/>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="给药途径"
                                        >
                                            {getFieldDecorator("aka081", {})(
                                                <Select  placeholder="请选择给药途径">
                                                    {BKA219Tag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={30}>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="ATC-5"
                                        >
                                            {getFieldDecorator("ATC_5Value", {
                                                initialValue:this.state.ATC_5Value
                                            })(
                                                <AutoComplete
                                                    allowClear
                                                    placeholder="请输入"
                                                    onSelect={this.atc_5Change}
                                                    onSearch={this.search_5Change}
                                                >
                                                    {ATC_5Tag}
                                                </AutoComplete>
                                            )}

                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="ATC-7"
                                        >
                                            {getFieldDecorator("ATC_7Value", {
                                                initialValue:this.state.ATC_7Value
                                            })(
                                                <AutoComplete
                                                    allowClear
                                                    showSearch
                                                    placeholder="请输入"
                                                    onSelect={this.atc_7Change}
                                                    onSearch={this.search_7Change}
                                                    //value={ATC_7Value}
                                                >
                                                    {ATC_7Tag}
                                                </AutoComplete>
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
                                    dataId: this.state.query.code16Id
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
                        {`
                              .colorWhite{ background:#fff !important; }
                        `}
                    </style>
                </div>
                <Modal
                    visible={this.state.visible}
                    onCancel={()=>{this.setState({ visible:false })}}
                    footer={null}
                    title="code12信息查询"
                    width={800}
                >
                    <Search placeholder="请输入编码或名称！" onSearch={this.codeValueChange} style={{marginBottom:'10px'}} />
                    <Table
                        border
                        columns={columns12}
                        dataSource={this.state.data12}
                        rowKey={record=>record.dataId}
                        onChange={this.onChange}
                        onRowClick={this.rowClick}
                        pagination={{
                            current: this.state.pagesize,
                            showTotal: () => (`总数 ${this.state.count} 条`),
                            total: this.state.count,
                            pageSize: this.state.pagerow,
                            showSizeChanger: true,
                            showQuickJumper: true,
                        }}
                    />
                </Modal>
            </div>
        )
    }
}

Add = Form.create()(Add);
export default Add;
