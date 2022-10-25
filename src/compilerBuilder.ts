import { InterToken, InterTokenKind } from "./compiler";
import { SyntaxToken, TokenKind } from "./lexer";

export class CompilerBuilder{
    private code:InterToken[];
    private currentIndex:number;
    private opr_code:any[][]; //[[TokenKind,KindLank]]
    private opr_index:number = 0;
    
    constructor(){
        this.code = [];
        this.opr_code = [];
        this.currentIndex = 0;
    }

    public getCode(){
        return this.code;
    }

    public getCurrentIndex(){
        return this.currentIndex;
    }

    private Emit(code:InterToken){
        const index = this.currentIndex++;
        this.code[index] = code;
        return index;
    }

    public EmitLit(text:string,value:number|null){
        return this.Emit(new InterToken(InterTokenKind.lit,text,value));
    }

    public EmitLod(level:number,relAddress:number){
        return this.Emit(new InterToken(InterTokenKind.lod,"",null))
    }

    public EmitSto(level:number,relAddress:number){

    }

    public EmitIct(localAddress:number){

    }

    public EmitJmp(index:number){
        var now_index = this.currentIndex;
        this.Emit(new InterToken(InterTokenKind.jmp,"",null));
        return now_index
    }

    public EmitJpc(index:number){
        var now_index = this.currentIndex;
        this.Emit(new InterToken(InterTokenKind.jpc,"",null));
        return now_index
    }

    public BackPatch(jmpInstIndex:number,newIndex:number){
        this.code[jmpInstIndex].index = newIndex;
    }

    public EmitIde(text:string){
        return this.Emit(new InterToken(InterTokenKind.ide,text,null));
    }

    public EmitStr(text:string){
        return this.Emit(new InterToken(InterTokenKind.str,text,null));
    }

    public EmitAss(){
        return this.Emit(new InterToken(InterTokenKind.ass,"",null))
    }

    public EmitWrt(){
        return this.Emit(new InterToken(InterTokenKind.wrt,"",null));
    }

    public EmitWrtLn(){
        return this.Emit(new InterToken(InterTokenKind.wrl,"",null));
    }

    public EmitOprNotEqr(){
        return this.Emit(new InterToken(InterTokenKind.neql,"",null));
    }

    public EmitOprEqr(){
        return this.Emit(new InterToken(InterTokenKind.eql,"",null));
    }

    public EmitOprGrt(){
        return this.Emit(new InterToken(InterTokenKind.grt,"",null));
    }

    public EmitOprGreq(){
        return this.Emit(new InterToken(InterTokenKind.greq,"",null));
    }

    public EmitOprLss(){
        return this.Emit(new InterToken(InterTokenKind.lss,"",null));
    }

    public EmitOprLseq(){
        return this.Emit(new InterToken(InterTokenKind.lseq,"",null));
    }

    public EmitOprNeg(){
        return this.Emit(new InterToken(InterTokenKind.neg,"-",null));
    }

    public EmitOprAdd(){
        return this.Emit(new InterToken(InterTokenKind.add,"+",null));
    }

    public EmitOprSub(){
        return this.Emit(new InterToken(InterTokenKind.sub,"-",null));
    }

    public EmitOprMul(){
        return this.Emit(new InterToken(InterTokenKind.mul,"*",null));
    }

    public EmitOprDiv(){
        return this.Emit(new InterToken(InterTokenKind.div,"/",null));
    }

    public EmitOprPer(){
        return this.Emit(new InterToken(InterTokenKind.per,"%",null));
    }
    
}