import * as ohm from "ohm-js";
import { schema } from "../constants";
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
  
  QuantExp = ("ALL" | "EXIST") paren<ListOf<Variable, ",">> "IN" paren<Value> "SUCH THAT" paren<Exp> 
  QuantExpWithWhere = ("ALL" | "EXIST") paren<ListOf<Variable, ",">> "IN" paren<Value> QuantWhere "SUCH THAT" paren<Exp> 
  QuantWhere = "WHERE" paren<Exp>
  Value  = 
    | ArrayOp
    | ValOp
    | ColorOp
    | color
    | number
    | Variable
  
  Variable =  Array | IndexShortHand | ident
  IndexShortHand = "index(" ident ")"
    
  BoolOp = BoolOpBinary | BoolOpFunc
  BoolOpBinary = paren<Value> BinOps paren<Value>
  BinOps = "<" | ">" | "==" | "!="
  BoolOpFunc = BoolOpFuncOps "(" Value "," Value ("," Value)? ")"
  BoolOpFuncOps = "similar" | "isTag" 
   
  ValOp = 
   | "absDiff" "(" Value "," Value ")" -- absDiff
   | paren<Value> ValsOps paren<Value> -- normal
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
  	ToSpaceShortHand | "cvdSim" | "name" | "inGamut"
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
    
  bool = "true" | "false" | "TRUE" | "FALSE"
    
  color = "#"alnum alnum alnum alnum alnum alnum
    
  Array = "[" ListOf<Value, ","> "]"
  paren<x> = 
   | x -- parenFree
   | "(" x ")" -- withParen

 }`);

const semantics = gram.createSemantics();

function sayName(..._name: any[]) {
  //   console.log(name);
}

const actionDict: Parameters<(typeof semantics)["addOperation"]>[1] = {
  Program(exp) {
    sayName("Program");
    return exp.buildAst();
  },
  Exp(exp) {
    sayName("Exp");
    return exp.buildAst();
  },
  Exp_not(_not, exp) {
    sayName("Exp_not");
    return { not: exp.buildAst() };
  },
  CompareOp(left, op, right) {
    sayName("CompareOp");
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
    sayName("QuantExp");
    let varb = vars.buildAst();
    const varbKey = varb.length === 1 ? "varb" : "varbs";
    if (varbKey === "varb") {
      varb = varb[0];
    }
    const inKey = inVal.buildAst();
    const name = quantType.sourceString.toLowerCase();
    const out = {
      [name]: {
        [varbKey]: varb.length > 1 ? varb : varb[0],
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
    sayName("QuantWhere");
    return exp.buildAst();
  },
  bool(a) {
    sayName("bool");
    return a.sourceString === "true";
  },
  BoolOpBinary(left, op, right) {
    sayName("BoolOpBinary");
    return {
      //   type: "BoolOpBinary",
      [op.sourceString]: {
        left: left.buildAst(),
        right: right.buildAst(),
      },
    };
  },
  BoolOpFunc(name, _lParen, term1, _comma, term2, _comma2, term3, _rParen) {
    sayName("BoolOpFunc", this.sourceString);
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
    sayName("ToSpaceShortHand");
    const spaceName = [a, b, c].map((x) => x.sourceString).join("");
    return { [`${spaceName}.${channel.sourceString}`]: value.buildAst() };
  },

  IndexShortHand(start, name, end) {
    sayName("IndexShortHand");
    return [start, name, end].map((x) => x.sourceString).join("");
  },
  Array(_a, b, _c) {
    sayName("Array", b.sourceString, b.numChildren);
    return b.buildAst();
  },
  ArrayOp(a) {
    sayName("ArrayOp");
    return a.buildAst();
  },
  ArraySimpleOp(ArrayOpType, _x, Value, _y) {
    sayName("ArraySimpleOp");
    return { [ArrayOpType.sourceString]: Value.buildAst() };
  },
  ArrayHoF(name, _lParen, term1, _comma, lambda, _rParen) {
    sayName("ArrayHoF");
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
    sayName("Value", a.ctorName);
    if (a.ctorName === "color") return a.sourceString;
    if (a.ctorName === "number") return Number(a.sourceString);
    if (a.ctorName === "Array") return a.buildAst();
    return a.buildAst();
  },
  color(_hash, ra, rb, ga, gb, ba, bb) {
    const val = [ra, rb, ga, gb, ba, bb].map((x) => x.sourceString).join("");
    return `#${val}`;
  },
  ValOp_absDiff(_name, _lParen, leftTerm, _comma, rightTerm, _rParen) {
    sayName("ValOp_absDiff");
    return {
      absDiff: { left: leftTerm.buildAst(), right: rightTerm.buildAst() },
    };
  },
  ValOp_normal(left, op, right) {
    sayName("ValOp_normal");
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
  paren(exp) {
    return exp.buildAst();
  },
  paren_withParen(_l, exp, _r) {
    return exp.buildAst();
  },
  ident(a) {
    sayName("iden", a.sourceString);
    const str = a.sourceString;
    if (str.toLowerCase() === "true" || str.toLowerCase() === "false") {
      return str.toLowerCase() === "true";
    }
    return str;
  },
  _terminal() {
    return null;
  },
  _iter(...children) {
    sayName("iter");
    return children.map((x) => x.buildAst());
  },
  NonemptyListOf(head, _, tail) {
    sayName("NonemptyListOf");
    return [head.buildAst(), ...tail.children.flatMap((c) => c.buildAst())];
  },
  letter(x) {
    sayName("letter");
    return x.sourceString;
  },
  Func1(name, _lParen, term1, _comma, term2, _rParen) {
    sayName("func 1");
    const funcPrep = funcTable[name.sourceString];
    if (!funcPrep) {
      throw new Error(`unknown function ${name.sourceString}`);
    }
    return funcPrep(term1.buildAst(), ...term2.buildAst());
  },
  Func2(name, _lParen, b, _comma, d, _e, f, _rParen) {
    const funcPrep = funcTable[name.sourceString];
    sayName("func 2");
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
  inGamut: (val: string) => ({ inGamut: val }),
  deltaE: (left: string, right: string, algorithm: string) => ({
    deltaE: { left, right },
    algorithm: `${algorithm}`,
  }),
  dist: (left: string, right: string, space: string) => ({
    dist: { left, right },
    space: `${space}`,
  }),
};

export default function compileToLL(input: string) {
  const match = gram.match(input, "Program");
  if (!match.succeeded()) {
    throw new Error(`Parser: failed to parse "${input}"`);
  }
  const builtAst = semantics(match).buildAst();
  if (typeof builtAst === "object") {
    builtAst.$schema = schema;
  }
  return builtAst;
}
