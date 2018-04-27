import React,{Component} from 'react';
import { Row,Col,Select,Input, Form, Button, Tag, Icon, message } from 'antd';
import {urlBefore} from '../../../data';
import classNames from 'classnames';
import style from './search.less';

const Option = Select.Option;
const FormItem = Form.Item;
class SearchModule extends Component{
	constructor(props){
		super(props);
		this.state={
			show:false,
			busiType:this.props.busiType,
			texts:[],
			dicts:[],
			numerics:[],
			operator1:[], //操作符
			operator2:[],
			dictChild1:[],//字符二级
			dictChild2:[],
			tags:[],
			active:1,
			replaceData:[],//替换域
			arrData:[],  //搜索
		}
	}
	componentWillMount(){
		//获取字典项--操作符
        window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({ "dict_code": 'TextOpers,NumOpers' })
        }).then(res=>res.json()
        ).then(data=>{
            if(data.result === 'success'){
                this.setState({
					operator1:data.datas[0]?data.datas[0]:[],
					operator2:data.datas[1]?data.datas[1]:[]
                })
            }
        }).catch((error)=>{
        	message.error(error.message);
        })
		//获取选项
		window.Fetch(urlBefore+'/base/queryConditions_condition',{
			method:'POST',
			headers:{
				'Content-Type':'application/json'
			},
			credentials:'include',
			body:JSON.stringify({ "busiType": this.state.busiType })
		}).then(res=>res.json()
		).then(data=>{
			if(data.result === 'success'){
				this.setState({
					texts:data.datas&&data.datas.text?data.datas.text:[],
					numerics:data.datas&&data.datas.numeric?data.datas.numeric:[],
					dicts:data.datas&&data.datas.dict?data.datas.dict:[]
				})
			}
		}).catch((error)=>{
        	message.error(error.message);
        })
		//替换域
		window.Fetch(urlBefore+'/base/queryReplaces_condition',{
			method:'POST',
			headers:{
				'Content-Type':'application/json'
			},
			credentials:'include',
			body:JSON.stringify({ "busiType": this.state.busiType })
		}).then(res=>res.json()
		).then(data=>{
			if(data.result === 'success'){
				this.setState({
					replaceData:data.datas&&data.datas.length>0 ? data.datas : []
				})
			}
		}).catch((error)=>{
        	message.error(error.message);
        })
	}
	//代码
	dictChange=(value,num)=>{
		console.log(value,num);
		let code = '';
		this.state.dicts.forEach((item)=>{
			if(item.column === value.key){
				code = item.code;
			}
		})
		//获取二级数据
		window.Fetch(urlBefore + '/common/queryDictItemsByCodes_ybDict.action', {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({ "dict_code": code })
        }).then(res=>res.json()
        ).then(data=>{
            if(data.result === 'success'){
            	if(num === 1){
            		this.props.form.resetFields(['dictChild1']);
            		this.setState({
	                	dictChild1:data.datas[0]
	                })
            	}else if(num === 2){
            		this.props.form.resetFields(['dictChild2']);
            		this.setState({
	                	dictChild2:data.datas[0]
	                })
            	}
                
            }
        })
	}
	//
	showChange=()=>{
		this.setState({
			show:!this.state.show
		})
	}
	//确认
	handleSubmit=(e)=>{
		e.preventDefault();
		if(this.state.active === 0){//替换
			this.props.form.validateFieldsAndScroll((err,values)=>{
				if(!err){
					let arr =[];
					if(values.textOperatorReplaceBefore1&&values.textInputReplaceBefore1&&values.textInputReplaceAfter1){
						arr.push({
							column:values.textOperatorReplaceBefore1.key,
							name:'',
							value:values.textInputReplaceBefore1,
							replaceValue:values.textInputReplaceAfter1
						})
					}
					if(values.textOperatorReplaceBefore2&&values.textInputReplaceBefore2&&values.textInputReplaceAfter2){
						arr.push({
							column:values.textOperatorReplaceBefore2.key,
							name:'',
							value:values.textInputReplaceBefore2,
							replaceValue:values.textInputReplaceAfter2
						})
					}
					if(values.textOperatorReplaceBefore3&&values.textInputReplaceBefore3&&values.textInputReplaceAfter3){
						arr.push({
							column:values.textOperatorReplaceBefore3.key,
							name:'',
							value:values.textInputReplaceBefore3,
							replaceValue:values.textInputReplaceAfter3
						})
					}
					if(arr.length>0){
						window.Fetch(urlBefore+'/base/replace_condition',{
							method:'POST',
							headers:{
								'Content-Type':'application/json'
							},
							credentials:'include',
							body:JSON.stringify({ "busiType": this.state.busiType,"condition":arr })
						}).then(res=>res.json()
						).then(data=>{
							if(data.result === 'success'){
								this.setState({
									show:false,
									active:1
								})
								this.props.search(this.state.arrData);
							}
						})
					}else{
						this.setState({
							show:false,
							active:1
						})
					}
					
				}
			})
		}else if(this.state.active === 1){ //搜索
			this.props.form.validateFieldsAndScroll((err,values)=>{
				if(!err){
					let arr =[];
					let arrP = [];
					if(values.text1&&values.textOperator1&&values.textInput1){
						arr.push({
							show:values.text1.label+values.textOperator1.label+values.textInput1,
							type:'text1'
						});
						arrP.push({
							column:values.text1.key,
							opera:values.textOperator1.key,
							value:values.textInput1,
							type:'text'
						})
					}
					if(values.text2&&values.textOperator2&&values.textInput2){
						arr.push({
							show:values.text2.label+values.textOperator2.label+values.textInput2,
							type:'text2'
						});
						arrP.push({
							column:values.text2.key,
							opera:values.textOperator2.key,
							value:values.textInput2,
							type:'text'
						})
					}
					if(values.numeric1&&values.numOperator1&&values.numInput1){
						arr.push({
							show:values.numeric1.label+values.numOperator1.label+values.numInput1,
							type:'numeric1'
						});
						arrP.push({
							column:values.numeric1.key,
							opera:values.numOperator1.key,
							value:values.numInput1,
							type:'numeric'
						})
					}
					if(values.dict1&&values.dictChild1&&values.dictChild1.length>0){
						let arrChild1 = [];
						let arrChild1P = [];
						values.dictChild1.map((item)=>{
							arrChild1.push(item.label);
							arrChild1P.push(item.title);
						})
						arr.push({
							show:values.dict1.label+'：'+arrChild1.join(','),
							type:'dict1'
						})
						arrP.push({
							column:values.dict1.key,
							opera:'',
							value:arrChild1P.join(','),
							type:'dict'
						})
					}
					if(values.dict2&&values.dictChild2&&values.dictChild2.length>0){
						let arrChild2 = [];
						let arrChild2P = [];
						values.dictChild2.map((item)=>{
							arrChild2.push(item.label);
							arrChild2P.push(item.title);
						})
						arr.push({
							show:values.dict2.label+'：'+arrChild2.join(','),
							type:'dict2'
						})
						arrP.push({
							column:values.dict2.key,
							opera:'',
							value:arrChild2P.join(','),
							type:'dict'
						})
					}
					this.setState({
						tags:arr,
						show:false,
						arrData:arrP,
						active:1
					})
					this.props.search(arrP);
				}
			})
		}
		
	}
	//标签关闭
	close=(e,type)=>{
		if(type === 'text1'){
		    this.props.form.resetFields(['text1','textOperator1','textInput1']);
		    this.handleSubmit(e);
		}else if(type === 'text2'){
		    this.props.form.resetFields(['text2','textOperator2','textInput2']);
		    this.handleSubmit(e);
		}else if(type === 'numeric1'){
		    this.props.form.resetFields(['numeric1','numOperator1','numInput1']);
		    this.handleSubmit(e);
		}else if(type === 'dict1'){
		    this.props.form.resetFields(['dict1','dictChild1']);
		    this.handleSubmit(e);
		}else if(type === 'dict2'){
		    this.props.form.resetFields(['dict2','dictChild2']);
		    this.handleSubmit(e);
		}
	}
	reset=(e)=>{
		if(this.state.active === 1){
			this.props.form.resetFields(['text1','textOperator1','textInput1','text2','textOperator2','textInput2','numeric1','numOperator1','numInput1','dict1','dictChild1','dict2','dictChild2']);
			this.handleSubmit(e);
		}else{
			this.props.form.resetFields(['textOperatorReplaceBefore1','textInputReplaceBefore1','textInputReplaceAfter1','textOperatorReplaceBefore2','textInputReplaceBefore2','textInputReplaceAfter2','textOperatorReplaceBefore3','textInputReplaceBefore3','textInputReplaceAfter3']);
			this.setState({
				show:false,
				active:1
			})
		}
		
	}
	//搜索和替换 切换
	activeChange=(num)=>{
		this.setState({
			active:num
		})
	}
	render(){
		const { getFieldDecorator } = this.props.form;
		return(
			<div className={style.box}>
				<div className={style.searchConditions} >
                    <Icon type="search" className={style.icon} onClick={this.showChange} />
                    {
                    	this.state.tags.map((tag,i)=>{
                    		return <Tag closable type={tag.type} title={tag.show} key={i} onClose={(e)=>this.close(e,tag.type)} >{tag.show}</Tag>
                    	})
                    }
                </div>
                <div className={`${style.searchBox} ${this.state.show?'':style.hidden}`} >
				 	<Form onSubmit={this.handleSubmit}>
				 		<p style={{ 'textAlign':'center',fontSize:'14px',padding:'0px',borderBottom:'1px solid #ccc',margin:'0px' }} >
							<span className={classNames(style.titleH,{[style.titleActive]:this.state.active === 1})} onClick={()=>this.activeChange(1)} >
								搜索(Search)
							</span>
							<span className={classNames(style.titleH,{[style.titleActive]:this.state.active === 0,'hidden':this.props.replace })} onClick={()=>this.activeChange(0)}  >
								替换(Replace)
							</span>
						</p>
				 		<Row gutter={20} className={this.state.active === 1?'':'hidden'}>
							<Col xs={24} md={16}>
								<div>
									<p className={style.title}>文本</p>
									<Row gutter={10} className={style.marginB}>
										<Col span={6}>
											<FormItem >
												{getFieldDecorator('text1')(
													<Select labelInValue style={{ width:'100%' }} placeholder="请选择">
					                                    {
					                                        this.state.texts.map((item,i)=>{
					                                            return <Option key={item.column}>{item.name}</Option>
					                                        })
					                                    }
					                                </Select>
												)}
											</FormItem>
										</Col>
										<Col span={6}>
											<FormItem >
												{getFieldDecorator('textOperator1',{
													initialValue:this.state.operator1&&this.state.operator1.length>0?{ key: '1' }:undefined
												})(
													<Select  labelInValue style={{ width:'100%' }} placeholder="操作符" >
					                                    {
					                                        this.state.operator1.map((item,i)=>{
					                                            return <Option key={item.fact_value}>{item.display_name}</Option>
					                                        })
					                                    }
					                                </Select>
												)}
											</FormItem>
										</Col>
										<Col span={12}>
											<FormItem >
												{getFieldDecorator('textInput1')(
													<Input placeholder="请输入关键字，支持通配符*/？和数组a,b,c" />
												)}
											</FormItem>
										</Col>
									</Row>
									<Row gutter={10} className={style.marginB}>
										<Col span={6}>
											<FormItem >
												{getFieldDecorator('text2')(
													<Select labelInValue style={{ width:'100%' }} placeholder="请选择">
					                                    {
					                                        this.state.texts.map((item,i)=>{
					                                            return <Option key={item.column}>{item.name}</Option>
					                                        })
					                                    }
					                                </Select>
												)}
											</FormItem>
										</Col>
										<Col span={6}>
											<FormItem >
												{getFieldDecorator('textOperator2',{
													initialValue:this.state.operator1&&this.state.operator1.length>0?{ key: '1' }:undefined
												})(
													<Select labelInValue style={{ width:'100%' }} placeholder="操作符" >
					                                    {
					                                        this.state.operator1.map((item,i)=>{
					                                            return <Option key={item.fact_value}>{item.display_name}</Option>
					                                        })
					                                    }
					                                </Select>
												)}
											</FormItem>
										</Col>
										<Col span={12}>
											<FormItem >
												{getFieldDecorator('textInput2')(
													<Input placeholder="请输入关键字，支持通配符*/？和数组a,b,c" />
												)}
											</FormItem>
										</Col>
									</Row>
								</div>
								<div>
									<p className={style.title}>数值</p>
									<Row gutter={10} className={style.marginB}>
										<Col span={6}>
											<FormItem >
												{getFieldDecorator('numeric1')(
													<Select labelInValue style={{ width:'100%' }} placeholder="请选择" >
					                                    {
					                                        this.state.numerics.map((item,i)=>{
					                                            return <Option key={item.column}>{item.name}</Option>
					                                        })
					                                    }
					                                </Select>
												)}
											</FormItem>
										</Col>
										<Col span={6}>
											<FormItem>
												{getFieldDecorator('numOperator1')(
													<Select labelInValue style={{ width:'100%' }} placeholder="操作符">
					                                    {
					                                        this.state.operator2.map((item,i)=>{
					                                            return <Option key={item.fact_value}>{item.display_name}</Option>
					                                        })
					                                    }
					                                </Select>
												)}
											</FormItem>
										</Col>
										<Col span={12}>
											<FormItem>
												{getFieldDecorator('numInput1')(
													<Input placeholder="请选择" />
												)}
											</FormItem>
										</Col>
									</Row>
								</div>
							</Col>
							<Col xs={24} md={8}>
								<p className={style.title}>代码</p>
								<Row gutter={10} className={style.marginB}>
									<Col xs={8} md={12}>
										<FormItem>
											{getFieldDecorator('dict1')(
												<Select labelInValue style={{ width:'100%' }} placeholder="请选择" onChange={(value)=>this.dictChange(value,1)} >
				                                    {
				                                        this.state.dicts.map((item,i)=>{
				                                            return <Option key={item.column}>{item.name}</Option>
				                                        })
				                                    }
				                                </Select>
											)}
										</FormItem>
									</Col>
									<Col xs={8} md={12}>
										<FormItem>
											{getFieldDecorator('dictChild1')(
												<Select mode="multiple" labelInValue style={{ width:'100%' }} placeholder="请选择,支持多选">
			                                    {
			                                        this.state.dictChild1.map((item,i)=>{
			                                            return <Option title={item.fact_value}  key={item.display_name+item.fact_value}>{item.display_name}</Option>
			                                        })
			                                    }
			                                </Select>
											)}
										</FormItem>
									</Col>
								</Row>
								<Row gutter={10} className={style.marginB}>
									<Col xs={8} md={12}>
										<FormItem>
											{getFieldDecorator('dict2')(
												<Select labelInValue style={{ width:'100%' }} placeholder="请选择" onChange={(value)=>this.dictChange(value,2)} >
				                                    {
				                                        this.state.dicts.map((item,i)=>{
				                                            return <Option key={item.column}>{item.name}</Option>
				                                        })
				                                    }
				                                </Select>
											)}
										</FormItem>
									</Col>
									<Col xs={8} md={12}>
										<FormItem>
											{getFieldDecorator('dictChild2')(
												<Select mode="multiple" labelInValue style={{ width:'100%' }} placeholder="请选择,支持多选" >
			                                    {
			                                        this.state.dictChild2.map((item,i)=>{
			                                            return <Option title={item.fact_value}  key={item.display_name+item.fact_value}>{item.display_name}</Option>
			                                        })
			                                    }
			                                </Select>
											)}
										</FormItem>
									</Col>
								</Row>
							</Col>
						</Row>
						<Row gutter={20} className={this.state.active === 0?'':'hidden'}>
							<Col xs={15}>
								<p className={style.title}>查找...</p>
								<Row gutter={20}>
									<Col span={8}>
										<FormItem >
											{getFieldDecorator('textOperatorReplaceBefore1')(
												<Select  labelInValue style={{ width:'100%' }} placeholder="操作符" >
				                                    {
				                                        this.state.replaceData.map((item,i)=>{
				                                            return <Option key={item.column}>{item.name}</Option>
				                                        })
				                                    }
				                                </Select>
											)}
										</FormItem>
									</Col>
									<Col span={16}>

										<FormItem >
											{getFieldDecorator('textInputReplaceBefore1')(
												<Input placeholder="请输入关键字，支持通配符*/？和数组a,b,c" />
											)}
										</FormItem>
									</Col>
								</Row>
								<Row gutter={20}>
									<Col span={8}>
										<FormItem >
											{getFieldDecorator('textOperatorReplaceBefore2')(
												<Select  labelInValue style={{ width:'100%' }} placeholder="操作符" >
				                                    {
				                                        this.state.replaceData.map((item,i)=>{
				                                            return <Option key={item.column}>{item.name}</Option>
				                                        })
				                                    }
				                                </Select>
											)}
										</FormItem>
									</Col>
									<Col span={16}>

										<FormItem >
											{getFieldDecorator('textInputReplaceBefore2')(
												<Input placeholder="请输入关键字，支持通配符*/？和数组a,b,c" />
											)}
										</FormItem>
									</Col>
								</Row>
								<Row gutter={20}>
									<Col span={8}>
										<FormItem >
											{getFieldDecorator('textOperatorReplaceBefore3')(
												<Select  labelInValue style={{ width:'100%' }} placeholder="操作符" >
				                                    {
				                                        this.state.replaceData.map((item,i)=>{
				                                            return <Option key={item.column}>{item.name}</Option>
				                                        })
				                                    }
				                                </Select>
											)}
										</FormItem>
									</Col>
									<Col span={16}>

										<FormItem >
											{getFieldDecorator('textInputReplaceBefore3')(
												<Input placeholder="请输入关键字，支持通配符*/？和数组a,b,c" />
											)}
										</FormItem>
									</Col>
								</Row>
							</Col>
							<Col xs={2} style={{ textAlign:'center',lineHeight:'178px' }} >
								<Icon type="retweet" style={{ fontSize:'22px','color':'#5e64ff' }} />
							</Col>
							<Col xs={7}>
								<p className={style.title}>替换为...</p>
								<FormItem >
									{getFieldDecorator('textInputReplaceAfter1')(
										<Input placeholder="请输入替换关键字" />
									)}
								</FormItem>
								<FormItem >
									{getFieldDecorator('textInputReplaceAfter2')(
										<Input placeholder="请输入替换关键字" />
									)}
								</FormItem>
								<FormItem >
									{getFieldDecorator('textInputReplaceAfter3')(
										<Input placeholder="请输入替换关键字" />
									)}
								</FormItem>
							</Col>

						</Row>
						<Row>
							<Col span={24} style={{textAlign:'center'}} >
								<Button type="primary" htmlType="submit">确认</Button>
								<Button onClick={(e)=>this.reset(e)}>取消</Button>
							</Col>
						</Row>
				 	</Form>
				</div>
				<style>
					{`
						.ant-form-item{ margin-bottom:18px; }
					`}
				</style>
			</div>
		)
	}
}
SearchModule = Form.create()(SearchModule);
export default SearchModule;
//给replace为true可以隐藏替换功能