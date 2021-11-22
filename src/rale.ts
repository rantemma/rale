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
        coloumn: number,
        line: number,
    },

    end: {
        coloumn: number,
        line: number,
    }

    name: string,
    content: string | Token[],

    type: "wrapper" | "long" | "unique",

}

const defaultWrapper: Wrapper[] = [

    {begin: "{", end: "}", name: "braces"},
    {begin: "[", end: "]", name: "hook"},
    {begin: "(", end: ")", name: "parenthesis"},

]

const defaultLong: Long[] = [

    {regex: /[a-z0-9]/i, name: "string"},
    {regex: /[0-9]]/, name: "number"},

]

const defaultUnique: Unique[] = [

    {name: "dot", character: "."},
    {name: "semicolon", character: ";"},

    {name: "hyphen", character: "-"},
    {name: "plus", character: "+"},
    {name: "equal", character: "="},
    {name: "asterisk", character: "*"},
    {name: "slash", character:"/"},
    {name: "anti_slash", character: "\\"},

    {name: "quotations_marks", character: '"'},
    {name: "apostrophe", character: "'"},
    {name: "hapo", character: "`"},

]

export { defaultUnique, defaultLong, defaultWrapper, Wrapper, Unique, Long, Token };

import parenthesis from "parenthesis";

interface RT {
    tokens: Token[],
    coloumn: number,
    line: number,
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

    public tokenizeWords (str: string, coloumn?: number, line?: number): RT {

        if (!coloumn) coloumn = 0;
        if (!line) line = 0;

        let tokens: Token[] = [];

        const characters = str.split("");

        for (let i = 0; i < characters.length; i++) {

            const current = characters[i];

            (()=>{

                if (current === "\n") {
                    line++;
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
                            coloumn: coloumn,
                            line: line,
                        },
                        end: {
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
                                coloumn: coloumn,
                                line: line,
                            },
                            end: {
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
                                coloumn: coloumn,
                                line: line,
                            },
                            end: {
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
                            coloumn: coloumn,
                            line: line,
                        },
                        end: {
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
        };

    }

    private parseWrappers (parsed: parenthesis.ArrayTree, coloumn?: number, line?: number): RT {

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
                        const cnt = this.tokenizeWords(start, coloumn, line);
                        coloumn = cnt.coloumn;
                        line = cnt.line;
                        tokens.push(...cnt.tokens);
                    }
                } else {

                }

                if (match !== false) {

                    const content = parsed[i+1];
                    const end = parsed[i+2];

                    if (typeof content === "string") {
                        throw `RSL Error: Unhandled Exception`;
                    }

                    if (end[0] === match.end) {

                        parsed[i+2] = end.slice(1);

                        const cnt = this.parseWrappers(content, coloumn+1, line);

                        tokens.push({
                            begin: {
                                coloumn: coloumn,
                                line: line,
                            },
                            end: {
                                coloumn: cnt.coloumn+1,
                                line: cnt.line,
                            },
                            "type": "wrapper",
                            "name": match.name,
                            "content": cnt.tokens,
                        })

                        coloumn = cnt.coloumn+1;
                        line = cnt.line;

                    } else {
                        throw `RSL Error: Missing ${match.name}`
                    }

                    i+=1;

                } else {
                    const cnt = this.tokenizeWords(now, coloumn, line);
                    coloumn = cnt.coloumn;
                    line = cnt.line;
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