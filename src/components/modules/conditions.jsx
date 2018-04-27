//医院级别、时间
import React, {Component} from 'react';
import {Row, Col, Input} from 'antd';

class ConditionThe extends Component {
    static defaultProps = {
        //默认属性
        histories: [
            {
                name: '不限',
                code: ''
            },
            {
                name: '三级医院',
                code: '3'
            },
            {
                name: '二级医院',
                code: '2'
            },
            {
                name: '二级以下',
                code: '1'
            }
        ],
        dates: [
            {
                name: '年度',
                code: 'year'
            },
            {
                name: '季度',
                code: 'quarter'
            },
            {
                name: '月度',
                code: 'month'
            }
        ]
    }

    constructor(props) {
        super(props);
        this.state = {
            historyThe: 0,
            dateThe: 0,
            time: '',
            inputValue: ''
        }
    }

    componentDidMount() {
        this.getDate('year');
    }

    historyChange = (code, i) => {
        this.setState({
            historyThe: i
        })
        this.props.historyChange(code);
    }
    dateChange = (code, i) => {
        this.setState({
            dateThe: i
        })
        this.getDate(code);
    }
    getDate = (code) => {
        let date = new Date();
        if (code === 'year') {
            let year = date.getFullYear();
            let yearStart = year - 9;
            this.setState({
                inputValue: yearStart + ' 至 ' + year,
                time: year
            }, () => {
                this.props.dateChange(code, this.state.time);
            })
        } else if (code === 'quarter') {
            let year = date.getFullYear();
            let yearStart;
            let month = date.getMonth();
            let quarter;
            let quarterStart;
            if (month < 3) {
                quarter = 1;
            } else if (month < 6) {
                quarter = 2
            } else if (month < 9) {
                quarter = 3
            } else {
                quarter = 4
            }
            if (quarter === 1) {
                quarterStart = 2;
                yearStart = year - 2;
            } else if (quarter === 2) {
                quarterStart = 3;
                yearStart = year - 2;
            } else if (quarter === 3) {
                quarterStart = 4;
                yearStart = year - 2;
            } else if (quarter === 4) {
                quarterStart = 1;
                yearStart = year - 1;
            }
            this.setState({
                inputValue: yearStart + 'Q' + quarterStart + ' 至 ' + year + 'Q' + quarter,
                time: year + 'Q' + quarter
            }, () => {
                this.props.dateChange(code, this.state.time);
            })
        } else if (code === 'month') {
            let year = date.getFullYear();
            let yearStart;
            let month = date.getMonth() + 1;
            let monthStart;
            if (month === 12) {
                monthStart = 1;
                yearStart = year;
            } else {
                monthStart = month + 1;
                yearStart = year - 1;
            }
            this.setState({
                inputValue: yearStart + (monthStart.toString().length === 1 ? '0' : '') + monthStart + ' 至 ' + year + (month.toString().length === 1 ? '0' : '') + month,
                time: year + (month.toString().length === 1 ? '0' : '') + month
            }, () => {
                this.props.dateChange(code, this.state.time);
            })
        }
    }

    render() {
        return (
            <div className="headerInfo">
                <Row className="sort" style={{borderBottom: '1px solid #e6e6e6', 'background': '#f0f8fb'}}>
                    <Col span={4} style={{'background': '#f0f8fb'}}>
                        <p style={{textAlign: 'center', height: 38, lineHeight: '38px', margin: '0px'}}>医院级别</p>
                    </Col>
                    <Col span={20} style={{'background': '#fff'}}>
                        <Row>
                            <Col span={24} style={{padding: '5px 0'}}>
                                <ul>
                                    {
                                        this.props.histories.map((history, i) => (
                                            <li key={i} className={this.state.historyThe === i ? 'active' : ''}
                                                onClick={() => this.historyChange(history.code, i)}>
                                                <span>{history.name}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="infos">
                    <Col span={4} style={{'background': '#f0f8fb'}}>
                        <p style={{textAlign: 'center', height: 38, lineHeight: '38px', margin: '0px'}}>时间</p>
                    </Col>
                    <Col span={20}>
                        <Row>
                            <Col span={12} style={{padding: '5px 0'}}>
                                <ul>
                                    {
                                        this.props.dates.map((date, i) => (
                                            <li key={i} className={this.state.dateThe === i ? 'active' : ''}
                                                onClick={() => this.dateChange(date.code, i)}>
                                                <span>{date.name}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </Col>
                            <Col span={6} style={{padding: '5px 0'}}>
                                <Input type="text" disabled value={this.state.inputValue}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <style>
                    {`
						.headerInfo{ background:#fff; border-radius:5px;  margin-bottom:10px; }
                        .headerInfo ul{ overflow:hidden; padding:0px 10px; }
                        .headerInfo ul li{ float:left;  width:90px; height:28px; line-height:28px; text-align:center; cursor:pointer; padding:0px 5px; }
                        .headerInfo ul li span{ display:inline-block; width:100%; height:100%; }
                        .headerInfo ul li.active span{ border-radius:5px; background:#44bbb9; color:#fff; }
                	`}
                </style>
            </div>
        )
    }
}

export default ConditionThe;