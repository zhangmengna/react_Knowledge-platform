/**
 * Created by hao.cheng on 2017/5/7.
 */
import React from 'react';
import img from '../../style/imgs/404.png';
import {hashHistory, Link} from 'react-router';

class NotFound extends React.Component {
    state = {
        animated: ''
    };
    enter = () => {
        hashHistory.push('/login');
    };

    render() {
        if (!sessionStorage.getItem('InitData')) {
            hashHistory.push('/login');
        }
        return (
            <div className="center" style={{height: '100%', background: '#ececec', overflow: 'hidden'}}>
                <Link to="/login">回到登录页面</Link>
                <img src={img} alt="404" style={{cursor: 'pointer'}} className={`animated swing ${this.state.animated}`}
                     onClick={this.enter}/>
            </div>
        )
    }
}

export default NotFound;