#!/usr/bin/env node
'use strict';
const { AliCLI } = require('../dist');
const cli = new AliCLI(process.argv);
cli.start();
