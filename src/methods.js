

//VDOM -------------------------------
export { _htmlToArray } from './vdom/_htmlToArray.js';
export *  from './vdom/all.js'; //all necessary merthod for vDOM(can be divided for separate files for better editings)
export { _proxy } from './vdom/_proxy.js';
export { _data_update_checker } from './vdom/_data_update_checker.js';
// export { isStore, subscribeStore } from "./vdom/store.js";


//processes before--------------------
export { _preProcessor } from './processes-before/_preProcessor.js';
export { _jfor } from './processes-before/_jfor.js';
export { _if } from './processes-before/_if.js';

export * from './processes-before/_show.js';
// export { _showBefore, _showAfter } from './processes-both/_show.js';
// export * from './processes-both/_show.js';

export { _interpolation } from './processes-before/_interpolation.js';
export { _attrs } from './processes-before/_attrs.js';
export { _propsToData } from './processes-before/_propsToData.js';
export { _j_load } from './processes-before/_j_load.js';
export { _dynamicTag } from './processes-before/_dynamicTag.js';
export { _cs } from './processes-before/_cs.js';
export { _st } from './processes-before/_st.js';

//old checker

// export { _update_checker } from './processes-before/_update_checker.js';

//processes after -------------------
export { _executeMethod } from './processes-after/_executeMethod.js';
export { _events } from './processes-after/_events.js';
export { _model } from './processes-after/_model.js';
export * from './processes-after/_drag.js';


//magics
export * from './magics/small-methods.js';
export { _css } from './magics/_css.js';
export { _localstorage } from './magics/_localstorage.js';

//globals
export { _toggle } from './globals/_toggle.js';

//goodies
export { $fetch } from './goodies/fetch.js';
export * from './goodies/small-methods.js';
// export { $filterFields } from './goodies/small-methods.js';
export { _filterFields } from './goodies/filterFields.js';

//utils
export { __ } from './utils/__.js';
//helpers 



//todo distribute into new directions
// import * as componentMethods from "../methods/index.js";
// import * as smallMethods from "../methods/small-methods.js";
// import * as goodies from "../methods/goodies.js"; //jet.engine only, maybe some will be included im core
// import installMethods from "../methods/installMethods.js";
// import { isStore, subscribeStore } from "./store.js";
// import { shortList } from "../helpers/shortList.js";
// import _proxy from './utils/_proxy';
// import _proxy from './methods/_proxy';


