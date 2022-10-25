import { CompilerBuilder } from "./compilerBuilder";
import { DrawByteCode } from "./DrawByteCodes";
import { AssignCheck, IdentCheck, NewLineCheck, NumberCheck } from "./errors";
import { SyntaxToken, TokenKind } from "./lexer";
import { _nameTable } from "./main";
import { NameTable } from "./nameTable";
import { VirtualMachine } from "./virtualMachine";

export enum InterTokenKind{
    "wrt", //Write
    "lit", //Number or literal 
    "num", 
    "add",
    "neg",
    "mul",
    "sub",
    "div",
    "per",
    "sem",
    "wrl",
    "ass",
    "ide",
    "lod",
    "sto",
    "ict",
    "jpc",
    "eql",
    "neql",
    "grt",
    "lss",
    "greq",
    "lseq",
    "str",
    "dlt",
    "jmp",//無条件飛び越し
}

export class InterToken{
    public kind:InterTokenKind;
    public text:string;
    public value:number|null;
    public index:number;
    public static called:number = 0;
    constructor(kind:InterTokenKind,text:string,value:number|null,index=0){
        this.kind = kind;
        this.text = text;
        this.value = value;
        this.index = index;
    }
}

//字句解析→中間言語

export class Compiler{
    private code:SyntaxToken[];
    private _index = -1; //トークンのインデックス
    private compilerBuilder = new CompilerBuilder();
    private else_jump:number[][] = [[0]]
    private jump_incriment:number = 0;
    public result_codes:InterToken[] = [];
    constructor(code:SyntaxToken[]){
        this.code = code;
        this.NextToken();
        this.Compile();
    }

    private NextToken(){ //現在読んでいるトークンの次のトークン
        this._index++;
    }

    private Current(){
        if(this._index >= this.code.length)return new SyntaxToken(TokenKind.EndOfFile,"",null);
        return this.code[this._index];
    }

    private checkGet(token:SyntaxToken,kind:number){
        if(TokenKind[token.Kind] == TokenKind[kind]) return true;
        return false;
    }

    private EnsureToken(except_kind:TokenKind){
        if(this.Current().Kind != except_kind){
            console.log("Error you need ",except_kind);
            throw new Error();
        }
    }

    private Compile(){
        while(true){
            this.CompileBlock();
            if(this.Current().Kind == TokenKind.EndOfFile) break;
        }
        this.result_codes = this.compilerBuilder.getCode()
    }
    

    private CompileBlock(){
        while(true){
        switch(this.Current().Kind){
            case TokenKind.VarToken:
                this.NextToken();
                this.CompilerVarDecl();
                continue;
            case TokenKind.ConstToken:
                this.NextToken();
                this.CompileConstDecl();
                continue;
            case TokenKind.NewLineToken:
                this.NextToken();
                continue;
            default:
                break;
        }
        break;
        }
        //this.compilerBuilder.EmitIct(_nameTable.localAddress);
        this.CompilerStatement();
    }

    private CompilerStatement(){
        switch(this.Current().Kind){
            case TokenKind.Write:
                this.NextToken();
                this.CompileWrite();
                break;
            case TokenKind.WriteLn:
                this.NextToken();
                this.CompileWriteLn();
                break;
            case TokenKind.IdentToken:
                const name = this.Current().Text;
                this.NextToken();
                this.CompileAssign(name);
                break;
            case TokenKind.IfToken:
                this.NextToken();
                this.CompileIf();
                break;
            case TokenKind.WhileToken:
                this.NextToken();
                this.CompileWhile();
                break;
            default:
                break;
        }
    }

    private CompilerVarDecl(){
        var var_counted:number = 0;
        while(true){
            IdentCheck(this.Current())
            const name = this.Current().Text;
            _nameTable.addVar(name);
            var_counted++;
            this.NextToken();
            if(this.Current().Kind == TokenKind.CommaToken){
                this.NextToken();
                continue;
            }
             //宣言と代入文の併用
            if(this.Current().Kind == TokenKind.AssignToken){
                while(true){
                    const new_name = _nameTable.getCodeByOffset(var_counted); 
                    this.NextToken();
                    this.CompileExpression();
                    this.compilerBuilder.EmitIde(new_name);
                    this.compilerBuilder.EmitAss(); 
                    var_counted--;
                    if(this.Current().Kind == TokenKind.CommaToken){
                        continue;
                    }
                    if(var_counted != 0) throw new Error("NumbersError")
                    break;
                }
            }
            NewLineCheck(this.Current());
            this.NextToken();
            break;
        }
    }

    private CompileConstDecl(){
        var const_counted:number = 0;
        while(true){
            IdentCheck(this.Current())
            const name = this.Current().Text;
            _nameTable.addConst(name);
            const_counted++;
            this.NextToken();
            if(this.Current().Kind == TokenKind.CommaToken){
                this.NextToken();
                continue;
            }
            AssignCheck(this.Current())
            while(true){
                const new_name = _nameTable.getCodeByOffset(const_counted); 
                this.NextToken();
                this.CompileExpression();
                console.log(this.Current())
                this.compilerBuilder.EmitIde(new_name);
                this.compilerBuilder.EmitAss(); 
                const_counted--;
                if(this.Current().Kind == TokenKind.CommaToken){
                    continue;
                }
                if(const_counted != 0) throw new Error("NumbersError")
                break;
            }
            NewLineCheck(this.Current());
            this.NextToken();
            break;
        }
    }

    private CompileIdentFilter(name:string){
        const entry = _nameTable.search(name);
        if(entry === null) throw new Error(`${name}は未定義です`);
        switch(entry.kind){
            case TokenKind.VarToken:
                //this.compilerBuilder.EmitLod(entry.level,entry.relAddress);
                break;
            case TokenKind.ConstToken:
                break;
            default:
                throw new Error("未定義の識別子です");
        }
        return entry;
    }

    private CompileAssign(name:string){
        const entry = _nameTable.search(name);
        if(entry === null) throw new Error(`${name}は未定義です`);
        if(entry?.kind === TokenKind.ConstToken) throw new Error("定数に代入することはできません")
        AssignCheck(this.Current());
        this.NextToken();
        this.CompileExpression();
        this.compilerBuilder.EmitIde(name);
        this.compilerBuilder.EmitAss(); 
        //this.compilerBuilder.EmitSto(entry.level,entry.relAddress)
        this.NextToken();
    }

    private CompileWrite(){
        this.CompileExpression();
        this.compilerBuilder.EmitWrt();
        NewLineCheck(this.Current());
        this.NextToken()
    }

    private CompileWriteLn(){
        this.CompileExpression();
        this.compilerBuilder.EmitWrtLn();
        NewLineCheck(this.Current());
        this.NextToken()
    }

    private TokenNextNewLine(){
        this.NextToken();
        NewLineCheck(this.Current());
        this.NextToken();
    }

    private CompileIf(){
        var hasElif = false;
        this.CompileCondition();
        if(this.Current().Kind != TokenKind.ThenToken) throw new Error("thenが必要です");
        this.TokenNextNewLine();
        var jpcInst = this.compilerBuilder.EmitJpc(0);
        var ElseJpcInst = 0;
        while(true){
            this.CompileBlock();
            if(this.Current().Kind == TokenKind.ElifToken){
                hasElif = true;
                var to_else_from_elif = this.compilerBuilder.EmitJmp(0);
                this.else_jump[this.else_jump.length-1][this.jump_incriment++] = to_else_from_elif;
                this.compilerBuilder.BackPatch(jpcInst,this.compilerBuilder.getCurrentIndex());
                this.NextToken();
                this.CompileIf();
                break;
            }
            if(this.Current().Kind == TokenKind.ElseToken){
                ElseJpcInst = this.compilerBuilder.EmitJmp(0);
                this.compilerBuilder.BackPatch(jpcInst,this.compilerBuilder.getCurrentIndex());
                this.TokenNextNewLine();
                var else_index = this.CompileElse();
                this.compilerBuilder.BackPatch(ElseJpcInst,else_index);
                break;
            }
            if(this.Current().Kind == TokenKind.EndToken){
                this.compilerBuilder.BackPatch(jpcInst,this.compilerBuilder.getCurrentIndex());
                break;
            }
        }
        this.NextToken()
        if(hasElif){
            this.else_jump[this.else_jump.length-1].forEach(index=>{
                this.compilerBuilder.BackPatch(index,this.compilerBuilder.getCurrentIndex())
            })
        }
    }

    private CompileElse(){
        while(true){
            this.CompileBlock();
            if(this.Current().Kind == TokenKind.EndToken){
                return this.compilerBuilder.getCurrentIndex();
            }
        }
    }

    private CompileWhile(){
        var while_back_to = this.compilerBuilder.getCurrentIndex();
        this.CompileCondition();
        this.EnsureToken(TokenKind.DoToken);
        this.TokenNextNewLine();
        const whileJpcInct = this.compilerBuilder.EmitJpc(0);
        while(true){
            this.CompileBlock();
            if(this.Current().Kind == TokenKind.WhendToken){
                var while_back = this.compilerBuilder.EmitJmp(whileJpcInct);
                this.compilerBuilder.BackPatch(while_back,while_back_to);
                this.compilerBuilder.BackPatch(whileJpcInct,this.compilerBuilder.getCurrentIndex());
                this.NextToken();
                return;
            }
        }
    }

    private CompileCondition(){
        this.CompileExpression();
        var comp = this.Current().Kind;
        this.NextToken();
        this.CompileExpression();
        switch(comp){
            case TokenKind.EqualToken:
                this.compilerBuilder.EmitOprEqr();
                break;
            case TokenKind.NotEqualToken:
                this.compilerBuilder.EmitOprNotEqr();
                break;
            case TokenKind.GreaterToken:
                this.compilerBuilder.EmitOprGrt();
                break;
            case TokenKind.GreatEqualToken:
                this.compilerBuilder.EmitOprGreq();
                break;
            case TokenKind.LesserToken:
                this.compilerBuilder.EmitOprLss();
                break;
            case TokenKind.LessEqualToken:
                this.compilerBuilder.EmitOprLseq();
                break;
        }
    }

    private CompileExpression(){ //式のコンパイル
        let shouldEmitNeg = false; //マイナスにすべきかどうか

        switch(this.Current().Kind){ //単項演算子の処理
            case TokenKind.PlusToken:
                this.NextToken();
                break;
            case TokenKind.MinusToken:
                shouldEmitNeg = true;
                this.NextToken();
                break;
            default:
                break;
        }

        this.CompilerTerm();
        if(shouldEmitNeg == true) this.compilerBuilder.EmitOprNeg();

        //中間演算子の処理
        while(true){
            switch(this.Current().Kind){
                case TokenKind.PlusToken:
                    this.NextToken();
                    this.CompilerTerm();
                    this.compilerBuilder.EmitOprAdd();
                    continue;
                case TokenKind.MinusToken:
                    this.NextToken();
                    this.CompilerTerm();
                    this.compilerBuilder.EmitOprSub();
                    continue;
            }
            break;
        }
    }

    private CompilerTerm(){ //項のコンパイル
        this.CompilerFactor();
        while(true){
            switch(this.Current().Kind){
                case TokenKind.MultiToken:
                    this.NextToken();
                    this.CompilerFactor();
                    this.compilerBuilder.EmitOprMul();
                    continue;
                case TokenKind.SlashToken:
                    this.NextToken();
                    this.CompilerFactor();
                    this.compilerBuilder.EmitOprDiv();
                    continue;
                case TokenKind.PercentToken:
                    this.NextToken();
                    this.CompilerFactor();
                    this.compilerBuilder.EmitOprPer();
                    continue;
            }
            break;
        }
    }

    private CompilerFactor(){ //因子のコンパイル
        switch(this.Current().Kind){
            case TokenKind.NumberToken:
                this.compilerBuilder.EmitLit(this.Current().Text,this.Current().Value);
                this.NextToken();
                return;
            case TokenKind.StringToken:
                this.compilerBuilder.EmitStr(this.Current().Text);
                this.NextToken();
                return;
            case TokenKind.LParenToken: 
                //this.compilerBuilder.EmitOprLParen();
                this.NextToken();
                this.CompileExpression();
                if(this.checkGet(this.Current(),TokenKind.RParenToken) == false){throw new Error("かっこを閉じてください");}
                else{
                    //this.compilerBuilder.EmitOprRParen();
                }
                this.NextToken()
                return; 
            case TokenKind.IdentToken:
                const name = this.Current().Text;
                this.NextToken();
                var ident = this.CompileIdentFilter(name);
                this.compilerBuilder.EmitLit(ident.name,ident.value);
                return;
            default:
                this.compilerBuilder.EmitLit(" ",null);
                this.NextToken();
                return;
        }

        throw new Error("Syntax Error");
    }
}