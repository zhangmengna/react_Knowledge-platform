// 统计
import React, {Component} from 'react';
import {Row, Col, message} from 'antd';
import style from './catalog.less';
import {urlBefore} from '../../data';
import catalogImg from "./catalog.js"
import imgUrl from "./../../style/imgs/menulist/icon3.png";

import {Link} from 'react-router';

class Catalog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuList: []
        }
    }

    componentWillMount() {
        const menufullcode = sessionStorage.getItem('menufullcode');
        window.Fetch(urlBefore + '/common/queryLoginUserPCMenuByPMenu_ybMenu.action', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                "menufullcode": menufullcode
            })
        }).then(res => res.json()
        ).then(data => {
            if (data.result === 'success') {
                this.setState({
                    menuList: data.datas
                })
            } else {
                message.error(data.message);
            }
        }).catch((error) => {
            message.error(error.message);
        })
    }

    render() {
        return (
            <div className={style.catalog}>
                <Row>
                    {
                        this.state.menuList.length > 0 ? this.state.menuList.map((menuList, i) => {
                            return (<Col span={4} key={i} className={style.colStyle}>
                                <Link
                                    to={catalogImg[menuList.menusimplepin] && catalogImg[menuList.menusimplepin].linkUrl ? catalogImg[menuList.menusimplepin].linkUrl + "?id=" + menuList.menucode + "&name=" + menuList.menuname : ""}>
                                    <img
                                        src={catalogImg[menuList.menusimplepin] ? catalogImg[menuList.menusimplepin].img : imgUrl}
                                        className={style.img} alt="图片icon"/>
                                    <p>{menuList.menuname}
                                        {/*<br /> {menuList.menuspelling}*/}
                                    </p>
                                </Link>
                            </Col>)
                        }) : ""
                    }
                </Row>
            </div>
        )
    }
}

export default Catalog;
