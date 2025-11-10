#!/usr/bin/env node
const http = require('http');
const {getPortFromCommand} = require("./utils");
const {startWebServer} = require("./webserver");
const {subjects} = require("./subject");

startWebServer(getPortFromCommand(), subjects)