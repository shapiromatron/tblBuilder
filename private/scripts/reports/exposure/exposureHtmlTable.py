# -*- coding: utf-8 -*-
from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class ExposureHtmlTable(DOCXReport):

    def create_content(self):
        self.setLandscape()
        doc = self.doc
        d = self.context

        txt = '{} {}: Exposure evidence'.format(
            d['table']['volumeNumber'],
            d['table']['monographAgent']
        )
        p = doc.paragraphs[0]
        p.text = txt
        p.style = 'Title'
        doc.add_paragraph(d['table']['name'])
        self.build_table()

    COLUMN_WIDTHS = (1.3, 0.9, 0.9, 1.0, 1.30, 0.9, 2.7)

    def build_row(self, d):

        row = 0
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=0,
                         firstRowCaption=False, tblStyle='ntpTbl')

        txt = u'{}\n{}'.format(
            d['reference']['name'], d['agent'])
        tbl.new_td_txt(row, 0, txt)

        txt = u'{}\n{}'.format(
            d['country'], d['collectionDate'])
        tbl.new_td_txt(row, 1, txt)

        occ = u'\n{}'.format(d['occupationInfo']) \
            if d['occupationInfo'] \
            else ''
        txt = u'{}{}'.format(d['occupation'], occ) \
            if d['isOccupational'] \
            else 'N/A'
        tbl.new_td_txt(row, 2, txt)

        txt = u'{};\n{};\n{};\n{}'.format(
            d['samplingMatrix'],
            d['samplingApproach'],
            d['numberMeasurements'],
            d['measurementDuration'],
        )
        tbl.new_td_txt(row, 3, txt)

        txt = u'{} {}\n{}'.format(
            d['exposureLevel'], d['units'], d['exposureLevelDescription'])
        tbl.new_td_txt(row, 4, txt)

        tbl.new_td_txt(row, 5, d['exposureRangePrint'])

        txt = d['comments'] or u''
        tbl.new_td_txt(row, 6, txt)

        return tbl

    def build_table(self):
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=2, tblStyle='ntpTbl')

        # write title
        txt = 'Occupational exposure data'
        tbl.new_th(0, 0, txt, colspan=7)

        # write header
        tbl.new_th(1, 0, 'Reference,\nagent')
        tbl.new_th(1, 1, 'Location,\ncollection date')
        tbl.new_th(1, 2, 'Occupation description')
        tbl.new_th(1, 3, 'Sampling matrix, approach,\nN, duration')
        tbl.new_th(1, 4, 'Exposure level')
        tbl.new_th(1, 5, 'Exposure range')
        tbl.new_th(1, 6, 'Comments/additional data')

        docx_tbl = tbl.render(self.doc)

        # write rows
        for d in self.context['exposures']:
            inner_tbl = self.build_row(d)
            docx_tbl_inner = inner_tbl.render(self.doc)
            docx_tbl._cells.extend(docx_tbl_inner._cells)

    def get_template_fn(self):
        return 'base.docx'
