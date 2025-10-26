"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.IfStatementNode = exports.AssignmentNode = exports.ReturnExpressionNode = exports.BinaryOperationNode = exports.VariableNode = exports.VariableDeclarationNode = exports.LiteralBooleanNode = exports.LiteralStringNode = exports.LiteralNumberNode = exports.FunctionCallNode = exports.TypeNode = exports.FunctionBodyNode = exports.FunctionParameterNode = exports.FunctionDeclarationNode = exports.Node = exports.NodeType = void 0;
const scanner_1 = require("./scanner");
const builtInFunctionNames = [
    'print',
];
const userDefinedFunctionNames = [];
const userDefinedVariableNames = [];
var NodeType;
(function (NodeType) {
    NodeType["FunctionDeclaration"] = "FunctionDeclaration";
    NodeType["FunctionParameter"] = "FunctionParameter";
    NodeType["FunctionBody"] = "FunctionBody";
    NodeType["FunctionCall"] = "FunctionCall";
    NodeType["VariableDeclaration"] = "VariableDeclaration";
    NodeType["Variable"] = "Variable";
    NodeType["Operator"] = "Operator";
    NodeType["BinaryOperation"] = "BinaryOperation";
    NodeType["Type"] = "Type";
    NodeType["LiteralNumber"] = "LiteralNumber";
    NodeType["LiteralString"] = "LiteralString";
    NodeType["LiteralBoolean"] = "LiteralBoolean";
    NodeType["ReturnExpression"] = "ReturnExpression";
    NodeType["Assignment"] = "Assignment";
    NodeType["IfStatement"] = "IfStatement";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
const operatorTokens = [
    scanner_1.TokenType.Plus,
    scanner_1.TokenType.Minus,
    scanner_1.TokenType.Star,
    scanner_1.TokenType.Slash,
    scanner_1.TokenType.Equal,
    scanner_1.TokenType.EqualEqual,
    scanner_1.TokenType.GreaterThan,
    scanner_1.TokenType.LessThan,
];
const blockStatements = [
    NodeType.IfStatement,
];
class Node {
}
exports.Node = Node;
class FunctionDeclarationNode extends Node {
    constructor(name, parameters, returnType, body) {
        super();
        this.nodeType = NodeType.FunctionDeclaration;
        userDefinedFunctionNames.push(name);
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.body = body;
    }
}
exports.FunctionDeclarationNode = FunctionDeclarationNode;
class FunctionParameterNode extends Node {
    constructor(name, type) {
        super();
        this.nodeType = NodeType.FunctionParameter;
        this.name = name;
        this.type = type;
    }
    setValue(value) {
        this.value = value;
    }
}
exports.FunctionParameterNode = FunctionParameterNode;
class FunctionBodyNode extends Node {
    constructor(statements) {
        super();
        this.nodeType = NodeType.FunctionBody;
        this.statements = statements;
    }
}
exports.FunctionBodyNode = FunctionBodyNode;
class TypeNode extends Node {
    constructor(name) {
        super();
        this.nodeType = NodeType.Type;
        this.name = name;
    }
}
exports.TypeNode = TypeNode;
class FunctionCallNode extends Node {
    constructor(name, args) {
        super();
        this.nodeType = NodeType.FunctionCall;
        this.name = name;
        this.arguments = args;
    }
}
exports.FunctionCallNode = FunctionCallNode;
class LiteralNumberNode extends Node {
    constructor(value) {
        super();
        this.nodeType = NodeType.LiteralNumber;
        this.value = value;
    }
}
exports.LiteralNumberNode = LiteralNumberNode;
class LiteralStringNode extends Node {
    constructor(value) {
        super();
        this.nodeType = NodeType.LiteralString;
        this.value = value;
    }
}
exports.LiteralStringNode = LiteralStringNode;
class LiteralBooleanNode extends Node {
    constructor(value) {
        super();
        this.nodeType = NodeType.LiteralBoolean;
        this.value = value;
    }
}
exports.LiteralBooleanNode = LiteralBooleanNode;
class VariableDeclarationNode extends Node {
    constructor(name, type, initialValue) {
        super();
        this.nodeType = NodeType.VariableDeclaration;
        this.name = name;
        this.type = type;
        this.valueNode = initialValue;
        userDefinedVariableNames.push(name);
    }
}
exports.VariableDeclarationNode = VariableDeclarationNode;
class VariableNode extends Node {
    constructor(name, type, value) {
        super();
        this.nodeType = NodeType.Variable;
        this.name = name;
        this.type = type;
        this.value = value;
    }
}
exports.VariableNode = VariableNode;
class OperatorNode extends Node {
    constructor(operator) {
        super();
        this.nodeType = NodeType.Operator;
        this.operator = operator;
    }
}
class BinaryOperationNode extends Node {
    constructor(left, operator, right) {
        super();
        this.nodeType = NodeType.BinaryOperation;
        this.leftOperand = left;
        this.operator = operator;
        this.rightOperand = right;
    }
}
exports.BinaryOperationNode = BinaryOperationNode;
class ReturnExpressionNode extends Node {
    constructor(expression) {
        super();
        this.nodeType = NodeType.ReturnExpression;
        this.expression = expression;
    }
}
exports.ReturnExpressionNode = ReturnExpressionNode;
class AssignmentNode extends Node {
    constructor(variable, expression) {
        super();
        this.nodeType = NodeType.Assignment;
        this.variable = variable;
        this.expression = expression;
    }
}
exports.AssignmentNode = AssignmentNode;
class IfStatementNode extends Node {
    constructor(condition, body) {
        super();
        this.nodeType = NodeType.IfStatement;
        this.condition = condition;
        this.body = body;
    }
}
exports.IfStatementNode = IfStatementNode;
class Parser {
    constructor(scanner) {
        this.scanner = scanner;
    }
    parseAll() {
        const ast = [];
        while (this.peek().type !== scanner_1.TokenType.EOF) {
            const node = this.parse();
            ast.push(node);
        }
        return ast;
    }
    parse() {
        const token = this.peek();
        switch (token.type) {
            case scanner_1.TokenType.Function:
                return this.parseFunctionDeclaration();
            case scanner_1.TokenType.Identifier:
            case scanner_1.TokenType.Keyword:
                return this.parseStatement([]);
            default:
                throw new Error(`Unexpected token type: ${token.type} ("${token.value}")`);
        }
    }
    parseStatement(localVariables) {
        const expression = this.parseExpression(localVariables);
        if (blockStatements.includes(expression.nodeType)) {
            return expression;
        }
        this.consumeType(scanner_1.TokenType.Semicolon);
        return expression;
    }
    parseExpression(availableVariables) {
        const token = this.peek();
        switch (token.type) {
            case scanner_1.TokenType.Identifier:
                if (this.isFunctionName(token)) {
                    return this.parseFunctionCall(availableVariables);
                }
                if (this.isVariableName(token, availableVariables)) {
                    const nextToken = this.peek(2);
                    if (!operatorTokens.includes(nextToken.type)) {
                        return this.parseVariable();
                    }
                    if (nextToken.type === scanner_1.TokenType.Equal) {
                        return this.parseAssignment(availableVariables);
                    }
                    return this.parseMathExpression(availableVariables);
                }
                throw new Error(`Unexpected identifier: "${token.value}"`);
            case scanner_1.TokenType.Number:
            case scanner_1.TokenType.String:
                const nextToken = this.peek(2);
                if (operatorTokens.includes(nextToken.type)) {
                    return this.parseMathExpression(availableVariables);
                }
                return this.parseLiteral();
            case scanner_1.TokenType.Keyword:
                if (this.isBooleanLiteral(token)) {
                    return this.parseBooleanLiteral();
                }
                if (this.isReturnExpression(token)) {
                    return this.parseReturnExpression(availableVariables);
                }
                if (this.isIfStatement(token)) {
                    return this.parseIfStatement(availableVariables);
                }
                return this.parseVariableDeclaration(availableVariables);
            default:
                throw new Error(`Unexpected token type in expression: ${token.type} ("${token.value}")`);
        }
    }
    parseBooleanLiteral() {
        const token = this.consumeType(scanner_1.TokenType.Keyword);
        if (token.value === 'true') {
            return new LiteralBooleanNode(true);
        }
        else if (token.value === 'false') {
            return new LiteralBooleanNode(false);
        }
        else {
            throw new Error(`Unexpected boolean literal value: "${token.value}"`);
        }
    }
    isBooleanLiteral(token) {
        return token.type == scanner_1.TokenType.Keyword
            && (token.value === 'true' || token.value === 'false');
    }
    parseIfStatement(availableVariables) {
        this.consumeType(scanner_1.TokenType.Keyword);
        this.consumeType(scanner_1.TokenType.OpenParen);
        const condition = this.parseExpression(availableVariables);
        this.consumeType(scanner_1.TokenType.CloseParen);
        const bodyStatements = [];
        this.consumeType(scanner_1.TokenType.OpenBrace);
        while (this.peek().type !== scanner_1.TokenType.CloseBrace) {
            const statement = this.parseStatement(availableVariables);
            bodyStatements.push(statement);
        }
        this.consumeType(scanner_1.TokenType.CloseBrace);
        const body = new FunctionBodyNode(bodyStatements);
        return new IfStatementNode(condition, body);
    }
    isIfStatement(token) {
        return token.type == scanner_1.TokenType.Keyword && (token.value === 'if');
    }
    parseReturnExpression(availableVariables) {
        this.consumeType(scanner_1.TokenType.Keyword);
        const expression = this.parseExpression(availableVariables);
        return new ReturnExpressionNode(expression);
    }
    isReturnExpression(token) {
        return token.type == scanner_1.TokenType.Keyword
            && (token.value === 'return');
    }
    parseMathExpression(availableVariables) {
        const leftNode = this.parseTerm(availableVariables);
        const nextToken = this.peek();
        if (nextToken.type === scanner_1.TokenType.Plus) {
            this.consumeType(scanner_1.TokenType.Plus);
            const rightNode = this.parseMathExpression(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('+'), rightNode);
        }
        else if (nextToken.type === scanner_1.TokenType.Minus) {
            this.consumeType(scanner_1.TokenType.Minus);
            const rightNode = this.parseMathExpression(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('-'), rightNode);
        }
        else if (nextToken.type === scanner_1.TokenType.EqualEqual) {
            this.consumeType(scanner_1.TokenType.EqualEqual);
            const rightNode = this.parseMathExpression(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('=='), rightNode);
        }
        else if (nextToken.type === scanner_1.TokenType.GreaterThan) {
            this.consumeType(scanner_1.TokenType.GreaterThan);
            const rightNode = this.parseMathExpression(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('>'), rightNode);
        }
        else if (nextToken.type === scanner_1.TokenType.LessThan) {
            this.consumeType(scanner_1.TokenType.LessThan);
            const rightNode = this.parseMathExpression(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('<'), rightNode);
        }
        return leftNode;
    }
    parseTerm(availableVariables) {
        const leftNode = this.parseFactor(availableVariables);
        const nextToken = this.peek();
        if (nextToken.type === scanner_1.TokenType.Star) {
            this.consumeType(scanner_1.TokenType.Star);
            const rightNode = this.parseFactor(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('*'), rightNode);
        }
        else if (nextToken.type === scanner_1.TokenType.Slash) {
            this.consumeType(scanner_1.TokenType.Slash);
            const rightNode = this.parseFactor(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('/'), rightNode);
        }
        return leftNode;
    }
    parseFactor(availableVariables) {
        if (this.isVariable()) {
            return this.parseVariable();
        }
        return this.parseLiteral();
    }
    isVariableName(token, availableVariables) {
        return token.type == scanner_1.TokenType.Identifier
            && (availableVariables.includes(token.value)
                || userDefinedVariableNames.includes(token.value));
    }
    parseLiteral() {
        const token = this.peek();
        switch (token.type) {
            case scanner_1.TokenType.Number:
                this.consumeType(scanner_1.TokenType.Number);
                return new LiteralNumberNode(parseInt(token.value));
            case scanner_1.TokenType.String:
                this.consumeType(scanner_1.TokenType.String);
                return new LiteralStringNode(token.value);
            case scanner_1.TokenType.Keyword:
                if (this.isBooleanLiteral(token)) {
                    return this.parseBooleanLiteral();
                }
            default:
                throw new Error(`Uknown literal type ${token.type} ("${token.value}")`);
        }
    }
    isVariable() {
        return this.peek().type === scanner_1.TokenType.Identifier;
    }
    parseAssignment(availableVariables) {
        const variable = this.parseVariable();
        this.consumeType(scanner_1.TokenType.Equal);
        const rightValue = this.parseExpression(availableVariables);
        return new AssignmentNode(variable, rightValue);
    }
    parseVariable() {
        const token = this.consumeType(scanner_1.TokenType.Identifier);
        return new VariableNode(token.value, new TypeNode('int'));
    }
    parseVariableDeclaration(availableVariables) {
        if (this.peek().type !== scanner_1.TokenType.Keyword || this.peek().value !== 'var') {
            throw new Error(`Expected 'var' keyword but got ${this.peek().value}`);
        }
        this.consumeType(scanner_1.TokenType.Keyword);
        const nameToken = this.consumeType(scanner_1.TokenType.Identifier);
        if (this.peek().type === scanner_1.TokenType.Equal) {
            this.consumeType(scanner_1.TokenType.Equal);
            const initialValue = this.parseExpression(availableVariables);
            return new VariableDeclarationNode(nameToken.value, new TypeNode('implied'), initialValue);
        }
        return new VariableDeclarationNode(nameToken.value, new TypeNode('undefined'));
    }
    parseFunctionCall(availableVariables) {
        const nameToken = this.consumeType(scanner_1.TokenType.Identifier);
        this.consumeType(scanner_1.TokenType.OpenParen);
        const args = [];
        while (this.peek().type !== scanner_1.TokenType.CloseParen) {
            const argument = this.parseExpression(availableVariables);
            args.push(argument);
            if (this.peek().type === scanner_1.TokenType.Comma) {
                this.consumeType(scanner_1.TokenType.Comma);
            }
        }
        this.consumeType(scanner_1.TokenType.CloseParen);
        return new FunctionCallNode(nameToken.value, args);
    }
    isFunctionName(token) {
        return token.type == scanner_1.TokenType.Identifier
            && (builtInFunctionNames.includes(token.value)
                || userDefinedFunctionNames.includes(token.value));
    }
    parseFunctionDeclaration() {
        this.consumeType(scanner_1.TokenType.Function);
        const nameToken = this.consumeType(scanner_1.TokenType.Identifier);
        const parameters = this.parseFunctionParameters();
        const returnType = this.parseFunctionReturnType();
        const body = this.parseFunctionBody(parameters);
        return new FunctionDeclarationNode(nameToken.value, parameters, returnType, body);
    }
    parseFunctionParameters() {
        const parameters = [];
        this.consumeType(scanner_1.TokenType.OpenParen);
        while (this.peek().type !== scanner_1.TokenType.CloseParen) {
            const parameter = this.parseOneFunctionParameter();
            parameters.push(parameter);
            if (this.peek().type === scanner_1.TokenType.Comma) {
                this.consumeType(scanner_1.TokenType.Comma);
            }
        }
        this.consumeType(scanner_1.TokenType.CloseParen);
        return parameters;
    }
    parseOneFunctionParameter() {
        const typeToken = this.consumeType(scanner_1.TokenType.Type);
        const typeNode = new TypeNode(typeToken.value);
        const nameToken = this.consumeType(scanner_1.TokenType.Identifier);
        return new FunctionParameterNode(nameToken.value, typeNode);
    }
    parseFunctionReturnType() {
        this.consumeType(scanner_1.TokenType.Colon);
        const typeToken = this.consumeType(scanner_1.TokenType.Type);
        return new TypeNode(typeToken.value);
    }
    parseFunctionBody(params) {
        this.consumeType(scanner_1.TokenType.OpenBrace);
        const statements = [];
        const localVariables = params.map(p => p.name);
        while (this.peek().type !== scanner_1.TokenType.CloseBrace) {
            const statement = this.parseStatement(localVariables);
            statements.push(statement);
        }
        this.consumeType(scanner_1.TokenType.CloseBrace);
        return new FunctionBodyNode(statements);
    }
    consumeType(expectedType) {
        const token = this.consume();
        if (token.type !== expectedType) {
            throw new Error(`Expected token type ${expectedType} but got ${token.type} ("${token.value}")`);
        }
        return token;
    }
    reset() {
        this.scanner.reset();
    }
    consume() {
        return this.scanner.scan();
    }
    peek(lookahead = 1) {
        return this.scanner.peek(lookahead);
    }
}
exports.Parser = Parser;
