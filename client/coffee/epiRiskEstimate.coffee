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
        obj = share.newValues(tmpl.find('#epiRiskEstimateForm'))
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
