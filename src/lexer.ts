import { IsDight, IsIdentChar, IsIdentStartChar, IsWhiteSpace } from "./util";

export enum TokenKind{
    NumberToken,
    BadToken,
    WhiteSpace,
    EndOfFile,

    NewLineToken,

    SemicolonToken,

    PlusToken,
    MinusToken,
    MultiToken,
    SlashToken,
    PercentToken,
    LParenToken,
    RParenToken,

    CommaToken,

    IdentToken,

    VarToken,
    ConstToken,
    AssignToken,

    IfToken,
    ElifToken,
    ElseToken,

    EndToken,
    ThenToken,

    GreaterToken, //>
    LesserToken, //<

    GreatEqualToken, //>=
    LessEqualToken, //<=

    EqualToken, //==
    NotEqualToken, //!=

    Write,
    WriteLn,

    WhileToken,
    DoToken,
    WhendToken,

    DoubleQuotationToken,
    StringToken,
}

export class SyntaxToken{
    private kind:TokenKind;
    private text:string;
    private value:number|null;
    private level:number;
    private numParams:number;
    constructor(kind:TokenKind,text:string,value:number|null,level:number = 0,numParams:number = 0) {
        this.kind = kind;
        this.text = text;
        this.value = value;
        this.level = level;
        this.numParams = numParams;
    }

    
    public get Kind() : TokenKind{
        return this.kind;
    }
    
    public get Text() : string{
        return this.text;
    }

    public get Value() : number|null{
        return this.value;
    }

    
    public get Level() : number {
        return this.level;
    }
    
    public get NumParams():number{
        return this.numParams;
    }
}

export class Lexer{
    private _text:string;
    private _position:number;
    public code:SyntaxToken[] = new Array();
    constructor(text:string){
        this._text = text;
        this._position = 0;
    }

    private Current():string{
        if(this._position >= this._text.length) return '\0';

        return this._text[this._position];
    }

    private Next(){
        this._position++;
    }

    public nextToken():SyntaxToken{
        let text:string;
        if(this.Current() == '\n'){
            this.Next();
            return new SyntaxToken(TokenKind.NewLineToken,"",null);
        }
        if(IsDight(this.Current())){
            let start = this._position;
            while(IsDight(this.Current()))
                this.Next();

            let length = this._position - start;
            text= this._text.substr(start,length);
            let value = parseInt(text);
            return new SyntaxToken(TokenKind.NumberToken,text,value);
        }
        if(IsWhiteSpace(this.Current())){
            let start = this._position;
            while(IsWhiteSpace(this.Current())){
                this.Next();
            }
            let length = this._position - start;
            text= this._text.substr(start,length);

            return new SyntaxToken(TokenKind.WhiteSpace,text,null);
        }
        
        if(this.Current() == '"'){
            this.Next();
            let start = this._position;
            while(this.Current() != '"'){
                this.Next();
            }
            let length = this._position - start;
            text= this._text.substr(start,length);

            console.log(this.Current())
            this.Next();

            return new SyntaxToken(TokenKind.StringToken,text,null);
        }

        if(IsIdentStartChar(this.Current())){
            let start = this._position;
            while(IsIdentChar(this.Current())){
                this.Next();
            }
            let length = this._position - start;
            text= this._text.substr(start,length);
            if(text == "write") return new SyntaxToken(TokenKind.Write,text,null);
            if(text == "var") return new SyntaxToken(TokenKind.VarToken,text,null);
            if(text == "writeln") return new SyntaxToken(TokenKind.WriteLn,text,null);
            if(text == "const") return new SyntaxToken(TokenKind.ConstToken,text,null);
            if(text == "if") return new SyntaxToken(TokenKind.IfToken,text,null);
            if(text == "elif") return new SyntaxToken(TokenKind.ElifToken,text,null);
            if(text == "else") return new SyntaxToken(TokenKind.ElseToken,text,null);
            if(text == "then") return new SyntaxToken(TokenKind.ThenToken,text,null);
            if(text == "end") return new SyntaxToken(TokenKind.EndToken,text,null);
            if(text == "while") return new SyntaxToken(TokenKind.WhileToken,text,null);
            if(text == "do") return new SyntaxToken(TokenKind.DoToken,text,null);
            if(text == "whend") return new SyntaxToken(TokenKind.WhendToken,text,null);
            
            return new SyntaxToken(TokenKind.IdentToken,text,null);
        }

        if(this.Current() == "="){
            this.Next();
            if(this.Current() == "="){
                this.Next();
                return new SyntaxToken(TokenKind.EqualToken,"==",null);
            }
            return new SyntaxToken(TokenKind.AssignToken,"=",null);
        }

        if(this.Current() == ">"){
            this.Next();
            if(this.Current() == "="){
                this.Next();
                return new SyntaxToken(TokenKind.GreatEqualToken,">=",null);
            }
            return new SyntaxToken(TokenKind.GreaterToken,">",null);
        }

        if(this.Current() == "<"){
            this.Next();
            if(this.Current() == "="){
                this.Next();
                return new SyntaxToken(TokenKind.LessEqualToken,"<=",null);
            }
            return new SyntaxToken(TokenKind.LesserToken,">",null);
        }

        if(this.Current() == "!"){
            this.Next();
            if(this.Current() == "="){
                this.Next();
                return new SyntaxToken(TokenKind.NotEqualToken,"<=",null);
            }
            throw new Error("=が必要です");
        }

        if(this.Current() ==  "+"){
            this.Next();
            return new SyntaxToken(TokenKind.PlusToken,"+",null)
        };

        if(this.Current() ==  "-"){
            this.Next();
            return new SyntaxToken(TokenKind.MinusToken,"-",null)
        };

        if(this.Current() ==  "*"){
            this.Next();
            return new SyntaxToken(TokenKind.MultiToken,"*",null)
        };

        if(this.Current() ==  "/"){
            this.Next();
            return new SyntaxToken(TokenKind.SlashToken,"/",null)
        };

        if(this.Current() ==  "%"){
            this.Next();
            return new SyntaxToken(TokenKind.PercentToken,"/",null)
        };

        if(this.Current() ==  "("){
            this.Next();
            return new SyntaxToken(TokenKind.LParenToken,"(",null)
        };

        if(this.Current() ==  ")"){
            this.Next();
            return new SyntaxToken(TokenKind.RParenToken,")",null)
        };

        if(this.Current() == ";"){
            this.Next();
            return new SyntaxToken(TokenKind.SemicolonToken,";",null);
        }

        if(this.Current() == ","){
            this.Next();
            return new SyntaxToken(TokenKind.CommaToken,",",null);
        }

        if(this.Current()=='\0') return new SyntaxToken(TokenKind.EndOfFile,"",null);
        
        this.Next();
        return new SyntaxToken(TokenKind.BadToken,this._text.substr(this._position-1,1),null);
    }
}