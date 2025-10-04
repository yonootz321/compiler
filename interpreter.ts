import { 
    AssignmentNode,
    BinaryOperationNode,
    FunctionCallNode, 
    FunctionDeclarationNode, 
    FunctionParameterNode, 
    LiteralNumberNode, 
    LiteralStringNode, 
    NodeType, 
    Parser, 
    ReturnExpressionNode, 
    TypeNode, 
    VariableDeclarationNode, 
    VariableNode
} from "./parser";
import { Node } from "./parser";

const functionDeclarations: {[key: string]: FunctionDeclarationNode} = {};
const systemFunctions = ['print'];

type Context = {
    [key: string]: Result;
}

class Result {
    value: number | string;
    type: string;
    node: Node;

    constructor(value: number | string, type: string, node: Node) {
        this.value = value;
        this.type = type;
        this.node = node;
    }

    public getValue(): string | number {
        return this.value;
    }
}

export class Interpreter {
    constructor (
        private parser: Parser
    ) {}

    interpret (): void {
        const tree = this.parser.parseAll();
        let pos = 0;
        const globalContext = {};
        while (pos < tree.length) {
            const node = tree[pos];
            this.visitNode(node, globalContext);
            pos++;
        }
    }

    visitNode(node: Node, context: Context): Result {
        switch (node.nodeType) {
            case NodeType.FunctionDeclaration: 
                return this.visitFunctionDeclarationNode(node as FunctionDeclarationNode);
            case NodeType.FunctionCall:
                return this.visitFunctionCallNode(node as FunctionCallNode, context);
            case NodeType.VariableDeclaration:
                return this.visitVariableDeclarationNode(node as VariableDeclarationNode, context);
            case NodeType.Assignment:
                return this.visitAssignmentNode(node as AssignmentNode, context);
            case NodeType.BinaryOperation:
                return this.visitBinaryOperationNode(node as BinaryOperationNode, context);
            case NodeType.Variable:
                return this.visitVariableNode(node as VariableNode, context);
            case NodeType.LiteralNumber:
                return this.visitLiteralNumberNode(node as LiteralNumberNode);
            case NodeType.LiteralString:
                return this.visitLiteralStringNode(node as LiteralStringNode);
            case NodeType.ReturnExpression:
                return this.visitReturnExpressionNode(node as ReturnExpressionNode, context);
            default:
                throw new Error(`Cannot visit node of type: ${node.nodeType}`);
        }
    }

    visitReturnExpressionNode(node: ReturnExpressionNode, context: Context): Result {
        return this.visitNode(node.expression, context);
    }

    visitVariableNode(node: VariableNode, context: Context): Result {
        return context[node.name];
    }

    visitBinaryOperationNode(node: BinaryOperationNode, context: Context): Result {
        const left = this.visitNode(node.leftOperand, context);
        const right = this.visitNode(node.rightOperand, context);
        if (left === undefined || left.value === undefined 
         || right === undefined || right.value === undefined) {
            throw new Error(`One of the operands used in the "${node.operator.operator}" operation is undefined`);
        }
        switch (node.operator.operator) {
            case "+":
                // @ts-ignore Intentionally allowing string and numbers to combine
                return new Result(left.value + right.value, 'int', node);
            case "-":
                // @ts-ignore Intentionally allowing string and numbers to combine
                return new Result(left.value - right.value, 'int', node);
            case "*": 
                // @ts-ignore Intentionally allowing string and numbers to combine
                return new Result(left.value * right.value, 'int', node);
            case "/":
                // @ts-ignore Intentionally allowing string and numbers to combine
                return new Result(left.value / right.value, 'int', node);
            default:
                throw new Error(`Unknown operator: ${node.operator.operator}`);
        }
    }

    visitAssignmentNode(node: AssignmentNode, context: Context): Result {
        const value = this.visitNode(node.expression, context);
        context[node.variable.name] = value;
        return value;
    }

    visitVariableDeclarationNode(node: VariableDeclarationNode, context: Context): Result {
        if (node.valueNode !== undefined) {
            node.value = this.visitNode(node.valueNode, context);
            context[node.name] = node.value;
        }
        return new Result(node.value, 'int', node);
    }

    visitFunctionDeclarationNode(node: FunctionDeclarationNode): Result {
        functionDeclarations[node.name] = node;
        return new Result(undefined, 'undefined', node);
    }

    visitFunctionCallNode(node: FunctionCallNode, parentContext: Context): Result {
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

    createFunctionContext(
        argumentValues: Array<{
            name: string,
            value: Result
        }>
    ): Context {
        const functionContext = {};
        argumentValues.forEach(argument => {
            functionContext[argument.name] = argument.value;
        });
        return functionContext;
    }

    resolveFunctionArgumentValues(args: Node[], argDefinitions: FunctionParameterNode[], context: Context): Array<{
        name: string,
        value: Result
    }> {
        const argumentValues = args.map((arg, index) => {
            const argName = argDefinitions[index].name;
            return {
                name: argName,
                value: this.visitNode(arg, context)
            };
        });
        return argumentValues;
    }

    visitLiteralNumberNode(node: LiteralNumberNode): Result {
        return new Result(node.value, 'int', node);
    }

    visitLiteralStringNode(node: LiteralStringNode): Result {
        return new Result(node.value, 'string', node);
    }

    executeSystemFunction(node: FunctionCallNode, context: Context): void {
        switch (node.name) {
            case 'print':
                const functionParams = [
                    new FunctionParameterNode('arg1', new TypeNode('int')),
                    new FunctionParameterNode('arg2', new TypeNode('int')),
                    new FunctionParameterNode('arg3', new TypeNode('int')),
                    new FunctionParameterNode('arg4', new TypeNode('int')),
                    new FunctionParameterNode('arg5', new TypeNode('int'))
                ];
                const argumentValues = this.resolveFunctionArgumentValues(node.arguments, functionParams, context);
                const values = argumentValues.map(arg => arg.value.getValue());
                console.log(...values);
        }
    }
}