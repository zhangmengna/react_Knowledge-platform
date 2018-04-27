import React, {Component} from 'react';
import {Tag, Icon, message} from 'antd';
import style from './tags.less';
import {urlBefore} from '../../../data.js';
import subString from './../../../utils/subString'

class Tags extends Component {
    constructor(props) {
        super(props);
        this.state = {
            libId: this.props.libId,
            busiType: this.props.busiType,
            data: [],
            tags: []
        }
    }

    componentWillMount() {
        window.Fetch(urlBefore + '/base/queryTagsByBusiType_tags.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                busiType: this.state.busiType,
                libId: this.state.libId,
                libType: this.props.dzKu ? '' : sessionStorage.getItem('libType')
                //如果是创建定制库时候，不传libType
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    data: data.datas && data.datas.length > 0 ? data.datas : []
                })
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.tagValue !== nextProps.tagValue) {
            window.Fetch(urlBefore + '/base/queryTagsByBusiType_tags.action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: 'include',
                body: 'data=' + JSON.stringify({
                    busiType: this.state.busiType,
                    libId: this.state.libId,
                    libType: sessionStorage.getItem('libType')
                })
            }).then(res => res.json()
            ).then(data => {
                if (data.result === 'success') {
                    this.setState({
                        data: data.datas
                    })
                }
            }).catch((error) => {
                message.error(error.message);
            })
        }

    }

    click = (id, i) => {
        let data = this.state.data;
        data[i].checked = !data[i].checked;
        this.setState({
            data: data
        }, () => {
            let arr = [];
            this.state.data.forEach((item, i) => {
                if (item.checked) {
                    arr.push(item)
                }
            });
            //console.log('输出',arr);
            this.props.select(arr);
        })
    }

    render() {
        return (
            <div className={this.state.data.length > 0 ? style.tagBox : 'hidden'}>
                <Icon type="tags-o" className={style.icon}/>
                {
                    this.state.data.map((item, i) => (
                        <Tag title={item.tagName} color={item.checked ? 'geekblue' : ''} key={item.tagId}
                             onClick={() => this.click(item.tagId, i)}>
                            {subString(item.tagName)}
                        </Tag>
                    ))
                }
                <style>
                    {`
						.ant-tag-has-color{
							color: #2f54eb;
						    background: #f0f5ff;
						    border-color: #adc6ff;
						}
                	`}
                </style>
            </div>
        )
    }
}

export default Tags;