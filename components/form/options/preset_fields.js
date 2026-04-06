const __ = v => {
  return v;
}; //todo language file

export const fields_presets = {
  //for dev
  text: { title: __("Text"), key: "text", type: "input" },
  col: { title: __("Color"), key: "col", type: "input" },
  fs: { title: __("Font Size"), key: "fs", type: "range", ops:"fs" },

  jag: {
    title: __("Animate Group"),
    tip: __("Group animate plays animation one by one with 250ms delay"),
    key: "jag",
    type: "picker",
    ops: "ja"
  },

  anim: { title: __(""), key: "anim", type: "animate", ops:"ja" },
  //original
  // text: { title: __('Text'), key: 'text', type: 'editor', height: 300, placeholder: '<p>Start typing…</p>' },
  // col: { title: __('Color'), key: 'col', type: 'picker', ops: 'col' },
  // fs: { title: __('Font Size'), key: 'fs', type: 'range', ops: 'fs' },

  //re ordered by type
  //select-----------------------------------------
  grw: { title: __("Layout"), key: "grw", type: "select", ops: "grw" },
  h_ef_b: {
    title: `${__("Hover")} ${__("Effect")}`,
    key: "h_ef_b",
    type: "select",
    ops: "h_ef_b"
  },
  fw: { title: __("Font Weight"), key: "fw", type: "select", ops: "fw" },
  go: {
    title: __("Grid Options(don't use for flex)"),
    key: "go",
    type: "select",
    ops: "go",
    showIf: { w: ["g-container", "g-full", "g-fluid"] }
  },

  jc: {
    title: `${__("Justify")} ${__("Content")}`,
    key: "jc",
    type: "select",
    ops: "jc",
    showIf: { w: ["w-container", "w-full", "w-fluid"] }
  },
  ai: {
    title: `${__("Align")} ${__("Items")}`,
    key: "ai",
    type: "select",
    ops: "ai",
    showIf: { w: ["w-container", "w-full", "w-fluid"] }
  },
  fd: {
    title: `${__("Flex")} ${__("Direction")}`,
    key: "fd",
    type: "select",
    ops: "fd",
    showIf: { w: ["w-container", "w-full", "w-fluid"] }
  },

  fd_n: {
    title: `${__("Flex")} ${__("Direction")}`,
    key: "fd_n",
    type: "select",
    ops: "fd"
  }, //todo remove if not used

  fd_simple: {
    title: `${__("Menu Layout")}`,
    key: "fd_simple",
    type: "select",
    ops: "fd_simple"
  },

  //without conditions
  g_jc: {
    title: `${__("Justify")} ${__("Content")}`,
    key: "g_jc",
    type: "select",
    ops: "jc"
  },
  g_ai: {
    title: `${__("Align")} ${__("Items")}`,
    key: "g_ai",
    type: "select",
    ops: "ai"
  },
  g_fd: {
    title: `${__("Flex")} ${__("Direction")}`,
    key: "g_fd",
    type: "select",
    ops: "fd"
  },

  f_w: {
    title: `${__("Flex")} ${__("Wrap")}`,
    key: "f_w",
    type: "select",
    ops: "f_w",
    showIf: { w: ["w-container", "w-full", "w-fluid"] }
  },
  bs: { title: __("Shadow"), key: "bs", type: "select", ops: "bs" },
  m: { title: __("Margin"), key: "m", type: "select", ops: "m" },
  jc_b: {
    title: __("Justify Buttons"),
    key: "jc_b",
    type: "select",
    ops: "jc"
  },
  ph: {
    title: __("Padding Horizontaly"),
    key: "ph",
    type: "select",
    ops: "ph"
  },
  tp: {
    title: `${__("Background")}  ${__("Type")}`,
    key: "tp",
    type: "select",
    ops: "tp"
  },
  tp_no_img: {
    title: `${__("Background")}  ${__("Type")}`,
    key: "tp_no_img",
    type: "select",
    ops: "tp"
  },
  img_st: { title: __("Style"), key: "img_st", type: "select", ops: "img_st" },
  sub_menu: {
    title: `${__("Level")}`,
    key: "sub_menu",
    type: "select",
    ops: "sub_menu"
  },
  md_size: {
    title: `${__("Modal")} ${__("Width")}`,
    key: "md_size",
    type: "select",
    ops: "md_size"
  },
  menu_level: {
    title: `${__("Menu")} ${__("Level")}`,
    key: "menu_level",
    type: "select",
    ops: "menu_level"
  },
  lv: {
    title: `${__("Menu")} ${__("Level")}`,
    key: "lv",
    type: "select",
    ops: "lv"
  },

  submenu: {
    title: `${__("Submenu")} ${__("Effect")}`,
    key: "submenu",
    type: "select",
    ops: "submenu"
  },
  submenu_style: {
    title: `${__("Submenu")} ${__("Style")}`,
    key: "submenu_style",
    type: "select",
    ops: "submenu_style"
  },
  drop_side: {
    title: `${__("Drop to")}`,
    key: "drop_side",
    type: "select",
    ops: "drop_side",
    showIf: { fd_simple: ["fd-cr", "fd-c"] }
  },

  //picker  ------------------------------------------

  bg: { title: __("Background"), key: "bg", type: "picker", ops: "bg" },
  i_bg: {
    title: `${__("Items")} ${__("Background")}`,
    key: "i_bg",
    type: "picker",
    ops: "bg"
  },
  i_col: {
    title: `${__("Items")} ${__("Color")}`,
    key: "i_col",
    type: "picker",
    ops: "col"
  },
  icon_col: {
    title: `${__("Icon")} ${__("Color")}`,
    key: "icon_col",
    type: "picker",
    ops: "col"
  },
  icon_col: {
    title: `${__("Icon")} ${__("Color")}`,
    key: "icon_col",
    type: "picker",
    ops: "col"
  },
  h_col: {
    title: `${__("Headidng")} ${__("Color")}`,
    key: "h_col",
    type: "picker",
    ops: "col"
  },
  hover_bg: {
    title: `${__("Background")} ${__("Hover")}${__("(optionaly)")}`,
    key: "hover_bg",
    type: "picker",
    ops: "bg"
  },

  //range ------------------------------------------

  fs_h: {
    title: `${__("Title")} ${__("Size")}`,
    key: "fs_h",
    type: "range",
    ops: "fs"
  }, //rmi
  h_fs: {
    title: `${__("Title")} ${__("Size")}`,
    key: "h_fs",
    type: "range",
    ops: "fs"
  }, //rmi
  icon_fs: {
    title: `${__("Icon")} ${__("Size")}`,
    key: "icon_fs",
    type: "range",
    ops: "fs"
  },

  //checkbox ------------------------------------------
  ssp: { title: __("Autoplay"), key: "ssp", type: "checkbox" },
  check_but: { title: __("As Button"), key: "scheck_but", type: "checkbox" },

  //input ------------------------------------------

  slug: {
    title: `${__("URL")}`,
    key: "slug",
    type: "input",
    placeholder: "http:// or #id"
  },
  cls: { title: `SCC ${__("class(optionaly)")}`, key: "cls", type: "input" },
  title: { title: __("Title"), key: "title", type: "input" },
  desc: {
    title: __("Description"),
    key: "desc",
    type: "input",
    placeholder: "optionally..."
  },
  years: {
    title: `${__("Years")} ${__("(optionaly)")}`,
    key: "years",
    type: "input",
    placeholder: "optionally..."
  },

  //text area & editor ----------------------------
  //todo text change type to editor when it's ready

  text_h: {
    title: `${__("Text")}(${__("html allowed")})`,
    key: "text_h",
    type: "editor",
    height: 300,
    placeholder: "<p>Start typing…</p>"
  },
  s_text: {
    title: `${__("Text")}(${__("html")})`,
    key: "s_text",
    type: "editor",
    mode: "short",
    height: 300,
    placeholder: "<p>Start typing…</p>"
  },

  // not ordered by types

  //section
  a: {
    title: __("Group Animation"),
    tip: __(
      "Animation is applying for all elements of section, you can also add it for every separately, in elements"
    ),
    key: "a",
    type: "picker",
    ops: "a"
  },

  //gradient

  dir: {
    title: __("Gradient Direction"),
    key: "dir",
    type: "select",
    ops: "dir"
  },
  grad_dir: {
    title: __("Gradient Direction"),
    key: "grad_dir",
    type: "select",
    ops: "grad_dir",
    showIf: { bg_type: ["gr"] }
  }, //rmi
  bg1: {
    title: `${__("Start")} ${__("Color")}`,
    key: "bg1",
    type: "input",
    ops: "color"
  },
  bg2: {
    title: `${__("End")} ${__("Color")}`,
    key: "bg2",
    type: "input",
    ops: "color"
  },

  //sextion img

  img_on: {
    title: `${__("Background")} ${__("Image")}`,
    key: "img_on",
    type: "checkbox"
  },
  bp: { title: __("Position"), key: "bp", type: "select", ops: "bp" },
  ba: { title: __("Attachment"), key: "ba", type: "select", ops: "ba" },
  // img_on: { title: __('Background Image'), key: 'img_on', type: 'select', ops: 'yes_no'},
  // on: { title: __('Enanle'), key: 'on', type: 'checkbox'},
  // on: { title: __('Enanle'), key: 'on', type: 'select', ops: 'yes_no'},
  // s_src: { title: __('Image'), key: 's_src', type: 'media', showIf: { on: [true] } },
  // s_bp: { title: __('Position'), key: 's_bp', type: 'select', ops: 'bp', showIf: { on: [true] }  },
  // s_ba: { title: __('Attachment'), key: 's_ba', type: 'select', ops: 'ba', showIf: { on: [true] } },
  // s_blur: { title: __('Image Blur'), key: 's_blur', type: 'range', ops: 'blur', showIf: { on: [true] } },
  // s_opacity: { title: __('Image Opacity'), type: 'range', ops: 'opacity', showIf: { on: [true] } },

  //todo remove not used in para below
  // bp: { title: __('Image Position'), key: 'bp', type: 'select', ops: 'bp', showIf: { bg_type: ['img'] } },
  // ba: { title: __('Image Attachment'), key: 'ba', type: 'select', ops: 'ba', showIf: { bg_type: ['img'] } },
  //todo!!! replace with "fb"
  blur: { title: __("Image Blur"), key: "blur", type: "range", ops: "blur" },
  fb: {
    title: __("Image Blur"),
    key: "fb",
    type: "range",
    ops: "blur",
    showIf: { bg_type: ["img"] }
  },
  //todo!!! replace with "o"
  opacity: {
    title: __("Image Opacity"),
    tip: __(
      "Useful for creating contrast backgroumd - for example set background image Black and opacity 5(0.5)"
    ),
    key: "opacity",
    type: "range",
    ops: "opacity"
  },
  o: {
    title: __("Image Opacity"),
    tip: __(
      "Useful for creating contrast backgroumd - for example set background image Black and opacity 5(0.5)"
    ),
    key: "o",
    type: "range",
    ops: "opacity",
    showIf: { bg_type: ["img"] }
  },
  img: {
    title: `${__("Image")}${__("(optionaly)")}`,
    key: "img",
    type: "media",
    showIf: { bg_type: ["img"] }
  },

  bg_type: {
    title: __("Background Type"),
    key: "bg_type",
    type: "select",
    ops: "bg_type"
  },

  bg0: {
    title: __("Background"),
    key: "bg0",
    type: "picker",
    ops: "bg",
    showIf: { bg_type: ["bg"] }
  },

  trg: { title: __("Open in:"), key: "trg", type: "select", ops: "trg" },

  //existed
  tip: { title: __("tip"), key: "tip", type: "tip" },

  icon: {
    title: `${__("Icon")}${__("(optionaly)")}`,
    key: "icon",
    type: "picker",
    ops: "icons"
  },
  icon_def: {
    title: `${__("Icon")} ${__("Default")}${__("(optionaly)")}`,
    key: "icon_def",
    type: "picker",
    ops: "icons"
  }, //rmi

  button: {
    title: __("Button"),
    tip: __("If no button, but link exist whole element will be a link"),
    key: "button",
    type: "checkbox",
    ops: "icons"
  }, //rmi
  but: {
    title: __("Button Style"),
    tip: __("If no button, but link exist whole element will be a link"),
    key: "but",
    type: "select",
    ops: "but"
  }, //rmi
  url: { title: `${__("Link")}`, key: "url", type: "input" },
  target: {
    title: __("Open in"),
    key: "target",
    type: "select",
    ops: "target",
    showIf: { url: true }
  },
  link_text: {
    title: __("Link Text"),
    key: "link_text",
    type: "input",
    showIf: { url: true, button: true }
  },

  dir_main: {
    title: __("Position Content/Media"),
    key: "dir_main",
    type: "select",
    ops: "fd"
  },
  dir_title: {
    title: __("Heading Position"),
    key: "dir_title",
    type: "select",
    ops: "fd"
  },
  dir_conent: {
    title: __("Text/Buttons Position"),
    key: "dir_conent",
    type: "select",
    ops: "fd"
  },

  //logo

  effect: { title: __("Effect"), key: "effect", type: "select", ops: "effect" },
  logo_text: {
    title: __("Text"),
    key: "logo_text",
    type: "input",
    showIf: { logo_type: ["text"] }
  },
  slogan: {
    title: __("Slogan"),
    key: "slogan",
    type: "input",
    showIf: { logo_type: ["text"] }
  },
  logo_icon: {
    title: `${__("Icon")}${__("(optionaly)")}`,
    key: "logo_icon",
    type: "picker",
    ops: "icons",
    showIf: { logo_type: ["text"] }
  },
  logo_type: {
    title: __("Type"),
    key: "logo_type",
    type: "select",
    ops: "logo_type"
  },
  logo_img: {
    title: __("Image"),
    key: "logo_img",
    type: "media",
    showIf: { logo_type: ["img"] }
  },

  //width---
  w: { title: __("Container"), key: "w", type: "select", ops: "w" },
  // go: { title: __("Grid Options(don't use for flex)"), key: 'go', type: 'select', ops: 'go', showIf: { w: ['g-container', 'g-full'] } },
  // wg: { title: __('Grid Width88'), key: 'wg', type: 'select', ops: 'wg' },
  gr: { title: __("Grid Layout"), key: "gr", type: "select", ops: "gr" },
  wi: {
    title: __("Width"),
    tip: __(
      'Width of element, but if you want all element same width you can set "Child Width in section settings"'
    ),
    key: "wi",
    type: "select",
    ops: "wi"
  },
  wc: {
    title: __("Child Elements Width"),
    tip: __('Makes child elements of block width"'),
    key: "wc",
    type: "select",
    ops: "wc"
  },

  symbol_mode: {
    title: __("Symbol Mode"),
    key: "symbol_mode",
    type: "select",
    ops: "symbol_mode"
  },
  icon_place: {
    title: __("Where to display icon"),
    key: "icon_place",
    type: "select",
    ops: "icon_place"
  },

  html: {
    title: __("Enter HTML code"),
    key: "html",
    type: "textarea",
    ops: "big"
  },

  src: { title: __("Image"), key: "src", type: "media" },
  i_tag: { title: __("Tag"), key: "i_tag", type: "select", ops: "i_tag" },
  i_url: {
    title: __("Link"),
    key: "i_url",
    type: "input",
    ops: "i_url",
    showIf: { i_tag: "a" }
  },

  media_type: {
    title: __("Media Type"),
    key: "media_type",
    type: "select",
    ops: "media_type"
  },
  thumb: {
    title: __("Video Thumbnail"),
    key: "thumb",
    type: "media",
    showIf: { media_type: ["video"] }
  },
  media: {
    title: __("Add Media"),
    key: "media",
    type: "media",
    showIf: { media_type: ["img", "video"] }
  },
  link_style: {
    title: __("Button Background"),
    key: "link_style",
    type: "picker",
    ops: "bg"
  },

  ssa: { title: __("Slide Animation"), key: "ssa", type: "select", ops: "ssa" },
  ssi: {
    title: __("Duration"),
    key: "ssi",
    type: "range",
    ops: { min: 3000, max: 10000, step: 1000 }
  },
  ssr: {
    title: __("Ratio"),
    key: "ssr",
    type: "range",
    ops: { min: 3, max: 12, step: 1 }
  },

  h_ja: {
    title: __("Animate Heading"),
    key: "h_ja",
    type: "picker",
    ops: "ja"
  },
  t_ja: { title: __("Animate Text"), key: "t_ja", type: "picker", ops: "ja" },
  b_ja: { title: __("Animate Button"), key: "b_ja", type: "picker", ops: "ja" },

  //rmi!!! remove below if not used media box
  an_h: {
    title: __("Animate Heading"),
    key: "an_h",
    type: "picker",
    ops: "ja"
  },
  an_t: { title: __("Animate Text"), key: "an_t", type: "picker", ops: "ja" },
  an_b: {
    title: __("Animate Button 1"),
    key: "an_b1",
    type: "picker",
    ops: "ja"
  },
  an_b1: {
    title: __("Animate Button 1"),
    key: "an_b1",
    type: "picker",
    ops: "ja"
  },
  an_b2: {
    title: __("Animate Button 2"),
    key: "an_b2",
    type: "picker",
    ops: "ja"
  },
  an_m: { title: __("Animate Media"), key: "an_m", type: "picker", ops: "ja" },
  br_m: {
    title: __("Media Border Radius"),
    key: "br_m",
    type: "range",
    ops: "br"
  },

  w_m: { title: __("Media Width"), key: "w_m", type: "select", ops: "wi" },

  jc_c: {
    title: __("Vertical alignment"),
    key: "jc_c",
    type: "select",
    ops: "jc"
  },
  ai_c: {
    title: __("Horizontal alignment"),
    key: "ai_c",
    type: "select",
    ops: "ai"
  },

  url_1: {
    title: __("Link 1"),
    key: "url_1",
    type: "input",
    placeholder: "http:// or #"
  },
  button1: {
    title: __("Button Text 1"),
    key: "button1",
    type: "input",
    showIf: { media_type: [""] }
  },
  url_2: {
    title: __("Link 2"),
    key: "url_2",
    type: "input",
    placeholder: "http:// or #"
  },
  button2: {
    title: __("Button Text 2"),
    key: "button2",
    type: "input",
    showIf: { media_type: [""] }
  },

  g: { title: __("Gap Between"), key: "g", type: "select", ops: "g" },
  filter: { title: __("Filter"), key: "filter", type: "select", ops: "filter" },
  //special
  ss_v: {
    title: __("Content Vertical"),
    key: "ss_v",
    type: "select",
    ops: "ss_v"
  },
  ss_h: {
    title: __("Content Horizontal"),
    key: "ss_h",
    type: "select",
    ops: "ss_h"
  },

  br: { title: __("Border Radius"), key: "br", type: "range", ops: "br" },
  p: { title: __("Padding"), key: "p", type: "select", ops: "p" },
  p_card: {
    title: __("Padding Whole Card"),
    key: "p_card:",
    type: "select",
    ops: "p"
  },
  link_color: {
    title: __("Link Color"),
    key: "link_color",
    type: "picker",
    ops: "col"
  },
  //content fields

  // text: { title: __('Text'), key: 'text', type: 'textarea' },
  tag: { title: __("Tag"), key: "tag", type: "select", ops: "tag" }, //w- means - Wisth Item
  pos: { title: __("Position"), key: "pos", type: "select", ops: "pos" },
  h_style: {
    title: __("Style"),
    key: "h_style",
    type: "select",
    ops: "h_style"
  },
  h_style_less: {
    title: `${__("Heading")} ${__("Style")}`,
    key: "h_style_less",
    type: "select",
    ops: "h_style_less"
  },

  //
  show_caption: {
    title: __("Show Caption"),
    key: "show_caption",
    type: "checkbox"
  },
  pos_a: { title: __("Position Absolute"), key: "pos_a", type: "checkbox" },
  use_top: {
    title: __("Use top"),
    key: "use_top",
    type: "checkbox",
    showIf: { pos_a: true }
  },
  top: {
    title: __("top"),
    key: "top",
    type: "range",
    ops: "abs_pos",
    showIf: { use_top: true, use_top: true }
  },
  use_right: {
    title: __("Use right"),
    key: "use_right",
    type: "checkbox",
    showIf: { pos_a: true }
  },
  right: {
    title: __("right"),
    key: "right",
    type: "range",
    ops: "abs_pos",
    showIf: { use_right: true }
  },
  use_bottom: {
    title: __("Use bottom"),
    key: "use_bottom",
    type: "checkbox",
    showIf: { pos_a: true }
  },
  bottom: {
    title: __("bottom"),
    key: "bottom",
    type: "range",
    ops: "abs_pos",
    showIf: { use_bottom: true }
  },
  use_left: {
    title: __("Use left"),
    key: "use_left",
    type: "checkbox",
    showIf: { pos_a: true }
  },
  left: {
    title: __("left"),
    key: "left",
    type: "range",
    ops: "abs_pos",
    showIf: { use_left: true }
  }
};
