"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = exports.Token = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType["Function"] = "Function";
    TokenType["Identifier"] = "Identifier";
    TokenType["Number"] = "Number";
    TokenType["String"] = "String";
    TokenType["Type"] = "Type";
    TokenType["Keyword"] = "Keyword";
    TokenType["Operator"] = "Operator";
    TokenType["Comma"] = "Comma";
    TokenType["Colon"] = "Colon";
    TokenType["Semicolon"] = "Semicolon";
    TokenType["OpenParen"] = "OpenParen";
    TokenType["CloseParen"] = "CloseParen";
    TokenType["OpenBrace"] = "OpenBrace";
    TokenType["CloseBrace"] = "CloseBrace";
    TokenType["EqualEqual"] = "EqualEqual";
    TokenType["Equal"] = "Equal";
    TokenType["Plus"] = "Plus";
    TokenType["Minus"] = "Minus";
    TokenType["Star"] = "Star";
    TokenType["Slash"] = "Slash";
    TokenType["GreaterThan"] = "GreaterThan";
    TokenType["LessThan"] = "LessThan";
    TokenType["EOF"] = "EOF";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
const typeKeywords = [
    'int',
    'string',
    'bool',
];
const keywords = [
    'var',
    'function',
    'return',
    'if',
    'true',
    'false',
]
    .concat(typeKeywords);
class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}
exports.Token = Token;
class Scanner {
    constructor(inputText) {
        this.pos = 0;
        this.inputText = inputText;
    }
    peek(lookahead = 1) {
        const oldPos = this.pos;
        let token;
        for (let i = 0; i < lookahead; i++) {
            token = this.scan();
        }
        this.pos = oldPos;
        return token;
    }
    scan() {
        const inputText = this.inputText;
        while (this.pos < inputText.length) {
            const char = inputText[this.pos];
            const nextChar = inputText[this.pos + 1];
            if (/\s/.test(char)) {
                this.pos++;
                continue;
            }
            if (/\d/.test(char)) {
                let start = this.pos;
                while (this.pos < inputText.length && /\d/.test(inputText[this.pos])) {
                    this.pos++;
                }
                return new Token(TokenType.Number, inputText.slice(start, this.pos));
            }
            if (char === ',') {
                this.pos++;
                return new Token(TokenType.Comma, ',');
            }
            if (char === ';') {
                this.pos++;
                return new Token(TokenType.Semicolon, ';');
            }
            if (char === '(') {
                this.pos++;
                return new Token(TokenType.OpenParen, '(');
            }
            if (char === ')') {
                this.pos++;
                return new Token(TokenType.CloseParen, ')');
            }
            if (char === '{') {
                this.pos++;
                return new Token(TokenType.OpenBrace, '{');
            }
            if (char === '}') {
                this.pos++;
                return new Token(TokenType.CloseBrace, '}');
            }
            if (char === ':') {
                this.pos++;
                return new Token(TokenType.Colon, ':');
            }
            if (char === '=') {
                if (nextChar === '=') {
                    this.pos += 2;
                    return new Token(TokenType.EqualEqual, '==');
                }
                this.pos++;
                return new Token(TokenType.Equal, '=');
            }
            if (char === '+') {
                this.pos++;
                return new Token(TokenType.Plus, '+');
            }
            if (char === '-') {
                this.pos++;
                return new Token(TokenType.Minus, '-');
            }
            if (char === '*') {
                this.pos++;
                return new Token(TokenType.Star, '*');
            }
            if (char === '/') {
                this.pos++;
                return new Token(TokenType.Slash, '/');
            }
            if (char === '>') {
                this.pos++;
                return new Token(TokenType.GreaterThan, '>');
            }
            if (char === '<') {
                this.pos++;
                return new Token(TokenType.LessThan, '<');
            }
            if (char === '"') {
                const start = this.pos + 1;
                let end = this.pos + 1;
                while (end < inputText.length && inputText[end] !== '"') {
                    end++;
                }
                if (inputText[end] == '"') {
                    this.pos = end + 1;
                    return new Token(TokenType.String, inputText.substring(start, end));
                }
                throw new Error("Unterminated string");
            }
            if (/[a-zA-Z_]/.test(char)) {
                let start = this.pos;
                while (this.pos < inputText.length && /[a-zA-Z0-9_]/.test(inputText[this.pos])) {
                    this.pos++;
                }
                const value = inputText.slice(start, this.pos);
                if (keywords.includes(value)) {
                    return this.tokenizeKeyword(value);
                }
                return new Token(TokenType.Identifier, value);
            }
            console.log('Unexpected character: ', char);
            this.pos++;
        }
        return new Token(TokenType.EOF, "");
    }
    scanAll() {
        const inputText = this.inputText;
        const tokens = [];
        let currentToken = null;
        while (currentToken == null || currentToken.type !== TokenType.EOF) {
            currentToken = this.scan();
            tokens.push(currentToken);
        }
        return tokens;
    }
    reset() {
        this.pos = 0;
    }
    tokenizeKeyword(value) {
        switch (value) {
            case 'function':
                return new Token(TokenType.Function, value);
            default:
                if (typeKeywords.includes(value)) {
                    return new Token(TokenType.Type, value);
                }
                return new Token(TokenType.Keyword, value);
        }
    }
}
exports.Scanner = Scanner;
