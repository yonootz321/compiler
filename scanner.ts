export enum TokenType {
    Function = 'Function',
    Identifier = 'Identifier',
    Number = 'Number',
    String = 'String',
    Type = 'Type',
    Keyword = 'Keyword',
    Operator = 'Operator',
    Comma = 'Comma',
    Colon = 'Colon',
    Semicolon = 'Semicolon',
    OpenParen = 'OpenParen',
    CloseParen = 'CloseParen',
    OpenBrace = 'OpenBrace',
    CloseBrace = 'CloseBrace',
    Equal = 'Equal',
    Plus = 'Plus',
    Minus = 'Minus',
    Star = 'Star',
    Slash = 'Slash',
    EOF = 'EOF',
}

const typeKeywords = [
    'int',
    'string',
];

const keywords = [
    'var',
    'function',
    'return',
]
    .concat(typeKeywords);

export class Token {
    type: TokenType;
    value: string;

    constructor(type: TokenType, value: string) {
        this.type = type;
        this.value = value;
    }
}

export class Scanner {
    private inputText: string;
    private pos: number;

    constructor(inputText: string) {
        this.pos = 0;
        this.inputText = inputText;
    }

    public peek(lookahead: number = 1): Token {
        const oldPos = this.pos;
        let token;
        for (let i = 0; i < lookahead; i++) {
            token = this.scan();
        }
        this.pos = oldPos;
        return token;
    }

    public scan(): Token {
        const inputText = this.inputText;
        while (this.pos < inputText.length) {
            const char = inputText[this.pos];

            // Skip whitespace
            if (/\s/.test(char)) {
                this.pos++;
                continue;
            }

            // Match numbers
            if (/\d/.test(char)) {
                let start = this.pos;
                while (this.pos < inputText.length && /\d/.test(inputText[this.pos])) {
                    this.pos++;
                }
                return new Token(TokenType.Number, inputText.slice(start, this.pos));
            }

            // Math comma
            if (char === ',') {
                this.pos++;
                return new Token(TokenType.Comma, ',');
            }

            // Match semicolon
            if (char === ';') {
                this.pos++;
                return new Token(TokenType.Semicolon, ';');
            }

            // Match open parentheses
            if (char === '(') {
                this.pos++;
                return new Token(TokenType.OpenParen, '(');
            }

            // Match close parentheses
            if (char === ')') {
                this.pos++;
                return new Token(TokenType.CloseParen, ')');
            }

            // Match open brace
            if (char === '{') {
                this.pos++;
                return new Token(TokenType.OpenBrace, '{');
            }

            // Match close brace
            if (char === '}') {
                this.pos++;
                return new Token(TokenType.CloseBrace, '}');
            }

            // Match colon
            if (char === ':') {
                this.pos++;
                return new Token(TokenType.Colon, ':');
            }

            // Match equal
            if (char === '=') {
                this.pos++;
                return new Token(TokenType.Equal, '=');
            }

            // Match plus
            if (char === '+') {
                this.pos++;
                return new Token(TokenType.Plus, '+');
            }

            // Match minus
            if (char === '-') {
                this.pos++;
                return new Token(TokenType.Minus, '-');
            }

            // Match star
            if (char === '*') {
                this.pos++;
                return new Token(TokenType.Star, '*');
            }

            // Match slash
            if (char === '/') {
                this.pos++;
                return new Token(TokenType.Slash, '/');
            }

            if (char === '"') {
                const start = this.pos + 1;
                let end = this.pos+1;
                while (end < inputText.length && inputText[end] !== '"') {
                    end++;
                }
                if (inputText[end] == '"') {
                    this.pos = end + 1;
                    return new Token(TokenType.String, inputText.substring(start, end));
                }
                throw new Error("Unterminated string");
            }

            // Match identifiers and keywords
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

    public scanAll(): Token[] {
        const inputText = this.inputText;
        const tokens: Token[] = [];

        let currentToken: Token = null;
        while (currentToken == null || currentToken.type !== TokenType.EOF) {
            currentToken = this.scan();
            tokens.push(currentToken);
        }
        return tokens;
    }

    public reset() {
        this.pos = 0;
    }

    private tokenizeKeyword(
        value: string
    ): Token {
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