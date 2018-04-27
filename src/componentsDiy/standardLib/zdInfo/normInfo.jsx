import React, {Component} from 'react';
import {Row, Col, Tabs, Button, Input, Tag, Transfer, Select, Table, message, Modal, AutoComplete, Radio} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const EditableCell = ({column, value, onChange}) => {
    if (column === 'threshold') {
        return <Input value={value} style={{width: '100%'}} onChange={e => onChange(e.target.value)}/>
    } else if (column === 'exp') {
        return <Input value={value} style={{width: '100%'}} onChange={e => onChange(e.target.value)}/>
    }
};
const valueexp2 = (value) => {
    if (value.substring(0, 1) !== '{') {
        //message.warning("表达式以{开头");
        return false;
    }
    if (value.substring(value.length - 1, value.length) !== '}') {
        //message.warning("表达式以}结尾");
        return false;
    }
    if (value.length < 7) {
        //message.warning("表达式长度不能小于7");
        return false;
    }
    if (value.length > 512) {
        //message.warning("可疑度量化表达式长度必须小于512");
        return false;
    }
    var rs2 = /\[\((-)?\d+(.\d+)?,(-)?\d+(.\d+)?\),(-)?\d+(.\d+)?\]/gi;
    var valueStr = value.substring(1, value.length - 1);
    if (valueStr.match(rs2) != null && valueStr.split("[") != null) {
        var macthCounts = valueStr.match(rs2).length;
        var size = valueStr.split("[").length - 1;
        if (macthCounts !== size) {
            //message.error('error');
            return false;
        } else {
            return true
        }
    } else {
        //message.error('error');
        return false;
    }
}

class Norm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            three: '配置指标信息',
            tagsRight: '',  //右侧标签
            golType: '01',
            types: [], //指标分类
            upData: [],
            baseData: [],
            typeDis: '100',
            upData0110: [],
            upData0130: [],
            upData0199: [],
            upData0210: [],
            upData0230: [],
            upData0299: [],
            upData0310: [],
            upData0330: [],
            upData0399: [],
            baseData0110: [],
            baseData0130: [],
            baseData0199: [],
            baseData0210: [],
            baseData0230: [],
            baseData0299: [],
            baseData0310: [],
            baseData0330: [],
            baseData0399: [],
            disNames: [], //诊断名称
            disNames0110: [],
            disNames0130: [],
            disNames0199: [],
            disNames0210: [],
            disNames0230: [],
            disNames0299: [],
            disNames0310: [],
            disNames0330: [],
            disNames0399: [],
            serPkgName: '',
            activeKey: '10'
        }
    }

    componentWillMount() {
        //指标分类
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'zblx'})
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    types: data.datas[0] ? data.datas[0] : []
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
        //
        window.Fetch(urlBefore + '/jcxx/querylistNP_icd10.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                codeOrName: ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    disNames0110: data.datas && data.datas.length > 0 ? data.datas : [],
                    disNames0130: data.datas && data.datas.length > 0 ? data.datas : [],
                    disNames0199: data.datas && data.datas.length > 0 ? data.datas : [],
                    disNames0210: data.datas && data.datas.length > 0 ? data.datas : [],
                    disNames0230: data.datas && data.datas.length > 0 ? data.datas : [],
                    disNames0299: data.datas && data.datas.length > 0 ? data.datas : [],
                    disNames0310: data.datas && data.datas.length > 0 ? data.datas : [],
                    disNames0330: data.datas && data.datas.length > 0 ? data.datas : [],
                    disNames0399: data.datas && data.datas.length > 0 ? data.datas : []
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
        //获取已选
        window.Fetch(urlBefore + '/bzpznew/queryChosedlist_diagKpi.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                aka120: this.props.query.aka120,
                type: "100"
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                console.log(data.datas);
                if (data.datas && data.datas.length === 0) {
                    this.setState({
                        'upData0110': [],
                        'upData0130': [],
                        'upData0199': [],
                        'upData0210': [],
                        'upData0230': [],
                        'upData0299': [],
                        'upData0310': [],
                        'upData0330': [],
                        'upData0399': []
                    })
                    let arr1 = ['0110', '0130', '0199', '0210', '0230', '0299', '0310', '0330', '0399'];
                    arr1.forEach((item) => {
                        this.getAll([], item);
                    })
                } else {
                    data.datas.forEach((item, i) => {
                        this.setState({
                            ['upData' + item.golType + item.treatType]: item.kpiDetails
                        }, () => {
                            let stringThe = item.golType + item.treatType;
                            this.getAll(item.kpiDetails, stringThe);
                        })
                    })
                }

            } else {
                message.error(data.message);
                this.setState({
                    'upData0110': [],
                    'upData0130': [],
                    'upData0199': [],
                    'upData0210': [],
                    'upData0230': [],
                    'upData0299': [],
                    'upData0310': [],
                    'upData0330': [],
                    'upData0399': []
                })
                let arr1 = ['0110', '0130', '0199', '0210', '0230', '0299', '0310', '0330', '0399'];
                arr1.forEach((item) => {
                    this.getAll([], item);
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }

    //右侧打标签
    tagsChange = (id) => {
        this.setState({
            tagsRight: id
        })
    }
    //radio切换
    onChange = (e) => {
        this.setState({
            golType: e.target.value,
            activeKey: '10'
        });
    }
    //类别变化
    /*typeChange=(value)=>{
        this.setState({
            typeDis:value
        })
    }*/
    autoChange = (value, key) => {
        this.setState({
            ['serPkgName' + key]: value
        }, () => {
            this.autoSearch(value, key);
        })
    }
    onSelect = (value, option, key) => { //分类选择
        let that = this;
        Modal.confirm({
            content: '是否使用该诊断指标替换已选指标信息！',
            onOk() {
                that.setState({
                    ['aka120The' + key]: option.props.code
                }, () => {
                    window.Fetch(urlBefore + '/bzpznew/queryDetailsByGolAndTreat_diagKpiDetail.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'data=' + JSON.stringify({
                            aka120: option.props.code,
                            treatType: that.state.activeKey,
                            golType: that.state.golType
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            that.setState({
                                ['upData' + key]: data.datas && data.datas.length > 0 ? data.datas : []
                            }, () => {
                                that.getAll(that.state['upData' + key], key)
                            })
                        }
                    }).catch(error => {
                        message.error(error.message);
                    })
                })
            },
            onCancel() {
                that.setState({
                    ['serPkgName' + key]: ''
                }, () => {
                    if (value) {
                        that.autoSearch('', key);
                    }
                })
            },
        });

    }
    //诊断查询
    autoSearch = (value, key) => {
        window.Fetch(urlBefore + '/jcxx/querylistNP_icd10.action', {
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
                    ['disNames' + key]: data.datas && data.datas.length > 0 ? data.datas : []
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //获取未选
    getAll = (arr, key) => {
        window.Fetch(urlBefore + '/bzpznew/queryUnChoselist_diagKpi.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                type: "100",
                libType: this.props.query.libType,
                kpis: arr
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                console.log(arr, key);
                console.log(data.datas && data.datas.length > 0 ? data.datas : []);
                this.setState({
                    ['baseData' + key]: data.datas && data.datas.length > 0 ? data.datas : []
                })
            } else {
                message.error(data.message);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //tab切换
    onChangeTab = (activeKey) => {
        this.setState({activeKey: activeKey});
    }
    //移上
    moveUp = (key, direction) => {
        let arr1 = this.state['upData' + key].concat([]);
        if (this.state['selectedRows' + key + direction]) {
            arr1 = arr1.concat(this.state['selectedRows' + key + direction]);
            this.setState({
                ['upData' + key]: arr1,
                ['selectedRows' + key + direction]: [],
                ['selectedRowKeys' + key + direction]: []
            }, () => {
                this.getAll(arr1, key)
            })
        } else {
            message.warning('请选择移入上部数据！')
        }

    }
    //移下
    moveDown = (key, direction) => {

        if (this.state['selectedRows' + key + direction]) {
            let arr1 = this.state['upData' + key].concat([]);
            let arr2 = this.state['selectedRowKeys' + key + direction].concat([]);
            let arrNew = [];
            for (let i = 0; i < arr1.length; i++) {
                if (arr2.join(',').indexOf(arr1[i].kpiCode) === -1) {
                    arrNew.push(arr1[i])
                }
            }
            console.log('arrNew', arrNew)
            this.setState({
                ['upData' + key]: arrNew,
                ['selectedRows' + key + direction]: [],
                ['selectedRowKeys' + key + direction]: []
            }, () => {
                this.getAll(arrNew, key)
            })
        } else {
            message.warning('请选择移入下部数据！')
        }
    }

    renderColumns(num, text, record, column) {
        return (
            <EditableCell
                column={column}
                value={text ? text.toString() : ''}
                onChange={value => this.tableHandleChange(num, value, record.kpiCode, column)}
            />
        );
    }

    tableHandleChange(num, value, key, column) {
        const newData = this.state['upData' + num];
        if (column === 'exp') {
            if (valueexp2(value)) {  //表达式正确
                const target = newData.filter(item => key === item.kpiCode)[0];
                if (target) {
                    target[column] = value;
                    target['meetExp'] = '';
                    this.setState({['upData' + num]: newData});
                }
            } else { //表达式错误
                const target = newData.filter(item => key === item.kpiCode)[0];
                if (target) {
                    target[column] = value;
                    target['meetExp'] = 'false';
                    this.setState({['upData' + num]: newData});
                }
            }
        } else {
            const target = newData.filter(item => key === item.kpiCode)[0];
            if (target) {
                target[column] = value;
                this.setState({['upData' + num]: newData});
            }
        }
        console.log(newData);
    }

    submitThe = () => {
        let arr1 = ['0110', '0130', '0199', '0210', '0230', '0299', '0310', '0330', '0399'];
        let kpis = [];
        arr1.forEach((item) => {
            kpis.push({
                treatType: item.slice(2, 4),
                golType: item.slice(0, 2),
                kpiDetails: this.state['upData' + item]
            })
        })
        let returnGet = () => {
            let result = true;
            arr1.forEach((item) => {
                this.state['upData' + item].forEach((data) => {
                    if (data.meetExp === 'false') {
                        result = false;
                    }
                })
            })
            return result;
        }
        if (returnGet()) {
            window.Fetch(urlBefore + '/bzpznew/insertOrUpdate_diagKpi.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({
                    aka120: this.props.query.aka120,
                    aka121: this.props.query.aka121,
                    kpis: kpis
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.props.back();
                    message.success('修改成功！')
                } else {
                    message.error(data.result)
                }
            }).catch(error => {
                message.error(error.message);
            })
        } else {
            message.warning('可疑度量化表达式不正确！');
        }

    }

    render() {
        const {query} = this.props;
        const columns = (key) => {
            return [
                {
                    title: '指标名称',
                    dataIndex: 'name',
                    width: 200,
                    className: 'text-left',
                    render: (text, record) => (
                        <div className="textBox" title={text}>{text}</div>
                    )
                }, {
                    title: '阈值',
                    dataIndex: 'threshold',
                    className: 'text-left',
                    width: 100,
                    render: (text, record) => this.renderColumns(key, text, record, 'threshold')
                }, {
                    title: '可疑度量化表达式',
                    dataIndex: 'exp',
                    className: 'text-left',
                    render: (text, record) => this.renderColumns(key, text, record, 'exp')
                }
            ]
        }
        const columnsBase = [
            {
                title: '指标名称',
                dataIndex: 'name',
                width: 200,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '阈值',
                dataIndex: 'threshold',
                className: 'text-left',
                width: 100,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '可疑度量化表达式',
                dataIndex: 'exp',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ]
        const rowSelectionFun = (key, direction) => {
            return {
                selectedRowKeys: this.state['selectedRowKeys' + key + direction],
                onChange: (selectedRowKeys, selectedRows) => {
                    console.log(key, direction);
                    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                    this.setState({
                        ['selectedRows' + key + direction]: selectedRows,
                        ['selectedRowKeys' + key + direction]: selectedRowKeys
                    }, () => {
                        console.log(this.state['selectedRows' + key + direction]);
                    })

                }
            }
        }
        return (
            <div>
                <BreadcrumbCustom first={this.props.query.first} second={this.props.query.second}
                                  three={this.state.three}/>
                <Row>
                    <Col span={24} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                        <h4>
                            配置指标信息
                        </h4>
                        <Row gutter={20}>
                            <Col span={12}>
                                <Input style={{marginBottom: '15px'}} value={query.aka120 + " - " + query.aka121}
                                       disabled/>
                            </Col>
                        </Row>
                        <Radio.Group value={this.state.golType} size="large" onChange={this.onChange}
                                     style={{marginBottom: 10}}>
                            <Radio.Button value="01">高套分值</Radio.Button>
                            <Radio.Button value="02">低标准住院</Radio.Button>
                            <Radio.Button value="03">分解住院</Radio.Button>
                        </Radio.Group>
                        <div className={this.state.golType === '01' ? '' : 'hidden'}>
                            <Tabs size="small" onChange={this.onChangeTab} activeKey={this.state.activeKey}>
                                <TabPane tab="保守治疗" key="10">
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <AutoComplete
                                                allowClear
                                                style={{width: '100%', marginBottom: '10px'}}
                                                onSelect={(value, option) => this.onSelect(value, option, '0110')}
                                                onChange={(value) => this.autoChange(value, '0110')}
                                                value={this.state['serPkgName' + '0110']}
                                                placeholder="选择诊断指标信息!"
                                            >
                                                {
                                                    this.state['disNames' + '0110'].map((item, i) => (
                                                        <AutoComplete.Option key={i}
                                                                             value={item.aka120 + '(' + item.aka121 + ')'}
                                                                             code={item.aka120} codeName={item.aka121}>
                                                            {item.aka120 + '(' + item.aka121 + ')'}
                                                        </AutoComplete.Option>
                                                    ))
                                                }
                                            </AutoComplete>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>
                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['upData0110']}
                                        columns={columns('0110')}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0110', 'up')}
                                        rowClassName={(record) => {
                                            if (record.meetExp) {
                                                return 'meetFalse'
                                            }
                                        }}
                                    />
                                    <Row gutter={20} style={{margin: '10px 0px'}}>
                                        <Col span={6} offset={6} style={{textAlign: 'right'}}>
                                            <Button icon="up" onClick={() => this.moveUp('0110', 'down')}>加入上部</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button icon="down"
                                                    onClick={() => this.moveDown('0110', 'up')}>加入下部</Button>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>

                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['baseData0110']}
                                        columns={columnsBase}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0110', 'down')}
                                    />
                                </TabPane>
                                <TabPane tab="手术治疗" key="30">
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <AutoComplete
                                                allowClear
                                                style={{width: '100%', marginBottom: '10px'}}
                                                onSelect={(value, option) => this.onSelect(value, option, '0130')}
                                                onChange={(value) => this.autoChange(value, '0130')}
                                                value={this.state['serPkgName' + '0130']}
                                                placeholder="选择诊断指标信息!"
                                            >
                                                {
                                                    this.state['disNames' + '0130'].map((item, i) => (
                                                        <AutoComplete.Option key={i}
                                                                             value={item.aka120 + '(' + item.aka121 + ')'}
                                                                             code={item.aka120} codeName={item.aka121}>
                                                            {item.aka120 + '(' + item.aka121 + ')'}
                                                        </AutoComplete.Option>
                                                    ))
                                                }
                                            </AutoComplete>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>
                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['upData0130']}
                                        columns={columns('0130')}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0130', 'up')}
                                        rowClassName={(record) => {
                                            if (record.meetExp) {
                                                return 'meetFalse'
                                            }
                                        }}
                                    />
                                    <Row gutter={20} style={{margin: '10px 0px'}}>
                                        <Col span={6} offset={6} style={{textAlign: 'right'}}>
                                            <Button icon="up" onClick={() => this.moveUp('0130', 'down')}>加入上部</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button icon="down"
                                                    onClick={() => this.moveDown('0130', 'up')}>加入下部</Button>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>

                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['baseData0130']}
                                        columns={columnsBase}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0130', 'down')}
                                    />
                                </TabPane>
                                <TabPane tab="其他治疗方式" key="99">
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <AutoComplete
                                                allowClear
                                                style={{width: '100%', marginBottom: '10px'}}
                                                onSelect={(value, option) => this.onSelect(value, option, '0199')}
                                                onChange={(value) => this.autoChange(value, '0199')}
                                                value={this.state['serPkgName' + '0199']}
                                                placeholder="选择诊断指标信息!"
                                            >
                                                {
                                                    this.state['disNames' + '0199'].map((item, i) => (
                                                        <AutoComplete.Option key={i}
                                                                             value={item.aka120 + '(' + item.aka121 + ')'}
                                                                             code={item.aka120} codeName={item.aka121}>
                                                            {item.aka120 + '(' + item.aka121 + ')'}
                                                        </AutoComplete.Option>
                                                    ))
                                                }
                                            </AutoComplete>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>
                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['upData0199']}
                                        columns={columns('0199')}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0199', 'up')}
                                        rowClassName={(record) => {
                                            if (record.meetExp) {
                                                return 'meetFalse'
                                            }
                                        }}
                                    />
                                    <Row gutter={20} style={{margin: '10px 0px'}}>
                                        <Col span={6} offset={6} style={{textAlign: 'right'}}>
                                            <Button icon="up" onClick={() => this.moveUp('0199', 'down')}>加入上部</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button icon="down"
                                                    onClick={() => this.moveDown('0199', 'up')}>加入下部</Button>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>

                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['baseData0199']}
                                        columns={columnsBase}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0199', 'down')}
                                    />
                                </TabPane>
                            </Tabs>
                        </div>
                        <div className={this.state.golType === '02' ? '' : 'hidden'}>
                            <Tabs size="small" onChange={this.onChangeTab} activeKey={this.state.activeKey}>
                                <TabPane tab="保守治疗" key="10">
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <AutoComplete
                                                allowClear
                                                style={{width: '100%', marginBottom: '10px'}}
                                                onSelect={(value, option) => this.onSelect(value, option, '0210')}
                                                onChange={(value) => this.autoChange(value, '0210')}
                                                value={this.state['serPkgName' + '0210']}
                                                placeholder="选择诊断指标信息!"
                                            >
                                                {
                                                    this.state['disNames' + '0210'].map((item, i) => (
                                                        <AutoComplete.Option key={i}
                                                                             value={item.aka120 + '(' + item.aka121 + ')'}
                                                                             code={item.aka120} codeName={item.aka121}>
                                                            {item.aka120 + '(' + item.aka121 + ')'}
                                                        </AutoComplete.Option>
                                                    ))
                                                }
                                            </AutoComplete>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>
                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['upData0210']}
                                        columns={columns('0210')}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0210', 'up')}
                                        rowClassName={(record) => {
                                            if (record.meetExp) {
                                                return 'meetFalse'
                                            }
                                        }}
                                    />
                                    <Row gutter={20} style={{margin: '10px 0px'}}>
                                        <Col span={6} offset={6} style={{textAlign: 'right'}}>
                                            <Button icon="up" onClick={() => this.moveUp('0210', 'down')}>加入上部</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button icon="down"
                                                    onClick={() => this.moveDown('0210', 'up')}>加入下部</Button>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>

                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['baseData0210']}
                                        columns={columnsBase}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0210', 'down')}
                                    />
                                </TabPane>
                                <TabPane tab="手术治疗" key="30">
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <AutoComplete
                                                allowClear
                                                style={{width: '100%', marginBottom: '10px'}}
                                                onSelect={(value, option) => this.onSelect(value, option, '0230')}
                                                onChange={(value) => this.autoChange(value, '0230')}
                                                value={this.state['serPkgName' + '0230']}
                                                placeholder="选择诊断指标信息!"
                                            >
                                                {
                                                    this.state['disNames' + '0230'].map((item, i) => (
                                                        <AutoComplete.Option key={i}
                                                                             value={item.aka120 + '(' + item.aka121 + ')'}
                                                                             code={item.aka120} codeName={item.aka121}>
                                                            {item.aka120 + '(' + item.aka121 + ')'}
                                                        </AutoComplete.Option>
                                                    ))
                                                }
                                            </AutoComplete>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>
                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['upData0230']}
                                        columns={columns('0230')}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0230', 'up')}
                                        rowClassName={(record) => {
                                            if (record.meetExp) {
                                                return 'meetFalse'
                                            }
                                        }}
                                    />
                                    <Row gutter={20} style={{margin: '10px 0px'}}>
                                        <Col span={6} offset={6} style={{textAlign: 'right'}}>
                                            <Button icon="up" onClick={() => this.moveUp('0230', 'down')}>加入上部</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button icon="down"
                                                    onClick={() => this.moveDown('0230', 'up')}>加入下部</Button>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>

                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['baseData0230']}
                                        columns={columnsBase}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0230', 'down')}
                                    />
                                </TabPane>
                                <TabPane tab="其他治疗方式" key="99">
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <AutoComplete
                                                allowClear
                                                style={{width: '100%', marginBottom: '10px'}}
                                                onSelect={(value, option) => this.onSelect(value, option, '0299')}
                                                onChange={(value) => this.autoChange(value, '0299')}
                                                value={this.state['serPkgName' + '0299']}
                                                placeholder="选择诊断指标信息!"
                                            >
                                                {
                                                    this.state['disNames' + '0299'].map((item, i) => (
                                                        <AutoComplete.Option key={i}
                                                                             value={item.aka120 + '(' + item.aka121 + ')'}
                                                                             code={item.aka120} codeName={item.aka121}>
                                                            {item.aka120 + '(' + item.aka121 + ')'}
                                                        </AutoComplete.Option>
                                                    ))
                                                }
                                            </AutoComplete>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>
                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['upData0299']}
                                        columns={columns('0299')}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0299', 'up')}
                                        rowClassName={(record) => {
                                            if (record.meetExp) {
                                                return 'meetFalse'
                                            }
                                        }}
                                    />
                                    <Row gutter={20} style={{margin: '10px 0px'}}>
                                        <Col span={6} offset={6} style={{textAlign: 'right'}}>
                                            <Button icon="up" onClick={() => this.moveUp('0299', 'down')}>加入上部</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button icon="down"
                                                    onClick={() => this.moveDown('0299', 'up')}>加入下部</Button>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>

                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['baseData0299']}
                                        columns={columnsBase}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0299', 'down')}
                                    />
                                </TabPane>
                            </Tabs>
                        </div>
                        <div className={this.state.golType === '03' ? '' : 'hidden'}>
                            <Tabs size="small" onChange={this.onChangeTab} activeKey={this.state.activeKey}>
                                <TabPane tab="保守治疗" key="10">
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <AutoComplete
                                                allowClear
                                                style={{width: '100%', marginBottom: '10px'}}
                                                onSelect={(value, option) => this.onSelect(value, option, '0310')}
                                                onChange={(value) => this.autoChange(value, '0310')}
                                                value={this.state['serPkgName' + '0310']}
                                                placeholder="选择诊断指标信息!"
                                            >
                                                {
                                                    this.state['disNames' + '0310'].map((item, i) => (
                                                        <AutoComplete.Option key={i}
                                                                             value={item.aka120 + '(' + item.aka121 + ')'}
                                                                             code={item.aka120} codeName={item.aka121}>
                                                            {item.aka120 + '(' + item.aka121 + ')'}
                                                        </AutoComplete.Option>
                                                    ))
                                                }
                                            </AutoComplete>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>
                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['upData0310']}
                                        columns={columns('0310')}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0310', 'up')}
                                        rowClassName={(record) => {
                                            if (record.meetExp) {
                                                return 'meetFalse'
                                            }
                                        }}
                                    />
                                    <Row gutter={20} style={{margin: '10px 0px'}}>
                                        <Col span={6} offset={6} style={{textAlign: 'right'}}>
                                            <Button icon="up" onClick={() => this.moveUp('0310', 'down')}>加入上部</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button icon="down"
                                                    onClick={() => this.moveDown('0310', 'up')}>加入下部</Button>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>

                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['baseData0310']}
                                        columns={columnsBase}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0310', 'down')}
                                    />
                                </TabPane>
                                <TabPane tab="手术治疗" key="30">
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <AutoComplete
                                                allowClear
                                                style={{width: '100%', marginBottom: '10px'}}
                                                onSelect={(value, option) => this.onSelect(value, option, '0330')}
                                                onChange={(value) => this.autoChange(value, '0330')}
                                                value={this.state['serPkgName' + '0330']}
                                                placeholder="选择诊断指标信息!"
                                            >
                                                {
                                                    this.state['disNames' + '0330'].map((item, i) => (
                                                        <AutoComplete.Option key={i}
                                                                             value={item.aka120 + '(' + item.aka121 + ')'}
                                                                             code={item.aka120} codeName={item.aka121}>
                                                            {item.aka120 + '(' + item.aka121 + ')'}
                                                        </AutoComplete.Option>
                                                    ))
                                                }
                                            </AutoComplete>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>
                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['upData0330']}
                                        columns={columns('0330')}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0330', 'up')}
                                        rowClassName={(record) => {
                                            if (record.meetExp) {
                                                return 'meetFalse'
                                            }
                                        }}
                                    />
                                    <Row gutter={20} style={{margin: '10px 0px'}}>
                                        <Col span={6} offset={6} style={{textAlign: 'right'}}>
                                            <Button icon="up" onClick={() => this.moveUp('0330', 'down')}>加入上部</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button icon="down"
                                                    onClick={() => this.moveDown('0330', 'up')}>加入下部</Button>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>

                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['baseData0330']}
                                        columns={columnsBase}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0330', 'down')}
                                    />
                                </TabPane>
                                <TabPane tab="其他治疗方式" key="99">
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <AutoComplete
                                                allowClear
                                                style={{width: '100%', marginBottom: '10px'}}
                                                onSelect={(value, option) => this.onSelect(value, option, '0399')}
                                                onChange={(value) => this.autoChange(value, '0399')}
                                                value={this.state['serPkgName' + '0399']}
                                                placeholder="选择诊断指标信息!"
                                            >
                                                {
                                                    this.state['disNames' + '0399'].map((item, i) => (
                                                        <AutoComplete.Option key={i}
                                                                             value={item.aka120 + '(' + item.aka121 + ')'}
                                                                             code={item.aka120} codeName={item.aka121}>
                                                            {item.aka120 + '(' + item.aka121 + ')'}
                                                        </AutoComplete.Option>
                                                    ))
                                                }
                                            </AutoComplete>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>
                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['upData0399']}
                                        columns={columns('0399')}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0399', 'up')}
                                        rowClassName={(record) => {
                                            if (record.meetExp) {
                                                return 'meetFalse'
                                            }
                                        }}
                                    />
                                    <Row gutter={20} style={{margin: '10px 0px'}}>
                                        <Col span={6} offset={6} style={{textAlign: 'right'}}>
                                            <Button icon="up" onClick={() => this.moveUp('0399', 'down')}>加入上部</Button>
                                        </Col>
                                        <Col span={6}>
                                            <Button icon="down"
                                                    onClick={() => this.moveDown('0399', 'up')}>加入下部</Button>
                                        </Col>
                                    </Row>
                                    <Row gutter={20}>
                                        <Col span={12}>
                                            <Select value={this.state.typeDis} disabled placeholder="请选择病状体征"
                                                    style={{width: '100%', marginBottom: 10}}
                                                    onChange={this.typeChange}>
                                                {this.state.types.map((item) => (
                                                    <Option key={item.fact_value}
                                                            value={item.fact_value}>{item.display_name}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                        </Col>
                                    </Row>

                                    <Table
                                        rowKey="kpiCode"
                                        scroll={{x: 300}}
                                        dataSource={this.state['baseData0399']}
                                        columns={columnsBase}
                                        pagination={false}
                                        rowSelection={rowSelectionFun('0399', 'down')}
                                    />
                                </TabPane>
                            </Tabs>
                        </div>

                    </Col>
                </Row>
                <footer>
                    <Button onClick={this.props.back}>取消</Button>
                    <Button type="primary" onClick={this.submitThe}>确定</Button>
                </footer>
                <style>
                    {`
						.ant-tabs-content{ padding-top:20px; }
						.ant-tabs-nav-scroll{ padding:0px; line-height:18px; }
						.ant-table-title{ padding:5px 0px; }
						.meetFalse{ color:#f00 !important; }
						.meetFalse .ant-input{ color:#f00 !important; }
	            	`}
                </style>
            </div>
        )
    }
}

export default Norm;