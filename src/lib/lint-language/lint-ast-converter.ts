// import type { SyntaxNodeRef } from "@lezer/common";
// import { parser } from "./lint-parser";
// import { Color } from "../Color";
// import {
//   LLNode,
//   LLExpression,
//   LLConjunction,
//   LLValueArray,
//   LLBool,
//   LLVariable,
//   LLColor,
//   LLNumber,
//   LLNumberOp,
//   LLPredicate,
//   LLValue,
//   LLValueFunction,
//   LLQuantifier,
//   LLReduces,
// } from "./lint-language";

// export function parseAST(programString: string): LLNode {
//   const ast = parser.parse(programString);
//   const result = traverseTree(ast.topNode, programString);
//   if (!result) throw new Error("Invalid AST");
//   return result;
// }

// function traverseTree(
//   node: SyntaxNodeRef,
//   programString: string
// ): LLNode | void {
//   const sliced = programString.slice(node.from, node.to);
//   // console.log(node.type.name, sliced);
//   let child = node.node.firstChild;
//   let children = [] as any[];
//   while (child) {
//     children.push(traverseTree(child, programString));
//     child = child.nextSibling;
//   }
//   children = children.filter((x) => (Array.isArray(x) ? x.length : x));
//   const symbols = new Set([
//     "AND",
//     "OR",
//     "NOT",
//     "LPAREN",
//     "RPAREN",
//     "SIMILAR",
//     "COUNT",
//     "SUM",
//     "MIN",
//     "MAX",
//     "MEAN",
//     "VARIABLE",
//     "COLOR",
//     "NUMBER",
//     "NUMBERCOMPARES",
//     "<",
//     ">",
//     "<=",
//     ">=",
//   ]);
//   if (symbols.has(node.type.name) || symbols.has(sliced) || sliced.length) {
//     return;
//   }
//   switch (node.type.name) {
//     case "true":
//     case "false":
//     case "BooleanExpression":
//       return new LLBool(sliced === "true");
//     case "AndExpression":
//       return new LLConjunction("and", children);
//     case "OrExpression":
//       return new LLConjunction("or", children);
//     case "NotExpression":
//       return new LLConjunction("not", children);
//     case "Identifier":
//       return new LLVariable(sliced);
//     case "ValueExpression":
//       return new LLValue(children[0]);
//     case "Program":
//       return children[0];
//     case "EqualExpression":
//       return new LLPredicate("==", children[0], children[1]);
//     case "NotEqualExpression":
//       return new LLPredicate("!=", children[0], children[1]);
//     case "GreaterThanExpression":
//       return new LLPredicate(">", children[0], children[1]);
//     case "LessThanExpression":
//       return new LLPredicate("<", children[0], children[1]);
//     case "SimilarExpression":
//       throw new Error("not done");
//       return new LLPredicate("similar", children[0], children[1]);
//     case "CountFunction":
//       return new LLReduces("count", children[0]);
//     case "SUM":
//       return new LLReduces("sum", children[0]);
//     case "MIN":
//       return new LLReduces("min", children[0]);
//     case "MAX":
//       return new LLReduces("max", children[0]);
//     case "MEAN":
//       return new LLReduces("mean", children[0]);
//     case "Variable":
//       return new LLVariable(sliced);
//     case "Color":
//       return new LLColor(Color.colorFromString(sliced));
//     case "Number":
//       return new LLNumber(+sliced);
//     case "NumberCompares":
//     // console.log("asd", sliced, children);
//     case "LParen":
//     case "RParen":
//       return;
//     case "⚠":
//       console.log("error?", sliced, children);
//       return;
//     default:
//       // if (!sliced.length || sliced === "(" || sliced === ")") {
//       //   return;
//       // }
//       console.log(node.type.name, sliced, children);
//       // throw new Error("Invalid node");
//       return;
//   }
// }
