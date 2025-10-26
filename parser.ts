import { Scanner } from "./scanner";
import { TokenType, Token } from "./scanner";

const builtInFunctionNames = [
    'print',
];

const userDefinedFunctionNames = [];

const userDefinedVariableNames = [];

export enum NodeType {
    FunctionDeclaration = 'FunctionDeclaration',
    FunctionParameter = 'FunctionParameter',
    FunctionBody = 'FunctionBody',
    FunctionCall = 'FunctionCall',
    VariableDeclaration = 'VariableDeclaration',
    Variable = 'Variable',
    Operator = 'Operator',
    BinaryOperation = 'BinaryOperation',
    Type = 'Type',
    LiteralNumber = 'LiteralNumber',
    LiteralString = 'LiteralString',
    LiteralBoolean = 'LiteralBoolean',
    ReturnExpression = 'ReturnExpression',
    Assignment = 'Assignment',
    IfStatement = 'IfStatement',
}

const operatorTokens = [
    TokenType.Plus,
    TokenType.Minus,
    TokenType.Star,
    TokenType.Slash,
    TokenType.Equal,
    TokenType.EqualEqual,
];

const blockStatements = [
    NodeType.IfStatement,
];

export class Node {
    nodeType: NodeType;
}

export class FunctionDeclarationNode extends Node {
    name: string;
    parameters: FunctionParameterNode[];
    returnType: TypeNode;
    body: FunctionBodyNode;

    constructor(
        name: string, 
        parameters: FunctionParameterNode[], 
        returnType: TypeNode, 
        body: FunctionBodyNode
    ) {
        super();
        this.nodeType = NodeType.FunctionDeclaration;
        userDefinedFunctionNames.push(name);
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.body = body;
    }
}

export class FunctionParameterNode extends Node {
    name: string;
    type: TypeNode;
    value?: any;

    constructor(name: string, type: TypeNode) {
        super();
        this.nodeType = NodeType.FunctionParameter;
        this.name = name;
        this.type = type;
    }

    setValue(value: any) {
        this.value = value;
    }
}

export class FunctionBodyNode extends Node {
    statements: Node[];

    constructor(statements: Node[]) {
        super();
        this.nodeType = NodeType.FunctionBody;
        this.statements = statements;
    }
}

export class TypeNode extends Node {
    name: string;

    constructor(name: string) {
        super();
        this.nodeType = NodeType.Type;
        this.name = name;
    }
}

export class FunctionCallNode extends Node {
    name: string;
    arguments: Node[];

    constructor(name: string, args: Node[]) {
        super();
        this.nodeType = NodeType.FunctionCall;
        this.name = name;
        this.arguments = args;
    }
}

export class LiteralNumberNode extends Node {
    value: number;

    constructor(value: number) {
        super();
        this.nodeType = NodeType.LiteralNumber;
        this.value = value;
    }
}

export class LiteralStringNode extends Node {
    value: string;

    constructor(value: string) {
        super();
        this.nodeType = NodeType.LiteralString;
        this.value = value;
    }
}

export class LiteralBooleanNode extends Node {
    value: boolean;

    constructor(value: boolean) {
        super();
        this.nodeType = NodeType.LiteralBoolean;
        this.value = value;
    }
}

export class VariableDeclarationNode extends Node {
    name: string;
    type: TypeNode;
    valueNode?: Node;
    value?: any;


    constructor(name: string, type: TypeNode, initialValue?: Node) {
        super();
        this.nodeType = NodeType.VariableDeclaration;
        this.name = name;
        this.type = type;
        this.valueNode = initialValue;
        userDefinedVariableNames.push(name);
    }
}

export class VariableNode extends Node {
    name: string;
    value: any;
    type: TypeNode;

    constructor(name: string, type: TypeNode, value?: any) {
        super();
        this.nodeType = NodeType.Variable;
        this.name = name;
        this.type = type;
        this.value = value;
    }
}

class OperatorNode extends Node {
    operator: string;

    constructor(operator: string) {
        super();
        this.nodeType = NodeType.Operator;
        this.operator = operator;
    }
}

export class BinaryOperationNode extends Node {
    leftOperand: Node;
    operator: OperatorNode;
    rightOperand: Node;

    constructor(left: Node, operator: OperatorNode, right: Node) {
        super();
        this.nodeType = NodeType.BinaryOperation;
        this.leftOperand = left;
        this.operator = operator;
        this.rightOperand = right;
    }
}

export class ReturnExpressionNode extends Node {
    expression: Node;

    constructor(expression: Node) {
        super();
        this.nodeType = NodeType.ReturnExpression;
        this.expression = expression;
    }
}

export class AssignmentNode extends Node {
    variable: VariableNode;
    expression: Node;

    constructor(variable: VariableNode, expression: Node) {
        super();
        this.nodeType = NodeType.Assignment;
        this.variable = variable;
        this.expression = expression;
    }
}

export class IfStatementNode extends Node {
    condition: Node;
    body: FunctionBodyNode;

    constructor(condition: Node, body: FunctionBodyNode) {
        super();
        this.nodeType = NodeType.IfStatement;
        this.condition = condition;
        this.body = body;
    }
}

export class Parser {
    private scanner: Scanner;

    constructor(scanner: Scanner) {
        this.scanner = scanner;
    }

    public parseAll() {
        const ast: Node[] = [];

        while (this.peek().type !== TokenType.EOF) {
            const node = this.parse();
            ast.push(node);
        }

        return ast;
    }

    public parse(): Node {
        const token = this.peek();

        switch (token.type) {
            case TokenType.Function:
                return this.parseFunctionDeclaration();
            case TokenType.Identifier:
                return this.parseStatement([]);
            default:
                throw new Error(`Unexpected token type: ${token.type} ("${token.value}")`);
        }
    }

    private parseStatement(localVariables: Array<string>): Node {
        const expression = this.parseExpression(localVariables);
        if (blockStatements.includes(expression.nodeType)) {
            return expression;
        }
        this.consumeType(TokenType.Semicolon);
        return expression;
    }

    private parseExpression(availableVariables: Array<string>): Node {
        const token = this.peek();
        switch (token.type) {
            case TokenType.Identifier:
                if (this.isFunctionName(token)) {
                    return this.parseFunctionCall(availableVariables);
                }
                if (this.isVariableName(token, availableVariables)) {
                    const nextToken = this.peek(2);
                    if (!operatorTokens.includes(nextToken.type)) {
                        return this.parseVariable();
                    }
                    if (nextToken.type === TokenType.Equal) {
                        return this.parseAssignment(availableVariables);
                    }
                    return this.parseMathExpression(availableVariables);
                }
                throw new Error(`Unexpected identifier: "${token.value}"`);
            case TokenType.Number:
            case TokenType.String:
                const nextToken = this.peek(2);
                if (operatorTokens.includes(nextToken.type)) {
                    return this.parseMathExpression(availableVariables);
                }
                return this.parseLiteral();
            case TokenType.Keyword:
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

    private parseBooleanLiteral(): LiteralBooleanNode {
        const token = this.consumeType(TokenType.Keyword);
        if (token.value === 'true') {
            return new LiteralBooleanNode(true);
        } else if (token.value === 'false') {
            return new LiteralBooleanNode(false);
        } else {
            throw new Error(`Unexpected boolean literal value: "${token.value}"`);
        }
    }

    private isBooleanLiteral(token: Token): boolean {
        return token.type == TokenType.Keyword 
            && (token.value === 'true' || token.value === 'false');
    }

    private parseIfStatement(availableVariables: Array<string>): Node {
        this.consumeType(TokenType.Keyword); // consume 'if'
        this.consumeType(TokenType.OpenParen);
        const condition = this.parseExpression(availableVariables);
        this.consumeType(TokenType.CloseParen);
        const bodyStatements: Node[] = [];
        this.consumeType(TokenType.OpenBrace);
        while (this.peek().type !== TokenType.CloseBrace) {
            const statement = this.parseStatement(availableVariables);
            bodyStatements.push(statement);
        }
        this.consumeType(TokenType.CloseBrace);
        const body = new FunctionBodyNode(bodyStatements);
        return new IfStatementNode(condition, body);
    }

    private isIfStatement(token: Token): boolean {
        return token.type == TokenType.Keyword && (token.value === 'if');
    }

    private parseReturnExpression(availableVariables: Array<string>): ReturnExpressionNode {
        this.consumeType(TokenType.Keyword); // consume 'return'
        const expression = this.parseExpression(availableVariables);
        return new ReturnExpressionNode(expression);
    }

    private isReturnExpression(token: Token): boolean {
        return token.type == TokenType.Keyword 
            && (token.value === 'return');
    }

    private parseMathExpression(availableVariables: Array<string>): Node {
        const leftNode = this.parseTerm(availableVariables);
        const nextToken = this.peek();
        if (nextToken.type === TokenType.Plus) {
            this.consumeType(TokenType.Plus);
            const rightNode = this.parseMathExpression(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('+'), rightNode);
        } else if (nextToken.type === TokenType.Minus) {
            this.consumeType(TokenType.Minus);
            const rightNode = this.parseMathExpression(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('-'), rightNode);
        } else if (nextToken.type === TokenType.EqualEqual) {
            this.consumeType(TokenType.EqualEqual);
            const rightNode = this.parseMathExpression(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('=='), rightNode);
        }
        return leftNode;
    }

    private parseTerm(availableVariables: Array<string>): Node {
        const leftNode = this.parseFactor(availableVariables);
        const nextToken = this.peek();
        if (nextToken.type === TokenType.Star) {
            this.consumeType(TokenType.Star);
            const rightNode = this.parseFactor(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('*'), rightNode);    
        } else if (nextToken.type === TokenType.Slash) {
            this.consumeType(TokenType.Slash);
            const rightNode = this.parseFactor(availableVariables);
            return new BinaryOperationNode(leftNode, new OperatorNode('/'), rightNode);    
        }
        return leftNode;
    }

    private parseFactor(availableVariables: Array<string>): Node {
        if (this.isVariable()) {
            return this.parseVariable();
        }
        return this.parseLiteral();
    }

    private isVariableName(token: Token, availableVariables: Array<string>): boolean {
        return token.type == TokenType.Identifier 
            && (
                availableVariables.includes(token.value)
                || userDefinedVariableNames.includes(token.value)
            );
    }

    private parseLiteral(): Node {
        const token = this.peek();
        switch (token.type) {
            case TokenType.Number:
                this.consumeType(TokenType.Number);
                return new LiteralNumberNode(parseInt(token.value));
            case TokenType.String:
                this.consumeType(TokenType.String);
                return new LiteralStringNode(token.value);
            case TokenType.Keyword:
                if (this.isBooleanLiteral(token)) {
                    return this.parseBooleanLiteral();
                }
                // Fall through
            default:
                throw new Error(`Uknown literal type ${token.type} ("${token.value}")`);
        }
    }

    private isVariable(): boolean {
        return this.peek().type === TokenType.Identifier;
    }

    private parseAssignment(availableVariables: Array<string>): AssignmentNode {
        const variable = this.parseVariable();
        this.consumeType(TokenType.Equal);
        const rightValue = this.parseExpression(availableVariables);
        return new AssignmentNode(variable, rightValue);
    }

    private parseVariable(): VariableNode {
        const token = this.consumeType(TokenType.Identifier);
        return new VariableNode(token.value, new TypeNode('int'));
    }

    private parseVariableDeclaration(availableVariables: Array<string>): VariableDeclarationNode {
        if (this.peek().type !== TokenType.Keyword || this.peek().value !== 'var') {
            throw new Error(`Expected 'var' keyword but got ${this.peek().value}`);
        }
        this.consumeType(TokenType.Keyword); // consume 'var'
        const nameToken = this.consumeType(TokenType.Identifier);
        if (this.peek().type === TokenType.Equal) {
            this.consumeType(TokenType.Equal);
            const initialValue = this.parseExpression(availableVariables);
            return new VariableDeclarationNode(nameToken.value, new TypeNode('implied'), initialValue);
        }
        return new VariableDeclarationNode(nameToken.value, new TypeNode('undefined'));
    }

    private parseFunctionCall(availableVariables: Array<string>): FunctionCallNode {
        const nameToken = this.consumeType(TokenType.Identifier);
        this.consumeType(TokenType.OpenParen);
        const args: Node[] = [];
        while (this.peek().type !== TokenType.CloseParen) {
            const argument = this.parseExpression(availableVariables);
            args.push(argument);
            if (this.peek().type === TokenType.Comma) {
                this.consumeType(TokenType.Comma);
            }
        }
        this.consumeType(TokenType.CloseParen);
        return new FunctionCallNode(nameToken.value, args);
    }

    private isFunctionName(token: Token): boolean {
        return token.type == TokenType.Identifier 
            && (builtInFunctionNames.includes(token.value) 
                || userDefinedFunctionNames.includes(token.value));
    }

    private parseFunctionDeclaration(): FunctionDeclarationNode {
        this.consumeType(TokenType.Function);
        const nameToken = this.consumeType(TokenType.Identifier);
        const parameters = this.parseFunctionParameters();
        const returnType = this.parseFunctionReturnType();
        const body = this.parseFunctionBody(parameters);

        return new FunctionDeclarationNode(nameToken.value, parameters, returnType, body);
    }

    private parseFunctionParameters(): FunctionParameterNode[] {
        const parameters: FunctionParameterNode[] = [];

        this.consumeType(TokenType.OpenParen);
        while (this.peek().type !== TokenType.CloseParen) {
            const parameter = this.parseOneFunctionParameter();
            parameters.push(parameter);
            if (this.peek().type === TokenType.Comma) {
                this.consumeType(TokenType.Comma);
            }
        }    
        this.consumeType(TokenType.CloseParen);

        return parameters;
    }

    private parseOneFunctionParameter(): FunctionParameterNode {
        const typeToken = this.consumeType(TokenType.Type);
        const typeNode = new TypeNode(typeToken.value);
        const nameToken = this.consumeType(TokenType.Identifier);
        return new FunctionParameterNode(nameToken.value, typeNode);
    }

    private parseFunctionReturnType(): TypeNode {
        this.consumeType(TokenType.Colon);
        const typeToken = this.consumeType(TokenType.Type);
        return new TypeNode(typeToken.value);
    }

    private parseFunctionBody(params: FunctionParameterNode[]): FunctionBodyNode {
        this.consumeType(TokenType.OpenBrace);
        const statements: Node[] = [];
        const localVariables = params.map(p => p.name);
        while (this.peek().type !== TokenType.CloseBrace) {
            const statement = this.parseStatement(localVariables);
            statements.push(statement);
        }
        this.consumeType(TokenType.CloseBrace);
        return new FunctionBodyNode(statements);
    }

    private consumeType(expectedType: TokenType) {
        const token = this.consume();
        if (token.type !== expectedType) {
            throw new Error(`Expected token type ${expectedType} but got ${token.type} ("${token.value}")`);
        }
        return token;
    }

    public reset(): void {
        this.scanner.reset();
    }

    private consume() {
        return this.scanner.scan();
    }

    private peek(lookahead: number = 1) {
        return this.scanner.peek(lookahead);
    }
}