import React, { Component } from 'react';
import Guide from '../../components/Guide';
import Greeting from '../../components/Greeting';
export default class Dashboard extends Component {
    render() {
        return (React.createElement("div", null,
            React.createElement(Greeting, { name: "TypeScript" }),
            React.createElement(Guide, null)));
    }
}
//# sourceMappingURL=index.js.map