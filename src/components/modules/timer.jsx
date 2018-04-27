import React, {Component} from 'react';
import moment from 'moment';
import {Row, Col, DatePicker, Form} from 'antd';

const {RangePicker} = DatePicker;
const FormItem = Form.Item;

//日期选择组件   改变时调用this.props.dateChange
class Timer extends Component {
    static defaultProps = {
        timeNames: ['近3个月', '近1个月', '近10天', '近7天', '近3天'],
    }

    constructor(props) {
        super(props);
        this.state = {
            timeThis: [],
            event: ''
        }
    }

    //点击时间段事件
    timeChange = (time, i) => {
        let timeRang = [];
        if (i === this.state.event) {
            this.setState({
                timeThis: [moment('', 'YYYY-MM-DD'), moment('', 'YYYY-MM-DD')],
                event: ''
            }, function () {
                this.props.form.setFieldsValue({
                    times: timeRang,
                })
                this.props.dateChange(timeRang)
            })
        } else {
            if (time === '近3个月') {
                timeRang = [moment(this.setTime(90), 'YYYY-MM-DD'), moment(this.setTime(0), 'YYYY-MM-DD')];
            } else if (time === '近1个月') {
                timeRang = [moment(this.setTime(30), 'YYYY-MM-DD'), moment(this.setTime(0), 'YYYY-MM-DD')];
            } else if (time === '近10天') {
                timeRang = [moment(this.setTime(10), 'YYYY-MM-DD'), moment(this.setTime(0), 'YYYY-MM-DD')];
            } else if (time === '近7天') {
                timeRang = [moment(this.setTime(7), 'YYYY-MM-DD'), moment(this.setTime(0), 'YYYY-MM-DD')];
            } else if (time === '近3天') {
                timeRang = [moment(this.setTime(3), 'YYYY-MM-DD'), moment(this.setTime(0), 'YYYY-MM-DD')];
            }
            this.setState({
                timeThis: timeRang,
                event: i
            }, function () {
                this.props.form.setFieldsValue({
                    times: timeRang,
                })
                this.props.dateChange(timeRang)
            })
        }

    }
    //点击时间选择器事件
    timeSelect = (moment1, moment2) => {
        this.setState({
            timeThis: moment1,
            event: ''
        }, function () {
            this.props.form.setFieldsValue({
                times: moment1
            })
            this.props.dateChange(moment1)
        })
    }
    setTime = (n) => {
        let d = new Date();
        d.setDate(d.getDate() - n);
        return d;
    }

    render() {
        const timers = this.props.timeNames;
        const {getFieldDecorator} = this.props.form;
        return (
            <div className="timer">
                <Row>
                    <Col span={4} style={{'background': '#f0f8fb'}}>
                        <p style={{textAlign: 'center', height: 28, lineHeight: '28px', margin: '0px'}}>结算日期</p>
                    </Col>
                    <Col span={10}>
                        <ul>
                            {
                                timers.map((time, i) => (<li key={i} className={this.state.event === i ? 'active' : ''}
                                                             onClick={() => this.timeChange(time, i)}>
                                    <span>{time}</span></li>))
                            }
                        </ul>
                    </Col>
                    <Col span={5}>
                        <Form>
                            <FormItem>
                                {getFieldDecorator('times', {})(
                                    <RangePicker onChange={this.timeSelect}/>
                                )}
                            </FormItem>
                        </Form>

                    </Col>
                </Row>
                <style>{`
					.timer{ border-top:1px solid #e6e6e6; }
					.timer>.ant-row>div{ padding:5px 0px; }
					.timer ul{ overflow:hidden; padding:0px 10px; }
					.timer ul li{ float:left; width:20%; height:28px; line-height:28px; text-align:center; cursor:pointer; padding:0px 5px; }
					.timer ul li span{ display:inline-block; width:100%; height:100%; }
					.timer ul li:hover span{ border-radius:5px; background:#44bbb9; color:#fff; }
					.timer ul li.active span{ border-radius:5px; background:#44bbb9; color:#fff; }
					.timer .ant-form-item{ margin-bottom:0px; }
					.timer .ant-form-item-control{ line-height:normal; }
					.timer .ant-input-lg{ height:28px; }
					`}
                </style>
            </div>
        )
    }
}

Timer = Form.create()(Timer)

export default Timer;