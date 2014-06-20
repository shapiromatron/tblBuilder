Session.setDefault('epiRiskEstimateShowNew', false)
Session.setDefault('epiRiskEstimateEditingId', null)
Session.setDefault('epiRiskShowPlots', false)


getEpiRiskEstimateShowAllSessionKey = (_id) ->
    key = "showAll_#{_id}"
    if (not Session.get(key)?)
        Session.setDefault(key, false)
    key


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
        key = getEpiRiskEstimateShowAllSessionKey(@parent_id)
        Session.get(key) or not isHidden

    "isShowAll": () ->
        key = getEpiRiskEstimateShowAllSessionKey(@parent._id)
        Session.get(key)

    "showPlots": ->
        Session.get("epiRiskShowPlots")


Template.epiRiskEstimateTbl.events

    'click #epiRiskEstimate-show-create': (evt, tmpl) ->
        Session.set("epiRiskEstimateShowNew", true)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=organSite]"))

    'click #epiRiskEstimate-show-edit': (evt, tmpl) ->
        Session.set("epiRiskEstimateEditingId", @_id)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=organSite]"))

    'click #epiRiskEstimate-move-up': (evt, tmpl) ->
        tr = $(tmpl.find("tr[data-id=#{@_id}]"))
        share.moveRow(@, tr, EpiRiskEstimate, true)

    'click #epiRiskEstimate-move-down': (evt, tmpl) ->
        tr = $(tmpl.find("tr[data-id=#{@_id}]"))
        share.moveRow(@, tr, EpiRiskEstimate, false)

    'click #epiRiskEstimate-toggleShowAllRows': (evt, tmpl) ->
        key = getEpiRiskEstimateShowAllSessionKey(@parent._id)
        Session.set(key, !Session.get(key))

    'click #epiRiskEstimate-toggle-hidden': (evt, tmpl) ->
        EpiRiskEstimate.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #epiRiskEstimate-copy-as-new': (evt, tmpl) ->
        Session.set("epiRiskEstimateShowNew", true)
        Deps.flush()   # update DOM before focus
        share.activateInput(tmpl.find("input[name=organSite]"))
        share.copyAsNew(@)


Template.epiRiskEstimateForm.helpers
    epiRiskEstimateCheckIsNew: (isNew) ->
        isNew is "T"

    searchOrganSite: (qry, cb) ->
        Meteor.call "searchOrganSite", qry, (err, res) ->
            if err
                return console.log(err)
            map = ({value: v} for v in res)
            cb(map)


Template.epiRiskEstimateForm.events
    'click #epiRiskEstimate-create': (evt, tmpl) ->
        obj = share.newValues(tmpl)
        obj['timestamp'] = (new Date()).getTime()
        obj['user_id'] = Meteor.userId()
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['parent_id'] = tmpl.data.parent._id
        obj['isHidden'] = false
        Meteor.call('epiRiskEstimateNewIdx', obj['parent_id'], (err, response) ->
            obj['sortIdx'] = response
            EpiRiskEstimate.insert(obj)
            Session.set("epiRiskEstimateShowNew", false)
        )

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


Template.epiRiskEstimateForm.rendered = () ->
    Meteor.typeahead.inject('input[name=organSite]');


Template.forestPlot.rendered = ->
    svg = d3.select(@.find('svg'))
    xscale = d3.scale.log().range([0, svg.node().clientWidth]).domain([0.1, 10]).clamp(true)
    yscale = d3.scale.linear().range([0, svg.node().clientHeight]).domain([0, 1]).clamp(true)
    riskStr = "#{@.data.riskMid} (#{@.data.riskLow}-#{@.data.riskHigh})"

    svg.selectAll()
        .data([@.data])
        .enter()
        .append("circle")
        .attr("cx", (d,i) -> xscale(d.riskMid))
        .attr("cy", (d,i) -> yscale(0.5))
        .attr("r", 5)
        .append("svg:title")
        .text(riskStr);

    svg.selectAll()
        .data([@.data])
        .enter()
        .append("line")
        .attr("x1", (d,i) -> xscale(d.riskLow))
        .attr("x2", (d,i) -> xscale(d.riskHigh))
        .attr("y1", yscale(0.5))
        .attr("y2", yscale(0.5))
        .append("svg:title")
        .text(riskStr);

    svg.selectAll()
        .data([@.data])
        .enter()
        .append("line")
        .attr("x1", (d,i) -> xscale(d.riskHigh))
        .attr("x2", (d,i) -> xscale(d.riskHigh))
        .attr("y1", yscale(0.25))
        .attr("y2", yscale(0.75))
        .append("svg:title")
        .text(riskStr);

    svg.selectAll()
        .data([@.data])
        .enter()
        .append("line")
        .attr("x1", (d,i) -> xscale(d.riskLow) )
        .attr("x2", (d,i) -> xscale(d.riskLow) )
        .attr("y1", yscale(0.25))
        .attr("y2", yscale(0.75))
        .append("svg:title")
        .text(riskStr);
