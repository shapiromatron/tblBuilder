Session.setDefault('evidenceShowNew', false)
Session.setDefault('evidenceEditingId', null)
Session.setDefault('evidenceShowAll', false)
Session.setDefault('evidenceType', null)

share.abstractTblHelpers =

    showNew: ->
        Session.get("evidenceShowNew")

    isEditing: ->
        Session.equals('evidenceEditingId', @_id)

    showRow: (isHidden) ->
        Session.get('evidenceShowAll') or !isHidden

    isShowAll: ->
        Session.get('evidenceShowAll')

    object_list: ->
        key = Session.get('evidenceType')
        Collection = share.evidenceType[key].collection
        return Collection.find({}, {sort: {sortIdx: 1}})

share.abstractTblEvents =

    'click #show-create': (evt, tmpl) ->
        Session.set("evidenceShowNew", true)
        Tracker.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))

    'click #toggleShowAllRows': (evt, tmpl) ->
        val = not Session.get('evidenceShowAll')
        Session.set('evidenceShowAll', val)

    'click #reorderRows': (evt, tmpl) ->
        val = not Session.get('reorderRows')
        Session.set('reorderRows', val)
        share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))

    'click #wordReport': (evt, tmpl) ->
        div = tmpl.find('#modalHolder')
        Blaze.renderWithData(Template.reportTemplateModal, {}, div)

    'click #toggleQAflags': (evt, tmpl) ->
        val = not Session.get('showQAflags')
        Session.set('showQAflags', val)

    'click #downloadExcel': (evt, tmpl) ->
        tbl_id = Session.get('Tbl')._id
        key = Session.get('evidenceType')
        method = share.evidenceType[key].excel_method
        fn = share.evidenceType[key].excel_fn
        Meteor.call method, tbl_id, (err, response) ->
            share.returnExcelFile(response, fn)

share.abstractRowEvents =

    'click #show-edit': (evt, tmpl) ->
        Session.set("evidenceEditingId", @_id)
        Tracker.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])

    'click #copy-as-new': (evt, tmpl) ->
        Session.set("evidenceShowNew", true)
        Tracker.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])
        share.copyAsNew(@)

    'click #toggle-hidden': (evt, tmpl) ->
        key = Session.get('evidenceType')
        Collection = share.evidenceType[key].collection
        Collection.update(@_id, {$set: {isHidden: !@isHidden}})

share.abstractFormEvents =

    'click #create-cancel': (evt, tmpl) ->
        Session.set("evidenceShowNew", false)

    'click #update-cancel': (evt, tmpl) ->
        Session.set("evidenceEditingId", null)

    'click #create': (evt, tmpl) ->
        key = Session.get('evidenceType')
        Collection = share.evidenceType[key].collection
        obj = share.newValues(tmpl.find('#mainForm'))
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        isValid = Collection.simpleSchema().namedContext().validate(obj)
        if isValid
            Collection.insert(obj)
            Session.set("evidenceShowNew", false)
        else
            errorDiv = share.createErrorDiv(Collection.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #update': (evt, tmpl) ->
        key = Session.get('evidenceType')
        Collection = share.evidenceType[key].collection
        vals = share.updateValues(tmpl.find('#mainForm'), @)
        # vals.studyDesign = tmpl.find('select[name="studyDesign"]').value  # add for conditional schema-logic
        modifier = {$set: vals}
        isValid = Collection.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            Collection.update(@_id, {$set: vals})
            Session.set("evidenceEditingId", null)
        else
            errorDiv = share.createErrorDiv(Collection.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #delete': (evt, tmpl) ->
        key = Session.get('evidenceType')
        Collection = share.evidenceType[key].collection
        Collection.remove(@_id)
        Session.set("evidenceEditingId", null)

    'click #setQA,#unsetQA': (evt, tmpl) ->
        key = Session.get('evidenceType')
        collection_name = share.evidenceType[key].collection_name
        Meteor.call 'adminToggleQAd', this._id, collection_name, (err, response) ->
            if response then share.toggleQA(tmpl, response.QAd)
