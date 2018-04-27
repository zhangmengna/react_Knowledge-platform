import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Layout, message, Modal, Button, Table} from 'antd';
import {hashHistory} from 'react-router';
import './style/index.less';
import './style/myStyle/style.css';
import VersionInfo from './componentsDiy/pages/ver';
// import SiderCustom from './components/SiderCustom';
import HeaderComponent from './components/HeaderComponent/HeaderComponent';
import {urlBefore, InitData} from './data.js';

const {Content, Footer} = Layout;

const initData = InitData;

class App extends Component {
    state = {
        collapsed: false,
        key: 0,
        inform: false,	// 消息show
        initData: [],
        path: initData[0].children[0].url,
        withScreen: 'thin',
        pageNum: 8,
        visible: false,
        sites:[]
    };

    componentWillMount() {
        this.checkMediaQuery();
        window.Fetch(urlBefore + '/base/querylinks_friendLink.action', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({})
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
               this.setState({
                   sites:data.datas ? data.datas : []
               })
            } else {
                message.error(data.message);
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }

    getChildContext() {
        return {withScreen: this.state.withScreen, pageNum: this.state.pageNum}
    }

    componentDidMount() {
        const href = window.location.href.split('#')[1];
        if (sessionStorage.getItem('key')) {
            this.setState({
                key: parseInt(sessionStorage.getItem('key'), 10),
                inform: href === '/app/index1/list' || href === '/app/index2/index' || href === '/app/index2/list' || href === '/app/index3/index' || href === '/app/index3/list' ? true : false
            }, () => {
                //一级目录切换时
                this.handOver(parseInt(sessionStorage.getItem('key'), 10), false);
            });
        } else {
            this.setState({
                inform: href === '/app/index1/list' || href === '/app/index2/index' || href === '/app/index2/list' || href === '/app/index3/index' || href === '/app/index3/list' ? true : false
            }, () => {
                //一级目录切换时
                this.handOver(this.state.key, false);
            });
        }
        window.addEventListener('resize', this.checkMediaQuery);

    }

    componentWillReceiveProps(nextProps) {
        const href = window.location.href.split('#')[1];
        if (this.props !== nextProps) {
            this.setState({
                inform: href === '/app/index1/list' || href === '/app/index2/index' || href === '/app/index2/list' || href === '/app/index3/index' || href === '/app/index3/list' ? true : false
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.checkMediaQuery);
    }

    checkMediaQuery = () => {
        const num = window.matchMedia("(min-width:1367px)").matches ? 'wide' : 'thin';
        if (num !== this.state.withScreen) {
            this.setState({
                withScreen: num,
                pageNum: num === 'wide' ? 17 : 8
            });
        }
    }
    handOver = (num, bool) => {  //bool判断libName
        if (bool) {
            sessionStorage.setItem('libName', '');
            sessionStorage.setItem('key', num);
        }
        sessionStorage.setItem('libType', initData[num].libType);
        sessionStorage.setItem('menufullcode', initData[num].menufullcode);
        window.Fetch(urlBefore + '/base/choseLib_library.action', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                "libType": initData[num].libType,
                "libName": sessionStorage.getItem('libName') && !bool ? sessionStorage.getItem('libName') : ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                //console.log('切换一级目录', initData[num].name);
                /*this.setState({
                    inform: true
                })*/
            } else {
                message.error(data.message);
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    handleClick = (e) => {
        const href = initData[e.key].children[0].url;
        //切换目录后，改变状态，页面跳转
        this.setState({
            key: e.key,
            path: initData[e.key].children[0].url,
            inform: href === '/app/index1/list' || href === '/app/index2/index' || href === '/app/index3/index' ? true : false
        }, function () {
            hashHistory.push(initData[e.key].children[0].url);
            //一级目录切换时
            this.handOver(e.key, true)
        })

    }
    informer = () => {
        const href = window.location.href.split('#')[1];
        if (href === '/app/index1/list' || href === '/app/index2/index' || href === '/app/index3/index') {
            this.setState({
                inform: this.state.inform
            })
        } else {
            this.setState({
                inform: !this.state.inform
            })
        }

    }

    render() {
        const columns = [
            {
                title: '序号',
                width: "25%",
                dataIndex: 'seq',
                render: (text, record, key) => (
                    <div className="textBox" title={text}>{key}</div>
                )
            },{
                title: '系统名称',
                width: "25%",
                dataIndex: 'sysName',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}><a href={record.addressId} target="_blank">{text}</a></div>
                )
            },{
                title: '用户名',
                width: "25%",
                dataIndex: 'user',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            },{
                title: '密码',
                width: "25%",
                dataIndex: 'password',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ]
        if (!sessionStorage.getItem('user')) {
            hashHistory.push('/login');
        }
        return (
            <Layout>
                <HeaderComponent inform={this.state.inform} informer={this.informer} handleClick={this.handleClick}
                                 current={this.state.key}/>
                <Layout className="ant-layout-has-sider">
                    {/*<SiderCustom path={this.state.path} collapsed={this.state.collapsed} keyThis={this.state.key} />*/}
                    <Layout style={{overflow: 'auto'}}>
                        <Content id="content" style={{
                            overflow: 'inherit',
                            height: '100%',
                            padding: '0px 100px',
                            background: '#4b4c9d'
                        }}>
                            {this.props.children}
                        </Content>
                    </Layout>
                </Layout>
                <Footer style={{position: 'relative', zIndex: 100}}>Copyright © 2017 北京嘉和美康信息技术有限公司 -- <a
                    style={{textDecoration: 'none'}} href="javascript:;"
                    onClick={() => { this.setState({visible: true}) }}>Ver 1.0.1</a> -- <a
                    style={{textDecoration: 'none'}} href="javascript:;"
                    onClick={() => { this.setState({visibleSite: true}) }}>友情链接</a></Footer>
                <Modal
                    title="版本信息"
                    visible={this.state.visible}
                    bodyStyle={{
                        height: 500,
                        overflowY: 'auto'
                    }}
                    wrapClassName="vertical-center-modal"
                    width={800}
                    onCancel={() => { this.setState({visible: false}) }}
                    footer={null}
                >
                    <VersionInfo/>
                </Modal>
                <Modal
                    title="相关联网站"
                    visible={this.state.visibleSite}
                    bodyStyle={{
                        height: 500,
                        overflowY: 'auto'
                    }}
                    wrapClassName="vertical-center-modal"
                    width={800}
                    onCancel={() => { this.setState({visibleSite: false}) }}
                    footer={null}
                >
                    <Table
                        bordered
                        columns={columns}
                        dataSource={this.state.sites}
                        rowKey={record => record.seq}
                        pagination={false}
                    />
                </Modal>
            </Layout>
        );
    }
}

App.childContextTypes = {
    withScreen: PropTypes.string,
    pageNum: PropTypes.number
}
export default App;
