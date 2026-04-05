 import resolveDataPath from "./resolveDataPath.js";
 /**
  * New - Determines if a value is a static string/number or a dynamic path, and returns the actual value
 * Replaced current isStaticOrDynamic in - executeMethod...
  */
 export default function isStaticOrDynamic(obj, value) {
     value = value.trim();
  
     // Check for static quoted strings
     if (value.startsWith("'") && value.endsWith("'")) {
         const val = value.slice(1, -1);
         if (val === 'true') return true;
         if (val === 'false') return false;
         return val;
     }
 
     // Check for boolean literals
     if (value === 'true') return true;
     if (value === 'false') return false;
 
     // Check for numbers
     if (!isNaN(value)) {
         return Number(value);
     }
 
     // Try dynamic path lookup
     const resolved = resolveDataPath(obj, value);
     // console.log(`[isStaticOrDynamic] resolved "${value}" to:`, resolved);
 
     //todo find out if necessary add to dev console
     // if (resolved === undefined) {
     //     console.warn(`[isStaticOrDynamic] could not resolve dynamic path "${value}"`);
     // }
 
     return resolved;
 }
