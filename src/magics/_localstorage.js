

export function _localstorage(saveArgs) {


  const groups = Array.isArray(saveArgs?.[0]) ? saveArgs : [saveArgs];

  for (let [prop, key, event = 'jreact'] of groups) {
    if (!prop || !key) continue;

    // ✅ always target data first (your real state lives there)
    const hasData = this.data && Object.prototype.hasOwnProperty.call(this.data, prop);
    const get = () => (hasData ? this.data[prop] : this[prop]);
    const set = (v) => {
      if (hasData) this.data[prop] = v;
      else this[prop] = v;
    };

    // If neither exists, skip
    if (typeof get() === 'undefined') continue;

    // Restore
    const saved = localStorage.getItem(key);
    
    if (saved != null && saved !== '') {
      try {
        const parsed = JSON.parse(saved);
        

        // ✅ merge only for plain objects (NOT boolean/null/array)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const cur = get();
          if (cur && typeof cur === 'object') Object.assign(cur, parsed);
          else set(parsed);
        } else {
          set(parsed); // booleans/strings/numbers land here
        }
      } catch (e) {
        
      }
    }

    // Auto-save
    document.addEventListener('jreact', () => {
    //no even log if it has saved localstorage
      try {
        const value = JSON.stringify(get());
        
        localStorage.setItem(key, value);
      } catch (e) {
        
      }
    });

    // Manual save
    this.saveToLocal ??= {};
    this.saveToLocal[prop] = () => {
      try {
        localStorage.setItem(key, JSON.stringify(get()));
      } catch (e) {}
    };
  }
}

