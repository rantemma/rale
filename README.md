**Rale or Rantemma Advanced Lexing Evaluation**

Is the official lexer of the Rantemma Language System (aka RLS).

No need to create a lexer, with Rale it's easy to parse any string into Token as you want or with default lexer parameters.

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
const longs: Longs[] = {
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
const lexer = new Rale(longs, uniques, wrappers, true); // the last value is for tokenizing unknown tokens.
```

## Use your lexer

```js
const query = "hey { test }";
lexer.parse(query);
```

That gave you :

```js
[
  {
    "begin": {
      "index": 0,
      "coloumn": 0,
      "line": 0
    },
    "end": {
      "index": 3,
      "coloumn": 3,
      "line": 0
    },
    "type": "long",
    "name": "string",
    "content": "hey"
  },
  {
    "begin": {
      "index": 3,
      "coloumn": 3,
      "line": 0
    },
    "end": {
      "index": 4,
      "coloumn": 4,
      "line": 0
    },
    "type": "long",
    "name": "space",
    "content": " "
  },
  {
    "begin": {
      "index": 4,
      "coloumn": 4,
      "line": 0
    },
    "end": {
      "index": 12,
      "coloumn": 12,
      "line": 0
    },
    "type": "wrapper",
    "name": "curly_bracket",
    "wrapperContent": [
      {
        "begin": {
          "index": 5,
          "coloumn": 5,
          "line": 0
        },
        "end": {
          "index": 6,
          "coloumn": 6,
          "line": 0
        },
        "type": "long",
        "name": "space",
        "content": " "
      },
      {
        "begin": {
          "index": 6,
          "coloumn": 6,
          "line": 0
        },
        "end": {
          "index": 10,
          "coloumn": 10,
          "line": 0
        },
        "type": "long",
        "name": "string",
        "content": "test"
      },
      {
        "begin": {
          "index": 10,
          "coloumn": 10,
          "line": 0
        },
        "end": {
          "index": 11,
          "coloumn": 11,
          "line": 0
        },
        "type": "long",
        "name": "space",
        "content": " "
      }
    ]
  }
]
```

Enjoy!