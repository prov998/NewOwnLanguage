import { InterToken, InterTokenKind } from "./compiler";
import { SyntaxToken, TokenKind } from "./lexer";
import { _nameTable } from "./main";
import { Table } from "./nameTable";

//中間言語→目的言語→実行

export class VirtualMachine{
    private code:InterToken[];
    public output;
    public pc:number = 0;
    public stack:any[] = [0,0];
    public top:number = this.stack.length;
    public display:number[] = [0];

    constructor(code:InterToken[]){
        this.code = code;
        this.output = "";
    }

    public run(){
        this.pc = 0;
        this.stack = [0,0]
        this.top = 0;
        this.display = [0];
        while(true){
            var inst:InterToken = this.code[this.pc++];
            switch(inst.kind){
                case InterTokenKind.lit:
                    this.runNumber(inst);
                    break;
                case InterTokenKind.wrt:
                    this.runWrite();
                    break;
                case InterTokenKind.wrl:
                    this.runWriteLine();
                    break;
                case InterTokenKind.add:
                    this.runOprAdd();
                    break;
                case InterTokenKind.sub:
                    this.runOprSub();
                    break;
                case InterTokenKind.neg:
                    this.runOprNeg();
                    break;
                case InterTokenKind.mul:
                    this.runOprMul();
                    break;
                case InterTokenKind.div:
                    this.runOprDiv();
                    break;
                case InterTokenKind.per:
                    this.runOprMod();
                    break;
                case InterTokenKind.num:
                    this.runNumber(inst);
                    break;
                case InterTokenKind.ide:
                    this.runIndent(inst);
                    break;
                case InterTokenKind.ass:
                    this.runAssign();
                    break;
                case InterTokenKind.eql:
                    this.runEqual();
                    break;
                case InterTokenKind.neql:
                    this.runNotEqual();
                    break;
                case InterTokenKind.grt:
                    this.runGreater();
                    break;
                case InterTokenKind.greq:
                    this.runGreatEqual();
                    break;
                case InterTokenKind.lss:
                    this.runLesser();
                    break;
                case InterTokenKind.lseq:
                    this.runLessEqual();
                    break;
                case InterTokenKind.jpc:
                    this.runJpc(inst);
                    break;
                case InterTokenKind.jmp:
                    this.runJmp(inst);
                    break;
                case InterTokenKind.str:
                    this.runString(inst.text);
                    break;
                default:
                    //consoke.log(InterTokenKind[inst.kind]);
                    throw new Error("実行エラー：不明なオペレータです: ");
            }
            if(this.pc >= this.code.length) { break;}

            if(this.pc == 0) { break;}
        }
    }

    private runIct(inst:Table){
        if(inst.value != null) this.top += inst.value;
    }

    private runJmp(inst:InterToken){
        this.pc = inst.index;
    }

    private runLod(inst:Table){
        const address = this.display[inst.level] + inst.relAddress;
        const value = this.stack[address];
        this.pushStack(value);
    }

    private runSto(inst:Table){
        const value = this.popStack();
        const address = this.display[inst.level] + inst.relAddress;
        this.stack[address] = value;
    }

    private runJpc(inst:InterToken){
        const bool = this.popStack()

        if(bool == 0) this.pc = inst.index;
    }

    private runNumber(inst:InterToken){
        if(inst.value == null){
            const entry = _nameTable.search(inst.text);
            if(entry != null){
                inst.value = entry.value;
            }
        }
        this.stack[this.top++] = inst.value;
    }

    private runString(text:string){
        this.stack[this.top++] = text;
    }

    private runIndent(inst:InterToken){
        
        this.stack[this.top++] = inst.text;
    }

    private runEqual(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        if(rhs == lhs) this.pushStack(1); //1 is true
        else this.pushStack(0); //0 is false
    }

    private runNotEqual(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        if(rhs == lhs) this.pushStack(0); //0 is true
        else this.pushStack(1); //1 is false
    }

    private runGreater(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        if(rhs < lhs) this.pushStack(1); //1 is true
        else this.pushStack(0); //0 is false
    }

    private runGreatEqual(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        if(rhs <= lhs) this.pushStack(1); //1 is true
        else this.pushStack(0); //0 is false
    }

    private runLesser(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        if(rhs > lhs) this.pushStack(1); //1 is true
        else this.pushStack(0); //0 is false
    }

    private runLessEqual(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        if(rhs >= lhs) this.pushStack(1); //1 is true
        else this.pushStack(0); //0 is false
    }

    private runAssign(){
        const ident = this.stack[--this.top];
        const number = this.stack[--this.top];

        var value = _nameTable.changeValue(ident,number);
        this.pushStack(value)

    }

    private runWrite(){
        const value = this.stack[--this.top];
        this.output += String(value);
    }

    private runWriteLine(){
        const value = this.stack[--this.top];
        this.output += String(value)+"\n";
    }

    private pushStack(value:any){
        this.stack[this.top++] = value;
    }

    private popStack(){
        return this.stack[--this.top];
    }

    private runOprAdd(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        this.pushStack(lhs+rhs)
    }

    private runOprSub(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        this.pushStack(lhs-rhs)
    }

    private runOprNeg(){
        const rhs = this.popStack();

        this.pushStack(-1*rhs); 
    }

    private runOprMul(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        this.pushStack(lhs*rhs)
    }

    private runOprDiv(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        this.pushStack(lhs/rhs); 
    }

    private runOprMod(){
        const rhs = this.popStack();
        const lhs = this.popStack();

        this.pushStack(lhs%rhs); 
    }
}