import React, {Component} from 'react';
import {Row, Col, Input} from 'antd';
import {urlBefore} from '../../data';

const Search = Input.Search;

//机构选择组件
class Selecter extends Component {
    static defaultProps = {
        areas: ['All', 'A-G', 'H-N', 'O-T', 'U-Z'],
    }

    constructor(props) {
        super(props);
        this.state = {
            areaThe: 0,  //当前区域
            dataShow: [], //要显示的数据
            data: [],	//全部数据
            place: '', //input中值
            name: '', //选中的医院
            nameIndex: []
        }
    }

    componentDidMount() {
        //初始渲染
        fetch(urlBefore + '/sc/queryAllHospitals_screcBillDetail.action', {
            method: 'POST',
            credentials: 'include',
            body: {}
        }).then(res => res.json()
        ).then(data => {
            let arr = [];
            data.datas.forEach((item) => {
                if (item.akb020) {
                    arr.push({
                        name: item.akb021,
                        letter: item.akb020,
                    })
                }
            })
            this.setState({
                data: arr
            }, function () {
                this.getShow()
            })
        })
    }

    //选择医院区间
    areaChange = (area, i) => {
        if (this.state.name === '' && this.state.nameIndex.length === 0) {
            this.setState({
                areaThe: i
            }, () => {
                this.getShow();
            })
        } else {
            this.setState({
                areaThe: i,
                nameIndex: [],
                name: '',
            }, () => {
                this.getShow();
                this.props.placeChange('');
            })
        }


    }
    //输入框值改变时
    inputChange = (value) => {
        this.setState({
            place: value,
            nameIndex: [],
            name: '',
        }, function () {
            this.getShow();
        })
    }
    //显示数据变化
    getShow = () => {
        let num = this.state.areaThe;
        let data = [];
        if (num === 0) {
            if (this.state.place) {
                this.state.data.forEach((item) => {
                    if (item.name.indexOf(this.state.place) > -1) {
                        data.push(item);
                    }
                })
            } else {
                data = this.state.data;
            }
        } else if (num === 1) {
            let stringThis = 'abcdefg';
            if (this.state.place) {
                this.state.data.forEach((item) => {
                    if (item.name.indexOf(this.state.place) > -1 && stringThis.indexOf(item.letter) > -1) {
                        data.push(item);
                    }
                })
            } else {

                this.state.data.forEach((item) => {
                    if (stringThis.indexOf(item.letter) > -1) {
                        data.push(item);
                    }
                })
            }
        } else if (num === 2) {
            let stringThis = 'hijklmn';
            if (this.state.place) {
                this.state.data.forEach((item) => {
                    if (item.name.indexOf(this.state.place) > -1 && stringThis.indexOf(item.letter) > -1) {
                        data.push(item);
                    }
                })
            } else {
                this.state.data.forEach((item) => {
                    if (stringThis.indexOf(item.letter) > -1) {
                        data.push(item);
                    }
                })
            }
        } else if (num === 3) {
            let stringThis = 'opqrst';
            if (this.state.place) {
                this.state.data.forEach((item) => {
                    if (item.name.indexOf(this.state.place) > -1 && stringThis.indexOf(item.letter) > -1) {
                        data.push(item);
                    }
                })
            } else {
                this.state.data.forEach((item) => {
                    if (stringThis.indexOf(item.letter) > -1) {
                        data.push(item);
                    }
                })
            }
        } else if (num === 4) {
            let stringThis = 'uvwxyz';
            if (this.state.place) {
                this.state.data.forEach((item) => {
                    if (item.name.indexOf(this.state.place) > -1 && stringThis.indexOf(item.letter) > -1) {
                        data.push(item);
                    }
                })
            } else {
                this.state.data.forEach((item) => {
                    if (stringThis.indexOf(item.letter) > -1) {
                        data.push(item);
                    }
                })
            }
        }
        this.setState({
            dataShow: data,
        })
    }
    //选中医院
    enter = (nameThis, i) => {
        let arr = this.state.nameIndex;
        let name = '';
        if (this.state.nameIndex.join('').indexOf(i) > -1) {
            let num = this.state.nameIndex.indexOf(i);
            arr.splice(num, 1);
        } else {
            arr.push(i);
        }
        arr.forEach((index) => {
            name = name + ';' + this.state.dataShow[index].name;
        })

        this.setState({
            nameIndex: arr,
            name: name.slice(1),
        })
        this.props.placeChange(name.slice(1));
    }

    render() {
        const nameIndex = this.state.nameIndex.join('');
        return (
            <div>
                <Row style={{'background': '#f0f8fb'}}>
                    <Col span={4} style={{'background': '#f0f8fb'}}>
                        <p style={{textAlign: 'center', height: 68, lineHeight: '68px', margin: '0px'}}>医疗机构</p>
                    </Col>
                    <Col span={20} style={{'background': '#fff'}}>
                        <Row>
                            <Col className="areas" span={12}>
                                <ul>
                                    {this.props.areas.map((area, i) => (
                                        <li key={i} className={this.state.areaThe === i ? 'active' : ''}
                                            onClick={() => this.areaChange(area, i)}>
                                            <span>{area}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Col>
                            <Col span={6}>
                                <Search
                                    placeholder="请输入搜索内容"
                                    //ref="placeInput"

                                    onSearch={(value) => this.inputChange(value)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24} className="place">
                                <ul>
                                    {this.state.dataShow.map((place, i) => {
                                        if (i < 8) {
                                            return (
                                                <li key={i} className={nameIndex.indexOf(i) > -1 ? 'active' : ''}
                                                    onClick={() => this.enter(place.name, i)}>
                                                    <span>{place.name}</span>
                                                </li>
                                            )
                                        }
                                        return null;
                                    })}
                                </ul>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default Selecter;