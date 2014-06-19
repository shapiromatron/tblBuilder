getValue = (inp) ->
    val = undefined
    switch inp.type
        when "text", "hidden", "textarea", "url"
            val = inp.value
        when "number"
            val = parseFloat(inp.value, 10)
        when "checkbox"
            val = inp.checked
        when "select-one"
            val = $(inp).find('option:selected').val()
        else
            console.log('input not recognized')
    return val

share.activateInput = (input) ->
    input.focus()
    input.select()

share.updateValues = (form, obj) ->
    updates = {}
    for inp in $(form).find("select,input,textarea")
        val = getValue(inp)
        key = inp.name
        if obj[key] isnt val then updates[key] = val
    return updates

share.newValues = (tmpl) ->
  obj = {}
  for inp in $(tmpl.find('form')).find("select,input,textarea")
    obj[inp.name] = getValue(inp)
  return obj

share.returnExcelFile = (raw_data, fn) ->
    fn = fn or "download.xlsx"
    s2ab = (s) ->
        buf = new ArrayBuffer(s.length)
        view = new Uint8Array(buf)
        view[i] = s.charCodeAt(i) & 0xFF for i in [0..s.length]
        return buf
    blob = new Blob([s2ab(raw_data)], {type: "application/octet-stream"})
    saveAs(blob, fn)

share.moveRow = (self, tr, Cls, moveUp) ->
    swap = if moveUp then tr.prev() else tr.next()
    prev = tr.prev()
    if swap.length is 1
        sortIdx = self.sortIdx
        Cls.update(self._id,
                {$set: {'sortIdx': parseInt(swap.attr('data-sortIdx'), 10) }})
        Cls.update(swap.attr('data-id'),
                {$set: {'sortIdx': sortIdx }})

share.copyAsNew = (obj) ->
    for key, val of obj
        switch typeof(val)
            when "boolean"
                $("input[name=#{key}]").prop('checked', val)
            else
                $("input[name=#{key}]").val(val)
                $("textarea[name=#{key}]").val(val)


UI.registerHelper "formatDate", (datetime, format) ->
    DateFormats =
        short: "DD MMMM - YYYY",
        long: "dddd DD.MM.YYYY HH:mm"

    if moment
        f = DateFormats[format]
        return moment(datetime).format(f)
    else
        return datetime

UI.registerHelper "referenceFormat", (name, url) ->
    txt = name
    if(url) then txt = "<a href='#{url}' target='_blank'>#{name}</a>"
    return Spacebars.SafeString(txt)

UI.registerHelper "riskFormat", (obj) ->
    txt = obj.riskMid.toString()
    if (obj.riskLow and obj.riskHigh)
        txt += " (#{obj.riskLow}-#{obj.riskHigh})"
    if obj.riskEstimated then txt = "[#{txt}]"
    return txt

UI.registerHelper "userCanEdit", ->
    tbl = Session.get('MyTbl')
    user = Meteor.user()
    currentUser = if user then user._id
    if currentUser is tbl.user_id then return true
    for user in tbl.user_roles
        if currentUser is user.user_id and user.role isnt "reviewers" then return true
  return false
