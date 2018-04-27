import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './style/lib/animate.css';
import {Router, Route, hashHistory, IndexRedirect} from 'react-router';
//生产环境使用 service worker 资源缓存，提升应用的访问速度
import registerServiceWorker from './registerServiceWorker';
import asyncComponent from './utils/AsyncFunc';
//不同页面对应组件
import Page from './components/Page';
import App from './App';
import {InitData} from './data';

window.systems = [];
window.Fetch = (url, param) => {
    let paramsThis = Object.assign({}, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, param);
    paramsThis.headers['X-Requested-With'] = 'XMLHttpRequest';

    return fetch(url, paramsThis).then(response => {
        if (response.status >= 200 && response.status < 300) {
            return response;
        } else if (response.status === 304) {
            //hashHistory.push('login');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('userid');
            sessionStorage.removeItem('page');
            sessionStorage.removeItem('InitData');
            window.location.reload()
            let error = new Error('登录失效，请重新登录！');
            error.response = response;
            throw error;
        } else if (response.status === 500) {
            //hashHistory.push('login');
            let error = new Error('服务器接口返回500！');
            error.response = response;
            throw error;
        } else {
            let error = new Error(response.statusText);
            error.response = response;
            throw error;
        }//
    })
}
//路由相关配置(多个系统初始全部声明)
class Content extends Component {
    render() {
        const InitData = this.props.data;
        return (
            <Router history={hashHistory}>
                <Route path={'/'} components={Page}>
                    <IndexRedirect to={'/app/index1/list'}/>
                    <Route path={'app'} component={App}>
                        <Route path={"yaopin"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/ypInfo/index.jsx'))}/>
                        <Route path={"zhenliao"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/zlInfo/index.jsx'))}/>
                        <Route path={"haocai"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/hcInfo/index.jsx'))}/>
                        <Route path={"zhenduan"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/zdInfo/index.jsx'))}/>
                        <Route path={"shoushu"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/shoushuInfo/index.jsx'))}/>
                        <Route path={"bingzu"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/GroupDefine/index.jsx'))}/>
                        <Route path={"service"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/servicePackage/index.jsx'))}/>
                        <Route path={"bingzhuang"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/bztzInfo/index.jsx'))}/>
                        <Route path={"zhibiao"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/zbInfo/index.jsx'))}/>
                        <Route path={"teshu"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/tscjInfo/index.jsx'))}/>
                        <Route path={"Instruct"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/Instruct/index.jsx'))}/>
                        <Route path={"biaoqian"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/bqglInfo/index.jsx'))}/>
                        <Route path={"fenlei"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/flglInfo/index.jsx'))}/>
                        <Route path={"daima"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/dmglInfo/index.jsx'))}/>
                        <Route path={"yibao"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/ybInfo/index.jsx'))}/>
                        <Route path={"code16"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/code16Info/index.jsx'))}/>
                        <Route path={"dataMap"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/dataMap/index.jsx'))}/>
                        <Route path={"refresh"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/dataRefresh/index.jsx'))}/>
                        <Route path={"needManage"}
                               component={asyncComponent(() => import('./componentsDiy/standardLib/needManage/index.jsx'))}/>
                        {
                            InitData.map((item, i) => {
                                if (item.name === '首页') {
                                    return <Route key={i} onEnter={this.enter} path={item.url.split('/')[2]}
                                                  component={asyncComponent(() => import(item.children[0].component + ''))}/>
                                } else {
                                    return (<Route key={i} path={item.url.split('/')[2]}>
                                        {
                                            item.children.map((child, index) => {
                                                return <Route key={index} path={child.url.split('/')[3]}
                                                              component={asyncComponent(() => import(child.component + ''))}/>
                                            })
                                        }
                                    </Route>)
                                }
                            })
                        }
                    </Route>
                    <Route path={'login'} components={asyncComponent(() => import('./componentsDiy/pages/Login'))}/>
                    <Route path={'404'} component={asyncComponent(() => import('./componentsDiy/pages/NotFound'))}/>
                    <Route path={'*'} component={asyncComponent(() => import('./componentsDiy/pages/NotFound'))}/>
                </Route>
            </Router>
        )
    }
}

ReactDOM.render(
    <Content data={InitData}/>,
    document.getElementById('root')
);
registerServiceWorker();