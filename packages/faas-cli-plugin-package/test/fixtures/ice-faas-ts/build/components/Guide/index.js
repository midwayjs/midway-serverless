import React from 'react';
import { Button } from '@alifd/next';
const Guide = () => {
    return (React.createElement("div", { style: { width: '400px', margin: '40px auto' } },
        React.createElement("h2", { style: { textAlign: 'center' } }, "\u4F7F\u7528\u6307\u5357"),
        React.createElement("ul", null,
            React.createElement("li", { style: styles.item }, "1. \u8BE5\u6A21\u677F\u9002\u7528\u4E8E\u4ECE 0 \u5230 1 \u5F00\u59CB\u642D\u5EFA\u9879\u76EE\uFF0C\u5185\u7F6E\u5F15\u5BFC\u9875\u9762\uFF0C\u8DEF\u7531\u548C\u83DC\u5355\u5C55\u793A\u3002"),
            React.createElement("li", { style: styles.item }, "2. \u83DC\u5355\u914D\u7F6E: menuConfig.js\u3002"),
            React.createElement("li", { style: styles.item }, "3. \u8DEF\u7531\u914D\u7F6E: routerConfig.js\u3002"),
            React.createElement("li", { style: styles.item },
                "4. \u901A\u8FC7 GUI \u5DE5\u5177",
                ' ',
                React.createElement("a", { href: "https://alibaba.github.io/ice/iceworks", target: "_blank", rel: "noopener noreferrer" }, "Iceworks"),
                ' ',
                "\u521B\u5EFA\u9875\u9762\uFF0C\u4F1A\u540C\u6B65\u7684\u66F4\u65B0\u83DC\u5355\u548C\u8DEF\u7531\u914D\u7F6E\u3002"),
            React.createElement("li", { style: styles.item },
                "5. \u57FA\u4E8E",
                ' ',
                React.createElement("a", { href: "https://alibaba.github.io/ice/block", target: "_blank", rel: "noopener noreferrer" }, "\u7269\u6599"),
                ' ',
                "\u751F\u6210\u7684\u9875\u9762\u5C06\u4F1A\u6DFB\u52A0\u5728 pages \u76EE\u5F55\u3002"),
            React.createElement("li", { style: styles.item },
                "6. \u8BA9\u524D\u7AEF\u5DE5\u7A0B\u53D8\u7684\u8F7B\u677E\u4FBF\u6377\uFF0C",
                React.createElement("a", { href: "https://alibaba.github.io/ice/docs/iceworks", target: "_blank", rel: "noopener noreferrer" }, "\u4E0B\u8F7D iceworks"),
                ' ',
                "\u3002")),
        React.createElement("div", { style: { textAlign: 'center', marginTop: '40px' } },
            React.createElement("a", { href: "https://alibaba.github.io/ice/docs/iceworks", target: "_blank", rel: "noopener noreferrer" },
                React.createElement(Button, { type: "secondary", style: { marginRight: '20px' } },
                    "\u5FEB\u901F\u5F00\u59CB",
                    ' ')),
            React.createElement("a", { href: "https://www.tslang.cn/docs/home.html", target: "_blank", rel: "noopener noreferrer" },
                React.createElement(Button, { type: "primary" }, "\u5B66\u4E60 TypeScript")))));
};
const styles = {
    item: {
        height: '34px',
        lineHeight: '34px',
    },
};
export default Guide;
//# sourceMappingURL=index.js.map