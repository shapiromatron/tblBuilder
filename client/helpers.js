/*
  Helper-functions, module-level namespace
*/
okCancelEvents = function (selector, callbacks) {
  // Returns an event map that handles the "escape" and "return" keys and
  // "blur" events on a text input (given by selector) and interprets them
  // as "ok" or "cancel".
  var ok = callbacks.ok || function () {},
      cancel = callbacks.cancel || function () {},
      events = {};

  events['keyup '+selector+', keydown '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);
      } else if (evt.type === "keyup" && evt.which === 13) {
        // return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };

  return events;
}, activateInput = function (input) {
  input.focus();
  input.select();
}, update_values = function(tmpl, obj){
  updates = {};
  tmpl.findAll("input").each(function(idx, inp){
    var val = get_value(inp),
        key = inp.name;
    if (obj[key] !== val) updates[key] = val;
  });
  return updates;
}, new_values = function(tmpl){
  var obj = {};
  tmpl.findAll("select,input,textarea").each(function(idx, inp){
    obj[inp.name] = get_value(inp);
  });
  return obj;
}, get_value = function(inp){
  var val;
  switch (inp.type) {
    case "text":
    case "hidden":
    case "textarea":
      val = inp.value;
      break;
    case "number":
      val = parseFloat(inp.value, 10);
      break;
    case "checkbox":
      val = inp.checked;
      break;
    case "select-one":
      val = $(inp).find('option:selected').val();
      break;
  }
  return val;
}, return_excel_file = function(raw_data, fn){
  fn = fn || "download.xlsx";
  var s2ab = function(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
  }, blob = new Blob([s2ab(raw_data)], {type: "application/octet-stream"});
  saveAs(blob, fn);
};

UI.registerHelper("formatDate", function(datetime, format) {
    var DateFormats = {
        short: "DD MMMM - YYYY",
        long: "dddd DD.MM.YYYY HH:mm"
    };
    if (moment) {
        f = DateFormats[format];
        return moment(datetime).format(f);
    }
    else {
        return datetime;
    }
});
