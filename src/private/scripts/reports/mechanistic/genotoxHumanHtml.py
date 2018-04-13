# -*- coding: utf-8 -*-

from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class GenotoxHumanHtml(DOCXReport):

    def buildHeader(self):
        doc = self.doc
        d = self.context
        txt = u'{} {}: Genotoxicity human evidence summary'.format(
            d['table']['volumeNumber'],
            d['table']['monographAgent'],
        )
        p = doc.paragraphs[0]
        p.text = txt
        p.style = 'Title'
        doc.add_paragraph(d['table']['name'])

    def buildTable(self):
        colWidths = [1, 1, 1, 1, 1, 1, 1, 1, 1]
        tbl = TableMaker(colWidths, numHeaders=1,
                         tblStyle='ntpTbl', firstRowCaption=False)

        # write header
        tbl.new_th(0, 0, 'Reference')
        tbl.new_th(0, 1, 'Number of subjects')
        tbl.new_th(0, 2, 'Mean or median exposure level,\nunits')
        tbl.new_th(0, 3, 'Range of exposure level,\nunits')
        tbl.new_th(0, 4, 'Endpoint')
        tbl.new_th(0, 5, 'Result')
        tbl.new_th(0, 6, 'Significance')
        tbl.new_th(0, 7, 'Covariates controlled')
        tbl.new_th(0, 8, 'Comments')

        row = 1
        for ref in self.context['objects']:

            txt = ref['reference']['name']
            tbl.new_td_txt(row, 0, txt)

            for result in ref['results']:

                txt = result.get('numberSubjects', '')
                tbl.new_td_txt(row, 1, txt)

                units = result.get('units', '')

                txt = f"{result.get('exposureLevel', '')}\n{units}"
                tbl.new_td_txt(row, 2, txt)

                txt = f"{result.get('exposureLevelRange', '')}\n{units}"
                tbl.new_td_txt(row, 3, txt)

                txt = result.get('endpoint', '')
                tbl.new_td_txt(row, 4, txt)

                txt = result.get('result', '')
                tbl.new_td_txt(row, 5, txt)

                txt = result.get('significance', '')
                tbl.new_td_txt(row, 6, txt)

                txt = result.get('covariates', '')
                tbl.new_td_txt(row, 7, txt)

                txt = result.get('notes', '')
                tbl.new_td_txt(row, 8, txt)

                row += 1

        tbl.render(self.doc)

    def create_content(self):
        self.setLandscape()
        self.buildHeader()
        self.buildTable()

    def get_template_fn(self):
        return 'base.docx'
