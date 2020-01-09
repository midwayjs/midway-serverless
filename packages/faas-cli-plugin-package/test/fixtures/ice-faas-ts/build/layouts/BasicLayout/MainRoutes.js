import React, { Component } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import routerConfig from '../../routerConfig';
import Guide from '../../components/Guide';
class MainRoutes extends Component {
    constructor() {
        super(...arguments);
        /**
         * 渲染路由组件
         */
        this.renderNormalRoute = (item, index) => {
            return item.component ? (React.createElement(Route, { key: index, path: item.path, component: item.component, exact: item.exact })) : null;
        };
    }
    render() {
        return (React.createElement(Switch, null,
            routerConfig.map(this.renderNormalRoute),
            React.createElement(Redirect, { exact: true, from: "/", to: "/dashboard" }),
            React.createElement(Route, { component: Guide })));
    }
}
export default MainRoutes;
//# sourceMappingURL=MainRoutes.js.map