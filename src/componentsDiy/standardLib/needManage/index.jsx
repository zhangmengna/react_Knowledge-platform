import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Table, Button , message , Popconfirm } from 'antd';
import {urlBefore} from '../../../data.js';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from '../ypInfo/index.less';
import SearchModule from '../../../components/modules/searchCom/search';
import Add from './add';

class NeedManage extends Component {
    constructor(props){
        super(props);
        this.state = {
            libId:sessionStorage.getItem('libId'),
            first: '标准库',
            second: '需求管理',
            busiType: '18',         //业务类型
            pagesize: 1,	 	    //当前页
            pagerow: 10,            //每页显示条数
            condition:[],
            data:[],
            show:true,
            addData:{}
        }
    }
    componentWillMount(){
        this.setState({
            pagerow: this.context.pageNum
        }, () => {
            this.searchEvent();
        })
    }
    //搜索条件改变
    conditionChange = (arr) => {
        this.setState({
            condition: arr,
            pagesize: 1
        }, () => {
            this.searchEvent()
        })
    }
    //页码相关
    onChange = (pagination, filters, sorter) => {
        this.setState({
            pagesize: pagination.current,
            pagerow: pagination.pageSize,
            sortname: sorter.field ? sorter.field : '',
            sortorder: sorter.order ? sorter.order.replace('end', '') : '',
        }, () => {
            this.searchEvent()
        })
    }
    //列表搜索
    searchEvent = () => {
        //查询
        window.Fetch(urlBefore + '/base/querylist_requirementManage.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                condition: this.state.condition.length > 0 ? this.state.condition : ''
            })
        }).then((res) => res.json()
        ).then(data => {
            if (data.result === 'success') {
                const ake001All = []
                data.datas ? data.datas.forEach((datas, i) => {
                    ake001All.push(datas.ake001)
                }) : ""
                this.setState({
                    ake001All,
                    data: data.datas,
                    count: data.count,
                    selectedRows: [], //列表选中
                    selectedRowKeys: []
                })
            } else {
                message.warning(data.result)
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    clickAdd=()=>{
        this.setState({
            show: false,
            addData:{
                busiType: "",
                priority:"",
                content:"",
                analysis:"",
                implement:"",
                status:"",
                first:'标准库',
                second:'需求管理',
                rmId:''
            }
        })
    }
    back = ()=>{
        this.setState({
            show: true,
            addData:{}
        },()=>{
            this.searchEvent()
        })
    }
    //删除
    del=(id)=>{
        window.Fetch(urlBefore + '/base/delete_requirementManage.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                rmId:id
            })
        }).then((res) => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('删除成功！');
                this.searchEvent();
            } else {
                message.warning(data.result)
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //修改
    changeInfo=(record)=>{
        this.setState({
            show: false,
            addData:{
                busiType: record.busiType,
                priority:record.priority,
                content:record.content,
                analysis:record.analysis,
                implement:record.implement,
                status:record.status,
                first:'标准库',
                second:'需求管理',
                rmId:record.rmId
            }
        })
    }
    render() {
        const columns = [
            {
                title: '操作类型',
                width: 120,
                render: (text, record) => (
                    <div style={{color: '#007cfd'}}>
                        <span className={style.cursor} title="修改" onClick={() => this.changeInfo(record)}>修改</span>&nbsp;|&nbsp;
                        <Popconfirm title="确定要删除这个吗？"
                            onConfirm={() => this.del(record.rmId)} >
                            <span className={style.cursor} title="删除" >删除</span>
                        </Popconfirm>

                    </div>
                )
            },
            {
                title: '业务类型',
                dataIndex: 'busiTypeName',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '优先级',
                dataIndex: 'priorityName',
                width: 100,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '需求内容',
                dataIndex: 'content',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '需求分析',
                dataIndex: 'analysis',
                width: 200,
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '系统实现',
                width: 100,
                dataIndex: 'implement',
                className: 'text-left',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '创建时间',
                dataIndex: 'createTime',
                width: 150,
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '创建人',
                width: 100,
                dataIndex: 'createUserName',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }, {
                title: '状态',
                width: 100,
                dataIndex: 'statusName',
                render: (text, record) => (
                    <div className="textBox" title={text}>{text}</div>
                )
            }
        ]
        return (
            <div className={ this.context.withScreen === 'wide' ? style.wrap : style.wrapLittle }>
                <div className={ this.state.show ? '':'hidden' }>
                    <div className={ style.header } >
                        <BreadcrumbCustom first={this.state.first} second={this.state.second}/>
                        <div className={style.headerRight}>
                            <Button className={style.refresh} onClick={this.refresh}>刷新</Button>
                            <Button style={{ width: '100px', heigth: '30px' }} type="primary" onClick={this.clickAdd}>新增</Button>
                        </div>
                    </div>
                    <div className={ style.header } >
                        <SearchModule busiType={this.state.busiType} search={this.conditionChange}/>
                        <div className={style.tableZone}>
                            <Table
                                bordered
                                columns={columns}
                                dataSource={this.state.data}
                                rowKey={record => record.dataId}
                                onChange={this.onChange}
                                pagination={{
                                    current: this.state.pagesize,
                                    showTotal: () => (`总数 ${this.state.count} 条`),
                                    total: this.state.count,
                                    pageSize: this.state.pagerow,
                                    showSizeChanger: true,
                                    pageSizeOptions: this.context.withScreen === 'wide' ? ['15', '30', '45', '60'] : ['10', '20', '30', '40'],
                                    showQuickJumper: true,
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className={ this.state.show ? 'hidden' :'' } >
                    { this.state.show ? '': <Add query={ this.state.addData } back={ this.back }  />}
                </div>
            </div>
        )
    }
}

NeedManage.contextTypes = {
    withScreen: PropTypes.string,
    pageNum: PropTypes.number
}
export default NeedManage;

