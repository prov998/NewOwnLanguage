import { SyntaxToken, TokenKind } from "./lexer";

export function NewLineCheck(token:SyntaxToken){
    if(token.Kind != TokenKind.NewLineToken && token.Kind != TokenKind.EndOfFile){
        throw new Error("改行が必要");
    }
}

export function IdentCheck(token:SyntaxToken){
    if(token.Kind != TokenKind.IdentToken){
        throw new Error("識別子が必要");
    }
}

export function AssignCheck(token:SyntaxToken){
    if(token.Kind != TokenKind.AssignToken){
        throw new Error("=が必要");
    }
}

export function NumberCheck(token:SyntaxToken){
    if(token.Kind != TokenKind.NumberToken){
        throw new Error("数字が必要");
    }
}