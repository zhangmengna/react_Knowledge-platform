import React, {Component} from 'react';
import {Tabs, Button, Modal, Row, Col, Tag, Form, Input, Icon, message, Select, Transfer} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './index.less';
import subString from './../../../utils/subString'

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const confirm = Modal.confirm;
const Search = Input.Search;

class Particular extends Component {
    constructor(props) {
        super(props);
        this.state = {
            libId: sessionStorage.getItem('libId'),
            first: '',
            second: '',
            libType: sessionStorage.getItem('libType'), //库类型
            itemType: "", // 项目类别
            tabList: [],
            tabState: "1",
            tabName: "",
        }
    }

    componentWillMount() {
        const libType = this.state.libType;
        let stringF = '';
        if (libType === 'bz') {
            stringF = "标准库"
        } else if (libType === 'dz') {
            stringF = "定制库"
        } else if (libType === 'xm') {
            stringF = "项目库"
        }
        this.setState({
            first: stringF,
            second: this.props.location.query.name
        })

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
    }

    tabClick = (e) => {
        this.setState({
            tabState: e
        })
    }

    render() {
        return (
            <div className={style.wrap}>
                <BreadcrumbCustom first={this.state.first} second={this.state.second}/>
                <div className={style.add}>
                    <Tabs defaultActiveKey="1" onChange={this.tabClick}>
                        {this.state.tabList ? this.state.tabList.map((tabList, i) => {
                            return (<TabPane tab={tabList.text} key={tabList.value}>
                                <KeyBox query={{libType: this.state.libType, tabState: this.state.tabState, key : tabList.value }}/>
                            </TabPane>)
                        }) : ""}
                    </Tabs>
                </div>

            </div>
        )
    }
}

class KeyBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            codeOrName: "", // 分类编码或分类名称
            codeOrValue: "",
            codeOrNameList: [],
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
            TabModalState: false,// 新增分类弹出框状态
            treatGroupType: "",  // 分类类型
            pagesize: 1,
            pagerow: 500,
            count: 0,
            codeOr: "",
            loading: false,
            aka070Array:[],
            aka081Array:[]
        }
    }

    componentWillMount() {
        this.rightSearch();
        this.labelLeft();
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
                this.setState({
                    aka070Array:data.datas&&data.datas[0]? data.datas[0]:[],
                    aka081Array:data.datas&&data.datas[1]? data.datas[1]:[],
                })
            } else {
                message.warning(data.result)
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

    //查询分类编码
    codeOrNameSearch = () => {
        const obj = {
            codeOrName: this.state.codeOrName,
            itemType: this.state.query.tabState,
            libType: this.state.query.libType
        };
        window.Fetch(urlBefore + '/jcxx/querylistNP_treatGroup.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify(obj)
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                const codeOrNameList = [];
                data.datas.forEach((datas, i) => {
                    codeOrNameList.push({
                        text: datas.treatGroupName,
                        value: datas.tgId
                    })
                })
                this.setState({
                    codeOrNameList: codeOrNameList
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }
    codeOrNameChange = (value, id) => {
        this.setState({
            codeOrValue: value,
            leftData: [],   // 穿梭框
            leftBase: [],
            rightData: [],
            loading: true
        }, () => { this.rightSearch(); })
    }
    // 新增分类弹框显示
    AddClick = () => {
        let treatGroupType = "";
        switch (this.state.query.tabState) {
            case "1":
                treatGroupType = '药品'
                break;
            case "2":
                treatGroupType = '诊疗'
                break;
            case "3":
                treatGroupType = '耗材'
                break;
            case "4":
                treatGroupType = '诊断'
                break;
            default:
                break;
        }
        this.setState({
            TabModalState: true,
            treatGroupType: treatGroupType
        });
    }
    // 新增分类弹框保存
    TabModaOk = () => {
        this.props.form.validateFields((err, values) => {
            window.Fetch(urlBefore + '/jcxx/insert_treatGroup.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({
                    treatGroupName: values.treatGroupName,  // 分类名称
                    treatGroupCode: values.treatGroupCode,  // 分类编码
                    itemType: this.state.query.tabState     // 项目类别（见码表3.17
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        TabModalState: false,
                        codeOrValue: data.datas.tgId
                    }, () => {
                        this.codeOrNameSearch();
                        this.rightSearch();
                    });
                    this.props.form.setFieldsValue({
                        treatGroupName: "",
                        treatGroupCode: ""
                    })
                    message.success("新增分类成功！")
                } else {
                    message.warning(data.result);
                    return false;
                }
            }).catch((error) => {
                message.error(error.message);
            });
        })
    }
    // 新增分类弹框关闭
    TabModalCancel = () => {
        this.setState({
            TabModalState: false,
        });
    }
    // 删除分类
    deleteTreatGroup = () => {
        if (this.state.codeOrValue) {
            const that = this;
            confirm({
                title: '确定要删除该分类？',
                onOk() {
                    window.Fetch(urlBefore + '/jcxx/delete_treatGroup.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            tgId: that.state.codeOrValue
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            that.setState({
                                codeOrValue: "",
                            }, () => that.rightSearch());
                            message.success("删除分类成功！")
                        } else {
                            message.warning(data.result);
                            return false;
                        }
                    }).catch((error) => {
                        message.error(error.message);
                    });
                },
                onCancel() { },
            });
        }
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

        window.Fetch(urlBefore + '/jcxx/queryUnChoselist_treatGroupDetail.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                tgId: this.state.codeOrValue, //分类id
                tagId: this.state.tagLeftId, // 标签id
                itemType: this.state.query.tabState, // 项目类别（见码表3.17
                dataId: alldata.join(','),  // 穿梭框右侧的id
                codeOrName: this.state.codeOr,
                aka070:this.state.aka070,
                aka081:this.state.aka081,
                atc:this.state.atc
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
                    if(this.state.query.key === '1'){
                        leftData.push({
                            key: datas.dataId,
                            title: `${datas.itemName} -- ${datas.itemCode} -- ${datas.largeClass} -- ${datas.midClass} -- ${datas.minClass}`,
                            description: `${datas.itemName} -- ${datas.itemCode}`
                        })
                    }else{
                        leftData.push({
                            key: datas.dataId,
                            title: `${datas.itemName} -- ${datas.itemCode}`,
                            description: `${datas.itemName} -- ${datas.itemCode}`
                        })
                    }
                    
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
    // 查询右侧数据-后查询左侧
    rightSearch = () => {
        const rightData = [];
        window.Fetch(urlBefore + '/jcxx/queryChosedlist_treatGroupDetail.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                tgId: this.state.codeOrValue, //分类id
                tagId: this.state.tagRightId // 标签id
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                const AllData = []
                data.datas && data.datas.datas ? data.datas.datas.forEach((datas, i) => {
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
                    details: data.datas && data.datas.datas ? data.datas.datas : [],
                    loading: (data.datas && data.datas.tgId === this.state.codeOrValue) || !this.state.codeOrValue ? false : true
                }, () => {
                    this.leftSearch();
                })

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

                    window.Fetch(urlBefore + '/jcxx/queryUnChoselist_treatGroupDetail.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                            tgId: this.state.codeOrValue, //分类id
                            tagId: this.state.tagLeftId, // 标签id
                            itemType: this.state.query.tabState, // 项目类别（见码表3.17）
                            dataId: alldata.join(','),  // 穿梭框右侧的id
                            codeOrName: this.state.codeOr
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
                                if(this.state.query.key === '1'){
                                    leftData.push({
                                        key: datas.dataId,
                                        title: `${datas.itemName} -- ${datas.itemCode} -- ${datas.largeClass} -- ${datas.midClass} -- ${datas.minClass}`,
                                        description: `${datas.itemName} -- ${datas.itemCode}`
                                    })
                                }else{
                                    leftData.push({
                                        key: datas.dataId,
                                        title: `${datas.itemName} -- ${datas.itemCode}`,
                                        description: `${datas.itemName} -- ${datas.itemCode}`
                                    })
                                }
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
                codeOr: event.target.value,
                pagesize: 1,
                leftBase: [],
                leftData: []
            }, () => this.leftSearch())
        }
    }
    submit = (e) => {
        console.log(e);
        e.preventDefault();
        this.state.codeOrValue ?
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    console.log(this.state.details)
                    // encodeURIComponent(encodeURIComponent(
                    const details = [];
                    this.state.details ? this.state.details.forEach((detail, i) => {
                        details.push({
                            dataId: detail.dataId,
                            itemName: encodeURIComponent(encodeURIComponent(detail.itemName)),
                            itemCode: encodeURIComponent(encodeURIComponent(detail.itemCode))
                        })
                    }) : ""
                    window.Fetch(urlBefore + '/jcxx/insertChosedlist_treatGroupDetail.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            tgId: this.state.codeOrValue, //分类id
                            itemType: this.state.query.tabState, // 项目类别（见码表3.17
                            details
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            message.success('分类保存成功！');
                            this.rightSearch();
                        } else {
                            message.warning(data.result)
                        }
                    }).catch((error) => {
                        message.error(error.message);
                    })
                    // ));
                }
            }) :
            message.warning('请选择分类！')
    }
    aka070Change=(value)=>{
        this.setState({
            aka070:value
        },()=>{
            this.leftSearch()
        })
    }
    aka081Change=(value)=>{
        this.setState({
            aka081:value
        },()=>{
            this.leftSearch()
        })
    }
    atcSearch=(value)=>{
        this.setState({
            atc:value
        },()=>{
            this.leftSearch()
        })
    }
    render() {
        const {codeOrNameList, codeOrValue} = this.state;
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 4}
            },
            wrapperCol: {
                xs: {span: 20}
            },
        };
        const codeOrNameTag = codeOrNameList ? codeOrNameList.map((codeOrNameList, i) => {
            return <Option value={codeOrNameList.value} key={i}>{codeOrNameList.text}</Option>
        }) : ""
        return (
            <div>
                <Form onSubmit={this.submit}>
                    <Row className={style.margin + " " + style.padding}>
                        <Col span={3}>请选择分类名称：</Col>
                        <Col span={16}>
                            <Select
                                showSearch
                                style={{width: '100%'}}
                                optionFilterProp="children"
                                onFocus={this.codeOrNameSearch}
                                onSelect={this.codeOrNameChange}
                                value={codeOrValue}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {codeOrNameTag}
                            </Select>
                        </Col>
                        <Col span={1}><Icon type="plus-circle" title="新增" className={style.IconAdd}
                                            onClick={this.AddClick}/></Col>
                        <Col span={1}><Icon type="minus-circle-o" title="删除" className={style.IconAdd}
                                            onClick={this.deleteTreatGroup}/></Col>
                        <Col span={6}/>
                    </Row>
                    <Row className={style.padding}>
                        {/*<Col span={11}>*/}
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
                        {/*</Col>*/}
                        {/*<Col span={2} />*/}
                        {/*<Col span={11}>*/}
                        {/*<Input value={this.state.rightValue} onChange={this.rightValueChange} placeholder="请输入要查询的标签名称或疾病名称，支持通配符?/*" />
                            <div className={style.tagDiv} >
                                {
                                    this.state.rightValues ? this.state.rightValues.map((item, i) => (
                                        <Tag style={{ marginBottom: '5px' }} title={item.tagName} color={item.checked ? 'geekblue' : ''} key={item.tagId} onClick={() => this.clickVR(item.tagId, i)}>{subString(item.tagName)}</Tag>
                                    )) : ""
                                }
                            </div>*/}
                        {/*</Col>*/}
                    </Row>
                    <Row className={ this.state.query.key === '1' ? style.padding : 'hidden'} >
                        <Col span={8}>
                            <Row>
                                <Col span={5} style={{lineHeight: '28px', textAlign: 'right'}}>剂型编码：</Col>
                                <Col span={19}>
                                    <Select allowClear onChange={this.aka070Change}>
                                        {this.state.aka070Array.map((item,i)=>{
                                            return <Option value={item.fact_value} key={item.fact_value} >{item.display_name}</Option>
                                        })
                                        }
                                    </Select>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row>
                                <Col span={5} style={{lineHeight: '28px', textAlign: 'right'}}>给药途径：</Col>
                                <Col span={19}>
                                    <Select allowClear onChange={this.aka081Change}>
                                        {this.state.aka081Array.map((item,i)=>{
                                            return <Option value={item.fact_value} key={item.fact_value} >{item.display_name}</Option>
                                        })
                                        }
                                    </Select>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row>
                                <Col span={5} style={{lineHeight: '28px', textAlign: 'right'}}>ATC信息：</Col>
                                <Col span={19}>
                                    <Search
                                        placeholder="请输入ATC信息！"
                                        onSearch={this.atcSearch}
                                    />
                                </Col>
                            </Row>
                        </Col>
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
                        <Button type="primary" htmlType="submit" loading={this.state.loading}>确定</Button>
                    </footer>
                    <Modal
                        title="新增分类"
                        visible={this.state.TabModalState}
                        onCancel={this.TabModalCancel}
                        footer={[
                            <Button key="submit" type="primary" onClick={this.TabModaOk}>确定</Button>,
                            <Button key="back" onClick={this.TabModalCancel}>
                                取消
                            </Button>
                        ]}
                    >
                        <div className={style.padding}>
                            <FormItem
                                {...formItemLayout}
                                label="分类类型"
                            >
                                <Input value={this.state.treatGroupType} disabled/>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="分类编码"
                            >
                                {getFieldDecorator("treatGroupCode", {})(
                                    <Input placeholder="请输入分类编码"/>
                                )}
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label="分类名称"
                            >
                                {getFieldDecorator("treatGroupName", {})(
                                    <Input placeholder="请输入分类名称"/>
                                )}
                            </FormItem>
                        </div>
                    </Modal>
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
