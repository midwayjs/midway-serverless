const os = require('os');
exports.logger = {
    dir: os.tmpdir(),
}

exports.rundir = os.tmpdir()