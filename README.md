**RALE or Rantemma Advanced Lexing Evaluation**

Is the official lexer of the Rantemma System Langage (aka RSL).

No need to create a lexer, with RALE it's easy to parse any string into Token as you want or with default lexer parameters.

***

*Exemple is generally in TypeScript*

# Create your own lexer

**_Unique Token_**

The unique token is the most simple kind of tokens, allow you to tokenize one character with a name.

```ts
const uniques: Unique[] = {
    {name: "semicolon", character: ";"}
}
```

**_Long Token_**

The long token is a token formed by RegExp.
*The regex match is executed character by character*

```ts
const uniques: Unique[] = {
    {name: "string", regex: /[a-z0-9]/i}
}
```

**_Wrapper Token_**

The wrapper token is a specific token that wrap other tokens beetween two defined character inside the same token.

```ts
const wrappers: Wrapper[] = {
    {name: "braces", begin: "{", end: "}"}
}
```

## Create the instance

With tokens made before, we create the Lexer.

```js
const lexer = new RALE(longs, uniques, wrappers, true); // the last value is for tokenizing unknown tokens.
```

## Use your lexer

```js
const query = "hey {test}";
lexer.parse(query);
```

That gave you :

```js
[
  {
    "begin": {
      "coloumn": 0,
      "line": 0
    },
    "end": {
      "coloumn": 3,
      "line": 0
    },
    "type": "long",
    "name": "string",
    "content": "hey"
  },
  {
    "begin": {
      "coloumn": 3,
      "line": 0
    },
    "end": {
      "coloumn": 4,
      "line": 0
    },
    "type": "long",
    "name": "space",
    "content": " "
  },
  {
    "begin": {
      "coloumn": 4,
      "line": 0
    },
    "end": {
      "coloumn": 10,
      "line": 0
    },
    "type": "wrapper",
    "name": "braces",
    "content": [
      {
        "begin": {
          "coloumn": 5,
          "line": 0
        },
        "end": {
          "coloumn": 9,
          "line": 0
        },
        "type": "long",
        "name": "string",
        "content": "test"
      }
    ]
  }
]
```

Enjoy!