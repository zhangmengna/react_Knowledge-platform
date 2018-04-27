//页面左侧
import React, {Component} from 'react';
import {Layout, Menu, Icon,} from 'antd';
import {Link} from 'react-router';
import {InitData} from '../data';

const {Sider} = Layout;

const initData = InitData;

class SiderCustom extends Component {
    static defaultProps = {
        keyThis: 0
    }
    state = {
        collapsed: false,
        mode: 'inline',
        selectedKey: ''
    };

    /*componentWillReceiveProps(nextProps) {
        this.onCollapse(nextProps.collapsed);
    }
    onCollapse = (collapsed) => {
        this.setState({
            collapsed,
            mode: collapsed ? 'vertical' : 'inline',
        });
    };*/

    componentDidMount() {
        //组件首次渲染后执行
        const _path = this.props.path;
        this.setState({
            selectedKey: _path
        });
    }

    componentWillReceiveProps(nextProps) {
        //更新时执行，判断props是否改变
        if (this.props.path !== nextProps.path) {
            const _path = nextProps.path;
            this.setState({
                selectedKey: _path
            });
        }
    }

    menuClick = e => {
        //左侧目录点击后
        this.setState({
            selectedKey: e.key
        });
    };

    render() {
        let obj = initData[this.props.keyThis];
        return (
            <Sider
                trigger={null}
                breakpoint="lg"
                collapsed={this.props.collapsed}
                width="100"
                style={{
                    overflowY: 'auto'
                }}
            >
                <Menu
                    mode="vertical"
                    onClick={this.menuClick}
                    theme="dark"
                    selectedKeys={[this.state.selectedKey]}
                >
                    {obj.children.map(function (item, i) {
                        if (obj.name === "首页") {
                            return <Menu.Item style={{
                                'display': 'none'
                            }} key={item.url}><Link to={item.url}>{item.name}</Link></Menu.Item>
                            /*}else if(item.children){
                                return <Menu.SubMenu key={item.url} title={<Link to=""><Icon type="appstore" /><span>{item.name}</span></Link>}>
                                   <Menu.Item key={111}>{'你好大多数'}</Menu.Item>
                                   <Menu.Item key={1112}>{'变身超人是'}</Menu.Item>
                                   <Menu.Item key={1113}>{'小猫你是谁'}</Menu.Item>
                                </Menu.SubMenu>*/
                        } else {
                            return <Menu.Item key={item.url}><Link to={item.url}><Icon
                                type={item.iconName}/><span>{item.name}</span></Link></Menu.Item>
                        }
                    })}
                </Menu>
                <style>
                    {`
                    #nprogress .spinner{
                        left: ${this.state.collapsed ? '70px' : '206px'};
                        right: 0 !important;
                    }
                    `}
                </style>
            </Sider>
        )
    }
}

export default SiderCustom;