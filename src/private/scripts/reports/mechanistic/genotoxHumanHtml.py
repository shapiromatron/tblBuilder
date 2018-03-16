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
        colWidths = [1, 1, 1, 1, 1, 1, 1]
        tbl = TableMaker(colWidths, numHeaders=1,
                         tblStyle='ntpTbl', firstRowCaption=False)

        # write header
        tbl.new_th(0, 0, 'Reference')
        tbl.new_th(0, 1, '-')
        tbl.new_th(0, 2, '-')
        tbl.new_th(0, 3, '-')
        tbl.new_th(0, 4, '-')
        tbl.new_th(0, 5, '-')
        tbl.new_th(0, 6, '-')

        row = 0
        for d in self.context['objects']:
            row += 1

            txt = d['reference']['name']
            tbl.new_td_txt(row, 0, txt)

            txt = '-'
            tbl.new_td_txt(row, 1, txt)

            txt = '-'
            tbl.new_td_txt(row, 2, txt)

            txt = '-'
            tbl.new_td_txt(row, 3, txt)

            txt = '-'
            tbl.new_td_txt(row, 4, txt)

            txt = '-'
            tbl.new_td_txt(row, 5, txt)

            txt = '-'
            tbl.new_td_txt(row, 6, txt)

        tbl.render(self.doc)

    def create_content(self):
        self.setLandscape()
        self.buildHeader()
        self.buildTable()

    def get_template_fn(self):
        return 'base.docx'
