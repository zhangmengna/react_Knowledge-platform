//医院级别、时间
import React,{ Component } from 'react';
import { Row, Col, DatePicker, Select} from 'antd';
import Year from './year';
import Quarter from './quarter';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
//使用 <DatePickerThe outPutDate={(value)=>{console.log(value)}} />
const { MonthPicker } = DatePicker; 
const Option = Select.Option;

export class DatePickerThe extends Component{
	static defaultProps = {
        dates:[
            {
                name:'年度',
                code:'year'
            },
            {
                name:'季度',
                code:'quarter'
            },
            {
                name:'月度',
                code:'month'
            }
        ]
    }
    constructor(props){
		super(props);
		this.state={
            dateThe:0,
            defaultValue:null
		}
    }
    componentWillMount(){
        this.dateChange(0);
    }
    dateChange=(i)=>{
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        if(i === 0){
            this.setState({
                dateThe:i,
                defaultValue:year
            },()=>{
                this.props.outPutDate(this.state.defaultValue.toString());
            })
        }else if( i === 1){
            let quarter = 1;
            if(month<4){
                quarter = 1
            }else if(month<7){
                quarter = 2
            }else if(month<10){
                quarter = 3
            }else if(month<13){
                quarter = 4
            }
            this.setState({
                dateThe:i,
                defaultValue:year+'Q'+quarter
            },()=>{
                this.props.outPutDate(this.state.defaultValue);
            })
        }else if(i === 2){
            let str = month.toString().length>1?'':'0';
            this.setState({
                dateThe:i,
                defaultValue:year+'/'+month
            },()=>{
                this.props.outPutDate(year+str+month);
            })
        }
    }
    monthChange=(value)=>{
        let arr = moment(value).format('YYYY-MM').split('-');
        this.props.outPutDate(arr[0]+arr[1]);
    }
    quarterChange=(value)=>{
        this.props.outPutDate(value);
    }
    yearChange=(value)=>{
        this.props.outPutDate(value.toString());
    }
    render(){
    	return(
			<div className="datePickerThe">
                <Row >
                    <Col span={24}>
                        <Row>
                            <Col span={7} className="name" style={{ padding:'5px 0' }} >
                                <ul>
                                    {
                                        this.props.dates.map((date,i)=>(
                                            <li key={i} className={this.state.dateThe === i?'active':''} onClick={()=>this.dateChange(i)}>
                                                <span>{date.name}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </Col>
                            <Col span={17} style={{ padding:'5px 0' }} >
                                {
                                    this.state.dateThe === 0
                                    ?
                                    <Year allowClear={false} defaultValue={this.state.defaultValue} yearChange={this.yearChange} />
                                    :''
                                }
                                {
                                    this.state.dateThe === 1
                                    ?
                                    <Quarter allowClear={false} defaultValue={this.state.defaultValue} quarterChange={this.quarterChange} />
                                    :''
                                }
                                {
                                    this.state.dateThe === 2
                                    ?
                                    <MonthPicker allowClear={false} onChange={this.monthChange} defaultValue={moment(this.state.defaultValue, 'YYYY-MM')} format={'YYYY-MM'} />
                                    :''
                                }
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <style>
                	{`
						.datePickerThe { background:#fff; border-radius:5px;  margin-bottom:10px; }
                        .datePickerThe .name ul{ overflow:hidden; padding:0px 10px; }
                        .datePickerThe .name ul li{ float:left;  width:90px; height:28px; line-height:28px; text-align:center; cursor:pointer; padding:0px 5px; }
                        .datePickerThe .name ul li span{ display:inline-block; width:100%; height:100%; }
                        .datePickerThe .name ul li.active span{ border-radius:5px; background:#44bbb9; color:#fff; }
                	`}
                </style>
            </div>
    	)
    }
}


export class DatePickerTheModule extends Component{
    static defaultProps = {
        dates:[
            {
                name:'年度',
                code:'year'
            },
            {
                name:'季度',
                code:'quarter'
            },
            {
                name:'月度',
                code:'month'
            }
        ]
    }
    constructor(props){
        super(props);
        this.state={
            dateThe:0,
            defaultValue:null
        }
    }
    componentWillMount(){
        this.dateChange('year');
    }
    dateChange=(value)=>{
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        if(value === 'year'){
            this.setState({
                dateThe:value,
                defaultValue:year.toString()
            },()=>{
                this.props.outPutDate(value,this.state.defaultValue);
            })
        }else if( value === 'quarter'){
            let quarter = 1;
            if(month<4){
                quarter = 1
            }else if(month<7){
                quarter = 2
            }else if(month<10){
                quarter = 3
            }else if(month<13){
                quarter = 4
            }
            this.setState({
                dateThe:value,
                defaultValue:year+'Q'+quarter
            },()=>{
                this.props.outPutDate(value,this.state.defaultValue);
            })
        }else if(value === 'month'){
            let str = month.toString().length>1?'':'0';
            this.setState({
                dateThe:value,
                defaultValue:year+'/'+month
            },()=>{
                this.props.outPutDate(value,year+str+month);
            })
        }
    }
    monthChange=(value)=>{
        let arr = moment(value).format('YYYY-MM').split('-');
        this.props.outPutDate(this.state.dateThe,arr[0]+arr[1]);
    }
    quarterChange=(value)=>{
        this.props.outPutDate(this.state.dateThe,value);
    }
    yearChange=(value)=>{
        this.props.outPutDate(this.state.dateThe,value.toString());
    }
    render(){
        return(
            <div>
                <Row className="ant-form-item">
                    <Col span={7} className="ant-form-item-label">
                        <label title="周期选择" >周期选择</label>
                    </Col>
                    <Col span={17}>
                        <Select defaultValue="year" onChange={this.dateChange}>
                            {
                                this.props.dates.map((date,i)=>(
                                    <Option key={i} value={date.code}>
                                        {date.name}
                                    </Option>
                                ))
                            }
                        </Select>
                    </Col>
                </Row>
                <Row className="ant-form-item">
                    <Col span={7} className="ant-form-item-label">
                        <label title="时间选择" >时间选择</label>
                    </Col>
                    <Col span={17} className="conditionsDate ant-form-item-control-wrapper" style={{ 'textAlign':'left','lineHeight':'32px' }} >
                        {
                            this.state.dateThe === 'year'
                            ?
                            <Year allowClear={false} defaultValue={this.state.defaultValue} yearChange={this.yearChange} />
                            :''
                        }
                        {
                            this.state.dateThe === 'quarter'
                            ?
                            <Quarter allowClear={false} defaultValue={this.state.defaultValue} quarterChange={this.quarterChange} />
                            :''
                        }
                        {
                            this.state.dateThe === 'month'
                            ?
                            <MonthPicker allowClear={false} onChange={this.monthChange} defaultValue={moment(this.state.defaultValue, 'YYYY-MM')} format={'YYYY-MM'} />
                            :''
                        }
                    </Col>
                    <style>
                        {`
                            .conditionsDate .year-calendar{ width:100%; }
                            .conditionsDate .year-calendar>span{ width:100%; }
                            .conditionsDate>span{ width:100%; }
                        `}
                    </style>
                </Row>
            </div>
                    
        )
    }
}
