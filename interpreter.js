"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const parser_1 = require("./parser");
const functionDeclarations = {};
const systemFunctions = ['print'];
class Result {
    constructor(value, type, node) {
        this.value = value;
        this.type = type;
        this.node = node;
    }
    getValue() {
        return this.value;
    }
}
class Interpreter {
    constructor(parser) {
        this.parser = parser;
    }
    interpret() {
        const tree = this.parser.parseAll();
        let pos = 0;
        const globalContext = {};
        while (pos < tree.length) {
            const node = tree[pos];
            this.visitNode(node, globalContext);
            pos++;
        }
    }
    visitNode(node, context) {
        switch (node.nodeType) {
            case parser_1.NodeType.FunctionDeclaration:
                return this.visitFunctionDeclarationNode(node);
            case parser_1.NodeType.FunctionCall:
                return this.visitFunctionCallNode(node, context);
            case parser_1.NodeType.VariableDeclaration:
                return this.visitVariableDeclarationNode(node, context);
            case parser_1.NodeType.BinaryOperation:
                return this.visitBinaryOperationNode(node, context);
            case parser_1.NodeType.Variable:
                return this.visitVariableNode(node, context);
            case parser_1.NodeType.LiteralNumber:
                return this.visitLiteralNumberNode(node);
            case parser_1.NodeType.ReturnExpression:
                return this.visitReturnExpressionNode(node, context);
            default:
                throw new Error(`Cannot visit node of type: ${node.nodeType}`);
        }
    }
    visitReturnExpressionNode(node, context) {
        return this.visitNode(node.expression, context);
    }
    visitVariableNode(node, context) {
        return context[node.name];
    }
    visitBinaryOperationNode(node, context) {
        const left = this.visitNode(node.leftOperand, context);
        const right = this.visitNode(node.rightOperand, context);
        if (left === undefined || left.value === undefined
            || right === undefined || right.value === undefined) {
            throw new Error(`One of the operands used in the "${node.operator.operator}" operation is undefined`);
        }
        switch (node.operator.operator) {
            case "+":
                return new Result(left.value + right.value, 'int', node);
            case "-":
                return new Result(left.value - right.value, 'int', node);
            case "*":
                return new Result(left.value * right.value, 'int', node);
            case "/":
                return new Result(left.value / right.value, 'int', node);
            default:
                throw new Error(`Unknown operator: ${node.operator}`);
        }
    }
    visitVariableDeclarationNode(node, context) {
        node.value = this.visitNode(node.valueNode, context);
        context[node.name] = node.value;
        return new Result(node.value, node.type, node);
    }
    visitFunctionDeclarationNode(node) {
        functionDeclarations[node.name] = node;
        return new Result(undefined, 'undefined', node);
    }
    visitFunctionCallNode(node, parentContext) {
        if (systemFunctions.includes(node.name)) {
            this.executeSystemFunction(node, parentContext);
            return undefined;
        }
        const func = functionDeclarations[node.name];
        if (!func) {
            throw new Error(`Function ${node.name} is not defined`);
        }
        const argumentValues = this.resolveFunctionArgumentValues(node.arguments, func.parameters, parentContext);
        const functionContext = {};
        argumentValues.forEach(argument => {
            functionContext[argument.name] = argument.value;
        });
        const results = func.body.statements.map(n => this.visitNode(n, functionContext));
        return results[results.length - 1];
    }
    createFunctionContext(argumentValues) {
        const functionContext = {};
        argumentValues.forEach(argument => {
            functionContext[argument.name] = argument.value;
        });
        return functionContext;
    }
    resolveFunctionArgumentValues(args, argDefinitions, context) {
        const argumentValues = args.map((arg, index) => {
            const argName = argDefinitions[index].name;
            return {
                name: argName,
                value: this.visitNode(arg, context)
            };
        });
        return argumentValues;
    }
    visitLiteralNumberNode(node) {
        return new Result(node.value, 'int', node);
    }
    executeSystemFunction(node, context) {
        switch (node.name) {
            case 'print':
                const functionParams = [
                    new parser_1.FunctionParameterNode('toPrint', new parser_1.TypeNode('int'))
                ];
                const argumentValues = this.resolveFunctionArgumentValues(node.arguments, functionParams, context);
                console.log(argumentValues[0].value.getValue());
        }
    }
}
exports.Interpreter = Interpreter;
