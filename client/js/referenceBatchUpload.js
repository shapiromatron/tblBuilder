var getImportWS = function(wb, cb) {
    var ws;
    try {
        wb.SheetNames.forEach(function(name){
            if ((wb.Sheets[name]['A1'].v === "PubMed ID") &&
                (wb.Sheets[name]['B1'].v === "Name") &&
                (wb.Sheets[name]['C1'].v === "Full Citation") &&
                (wb.Sheets[name]['D1'].v === "Other URL") &&
                (wb.Sheets[name]['E1'].v === "PDF URL")) {
                if (cb){
                    cb({
                        "isError": false,
                        "status": "Ready for import!"
                    });
                }
                ws = wb.Sheets[name];
            }
        });
    } catch (err) {
        console.error("Error loading workbook.");
    }

    if (ws === undefined){
        if (cb){
            cb({
                "isError": true,
                "status": "No worksheet matches the required format. Please use the proper spreadsheet format."
            });
        }
    }
    return ws;
};
Template.referenceBatchUpload.events({
    'change input[name=excelReferences]': function(evt, tmpl) {
        var printStatus = function(obj) {
                var div = $(tmpl.find("#uploadStatusDiv")),
                    okBtn = $(tmpl.find("#uploadReferences"));

                div.hide();
                $(tmpl.find('#uploadStatus')).text(obj.status);
                if (obj.isError) {
                    div.addClass('alert-warning');
                    div.removeClass('alert-success');
                } else {
                    div.removeClass('alert-warning');
                    div.addClass('alert-success');
                }

                (!obj.isError) ? okBtn.fadeIn() : okBtn.fadeOut();

                return div.fadeIn();
            },
            loadWB = function(file, success, error) {
                var fr = new FileReader();
                fr.onload = function(e) {
                    var wb;
                    try {
                        wb = XLSX.read(e.target.result, {type: 'binary'});
                        if ((success != null)) {return success(wb, error);}
                    } catch (err) {
                        console.log(err);
                        if ((error != null)) {
                            return error({
                                isError: true,
                                status: 'Please upload an Excel file with the "xlsx" extension.'
                            });
                        }
                    }
                };
                return fr.readAsBinaryString(file);
            },
            file = evt.target.files[0];

        return loadWB(file, getImportWS, printStatus);
    },
    'click #uploadReferences': function(evt, tmpl) {
        var div = tmpl.$("#uploadStatusDiv"),
            append_status = function(cls, rowID, msg) {
                div.append("<p class='alert {0}'>Importing row {1}: {2}</p>".printf(cls, rowID, msg));
            },
            createReferences = function(rows) {
                rows.forEach(function(row){
                    var rowID = row.__rowNum__ + 1,
                        PMID = row['PubMed ID'],
                        obj;

                    if (PMID != null) {
                        if (isFinite(parseInt(PMID, 10))) {
                            clientShared.getPubMedDetails(PMID, function(v) {
                                if (v.isError) {
                                    append_status("alert-danger", rowID, "PMID import error");
                                } else {
                                    obj = {
                                        "name": v.shortCitation,
                                        "referenceType": "PubMed",
                                        "pubmedID": parseInt(v.pubmedID, 10),
                                        "otherURL": "",
                                        "fullCitation": v.fullCitation,
                                        "monographAgent": [Session.get('monographAgent')],
                                    };
                                    if (row['PDF URL']) obj["pdfURL"] = row['PDF URL'];
                                    Reference.insert(obj);
                                    append_status("alert-success", rowID, "success!");
                                }
                            });
                        } else {
                            append_status("alert-danger", rowID, "PMID is not numeric");
                        }
                    } else {
                        obj = {
                            "name": row['Name'] || "INSERT NAME",
                            "referenceType": "Other",
                            "otherURL": row['Other URL'],
                            "fullCitation": row['Full Citation'] || "ADD DESCRIPTION",
                            "monographAgent": [Session.get('monographAgent')],
                        };
                        Reference.insert(obj);
                        append_status("alert-success", rowID, "success!");
                    }
                });
            },
            file = $('input[Name=excelReferences]')[0].files[0],
            wb = null,
            fr = new FileReader();

        fr.onload = function(e) {
            wb = XLSX.read(e.target.result, {type: 'binary'});
        };

        fr.onloadend = function(e) {
            var ws = getImportWS(wb),
                rows = XLSX.utils.sheet_to_json(ws);
            createReferences(rows);
        };

        div.empty().removeClass();
        fr.readAsBinaryString(file);
    }
});
Template.referenceBatchUpload.onCreated(function() {
    Session.set('monographAgent', this.data.monographAgent);
    this.subscribe('monographReference', this.data.monographAgent);
    $.getScript("//cdnjs.cloudflare.com/ajax/libs/xlsx/0.7.7/xlsx.full.min.js");
});
Template.referenceBatchUpload.onDestroyed(function() {
    Session.set('monographAgent', null);
});
