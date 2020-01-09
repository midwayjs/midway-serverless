import React, { Component } from 'react';
import MainRoutes from './MainRoutes';
export default class BasicLayout extends Component {
    render() {
        return (React.createElement("div", { style: { paddingTop: '100px' } },
            React.createElement(MainRoutes, null)));
    }
}
//# sourceMappingURL=index.js.map