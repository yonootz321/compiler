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
        this.returnStatementVisited = false;
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
            case parser_1.NodeType.Assignment:
                return this.visitAssignmentNode(node, context);
            case parser_1.NodeType.BinaryOperation:
                return this.visitBinaryOperationNode(node, context);
            case parser_1.NodeType.Variable:
                return this.visitVariableNode(node, context);
            case parser_1.NodeType.LiteralNumber:
                return this.visitLiteralNumberNode(node);
            case parser_1.NodeType.LiteralString:
                return this.visitLiteralStringNode(node);
            case parser_1.NodeType.ReturnExpression:
                return this.visitReturnExpressionNode(node, context);
            case parser_1.NodeType.IfStatement:
                return this.visitIfStatementNode(node, context);
            case parser_1.NodeType.WhileStatement:
                return this.visitWhileStatementNode(node, context);
            case parser_1.NodeType.LiteralBoolean:
                return this.visitLiteralBooleanNode(node);
            default:
                throw new Error(`Cannot visit node of type: ${node.nodeType}`);
        }
    }
    visitWhileStatementNode(node, context) {
        let result = new Result(undefined, 'undefined', node);
        while (this.visitNode(node.condition, context).value === true) {
            const results = node.body.statements.map(n => this.visitNode(n, context));
            result = results[results.length - 1];
        }
        return result;
    }
    visitLiteralBooleanNode(node) {
        return new Result(node.value, 'bool', node);
    }
    visitIfStatementNode(node, context) {
        const conditionResult = this.visitNode(node.condition, context);
        if (conditionResult.value === true) {
            const results = node.body.statements.map(n => this.visitNode(n, context));
            return results[results.length - 1];
        }
        return new Result(undefined, 'undefined', node);
    }
    visitReturnExpressionNode(node, context) {
        this.returnStatementVisited = true;
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
            case ">":
                return new Result(left.value > right.value, 'bool', node);
            case "<":
                return new Result(left.value < right.value, 'bool', node);
            case "==":
                return new Result(left.value == right.value, 'bool', node);
            default:
                throw new Error(`Unknown operator: ${node.operator.operator}`);
        }
    }
    visitAssignmentNode(node, context) {
        const value = this.visitNode(node.expression, context);
        context[node.variable.name] = value;
        return value;
    }
    visitVariableDeclarationNode(node, context) {
        if (node.valueNode !== undefined) {
            node.value = this.visitNode(node.valueNode, context);
            context[node.name] = node.value;
        }
        return new Result(node.value, 'int', node);
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
        let result = new Result(undefined, 'undefined', node);
        for (let i = 0; i < func.body.statements.length; i++) {
            const statement = func.body.statements[i];
            result = this.visitNode(statement, functionContext);
            if (this.returnStatementVisited) {
                this.returnStatementVisited = false;
                return result;
            }
        }
        return result;
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
    visitLiteralStringNode(node) {
        return new Result(node.value, 'string', node);
    }
    executeSystemFunction(node, context) {
        switch (node.name) {
            case 'print':
                const functionParams = [
                    new parser_1.FunctionParameterNode('arg1', new parser_1.TypeNode('int')),
                    new parser_1.FunctionParameterNode('arg2', new parser_1.TypeNode('int')),
                    new parser_1.FunctionParameterNode('arg3', new parser_1.TypeNode('int')),
                    new parser_1.FunctionParameterNode('arg4', new parser_1.TypeNode('int')),
                    new parser_1.FunctionParameterNode('arg5', new parser_1.TypeNode('int'))
                ];
                const argumentValues = this.resolveFunctionArgumentValues(node.arguments, functionParams, context);
                const values = argumentValues.map(arg => arg.value.getValue());
                console.log(...values);
        }
    }
}
exports.Interpreter = Interpreter;
