


export default function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    return Array.isArray(obj) 
        ? obj.map(item => deepClone(item))
        : Object.keys(obj).reduce((acc, key) => {
            acc[key] = deepClone(obj[key]);
            return acc;
        }, {});
}
