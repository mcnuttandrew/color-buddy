import { expect, test } from "vitest";
import { prettyPrintLL } from "./lint-language";
// import grammar from "./grammar.ohm-bundle";
// import grammar from "./grammar.ohm?raw";
import * as ohm from "ohm-js";
import { toAST } from "ohm-js/extras";
import { PREBUILT_LINTS } from "../main";
// console.log(grammar);
// npx ohm generateBundles --withTypes src/lint-language/grammar.ohm
// console.log(ohm.grammar(grammar));
const gram = ohm.grammar(`
LintLanguage {
  Program = Exp
  Exp 
  	= "NOT" paren<Exp> -- not
    | CompareOp
    | QuantExp
    | paren<Exp>
    | BoolOp
    | bool
  
  CompareOp = paren<Exp> CompareOpType paren<Exp>
  CompareOpType = "AND" | "OR"
  
  // missing where stuff  
  QuantExp = ("ALL"  | "EXIST") paren<ListOf<Variable, ",">> "IN" paren<Value> ("WHERE" Exp)? "SUCH THAT" paren<Exp> 
  Value 
  	= 
    | Array
    | ValOp
    | ColorOp
    | ArrayOp
    | color
    | number
    | Variable
  
  Variable = IndexShortHand | ident | Array
  IndexShortHand = "index(" ident ")"
    
  BoolOp = BoolOpBinary | BoolOpFunc
  BoolOpBinary = Value BinOps Value
  BinOps = "<" | ">" | "==" | "!="
  BoolOpFunc = BoolOpFuncOps "(" Value "," Value ("," Value)? ")"
  BoolOpFuncOps = "similar" | "isTag" 
   
  ValOp = 
   | "absDiff" "(" Value "," Value ")" -- absDiff
   | Value ValsOps Value -- normal

  ValsOps = "*" | "+" | "-" | "%"
   
  ArrayOp = 
   | ArrayOpType "(" Value ")" -- arrayOp
   | ArrayHoF --sort
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
    =  (alnum | "_")*

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
function translateASTToLLang(ast: any) {}

test("parse", () => {
  PREBUILT_LINTS.forEach((ex) => {
    if (ex.customProgram) {
      return;
    }

    const nlEx = prettyPrintLL(JSON.parse(ex.program));
    const match = gram.match(nlEx);
    expect(match.succeeded(), `"${nlEx}" should parse`).toBeTruthy();
    const ast = toAST(match, {
      QuantExp: {
        type: "QuantExp",
        varb: 1,
        in: 3,
        where: 5,
        predicate: 7,
      },

      BinOps: {
        type: "BinOps",
        value: 0,
      },
      BoolOpBinary: {
        type: "BoolOpBinary",
        left: 0,
        op: 1,
        right: 2,
      },
      ArrayOpType: {
        type: "ArrayOpType",
        value: 0,
      },
      Lambda: {
        type: "Lambda",
        name: 0,
        value: 2,
      },
    });
    console.log(ast);
  });
});
