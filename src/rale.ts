interface Wrapper {
    name: string,
    begin: string,
    end: string,
}

interface Unique {
    name: string,
    character: string,
}

interface Long {
    name: string,
    regex: RegExp,
}

interface Token {

    begin: {
        index: number,
        coloumn: number,
        line: number,
    },

    end: {
        index: number,
        coloumn: number,
        line: number,
    }

    name: string,

    content?: string,
    wrapperContent?: Token[],

    type: "wrapper" | "long" | "unique",

}

const defaultWrapper: Wrapper[] = [

    {begin: "{", end: "}", name: "curly_bracket"},
    {begin: "[", end: "]", name: "bracket"},
    {begin: "(", end: ")", name: "parenthesis"},
    {begin: "<", end: ">", name: "angle_bracket"},

]

const defaultLong: Long[] = [

    {regex: /[0-9]/, name: "number"},
    {regex: /[a-z0-9_]/i, name: "string"},
    
]

const defaultUnique: Unique[] = [

    {name: "dot", character: "."},
    {name: "semicolon", character: ";"},
    {name: "colon", character: ":"},

    {name: "dash", character: "-"},
    {name: "plus", character: "+"},
    {name: "equal", character: "="},
    {name: "star", character: "*"},
    {name: "slash", character:"/"},
    {name: "anti_slash", character: "\\"},

    {name: "question_mark", character: "?"},
    {name: "exclamation_mark", character: "!"},

    {name: "double_quote", character: '"'},
    {name: "single_quote", character: "'"},
    {name: "backtick", character: "`"},

]

export { defaultUnique, defaultLong, defaultWrapper, Wrapper, Unique, Long, Token };

import parenthesis from "parenthesis";

interface RT {
    tokens: Token[],
    coloumn: number,
    line: number,
    indexof: number,
}

export default class RALE {

    private uniques: Unique[] = defaultUnique.slice();
    private longs: Long[] = defaultLong.slice();
    private wrappers: Wrapper[] = defaultWrapper.slice();

    private tokenizeUnknownCharacters = true;

    public constructor (longs?: Long[], uniques?: Unique[], wrappers?: Wrapper[], tokenizeUnknownCharacters?: boolean) {
        if (longs) this.longs = longs;
        if (wrappers) this.wrappers = wrappers;
        if (uniques) this.uniques = uniques;
        if (tokenizeUnknownCharacters) this.tokenizeUnknownCharacters = tokenizeUnknownCharacters;
    }

    private matchWrapper (chrar: string): Wrapper | false {

        for (let i = 0; i < this.wrappers.length; i++) {

            if (chrar === this.wrappers[i].begin || chrar === this.wrappers[i].end) {
                return this.wrappers[i];
            }

        }

        return false;

    }

    public tokenizeWords (str: string, coloumn?: number, line?: number, indexOf?: number): RT {

        if (!indexOf) indexOf = 0;
        if (!coloumn) coloumn = 0;
        if (!line) line = 0;

        let tokens: Token[] = [];

        while (str.includes("\r")) {
            str = str.replace("\n", "");
        }

        const characters = str.split("");

        for (let i = 0; i < characters.length; i++) {

            const current = characters[i];

            (()=>{

                if (current === "\n") {
                    line++;
                    coloumn = 0;
                    return;
                }

                if (current === " ") {

                    let content = current;

                    let pos = 1;
                    while (characters[i+pos] === " ") {
                        content += " ";
                        pos++;
                    }

                    tokens.push({
                        begin: {
                            index: indexOf+i,
                            coloumn: coloumn,
                            line: line,
                        },
                        end: {
                            index: indexOf+i+pos,
                            coloumn: coloumn+pos,
                            line: line,
                        },
                        "type": "long",
                        "name": "space",
                        "content": content
                    })

                    coloumn+=content.length;

                    return;

                }

                for (let t = 0; t < this.uniques.length; t++) {

                    if (current === this.uniques[t].character) {
    
                        tokens.push({
                            begin: {
                                index: indexOf+i,
                                coloumn: coloumn,
                                line: line,
                            },
                            end: {
                                index: indexOf+i+1,
                                coloumn: coloumn+1,
                                line: line,
                            },
                            "type": "unique",
                            "name": this.uniques[t].name,
                            "content": current
                        })

                        coloumn++;
    
                        return;
    
                    }
    
                }

                for (let t = 0; t < this.longs.length; t++) {

                    if (current.match(this.longs[t].regex)) {
    
                        let content = current;

                        let pos = 1;
                        while (characters[i+pos]) {
                            if (!characters[i+pos].match(this.longs[t].regex)) {
                                break;
                            }
                            content += characters[i+pos];
                            pos++;
                        }

                        tokens.push({
                            begin: {
                                index: indexOf+i,
                                coloumn: coloumn,
                                line: line,
                            },
                            end: {
                                index: indexOf+i+pos,
                                coloumn: coloumn+pos,
                                line: line,
                            },
                            "type": "long",
                            "name": this.longs[t].name,
                            "content": content
                        })

                        coloumn+=content.length;
                        i+=content.length-1;
    
                        return;
    
                    }
    
                }

                if (this.tokenizeUnknownCharacters) {
                    tokens.push({
                        begin: {
                            index: indexOf+i,
                            coloumn: coloumn,
                            line: line,
                        },
                        end: {
                            index: indexOf+i+1,
                            coloumn: coloumn+1,
                            line: line,
                        },
                        "type": "unique",
                        "name": "unknown",
                        "content": current
                    })
                }

                coloumn++;

            })();
        }
 
        return {
            tokens: tokens,
            coloumn: coloumn,
            line: line,
            indexof: indexOf+characters.length,
        };

    }

    private parseWrappers (parsed: parenthesis.ArrayTree, coloumn?: number, line?: number, indexOf?: number): RT {

        if (!indexOf) indexOf = 0;
        if (!coloumn) coloumn = 0;
        if (!line) line = 0;

        let tokens: Token[] = [];

        for (let i = 0; i < parsed.length; i++) {

            const now = parsed[i];

            if (typeof now === "string") {

                // String

                const match = this.matchWrapper(now[now.length-1]);

                if (match !== false) {

                    var start = parsed[i];
                    
                    if (typeof start === "string") {
                        start = start.slice(0, parsed[i].length-1);
                        const cnt = this.tokenizeWords(start, coloumn, line, indexOf);
                        coloumn = cnt.coloumn;
                        line = cnt.line;
                        indexOf = cnt.indexof;
                        tokens.push(...cnt.tokens);
                    }
               
                    const content = parsed[i+1];
                    const end = parsed[i+2];

                    if (typeof content === "string") {
                        throw `RSL Error: Unhandled Exception`;
                    }

                    if (end[0] === match.end) {

                        parsed[i+2] = end.slice(1);

                        const cnt = this.parseWrappers(content, coloumn+1, line, indexOf+1);

                        tokens.push({
                            begin: {
                                index: indexOf,
                                coloumn: coloumn,
                                line: line,
                            },
                            end: {
                                index: cnt.indexof+1,
                                coloumn: cnt.coloumn+1,
                                line: cnt.line,
                            },
                            type: "wrapper",
                            name: match.name,
                            wrapperContent: cnt.tokens,
                        })

                        indexOf = cnt.indexof+1;
                        coloumn = cnt.coloumn+1;
                        line = cnt.line;

                    } else {
                        throw `RSL Error: Missing ${match.name}`
                    }

                    i+=1;

                } else {
                    const cnt = this.tokenizeWords(now, coloumn, line, indexOf);
                    coloumn = cnt.coloumn;
                    line = cnt.line;
                    indexOf = cnt.indexof;
                    tokens.push(...cnt.tokens);
                }

            } else {
                throw `RSL Error: Unhandled Exception`
            }

        }

        return {
            tokens: tokens,
            coloumn: coloumn,
            line: line,
            indexof: indexOf,
        };

    }

    public parse (str: string): Token[] {

        let tokens: Token[] = [];

        let opts: string[] = [];
        this.wrappers.forEach(v=>{
            opts.push(`${v.begin}${v.end}`)
        })

        const parsed = parenthesis.parse(str, opts);

        tokens.push(...this.parseWrappers(parsed).tokens);

        return tokens;

    }

}