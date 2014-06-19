EpiCohort = new Meteor.Collection('epiCohort')

getEpiCohortHandle = ->
    myTbl = Session.get('MyTbl')
    if myTbl
        epiCohortHandle = Meteor.subscribe('epiCohort', myTbl._id)
    else
        epiCohortHandle = null

epiCohortHandle = getEpiCohortHandle()
Deps.autorun(getEpiCohortHandle)


Session.setDefault('MyTbl_id', null)
Session.setDefault('epiCohortShowNew', false)
Session.setDefault('epiCohortEditingId', null)
Session.setDefault('epiCohortShowAll', false)


Template.epiCohortTbl.helpers

    getEpiCohorts: ->
        EpiCohort.find({}, {sort: {sortIdx: 1}})

    epiCohortShowNew: ->
        Session.get("epiCohortShowNew")

    epiCohortIsEditing: ->
        Session.equals('epiCohortEditingId', @_id)

    showRow: (isHidden) ->
        Session.get('epiCohortShowAll') or !isHidden

    isShowAll: ->
        Session.get('epiCohortShowAll')


Template.epiCohortTbl.events
    'click #epiCohort-show-create': (evt, tmpl) ->
        Session.set("epiCohortShowNew", true)
        Deps.flush() # update DOM before focus
        activateInput(tmpl.find("input[name=reference]"))

    'click #epiCohort-show-edit': (evt, tmpl) ->
        Session.set("epiCohortEditingId", @_id)
        Deps.flush() # update DOM before focus
        activateInput(tmpl.find("input[name=reference]"))

    'click #epiCohort-move-up': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        moveUp(this, tr, EpiCohort)

    'click #epiCohort-move-down': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        moveDown(this, tr, EpiCohort)

    'click #epiCohort-downloadExcel': (evt, tmpl) ->
        myTbl_id = tmpl.data._id
        Meteor.call('epiCohortExcelDownload', myTbl_id, (err, response) ->
            return_excel_file(response, "epiCohort.xlsx")
        )
    'click #epiCohort-toggleShowAllRows': (evt, tmpl) ->
        Session.set('epiCohortShowAll', !Session.get('epiCohortShowAll'))

    'click #epiCohort-toggle-hidden': (evt, tmpl) ->
        EpiCohort.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #epiCohort-copy-as-new': (evt, tmpl) ->
        Session.set("epiCohortShowNew", true)
        Deps.flush() # update DOM before focus
        activateInput(tmpl.find("input[name=reference]"))
        copyAsNew(@)


Template.epiCohortForm.helpers
    "epiCohortIsNew":
        (val)-> val is "T"


Template.epiCohortForm.events
    'click #epiCohort-create': (evt, tmpl) ->
        obj = new_values(tmpl)
        obj['timestamp'] = (new Date()).getTime()
        obj['user_id'] = Meteor.userId()
        obj['myTbl_id'] = Session.get('MyTbl_id')
        obj['isHidden'] = false
        Meteor.call('epiCohortNewIdx', obj['myTbl_id'], (err, response) ->
            obj['sortIdx'] = response
            EpiCohort.insert(obj)
            Session.set("epiCohortShowNew", false)
        )
    'click #epiCohort-create-cancel': (evt, tmpl) ->
        Session.set("epiCohortShowNew", false)

    'click #epiCohort-update': (evt, tmpl) ->
        vals = update_values(tmpl.find('#epiCohortForm'), @)
        EpiCohort.update(@_id, {$set: vals})
        Session.set("epiCohortEditingId", null)

    'click #epiCohort-update-cancel': (evt, tmpl) ->
        Session.set("epiCohortEditingId", null)

    'click #epiCohort-delete': (evt, tmpl) ->
        EpiCohort.remove(@_id)
        Session.set("epiCohortEditingId", null)
