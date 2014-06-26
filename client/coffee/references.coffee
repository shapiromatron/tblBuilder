Session.setDefault('referenceShowNew', false)
Session.setDefault('referenceEditingId', null)
Session.setDefault('referenceMonographNumber', null)


Template.referencesTbl.helpers

    referenceShowNew: ->
        Session.get("referenceShowNew")

    getReferences: ->
        Reference.find({})

    referenceIsEditing: ->
        Session.equals('referenceEditingId', @_id)


Template.referencesTbl.events
    'click #reference-show-create': (evt, tmpl) ->
        Session.set("referenceShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=name]"))

    'click #reference-show-edit': (evt, tmpl) ->
        Session.set("referenceEditingId", @_id)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=name]"))

    'click #reference-downloadExcel': (evt, tmpl) ->
        tbl_id = tmpl.data._id
        Meteor.call 'referenceExcelDownload', tbl_id, (err, response) ->
            share.returnExcelFile(response, "references.xlsx")


toggleFieldDisplays = (tmpl) ->
    showPubMed = (tmpl.find('select[name=referenceType] option:selected').text is "PubMed")
    if  (showPubMed) then $('#pubMedFields').show() else $('#pubMedFields').hide()
    if (!showPubMed) then $('#otherFields').show()  else $('#otherFields').hide()

Template.referenceForm.rendered = ->
    toggleFieldDisplays(@)

Template.referenceForm.helpers
    getReferenceTypeOptions: ->
        return referenceTypeOptions

Template.referenceForm.events

    'click #reference-create': (evt, tmpl) ->
        obj = share.newValues(tmpl)
        obj['monographNumber'] = [Session.get('referenceMonographNumber')]
        Reference.insert(obj)
        Session.set("referenceShowNew", false)

    'click #reference-create-cancel': (evt, tmpl) ->
        Session.set("referenceShowNew", false)

    'click #reference-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#referenceForm'), @)
        Reference.update(@_id, {$set: vals})
        Session.set("referenceEditingId", null)

    'click #reference-update-cancel': (evt, tmpl) ->
        Session.set("referenceEditingId", null)

    'click #reference-delete': (evt, tmpl) ->
        Reference.remove(@_id)
        Session.set("referenceEditingId", null)

    'click .pubmedLookup': (evt, tmpl) ->
        spinner = $(tmpl.find('.pubmedLookupSpinner'))
        spinner.toggleClass('spinner-active')
        pubmedID = tmpl.find('input[name=pubmedID]').value
        citation = tmpl.find('textarea[name=fullCitation]')
        url = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=#{pubmedID}&rettype=docsum&retmode=text"
        HTTP.get url, (err, result) ->
            if err
                text = "An error occurred."
            else
                text = result.content.replace('1: ','').replace(/[\n\r]/g, '')
            citation.value = text
            spinner.toggleClass('spinner-active')

    'change select[name=referenceType]': (evt, tmpl) ->
        toggleFieldDisplays(tmpl);


searchRefHelper = (qry, cb) ->
        qry =
            qry : qry
            monographNumber: Session.get('referenceMonographNumber')

        Meteor.call "searchReference", qry, (err, res) ->
            if err then return console.log(err)
            (ref['value']= ref['name'] for ref in res)
            cb(res)


Template.referenceSingleSelect.helpers
    searchReference: searchRefHelper

Template.referenceSingleSelect.events
    'click .selectListRemove': (evt, tmpl) ->
        $(evt.currentTarget).parent().remove()

Template.referenceSingleSelect.rendered = ->
    Meteor.typeahead.inject("input[name=referenceID]")
    div = @.find('div.selectedItem')
    $(@.find("input")).on 'typeahead:selected', (e, v) ->
        rendered = UI.renderWithData(Template.referenceSingleSelectSelected, {referenceID:v._id})
        $(div).empty()
        UI.insert(rendered, div)
        this.value = ""

Template.referenceSingleSelect.destroyed = ->
    $(@.find("input[name=referenceID]")).unbind()


Template.referenceMultiSelect.helpers
    searchReference: searchRefHelper

Template.referenceMultiSelect.events
    'click .selectListRemove': (evt, tmpl) ->
        $(evt.currentTarget).parent().remove()

Template.referenceMultiSelect.rendered = ->
    Meteor.typeahead.inject("input[name=references]")
    $ul = $(@.find('ul'))
    $(@.find("input")).on 'typeahead:selected', (e, v) ->
        rendered = UI.renderWithData(Template.referenceMultiSelectListLI, v._id)
        ids = ($(li).data('id') for li in $ul.find('li'))
        if v._id not in ids then UI.insert(rendered, $ul[0])
        this.value = ""

Template.referenceMultiSelect.destroyed = ->
    $(@.find("input[name=references]")).unbind()


Template.printReference.helpers

    getReference: (id) ->
        Reference.findOne(_id: id)

    showHyperlink: ->
        isFinite(@pubmedID) or @otherURL

    getHyperlink: ->
        if isFinite(@pubmedID) then "http://www.ncbi.nlm.nih.gov/pubmed/#{@pubmedID}/"
        else @otherURL

Template.printReference.rendered = ->
    $(@.find('*[data-toggle=popover]')).popover
        trigger: 'hover'
        placement: 'bottom'
        delay: { show: 500, hide: 300 }
