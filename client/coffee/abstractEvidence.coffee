Session.setDefault('evidenceShowNew', false)
Session.setDefault('evidenceEditingId', null)
Session.setDefault('nestedEvidenceEditingId', null)
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
        if key?
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

share.abstractRowHelpers =

    getChildren: ->
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        return NestedCollection.find({parent_id: @_id}, {sort: {sortIdx: 1}})

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

    'click .add-nested': (evt, tmpl) ->
        # remove exiting modal, add new one, and inject scope
        div = tmpl.find('#nestedModalHolder')
        $(div).empty()
        key = Session.get('evidenceType')
        NestedTemplate = share.evidenceType[key].nested_template
        Blaze.renderWithData(NestedTemplate, {parent: @}, div)

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
        # obj = Collection.simpleSchema().clean(obj)
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
        key = Session.get('evidenceType')
        for fld in share.evidenceType[key].requiredUpdateFields
            vals[fld] = tmpl.find('select[name="' + fld + '"]').value  # add for conditional schema-logic
        # vals = Collection.simpleSchema().clean(vals)
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

share.abstractNestedTableHelpers =

    showRow: (isHidden) ->
        Session.get('evidenceShowAll') or !isHidden

share.abstractNestedTableEvents =

    'click #inner-show-edit': (evt, tmpl) ->
        div = tmpl.find('#nestedModalHolder')
        key = Session.get('evidenceType')
        NestedTemplate = share.evidenceType[key].nested_template
        Session.set('nestedEvidenceEditingId', tmpl.data._id)
        Blaze.renderWithData(NestedTemplate, {}, div)

    'click #inner-toggle-hidden': (evt, tmpl) ->
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        data = tmpl.view.parentView.dataVar.curValue
        NestedCollection.update(data._id, {$set: {isHidden: !data.isHidden}})

    'click #inner-copy-as-new': (evt, tmpl) ->
        key = Session.get('evidenceType')
        NestedTemplate = share.evidenceType[key].nested_template

        # copy data from existing and set QA flags to false
        data = $.extend(true, {}, tmpl.view.parentView.dataVar.curValue)
        data.parent = {_id: data.parent_id}
        data.isQA = false;
        data.timestampQA = null;
        data.user_id_QA = null;

        div = tmpl.find('#nestedModalHolder')
        Blaze.renderWithData(NestedTemplate, data, div)

share.abstractNestedFormHelpers =

    isNew: ->
        return Session.get('nestedEvidenceEditingId') is null

    getObject: () ->
        # get data to render into form, either using a reactive data-source if
        # editing an existing result, or by using initial-data specified from
        # a creation view
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        initial = @
        existing = NestedCollection.findOne({_id: Session.get('nestedEvidenceEditingId')})
        return existing || initial

share.removeNestedFormModal = (tmpl, options) ->

    onHidden = () ->
        # remove template from DOM completely
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        $(tmpl.view._domrange.members).remove()
        Blaze.remove(tmpl.view)
        # optionally remove object from collection after removing DOM
        if options? and options.remove?
            NestedCollection.remove(options.remove)

    $(tmpl.find('#nestedModalDiv'))
        .on('hidden.bs.modal', onHidden)
        .modal('hide')

share.abstractNestedFormEvents =

    'click #inner-create': (evt, tmpl) ->
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        obj = share.newValues(tmpl.find('#nestedModalForm'))
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['parent_id'] = tmpl.data.parent._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        obj['isHidden'] = false

        isValid = NestedCollection.simpleSchema().namedContext().validate(obj)
        if isValid
            NestedCollection.insert(obj)
            share.removeNestedFormModal(tmpl)
        else
            errorDiv = share.createErrorDiv(NestedCollection.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #inner-create-cancel': (evt, tmpl) ->
        share.removeNestedFormModal(tmpl)

    'click #inner-update': (evt, tmpl) ->
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        vals = share.updateValues(tmpl.find('#nestedModalForm'), @)
        modifier = {$set: vals}

        isValid = NestedCollection.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            NestedCollection.update(@_id, modifier)
            Session.set("nestedEvidenceEditingId", null)
            share.removeNestedFormModal(tmpl)
        else
            errorDiv = share.createErrorDiv(NestedCollection.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #inner-update-cancel': (evt, tmpl) ->
        Session.set("nestedEvidenceEditingId", null)
        share.removeNestedFormModal(tmpl)

    'click #inner-delete': (evt, tmpl) ->
        Session.set("nestedEvidenceEditingId", null)
        share.removeNestedFormModal(tmpl, {"remove": @_id})

    'click #setQA,#unsetQA': (evt, tmpl) ->
        key = Session.get('evidenceType')
        nested_collection_name = share.evidenceType[key].nested_collection_name
        Meteor.call 'adminToggleQAd', this._id, nested_collection_name, (err, response) ->
            if response then share.toggleQA(tmpl, response.QAd)

