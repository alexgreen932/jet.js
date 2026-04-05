// helpers/handleOn.js
export default function handleOn(el, attr, value, context) {
  const eventWithMods = attr.name.slice(3); // "click.prevent.stop"
  const parts = eventWithMods.split('.');
  const baseEvent = parts[0];
  const mods = parts.slice(1).filter(Boolean);

  const meta = { mods, type: '', prop: '', value: '', method: '', args: '' };

  // 1) title='New Title'
  if (value.includes('=')) {
    const idx = value.indexOf('=');
    meta.type = 'set';
    meta.prop = value.slice(0, idx).trim();
    meta.value = value.slice(idx + 1).trim();

    // авто-prevent для set (как у тебя раньше)
    if (!meta.mods.includes('prevent')) meta.mods.push('prevent');
  }
  // 2) myMethod(1,'x') или myMethod
  else {
    meta.type = 'call';

    const match = value.match(/^([a-zA-Z_$][\w$]*)\((.*)\)$/);
    if (match) {
      meta.method = match[1];
      meta.args = (match[2] || '').trim();
    } else {
      meta.method = value.trim();
      meta.args = '';
    }
  }

  // ✅ ВАЖНО: кодируем JSON, чтобы Jet { } интерполяция не сломала строку
  const encoded = encodeURIComponent(JSON.stringify(meta));
  // console.log(`%c meta: ${meta}`, $.grey);
  // console.log(`%c encoded: ${encoded}`, $.grey);
  // console.log(`%b el: ${el}`, $.grey );
  el.setAttribute(`event_${baseEvent}`, encoded);

  // удаляем исходный on-* атрибут
  // el.removeAttribute(attr.name);//uncom prod
}
