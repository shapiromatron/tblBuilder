import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { UI } from 'meteor/ui';

import saveAs from 'meteor/mrt:filesaver';
import _ from 'underscore';
import d3 from 'd3';

import {
    getValue,
    typeaheadSelectListGetLIs,
} from '/imports/utilities';


let b64toBlob = function(b64, contentType, sliceSize) {
        var byteArray, byteArrays, byteCharacters, byteNumbers, i, offset, slice;
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        byteCharacters = window.atob(b64);
        byteArrays = [];
        offset = 0;

        while (offset < byteCharacters.length) {
            slice = byteCharacters.slice(offset, offset + sliceSize);
            byteNumbers = new Array(slice.length);
            i = 0;
            while (i < slice.length) {
                byteNumbers[i] = slice.charCodeAt(i);
                i++;
            }
            byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
            offset += sliceSize;
        }

        return new Blob(byteArrays, {type: contentType});
    },
    s2ab = function(s) {
        var buf = new ArrayBuffer(s.length),
            view = new Uint8Array(buf),
            i, j, ref;
        for (i = j = 0, ref = s.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    },
    moveRowCheck = function(evt) {
        var data = UI.getData(evt.target),
            $el = $(evt.target),
            this_pos = $el.data('sortidx'),
            prev_pos = $el.prev().data('sortidx') || 0,
            next_pos = $el.next().data('sortidx') || prev_pos + 1,
            newIdx = d3.mean([prev_pos, next_pos]);

        if ((this_pos < prev_pos) || (this_pos > next_pos)) {
            this.options.Cls.update(data._id, {$set: {sortIdx: newIdx}});
            $el.data('sortidx', newIdx);
        }
    },
    createErrorDiv = function(context) {
        var  msg, ul = $('<ul>');
        context.invalidKeys().forEach(function(obj){
            msg = undefined;
            try {
                msg = context.keyErrorMessage(obj.name);
            } catch (err) {
                console.error(err);
            }
            if (msg != null) {
                ul.append(`<li>${msg}</li>`);
            } else {
                ul.append(`<li>${obj.name} is ${obj.type}; got \'${obj.value}\' </li>`);
            }
        });

        return $('<div class="bg-danger">')
            .append('<p><strong>The following errors were found:</strong></p>')
            .append(ul);
    },
    getPubMedDetails = function(pubmedID, cb) {
        var url = `http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pubmedID}&rettype=docsum&retmode=xml`;

        return HTTP.get(url, function(err, result) {
            var auth, authors, first, fullCitation, isError, journal_source,
                pmid, second, shortCitation, so, title, xml, xmlDoc, year;

            // assume an error occurred by default
            fullCitation = 'An error occurred.';
            shortCitation = '';
            isError = true;

            if (result) {
                xmlDoc = $.parseXML(result.content);
                xml = $(xmlDoc);

                err = xml.find('ERROR');
                if (err.length >= 1) {
                    fullCitation = xml.find('ERROR').text();
                } else {
                    // Parse XML for text, we use the AuthorList children to
                    // filter for both 'Author' and 'CollectiveName' fields,
                    // as an example see PMID 187847.
                    authors = (function() {
                        var i, len, ref1, results;
                        ref1 = xml.find('Item[Name=AuthorList]').children();
                        results = [];
                        for (i = 0, len = ref1.length; i < len; i++) {
                            auth = ref1[i];
                            results.push(auth.innerHTML);
                        }
                        return results;
                    })();
                    title = xml.find('Item[Name=Title]').text();
                    journal_source = xml.find('Item[Name=Source]').text();
                    so = xml.find('Item[Name=SO]').text();
                    pmid = xml.find('Id').text();
                    year = xml.find('Item[Name=PubDate]').text().substr(0, 4);

                    // build short-citation
                    first = authors[0].substr(0, authors[0].search(' '));
                    shortCitation = `${first} (${year})`;
                    if (authors.length > 2) {
                        shortCitation = `${first} et al. (${year})`;
                    } else if (authors.length === 2) {
                        second = authors[1].substr(0, authors[1].search(' '));
                        shortCitation = `${first} and ${second} (${year})`;
                    }

                    // build full-citation, using the PubMed Summary format, found here:
                    // http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=#{pubmedID}&rettype=docsum&retmode=text
                    fullCitation = `${authors.join(', ')}. ${title}. ${journal_source}. ${so}. PubMed PMID: ${pmid}.`;
                    isError = false;
                }
            }
            return cb({
                'shortCitation': shortCitation,
                'fullCitation': fullCitation,
                'isError': isError,
                'pubmedID': pubmedID,
            });
        });
    },
    initDraggables = function($el, handle, cls, opts){
        opts = opts || {};
        _.extend(opts, {
            handle: handle,
            onUpdate: moveRowCheck,
            Cls: cls,
        });
        return new Sortable($el, opts);
    },
    activateInput = function(input) {
        input.focus();
        input.select();
    },
    updateValues = function(form, obj) {
        var newObj = {}, key, val;
        $(form).find('select,input,textarea').each(function(i, inp){
            key = inp.name;
            if (key.length > 0) {
                val = getValue(inp);
                if (obj[key] !== val) newObj[key] = val;
            }
        });
        return newObj;
    },
    returnExcelFile = function(raw_data, fn) {
        var blob = new Blob([s2ab(raw_data)], {type: 'application/octet-stream'});
        fn = fn || 'download.xlsx';
        return saveAs(blob, fn);
    },
    returnWordFile = function(raw_data, fn) {
        fn = fn || 'download.docx';
        var blob = new Blob([s2ab(raw_data)], {type: 'application/octet-stream'});
        return saveAs(blob, fn);
    },
    b64toWord = function(b64, fn) {
        var blob = b64toBlob(b64, 'application/octet-stream');
        fn = fn || 'download.docx';
        return saveAs(blob, fn);
    },
    toggleRowVisibilty = function(display, $els) {
        return (display) ? $els.fadeIn() : $els.fadeOut();
    },
    toggleRiskPlot = function() {
        d3.select('.epiRiskAxes').remove();
        if (!Session.get('epiRiskShowPlots')) return;
        Tracker.flush();

        var gridlines, svg, xaxis, xscale, yscale,
            header = $('.riskTR'),
            tbl = $('.evidenceTable'),
            tbl_pos = tbl.position(),
            header_pos = header.position(),
            y_top = tbl_pos.top + header.outerHeight(),
            x_left = header_pos.left,
            width = header.width(),
            height = tbl.height() - header.height(),
            xPlotBuffer = 0,   // make room for the text
            yPlotBuffer = 20;  // make room for x-axis

        svg = d3.select('.container')
            .insert('svg', '#epiCohortTbl')
            .attr('class', 'epiRiskAxes')
            .attr('height', height + yPlotBuffer)
            .attr('width', width + 2 * xPlotBuffer)
            .style({
                top: parseInt(y_top) + 'px',
                left: parseInt(x_left - xPlotBuffer) + 'px',
            });

        xscale = d3.scale.log()
            .range([0, width])
            .domain([Session.get('epiForestPlotMin'), Session.get('epiForestPlotMax')])
            .clamp(true);

        yscale = d3.scale.linear()
            .range([0, height - yPlotBuffer])
            .domain([0, 1])
            .clamp(true);

        xaxis = d3.svg.axis()
            .scale(xscale)
            .orient('bottom')
            .ticks(0, d3.format(',.f'));

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(${xPlotBuffer}, ${height - yPlotBuffer})`)
            .call(xaxis);

        gridlines = svg.append('g')
            .attr('class', 'gridlines')
            .attr('transform', `translate(${xPlotBuffer},0)`);

        gridlines.selectAll('gridlines')
            .data(xscale.ticks(10))
            .enter()
              .append('svg:line')
              .attr('x1', function(v) {return xscale(v);})
              .attr('x2', function(v) {return xscale(v);})
              .attr('y1', yscale(0))
              .attr('y2', yscale(1))
              .attr('class', function(v) {
                  switch (v){
                  case 1:
                      return 'baseline';
                  case 0.1:
                  case 10:
                      return 'major';
                  default:
                      return 'minor';
                  }
              });
    },
    toggleQA = function(tmpl, isQA) {
        return tmpl.$('input,select,textarea').prop('disabled', isQA);
    },
    userCanEdit = function(tbl) {
        var i, user, userId;

        userId = Meteor.userId();

        if ((userId == null) || (tbl == null)) return false;
        if (Meteor.user() && Meteor.user().roles.indexOf('superuser') >= 0) return true;
        if (userId === tbl.user_id) return true;
        for (i = 0; i < tbl.user_roles.length; i++) {
            user = tbl.user_roles[i];
            if (userId === user.user_id && user.role !== 'reviewers') return true;
        }
        return false;
    },
    initPopovers = function(tmpl, opts){
        opts = opts || {};
        _.extend(opts, {
            delay: {show: 500, hide: 100},
            trigger: 'hover',
            placement: 'auto',
        });
        $(tmpl.findAll('.helpPopovers')).popover(opts);
    },
    destroyPopovers = function(tmpl){
        $(tmpl.findAll('.helpPopovers')).popover('destroy');
    };


export { createErrorDiv };
export { getPubMedDetails };
export { initDraggables };
export { activateInput };
export { updateValues };
export { returnExcelFile };
export { returnWordFile };
export { b64toWord };
export { toggleRowVisibilty };
export { moveRowCheck };
export { typeaheadSelectListGetLIs };
export { toggleRiskPlot };
export { toggleQA };
export { userCanEdit };
export { initPopovers };
export { destroyPopovers };