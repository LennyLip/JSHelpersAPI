const UNITS = {
    DISTANCE: {
        mm: 'millimeters',
        cm: 'centimeters',
        km: 'kilometers',
        ft: 'feet',
        mi: 'miles',
    },
    TIME: {
        ms: 'milliseconds',
        min: 'minutes',
        hr: 'hours',
        d: 'days',
        wk: 'weeks',
    },
    MASS: {
        mg: 'milligrams',
        g: 'grams',
        oz: 'ounces',
    },
};

UNITS['SPEED'] = (() => {
    const distanceO = { m: 'meters', ...UNITS.DISTANCE };
    const timeO = { s: 'seconds', ...UNITS.TIME };

    const speedO = {};
    Object.keys(distanceO).forEach(function(keyDist) {
        Object.keys(timeO).forEach(function(keyTime) {
            if (!(keyDist === 'm' && keyTime === 's')) {
                // exclude SI unit
                speedO[keyDist + '/' + keyTime] = distanceO[keyDist] + '/' + timeO[keyTime];
            }
        });
    });

    return speedO;
})();

const getInputUnits = (withoutSI) => {
    let INPUT_UNITS = withoutSI ? [] : ['s', 'm', 'kg', 'm/s'];
    Object.getOwnPropertyNames(UNITS)
        .map(key => [key, Object.getOwnPropertyDescriptor(UNITS, key)])
        .filter(([key, descriptor]) => descriptor && typeof descriptor !== 'string' && descriptor.enumerable === true)
        .map(([key]) => key)
        .forEach(function(key) {
            INPUT_UNITS = INPUT_UNITS.concat(Object.keys(UNITS[key]));
        });
    return INPUT_UNITS;
};

const INPUT_UNITS = getInputUnits();

const parseToValueUnit = (input) => {
    // trim backslash and spaces
    input = input.replace(/^[\\\s]+|[\\\s]+$/gm, '');

    const unitsArr = INPUT_UNITS;
    // check for longer unit name firstly
    unitsArr.sort(function(a, b) {
        return b.length - a.length;
    });

    for (let i = 0; i < unitsArr.length; i++) {
        const unit = unitsArr[i];
        const foundIndex = input.indexOf(unit, input.length - unit.length);
        if (foundIndex !== -1) {
            // replace all char and spaces in value
            const val = input.substring(0, foundIndex).replace(/[^0-9*^.-]+/g, '');
            return [val, unit];
            // return [parseFloat(val), unit];
        }
    }
    return null;
};

/**
 * Replace unsupported Latex by js-quantities
 * @param stringFromMQ string from MathQuill latex
 */
const replaceLatexFormulas = (stringFromMQ) => {
    stringFromMQ = stringFromMQ.replace(/\\class{strikethrough}{(\S+)}/, '$1');
    // remove backslash with whitespace
    stringFromMQ = stringFromMQ.replace(/\\ /g, ' ');
    stringFromMQ = stringFromMQ.replace(/\\frac{(\S+)}{(\S+)}/, '$1/$2');
    // convert scientific notation
    stringFromMQ = stringFromMQ.replace(/\\cdot/g, '*');
    stringFromMQ = stringFromMQ.replace(/\^{\s*(\S+)\s*}/, '^($1)'); // fix for math.parser()
    return stringFromMQ;
};

module.exports = {parseToValueUnit, replaceLatexFormulas}