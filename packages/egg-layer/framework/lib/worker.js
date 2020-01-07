module.exports = app => {
    ['diamond', 'hsfClient', 'tairManager', 'tair', 'metaq'].forEach(name => {
        app[name] = (app.options.runtime.global || app.options.runtime)[name]
    })
}