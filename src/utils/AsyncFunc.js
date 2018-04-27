import React, { Component } from 'react';
//import HolderComponent from './holderComponent';
//import Nprogress from 'nprogress';
//import 'nprogress/nprogress.css';

export default function asyncComponent(importComponent) {
  class AsyncFunc extends Component {
    constructor(props) {
      super(props);
      this.state = {
        component: null,
      };
    }
    componentWillMount() {
      //Nprogress.start();
    }
    async componentDidMount() {
      const { default: Component } = await importComponent();
      //console.log('Component',Component);
      //Nprogress.done();
      console.log(this.props)
      this.setState({
        component: <Component {...this.props} />
      });
    }

    render() {
      const { component } = this.state;
      return component ? component : <div />
    }
  }
  return AsyncFunc;
}
