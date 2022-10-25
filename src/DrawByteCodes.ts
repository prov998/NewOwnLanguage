import { InterToken, InterTokenKind } from "./compiler";

export function DrawByteCode(codes:InterToken[]){
    var number:number = 0;
    codes.forEach(code =>{
        if(code.kind == InterTokenKind.jpc||code.kind == InterTokenKind.jmp){
            console.log(`>> ${number.toString().padStart(2,'0')}: ${InterTokenKind[code.kind]} ${code.index}`)
        }else{
        console.log(`>> ${number.toString().padStart(2,'0')}: ${InterTokenKind[code.kind]} ${code.text}`)
        }   
        number++;
    })
}