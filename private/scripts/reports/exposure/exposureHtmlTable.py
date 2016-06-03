# -*- coding: utf-8 -*-
from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class ExposureHtmlTable(DOCXReport):

    def create_content(self):
        self.setLandscape()
        doc = self.doc
        d = self.context

        txt = "{} {}: Exposure evidence".format(
            d["table"]["volumeNumber"],
            d["table"]["monographAgent"]
        )
        p = doc.paragraphs[0]
        p.text = txt
        p.style = "Title"
        doc.add_paragraph(d["table"]["name"])
        self.build_table()

    def build_row(self, tbl, d, row):
        txt = u'{}\n{}\n{}'.format(
            d['reference']['name'], d['exposureScenario'], d['agent'])
        tbl.new_td_txt(row, 0, txt)

        loc = u'{}\n'.format(d['location']) \
            if d['location'] \
            else ''
        txt = u'{}\n{}{}'.format(
            d['country'], loc, d['collectionDate'])
        tbl.new_td_txt(row, 1, txt)

        occ = u'\n{}'.format(d['occupationInfo']) \
            if d['occupationInfo'] \
            else ''
        txt = u'{}{}'.format(d['occupation'], occ) \
            if d['isOccupational'] \
            else 'N/A'
        tbl.new_td_txt(row, 2, txt)

        txt = d['samplingMatrix']
        tbl.new_td_txt(row, 3, txt)

        txt = u'{} {}\n{}'.format(
            d['exposureLevel'], d['units'], d['exposureLevelDescription'])
        tbl.new_td_txt(row, 4, txt)

        txt = u'{} {}'.format(d['exposureLevelRange'], d['units'])
        tbl.new_td_txt(row, 5, txt)

        txt = d['comments'] or u''
        tbl.new_td_txt(row, 6, txt)

    def build_table(self):
        colWidths = [1.35, 0.9, 0.9, 0.9, 1.35, 0.9, 2.7]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle="ntpTbl")

        # write title
        txt = "Occupational exposure data"
        tbl.new_th(0, 0, txt, colspan=7)

        # write header
        tbl.new_th(1, 0, "Reference,\nagent collected,\nexposure-scenario")
        tbl.new_th(1, 1, "Location,\ncollection date")
        tbl.new_th(1, 2, "Occupation description")
        tbl.new_th(1, 3, "Sampling\nmatrix")
        tbl.new_th(1, 4, "Exposure level")
        tbl.new_th(1, 5, "Exposure range")
        tbl.new_th(1, 6, "Comments/additional data")

        # write rows
        row = 2
        for d in self.context['exposures']:
            self.build_row(tbl, d, row)
            row += 1

        tbl.render(self.doc)

    def get_template_fn(self):
        return "base.docx"
