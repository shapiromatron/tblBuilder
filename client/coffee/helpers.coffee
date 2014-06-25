getValue = (inp) ->
    # special case for our multi-select list object
    if $(inp).hasClass("multiSelectList")
        $ul = $(inp).parent().next()
        return share.typeaheadSelectListGetLIs($ul)
    # special case for single-reference selector
    if $(inp).hasClass("referenceSingleSelect")
        $div = $(inp).parent().next()
        return $div.find('p').data('id')
    # special case for multiple-reference selector
    if $(inp).hasClass("referenceMultiSelect")
        $ul = $(inp).parent().next()
        return ($(li).data('id') for li in $ul.find('li'))
    # otherwise it's a standard html input
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
            when "object"
                # special case of typeaheadSelectList
                $ul = $("input[name=#{key}]").parent().next()
                share.typeaheadSelectListAddLI($ul, v) for v in val
            when "boolean"
                $("input[name=#{key}]").prop('checked', val)
            else
                $("input[name=#{key}]").val(val)
                $("textarea[name=#{key}]").val(val)


share.typeaheadSelectListAddLI = ($ul, val) ->
    txts = share.typeaheadSelectListGetLIs($ul)
    if val not in txts
        rendered = UI.renderWithData(Template.typeaheadSelectListLI, val)
        UI.insert(rendered, $ul[0])
        return true
    return false

share.typeaheadSelectListGetLIs = ($ul) ->
    (li.innerText for li in $ul.find('li'))

share.toggleRiskPlot = ->
    if not Session.get('epiRiskShowPlots')
        return d3.select('.epiRiskAxes').remove()

    header = $('.riskTR')
    tbl = $(header.parent().parent().parent())
    tbl_pos = tbl.position();
    header_pos = header.position();
    y_top = tbl_pos.top + header.height()
    x_left = header_pos.left
    width = header.width()
    height = tbl.height() - header.height()

    xPlotBuffer = 15  # make room for the text
    yPlotBuffer = 10  # make room for x-axis

    svg = d3.select('.container').insert("svg", "#epiCohortTbl")
                           .attr('class', 'epiRiskAxes')
                           .attr('height', height+yPlotBuffer)
                           .attr('width', width+2*xPlotBuffer)
                           .style({top: y_top+20, left: x_left-xPlotBuffer})

    xscale = d3.scale.log().range([0, width]).domain([0.09, 10.1]).clamp(true)
    yscale = d3.scale.linear().range([0, height-yPlotBuffer]).domain([0, 1]).clamp(true)
    xaxis = d3.svg.axis().scale(xscale).orient("bottom").ticks(0, d3.format(",.f"))

    svg.append("g")
        .attr("class", 'axis')
        .attr("transform", "translate(#{xPlotBuffer}, #{height-yPlotBuffer})")
        .call(xaxis);

    gridline_data = xscale.ticks(10)
    gridlines = svg.append("g")
                    .attr('class', 'gridlines')
                    .attr("transform", "translate(#{xPlotBuffer},0)")
    gridlines.selectAll("gridlines")
        .data(gridline_data).enter()
        .append("svg:line")
        .attr("x1", (v) -> xscale(v))
        .attr("x2", (v) -> xscale(v))
        .attr("y1", yscale(0))
        .attr("y2", yscale(1))
        .attr("class", (v) -> if v in [.1, 1, 10] then 'major' else 'minor')


UI.registerHelper "formatDate", (datetime, format) ->
    DateFormats =
        short: "DD MMMM - YYYY",
        long: "DD/MM/YYYY"

    if moment
        f = DateFormats[format]
        return moment(datetime).format(f)
    else
        return datetime

UI.registerHelper "riskFormat", (obj) ->
    txt = obj.riskMid.toString()
    if (obj.riskLow and obj.riskHigh)
        txt += " (#{obj.riskLow}-#{obj.riskHigh})"
    if obj.riskEstimated then txt = "[#{txt}]"
    return txt

UI.registerHelper "userCanEdit", ->
    tbl = Session.get('Tbl')
    user = Meteor.user()
    currentUser = if user then user._id
    if currentUser is tbl.user_id then return true
    for user in tbl.user_roles
        if currentUser is user.user_id and user.role isnt "reviewers" then return true
    return false

UI.registerHelper "ballotBoolean", (bool) ->
    icon = if (bool.hash.bool) then "glyphicon-ok" else "glyphicon-remove"
    return Spacebars.SafeString("<span class='glyphicon #{icon}'></span>")
