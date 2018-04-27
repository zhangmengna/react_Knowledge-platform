import React, {Component} from 'react';
import {Row, Col, Checkbox, Button, message} from 'antd';
import BreadcrumbCustom from '../../../components/BreadcrumbCustom';
import style from './index.less';
import {urlBefore} from '../../../data.js';

class Product extends Component {
    constructor(props) {
        super(props);
        this.state = {
            first: this.props.query.first,
            second: this.props.query.second,
            three: '生成服务包',
            data: []
        }
    }

    componentWillMount() {
        window.Fetch(urlBefore + '/jcxx/queryMappingResult_itemMapping.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: ''
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

    change = (checkedValues) => {
        console.log(checkedValues);
        this.setState({
            checkedValues: checkedValues.length > 0 ? checkedValues.join(',') : ''
        })
    }
    save = () => {
        window.Fetch(urlBefore + '/bzpznew/createSerPkg_servicePkg.action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            credentials: 'include',
            body: 'data=' + JSON.stringify({
                busiType: this.state.checkedValues
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                message.success('生成成功！');
                this.props.show();
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }
    cancel = () => {
        this.props.show();
    }

    render() {
        return (
            <div>
                <div className={style.header}>
                    <BreadcrumbCustom first={this.state.first} second={this.state.second} three={this.state.three}/>
                </div>
                <div className={style.content}>
                    <p>请选择生成内容</p>
                    <Row className={style.product} gutter={20}>
                        <Col span={8} className={style.productCol} style={{borderLeft: 'none'}}>
                            <Checkbox.Group onChange={this.change}>
                                <Row>
                                    <Col className={style.colStyle} span={24}><Checkbox
                                        value="07">服务包信息</Checkbox></Col>
                                    <Col className={style.colStyle} span={24}><Checkbox value="09">指标信息</Checkbox></Col>
                                    <Col className={style.colStyle} span={24}><Checkbox
                                        value="12">特殊场景信息</Checkbox></Col>
                                </Row>
                            </Checkbox.Group>
                        </Col>
                        <Col span={16} className={style.productCol}>
                            <Row>
                                <Col className={style.colStyle} style={{fontWeight: '700'}} span={24}>诊断信息</Col>
                                <Col className={style.colStyle} offset={2}
                                     span={4}>全部：{this.state.data.length > 0 ? this.state.data[0].count : ''}</Col>
                                <Col className={style.colStyle}
                                     span={4}>已映射：{this.state.data.length > 0 ? this.state.data[0].mappCount : ''}</Col>
                                <Col className={style.colStyle}
                                     span={4}>未映射：{this.state.data.length > 0 ? this.state.data[0].unMapCount : ''}</Col>
                            </Row>
                            <Row>
                                <Col className={style.colStyle} style={{fontWeight: '700'}} span={24}>手术信息</Col>
                                <Col className={style.colStyle} offset={2}
                                     span={4}>全部：{this.state.data.length > 1 ? this.state.data[1].count : ''}</Col>
                                <Col className={style.colStyle}
                                     span={4}>已映射：{this.state.data.length > 1 ? this.state.data[1].mappCount : ''}</Col>
                                <Col className={style.colStyle}
                                     span={4}>未映射：{this.state.data.length > 1 ? this.state.data[1].unMapCount : ''}</Col>
                            </Row>
                            <Row>
                                <Col className={style.colStyle} style={{fontWeight: '700'}} span={24}>诊疗项目信息</Col>
                                <Col className={style.colStyle} offset={2}
                                     span={4}>全部：{this.state.data.length > 2 ? this.state.data[2].count : ''}</Col>
                                <Col className={style.colStyle}
                                     span={4}>已映射：{this.state.data.length > 2 ? this.state.data[2].mappCount : ''}</Col>
                                <Col className={style.colStyle}
                                     span={4}>未映射：{this.state.data.length > 2 ? this.state.data[2].unMapCount : ''}</Col>
                            </Row>
                            <Row>
                                <Col className={style.colStyle} style={{fontWeight: '700'}} span={24}>药品信息</Col>
                                <Col className={style.colStyle} offset={2}
                                     span={4}>全部：{this.state.data.length > 3 ? this.state.data[3].count : ''}</Col>
                                <Col className={style.colStyle}
                                     span={4}>已映射：{this.state.data.length > 3 ? this.state.data[3].mappCount : ''}</Col>
                                <Col className={style.colStyle}
                                     span={4}>未映射：{this.state.data.length > 3 ? this.state.data[3].unMapCount : ''}</Col>
                            </Row>
                        </Col>

                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col span={6} offset={18}>
                            <Button type="primary" onClick={this.save}>
                                保存
                            </Button>
                            <Button style={{float: 'right'}} onClick={this.cancel}>
                                取消
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default Product;