"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const scanner_1 = require("./scanner");
const parser_1 = require("./parser");
const interpreter_1 = require("./interpreter");
const fileName = process.argv[2] + ".is";
const filePath = path.join(__dirname, "/examples/", fileName);
fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
    const scanner = new scanner_1.Scanner(data);
    const parser = new parser_1.Parser(scanner);
    const interpreter = new interpreter_1.Interpreter(parser);
    if (!err) {
        const tokens = scanner.scanAll();
        console.log(tokens);
        scanner.reset();
        const ast = parser.parseAll();
        console.log(JSON.stringify(ast, null, 2));
        parser.reset();
        console.log("Executing code. Result is: ");
        const result = interpreter.interpret();
        console.log(result);
    }
    else {
        console.error('error reading the file: ', err);
    }
});
