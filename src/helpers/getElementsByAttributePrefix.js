export default function getElementsByAttributePrefix(prefixes, str, type = '*') {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  const elements = doc.querySelectorAll(type);
  const matchedElements = [];

  elements.forEach((el) => {
    for (const attr of el.attributes) {
      if (prefixes.some((prefix) => attr.name.startsWith(prefix))) {
        matchedElements.push(el);
        break;
      }
    }
  });

  return { doc, matchedElements };
}
