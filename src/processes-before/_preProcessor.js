
export function _preProcessor(tpl) {
  //for now interpolation only
  // tpl = this._jfor?.(tpl) ?? tpl;
  tpl = this._j_load(tpl);
  tpl = this._drag(tpl);
  tpl = this._jfor(tpl);
  tpl = this._attrs(tpl);
  tpl = this._dynamicTag(tpl);
  tpl = this._if(tpl);
  // tpl = this._show(tpl);
  tpl = this._show(tpl);
  tpl = this._cs(tpl);
  tpl = this._st(tpl);
  return this._interpolation(tpl);
}
