import * as fs from 'fs';
import * as path from 'path';
import { Scanner } from './scanner';
import { Parser } from './parser';
import { Interpreter } from './interpreter';

const fileName = process.argv[2] + ".is";

const filePath = path.join(__dirname, "/examples/", fileName);

fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    const scanner = new Scanner(data);
    const parser = new Parser(scanner);
    const interpreter = new Interpreter(parser);

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
    } else {
        console.error('error reading the file: ', err);
    }
});