export function IsDight(ch:string){
    return /^\d$/.test(ch);
}

export function IsWhiteSpace(ch:string){
    if(ch == ' '||ch == '\t') return true;
    return false
}

export function IsIdentStartChar(ch:string){
    return /^[A-Za-z_]$/.test(ch);
}

export function IsIdentChar(ch:string){
    return /^[A-Za-z0-9_]$/.test(ch);
}
