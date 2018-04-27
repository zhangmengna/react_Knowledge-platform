//页面头部
import React, {Component} from 'react';
import {Menu, Dropdown, Layout, Modal, Row, Col, Form, Input, message, Tabs, Tag, Icon} from 'antd';
/*import screenfull from 'screenfull';*/
import {Link} from 'react-router';
import {hashHistory} from 'react-router';
import logo from './../../style/imgs/logo1.png';
import {urlBefore, InitData} from './../../data.js';
import style from './HeaderComponent.less';

//md5加密
const crypto = require('crypto');
const cryptPwd = function (password) {
    const md5 = crypto.createHash('md5');
    return md5.update(password).digest('hex');
}
const FormItem = Form.Item;
const {Header} = Layout;
const TabPane = Tabs.TabPane;

class HeaderComponent extends Component {
    state = {
        visiblePerson: false,
        visiblePass: false,
        userInfo: {},
        username: sessionStorage.getItem('username'),
        themes: JSON.parse(
            localStorage.getItem('themes')) || [
            {type: 'info', checked: false},
            {type: 'grey', checked: false},
            {type: 'danger', checked: false},
            {type: 'warn', checked: false},
            {type: 'base', checked: false},
        ]
    }

    goOut = () => {
        window.Fetch(urlBefore + '/basicsys/loginout_login.action', {
            method: 'POST',
            credentials: 'include',
            body: {}
        }).then(res => res.json()
        ).then(data => {
            if (data.result === "success") {
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('userid');
                sessionStorage.removeItem('page');
                sessionStorage.removeItem('InitData');
                hashHistory.push('/login');

            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    personInfo = () => {
        window.Fetch(urlBefore + '/basicsys/query_user.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                userid: sessionStorage.getItem('userid')
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    visiblePerson: true,
                    userInfo: data
                })
            } else {
                message.error(data.result);
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    hideModalPerson = () => {
        this.setState({
            visiblePerson: false
        })
    }
    saveModalPerson = () => {
        let values = this.info.getFieldsValue();
        console.log(values);
        window.Fetch(urlBefore + '/basicsys/modify_user.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                userid: this.state.userInfo.user.userid,
                useraccount: this.state.userInfo.user.useraccount,
                username: values.username,
                namesimplepin: values.namesimplepin,
                mobilephone: values.mobilephone,
                namespelling: values.namespelling
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    visiblePerson: false,
                    username: values.username.toString()
                })
                message.success('保存成功！');
                sessionStorage.setItem('username', values.username.toString());
            } else {
                message.success(data.result);
            }
        }).error((error) => {
            message.error(error.message)
        })
    }
    personPass = () => {
        this.setState({
            visiblePass: true
        })
    }
    menuChange = (obj) => {
        if (obj.key === '1') {
            this.personInfo()
        } else if (obj.key === '2') {
            this.personPass()
        } else if (obj.key === '3') {
            this.goOut()
        }
    }
    hideModalPass = () => {
        this.setState({
            visiblePass: false
        })
    }
    saveModalPass = () => {
        this.password.validateFields((err, values) => {
            if (!err) {
                window.Fetch(urlBefore + '/basicsys/modify_user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({
                        userid: sessionStorage.getItem('userid'),
                        useraccount: sessionStorage.getItem('user'),
                        originalpassword: cryptPwd(values.originalpassword + ''),
                        password: cryptPwd(values.password + '')
                    })
                }).then(res => res.json()
                ).then(data => {
                    if (data.result === 'success') {
                        this.setState({
                            visiblePass: false
                        })
                        message.success('密码修改成功！');
                    } else {
                        message.success(data.result);
                    }
                }).catch((error) => {
                    message.error(error.message);
                })
            }
        });
    }

    render() {
        // Demo User text
        const menu = (
            <Menu onClick={this.menuChange} style={{marginTop: '-4px', width: '200px', lineHeight: '28px'}}>
                <Menu.Item key="1">
                    <span>个人信息</span>
                </Menu.Item>
                <Menu.Item key="2">
                    <span>修改密码</span>
                </Menu.Item>
                <Menu.Item key="3">
                    <span>注销</span>
                </Menu.Item>
            </Menu>
        );
        return (
            <div>
                {/*头部代码*/}
                <Header style={{background: '#ededf5'}}>
                    <div className={style.logo}>
                        <img src={logo} className="App-logo" alt="logo"/>
                    </div>
                    <Menu
                        className="ant-menu-main"
                        theme="dark"
                        mode="horizontal"
                        selectedKeys={[`${this.props.current}`]}
                        style={{float: 'left'}}
                        onClick={this.props.handleClick}
                    >
                        {InitData.map((item, i) => <Menu.Item key={i}><Link
                            to={item.url}><b>{item.name}</b><span>{item.english}</span></Link></Menu.Item>)}
                    </Menu>
                    <div style={{width: 250, float: 'right', fontSize: 13, color: '#333', fontWeight: 700}}>
                        <Row>
                            <Col span={12} style={{textAlign: 'left'}}>
                                <Dropdown overlay={menu} trigger={['click']}>
                                    <div style={{cursor: 'pointer'}}>
                                        <Icon type="user" alt="个人信息" style={{fontSize: '18px'}}/>&nbsp;个人信息
                                    </div>
                                </Dropdown>
                            </Col>
                            <Col span={12}>
                                <div style={{cursor: 'pointer'}}>
                                    <Icon type="bell" alt="消息" style={{fontSize: '18px'}}/>&nbsp;消息
                                </div>
                            </Col>
                        </Row>
                        <div className={`${this.props.inform ? style.informerbox : 'hidden'}`}>
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="通知(4)" key="1">
                                    <ul className={style.content}>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag style={{float: 'right'}}>未开始</Tag>任务名称
                                            </div>
                                            <p>任务需要在2017-01-12 20:00前启动</p>
                                        </li>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag color="red" style={{float: 'right'}}>马上到期</Tag>第三方紧急代码变更
                                            </div>
                                            <p>冠霖提交于2017-01-06，需在2017-01-07前完成代码变更任务</p>
                                        </li>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag color="lime"
                                                                                   style={{float: 'right'}}>已耗时8天</Tag>信息安全考试
                                            </div>
                                            <p>指派竹尔于2017-01-06 前完成更新并发布</p>
                                        </li>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag color="blue"
                                                                                   style={{float: 'right'}}>进行中</Tag>ABCD版本发布
                                            </div>
                                            <p>冠霖提交于 2017-01-06，需在2017-01-07 前完成代码变更任务</p>
                                        </li>
                                    </ul>
                                    <div style={{lineHeight: '47px', textAlign: 'center', bottomTop: '1px solid #ccc'}}>
                                        清空通知
                                    </div>
                                </TabPane>
                                <TabPane tab="消息(3)" key="2">
                                    <ul className={style.content}>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag style={{float: 'right'}}>未开始</Tag>任务名称
                                            </div>
                                            <p>任务需要在2017-01-12 20:00前启动</p>
                                        </li>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag color="red" style={{float: 'right'}}>马上到期</Tag>第三方紧急代码变更
                                            </div>
                                            <p>冠霖提交于2017-01-06，需在2017-01-07前完成代码变更任务</p>
                                        </li>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag color="lime"
                                                                                   style={{float: 'right'}}>已耗时8天</Tag>信息安全考试
                                            </div>
                                            <p>指派竹尔于2017-01-06 前完成更新并发布</p>
                                        </li>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag color="blue"
                                                                                   style={{float: 'right'}}>进行中</Tag>ABCD版本发布
                                            </div>
                                            <p>冠霖提交于 2017-01-06，需在2017-01-07 前完成代码变更任务</p>
                                        </li>
                                    </ul>
                                    <div style={{lineHeight: '47px', textAlign: 'center', bottomTop: '1px solid #ccc'}}>
                                        清空消息
                                    </div>
                                </TabPane>
                                <TabPane tab="待办(3)" key="3">
                                    <ul className={style.content}>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag style={{float: 'right'}}>未开始</Tag>任务名称
                                            </div>
                                            <p>任务需要在2017-01-12 20:00前启动</p>
                                        </li>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag color="red" style={{float: 'right'}}>马上到期</Tag>第三方紧急代码变更
                                            </div>
                                            <p>冠霖提交于2017-01-06，需在2017-01-07前完成代码变更任务</p>
                                        </li>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag color="lime"
                                                                                   style={{float: 'right'}}>已耗时8天</Tag>信息安全考试
                                            </div>
                                            <p>指派竹尔于2017-01-06 前完成更新并发布</p>
                                        </li>
                                        <li>
                                            <div style={{lineHeight: '40px'}}><Tag color="blue"
                                                                                   style={{float: 'right'}}>进行中</Tag>ABCD版本发布
                                            </div>
                                            <p>冠霖提交于 2017-01-06，需在2017-01-07 前完成代码变更任务</p>
                                        </li>
                                    </ul>
                                    <div style={{lineHeight: '47px', textAlign: 'center', bottomTop: '1px solid #ccc'}}>
                                        清空待办
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>
                        <style>
                            {`
								.ant-tabs-bar{ margin: 0; }
								.ant-tabs-nav-scroll{line-height: 28px;padding: 0 25px;}
							`}
                        </style>
                    </div>
                </Header>
                {/*个人信息*/}
                <Modal
                    title="个人信息修改"
                    width={700}
                    visible={this.state.visiblePerson}
                    onOk={this.saveModalPerson}
                    onCancel={this.hideModalPerson}
                    wrapClassName="vertical-center-modal"
                    closable={false}
                    okText="保存"
                    cancelText="取消"
                >
                    {this.state.visiblePerson ?
                        <FormInfo ref={(input) => { this.info = input; }} data={this.state.userInfo}/> : ''}
                </Modal>
                {/*修改密码*/}
                <Modal
                    title="密码修改"
                    width={400}
                    visible={this.state.visiblePass}
                    onOk={this.saveModalPass}
                    onCancel={this.hideModalPass}
                    wrapClassName="vertical-center-modal"
                    closable={false}
                    okText="保存"
                    cancelText="取消"
                >
                    {this.state.visiblePass ? <PassWord ref={(input) => { this.textInput = input; }}/> : ''}
                </Modal>
            </div>
        )
    }
}

export default HeaderComponent;

class FormInfo extends Component {

    componentDidMount() {
        this.props.form.setFieldsValue({
            departname: this.props.data.user.departname,
            useraccount: this.props.data.user.useraccount,
            username: this.props.data.user.username,
            namesimplepin: this.props.data.user.namesimplepin,
            mobilephone: this.props.data.user.mobilephone,
            namespelling: this.props.data.user.namespelling,
            date: this.props.data.user.validitybeginnew + '至' + this.props.data.user.validityendnew
        });
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 8, offset: 2}
            },
            wrapperCol: {
                xs: {span: 12}
            }
        }
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="部门名称"
                            >
                                {getFieldDecorator('departname', {})(
                                    <Input disabled/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="用户账号"
                            >
                                {getFieldDecorator('useraccount', {})(
                                    <Input disabled/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="用户名称"
                            >
                                {getFieldDecorator('username', {})(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="姓名拼写"
                            >
                                {getFieldDecorator('namesimplepin', {})(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="联系方式"
                            >
                                {getFieldDecorator('mobilephone', {})(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="姓名全称"
                            >
                                {getFieldDecorator('namespelling', {})(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="有效期"
                            >
                                {getFieldDecorator('date', {})(
                                    <Input disabled/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

FormInfo = Form.create({})(FormInfo)

class PassWord extends Component {
    checkPass = (rule, value, callback) => {
        const {validateFields} = this.props.form;
        if (value) {
            validateFields(['passwordSure']);
        }
        callback();
    }
    checkPass2 = (rule, value, callback) => {
        const {getFieldValue} = this.props.form;
        if (value && value !== getFieldValue('password')) {
            callback('两次输入密码不一致！');
        } else {
            callback();
        }
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 8, offset: 2}
            },
            wrapperCol: {
                xs: {span: 12}
            }
        }
        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="原始密码"
                    >
                        {getFieldDecorator('originalpassword', {
                            rules: [
                                {required: true, message: '请填写密码!'},
                                {min: 6, max: 12, message: '请输入 6~12 位字符！'}
                            ],
                        })(
                            <Input type="password" placeholder="请输入原始密码！"/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="新密码"
                    >
                        {getFieldDecorator('password', {
                            rules: [
                                {required: true, whitespace: true, message: '请填写密码！'},
                                {min: 6, max: 12, message: '请输入 6~12 位字符串！'},
                                {validator: this.checkPass}
                            ],
                        })(
                            <Input type="password" placeholder="请输入新密码！"/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="确认密码"
                    >
                        {getFieldDecorator('passwordSure', {
                            rules: [
                                {required: true, whitespace: true, message: '请再次输入密码!'},
                                {validator: this.checkPass2}
                            ],
                        })(
                            <Input type="password" placeholder="请再次输入新密码！"/>
                        )}
                    </FormItem>
                </Form>
            </div>
        )
    }
}

PassWord = Form.create({})(PassWord)

