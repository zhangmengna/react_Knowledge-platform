import React, {Component} from 'react';
import {Tabs, message} from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './index.less';
import AtcCon from './atcCon';
import YpCon from './ypCon';
import AllCon from './allCon';

const TabPane = Tabs.TabPane;

class Particular extends Component {
    constructor(props) {
        super(props);
        this.state = {
            libId: sessionStorage.getItem('libId'),
            first: '',
            second: '',
            libType: sessionStorage.getItem('libType'), //库类型
            itemType: "", // 项目类别
            tabList: [],
            tabState: "1",
            tabName: "",

        }
    }

    componentWillMount() {
        const libType = this.state.libType;
        let stringF = '';
        if (libType === 'bz') {
            stringF = "标准库"
        } else if (libType === 'dz') {
            stringF = "定制库"
        } else if (libType === 'xm') {
            stringF = "项目库"
        }
        this.setState({
            first: stringF,
            second: this.props.location.query.name
        })

        window.Fetch(urlBefore + '/base/queryDicts_dictManager.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data={}'
        }).then(res =>
            res.json()
        ).then(data => {
            if (data.result === 'success') {
                const tabList = []
                data.datas.forEach((option, i) => {
                    tabList.push({
                        dict_name: option.dict_name,
                        dict_code: option.dict_code,
                        type: option.type,
                        levelCode: option.levelCode
                    })
                })
                this.setState({
                    tabList: tabList
                })
            } else {
                message.warning(data.result)
            }
        }).catch((error) => {
            message.error(error.message);
        });
    }

    tabClick = (e) => {
        this.setState({
            tabState: e
        })
    }

    render() {
        return (
            <div className={style.wrap}>
                <BreadcrumbCustom first={this.state.first} second={this.state.second}/>
                <div className={style.add}>
                    <Tabs defaultActiveKey="0" onChange={this.tabClick}>
                        {this.state.tabList ? this.state.tabList.map((tabList, i) => {
                            let content;
                            switch (tabList.type) {
                                case "1":
                                    content =
                                        <AtcCon query={{levelCode: tabList.levelCode, dict_code: tabList.dict_code}}/>
                                    break;
                                case "2":
                                    content = <YpCon query={{
                                        levelCode: tabList.levelCode,
                                        dict_code: tabList.dict_code,
                                        dict_name: tabList.dict_name
                                    }}/>
                                    break;
                                case "3":
                                    content = <AllCon query={{
                                        levelCode: tabList.levelCode,
                                        dict_code: tabList.dict_code,
                                        dict_name: tabList.dict_name
                                    }}/>
                                    break;
                                default:
                                    break;
                            }

                            return (<TabPane tab={tabList.dict_name} key={i}>
                                {content}
                            </TabPane>)
                        }) : ""}
                    </Tabs>
                </div>
                <style>
                    {`
                    .ant-form-item {
                        margin-bottom: 15px;
                    }`}
                </style>
            </div>
        )
    }
}

export default Particular;

