Session.setDefault('referenceShowNew', false)
Session.setDefault('referenceEditingId', null)

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
        monographNumber = Session.get('monographNumber')
        Meteor.call 'referenceExcelDownload', monographNumber, (err, response) ->
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
        obj['monographNumber'] = [Session.get('monographNumber')]
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
        name = tmpl.find('input[name=name]')

        getPubMedDetails pubmedID, (v) ->
            # turn-off spinner, and add retrieved content to input fields
            spinner.toggleClass('spinner-active')
            citation.value = v.fullCitation
            name.value = v.shortCitation

    'change select[name=referenceType]': (evt, tmpl) ->
        toggleFieldDisplays(tmpl);


getPubMedDetails = (pubmedID, cb) ->
    url= "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=#{pubmedID}&rettype=docsum&retmode=xml"
    HTTP.get url, (err, result) ->
        # assume an error occurred by default
        fullCitation = "An error occurred."
        shortCitation = ""
        isError = true

        if result
            xmlDoc = $.parseXML(result.content)
            xml = $(xmlDoc)
            window.xml = xml

            err = xml.find("ERROR")
            if err.length >= 1
                fullCitation = xml.find("ERROR").text()
            else
                # Parse XML for text, we use the AuthorList children to
                # filter for both "Author" and "CollectiveName" fields,
                # as an example see PMID 187847.
                authors = (auth.innerHTML for auth in xml.find('Item[Name=AuthorList]').children())
                title = xml.find("Item[Name=Title]").text()
                journal_source = xml.find("Item[Name=Source]").text()
                so =  xml.find("Item[Name=SO]").text()
                pmid = xml.find("Id").text()
                year = pubDate = xml.find("Item[Name=PubDate]").text().substr(0,4)

                # build short-citation
                first = authors[0].substr(0, authors[0].search(" "))
                shortCitation = "#{first} #{year}"
                if authors.length>2
                    shortCitation = "#{first} et al. #{year}"
                else if authors.length is 2
                    second = authors[1].substr(0, authors[1].search(" "))
                    shortCitation = "#{first} and #{second} #{year}"

                # build full-citation, using the PubMed Summary format, found here:
                # http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=#{pubmedID}&rettype=docsum&retmode=text
                fullCitation = "#{authors.join(', ')}. #{title}. #{journal_source}. #{so}. PubMed PMID: #{pmid}."

                isError = false

        cb({'shortCitation': shortCitation, 'fullCitation': fullCitation, 'isError': isError, 'pubmedID': pubmedID})


searchRefHelper = (qry, cb) ->
    qry =
        qry : qry
        monographNumber: Session.get('monographNumber')

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



getImportWS = (wb, error) ->
    # Find Excel worksheet which matches the input requirements
    try
        for name in wb.SheetNames
            if ((wb.Sheets[name]['A1'].v is "Name") and
                    (wb.Sheets[name]['B1'].v is "PubMed ID") and
                    (wb.Sheets[name]['C1'].v is "Other URL") and
                    (wb.Sheets[name]['D1'].v is "Full Citation"))
                if (error?) then error({isError: false, status: "Ready for import!"})
                return wb.Sheets[name]

        if (error?) then error({isError: true, status: "No worksheet matches the required format. Please use the proper spreadsheet format."})

    catch err
        console.log(err)
        if (error?) then error({isError: true, status: "No worksheet matches the required format. Please use the proper spreadsheet format."})

Template.referenceBatchUpload.events

    'change input[name=excelReferences]': (evt, tmpl) ->

        printStatus = (obj) ->
            div = $(tmpl.find("#uploadStatusDiv"))
            div.hide()
            $(tmpl.find('#uploadStatus')).text(obj.status)
            okBtn = $(tmpl.find("#uploadReferences"))
            if (obj.isError)
                div.addClass('alert-warning')
                div.removeClass('alert-success')
            else
                div.removeClass('alert-warning')
                div.addClass('alert-success')

            if not obj.isError then okBtn.fadeIn() else okBtn.fadeOut()
            div.fadeIn()


        loadWB = (file, success, error) ->
            #return as a workbook object
            fr = new FileReader()
            fr.onload = (e) ->
                try
                    data = e.target.result
                    wb = XLSX.read(data, {type: 'binary'})
                    if (success?) then success(wb, error)

                catch err
                    console.log(err)
                    if (error?) then error({isError: true, status: 'Please upload an Excel file with the "xlsx" extension.'})

            fr.readAsBinaryString(file)

        file = evt.target.files[0]
        loadWB(file, getImportWS, printStatus)


    'click #uploadReferences': (evt, tmpl) ->

        div = $(tmpl.find("#uploadStatusDiv"))
        div.empty().removeClass()

        append_status = (rowID) ->
            p = $("<p>Importing row #{rowID}: </p>")
            div.append(p)
            return p

        createReferences = (rows) ->
            failedRows = []
            for row in rows
                rowID = row.__rowNum__+1
                obj = {}
                PMID = row['PubMed ID']
                status = append_status(rowID)
                if PMID?
                    if isFinite(parseInt(PMID, 10))
                        do (status) ->
                            getPubMedDetails PMID, (v) ->
                                if v.isError
                                    status.append('failure! (PMID import error)')
                                else
                                    obj =
                                        name: v.shortCitation
                                        referenceType: "PubMed"
                                        pubmedID: parseInt(v.pubmedID, 10)
                                        otherURL: ""
                                        fullCitation: v.fullCitation
                                        monographNumber: [Session.get('monographNumber')]
                                    Reference.insert(obj)
                                    status.append('success!')
                    else
                        status.append('failure! (PMID is not numeric)')
                else
                    obj =
                        name: row['Name'] or "INSERT NAME"
                        referenceType: "Other"
                        pubmedID: NaN
                        otherURL: row['Other URL']
                        fullCitation: row['Full Citation'] or "ADD DESCRIPTION"
                        monographNumber: [Session.get('monographNumber')]
                    status.append('success!')
                    Reference.insert(obj)

        file = $('input[Name=excelReferences]')[0].files[0]
        wb = null
        fr = new FileReader()
        fr.onload = (e) ->
            data = e.target.result
            wb = XLSX.read(data, {type: 'binary'})

        fr.onloadend = (e) ->
            ws = getImportWS(wb)
            rows = XLSX.utils.sheet_to_json(ws)
            createReferences(rows)

        fr.readAsBinaryString(file)

Template.referenceBatchUpload.rendered = ->
    $.getScript("//cdnjs.cloudflare.com/ajax/libs/xlsx/0.7.7/xlsx.full.min.js")
