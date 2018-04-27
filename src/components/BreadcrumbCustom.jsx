//面包屑-路径模块
import React from 'react';
import {Breadcrumb} from 'antd';
import {Link} from 'react-router';

class BreadcrumbCustom extends React.Component {
    render() {
        const first = <Breadcrumb.Item><Link to={'/app/index1/list'}>{this.props.first}</Link></Breadcrumb.Item> || '';
        const second = <Breadcrumb.Item>{this.props.second}</Breadcrumb.Item> || '';
        const three = <Breadcrumb.Item>{this.props.three}</Breadcrumb.Item> || '';
        const linkTo = this.props.link || ''; //this.prop.link, 首页链接地址

        return (
            <div className="Breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item><Link to={linkTo}>首页</Link></Breadcrumb.Item>
                    {first}
                    {second}
                    {three}
                </Breadcrumb>
            </div>
        )
    }
}

export default BreadcrumbCustom;
