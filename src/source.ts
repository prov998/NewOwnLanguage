import { Lexer, SyntaxToken, TokenKind } from "./lexer";

export class Source{
    public text:string;
    private lexer;
    private tokens:SyntaxToken[];
    constructor(text:string){
        this.text = text;
        this.lexer = new Lexer(this.text);
        this.tokens = [];
    }

    public getTokens(){
        while(true){
            var token = this.lexer.nextToken();
            if(token.Kind != TokenKind.WhiteSpace &&
                token.Kind != TokenKind.BadToken &&
                token.Kind != TokenKind.EndOfFile)
                this.tokens.push(token);
            if(token.Kind == TokenKind.EndOfFile) break;
        }
        return this.tokens;
    }
}