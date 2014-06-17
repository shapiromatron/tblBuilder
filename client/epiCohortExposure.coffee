EpiCohortExposure = new Meteor.Collection('epiCohortExposure')

getEpiCohortExposureHandle = ->
    myTbl_id = Session.get('epiCohort_myTbl')
    if myTbl_id
        epiCohortExposure = Meteor.subscribe('epiCohortExposure', myTbl_id)
    else
        epiCohortExposure = null

epiCohortExposureHandle = getEpiCohortExposureHandle()
Deps.autorun(getEpiCohortExposureHandle)


Session.setDefault('epiCohortExposureShowNew', false)
Session.setDefault('epiCohortExposureEditingId', null)


getEpiCohortExposureShowAllSessionKey = (_id) ->
    key = "showAll_" + _id
    if (not Session.get(key)?)
        Session.setDefault(key, false)
    key

Template.epiCohortExposureTbl.helpers

    "getEpiCohortExposures": () ->
        EpiCohortExposure.find({epiCohort_id: @epiCohort._id}, {sort:  {"sortIdx":1}})

    "epiCohortExposureShowNew": () ->
        Session.get("epiCohortExposureShowNew")

    "epiCohortExposureIsEditable": (editable) ->
        editable is "T"

    "epiCohortExposureIsEditing": () ->
        Session.equals('epiCohortExposureEditingId', @_id)

    "showRow": (isHidden) ->
        key = getEpiCohortExposureShowAllSessionKey(@epiCohort_id)
        Session.get(key) or not isHidden

    "isShowAll": () ->
        key = getEpiCohortExposureShowAllSessionKey(@epiCohort._id)
        Session.get(key)


Template.epiCohortExposureTbl.events

    'click #epiCohortExposure-show-create': (evt, tmpl) ->
        Session.set("epiCohortExposureShowNew", true)
        Deps.flush()  # update DOM before focus
        activateInput(tmpl.find("input[name=organSite]"))

    'click #epiCohortExposure-show-edit': (evt, tmpl) ->
        Session.set("epiCohortExposureEditingId", @_id)
        Deps.flush()  # update DOM before focus
        activateInput(tmpl.find("input[name=organSite]"))

    'click #epiCohortExposure-move-up': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        moveUp(@, tr, EpiCohortExposure)

    'click #epiCohortExposure-move-down': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        moveDown(@, tr, EpiCohortExposure)

    'click #epiCohortExposure-toggleShowAllRows': (evt, tmpl) ->
        key = getEpiCohortExposureShowAllSessionKey(@epiCohort._id)
        Session.set(key, !Session.get(key))

    'click #epiCohortExposure-toggle-hidden': (evt, tmpl) ->
        EpiCohortExposure.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #epiCohortExposure-copy-as-new': (evt, tmpl) ->
        Session.set("epiCohortExposureShowNew", true)
        Deps.flush()   # update DOM before focus
        activateInput(tmpl.find("input[name=organSite]"))
        copyAsNew(@)


Template.epiCohortExposureForm.helpers
    "epiCohortExposureCheckIsNew": (isNew) ->
        isNew is "T"


Template.epiCohortExposureForm.events
    'click #epiCohortExposure-create': (evt, tmpl) ->
        obj = new_values(tmpl)
        obj['timestamp'] = (new Date()).getTime()
        obj['user_id'] = Meteor.userId()
        obj['myTbl_id'] = Session.get('epiCohort_myTbl')
        obj['epiCohort_id'] = tmpl.data.epiCohort._id
        obj['isHidden'] = false
        Meteor.call('epiCohortExposureNewIdx', obj['epiCohort_id'], (err, response) ->
            obj['sortIdx'] = response
            EpiCohortExposure.insert(obj)
            Session.set("epiCohortExposureShowNew", false)
        )

    'click #epiCohortExposure-create-cancel': (evt, tmpl) ->
        Session.set("epiCohortExposureShowNew", false)

    'click #epiCohortExposure-update': (evt, tmpl) ->
        vals = update_values(tmpl.find('#epiCohortExposureForm'), @)
        EpiCohortExposure.update(@_id, {$set: vals})
        Session.set("epiCohortExposureEditingId", null)

    'click #epiCohortExposure-update-cancel': (evt, tmpl) ->
        Session.set("epiCohortExposureEditingId", null)

    'click #epiCohortExposure-delete': (evt, tmpl) ->
        EpiCohortExposure.remove(@_id)
        Session.set("epiCohortExposureEditingId", null)
