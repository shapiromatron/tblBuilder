Session.setDefault('reorderRows', false)

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
            if isNaN(val) then val = undefined
        when "checkbox"
            val = inp.checked
        when "select-one"
            val = $(inp).find('option:selected').val()
        else
            console.log('input not recognized')
    return val

share.createErrorDiv = (context) ->
    div = $("<div class='bg-danger'>").append('<p><strong>The following errors were found:</strong></p>')
    ul = $("<ul>")
    for obj in context.invalidKeys()
        msg = undefined
        try
            message = context.keyErrorMessage(obj.name)

        if message?
            ul.append("<li>#{message}</li>")
        else
            ul.append("<li>#{obj.name} is #{obj.type}; got \"#{obj.value}\" </li>")
    return div.append(ul)

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

share.newValues = (form) ->
  obj = {}
  for inp in $(form).find("select,input,textarea")
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

share.returnWordFile = (raw_data, fn) ->
    fn = fn or "download.docx"
    s2ab = (s) ->
        buf = new ArrayBuffer(s.length)
        view = new Uint8Array(buf)
        view[i] = s.charCodeAt(i) & 0xFF for i in [0..s.length]
        return buf
    blob = new Blob([s2ab(raw_data)], {type: "application/octet-stream"})
    saveAs(blob, fn)

share.toggleRowVisibilty = (display, $els) ->
    if display then $els.fadeIn() else $els.fadeOut()

share.moveRowCheck = (evt) ->
    self = $(evt.target)
    this_pos = self.data('sortidx')
    prev_pos = self.prev().data('sortidx') or 0
    next_pos = self.next().data('sortidx') or prev_pos+1
    if (this_pos < prev_pos) or (this_pos > next_pos)
        data = UI.getData(evt.target)
        newIdx = d3.mean([prev_pos, next_pos])
        @options.Cls.update(data._id, {$set: {sortIdx: newIdx}})
        self.data('sortidx', newIdx)

share.copyAsNew = (obj) ->
    for key, val of obj
        switch key
            when "referenceID"
                $div = $("input[name=#{key}]").parent().next()
                $div.empty()
                Blaze.renderWithData(Template.referenceSingleSelectSelected, {referenceID: val}, $div[0])
            when "coexposures"
                $ul = $('input[name="coexposures"]').parent().next()
                for key in val
                    share.typeaheadSelectListAddLI($ul, key)
            else
                switch typeof(val)
                    when "object"
                        # special case of typeaheadSelectList
                        if val is not null
                            $ul = $("input[name=#{key}]").parent().next()
                            share.typeaheadSelectListAddLI($ul, v) for v in val
                    when "boolean"
                        $("input[name=#{key}]").prop('checked', val)
                    else
                        $("input[name=#{key}]").val(val)
                        $("textarea[name=#{key}]").val(val)
                        $("select[name=#{key}] option[value='#{val}']").prop('selected', true)
                        $("select[name=#{key}]").trigger('change')

share.typeaheadSelectListAddLI = ($ul, val) ->
    txts = share.typeaheadSelectListGetLIs($ul)
    if ((val not in txts) and (val isnt ""))
        Blaze.renderWithData(Template.typeaheadSelectListLI, val, $ul[0])
        return true
    return false

share.typeaheadSelectListGetLIs = ($ul) ->
    ($(li).data('value') for li in $ul.find('li'))

share.toggleRiskPlot = ->
    # Draw log-axis for epi risk plot as needed
    if not Session.get('epiRiskShowPlots')
        return d3.select('.epiRiskAxes').remove()

    header = $('.riskTR')
    tbl = $(header.parent().parent().parent())
    tbl_pos = tbl.position()
    header_pos = header.position()
    y_top = tbl_pos.top + header.outerHeight()
    x_left = header_pos.left
    width = header.width()
    height = tbl.outerHeight()

    xPlotBuffer = 0   # make room for the text
    yPlotBuffer = 20  # make room for x-axis

    svg = d3.select('.container').insert("svg", "#epiCohortTbl")
                           .attr('class', 'epiRiskAxes')
                           .attr('height', height+yPlotBuffer)
                           .attr('width', width+2*xPlotBuffer)
                           .style({
                                top: parseInt(y_top) + "px",
                                left: parseInt(x_left-xPlotBuffer) + "px"})

    xscale = d3.scale.log().range([0, width]).domain([0.05, 50]).clamp(true)
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

share.toggleQA = (tmpl, isQA) ->
   $(tmpl.findAll('input,select,textarea')).prop('disabled', isQA)

timestamp_format = 'MMM Do YYYY, h:mm a'

UI.registerHelper "tableTitle", () ->
    tbl = Session.get("Tbl")
    if tbl?
        return "Volume #{tbl.volumeNumber}: #{tbl.monographAgent}"

UI.registerHelper "formatDate", (datetime) ->
    return moment(datetime).format(timestamp_format)

UI.registerHelper "QAstampFormat", (datetime, userID) ->
    datetime = moment(datetime).format(timestamp_format)
    user = Meteor.users.findOne(userID)
    if user then username = user.profile.fullName
    if username
        return "QA'd by #{username} on #{datetime}"
    else
        return "QA'd on #{datetime}"

UI.registerHelper "userCanEdit", ->
    tbl = Session.get('Tbl')
    thisId = Meteor.userId()
    if not thisId? or not tbl? then return false
    if Meteor.user() and "superuser" in Meteor.user().roles then return true
    if thisId is tbl.user_id then return true
    for user in tbl.user_roles
        if thisId is user.user_id and user.role isnt "reviewers" then return true
    return false

UI.registerHelper "ballotBoolean", (bool) ->
    icon = if (bool.hash.bool) then "glyphicon-ok" else "glyphicon-remove"
    return Spacebars.SafeString("<span class='glyphicon #{icon}'></span>")

UI.registerHelper "eachIndex", (array) ->
    result = []
    for value, index in array
        result.push({value:value, index:index})
    return result

UI.registerHelper "isEqual", (kw) ->
    return kw.hash.current is kw.hash.target

UI.registerHelper "qaMark", (isQA) ->
    if Session.get("showQAflags")
        icon = if (isQA) then "glyphicon-ok" else "glyphicon-remove"
        title = if (isQA) then "QA'd" else "Not QA'd"
        return Spacebars.SafeString("""<span title="#{title}" class="btn-xs text-muted pull-right glyphicon #{icon}"></span>""")


UI.registerHelper "hasContactEmail", () ->
    return Meteor.settings? and Meteor.settings.public? and Meteor.settings.public.contact_email?

UI.registerHelper "contactEmail", () ->
    return "#{Meteor.settings.public.contact_email}?subject=[IARC Table Builder]"

Template.formLegendPulldown.rendered = ->
    # prevent pull-down from closing when clicking special characters
    $(@.findAll('pre')).click (e) ->
        e.preventDefault()
        e.stopPropagation()
