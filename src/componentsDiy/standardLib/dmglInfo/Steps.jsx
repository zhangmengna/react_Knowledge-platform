import React, {Component} from 'react';
import {message, Steps} from 'antd';
import {urlBefore} from '../../../data.js';

const Step = Steps.Step;

class Steps_all extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query,
            stepData: []
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query !== nextProps.query) {
            this.setState({
                query: nextProps.query
            }, () => {
                window.Fetch(urlBefore + '/base/queryForeFathers_dictManager.action', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify(this.state.query)
                }).then(res =>
                    res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            stepData: data.datas ? data.datas : []
                        })
                    } else {
                        message.warning(data.result);
                    }
                }).catch((error) => {
                    message.error(error.message);
                });
            })
        }
    }


    render() {
        const stepTab = this.state.stepData ? this.state.stepData.map((step, i) => {
            return <Step title={step.display_name} key={i} icon={<div style={{
                width: '10px',
                height: '10px',
                border: '2px solid #1e93fe',
                margin: '5px 0 0 4.5px',
                borderRadius: '50%'
            }}/>} description={step.item_spelling}/>
        }) : ""
        return (
            <div style={{marginTop: "60px"}}>
                <Steps direction="vertical" size="small" current={this.state.stepData.length - 1}>
                    {stepTab}
                </Steps>
                <style>
                    {`
                        .ant-steps .ant-steps-item.ant-steps-status-finish .ant-steps-title{ color: rgba(0,0,0,0.65)}
                        .ant-steps-vertical .ant-steps-main .ant-steps-title,
                        .ant-steps-vertical .ant-steps-head{ background: rgba(0,0,0,0); }
                        .ant-steps-vertical.ant-steps-small .ant-steps-tail { margin-top: 13px; padding: 2px 0 7px;}
                        .ant-steps .ant-steps-item.ant-steps-status-finish .ant-steps-tail > i:after{ background: #d9d9d9; }
                    `}
                </style>
            </div>
        )
    }
}

export default Steps_all;

