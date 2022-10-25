import { Compiler } from "./compiler";
import { DrawByteCode } from "./DrawByteCodes";
import { Lexer, SyntaxToken, TokenKind } from "./lexer";
import { NameTable } from "./nameTable";
import { Source } from "./source";
import { VirtualMachine } from "./virtualMachine";

export const _nameTable = new NameTable();
const compileButton = document.getElementById("CompileButton")as HTMLInputElement;
compileButton.addEventListener("click",()=>{
    const input = document.getElementById("InputTextArea") as HTMLInputElement
    const text = String(input.value);

    const source = new Source(text);
    const tokens = source.getTokens();
    const compiler = new Compiler(tokens);
    DrawByteCode(compiler.result_codes);
    const vm = new VirtualMachine(compiler.result_codes);
    vm.run();
    const output = document.getElementById("OutputTextArea") as HTMLInputElement
    output.value = vm.output;
    _nameTable.table = []
})


