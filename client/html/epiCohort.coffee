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

    showPlots: ->
        Session.get('epiRiskShowPlots')


Template.epiCohortTbl.events
    'click #epiCohort-show-create': (evt, tmpl) ->
        Session.set("epiCohortShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=reference]"))

    'click #epiCohort-show-edit': (evt, tmpl) ->
        Session.set("epiCohortEditingId", @_id)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=reference]"))

    'click #epiCohort-move-up': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        share.moveRow(this, tr, EpiCohort, true)

    'click #epiCohort-move-down': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        share.moveRow(this, tr, EpiCohort, false)

    'click #epiCohort-downloadExcel': (evt, tmpl) ->
        tbl_id = tmpl.data._id
        Meteor.call('epiCohortExcelDownload', tbl_id, (err, response) ->
            share.returnExcelFile(response, "epiCohort.xlsx")
        )
    'click #epiCohort-toggleShowAllRows': (evt, tmpl) ->
        Session.set('epiCohortShowAll', !Session.get('epiCohortShowAll'))

    'click #epiCohort-toggle-hidden': (evt, tmpl) ->
        EpiCohort.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #epiCohort-copy-as-new': (evt, tmpl) ->
        Session.set("epiCohortShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=reference]"))
        share.copyAsNew(@)

    'click #epiCohort-epiRiskShowPlots': (evt, tmpl) ->
        Session.set('epiRiskShowPlots', not Session.get('epiRiskShowPlots'))


Template.epiCohortForm.helpers
    "epiCohortIsNew":
        (val)-> val is "T"


Template.epiCohortForm.events
    'click #epiCohort-create': (evt, tmpl) ->
        obj = share.newValues(tmpl)
        obj['timestamp'] = (new Date()).getTime()
        obj['user_id'] = Meteor.userId()
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['isHidden'] = false
        Meteor.call('epiCohortNewIdx', obj['tbl_id'], (err, response) ->
            obj['sortIdx'] = response
            EpiCohort.insert(obj)
            Session.set("epiCohortShowNew", false)
        )
    'click #epiCohort-create-cancel': (evt, tmpl) ->
        Session.set("epiCohortShowNew", false)

    'click #epiCohort-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#epiCohortForm'), @)
        EpiCohort.update(@_id, {$set: vals})
        Session.set("epiCohortEditingId", null)

    'click #epiCohort-update-cancel': (evt, tmpl) ->
        Session.set("epiCohortEditingId", null)

    'click #epiCohort-delete': (evt, tmpl) ->
        EpiCohort.remove(@_id)
        Session.set("epiCohortEditingId", null)
