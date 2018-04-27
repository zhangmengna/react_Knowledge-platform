import React, {Component} from 'react';
import {Row, Col, Button, Input, Transfer, Select, message, AutoComplete} from 'antd';
import {urlBefore} from '../../../data.js';
import style from './../../../components/modules/addTag/add.less';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const Option = Select.Option;

class Sign extends Component {
    constructor(props) {
        super(props);
        this.state = {
            three: '病状体征信息',
            itemTypes: [], //项目类别
            symptomType: '',  //病状体征
            data: [], //可选数据
            dataSelect: [], //右侧数据数组
            targetKeys: [], //右侧关键字数组
            pagesize: 1,
            pagerow: 100,
            countL: 0,//左侧总数
            codeOrName: '',
            dataAuto: [],
            aka120: this.props.query.aka120,
            akaShow: false
        }
    }

    componentWillMount() {
        //获取病状体征类别
        fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'symptomType'})
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    itemTypes: data.datas[0] ? data.datas[0] : []
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
        //查询已选症状体征
        fetch(urlBefore + '/jcxx/queryChosedlist_icd10SymptomRela.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                'aka120': this.state.aka120
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let arr = [];
                if (data.datas && data.datas.length > 0) {
                    data.datas.map((item) => {
                        arr.push(item.dataId);
                    })
                }
                this.setState({
                    dataSelect: data.datas && data.datas.length > 0 ? data.datas : [],
                    targetKeys: arr
                })
            }
            return data;
        }).then(dataThe => {
            fetch(urlBefore + '/jcxx/queryUnChoselist_icd10SymptomRela.action', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' +
                JSON.stringify({
                    datas: dataThe.datas && dataThe.datas.length > 0 ? dataThe.datas : [],
                    symptomType: this.state.symptomType,
                    codeOrName: this.state.codeOrName
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    let arr = [];
                    if (data.datas && data.datas.length > 0) {
                        arr = this.state.dataSelect.concat(data.datas);
                    } else {
                        arr = this.state.dataSelect.concat([])
                    }
                    this.setState({
                        data: arr,
                        countL: data.count
                    })
                }
            })
        }).catch(error => {
            message.error(error.message);
        })
        this.autoSearch('');
    }

    //病状体征类别变化
    itemTypeLChange = (value) => {
        this.setState({
            symptomType: value,
            pagesize: 1
        }, () => {
            this.searchSelect();
        })
    }
    //查询可选择项
    searchSelect = () => {
        let arrData = this.state.dataSelect.concat([]);
        fetch(urlBefore + '/jcxx/queryUnChoselist_icd10SymptomRela.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                datas: this.state.dataSelect.length > 0 ? this.state.dataSelect : '',
                aka120: this.state.akaShow ? this.state.aka120 : '',
                symptomType: this.state.symptomType,
                codeOrName: this.state.codeOrName
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                //左侧数据
                let arr = [];
                //右侧合到左侧数据中
                if (this.state.pagesize === 1) {
                    arr = arrData.concat(data.datas);
                } else {
                    arr = arrData.concat(data.datas, this.state.data);
                }
                this.setState({
                    data: arr,
                    countL: data.count
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //穿梭框移动
    handleChange = (nextTargetKeys, direction, moveKeys) => {
        if (direction === 'right') {  //向右侧移动
            let count = this.state.countL;
            count = count - moveKeys.length;
            let arr = this.state.dataSelect;
            this.state.data.forEach((item, i) => {
                moveKeys.forEach((key, j) => {
                    if (item.dataId === key) {
                        arr.push(item);
                    }
                })
            })
            this.setState({
                targetKeys: nextTargetKeys, //右侧选中key集合
                dataSelect: arr, //右侧key对应数据
                countL: count
            }, () => {
                if (this.state.data.length === nextTargetKeys.length && this.state.countL > 0) {
                    this.setState({
                        pagesize: 1
                    }, () => {
                        this.searchSelect();
                    })
                }
            })
        } else {      //向侧左移动
            let count = this.state.countL;
            count = count + moveKeys.length;
            let arr = this.state.dataSelect.concat([]);
            let arrNew = [];
            arr.forEach((item, i) => {
                if (moveKeys.join(',').indexOf(item.dataId) === -1) {
                    arrNew.push(item)
                }
            })
            this.setState({
                targetKeys: nextTargetKeys, //右侧选中key集合
                dataSelect: arrNew, //右侧key对应数据
                countL: count
            })
        }
    }
    //穿梭框选中
    handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys]});
    }
    submitThe = () => {
        fetch(urlBefore + '/jcxx/insertOrUpdate_icd10SymptomRela.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                aka120: this.props.query.aka120,
                symtoms: this.state.dataSelect
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('修改成功！');
                this.props.back();
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //左侧搜索框输入
    onSearchChange = (direction, e) => {
        if (direction === 'left') {
            this.setState({
                codeOrName: e.target.value,
                pagesize: 1
            }, () => {
                this.searchSelect();
            })
        }
    }
    handleScroll = (direction, e) => {
        let heightTop = e.target.scrollTop;
        //穿梭框滚动到底部
        if (direction === 'left' && e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight&& e.target.offsetHeight !== e.target.scrollHeight && this.state.data.length < this.state.countL) {
            if (this.state.data.length < this.state.countL) {
                let html = e.target;
                this.setState({
                    pagesize: this.state.pagesize + 1
                }, () => {
                    let arrData = this.state.dataSelect;
                    //滚动后调搜索
                    fetch(urlBefore + '/jcxx/queryUnChoselist_icd10SymptomRela.action', {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                            datas: this.state.dataSelect.length > 0 ? this.state.dataSelect : '',
                            aka120: this.state.akaShow ? this.state.aka120 : '',
                            symptomType: this.state.symptomType,
                            codeOrName: this.state.codeOrName
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            //左侧数据
                            let arr = [];
                            //右侧合到左侧数据中
                            if (this.state.pagesize === 1) {
                                arr = arrData.concat(data.datas);
                            } else {
                                arr = arrData.concat(data.datas, this.state.data);
                            }
                            this.setState({
                                data: arr,
                                countL: data.count
                            }, () => {
                                html.scrollTop = heightTop;
                            })
                        }
                    }).catch(error => {
                        message.error(error.message);
                    })

                })
            }
        }
    }
    //
    autoChange = (value) => {
        this.setState({
            serPkgName: value
        }, () => {
            if (value) {
                this.autoSearch(value);
            } else {
                this.setState({
                    aka120: this.props.query.aka120,
                    pagesize: 1,
                    akaShow: false
                }, () => {
                    this.searchSelect();
                })
            }

        })
    }
    onSelect = (value, option) => { //分类选择
        this.setState({
            aka120: option.props.code,
            aka121: option.props.codeName,
            pagesize: 1,
            akaShow: true
        }, () => {
            this.searchSelect();
        })
    }
    //疾病分类查询
    autoSearch = (value) => {
        fetch(urlBefore + '/jcxx/querylistNP_icd10.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                codeOrName: value
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    dataAuto: data.datas && data.datas.length > 0 ? data.datas : []
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }

    render() {
        let classGet = function (status) {
            if (sessionStorage.getItem('libType') === 'xm') {
                if (status && status === '1') {
                    return '全部-';
                } else if (status && status === '2') {
                    return '部分-';
                } else if (status && status === '3') {
                    return '未映射-';
                }
                return '';
            }
            return '';
        }
        const {query} = this.props;
        const columns = [{
            title: '诊疗项目',
            dataIndex: 'aka120',
            width: 10,
            render: (text, record) => {
                if (record.groupFlag === '1') {
                    return <div className="textBox" title={record.aka120 + record.aka121}><span
                        onClick={() => this.detailShow(record.aka121, record.itemType, record.aka120)}
                        style={{cursor: "pointer", color: 'rgb(75, 76, 157)'}}>{record.aka120}{record.aka121}</span>
                    </div>
                } else {
                    return <div className="textBox"
                                title={record.aka120 + record.aka121}>{record.aka120}{record.aka121}</div>
                }
            }
        }, {
            title: '基础项',
            width: 10,
            dataIndex: 'isBase',
            render: (text, record) => this.renderColumns(text, record, 'isBase')
        }, {
            title: '必须项',
            width: 10,
            dataIndex: 'isMust',
            render: (text, record) => this.renderColumns(text, record, 'isMust')
        }, {
            title: '选择项',
            width: 10,
            dataIndex: 'isChoice',
            render: (text, record) => this.renderColumns(text, record, 'isChoice')
        }, {
            title: '特异性',
            width: 10,
            dataIndex: 'isSpecial',
            render: (text, record) => this.renderColumns(text, record, 'isSpecial')
        }, {
            title: '执行次数',
            width: 5,
            dataIndex: 'doNums',
            render: (text, record) => this.renderColumns(text, record, 'doNums')
        }, {
            title: '执行时间',
            width: 15,
            dataIndex: 'doTime',
            render: (text, record) => this.renderColumns(text, record, 'doTime')
        }];
        return (
            <div>
                <BreadcrumbCustom first={this.props.query.first} second={this.props.query.second}
                                  three={this.state.three}/>
                <Row>
                    <Col span={24} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                        <h4>
                            配置症状体征信息
                        </h4>
                        <div>
                            <Input style={{marginBottom: '10px'}} value={query.aka120 + " - " + query.aka121} disabled/>
                            <AutoComplete
                                allowClear
                                style={{width: '100%', marginBottom: '10px'}}
                                onSelect={this.onSelect}
                                onChange={this.autoChange}
                                value={this.state.serPkgName}
                                placeholder="选择疾病分类名称!"
                            >
                                {
                                    this.state.dataAuto.map((item, i) => (
                                        <AutoComplete.Option key={i} value={item.aka120 + '(' + item.aka121 + ')'}
                                                             code={item.aka120} codeName={item.aka121}>
                                            {item.aka120 + '(' + item.aka121 + ')'}
                                        </AutoComplete.Option>
                                    ))
                                }
                            </AutoComplete>
                        </div>
                        <div style={{overflow: 'hidden', marginBottom: '10px'}}>
                            <div style={{width: '40%', marginRight: '102px', float: 'left'}}>
                                <Select value={this.state.symptomType} allowClear placeholder="请选择病状体征"
                                        style={{width: '100%'}} onChange={this.itemTypeLChange}>
                                    {this.state.itemTypes.map((item) => (
                                        <Option key={item.fact_value}
                                                value={item.fact_value}>{item.display_name}</Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <style>
                            {`
								.myTransfer .ant-transfer-list-search-action{ display:none !important; }
							`}
                        </style>
                        <Transfer
                            className="myTransfer"
                            listStyle={{width: '40%', height: '300px', marginBottom: '10px'}}
                            dataSource={this.state.data}
                            showSearch
                            searchPlaceholder='搜索'
                            titles={[`${'可选项目列表(' + this.state.countL + ')'}`, '已选项目列表']}
                            operations={['加入右侧', '加入左侧']}
                            targetKeys={this.state.targetKeys}
                            onChange={this.handleChange}
                            onSelectChange={this.handleSelectChange}
                            onSearchChange={this.onSearchChange}
                            onScroll={this.handleScroll}
                            render={item => (item.symptomName + '(' + item.symptomCode + ')')}
                            rowKey={record => record.dataId}

                        />
                    </Col>
                </Row>
                <footer>
                    <Button onClick={this.props.back}>取消</Button>
                    <Button type="primary" onClick={this.submitThe}>确定</Button>
                </footer>
            </div>
        )
    }
}

export default Sign;