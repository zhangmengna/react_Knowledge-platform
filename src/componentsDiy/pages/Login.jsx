/**
 * 登录内容
 */
import React from 'react';
import {Form, Icon, Input, Button, Row, Col, message, Modal} from 'antd';
import {Link, hashHistory} from 'react-router';
import {urlBefore, InitData} from '../../data.js';
import bjText from '../../style/imgs/bj-text.png';

const FormItem = Form.Item;
//md5加密
const crypto = require('crypto');
const cryptPwd = function (password) {
    const md5 = crypto.createHash('md5');
    return md5.update(password).digest('hex');
}
console.log(urlBefore)

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 0,
            visible: false
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const param = {
                    "ipAddress": "",
                    "isUseYzm": "Y",
                    "useraccount": values.useraccount,
                    "password": cryptPwd(values.password + ''),
                    "yzm": values.yzm
                }
                window.Fetch(
                    urlBefore + '/basicsys/loginForCode_login.action',
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: 'data=' + JSON.stringify(param)
                    }).then(res => {
                        return res.json()
                    }
                ).then(data => {
                    if (data.result === "success") {
                        sessionStorage.setItem('user', data.loginUserInfo.useraccount);
                        sessionStorage.setItem('username', data.loginUserInfo.username);
                        sessionStorage.setItem('userid', data.loginUserInfo.userid);
                        sessionStorage.setItem('key', 0);
                        //跳页面
                        hashHistory.push('/app/index1/list');
                        //设置session中菜单数据

                        /*this.setState({
                            visible: true
                        })*/
                    } else if (data.result === 'accountpaswError') {
                        message.error('密码错误！');
                    } else if (data.result === 'randError') {
                        message.error('验证码错误！');
                    } else {
                        message.error(data.result);
                    }
                    this.imgChange();
                }).catch(error => {
                    message.error(error.message);
                })

            }
        });
    };
    handReset = () => {
        this.props.form.resetFields();
    }
    imgChange = () => {
        this.setState({
            key: this.state.key + 1
        })
    }
    handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    changeUrl = (url, i) => {
        if (url) {
            //设置session中系统第几个
            sessionStorage.setItem('InitData', JSON.stringify(InitData(i)));
            sessionStorage.setItem('page', i.toString());
            // hashHistory.push('/'); 地址url中加？
            window.location.replace(window.location.href.split('#')[0])
        }
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <div className="login">
                <div className="login-box">
                    <div className="login-form">
                        <div className="bj-box">
                            <img className="bjText" src={bjText} alt=""/>
                        </div>
                        <Form onSubmit={this.handleSubmit}>
                            <FormItem>
                                {getFieldDecorator('useraccount', {
                                    rules: [{required: true, message: '请输入用户名!'}],
                                })(
                                    <Input size="large" placeholder="请输入用户名"/>
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('password', {
                                    rules: [{required: true, message: '请输入密码!'}],
                                })(
                                    <Input size="large" type="password" placeholder="请输入密码"/>
                                )}
                            </FormItem>
                            <FormItem>
                                <Row gutter={20}>
                                    <Col span={16}>
                                        {getFieldDecorator('yzm', {
                                            rules: [{required: true, message: '请输入验证码!'}],
                                        })(
                                            <Input size="large" placeholder="请输入验证码"/>
                                        )}
                                    </Col>
                                    <Col span={8}>
                                        <img alt="验证码" className="yzm"
                                             src={urlBefore + `/image.jsp?key=${this.state.key}`}
                                             onClick={this.imgChange} style={{cursor: 'pointer'}}/>
                                    </Col>
                                </Row>
                            </FormItem>
                            <FormItem>
                                <Row style={{paddingTop: '10px'}}>
                                    <Col span={24}>
                                        <Button size={'large'} type="primary" htmlType="submit"
                                                className="login-form-button" style={{width: '100%'}}>
                                            登录
                                        </Button>
                                    </Col>
                                </Row>
                            </FormItem>
                        </Form>
                    </div>
                </div>
                {/*系统选择弹出框*/}
                <Modal
                    visible={this.state.visible}
                    width={980}
                    wrapClassName="vertical-center-modal"
                    //onCancel = { this.handleCancel }
                    footer={null}
                    closable={false}
                >
                    <div style={{height: 48, textAlign: 'center', padding: '8px 64px 0px 40px'}}>
                        <p style={{borderBottom: '1px solid #365ea6', marginBottom: '-15px'}}/>
                        <span style={{
                            display: 'inline-block',
                            width: 100,
                            height: 30,
                            lineHeight: '30px',
                            fontSize: '20px',
                            background: '#fff',
                            color: '#375da6'
                        }}>系统选择</span>
                    </div>
                    <div className="sysSelection">
                        <Row gutter={20} style={{marginBottom: '20px'}}>
                            <Col span={2}/>
                            {
                                window.systems.map((item, i) => (
                                    <Col key={i} span={4}>
                                        <Link className={item.url ? 'canClick' : ''}
                                              onClick={() => this.changeUrl(item.url, i)}>
                                            <Icon type={item.icon}/>
                                            <span>{item.name}</span>
                                        </Link>
                                    </Col>
                                ))
                            }
                        </Row>
                    </div>
                </Modal>
                <style>
                    {`
                        .login-box input:focus{ border-bottom-color:#EF6C08 !important; }
                        input:-webkit-autofill,
                            input:-webkit-autofill:hover,
                            input:-webkit-autofill:focus,
                            input:-webkit-autofill:active {
                                -webkit-transition-delay: 99999s;
                                -webkit-transition: color 99999s ease-out, background-color 99999s ease-out;
                        }
                    `}
                </style>
            </div>

        );
    }
}

export default Form.create()(Login);