import React, {Component} from 'react';
import {Row, Col, Button, Input, Tag, Transfer, Select, Table, message, Modal} from 'antd';
import {urlBefore} from '../../../data.js';
import style from './../../../components/modules/addTag/add.less';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import AddTag from './../../../components/modules/addTag/addTag';
import TransferChange from './transferData';

const Option = Select.Option;

const EditableCell = ({doTimes, column, value, onChange}) => {
    if (column === 'doNums') {
        return <Input value={value} style={{width: '100%'}} onChange={e => onChange(e.target.value)}/>
    } else if (column === 'doTime') {
        return (<Select style={{width: '100%'}} value={value} onChange={onChange}>
            {doTimes.map((item) => {
                return <Option key={item.fact_value} value={item.fact_value}>{item.display_name}</Option>
            })}
        </Select>)
    } else {
        return (<Select style={{width: '100%'}} value={value} onChange={onChange}>
            <Option value='0'>否</Option>
            <Option value='1'>是</Option>
        </Select>)
    }
};
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

class Common extends Component {
    constructor(props) {
        super(props);
        this.state = {
            three: '通用服务包',
            itemTypes: [], //项目类别
            spgId: this.props.query.spgId,
            serPkgType: '1',//服务包类型
            value: '', //input的值，搜索标签
            tags: [], //标签集合
            data: [], //可选数据
            dataSelect: [],
            targetKeys: [], //已选中数据key数组
            tagSelect: [],  //标签条件选中
            itemTypeL: '1',  //项目分类左边选中
            itemTypeR: '',  //项目分类右边选中
            tagsRight: [], //右侧标签
            doTimes: [],
            pagesize: 1,
            pagerow: 100,
            countL: 0,//左侧总数
            codeOrName: '',
            doTimeFilter: []
        }
    }

    componentWillMount() {
        //获取项目类别
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'AKE003,doTime'})
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let doTimeFilter = data.datas[1].map(item => {
                    return {
                        text: item.display_name,
                        value: item.fact_value
                    }
                });
                this.setState({
                    itemTypes: data.datas[0] ? data.datas[0] : [],
                    doTimes: data.datas[1] ? data.datas[1] : [],
                    doTimeFilter: doTimeFilter
                })
            }
        }).then(() => {
            //判断新增还是修改，
            if (this.props.query.spgId) {
                //修改，获取已选数据
                window.Fetch(urlBefore + '/bzpznew/queryChosedItems_servicePkg.action', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        spgId: this.state.spgId,
                        serPkgType: this.state.serPkgType,
                        itemType: ''
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        let arr = [];
                        if (data.datas[0] && data.datas.length > 0 && data.datas[0].pkgItems && data.datas[0].pkgItems.length > 0) {
                            data.datas[0].pkgItems.forEach((item) => {
                                if (item.itemType === this.state.itemTypeL) {
                                    arr.push(item.dataId)
                                }
                            })
                        }
                        this.setState({
                            dataSelect: data.datas[0].pkgItems && data.datas[0].pkgItems.length > 0 ? data.datas[0].pkgItems : [],
                            targetKeys: arr
                        }, () => {
                            this.tagSearch();
                        })
                    }
                })
            } else {
                this.setState({
                    dataSelect: [],
                    targetKeys: []
                }, () => {
                    this.tagSearch();
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
    //标签查询
    tagSearch = () => {
        window.Fetch(urlBefore + '/base/queryPkgTags_tags.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                tagOrDiag: this.state.value
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    tags: data.datas,
                    tagSelect: [],
                    data: [],
                    pagesize: 1
                }, () => {
                    this.searchSelect();
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //对标签进行搜索
    valueChange = (e) => {
        this.setState({
            value: e.target.value
        }, () => {
            this.tagSearch();
        })
    }
    //选中标签条件
    clickVL = (id, i) => {
        let data = this.state.tags;
        data[i].checked = !data[i].checked;
        this.setState({
            tags: data
        }, () => {
            let arr = [];
            this.state.tags.map((item, i) => {
                if (item.checked) {
                    arr.push(item.tagId)
                }
            });
            this.setState({
                tagSelect: arr,
                data: [],
                pagesize: 1
            }, () => {
                this.searchSelect();
            })
        })

    }
    //左侧项目类别变化
    itemTypeLChange = (value) => {

        let arr = [];
        if (this.state.dataSelect.length > 0 && value) {
            this.state.dataSelect.map((item) => {
                if (item.itemType === value) {
                    arr.push(item.dataId)
                }
            })
        } else {
            this.state.dataSelect.map((item) => {
                arr.push(item.dataId)
            })
        }
        this.setState({
            targetKeys: arr,
            itemTypeL: value,
            data: [],
            pagesize: 1
        }, () => {
            this.searchSelect();
        })
    }
    //查询可选择项
    searchSelect = () => {
        let arrData = [];
        if (this.state.itemTypeL && this.state.dataSelect.length > 0) {
            arrData = this.state.dataSelect.filter((item) => (item.itemType === this.state.itemTypeL));
        } else {
            arrData = this.state.dataSelect;
        }

        window.Fetch(urlBefore + '/bzpznew/queryItems_servicePkgItem.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                itemType: this.state.itemTypeL, //--项目类别 （见码表3.17）
                codeOrName: this.state.codeOrName, //--项目（分类）编码或名称------前端过滤，所以不传
                tagId: this.state.tagSelect.length > 0 ? this.state.tagSelect.join(',') : '',
                datas: arrData.length > 0 ? arrData : ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                //分类下已选数据
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
                        item.isBase = "1";
                        item.isMust = "1";
                        item.isSpecial = "1";
                        item.isChoice = "1";
                        item.doNums = 1;
                        item.doTime = "01";
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
            let arrNew = [], deleteArr = [], deleteString = [];
            arr.forEach((item, i) => {
                if (moveKeys.join(',').indexOf(item.dataId) === -1) {
                    arrNew.push(item)
                } else {
                    if (item.cloneTgId) {
                        deleteArr.push({
                            tgId: item.dataId
                        });
                        deleteString.push(item.dataId)
                    }
                }
            })
            //左侧数据
            let arrDataLeft = [];
            this.state.data.forEach((item) => {
                if (deleteString.join(',').indexOf(item.dataId) === -1) {
                    arrDataLeft.push(item)
                }
            })
            if (deleteArr && deleteArr.length > 0) {
                window.Fetch(urlBefore + '/jcxx/deleteClone_treatGroup.action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        datas: deleteArr && deleteArr.length > 0 ? deleteArr : ''
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {

                    } else {
                        message.error(data.message);
                    }
                }).catch(error => {
                    message.error(error.message);
                })
            }
            this.setState({
                data: arrDataLeft,
                targetKeys: nextTargetKeys, //右侧选中key集合
                dataSelect: arrNew, //右侧key对应数据
                countL: count - deleteString.length
            })
        }
    }
    //穿梭框选中
    handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys]});
    }

    //
    renderColumns(text, record, column) {
        return (
            <EditableCell
                doTimes={this.state.doTimes}
                column={column}
                value={text.toString()}
                onChange={value => this.tableHandleChange(value, record.dataId, column)}
            />
        );
    }

    tableHandleChange(value, key, column) {
        const newData = this.state.dataSelect.concat([]);
        const target = newData.filter(item => key === item.dataId)[0];
        if (target) {
            target[column] = value;
            this.setState({dataSelect: newData});
        }
    }

    submitThe = () => {
        window.Fetch(urlBefore + '/bzpznew/insertOrUpdate_servicePkg.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                serPkgType: this.state.serPkgType,
                spgId: this.state.spgId ? this.state.spgId : '',
                pkgs: [
                    {pkgItems: this.state.dataSelect}
                ],
                tags: this.state.tagsRight.length > 0 ? this.state.tagsRight : ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('新增成功！');
                this.props.back();
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    handleScroll = (direction, e) => {
        let heightTop = e.target.scrollTop;
        //穿梭框滚动到底部
        if (direction === 'left' && e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight && e.target.offsetHeight !== e.target.scrollHeight && this.state.data.length < this.state.countL) {
            if (this.state.data.length < this.state.countL) {
                let html = e.target;
                this.setState({
                    pagesize: this.state.pagesize + 1
                }, () => {
                    //滚动后调搜索
                    let arrData = [];
                    if (this.state.itemTypeL && this.state.dataSelect.length > 0) {
                        arrData = this.state.dataSelect.filter((item) => (item.itemType === this.state.itemTypeL));
                    } else {
                        arrData = this.state.dataSelect;
                    }
                    window.Fetch(urlBefore + '/bzpznew/queryItems_servicePkgItem.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                            itemType: this.state.itemTypeL, //--项目类别 （见码表3.17）
                            codeOrName: this.state.codeOrName, //--项目（分类）编码或名称------前端过滤，所以不传
                            tagId: this.state.tagSelect.length > 0 ? this.state.tagSelect.join(',') : '',
                            datas: arrData.length > 0 ? arrData : ''
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            let arr = [];
                            arr = arr.concat(data.datas, this.state.data);
                            let obj = {};
                            let result = [];
                            arr.forEach((item) => {
                                let key = item.dataId;
                                if (!obj[key]) {
                                    obj[key] = true;
                                    result.push(item);
                                }
                            })
                            this.setState({
                                data: result,
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
    //左侧搜索框输入
    onSearchChange = (direction, e) => {
        if (direction === 'left') {
            this.setState({
                codeOrName: e.target.value,
                pagesize: 1,
                data: [],
            }, () => {
                this.searchSelect();
            })
        }
    }
    //详情
    detailShow = (id, itemType, name, cloneTgId) => {
        this.setState({
            transferQuery: {
                id: id,
                itemType: itemType,
                cloneTgId: cloneTgId ? cloneTgId : '',
            },
            nameDetail: name,
            visibleDetail: true
        })
    }
    cancelDetail = () => {
        this.setState({
            visibleDetail: false
        })
    }
    liSave = (key, dataId, ake001, cloneTgId, dataId_before) => {
        debugger;
        if (key) {
            let arr = this.state['dataSelect' + key].concat([]);
            arr.forEach((item) => {
                if (item.dataId === dataId_before) {
                    item.dataId = dataId
                    item.ake001 = ake001
                    item.cloneTgId = cloneTgId
                }
            })
            let arrKeys = [];
            arr.forEach((item) => {
                arrKeys.push(item.dataId);
            })

            this.setState({
                ['dataSelect' + key]: arr,
                ['targetKeys' + key]: arrKeys,
                ['pagesize' + key]: 1,
                visibleDetail: false
            }, () => {
                this.searchSelect(key)
            })
        } else {
            let arr = this.state.dataSelect.concat([]);
            arr.forEach((item) => {
                if (item.dataId === dataId_before) {
                    item.dataId = dataId
                    item.ake001 = ake001
                    item.cloneTgId = cloneTgId
                }
            })
            let arrKeys = [];
            arr.forEach((item) => {
                arrKeys.push(item.dataId);
            })
            this.setState({
                dataSelect: arr,
                pagesize: 1,
                visibleDetail: false,
                targetKeys: arrKeys
            }, () => {
                this.searchSelect()
            })
        }
    }

    render() {

        const columns = [{
            title: '诊疗项目',
            dataIndex: 'ake002',
            className: 'text-left',
            width: '15%',
            render: (text, record) => {
                if (record.groupFlag === '1') {
                    return <div className="textBox" title={record.ake002}><span
                        onClick={() => this.detailShow(record.dataId, record.itemType, record.ake002, record.cloneTgId)}
                        style={{cursor: "pointer", color: 'rgb(75, 76, 157)'}}>{record.ake002}</span></div>
                } else {
                    return <div className="textBox" title={record.ake002}>{record.ake002}</div>
                }
            }
        }, {
            title: '编码',
            className: 'text-left',
            dataIndex: 'ake001',
            render: (text, record) => <div className="textBox" title={record.ake001}>{record.ake001}</div>
        }, {
            title: '基础项',
            width: 100,
            dataIndex: 'isBase',
            filters: [{
                text: '是',
                value: '1',
            }, {
                text: '否',
                value: '0',
            }],
            onFilter: (value, record) => record.isBase.indexOf(value) === 0,
            render: (text, record) => this.renderColumns(text, record, 'isBase')
        }, {
            title: '必须项',
            width: 100,
            dataIndex: 'isMust',
            filters: [{
                text: '是',
                value: '1',
            }, {
                text: '否',
                value: '0',
            }],
            onFilter: (value, record) => record.isMust.indexOf(value) === 0,
            render: (text, record) => this.renderColumns(text, record, 'isMust')
        }, {
            title: '选择项',
            width: 100,
            dataIndex: 'isChoice',
            filters: [{
                text: '是',
                value: '1',
            }, {
                text: '否',
                value: '0',
            }],
            onFilter: (value, record) => record.isChoice.indexOf(value) === 0,
            render: (text, record) => this.renderColumns(text, record, 'isChoice')
        }, {
            title: '特异性',
            width: 100,
            dataIndex: 'isSpecial',
            filters: [{
                text: '是',
                value: '1',
            }, {
                text: '否',
                value: '0',
            }],
            onFilter: (value, record) => record.isSpecial.indexOf(value) === 0,
            render: (text, record) => this.renderColumns(text, record, 'isSpecial')
        }, {
            title: '执行次数',
            width: 100,
            dataIndex: 'doNums',
            render: (text, record) => this.renderColumns(text, record, 'doNums')
        }, {
            title: '执行时间',
            width: 120,
            dataIndex: 'doTime',
            filters: this.state.doTimeFilter,
            onFilter: (value, record) => record.doTime.indexOf(value) === 0,
            render: (text, record) => this.renderColumns(text, record, 'doTime')
        }];
        const columnsDetail = [
            {
                title: '项目编码',
                width: 200,
                dataIndex: 'ake001',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text} </div>
                )
            }, {
                title: '项目名称',
                width: 200,
                dataIndex: 'ake002',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text} </div>
                )
            }
        ]
        return (
            <div>
                <BreadcrumbCustom first={this.props.query.first} second={this.props.query.second}
                                  three={this.state.three}/>
                <Row>
                    <Col span={18} style={{borderRight: '1px solid #ccc', padding: "20px"}}>
                        <h4>
                            {this.props.query.spgId ? "修改" : "新增"}{this.state.three}
                        </h4>
                        <div>
                            <Input value={this.state.value} onChange={this.valueChange}
                                   placeholder="请输入要查询的标签名称或疾病名称，支持通配符?/*"/>
                            <div style={{padding: '10px'}}>
                                {
                                    this.state.tags.map((item, i) => (
                                        <Tag style={{marginBottom: '5px'}} title={item.tagName}
                                             color={item.checked ? 'geekblue' : ''} key={item.tagId}
                                             onClick={() => this.clickVL(item.tagId, i)}>{item.tagName}</Tag>
                                    ))
                                }
                            </div>
                            <div style={{overflow: 'hidden', marginBottom: '10px'}}>
                                <Select value={this.state.itemTypeL} allowClear placeholder="请选择项目类别"
                                        style={{width: '100%'}} onChange={this.itemTypeLChange}>
                                    {this.state.itemTypes.map((item) => (
                                        <Option key={item.fact_value}
                                                value={item.fact_value}>{item.display_name}</Option>
                                    ))}
                                </Select>
                            </div>
                            <style>
                                {`
								.myTransfer .ant-transfer-list-search-action{ display:none !important; }
							`}
                            </style>
                            <Transfer
                                className="myTransfer"
                                listStyle={{width: '44%', height: '300px', marginBottom: '10px'}}
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
                                render={item => (classGet(item.mappingStatus) + item.ake002 + '(' + item.ake001 + ')')}
                                rowKey={record => record.dataId}

                            />
                            <Table
                                scroll={{y: 300}}
                                dataSource={this.state.dataSelect}
                                rowKey={record => record.dataId}
                                columns={columns}
                                pagination={false}
                            />
                        </div>
                    </Col>
                    <Col span={6} style={{padding: "20px"}}>
                        <AddTag searchObj={{
                            busiType: this.props.query.busiType,
                            libId: this.props.query.libId,
                            libType: this.props.query.libType,
                            dataId: this.props.query.spgId ? this.props.query.spgId : ''
                        }}
                                tagsChange={this.tagsChange}
                        />
                    </Col>
                </Row>
                <footer>
                    <Button onClick={this.props.back}>取消</Button>
                    <Button type="primary" onClick={this.submitThe}>确定</Button>
                </footer>
                <Modal
                    title={`${this.state.nameDetail}`}
                    visible={this.state.visibleDetail}
                    onCancel={this.cancelDetail}
                    bodyStyle={{
                        height: 400,

                    }}
                    width={800}
                    footer={null}
                >
                    {
                        this.state.visibleDetail
                            ?
                            <TransferChange
                                query={this.state.transferQuery}
                                back={this.cancelDetail}
                                liSave={this.liSave}
                            />
                            : ''
                    }
                </Modal>
            </div>
        )
    }
}

export default Common;
