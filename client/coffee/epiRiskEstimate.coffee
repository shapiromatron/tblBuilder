Session.setDefault('epiRiskEstimateShowNew', false)
Session.setDefault('epiRiskEstimateEditingId', null)
Session.setDefault('epiRiskShowPlots', false)
Session.setDefault('epiRiskShowAll', false)


Template.epiRiskEstimateTbl.helpers

    "getEpiRiskEstimates": () ->
        EpiRiskEstimate.find({parent_id: @parent._id}, {sort:  {"sortIdx":1}})

    "epiRiskEstimateShowNew": () ->
        Session.get("epiRiskEstimateShowNew")

    "epiRiskEstimateIsEditable": (editable) ->
        editable is "T"

    "epiRiskEstimateIsEditing": () ->
        Session.equals('epiRiskEstimateEditingId', @_id)

    "showRow": (isHidden) ->
        Session.get('epiRiskShowAll') or not isHidden

    "isShowAll": () ->
        Session.get('epiRiskShowAll')

    "showPlots": ->
        Session.get("epiRiskShowPlots")


Template.epiRiskEstimateTbl.rendered = ->
    new Sortable(@.find('#sortableInner'),
        handle: ".dhInner",
        onUpdate: share.moveRowCheck,
        Cls: EpiRiskEstimate)
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


Template.epiRiskEstimateTbl.events

    'click #epiRiskEstimate-show-create': (evt, tmpl) ->
        Session.set("epiRiskEstimateShowNew", true)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=organSite]"))

    'click #epiRiskEstimate-show-edit': (evt, tmpl) ->
        Session.set("epiRiskEstimateEditingId", @_id)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=organSite]"))

    'click #epiRiskEstimate-toggle-hidden': (evt, tmpl) ->
        EpiRiskEstimate.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #epiRiskEstimate-copy-as-new': (evt, tmpl) ->
        Session.set("epiRiskEstimateShowNew", true)
        Deps.flush()   # update DOM before focus
        share.activateInput(tmpl.find("input[name=organSite]"))
        share.copyAsNew(@)


Template.epiRiskEstimateForm.events
    'click #epiRiskEstimate-create': (evt, tmpl) ->
        obj = share.newValues(tmpl)
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['parent_id'] = tmpl.data.parent._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        EpiRiskEstimate.insert(obj)
        Session.set("epiRiskEstimateShowNew", false)

    'click #epiRiskEstimate-create-cancel': (evt, tmpl) ->
        Session.set("epiRiskEstimateShowNew", false)

    'click #epiRiskEstimate-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#epiRiskEstimateForm'), @)
        EpiRiskEstimate.update(@_id, {$set: vals})
        Session.set("epiRiskEstimateEditingId", null)

    'click #epiRiskEstimate-update-cancel': (evt, tmpl) ->
        Session.set("epiRiskEstimateEditingId", null)

    'click #epiRiskEstimate-delete': (evt, tmpl) ->
        EpiRiskEstimate.remove(@_id)
        Session.set("epiRiskEstimateEditingId", null)


Template.forestPlot.rendered = ->
    svg = d3.select(@.find('svg'))
    xscale = d3.scale.log().range([0, svg.node().clientWidth]).domain([0.09, 10.1]).clamp(true)
    yscale = d3.scale.linear().range([0, svg.node().clientHeight]).domain([0, 1]).clamp(true)
    riskStr = "#{@.data.riskMid} (#{@.data.riskLow}-#{@.data.riskHigh})"
    group = svg.append('g').attr('class', 'riskBar')

    group.selectAll()
        .data([@.data])
        .enter()
        .append("circle")
        .attr("cx", (d,i) -> xscale(d.riskMid))
        .attr("cy", (d,i) -> yscale(0.5))
        .attr("r", 5)
        .append("svg:title")
        .text(riskStr);

    group.selectAll()
        .data([@.data])
        .enter()
        .append("line")
        .attr("x1", (d,i) -> xscale(d.riskLow))
        .attr("x2", (d,i) -> xscale(d.riskHigh))
        .attr("y1", yscale(0.5))
        .attr("y2", yscale(0.5))
        .append("svg:title")
        .text(riskStr);

    group.selectAll()
        .data([@.data])
        .enter()
        .append("line")
        .attr("x1", (d,i) -> xscale(d.riskHigh))
        .attr("x2", (d,i) -> xscale(d.riskHigh))
        .attr("y1", yscale(0.25))
        .attr("y2", yscale(0.75))
        .append("svg:title")
        .text(riskStr);

    group.selectAll()
        .data([@.data])
        .enter()
        .append("line")
        .attr("x1", (d,i) -> xscale(d.riskLow) )
        .attr("x2", (d,i) -> xscale(d.riskLow) )
        .attr("y1", yscale(0.25))
        .attr("y2", yscale(0.75))
        .append("svg:title")
        .text(riskStr);