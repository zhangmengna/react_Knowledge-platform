import React, {Component} from 'react';
import {urlBefore} from '../../data.js';
import {Row, Col, Icon, Tag, DatePicker, Select, Input, Form, Button, AutoComplete, message} from 'antd';
import moment from 'moment';
import {DatePickerTheModule} from './datePicker';

const {MonthPicker} = DatePicker;
const Option = Select.Option;
const FormItem = Form.Item;
//请求字段
// const example = [
// 	{
// 		name: '任务类型', //选择框，字典
// 		string: 'taskType',
// 		type: 'select',
// 		options: [{
// 			name: '神射手',
// 			value: 'www'
// 		}],
// 		initialValue: ''//默认选中
// 	},
// 	{
// 		name: '任务类型', //选择框，字典
// 		string: 'taskType',
// 		type: 'select',
// 		dictCode: 'tasktype',
// 		initialValue: '',//默认选中
// 		initialShow: ''
// 	}, {
// 		name: '任务名称', //输入框
// 		string: 'taskName',
// 		type: 'input'
// 	},
// 	{
// 		name: '任务名称', //输入框 - 自动完成
// 		string: 'taskName1',
// 		type: 'autoComplete',
// 		url: '/ap/searchHosList_documentDistribute'
// 	},
// 	{
// 		name: '开始时间', //日期
// 		string: 'startTime',
// 		type: 'date',
// 		feature: 'date'
// 	},
// 	{
// 		name: '结算属期',//月份选择
// 		string: 'stmPeriod',
// 		type: 'date',
// 		feature: 'month',
// 		initialValue: '2017/09'
// 	}
// ]

//<Conditions hasDate={true} />   如果传入hasDate属性true，则加入年季月功能
//条件显示区域
export class ConditionContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contents: []
        }
    }

    componentDidMount() {
        this.setState({
            contents: this.props.contents
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.contents !== nextProps.contents) {
            this.setState({
                contents: nextProps.contents
            })
        }
    }

    removeTag = (property, e) => {
        e.preventDefault();
        //移除标签事件
        let state = true;
        let contents = this.props.contents;
        contents.forEach((item, i) => {
            if (item.string === property) {
                if (item.initial) {
                    message.warning('必填项，不可删除！');
                    state = false;
                } else {
                    contents.splice(i, 1);
                    state = true;
                }
            }
        })
        if (state) {
            this.props.close(property, contents);
        }
    }

    render() {
        const contents = this.state.contents;
        if (contents.length === 0) {
            return (
                <div className="content" style={{height: 40, lineHeight: '40px'}}>
                    <p>请点击"<Icon type="search" style={{fontSize: 16}}/>"进行条件搜索</p>
                </div>
            )
        } else {
            return (
                <div>
                    <div className="omit" onClick={this.props.openSearch}
                         style={{float: 'right', padding: '10px', height: 40, cursor: 'pointer',}}>...
                    </div>
                    <div className="content" style={{height: 40, lineHeight: '40px', overflow: 'hidden'}}>
                        <div style={{width: 2000,}}>
                            {
                                contents.map((item, index) => {
                                    if (item) {
                                        return (<Tag closable title={item.name} key={item.string}
                                                     onClose={(e) => this.removeTag(item.string, e)}>
                                            {item['show']}
                                        </Tag>)
                                    } else {
                                        return null;
                                    }
                                })
                            }
                        </div>
                    </div>
                </div>
            )
        }
    }
}

//条件选择区域
class Conditions extends Component {
    static defaultProps = {
        downState: false
    }

    constructor(props) {
        super(props);
        this.state = {
            searchState: false,
            timeType: 'year',
            time: '2017',
            dataSource: []
        }
    }

    componentWillMount() {
        console.log('paramsBase11', this.props.paramsBase);
    }

    componentDidMount() {
        console.log('paramsBase1', this.props.paramsBase);
        //document.addEventListener('click',e=>{
        //if(e.target&&e.target.matches('.ant-select-dropdown-menu-item')){ //Element.matches兼容型问题
        //if(e.target&&(e.target.className.indexOf('ant-select-dropdown-menu-item')>-1||e.target.className.indexOf('omit')>-1)){
        //return;
        //判断是否是form中select点击,slect中选择项是新建定位，不在.conditions中，所有this.propagation事件阻止不了
        //}
        //this.props.hidden();//隐藏
        //})
        this.setState({
            searchState: this.props.searchState
        })

        async function ajaxA(param) {
            try {
                let res = await fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: 'data=' + JSON.stringify({"dict_code": param.dictCode})
                });
                let data = await res.json()
                const options = []
                data.datas[0].map((option, i) => {
                    options.push({
                        name: option.display_name,
                        value: option.fact_value
                    })
                    if (option.fact_value === param.initialValue) {
                        param.show = option.display_name
                    }
                    return null;
                })
                param.options = options;
            } catch (e) {
                console.log(e);
            }
        }

        this.props.paramsBase.forEach((param) => {
            if (param.type === 'select' && param.dictCode) {
                ajaxA(param);
            } else if (param.type === 'autoComplete') {
                this.setState({
                    autoComplete: {
                        url: param.url
                    }
                })
            }
        })
        let contents = [];
        this.props.paramsBase.forEach((param) => {
            console.log(param);
            if (param.initialValue && param.type === 'select') {
                contents.push({
                    name: param.name,
                    string: param.string,
                    type: param.type,
                    value: param.initialValue,
                    show: param.initialShow,
                    dateType: param.feature,
                    initial: true
                })
            } else if (param.initialValue && param.type === 'date' && param.feature === 'month') {
                contents.push({
                    name: param.name,
                    string: param.string,
                    type: param.type,
                    value: param.initialValue,
                    show: param.initialValue,
                    dateType: param.feature,
                    initial: true
                })
            }
        })
        if (this.props.hasDate) { //如果年季月功能为true
            let show = '';
            if (this.state.timeType === 'year') {
                show = '年度';
            } else if (this.state.timeType === 'quarter') {
                show = '季度';
            } else if (this.state.timeType === 'month') {
                show = '月度';
            }
            contents.push({
                name: '周期选择',
                string: 'timeType',
                value: this.state.timeType,
                show: show,
                initial: true
            });
            contents.push({
                name: '时间选择',
                string: 'time',
                value: this.state.time,
                show: this.state.time,
                initial: true
            });
        }
        //调用父组件方法
        this.props.setContents(contents);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState({
                searchState: nextProps.searchState,
            })
        }
    }

    //表单-重置
    setReset = (e) => {
        this.props.form.resetFields();
    }
    //表单-搜索
    handleSearch = (e) => {
        e.preventDefault();
        //const {getFieldsValue} =  this.props.form;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let contents = [];
                this.props.paramsBase.forEach((param) => {
                    if (values[param.string]) {
                        if (param.type === 'input') {
                            contents.push({
                                name: param.name,
                                string: param.string,
                                type: param.type,
                                value: values[param.string],
                                show: values[param.string]
                            })
                        } else if (param.type === 'date' && param.feature === 'date') {
                            contents.push({
                                name: param.name,
                                string: param.string,
                                type: param.type,
                                value: moment(values[param.string]).format('YYYY-MM-DD'),
                                show: moment(values[param.string]).format('YYYY-MM-DD'),
                                dateType: param.feature
                            })
                        } else if (param.type === 'date' && param.feature === 'month') {
                            contents.push({
                                name: param.name,
                                string: param.string,
                                type: param.type,
                                value: moment(values[param.string]).format('YYYY-MM'),
                                show: moment(values[param.string]).format('YYYY-MM'),
                                dateType: param.feature,
                                initial: param.initialValue ? true : false
                            })
                        }
                        else if (param.type === 'select') {
                            let valueShow = '';
                            param.options.forEach((option) => {
                                if (option.value === values[param.string]) {
                                    valueShow = option.name;
                                }
                            })
                            contents.push({
                                name: param.name,
                                string: param.string,
                                type: param.type,
                                value: values[param.string],
                                show: valueShow,
                                initial: param.initialValue ? true : false
                            })
                        } else if (param.type === 'autoComplete') {
                            contents.push({
                                name: param.name,
                                string: param.string,
                                type: param.type,
                                value: values[param.string],
                                show: this.state.orgName
                            })
                        }
                    }
                })

                if (this.props.hasDate) { //如果年季月功能为true
                    let show = '';
                    if (this.state.timeType === 'year') {
                        show = '年度';
                    } else if (this.state.timeType === 'quarter') {
                        show = '季度';
                    } else if (this.state.timeType === 'month') {
                        show = '月度';
                    }
                    contents.push({
                        name: '周期选择',
                        string: 'timeType',
                        value: this.state.timeType,
                        show: show,
                        initial: true
                    });
                    contents.push({
                        name: '时间选择',
                        string: 'time',
                        value: this.state.time,
                        show: this.state.time,
                        initial: true
                    });
                }
                //调用父组件方法
                this.props.setContents(contents);
                this.props.searchStateChange();
            }
        })
    }
    propagation = (e) => {
        e.nativeEvent.stopImmediatePropagation();
    }
    //自动完成搜索------目前考虑只存在一个autoComplete
    onSelect = (value, option) => {
        this.setState({
            orgCode: value,
            orgName: option.props.children
        })
    }
    completeSearch = (value) => {
        fetch(urlBefore + this.state.autoComplete.url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: 'key=' + value
        }).then(res => res.json()
        ).then(data => {
            this.setState({
                dataSource: data.datas
            })
        })
    }
    //年季月
    dateChange = (type, time) => {
        this.setState({
            timeType: type,
            time: time
        })
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 7}
            },
            wrapperCol: {
                xs: {span: 17}
            },
        };
        return (
            <div className="conditions" onClick={this.propagation}
                 style={{borderLeft: '1px solid #ccc', height: 40, lineHeight: '40px'}}>
                <Row>
                    <Col span={4} className={this.props.searchStateChange ? "" : "hidden"}
                         onClick={this.props.searchStateChange}>
                        <Icon title="条件" type="search" style={{fontSize: 16}}/>
                    </Col>
                    <Col span={4} className={this.props.downStateChange ? "" : "hidden"}
                         onClick={this.props.downStateChange}>
                        <Icon title="下载" type="download" style={{fontSize: 16}}/>
                    </Col>
                    <Col span={4} className={this.props.add ? "" : "hidden"} onClick={this.props.add}>
                        <Icon title="新增" type="plus" style={{fontSize: 16}}/>
                    </Col>
                    <Col span={4} className={this.props.allot ? "" : "hidden"} onClick={this.props.allotEvent}>
                        <Icon title="分配/公示" type="enter" style={{fontSize: 16}}/>
                    </Col>
                    <Col span={4} className={this.props.cancel ? "" : "hidden"} onClick={this.props.cancelEvent}>
                        <Icon title="取消" type="rollback" style={{fontSize: 16}}/>
                    </Col>
                    <Col span={4} className={this.props.upload ? "" : "hidden"} onClick={this.props.uploadEvent}>
                        <Icon title="导出" type="upload" style={{fontSize: 16}}/>
                    </Col>
                    <Col span={4} className={this.props.allIn ? "" : "hidden"} onClick={this.props.allInEvent}>
                        <Icon title="汇总" type="usb" style={{fontSize: 16}}/>
                    </Col>
                    <Col span={4} className={this.props.check ? "" : "hidden"} onClick={this.props.checkEvent}>
                        <Icon title="确认" type="check" style={{fontSize: 16}}/>
                    </Col>
                    <Col span={4} className={this.props.edit ? "" : "hidden"} onClick={this.props.editEvent}>
                        <Icon title="录入" type="edit" style={{fontSize: 16}}/>
                    </Col>
                </Row>
                <div className={this.state.searchState ? "show searchCondition" : "hide searchCondition"}>
                    <Form layout="inline" onSubmit={this.handleSearch}>
                        {this.props.paramsBase.map((item, index) => {
                            if (item.type === 'input') {
                                return (
                                    <FormItem
                                        {...formItemLayout}
                                        label={item.name}
                                        key={index}
                                    >
                                        {getFieldDecorator(item.string, {
                                            initialValue: ''
                                        })(
                                            <Input/>
                                        )}
                                    </FormItem>
                                )
                            } else if (item.type === 'autoComplete') {
                                return (
                                    <FormItem
                                        {...formItemLayout}
                                        label={item.name}
                                        key={index}
                                    >
                                        {getFieldDecorator(item.string, {
                                            initialValue: ''
                                        })(
                                            <AutoComplete
                                                onSelect={this.onSelect}
                                                onSearch={this.completeSearch}
                                            >
                                                {this.state.dataSource.map((value) => {
                                                    return <Option key={value.orgCode}>{value.orgName}</Option>;
                                                })}
                                            </AutoComplete>
                                        )}
                                    </FormItem>
                                )
                            } else if (item.type === 'select') {
                                if (item.options) {
                                    return (
                                        <FormItem
                                            {...formItemLayout}
                                            label={item.name}
                                            key={index}
                                        >
                                            {getFieldDecorator(item.string, {
                                                initialValue: item.initialValue ? item.initialValue : null
                                            })(
                                                <Select>
                                                    {item.options.map((option, i) => {
                                                        return (
                                                            <Option value={option.value} key={i}>{option.name}</Option>)
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    )
                                }
                            } else if (item.type === 'date' && item.feature === 'date') {
                                return (
                                    <FormItem
                                        {...formItemLayout}
                                        label={item.name}
                                        key={index}
                                    >
                                        {getFieldDecorator(item.string, {
                                            initialValue: null
                                        })(
                                            <DatePicker/>
                                        )}
                                    </FormItem>
                                )
                            } else if (item.type === 'date' && item.feature === 'month') {
                                return (
                                    <FormItem
                                        {...formItemLayout}
                                        label={item.name}
                                        key={index}
                                    >
                                        {getFieldDecorator(item.string, {
                                            initialValue: item.initialValue ? moment(item.initialValue, 'YYYY-MM') : null
                                        })(
                                            <MonthPicker allowClear={item.initialValue ? false : true}/>
                                        )}
                                    </FormItem>
                                )
                            }
                            return null;
                        })}
                        {
                            this.props.hasDate
                                ?
                                <DatePickerTheModule outPutDate={(type, time) => {this.dateChange(type, time)}}/>
                                : ''
                        }
                        <Row>
                            <Col span={6} offset={3}>
                                <Button size={'large'} type="primary" htmlType="submit" className="login-form-button"
                                        style={{
                                            width: '100%',
                                            background: '#3b59a2',
                                            borderColor: '#3b59a2'
                                        }}>搜索</Button>
                            </Col>
                            <Col span={6} offset={6}>
                                <Button size={'large'} style={{width: '100%', borderColor: '#3b59a2', color: '#3b59a2'}}
                                        className="login-form-button" onClick={this.setReset}>重置</Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <div className={this.props.downState ? "show downBox" : "hide downBox"}>
                    下载模块内容
                </div>
                <style>
                    {`
					.hide{ display:none; }
					.conditionsBox{ background:#fff; border-radius:5px; height:60px; padding:10px 10px 8px; }
					.conditionsBox p{ margin:0px; }
					.conditions .ant-row>div{ text-align:center; cursor:pointer; }
					.conditions .searchCondition{ position:absolute; top:60px; right:-10px; background:#fff; border-radius:5px; padding:10px; width:600px; z-index:1000 }
					.conditions .ant-form-item-control .ant-calendar-picker{ width:100%; }
					.conditions .ant-form .ant-form-item{ width:270px; }
					.conditions .show{ display:block; box-shadow:0 2px 8px rgba(0,0,0,.2); }
					.conditions .downBox{ position:absolute; top:60px; right:-10px; background:#fff; border-radius:5px; padding:10px; width:300px; z-index:1000; }
					`}
                </style>
            </div>
        )
    }
}

Conditions = Form.create()(Conditions);

export {Conditions}
