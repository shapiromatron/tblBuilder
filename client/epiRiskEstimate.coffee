window.EpiRiskEstimate = new Meteor.Collection('epiRiskEstimate')

getEpiRiskEstimateHandle = ->
    myTbl_id = Session.get('MyTbl_id')
    if myTbl_id
        epiRiskEstimate = Meteor.subscribe('epiRiskEstimate', myTbl_id)
    else
        epiRiskEstimate = null

epiRiskEstimateHandle = getEpiRiskEstimateHandle()
Deps.autorun(getEpiRiskEstimateHandle)


Session.setDefault('epiRiskEstimateShowNew', false)
Session.setDefault('epiRiskEstimateEditingId', null)


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


Template.epiRiskEstimateTbl.events

    'click #epiRiskEstimate-show-create': (evt, tmpl) ->
        Session.set("epiRiskEstimateShowNew", true)
        Deps.flush()  # update DOM before focus
        activateInput(tmpl.find("input[name=organSite]"))

    'click #epiRiskEstimate-show-edit': (evt, tmpl) ->
        Session.set("epiRiskEstimateEditingId", @_id)
        Deps.flush()  # update DOM before focus
        activateInput(tmpl.find("input[name=organSite]"))

    'click #epiRiskEstimate-move-up': (evt, tmpl) ->
        tr = $(tmpl.find("tr[data-id=#{@_id}]"))
        moveUp(@, tr, EpiRiskEstimate)

    'click #epiRiskEstimate-move-down': (evt, tmpl) ->
        tr = $(tmpl.find("tr[data-id=#{@_id}]"))
        moveDown(@, tr, EpiRiskEstimate)

    'click #epiRiskEstimate-toggleShowAllRows': (evt, tmpl) ->
        key = getEpiRiskEstimateShowAllSessionKey(@parent._id)
        Session.set(key, !Session.get(key))

    'click #epiRiskEstimate-toggle-hidden': (evt, tmpl) ->
        EpiRiskEstimate.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #epiRiskEstimate-copy-as-new': (evt, tmpl) ->
        Session.set("epiRiskEstimateShowNew", true)
        Deps.flush()   # update DOM before focus
        activateInput(tmpl.find("input[name=organSite]"))
        copyAsNew(@)


Template.epiRiskEstimateForm.helpers
    "epiRiskEstimateCheckIsNew": (isNew) ->
        isNew is "T"


Template.epiRiskEstimateForm.events
    'click #epiRiskEstimate-create': (evt, tmpl) ->
        obj = new_values(tmpl)
        obj['timestamp'] = (new Date()).getTime()
        obj['user_id'] = Meteor.userId()
        obj['myTbl_id'] = Session.get('MyTbl_id')
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
        vals = update_values(tmpl.find('#epiRiskEstimateForm'), @)
        EpiRiskEstimate.update(@_id, {$set: vals})
        Session.set("epiRiskEstimateEditingId", null)

    'click #epiRiskEstimate-update-cancel': (evt, tmpl) ->
        Session.set("epiRiskEstimateEditingId", null)

    'click #epiRiskEstimate-delete': (evt, tmpl) ->
        EpiRiskEstimate.remove(@_id)
        Session.set("epiRiskEstimateEditingId", null)
