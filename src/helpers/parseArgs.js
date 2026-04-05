import resolveDataPath from "./resolveDataPath.js";



/**
 * Attempts to parse a list of argument strings to real values.
 * Handles dynamic lookups from context as well.
 */
export default  function parseArgs(argsArray, context) {

    if (!Array.isArray(argsArray)) return [];

    return argsArray.map(arg => {
        if (typeof arg !== 'string') return arg;
        

        const raw = arg.trim();

        // Resolve dynamic path
        if (raw.match(/^[a-zA-Z_][a-zA-Z0-9_.\[\]]*$/)) {
            const value = resolveDataPath(context, raw);
            if (value !== undefined) return value;
        }

        // Primitives
        if (raw === 'true') return true;
        if (raw === 'false') return false;
        if (!isNaN(raw) && raw !== '') return Number(raw);

        return removeQuotes(raw);
    });
}


/**
 * Strips quotes from a string like "value" or 'value'
 */
function removeQuotes(str) {
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        return str.slice(1, -1);
    }
    return str;
}
