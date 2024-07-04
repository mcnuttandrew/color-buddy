import * as ohm from "ohm-js";
const gram = ohm.grammar(String.raw`
LintLanguage {
  Program = Exp
  Exp 
  	= "NOT" paren<Exp> -- not
    | CompareOp
    | QuantExp
    | QuantExpWithWhere
    | paren<Exp>
    | BoolOp
    | bool
  
  CompareOp = paren<Exp> CompareOpType paren<Exp>
  CompareOpType = "AND" | "OR"
  
  // missing where stuff  
  QuantExp = ("ALL" | "EXIST") paren<ListOf<Variable, ",">> "IN" paren<Value> "SUCH THAT" paren<Exp> 
  QuantExpWithWhere = ("ALL" | "EXIST") paren<ListOf<Variable, ",">> "IN" paren<Value> QuantWhere "SUCH THAT" paren<Exp> 
  QuantWhere = "WHERE" paren<Exp>
  Value 
  	= 
    | Array
    | ValOp
    | ColorOp
    | ArrayOp
    | color
    | number
    | Variable
  
  Variable =  Array | IndexShortHand | ident
  IndexShortHand = "index(" ident ")"
    
  BoolOp = BoolOpBinary | BoolOpFunc
  BoolOpBinary = Value BinOps Value
  BinOps = "<" | ">" | "==" | "!="
  BoolOpFunc = BoolOpFuncOps "(" Value "," Value ("," Value)? ")"
  BoolOpFuncOps = "similar" | "isTag" 
   
  ValOp = 
   | "absDiff" "(" Value "," Value ")" -- absDiff
   | Value ValsOps Value -- normal

  ValsOps = "%" | "*" | "+" | "-" 
   
  ArrayOp = ArraySimpleOp | ArrayHoF
  ArraySimpleOp = ArrayOpType "(" Value ")" 
  ArrayOpType = "count" | "sum" | "min" | "max" | "std" | "mean" | "first" | "last" | "extent" | "speed" | "reverse"
  ArrayHoF = ArrayHofType "(" Value "," Lambda ")" 
  ArrayHofType = "sort" | "filter" | "map"
 
  
  Lambda = ident "=>" Value
 
  ColorOp = 
  	| ColorOpOneFuncs  
    | ToSpaceShortHand -- shorthand
    | ColorOpTwo
  ColorOpOneFuncs = Func1<ColorOpOneFuncsOps>
  ColorOpOneFuncsOps = 
  	"cvdSim" | "name" | "inGamut" | ToSpaceShortHand
  ColorOpTwo = Func2<ColorOpTwoOps>
  ColorOpTwoOps = "dist" | "deltaE" | "contrast"
    
  ToSpaceShortHand = (letter letter letter "." letter) "(" Value ")"
 
  Func1<name> = name "(" Value ("," Value)? ")"
  Func2<name> = name "(" Value "," Value ("," Value)? ")"
 

  
  ident  (an identifier)
    =  (alnum | "_")+

  number  (a number)
    = digit* "." digit+  -- fract
    | digit+             -- whole
    
  bool = "true" | "false"
    
  color = "#"alnum alnum alnum alnum alnum alnum
    
  Array = "[" ListOf<Value, ","> "]"
  lParen = ("(")?
  rParen = (")")?
  paren<x> = lParen x rParen
 }`);

const semantics = gram.createSemantics();

const actionDict: Parameters<(typeof semantics)["addOperation"]>[1] = {
  Program(exp) {
    console.log("Program");
    return exp.buildAst();
  },
  Exp(exp) {
    console.log("Exp");
    return exp.buildAst();
  },
  Exp_not(_not, exp) {
    console.log("Exp_not");
    return { not: exp.buildAst() };
  },
  CompareOp(left, op, right) {
    console.log("CompareOp????", this.sourceString);
    const leftChild = left.buildAst();
    const rightChild = right.buildAst();
    const name = op.sourceString.toLowerCase();
    let children = [leftChild];
    // if all of the children are the same type, flatten
    if (name === "or" && rightChild.or) {
      children = [leftChild, ...rightChild.or];
    } else if (name === "and" && rightChild.and) {
      children = [leftChild, ...rightChild.and];
    } else {
      children.push(rightChild);
    }

    return { [name]: children };
  },
  QuantExp(quantType, vars, _, inVal, where, predicate) {
    console.log(" QuantExp");
    let varb = vars.buildAst();
    const varbKey = vars.children.length === 3 ? "varb" : "varbs";
    console.log("lmmlmlm", vars.sourceString, vars.numChildren);
    if (varbKey === "varb") {
      varb = varb[0];
    }
    const inKey = inVal.buildAst();
    console.log("inKey", inKey);
    const name = quantType.sourceString.toLowerCase();
    const out = {
      //   type: "QuantExp",
      [name]: {
        [varbKey]: varb,
        in: inKey,
        predicate: predicate.buildAst(),
      },
    };
    const whereAST = where.buildAst();
    if (whereAST) {
      out[name].where = whereAST;
    }
    return out;
  },
  QuantExpWithWhere(quantType, vars, _, val, where, _st, predicate) {
    return (actionDict as any).QuantExp(
      quantType,
      vars,
      _,
      val,
      where,
      predicate
    );
  },
  QuantWhere(_where, exp) {
    console.log("QuantWhere");
    return exp.buildAst();
  },
  BoolOpBinary(left, op, right) {
    console.log("BoolOpBinary");
    return {
      //   type: "BoolOpBinary",
      [op.sourceString]: {
        left: left.buildAst(),
        right: right.buildAst(),
      },
    };
  },
  BoolOpFunc(name, _lParen, term1, _comma, term2, _comma2, term3, _rParen) {
    console.log("BoolOpFunc", this.sourceString);
    if (name.sourceString === "similar") {
      return {
        similar: {
          left: term1.buildAst(),
          right: term2.buildAst(),
          threshold: term3.buildAst()[0],
        },
      };
    }
    return {
      [name.sourceString]: term1.buildAst(),
      value: term2.buildAst(),
    };
  },
  ToSpaceShortHand(a, b, c, _dot, channel, _lParen, value, _r) {
    console.log("ToSpaceShortHand");
    const spaceName = [a, b, c].map((x) => x.sourceString).join("");
    return { [`${spaceName}.${channel.sourceString}`]: value.buildAst() };
  },

  IndexShortHand(start, name, end) {
    console.log("IndexShortHand");
    return [start, name, end].map((x) => x.sourceString).join("");
  },
  Array(_a, b, _c) {
    console.log("Array", b.sourceString, b.numChildren);
    return b.buildAst();
  },
  ArrayOp(a) {
    console.log("ArrayOp");
    return a.buildAst();
  },
  ArraySimpleOp(ArrayOpType, _x, Value, _y) {
    console.log("ArraySimpleOp");
    return { [ArrayOpType.sourceString]: Value.buildAst() };
  },
  ArrayHoF(name, _lParen, term1, _comma, lambda, _rParen) {
    console.log("ArrayHoF");
    const lambdaAST = lambda.buildAst();
    return {
      [name.sourceString]: term1.buildAst(),
      func: lambdaAST.value,
      varb: lambdaAST.name,
    };
  },
  Lambda(name, _arrow, value) {
    return {
      //   type: "Lambda",
      name: name.sourceString,
      value: value.buildAst(),
    };
  },
  Value(a) {
    console.log("Value", a.ctorName);
    if (a.ctorName === "color") return a.sourceString;
    if (a.ctorName === "number") return Number(a.sourceString);
    if (a.ctorName === "Array") return a.buildAst();
    return a.buildAst();
  },
  color(_hash, ra, rb, ga, gb, ba, bb) {
    const val = [ra, rb, ga, gb, ba, bb].map((x) => x.sourceString).join("");
    return `#${val}`;
  },
  ValOp_absDiff(_a, _b, c, _d, _e, f) {
    throw new Error("absDiff not implemented");
    return {
      //   type: "ValOp_absDiff",
      a: c.buildAst(),
      b: f.buildAst(),
    };
  },
  ValOp_normal(left, op, right) {
    console.log("ValOp_normal");
    return {
      [op.sourceString]: {
        left: left.buildAst(),
        right: right.buildAst(),
      },
    };
  },

  number(digits) {
    return parseInt(digits.sourceString);
  },
  paren(_l, exp, _r) {
    return exp.buildAst();
  },
  ident(a) {
    console.log("iden", a.sourceString);
    return a.sourceString;
  },
  _terminal() {
    console.log("term");
    return null;
  },
  _iter(...children) {
    console.log("iter");
    return children.map((x) => x.buildAst());
  },
  NonemptyListOf(head, _, tail) {
    console.log("NonemptyListOf");
    return [head.buildAst(), ...tail.children.flatMap((c) => c.buildAst())];
  },
  letter(x) {
    console.log("letter");
    return x.sourceString;
  },
  Func1(name, _lParen, term1, _comma, term2, _rParen) {
    console.log("func 1");
    const funcPrep = funcTable[name.sourceString];
    if (!funcPrep) {
      throw new Error(`unknown function ${name.sourceString}`);
    }
    return funcPrep(term1.buildAst(), ...term2.buildAst());
  },
  Func2(name, _lParen, b, _comma, d, _e, f, _rParen) {
    const funcPrep = funcTable[name.sourceString];
    console.log("func 2");
    if (!funcPrep) {
      throw new Error(`unknown function ${name.sourceString}`);
    }
    return funcPrep(b.buildAst(), d.buildAst(), ...f.buildAst());
  },
};
semantics.addOperation("buildAst", actionDict);

const funcTable: Record<string, any> = {
  contrast: (left: string, right: string, algorithm: string) => ({
    contrast: { left, right },
    algorithm,
  }),
  cvdSim: (val: string, type: string) => ({ cvdSim: val, type }),
  name: (val: string) => ({ name: val }),
};

export default function compileToLL(input: string) {
  const match = gram.match(input, "Program");
  if (!match.succeeded()) {
    throw new Error("failed to parse");
  }
  return semantics(match).buildAst();
}
