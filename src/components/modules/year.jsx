import React, {Component} from 'react';
import {Icon} from 'antd';

//年度选择组件
class Year extends Component {
    static defaultProps = {
        format: 'YYYY',
        //allowClear:true,
        //defaultValue:null
    };

    constructor(props) {
        super(props);
        const value = props.value || props.defaultValue;
        this.state = {
            value,
            show: false
        }
    }

    yearChange = (year) => {
        this.setState({
            value: year,
            show: false
        })
        this.props.yearChange(year);
    }
    showChange = (bool) => {
        this.setState({
            show: bool
        })
    }

    render() {
        return (
            <div className="year-calendar">
                <DateInput showChange={this.showChange} value={this.state.value} yearChange={this.yearChange}
                           placeholder="选择年份" disabled={false} allowClear={this.props.allowClear}/>
                {
                    this.state.show
                        ?
                        <DateContainer showChange={this.showChange} show={this.state.show} value={this.state.value}
                                       yearChange={this.yearChange}/>
                        :
                        null
                }
                <style>
                    {`
                        .year-calendar{ width:165px; position:relative; }
                        .year-calendar ul{ padding:0px !important; }
                    `}
                </style>
            </div>
        )
    }
}

//年度-输入框
class DateInput extends Component {
    constructor(props) {
        super(props);
        const value = props.value || props.defaultValue;
        this.state = {
            value
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.state = {
                value: nextProps.value
            }
        }
    }

    click = () => {
        this.props.showChange(true);
    }
    //input中值改变
    handleChange = (value) => {
        if (!('value' in this.props)) {
            this.setState({value});
        }
        this.setState({value});
        this.props.yearChange(null);
    }
    clearSelection = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleChange(null);
    }

    render() {
        const {disabled, allowClear, placeholder} = this.props;
        const {value} = this.state;
        const prefixCls = 'ant-calendar';
        const clearIcon = (!disabled && allowClear && this.state.value) ? (
            <Icon
                type="cross-circle"
                className={`${prefixCls}-picker-clear`}
                onClick={this.clearSelection}
            />
        ) : null;
        return (
            <span className="ant-calendar-picker">
                <div>
                    <input
                        ref={this.saveInput}
                        disabled={disabled}
                        readOnly
                        value={value || ''}
                        placeholder={placeholder}
                        className="ant-calendar-picker-input ant-input"
                        onClick={this.click}
                    />
                    {clearIcon}
                    <span className={`${prefixCls}-picker-icon`}/>
                </div>
            </span>
        )
    }
}

//年度-选择区域
class DateContainer extends Component {
    constructor(props) {
        super(props);
        let value = props.value || props.defaultValue;
        if (!value) {
            const date = new Date();
            value = date.getFullYear();
        }
        const yearString = value.toString().substring(0, 3);
        let yearStart = yearString + '0';
        let yearEnd = yearString + '9';
        this.state = {
            value: value,
            yearStart: parseInt(yearStart, 10),
            yearEnd: parseInt(yearEnd, 10),
            yearArr: []
        }

        this.showChange = this.props.showChange.bind(this, false);
    }

    componentWillMount() {
        this.getYearArr()
    }

    componentDidMount() {
        document.addEventListener('click', this.showChange)
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.value && this.props.value !== nextProps.value) {
            const date = new Date();
            let value = date.getFullYear();
            const yearString = value.toString().substring(0, 3);
            let yearStart = yearString + '0';
            let yearEnd = yearString + '9';
            this.setState({
                value,
                yearStart: parseInt(yearStart, 10),
                yearEnd: parseInt(yearEnd, 10),
                yearArr: []
            }, () => {
                this.getYearArr()
            })
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.showChange)
    }

    //日期头变化对应 年份区域变化
    getYearArr = () => {
        let arr = [];
        for (let i = this.state.yearStart; i <= this.state.yearEnd; i++) {
            arr.push(i);
        }
        arr.push(this.state.yearEnd + 1);
        arr.unshift(this.state.yearStart - 1);
        this.setState({
            yearArr: arr
        })
    }
    prev = () => {
        this.setState({
            yearStart: this.state.yearStart - 10,
            yearEnd: this.state.yearEnd - 10,
        }, () => {
            this.getYearArr();
        })
    }
    next = () => {
        this.setState({
            yearStart: this.state.yearStart + 10,
            yearEnd: this.state.yearEnd + 10,
        }, () => {
            this.getYearArr();
        })
    }
    onChange = (index, item) => {
        if (index === 0) {
            this.prev()
        } else if (index === 11) {
            this.next()
        } else {
            this.setState({
                value: item
            })
            this.props.yearChange(item);
        }
    }
    calendarClick = (e) => {
        e.nativeEvent.stopImmediatePropagation();
    }

    render() {
        const yearArea = this.state.yearArr.map((item, index) => {
            return (
                <li className={item === parseInt(this.state.value, 10) ? 'year-calendar-panel-body-li-selected year-calendar-panel-body-li' : 'year-calendar-panel-body-li'}
                    key={index} onClick={() => this.onChange(index, item)}>
                    <a className="year-calendar-panel-body-li-a">
                        {item}
                    </a>
                </li>
            )
        })
        return (
            <div className="year-calendar-panel" onClick={this.calendarClick}>
                <div className="year-calendar-panel-header">
                    <a className="year-calendar-panel-header-prev" onClick={this.prev}>
                        <Icon type="double-left"/>
                    </a>
                    <a className="year-calendar-panel-header-years">{this.state.yearStart + '-' + this.state.yearEnd}</a>
                    <a className="year-calendar-panel-header-next" onClick={this.next}>
                        <Icon type="double-right"/>
                    </a>
                </div>
                <div className="year-calendar-panel-body">
                    <ul className="year-calendar-panel-body-ul">
                        {yearArea}
                    </ul>
                </div>
                <style>
                    {`
                        .year-calendar-panel{ 
                            border-radius:4px; 
                            width:231px;
                            height:248px;
                            border:1px solid #fff;
                            outline:none;
                            background-color:#fff;
                            box-shadow:0 1px 6px rgba(0,0,0,.2);
                            background-clip:padding-box; 

                            position:absolute;
                            left:0px;
                            top:0px;
                            z-index:1000;
                        }
                        .year-calendar-panel-header{
                            height:34px;
                            line-height:34px;
                            text-align:center;
                            user-select:none;
                            -webkit-user-select:none;
                            -moz-user-select:none;
                            -ms-user-select:none;
                            user-select:none;
                            border-bottom:1px solid #e9e9e9;
                            padding:0px 5px;
                        }
                        .year-calendar-panel-header a{
                            padding:0px 5px;
                            height: 100%;
                            display: inline-block;
                        }
                        .year-calendar-panel-header a.year-calendar-panel-header-prev{
                            float:left;
                            color: rgba(0,0,0,.43);
                        }
                        .year-calendar-panel-header a.year-calendar-panel-header-next{
                            float:right;
                            color: rgba(0,0,0,.43);
                        }
                        .year-calendar-panel-header a.year-calendar-panel-header-years{
                            font-weight:700;
                            color: rgba(0,0,0,.65);
                        }
                        .year-calendar-panel-body-ul{
                            overflow:hidden;
                        }
                        
                        .year-calendar-panel-body .year-calendar-panel-body-li{
                            float:left;
                            width:76px;
                            height:53px;
                            line-height:53px;
                            text-align:center;
                        }
                        .year-calendar-panel-body .year-calendar-panel-body-li .year-calendar-panel-body-li-a{
                            height:24px;
                            line-height:24px;
                            padding:0 6px;
                            text-align:center;
                            border-radius:4px;
                            display:inline-block;
                        }
                        .year-calendar-panel-body .year-calendar-panel-body-li .year-calendar-panel-body-li-a:hover{
                            background: rgba(16,142,233,0.1);
                            color: #108ee9;
                        }
                        .year-calendar-panel-body .year-calendar-panel-body-li:first-child .year-calendar-panel-body-li-a{
                            color: rgba(0,0,0,.43);
                        }
                        .year-calendar-panel-body .year-calendar-panel-body-li:last-child .year-calendar-panel-body-li-a{
                            color: rgba(0,0,0,.43);
                        }
                        .year-calendar-panel-body .year-calendar-panel-body-li-selected .year-calendar-panel-body-li-a{
                            background: #108ee9;
                            color: #fff;
                        }
                    `}
                </style>
            </div>
        )
    }
}

export default Year;