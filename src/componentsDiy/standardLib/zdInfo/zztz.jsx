// 统计
import React, {Component} from 'react';
import {Row, Col, message, Button, Form, Input, Tag, Transfer, Select} from 'antd';
import {urlBefore} from '../../../data';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import subString from './../../../utils/subString'
import styles from './style.less'

const Option = Select.Option;

class Zztz extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            itemTypes: [],
            tags: [],
            tagSelect: [],
            value: '',
            dataSelect: []
        }
    }

    componentWillMount() {
        //获取字典项--操作符
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({"dict_code": 'itemType'})
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    itemTypes: data.datas[0] ? data.datas[0] : [],
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
                    pagesize: 1
                }, () => {
                    this.searchSelect();
                })
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //选中标签条件
    clickVL = (id, i) => {
        let data = this.state.tags.concat([]);
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
        console.log('arrData', arrData);
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

    render() {
        const {query} = this.state;
        return (
            <div>
                <BreadcrumbCustom first={query.first} second={query.second}/>
                <div>
                    <Row>
                        <Col span={24} style={{padding: "20px"}}>
                            <h4>配置症状体征信息</h4>
                            <Input className={styles.mb} value={query.aka120 + " - " + query.aka121} disabled/>
                            <Input className={styles.mb} value={this.state.value} onChange={this.valueChange}
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
                                <div style={{width: '40%', marginRight: '102px', float: 'left'}}>
                                    <Select value={this.state.itemTypeL} allowClear placeholder="请选择项目类别"
                                            style={{width: '100%'}} onChange={this.itemTypeLChange}>
                                        {this.state.itemTypes.map((item) => (
                                            <Option key={item.fact_value}
                                                    value={item.fact_value}>{item.display_name}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>


                        </Col>
                    </Row>
                    <footer>
                        <Button onClick={this.props.back}>取消</Button>
                        <Button type="primary">确定</Button>
                    </footer>
                </div>
            </div>
        )
    }
}

export default Zztz;
