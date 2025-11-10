#!/usr/bin/env node
const http = require('http');
const {getPortFromCommand} = require("./src/utils");
const {startWebServer} = require("./src/webserver");
const {subjects} = require("./src/subject");

startWebServer(getPortFromCommand(), subjects)