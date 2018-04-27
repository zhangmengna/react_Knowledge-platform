import React, {Component} from 'react';
import {Tabs, Button, Modal, Row, Col, Tag, Form, Input, message, Select, Transfer} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './index.less';
import subString from './../../../utils/subString'

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const confirm = Modal.confirm;

class Particular extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            libId: sessionStorage.getItem('libId'),
            libType: sessionStorage.getItem('libType'), //库类型
            itemType: "", // 项目类别
            tabList: [],
            tabState: "1",
            tabName: "",
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
            body: 'data=' + JSON.stringify({"dict_code": 'itemType'})
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const tabList = []
                data.datas[0].map((option, i) => {
                    tabList.push({
                        text: option.display_name,
                        value: option.fact_value
                    })
                    return false;
                })
                this.setState({
                    tabList: tabList
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });

        if (this.state.query.exceptId) {
            window.Fetch(urlBefore + '/kpi/query_exceptCatalog.action', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({"exceptId": this.props.query.exceptId})
            }).then(res =>
                res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        itemType: data.datas.itemType
                    })
                } else {
                    message.warning(data.result)
                }
            }).catch((error) => {
                message.error(error.message);
            });
        }

    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({
                query: nextProps.query
            })
        }
    }

    tabClick = (e) => {
        this.setState({
            tabState: e
        })
    }

    render() {
        return (
            <div className={style.wrap}>
                <BreadcrumbCustom first={this.state.query.first} second={this.state.query.second}
                                  three={this.props.query.exceptId ? "查看除外案件" : "新增除外案件"}/>
                {
                    this.props.query.exceptId ?
                        <div className={style.add}>
                            <Tabs activeKey={this.state.itemType} onChange={this.tabClick}>
                                {this.state.tabList ? this.state.tabList.map((tabList, i) => {
                                    return (<TabPane tab={tabList.text} key={tabList.value}
                                                     disabled={this.state.itemType !== tabList.value ? true : false}>
                                        <KeyBox query={{
                                            libType: this.state.libType,
                                            tabState: this.state.itemType,
                                            cataValue: this.props.query.exceptId
                                        }} back={this.props.back}/>
                                    </TabPane>)
                                }) : ""}
                            </Tabs>
                        </div>
                        :
                        <div className={style.add}>
                            <Tabs defaultActiveKey="1" onChange={this.tabClick}>
                                {this.state.tabList ? this.state.tabList.map((tabList, i) => {
                                    return (<TabPane tab={tabList.text} key={tabList.value}>
                                        <KeyBox query={{
                                            libType: this.state.libType,
                                            tabState: this.state.tabState,
                                            cataValue: ""
                                        }} back={this.props.back}/>
                                    </TabPane>)
                                }) : ""}
                            </Tabs>
                        </div>
                }
            </div>
        )
    }
}

class KeyBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cataName: "", // 除外案件编码或除外案件名称
            cataId: this.props.query.cataValue,
            cataNameList: [],
            query: this.props.query,
            leftValue: '',  // 查询标签
            rightValue: '',
            leftValues: [], // 标签
            rightValues: [],
            left: [],
            leftData: [],   // 穿梭框
            leftBase: [],
            rightData: [],
            selectedKeys: [],
            tagLeftId: "",   // 标签ID
            tagRightId: "",
            details: [],
            pagesize: 1,
            pagerow: 100,
            count: 0,
            cata: "",
        }
    }

    componentWillMount() {
        this.cataNameSearch()
        this.rightSearch();
        this.labelLeft();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({
                query: nextProps.query
            })
        }
    }

    //查询除外案件编码
    cataNameSearch = () => {
        window.Fetch(urlBefore + '/kpi/querylistNP_exceptCatalog.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: "data=" + JSON.stringify({
                cataName: this.state.cataName,
            })
        }).then(res => res.json()
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

    cataNameChange = (value) => {
        this.setState({
            cataName: value,
        }, () => this.cataNameSearch())
    }

    cataNameSelect = (value, option) => {
        this.setState({
            cataName: value
        })
    }

    //左侧标签查询
    labelLeft = () => {
        window.Fetch(urlBefore + '/base/queryTagsByBusiType_tags.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                busiType: "0" + this.state.query.tabState,
                tagName: this.state.leftValue,
                libId: sessionStorage.getItem('libId'),
                libType: sessionStorage.getItem('libType')
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    leftValues: data.datas,
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }
    // //右侧标签查询
    // labelRight = () => {
    //     window.Fetch(urlBefore + '/base/queryTagsByBusiType_tags.action', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded'
    //         },
    //         credentials: 'include',
    //         body: 'data=' + JSON.stringify({
    //             busiType: "0" + this.state.query.tabState,
    //             tagName: this.state.rightValue,
    //             libId: sessionStorage.getItem('libId'),
    //             libType: sessionStorage.getItem('libType')
    //         })
    //     }).then(res => res.json()
    //         ).then(data => {
    //             if (data.result === 'success') {
    //                 this.setState({
    //                     rightValues: data.datas,
    //                 })
    //             }
    //         }).catch((error) => {
    //     message.error(error.message);
    // });
    // }
    leftValueChange = (e) => {
        this.setState({
            leftValue: e.target.value
        }, () => {
            this.labelLeft();
        })
    }
    rightValueChange = (e) => {
        this.setState({
            rightValue: e.target.value
        }, () => {
            this.labelRight();
        })
    }
    clickVL = (id, i) => {
        let data = this.state.leftValues.concat([]);
        data[i].checked = !data[i].checked;
        let arr = [];
        data.forEach((item, i) => {
            if (item.checked) {
                arr.push(item.tagId)
            }
        })
        this.setState({
            leftValues: data,
            pagesize: 1,
            tagLeftId: arr.join(',')   // 标签ID
        }, () => this.leftSearch())
    }

    // 查询左侧数据
    leftSearch = () => {
        let alldata = []
        this.state.AllData.forEach((all, i) => {
            alldata.push(all.key)
        })

        window.Fetch(urlBefore + '/kpi/queryUnChoselist_exceptCatalogDetail.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                exceptId: this.state.cataId, //除外案件id
                tagId: this.state.tagLeftId, // 标签id
                itemType: this.state.query.tabState, // 项目类别（见码表3.17
                dataId: alldata.join(','),  // 穿梭框右侧的id
                cataName: this.state.cata
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let leftData = [];
                let leftBase = [];
                if (Number(this.state.pagesize) === 1) {
                    leftData = this.state.AllData.concat([]);
                    leftBase = this.state.details.concat(data.datas);
                } else {
                    leftData = this.state.leftData.concat([]);
                    leftBase = this.state.leftBase.concat(data.datas);
                }
                for (let i = 0; i < data.datas.length; i++) {
                    let datas = data.datas[i];
                    leftData.push({
                        key: datas.dataId,
                        title: `${datas.itemName} -- ${datas.itemCode}`,
                        description: `${datas.itemName} -- ${datas.itemCode}`
                    })
                }
                this.setState({
                    leftData: leftData,
                    leftBase: leftBase,
                    count: data.count
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }
    // 查询右侧数据
    rightSearch = () => {
        const rightData = [];
        window.Fetch(urlBefore + '/kpi/queryChoselist_exceptCatalogDetail.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                exceptId: this.state.cataId ? this.state.cataId : "", //除外案件id
                tagId: this.state.tagRightId // 标签id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                const AllData = []
                data.datas ? data.datas.forEach((datas, i) => {
                    AllData.push({
                        key: datas.dataId,
                        title: `${datas.itemName} -- ${datas.itemCode}`,
                        description: `${datas.itemName} -- ${datas.itemCode}`
                    })
                    rightData.push(datas.dataId)
                }) : ""
                this.setState({
                    AllData: AllData,
                    rightData: rightData,
                    pagesize: 1,
                    details: data.datas ? data.datas : []
                })
                this.leftSearch();
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }
    handleScroll = (direction, e) => {
        let heightTop = e.target.scrollTop, html = e.target;
        if (e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight && e.target.offsetHeight !== e.target.scrollHeight && direction === "left" && this.state.leftData.length < this.state.count) {
            if (this.state.count > this.state.leftData.length) {
                this.setState({
                    pagesize: this.state.pagesize + 1
                }, () => {
                    let alldata = []
                    this.state.AllData.forEach((all, i) => {
                        alldata.push(all.key)
                    })

                    window.Fetch(urlBefore + '/kpi/queryUnChoselist_exceptCatalogDetail.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                            exceptId: this.state.cataId, //除外案件id
                            tagId: this.state.tagLeftId, // 标签id
                            itemType: this.state.query.tabState, // 项目类别（见码表3.17）
                            dataId: alldata.join(','),  // 穿梭框右侧的id
                            cataName: this.state.cata
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            let leftBase = this.state.leftBase.concat(data.datas);
                            let obj = {};
                            let resultBase = [];
                            leftBase.forEach((item) => {
                                let key = item.dataId;
                                if (!obj[key]) {
                                    obj[key] = true;
                                    resultBase.push(item);
                                }
                            })
                            let leftData = [];
                            for (let i = 0; i < resultBase.length; i++) {
                                let datas = resultBase[i];
                                leftData.push({
                                    key: datas.dataId,
                                    title: `${datas.itemName} -- ${datas.itemCode}`,
                                    description: `${datas.itemName} -- ${datas.itemCode}`
                                })
                            }
                            this.setState({
                                leftData: leftData,
                                leftBase: resultBase,
                                count: data.count
                            }, () => {
                                html.scrollTop = heightTop;
                            })
                        } else {
                            message.warning(data.result)
                        }
                    }).catch((error) => {
                        message.error(error.message);
                    });

                })
            }
        }
    }
    filterOption = (inputValue, option) => {
        return option.description.indexOf(inputValue) > -1;
    }
    handleChange = (nextTargetKeys, direction, moveKeys) => {
        let AllData = this.state.AllData.concat([]), details = this.state.details.concat([]), count = this.state.count
        if (direction === 'right') {

            count = count - moveKeys.length;
            this.state.leftBase.forEach((base, i) => {
                moveKeys.forEach((item, j) => {
                    if (base.dataId === item) {
                        details.push(base);
                        AllData.push({
                            key: item,
                            title: `${base.itemName}(${base.itemCode})`,
                            description: `${base.itemName}(${base.itemCode})`
                        })
                    }
                })
            })
        } else {
            count = count + moveKeys.length;
            moveKeys.forEach((item, j) => {
                details.forEach((detail, i) => {
                    if (detail.dataId === item) {
                        details.splice(i, 1);
                        i--;
                    }
                })
                AllData.forEach((detail, i) => {
                    if (detail.key === item) {
                        AllData.splice(i, 1);
                        i--;
                    }
                })
            })
        }
        this.setState({
            rightData: nextTargetKeys,
            AllData: AllData,
            details: details,
            count: count
        }, () => {
            if (this.state.leftBase.length === nextTargetKeys.length && this.state.count > 0 && direction === 'right') {
                this.setState({
                    pagesize: 1
                }, () => {
                    this.leftSearch();
                })
            }
        });
    }
    handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({
            selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys]
        });
    }
    onSearchChange = (direction, event) => {
        if (direction === "left") {
            //alert(1);
            this.setState({
                cata: event.target.value,
                pagesize: 1,
                leftBase: [],
                leftData: []
            }, () => this.leftSearch())
        }
    }
    submit = (e) => {
        e.preventDefault();
        this.state.cataId ?
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    // encodeURIComponent(encodeURIComponent(
                    const details = [];
                    this.state.details ? this.state.details.forEach((detail, i) => {
                        details.push({
                            dataId: detail.dataId,
                            itemName: encodeURIComponent(encodeURIComponent(detail.itemName)),
                            itemCode: encodeURIComponent(encodeURIComponent(detail.itemCode))
                        })
                    }) : ""
                    window.Fetch(urlBefore + '/kpi/modify_exceptCatalog.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            exceptId: this.state.cataId, //除外案件id
                            itemType: this.state.query.tabState, // 项目类别（见码表3.17
                            details
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            message.success('除外案件保存成功！');
                            this.props.back();
                        } else {
                            message.warning(data.result)
                        }
                    }).catch((error) => {
                        message.error(error.message);
                    })
                    // ));
                }
            }) :
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    // encodeURIComponent(encodeURIComponent(
                    const details = [];
                    this.state.details ? this.state.details.forEach((detail, i) => {
                        details.push({
                            dataId: detail.dataId,
                            itemName: encodeURIComponent(encodeURIComponent(detail.itemName)),
                            itemCode: encodeURIComponent(encodeURIComponent(detail.itemCode))
                        })
                    }) : ""
                    window.Fetch(urlBefore + '/kpi/insert_exceptCatalog.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            cataName: values.cataName,           //除外案件名称
                            itemType: this.state.query.tabState, // 项目类别（见码表3.17
                            details
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            message.success('除外案件新增成功！');
                            this.props.back();
                        } else {
                            message.warning(data.result)
                        }
                    }).catch((error) => {
                        message.error(error.message);
                    })
                    // ));
                }
            })
    }

    render() {
        const {cataNameList, cataId} = this.state;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 4}
            },
            wrapperCol: {
                xs: {span: 20}
            },
        };
        const cataNameTag = cataNameList ? cataNameList.map((cataNameList, i) => {
            return <Option value={cataNameList.value} text={cataNameList.text} key={i}>{cataNameList.text}</Option>
        }) : ""
        return (
            <div>
                <Form onSubmit={this.submit}>
                    <Row className={style.margin + " " + style.padding}>
                        <Col span={12}>
                            {
                                cataId ?
                                    <FormItem
                                        {...formItemLayout}
                                        label="目录名称:"
                                    >
                                        <Select
                                            showSearch
                                            style={{width: '100%'}}
                                            optionFilterProp="children"
                                            value={cataId}
                                            disabled
                                        >
                                            {cataNameTag}
                                        </Select>
                                    </FormItem>
                                    :
                                    <FormItem
                                        {...formItemLayout}
                                        label="目录名称:"
                                    >
                                        {getFieldDecorator("cataName", {})(
                                            <Select
                                                showSearch
                                                mode="combobox"
                                                style={{width: '100%'}}
                                                optionFilterProp="children"
                                                onFocus={this.cataNameSearch}
                                                onSelect={this.cataNameSelect}
                                                onSearch={this.cataNameChange}
                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {cataNameTag}
                                            </Select>
                                        )}
                                    </FormItem>
                            }
                        </Col>
                        <Col span={12}/>
                    </Row>
                    <Row className={style.padding}>
                        <Input value={this.state.leftValue} onChange={this.leftValueChange}
                               placeholder="请输入要查询的标签名称或疾病名称，支持通配符?/*"/>
                        <div className={style.tagDiv}>
                            {
                                this.state.leftValues ? this.state.leftValues.map((item, i) => (
                                    <Tag style={{marginBottom: '5px'}} title={item.tagName}
                                         color={item.checked ? 'geekblue' : ''} key={item.tagId}
                                         onClick={() => this.clickVL(item.tagId, i)}>{subString(item.tagName)}</Tag>
                                )) : ""
                            }
                        </div>
                    </Row>
                    <Transfer
                        className={style.padding + " Transfer " + style.margin}
                        dataSource={this.state.leftData}
                        titles={['可选项目(' + this.state.count + ')', '已选项目']}
                        targetKeys={this.state.rightData}
                        onChange={this.handleChange}
                        searchPlaceholder="搜索"
                        listStyle={{
                            width: '44%',
                            height: 500,
                        }}
                        rowKey={record => record.key}
                        showSearch
                        //filterOption={this.filterOption}
                        operations={['加入右侧', '加入左侧']}
                        onSelectChange={this.handleSelectChange}
                        onSearchChange={this.onSearchChange}
                        onScroll={this.handleScroll}
                        render={item => item.title}
                    />
                    <footer>
                        <Button onClick={this.props.back}>取消</Button>
                        <Button type="primary" htmlType="submit">确定</Button>
                    </footer>
                </Form>
                <style>
                    {`
						.ant-tag-has-color{
							color: #2f54eb;
						    background: #f0f5ff;
						    border-color: #adc6ff;
						}
                        .ant-transfer-operation {
                            margin: 0 19px;
                        }
                        .w50{ width: 50%; }
                        .ant-transfer-list-body{ background: #fff;}
                	`}
                </style>
            </div>
        )
    }
}

KeyBox = Form.create()(KeyBox);
export default Particular;
