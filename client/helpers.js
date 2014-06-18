/*
  Helper-functions, module-level namespace
*/
String.prototype.printf = function(){
  //http://stackoverflow.com/questions/610406/
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number){
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });
};

okCancelEvents = function (selector, callbacks) {
  // Returns an event map that handles the "escape" and "return" keys and
  // "blur" events on a text input (given by selector) and interprets them
  // as "ok" or "cancel".
  var ok = callbacks.ok || function () {},
      cancel = callbacks.cancel || function () {},
      events = {};

  events['keyup '+selector+', keydown '+selector] = function (evt) {
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
}, update_values = function(form, obj){
  updates = {};
  $(form).find("select,input,textarea").each(function(idx, inp){
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
    case "url":
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
}, moveUp = function(self, tr, Cls){
  var prev = tr.prev();
  if (prev.length===1){
    var sortIdx = self.sortIdx;
    Cls.update(self._id,
                {$set: {'sortIdx': parseInt(prev.attr('data-sortIdx'), 10) }});
    Cls.update(prev.attr('data-id'),
                {$set: {'sortIdx': sortIdx }});
  }
}, moveDown = function(self, tr, Cls){
  var next = tr.next();
  if (next.length===1){
    var sortIdx = self.sortIdx;
    Cls.update(self._id,
                {$set: {'sortIdx': parseInt(next.attr('data-sortIdx'), 10) }});
    Cls.update(next.attr('data-id'),
                {$set: {'sortIdx': sortIdx}});
  }
}, copyAsNew = function(obj){
  for(var key in obj){
    var val = obj[key];
    switch (typeof(val)) {
      case "boolean":
        $("input[name={0}]".printf(key)).prop('checked', val);
        break;
      default:
        $("input[name={0}]".printf(key)).val(val);
        $("textarea[name={0}]".printf(key)).val(val);
        break;
    }
  }
};

UI.registerHelper("formatDate", function(datetime, format) {
  var DateFormats = {
    short: "DD MMMM - YYYY",
    long: "dddd DD.MM.YYYY HH:mm"
  };
  if (moment) {
    f = DateFormats[format];
    return moment(datetime).format(f);
  } else {
    return datetime;
  }
});

UI.registerHelper("referenceFormat", function(name, url){
  var txt;
  if(url){
    txt = '<a href="' + url + ' "target="_blank" >' + name + "</a>";
  } else {
    txt = name;
  }
  return Spacebars.SafeString(txt);
});

UI.registerHelper("riskFormat", function(obj){
  var txt = obj.riskMid.toString();
  if(obj.riskLow && obj.riskHigh)
    txt = txt + " ({0}-{1})".printf(obj.riskLow, obj.riskHigh);
  if (obj.riskEstimated) txt = "[" + txt + "]";
  return txt;
});

UI.registerHelper("userCanEdit", function(){
  var myTbl = MyTbls.findOne({_id: Session.get('MyTbl_id')}),
      user = Meteor.user(),
      id = (user) ? user._id : undefined,
      ids = [myTbl.user_id];
  myTbl.user_roles.forEach(function(v){
    if(v.role !== "reviewers") ids.push(v.user_id);
  });
  return (ids.indexOf(id)>=0);
});
