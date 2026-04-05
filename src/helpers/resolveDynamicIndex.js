 import isStaticOrDynamic from "./isStaticOrDynamic.js";

/**
 * Fallback resolver for paths with mixed dot/array access, similar to resolveDataPath.
 * Mostly for legacy or one-off needs.
 */
export default function resolveDynamicIndex(str, ctx) {
    const parts = str.split('.');
    
    let current = ctx;
    

    for (let part of parts) {
        if (!current) break;

        const match = part.match(/^([a-zA-Z0-9_$]+)\[([^\]]+)\]$/);
        if (match) {
            let base = match[1];
            let indexKey = match[2];
            let index = isStaticOrDynamic(ctx, indexKey);

            current = current[base];
            if (Array.isArray(current)) {
                current = current[index];
            } else {
                current = undefined;
            }
        } else {
            current = current[part];
        }
    }

    return current;
}