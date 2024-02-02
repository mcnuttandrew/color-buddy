// This file was generated by lezer-generator. You probably shouldn't edit it.
import {LRParser} from "@lezer/lr"
const spec_Identifier = {__proto__:null,ALL:8, ",":12, WHERE:14, index:28, COUNT:36, SUM:40, AVG:44, MIN:48, MAX:52, "+":60, "-":64, "*":68, "/":72, "<":74, ">":78, "!=":82, "==":86, true:92, false:94, OR:96, AND:100, NOT:104}
export const parser = LRParser.deserialize({
  version: 14,
  states: "+^OVQPOOOOQO'#Ca'#CaO!TQPO'#CyOVQPO'#CyOOQO'#Cw'#CwOOQO'#Cf'#CfOOQO'#Cd'#CdO!uQPO'#DhOOQO'#Dg'#DgQOQPOOO#TQPO'#C^O#YQPO'#CiO#_QPO'#CmO#dQPO'#CoO#iQPO'#CqO#nQPO'#CsO#sQPO'#CuO#xQPO'#CxO$WQPO'#CeOOQO'#DZ'#DZO$fQPO'#DYO$nQPO'#DaO$yQPO,59eO%[QPO,5:SO%aQPO,58xO#TQPO,59TO#TQPO,59XO#TQPO,59ZO#TQPO,59]O#TQPO,59_O#TQPO,59aO%iQPO,59dO%iQPO,59gO%iQPO,59iO%iQPO,59kO%wQPO,59PO%wQPO,59nO%wQPO,59pO%wQPO,59rO$nQPO,59tO$nQPO,59yOOQO'#Dh'#DhOVQPO'#DhOOQO,59{,59{OOQO1G/P1G/POOQO1G/n1G/nO&iQPO1G.dO#TQPO'#DcOVQPO1G.dO&qQPO1G.oO&vQPO1G.sO&{QPO1G.uO'QQPO1G.wO'VQPO1G.yO'[QPO1G.{OOQO'#Cy'#CyO%wQPO'#CyOOQO1G/O1G/OOOQO1G/R1G/ROOQO1G/T1G/TOOQO1G/V1G/VOOQO1G.k1G.kOOQO1G/Y1G/YOOQO1G/[1G/[OOQO1G/^1G/^OOQO1G/`1G/`OOQO1G/e1G/eOOQO-E7a-E7aOVQPO7+$OOOQO,59},59}OOQO7+$O7+$OOOQO7+$Z7+$ZOOQO7+$_7+$_OOQO7+$a7+$aOOQO7+$c7+$cOOQO7+$e7+$eOOQO7+$g7+$gO'aQPO,59eOOQO<<Gj<<Gj",
  stateData: "'f~O!YOS~ORPOSYOZQO[QO^ZO_ROb[Od]Of^Oh_Oj`O!OcO!PcO!UeO~OnmXpmXrmXtmXuYXwYXyYX{YX`YX!WYX~O!Q![X!S![X!W!ZX`!ZX~ORPO~O_iO~O_jO~O_kO~O_lO~O_mO~O_nO~OnoOppOrqOtrO~OusOwtOyuO{vO~O!QwO!SxO~O_zO!OcO!PcO~O`|OusOwtOyuO{vO~O`}O~OU!POV!QO~ORPOZ!XO[!XO_!YO~ORPOZQO[QO^ZO_!YOb[Od]Of^Oh_Oj`O~OU!POV!fO~O`!iO~O`!jO~O`!kO~O`!lO~O`!mO~O`!nO~O`|O~O",
  goto: "&T!]PP!^PP!ePP!^#a#hPP$QPPP$QP$QP$QP$QP$QP$Q$^$jP$^P$^P$^PP#aP#aP#aP!^%SPPP!^P!^P%`PPP%f%sZWORz!Q!fdQORstuvz!Q!Y!fQhYQ!RiQ!SjQ!TkQ!UlQ!VmQ!WnW!XopqrR!g!PZUORz!Q!fWbOz!Q!fQfRQ!_sQ!`tQ!auQ!bvR!o!YeTORstuvz!Q!Y!feSORstuvz!Q!Y!fdaORstuvz!Q!Y!fQ!ZoQ![pQ!]qR!^rYVORz!Q!fVyewxQ!OhR!e!OQXOSgRzQ!h!QR!p!fYdORz!Q!fQ{eQ!cwR!dx",
  nodeNames: "⚠ Program AllQuantifier Identifier ALL Variable , WHERE NumberCompares LessThanExpression ValueExpression Number String IndexFunction index LParen RParen CountFunction COUNT SumFunction SUM AvgFunction AVG MinFunction MIN MaxFunction MAX NumberManipulation AddExpression SimpleValue + SubtractExpression - MultiplyExpression * DivideExpression / < GreaterThanExpression > NotEqualExpression != EqualExpression == OrExpression BooleanExpression true false OR AndExpression AND NotExpression NOT",
  maxTerm: 58,
  skippedNodes: [0],
  repeatNodeCount: 1,
  tokenData: "$[~RaX^!Wpq!Wrs!{xy#jyz#o!Q![#t!c!}#|#R#S#|#T#o#|#y#z!W$f$g!W#BY#BZ!W$IS$I_!W$I|$JO!W$JT$JU!W$KV$KW!W&FU&FV!W~!]Y!Y~X^!Wpq!W#y#z!W$f$g!W#BY#BZ!W$IS$I_!W$I|$JO!W$JT$JU!W$KV$KW!W&FU&FV!W~#OTOr!{rs#_s;'S!{;'S;=`#d<%lO!{~#dO[~~#gP;=`<%l!{~#oO_~~#tO`~~#yPZ~!Q![#t~$RRR~!c!}#|#R#S#|#T#o#|",
  tokenizers: [0],
  topRules: {"Program":[0,1]},
  specialized: [{term: 3, get: (value) => spec_Identifier[value] || -1}],
  tokenPrec: 0
})
