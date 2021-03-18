var express = require('express');
var router = express.Router();

const evaluatex = require("evaluatex");
// import { parseToValueUnit, replaceLatexFormulas } from './unitConversionBase';
const { parseToValueUnit, replaceLatexFormulas } = require('./unitConversionBase');

/**
 * convert Mathquill Latex text to evaluated math value + unit (if exist), return the input text if parse error
 * @param text: string from MathQuill latex
 */
function convertMQToEvaluatedMath(text) {
    text = replaceLatexFormulas(text);
    const parsedToValUnit = parseToValueUnit(text);
    // if parseToValueUnit is null then text have no units
    let newText = text.slice();
    if (parsedToValUnit) {
        newText = parsedToValUnit[0];
    }
    // we don't want to change text!!!!
    try {
        let evaluatedMathText = `${evaluatex(newText)()}`;
        if (parsedToValUnit) {
            // value + unit
            evaluatedMathText = `${evaluatedMathText}${parsedToValUnit[1]}`;
        }
        return evaluatedMathText;
    } catch (e) {
        // direct user's typed text if fault
        return text;
        // draft.reducerData.answer.content.evaluatedMathText = text;
    }
}


/* convert mathLatex to evaluated value */
router.post('/', function(req, res, next) {
    const mathLatex = req.body.mathLatex;
    if (!mathLatex) {
        res.send('mathLatex param required');
    }
    res.send(convertMQToEvaluatedMath(mathLatex));
});



module.exports = router;
