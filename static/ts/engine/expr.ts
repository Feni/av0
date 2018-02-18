/* Expression evaluation module */
import { Big } from 'big.js';
import * as util from '../utils';
import { castBoolean, isCell, formatValue } from '../utils';
import { Value, Group } from './engine';

// @ts-ignore
var jsep = require("jsep");
Big.RM = 2;     // ROUND_HALF_EVEN - banker's roll

// Create new cells as result, but don't bind or store in all cells list.
// TODO: What about names bound to this later?
function itemwiseApply(a, b, funcName, doFudge=false, func=undefined) {

    if(Array.isArray(a) && Array.isArray(b)){   // [a] * [b]
        // ASSERT BOTH ARE SAME LENGTH
        let resultList = a.map(function(ai, i) {
            let aVal = ai.evaluate();
            let bVal = b[i].evaluate();

            var result;
            if(func !== undefined){
                result = func(aVal, bVal)
            } else {
                result = aVal[funcName](bVal)
            }
            if(doFudge){
                result = util.fudge(result);
            }
            // let resultCell = new Value(ai.type, result, ai.env, ai.name);
            let resultCell = new Value(result, ai, ai.name);
            // resultCell.parent_group = aVal.parent_group;
            return resultCell
        });
        return resultList;
    }
    else if(Array.isArray(a)) { // [a] * 2
        let resultList = a.map((ai) => {
            let aVal = ai.evaluate();   // TODO: What if this is wrong type?

            var result;
            if(func !== undefined){
                result = func(aVal, b)
            } else {
                result = aVal[funcName](b)
            }

            if(doFudge){
                result = util.fudge(result);
            }
            // let resultCell = new Value(ai.type, result, ai.env, ai.name);
            let resultCell = new Value(result, ai, ai.name);
            // resultCell.parent_group = aVal.parent_group;
            return resultCell;
        })
        return resultList;

    } else if(Array.isArray(b)) {   // 2 * [a]
        let resultList = b.map((bi) => {
            let bVal = bi.evaluate();   // TODO: What if this is wrong type?

            var result;
            if(func !== undefined){
                result = func(a, bVal)
            } else {
                result = a[funcName](bVal)
            }


            if(doFudge){
                result = util.fudge(result);
            }
            // let resultCell = new Value(bi.type, result, bi.env, bi.name);
            let resultCell = new Value(result, bi, bi.name);
            // resultCell.parent_group = bVal.parent_group;
            return resultCell;
        })
        return resultList;

    } else {    // 1 + 2 : both are scalar values
        var result;
        if(func !== undefined){
            result = func(a, b)
        } else {
            result = a[funcName](b)
        }

        if(doFudge){
            result = util.fudge(result);
        }
        return result;
    }
}

function boolAnd(a: string, b: string) {
    if(util.isFalse(a) || util.isFalse(b)){
        // Return true regardless of type is one is known to be false.
        return false;
    } else if(util.isBoolean(a) && util.isBoolean(b)){
        // Else only evaluate in case of valid boolean values.
        return a && b;
    }
    return undefined;   // TODO: Undefined or null?
}

function boolOr(a: string, b: string) {
    if(util.isTrue(a) || util.isTrue(b)){
        return true;
    } else if(util.isBoolean(a) && util.isBoolean(b)){
        return a || b;
    }
    return undefined;
}

// Evaluate expression
var BINARY_OPS = {
    // TODO: Should other operations be fudged?
    "+" : (a: Big, b: Big) => { return itemwiseApply(a, b, "plus") },    // a.plus(b)
    "-" : (a: Big, b: Big) => { return itemwiseApply(a, b, "minus"); },
    "*" : (a: Big, b: Big) => { return itemwiseApply(a, b, "times", true); },
    "/" : (a: Big, b: Big) => { return itemwiseApply(a, b, "div", true); },
    "%" : (a: Big, b: Big) => { return itemwiseApply(a, b, "mod"); },

    //  TODO: itemwise support?
    "=" : (a: Big, b: Big) => { return itemwiseApply(a, b, "eq");},//
    ">" : (a: Big, b: Big) => { return itemwiseApply(a, b, "gt"); },
    ">=" : (a: Big, b: Big) => { return itemwiseApply(a, b, "gte"); },    // TODO
    "<" : (a: Big, b: Big) => { return itemwiseApply(a, b, "lt"); },
    "<=" : (a: Big, b: Big) => { return itemwiseApply(a, b, "lte"); },

    // "," : (a: Array, b: Array) => {
    //     console.log("Concatenating");
    //     if(Array.isArray(a)){
    //         return a.concat(b);     // Works even if b isn't an array
    //     } else {
    //         return [a].concat(b);
    //     }
    // },

    // TODO: Case insensitive AND, OR, NOT
    // TODO: Array operations on these.
    "and" : (a: string, b: string) => {
        return itemwiseApply(a, b, "", false, boolAnd);
    },
    "or" : (a: string, b: string) => {
        return itemwiseApply(a, b, "", false, boolOr);
    },
    "where": (a: Array<any>, b: Array<any>) => {
        return a.filter((aItem, aIndex) => b[aIndex].evaluate() == true)
    }
};


jsep.addBinaryOp("=", 6);
// TODO: Make these case insensitive as well
jsep.addBinaryOp("or", 1);
jsep.addBinaryOp("and", 2);
jsep.addBinaryOp("where", 0); // Should be evaluated after "=" and other conditionals. So < 6.

jsep.addUnaryOp("not"); //  TODO - guess

// TODO: Verify is boolean, else typos lead to true.
function unaryNot(a: boolean){
    if(Array.isArray(a)) {
        return a.map((aItem) => {
            return new Value(!aItem.evaluate(), aItem.env, aItem.name);
        })
    }
    return !a;
}


var UNARY_OPS = {
    "-" : (a: Big) => { return a.times(-1); },
    "not" : (a: boolean) => unaryNot(a)
};

export var BUILTIN_FUN = {
    'ROUND': {
        "name": "Round",
        "description": "Round a number",
        "func": Math.round,
        "args": [
            {
                "name": "Number",
                "description": "Number to round",
                "default": ""
            }
        ]
    },
    'SQRT': {
        "name": "Square Root",
        "description": "Find the square root of a number",
        "func": Math.sqrt,
        "args": [
            {
                "name": "Number",
                "description": "Number to sqrt",
                "default": ""
            }
        ]
    }
};


// TODO: Test cases to verify operator precedence
// @ts-ignore
export function _do_eval(node, context: Value) {
    if(node.type === "BinaryExpression") {
        // @ts-ignore
        return BINARY_OPS[node.operator](_do_eval(node.left, context), _do_eval(node.right, context));
    } else if(node.type === "UnaryExpression") {
        // @ts-ignore
        return UNARY_OPS[node.operator](_do_eval(node.argument, context));
    } else if(node.type === "Literal") {
        return util.castLiteral(node.value);
    } else if(node.type === "Identifier") {
        // Usually boolean's are literals if typed as 'true', but identifiers
        // if case is different.
        let bool = castBoolean(node.name);
        if(bool !== undefined){
            return bool;
        }

        let uname = node.name.toUpperCase();
        if(uname in BUILTIN_FUN) {
            return BUILTIN_FUN[uname];
        }

        console.log("options " + context.lookup(uname));

        let match = context.resolve(uname);
        // Found the name in an environment
        // if(idEnv !== null && idEnv !== undefined){
        // TODO: How to properly resolve multiple matches.
        console.log("Found match " + match);
        if(match !== null){
            return match.evaluate();
        }
        //}
        // TODO: Return as string literal in this case?
        // Probably not - should be lookup error
        return node.name
    } else if (node.type === "Compound") { // a, b
        let compound = [];
        node.body.forEach(subnode => {

            let subresult = _do_eval(subnode, context);

            // Wrap scalar constants in a Value so it can be rendered in CellList
            if(!Array.isArray(subresult) && !isCell(subresult)) {
                subresult = new Value(subresult, context);
            }
            compound = compound.concat(subresult);
        })
        return compound;
    } else if (node.type === "ThisExpression") {
        console.log(node);
        // Treat "this" as a non-keyword
        return "this"
    } else if (node.type === "MemberExpression") {
        // TODO
        // This.world
        return node
    } else if (node.type == "CallExpression") {​
        let func = _do_eval(node.callee, context);

        let args = [];
        node.arguments.forEach(subnode => {
            let subresult = _do_eval(subnode, context);
            // Wrap scalar constants in a Value so it can be rendered in CellList
            // if(!Array.isArray(subresult) && !isCell(subresult)) {
            //     subresult = new Value("", subresult, env, "");
            // }
            args = args.concat(subresult);
        });

        let result = func.apply(null, args);
        console.log("Func result");
        console.log(result);
        return result;
    } else {
        console.log("UNHANDLED eval CASE")
        console.log(node);

        // Node.type == Identifier
        // Name lookup
        // TODO: Handle name errors better.
        // TODO: Support [bracket name] syntax for spaces.
        return context.resolve(node.name).evaluate();
    }
};

// @ts-ignore
function getDependencies(node, context: Value) : Value[] {
    /* Parse through an expression tree and return list of dependencies */
    if(node.type === "BinaryExpression") {
        let left = getDependencies(node.left, context)
        let right = getDependencies(node.right, context);
        return left.concat(right);
    } else if(node.type === "UnaryExpression") {
        return getDependencies(node.argument, context);
    } else if(node.type === "Literal") {
        return []
    } else if(node.type === "Identifier") {
        let bool = castBoolean(node.name);
        if(bool != undefined){
            return [];
        }
        // todo LOOKUP NAME
        return [context.resolve(node.name)]
    } else {
        console.log("UNHANDLED eval CASE")
        console.log(node);

        // Node.type == Identifier
        // Name lookup
        // TODO: Handle name errors better.
        // TODO: Support [bracket name] syntax for spaces.
        return [context.resolve(node.name)];
    }
}

// @ts-ignore
export function evaluateExpr(parsed, context: Value) {
    if(parsed != null){
        return _do_eval(parsed, context);
    }
    return null;
}


export function parseFormula(expr: string){
    // Assert is formula
    // Return jsep expression
    let formula = expr.substring(1);
    if(util.isDefinedStr(formula)){
        let parsed = jsep(formula);
        return parsed;
    }
    return null;
}

// TODO: Factor this into dependency calculations
export function evaluateStr(strExpr: string, context: Value) {
    let pattern = /{{([^}]+)}}/g;   // Any string in {{ NAME }}
    let match = pattern.exec(strExpr);
    let strResult = strExpr;

    while (match != null) {
        let name = match[1];
        let ref = context.resolve(name);
        if(ref !== null) {
            let refEval = ref.evaluate();
            let value = formatValue(refEval);
            strResult = strResult.replace(new RegExp(match[0], "g"), value);
        }

        match = pattern.exec(strExpr);
    }
    return strResult;
}