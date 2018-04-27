import React, {Component} from 'react';
import {Transfer, message, Button} from 'antd';
import {urlBefore} from '../../../data.js';

class TransferChange extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.query.id,
            itemType: this.props.query.itemType,
            cloneTgId: this.props.query.cloneTgId,
            data: [],
            count: 0,
            targetKeys: [],
            dataSelect: [],
            pagesize: 1,
            pagerow: 100,
            codeOrName: ''
        }
    }

    componentWillMount() {
        fetch(urlBefore + '/jcxx/queryChosedlist_treatGroupDetail.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                tgId: this.state.id,
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                let arr = [];
                if (data.datas&&data.datas.datas && data.datas.datas.length > 0) {
                    data.datas.datas.forEach((item) => {
                        arr.push(item.dataId);
                    })
                }
                this.setState({
                    dataSelect: data.datas&&data.datas.datas && data.datas.datas.length > 0 ? data.datas.datas : [],
                    targetKeys: arr
                }, () => {
                    this.getDataLeft();
                })
            } else {
                message.warning(data.message);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }

    getDataLeft = () => {
        fetch(urlBefore + '/jcxx/queryUnChoselist_treatGroupDetail.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                tgId: this.state.id,
                itemType: this.state.itemType,
                codeOrName: this.state.codeOrName,
                dataId: this.state.targetKeys && this.state.targetKeys.length > 0 ? this.state.targetKeys.join(',') : ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                //左侧数据
                let arr = [];
                //右侧合到左侧数据中
                if (this.state.pagesize === 1) {
                    arr = this.state.dataSelect.concat(data.datas);
                } else {
                    arr = this.state.data.concat(data.datas);
                }
                this.setState({
                    data: arr,
                    count: data.count
                })
            } else {
                message.warning(data.message);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }
    //穿梭框移动
    handleChange = (nextTargetKeys, direction, moveKeys) => {
        if (direction === 'right') {  //向右侧移动
            let count = this.state.count;
            count = count - moveKeys.length;
            let arr = this.state.dataSelect;
            this.state.data.forEach((item, i) => {
                moveKeys.forEach((key, j) => {
                    if (item.dataId === key) {
                        arr.push(item);
                    }
                })
            })
            this.setState({
                targetKeys: nextTargetKeys, //右侧选中key集合
                dataSelect: arr, //右侧key对应数据
                count: count
            }, () => {
                if (this.state.data.length === nextTargetKeys.length && this.state.count > 0) {
                    this.setState({
                        pagesize: 1
                    }, () => {
                        this.getDataLeft();
                    })
                }
            })
        } else {      //向侧左移动
            let count = this.state.count;
            count = count + moveKeys.length;
            let arr = this.state.dataSelect.concat([]);
            let arrNew = [];
            arr.forEach((item, i) => {
                if (moveKeys.join(',').indexOf(item.dataId) === -1) {
                    arrNew.push(item)
                }
            })
            this.setState({
                targetKeys: nextTargetKeys, //右侧选中key集合
                dataSelect: arrNew, //右侧key对应数据
                count: count
            })
        }
    }
    //穿梭框选中
    handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        this.setState({selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys]});
    }
    //左侧搜索框输入
    onSearchChange = (direction, e) => {
        if (direction === 'left') {
            this.setState({
                codeOrName: e.target.value,
                pagesize: 1,
                data: [],
            }, () => {
                this.getDataLeft();
            })
        }
    }
    //滚动
    handleScroll = (direction, e) => {
        let heightTop = e.target.scrollTop;
        //穿梭框滚动到底部
        if (direction === 'left' && e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight && e.target.offsetHeight !== e.target.scrollHeight && this.state.data.length < this.state.count) {
            if (this.state.data.length < this.state.count) {
                let html = e.target;
                this.setState({
                    pagesize: this.state.pagesize + 1
                }, () => {
                    //滚动后调搜索
                    let arrData = this.state.dataSelect;
                    /*if(this.state.itemTypeL&&this.state.dataSelect.length>0){
                        arrData = this.state.dataSelect.filter((item)=>(item.itemType === this.state.itemTypeL));
                    }else{
                        arrData = this.state.dataSelect;
                    }*/
                    fetch(urlBefore + '/jcxx/queryUnChoselist_treatGroupDetail.action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        credentials: 'include',
                        body: 'pagesize=' + this.state.pagesize + '&pagerow=' + this.state.pagerow + '&data=' + JSON.stringify({
                            tgId: this.state.id,
                            itemType: this.state.itemType,
                            codeOrName: this.state.codeOrName,
                            dataId: this.state.targetKeys && this.state.targetKeys.length > 0 ? this.state.targetKeys.join(',') : ''
                        })
                    }).then(res => res.json()
                    ).then(data => {
                        if (data.result === 'success') {
                            let arr = [];
                            arr = arr.concat(data.datas, this.state.data);
                            let obj = {};
                            let result = [];
                            arr.forEach((item) => {
                                let key = item.dataId;
                                if (!obj[key]) {
                                    obj[key] = true;
                                    result.push(item);
                                }
                            })
                            this.setState({
                                data: result,
                                count: data.count
                            }, () => {
                                html.scrollTop = heightTop;
                            })
                        }
                    }).catch(error => {
                        message.error(error.message);
                    })
                })
            }
        }
    }
    save = () => {
        fetch(urlBefore + '/jcxx/saveBySerPkg_treatGroup.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                tgId: this.state.id,
                cloneTgId: this.state.cloneTgId,
                details: this.state.dataSelect && this.state.dataSelect.length > 0 ? this.state.dataSelect : ''
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('修改成功！');
                if (this.props.query.key) {
                    this.props.liSave(this.props.query.key, data.datas.dataId, data.datas.ake001, data.datas.cloneTgId, this.state.id);
                } else {
                    this.props.liSave('', data.datas.dataId, data.datas.ake001, data.datas.cloneTgId, this.state.id);
                }

            } else {
                message.error(data.message);
            }
        }).catch(error => {
            message.error(error.message);
        })
    }

    render() {
        return (
            <div>
                <Transfer
                    className="myTransfer"
                    listStyle={{width: '40%', height: '300px', marginBottom: '10px'}}
                    dataSource={this.state.data}
                    showSearch
                    searchPlaceholder='搜索'
                    titles={[`${'可选项目列表(' + this.state.count + ')'}`, '已选项目列表']}
                    operations={['加入右侧', '加入左侧']}
                    targetKeys={this.state.targetKeys}
                    onChange={this.handleChange}
                    onSelectChange={this.handleSelectChange}
                    onSearchChange={this.onSearchChange}
                    onScroll={this.handleScroll}
                    render={item => (item.itemName + '(' + item.itemCode + ')')}
                    rowKey={record => record.dataId}

                />
                <footer>
                    <Button onClick={this.props.back}>取消</Button>
                    <Button type="primary" onClick={this.save}>确定</Button>
                </footer>
            </div>
        )
    }
}

export default TransferChange