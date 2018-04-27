// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Select, Radio, Table} from 'antd';
import {urlBefore} from '../../../data';
import style from './../../../components/modules/addTag/add.less';
import AddTag from './../../../components/modules/addTag/addTag';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            tags: [],           // 选中标签的id
            busiTypedata: [],   // 标签分类
            tagTypedata: [],    // 类型
            amendData: {},      // 查询修改默认值
            pagesize: 1,	 	// 当前页
            pagerow: 10,        // 每页显示条数
            selectedRows: [],   // 列表选中
            selectedRowKeys: [],
            tableList: [],      // 列表内容
            count: 0,
            busiType: "",
            codeOrName: ""
        }
    }

    componentWillMount() {
        // 字典
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'busiType,tagType'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const busiTypedata = [],       // 标签分类
                    tagTypedata = []     // 类型
                data.datas[0].forEach((option, i) => {
                    busiTypedata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                data.datas[1].forEach((option, i) => {
                    tagTypedata.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                })
                this.setState({
                    busiTypedata: busiTypedata,
                    tagTypedata: tagTypedata
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error);
        });
    }

    componentDidMount() {
        // 查询修改信息
        if (this.state.query.tagId) {
            window.Fetch(urlBefore + "/base/query_tags.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify({tagId: this.state.query.tagId ? this.state.query.tagId : ""})
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        amendData: data.datas[0] ? data.datas[0] : "",
                        busiType: data.datas[0] ? data.datas[0].busiType : ""
                    }, () => {
                        this.props.form.setFieldsValue({
                            tagType: this.state.amendData ? this.state.amendData.tagType : '',
                        })

                        // 查询列表
                        window.Fetch(urlBefore + "/base/queryItems_tags.action", {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            credentials: 'include',
                            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + "&data=" + JSON.stringify({
                                tagId: this.state.query.tagId ? this.state.query.tagId : "",      //标签id
                                busiType: this.state.busiType,
                                codeOrName: this.state.codeOrName
                            })
                        }).then(res => res.json()
                        ).then(data => {
                            if (data.result === 'success') {
                                const selectedRowKeys = [];
                                if (data.datas && data.datas.tagsDatas) {
                                    data.datas.tagsDatas.forEach((tagsDatas, i) => {
                                        selectedRowKeys.push(tagsDatas.dataId)
                                    })
                                }
                                this.setState({
                                    selectedRowKeys,
                                    tableList: data.datas.pageDatas ? data.datas.pageDatas : "",
                                    count: data.count
                                })
                            } else {
                                message.warning(data.result);
                            }
                        }).catch(error => {
                            message.error(error);
                        })
                    })
                } else {
                    message.warning(data.result);
                }
            }).catch(error => {
                message.error(error);
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({
                query: nextProps.query
            })
        }
    }

    //页码相关
    onChange = (pagination, filters, sorter) => {
        this.setState({
            pagesize: pagination.current,
            pagerow: pagination.pageSize,
            // sortname: sorter.field ? sorter.field : '',
            // sortorder: sorter.order ? sorter.order.replace('end', '') : '',
        }, () => {
            this.Search()
        })
    }

    SearchTag = (e) => {
        this.setState({
            codeOrName: e.target.value  // 项目（分类）编码或名称
        }, () => this.Search())
    }

    Search = () => {
        window.Fetch(urlBefore + "/base/queryItems_tags.action", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + "&data=" + JSON.stringify({
                tagId: this.state.query.tagId ? this.state.query.tagId : "",      //标签id
                busiType: this.state.busiType,
                codeOrName: this.state.codeOrName
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    tableList: data.datas.pageDatas ? data.datas.pageDatas : "",
                    count: data.count
                })
            } else {
                message.warning(data.result);
            }
        }).catch(error => {
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
        let obj = {}, tagDatas = [];
        this.state.selectedRowKeys.forEach((tagdata, i) => {
            tagDatas.push({
                dataId: tagdata
            })
        })
        this.props.form.validateFields((err, values) => {
            obj = {
                tagType: values.tagType,    //TAG类型
                descr: values.descr,    // 描述	  
                tags: this.state.tags,   // 标签信息
                tagId: this.state.query.tagId,
                tagDatas
            }
            window.Fetch(urlBefore + "/base/insertOrUpdate_tags.action", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                credentials: 'include',
                body: "data=" + JSON.stringify(obj)
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    message.success("修改成功！")
                    this.props.back()
                } else {
                    message.warning(data.result);
                }
            }).catch(error => {
                message.error(error);
            })
        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {query, amendData, busiTypedata, tagTypedata, selectedRowKeys} = this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24}
            },
            wrapperCol: {
                xs: {span: 24}
            },
        };
        const columns = [
            {
                title: '编码',
                dataIndex: 'itemCode',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },
            {
                title: '名称',
                dataIndex: 'itemName',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ]

        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys: selectedRowKeys
                })
            },
            onSelect: (selectedRowKeys, selectedRows) => {
                // const url = selectedRows ? "/base/insertDateAndTag_tags.action" : "/base/deleteDateAndTag_tags.action"
                // window.Fetch(urlBefore + url, {
                //     method: 'POST',
                //     headers: {
                //         "Content-Type": "application/x-www-form-urlencoded"
                //     },
                //     credentials: 'include',
                //     body: "data=" + JSON.stringify({
                //         tagId: this.state.query.tagId,
                //         tagDatas: [{
                //             dataId: selectedRowKeys.dataId  //数据id
                //         }]
                //     })
                // }).then(res => res.json()
                //     ).then(data => {
                //         if (data.result === 'success') {

                //         } else {
                //             message.warning(data.result);
                //         }
                //     }).catch(error => {
                //         message.error(error);
                //     })

            },
            onSelectAll: (selectedRowKeys, selectedRows) => {
                // const tagDatas = [];
                // const url = selectedRowKeys ? "/base/insertDateAndTag_tags.action" : "/base/deleteDateAndTag_tags.action"
                // this.state.tableList.forEach((tagdata, i) => {
                //     tagDatas.push({
                //         dataId: tagdata.dataId
                //     })
                // })
                // window.Fetch(urlBefore + url, {
                //     method: 'POST',
                //     headers: {
                //         "Content-Type": "application/x-www-form-urlencoded"
                //     },
                //     credentials: 'include',
                //     body: "data=" + JSON.stringify({
                //         tagId: this.state.query.tagId,
                //         tagDatas: tagDatas  //数据id
                //     })
                // }).then(res => res.json()
                //     ).then(data => {
                //         if (data.result === 'success') {

                //         } else {
                //             message.warning(data.result);
                //         }
                //     }).catch(error => {
                //         message.error(error);
                //     })

            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
            }),
        };

        // 标签分类
        const busiTypeTag = busiTypedata ? busiTypedata.map((busiType, i) => {
            return <Option value={busiType.value} key={i}>{busiType.text}</Option>
        }) : ""

        // 类型
        const tagTypeTag = tagTypedata ? tagTypedata.map((tagType, i) => {
            return <Radio value={tagType.value} key={i}>{tagType.text}</Radio>
        }) : ""

        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div className={style.add}>
                    <Form onSubmit={this.submit}>
                        <Row>
                            <Col span={16} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                                <h4> 修改{query.second} </h4>
                                <Row>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="标签名称"
                                        >
                                            {getFieldDecorator("tagName", {
                                                initialValue: amendData ? amendData.tagName : ''
                                            })(
                                                <Input disabled/>
                                            )}
                                        </FormItem></Col>
                                    <Col span={1}/>
                                    <Col span={10}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="标签分类"
                                        >
                                            {getFieldDecorator("busiType", {
                                                initialValue: amendData ? amendData.busiType : ''
                                            })(
                                                <Select style={{width: '100%'}} disabled>
                                                    {busiTypeTag}
                                                </Select>
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={1}/>
                                    <Col span={6}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="类型"
                                        >
                                            {getFieldDecorator("tagType", {})(
                                                <RadioGroup>
                                                    {tagTypeTag}
                                                </RadioGroup>
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <FormItem
                                    {...formItemLayout}
                                    label="标签内容"
                                >
                                    {getFieldDecorator("codeOrName", {
                                        initialValue: ''
                                    })(
                                        <Input
                                            style={{width: '100%'}}
                                            // onPressEnter={this.SearchTag}
                                            onBlur={this.SearchTag}
                                            placeholder="输入查询关键字"
                                        />
                                    )}
                                </FormItem>
                                <Table
                                    bordered
                                    columns={columns}
                                    rowSelection={rowSelection}
                                    selections
                                    dataSource={this.state.tableList}
                                    rowKey={record => record.dataId}
                                    onChange={this.onChange}
                                    pagination={{
                                        current: this.state.pagesize,
                                        showTotal: () => (`总数 ${this.state.count} 条`),
                                        total: this.state.count,
                                        pageSize: this.state.pagerow,
                                        showSizeChanger: true,
                                        showQuickJumper: true
                                    }}
                                />
                                <FormItem
                                    {...formItemLayout}
                                    label="标签描述"
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
                                    dataId: this.state.query.tagId
                                }}
                                        tagsChange={this.tagsChange}
                                />
                            </Col>
                        </Row>
                        <footer>
                            <Button onClick={this.props.back}>取消</Button>
                            <Button type="primary" onClick={this.submit}>确定</Button>
                        </footer>
                        <style>
                            {`
                                form .ant-select, form .ant-cascader-picker{ width: auto; }
                            `}
                        </style>
                    </Form>
                </div>
            </div>
        )
    }
}

Add = Form.create()(Add);
export default Add;
