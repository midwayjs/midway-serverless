export const wrapperContent = `const { FaaSStarter } = require('@midwayjs/faas');
const { asyncWrapper, start } = require('@midwayjs/serverless-fc-starter');
<% layerDeps.forEach(function(layer){ %>const <%=layer.name%> = require('<%=layer.path%>');
<% }); %>

let starter;
let runtime;
let inited = false;
let handlerFunction;
<% if (globalHandlerFunction) { %>
handlerFunction = globalHandlerFunction;
<% } %>

const initializeMethod = async (config = {}) => {
  runtime = await start({
    layers: [<%= layers.join(", ") %>]
  });
  starter = new FaaSStarter({ config, baseDir: __dirname });
  await starter.start();
  inited = true;
};

exports.initializer = asyncWrapper(async ({config} = {}) => {
  await initializeMethod(config);
});

<% handlers.forEach(function(handlerData){ %>
exports.<%=handlerData.name%> = asyncWrapper(async (...args) => {
  if (!inited) {
    await initializeMethod();
  }
  <% if (handlerData.handler) { %>
  const handler = handlerFunction || starter.handleInvokeWrapper('<%=handlerData.handler%>');
  return runtime.asyncEvent(handler)(...args);
  <% } else { %>
  return runtime.asyncEvent(async (ctx) => {
    <% handlerData.handlers.forEach(function(multiHandler){ %> if (ctx && ctx.path === '<%=multiHandler.path%>') {
      const handler = handlerFunction || starter.handleInvokeWrapper('<%=multiHandler.handler%>');
      return handler(ctx);
    } else <% }); %>{
      return 'unhandler path: ' + (ctx && ctx.path || '');
    }
  })(...args);
  <% } %>
});
<% }); %>`;