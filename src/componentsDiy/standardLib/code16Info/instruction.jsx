import React, {Component} from 'react';
import {Row, Col, message, Form, Input, Table, Popconfirm, Button, Modal} from 'antd';
import {urlBefore} from '../../../data';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './../../../components/modules/addTag/add.less';
import PropTypes from 'prop-types';

const FormItem = Form.Item;
const Search = Input.Search;

class Instruction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            data: [],
            pagesize: 1,
            pagerow: 10,
            count: 0,
            loading: false,
            codeOrName: '',
            visible:false,
            insId:'',
            value:'',
            sortname: '',
            sortorder: ''
        }
    }

    componentWillMount() {
        this.setState({
            pagerow: this.context.pageNum
        },()=>{
            this.searchData();
        })
    }
    searchData = () => {
        this.setState({
            loading: true
        }, () => {
            window.Fetch(urlBefore + '/jcxx/querylistForCode16_ka01Instruct.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow +'&sortname='+this.state.sortname+'&sortorder='+this.state.sortorder+ '&data=' + JSON.stringify({
                    codeOrName: this.state.codeOrName,
                    ake001:this.state.query.ake001,
                    ake002:this.state.query.ake002
                })
            }).then((res) => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    let key = [],keyArray = [];
                    data.datas.forEach((item)=>{
                        if(item.instructFlag === '1'){
                            key[0] = item.insId;
                            keyArray[0]=item;
                        }
                    })
                    this.setState({
                        data: data.datas&&data.datas.length>0 ? data.datas : [],
                        count: data.count,
                        selectedRowKeys:key,
                        selectedRows:keyArray,
                        loading: false
                    })
                }
            }).catch((error) => {
                message.error(error.message);
            });
        })

    }
    //删除
    delete = (id) => {
        window.Fetch(urlBefore + '/jcxx/delete_ka01Instruct.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'credentials': 'include',
            body: 'data=' + JSON.stringify({
                insId: id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('删除成功！');
                this.searchData()
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }
    //页码相关
    onChange = (pagination, filters, sorter) => {
        this.setState({
            pagesize: pagination.current,
            pagerow: pagination.pageSize,
            sortname: sorter.field ? sorter.field : '',
            sortorder: sorter.order ? sorter.order.replace('end', '') : '',
        }, () => {
            this.setState({
                loading: true
            }, () => {
                //分页时候不变化选中值
                window.Fetch(urlBefore + '/jcxx/querylistForCode16_ka01Instruct.action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow +'&sortname='+this.state.sortname+'&sortorder='+this.state.sortorder+'&data=' + JSON.stringify({
                        codeOrName: this.state.codeOrName,
                        ake001:this.state.query.ake001,
                        ake002:this.state.query.ake002
                    })
                }).then((res) => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            data: data.datas&&data.datas.length>0 ? data.datas : [],
                            count: data.count,
                            loading: false
                        })
                    }
                }).catch((error) => {
                    message.error(error.message);
                });
            })
        })
    }
    search = (value) => {
        this.setState({
            codeOrName: value
        }, () => {
            this.searchData();
        })
    }
    confirm = () => {
        if (this.state.selectedRowKeys && this.state.selectedRowKeys.length > 0) {
            window.Fetch(urlBefore + '/jcxx/bandInstruct_ka01Code16.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({
                    code16Id: this.props.query.ake001,
                    bkz149: this.state.selectedRows[0]['bkz149']
                })
            }).then((res) => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success('绑定成功！');
                    this.props.back();
                } else {
                    message.error(data.message);
                }
            }).catch((error) => {
                message.error(error.message);
            });
        } else if(this.state.query.bkz149&&this.state.selectedRowKeys.length === 0){
            window.Fetch(urlBefore + '/jcxx/bandInstruct_ka01Code16.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({
                    code16Id: this.props.query.ake001,
                    bkz149: ''
                })
            }).then((res) => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success('取消绑定成功！');
                    this.props.back();
                } else {
                    message.error(data.message);
                }
            }).catch((error) => {
                message.error(error.message);
            });
        }else {
            message.warning('请选择要绑定说明书！');
        }
    }
    amend =(id,bkz149)=>{
        this.setState({
            visible:true,
            value:bkz149,
            insId:id
        })
    }
    handleCancel=()=>{
        this.setState({
            visible:false,
            value:''
        })
    }
    valueChange=(e)=>{
        this.setState({
            value:e.target.value
        })
    }
    handleOk=()=>{
        window.Fetch( urlBefore+'/jcxx/modify_ka01Instruct.action',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                insId: this.state.insId,
                bkz149:this.state.value
            })
        }).then(res=>res.json()
        ).then(data=>{
            if(data.result === 'success'){
                this.setState({
                    visible:false,
                    value:''
                },()=>{
                    //不变化选中值
                    window.Fetch(urlBefore + '/jcxx/querylistForCode16_ka01Instruct.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow+'&sortname='+this.state.sortname+'&sortorder='+this.state.sortorder + '&data=' + JSON.stringify({
                            codeOrName: this.state.codeOrName,
                            ake001:this.state.query.ake001,
                            ake002:this.state.query.ake002
                        })
                    }).then((res) => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            this.setState({
                                data: data.datas&&data.datas.length>0 ? data.datas : [],
                                count: data.count,
                                loading: false
                            })
                        }
                    }).catch((error) => {
                        message.error(error.message);
                    });
                })
            }else{
                message.error(data.message);
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }
    render() {
        const columns = [
            {
                title: '操作类型',
                width: '90px',
                render: (text, record) => (
                    <div style={{color: '#007cfd'}}>
                        <span className={style.cursor} title="修改"
                              onClick={() => this.amend(record.insId,record.bkz149)}>修改</span>&nbsp;|&nbsp;
                        <Popconfirm title="是否确认删除?" onConfirm={() => this.delete(record.insId)}>
                            <span className={style.cursor} title="删除">删除</span>
                        </Popconfirm>
                    </div>
                )
            },
            {
                title: '匹配code16',
                width: "120px",
                dataIndex: 'code16Flag',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '药品说明书编码',
                width: "140px",
                dataIndex: 'bkz149',
                className: 'text-left',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '药品通用名',
                width: "150px",
                dataIndex: 'aka061',
                className: 'text-left',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '商品名',
                width: "130px",
                dataIndex: 'aka062',
                sorter: true,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '规格',
                width: "200px",
                dataIndex: 'aka074',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '包装',
                dataIndex: 'ake112',
                width: "200px",
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '生产单位',
                width: "200px",
                dataIndex: 'aka098',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作员',
                width: "160px",
                dataIndex: 'modifyUserName',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '操作日期',
                width: "130px",
                dataIndex: 'modifyDate',
                sorter: true,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ];
        const {query} = this.state;
        const {getFieldDecorator} = this.props.form;
        const rowSelection = {
            hideDefaultSelections:true,
            selectedRowKeys:this.state.selectedRowKeys,
            getCheckboxProps: record => ({
                disabled: !record.bkz149
            }),
            onSelect:(record, selected, selectedRows, nativeEvent)=>{
                let key = [],keyArray =[];
                key.push(record.insId);
                keyArray.push(record);
                if(selected){
                    this.setState({
                        selectedRowKeys:key,
                        selectedRows:keyArray
                    })
                }else{
                    this.setState({
                        selectedRowKeys:[],
                        selectedRows:[]
                    })
                }
            }
        };
        return (
            <Form layout="inline" className={this.context.withScreen === 'wide' ? style.wrap : style.wrapLittle}>
                <BreadcrumbCustom first={query.first} second={query.second} three="绑定说明书"/>
                <Row style={{marginBottom: '10px'}} gutter={30}>
                    <Col span={12}>
                        <FormItem
                            label="16位药品编码"
                        >
                            {
                                getFieldDecorator('ake001', {
                                    initialValue: query.ake001
                                })(
                                    <Input placeholder="请输入账户名" readOnly/>
                                )
                            }

                        </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            label="16位药品名称"
                        >
                            {
                                getFieldDecorator('ake002', {
                                    initialValue: query.ake002
                                })(
                                    <Input placeholder="请输入账户名"  readOnly/>
                                )
                            }
                        </FormItem>
                    </Col>
                    <Col span={12} style={{marginTop: '10px'}}>
                        <Search
                            placeholder="请输入编码或名称搜索！"
                            //value={ this.state.codeOrName }
                            onSearch={(value) => this.search(value)}
                        />
                    </Col>
                </Row>
                <div>
                    <Table
                        bordered
                        columns={columns}
                        dataSource={this.state.data}
                        rowKey={record => record.insId}
                        rowSelection={rowSelection}
                        onChange={this.onChange}
                        scroll={{x: 1500}}
                        loading={this.state.loading}
                        pagination={{
                            current: this.state.pagesize,
                            showTotal: () => (`总数 ${this.state.count} 条`),
                            total: this.state.count,
                            pageSize: this.state.pagerow,
                            showSizeChanger: true,
                            pageSizeOptions: this.context.withScreen === 'wide' ? ['15', '30', '45', '60'] : ['10', '20', '30', '40'],
                            showQuickJumper: true,
                        }}
                    />
                </div>
                <footer>
                    <Button onClick={this.props.back}>取消</Button>
                    <Button type="primary" onClick={this.confirm}>确定</Button>
                </footer>
                <Modal
                    title="修改药品说明书编码"
                    visible={ this.state.visible }
                    onOk={ this.handleOk }
                    onCancel={ this.handleCancel }
                >
                    <Row>
                        <Col span={6}><p style={{ height:'28px',lineHeight:'28px' }}>药品说明书编码：</p></Col>
                        <Col span={12} >
                            <Input placeholder="请输入编码！" value={ this.state.value } onChange={ this.valueChange } />
                        </Col>
                    </Row>
                </Modal>
                <style>
                    {`
                    .ant-table-selection-column .ant-checkbox.ant-checkbox-disabled{ display:none; }
                `}
                </style>
            </Form>

        )
    }
}

Instruction.contextTypes = {
    withScreen: PropTypes.string,
    pageNum: PropTypes.number
}
Instruction = Form.create()(Instruction);
export default Instruction;