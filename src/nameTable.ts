import { TokenKind } from "./lexer";

export class Table{
    public kind:TokenKind;
    public name:string;
    public level:number;
    public relAddress:number;
    public value:number|null;
    public index:number;
    constructor(kind:TokenKind,name:string,level:number,relAddress:number,value:number|null,index:number=0){
        this.kind = kind;
        this.name = name;
        this.level = level;
        this.relAddress = relAddress;
        this.value = value;
        this.index = index;
    }
}

export class NameTable{
    public table:Table[] = [];
    public localAddress:number;
    private level = 0;
    private value:number|null = null;
    constructor() {
        this.table = [];
        this.localAddress  =2;
        this.level = 0;
    }

    public search(name:string){
        for(let i=this.table.length-1;i>=0;i--){
            const entry = this.table[i];
            if(entry.name === name){
                return entry;
            }
        }
        return null;
    }

    public addVar(name:string){
        this.table.forEach(code=>{
            if(code.name == name) throw new Error("その識別子は無効です")
        })
        const relAddress = this.localAddress++;
        this.table.push(new Table(TokenKind.VarToken,name,this.level,relAddress,this.value));
        return relAddress;
    }

    public addConst(name:string){
        this.table.forEach(code=>{
            if(code.name == name) throw new Error("その識別子は無効です")
        })
        const relAddress = this.localAddress++;
        this.table.push(new Table(TokenKind.ConstToken,name,this.level,relAddress,this.value));
        return relAddress;
    }

    public changeValue(name:string,value:number){
        for(let i=this.table.length-1;i>=0;i--){
            const entry = this.table[i];
            if(entry.name === name){
                this.table[i].value = value;
                //consoke.log("!",this.table[i])
                break;
            }
        }
        return value;
    }

    public declAndAss(ident_number:number,value:number|null){
        this.table[this.table.length-ident_number].value = value;
    }

    public getCodeByOffset(offset:number){
        return this.table[this.table.length-offset].name;
    }
}