/**
 * 定义应用路由
 */
import { HashRouter, Switch, Route } from 'react-router-dom';
import React from 'react';
import BasicLayout from './layouts/BasicLayout';
const router = () => {
    return (React.createElement(HashRouter, null,
        React.createElement(Switch, null,
            React.createElement(Route, { path: "/", component: BasicLayout }))));
};
export default router;
//# sourceMappingURL=router.js.map