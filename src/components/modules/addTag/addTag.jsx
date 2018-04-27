// 统计
import React, {Component} from 'react';
import {message, Form, Input, Tag} from 'antd';
import {urlBefore} from '../../../data';
import subString from './../../../utils/subString'

const FormItem = Form.Item;

class AddTag extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchObj: this.props.searchObj,
            TagList: [],
            tagName: "",        // 标签模糊查询
            choseFlagState: []
        }
    }

    componentDidMount() {
        this.searchTag()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.searchObj !== nextProps.searchObj) {
            this.setState({
                searchObj: nextProps.searchObj
            })
        }
    }

    // 右侧模糊查询
    TagChange = () => {
        this.props.form.validateFields((err, values) => {
            this.setState({
                tagName: values.tagName
            }, () => this.searchTag())
        })
    }

    searchTag = () => {
        console.log(this.state.searchObj)
        const obj = this.state.searchObj;
        obj.tagName = this.state.tagName
        const url = obj.data ? "/base/queryTagsByBusiType_tags.action" : "/base/queryTagsByData_tags.action"
        window.Fetch(urlBefore + url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: "data=" + JSON.stringify(obj)
        }).then(res => res.json()
        ).then(data => {
            const choseFlagState = []
            if (data.result === 'success') {
                console.log(data.datas)
                data.datas.forEach((TagList, i) => {
                    if (TagList.choseFlag) {
                        choseFlagState.push({tagId: TagList.tagId})
                    }
                })
                this.props.tagsChange(choseFlagState);
                this.setState({
                    TagList: data.datas,
                    choseFlagState: choseFlagState
                })
            } else {
                return []
            }
        }).catch(error => {
            message.error(error);
        })
    }

    tagsChange = (choseFlag, id) => {
        const choseFlagState = []
        this.state.TagList.forEach((TagList, i) => {
            if (TagList.tagId === id) {
                TagList.choseFlag = !TagList.choseFlag
            }
            if (TagList.choseFlag) {
                choseFlagState.push({tagId: TagList.tagId})
            }
            console.log(choseFlagState)
        })
        this.setState({choseFlag});
        this.props.tagsChange(choseFlagState)
    }

    render() {
        const TagListTab = this.state.TagList.map((TagList, i) => {
            return <Tag title={TagList.tagName} color={TagList.choseFlag ? 'geekblue' : ''} key={TagList.tagId}
                        onClick={(choseFlag) => { this.tagsChange(choseFlag, TagList.tagId) }}
                        style={{marginBottom: '10px'}}>{subString(TagList.tagName)}</Tag>
        })
        const {getFieldDecorator} = this.props.form;
        return (
            <div>
                <h4>标签(Tag)</h4>
                <FormItem>
                    {getFieldDecorator("tagName", {
                        initialValue: ''
                    })(
                        <Input onKeyUp={this.TagChange} placeholder="请输入标签名称" style={{marginBottom: "15px"}}/>
                    )}
                </FormItem>
                <div>
                    {TagListTab}
                </div>
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

AddTag = Form.create()(AddTag);
export default AddTag;
