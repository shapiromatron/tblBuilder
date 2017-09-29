from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class NtpEpiBiasRatings(DOCXReport):
    """
    NTP epi potential bias ratings.
    """
    COLUMN_WIDTHS = (1.7, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6)

    def _build_table(self, data):
        tbl = TableMaker(
            self.COLUMN_WIDTHS, numHeaders=0,
            firstRowCaption=False, tblStyle='ntpTbl'
        )

        # write header
        tbl.new_th(0, 0, '')
        tbl.new_th(0, 1, 'Bias', colspan=6)
        tbl.new_th(0, 7, 'Quality')
        tbl.new_th(0, 8, 'Utility')

        tbl.new_th(1, 0, 'Citation')
        tbl.new_th(1, 1, 'Selection', vertical=True, height=0.5)
        tbl.new_th(1, 2, 'Exposure', vertical=True)
        tbl.new_th(1, 3, 'Outcome', vertical=True)
        tbl.new_th(1, 4, 'Confounding methods', vertical=True)
        tbl.new_th(1, 5, 'Adequacy of analysis', vertical=True)
        tbl.new_th(1, 6, 'Selective reporting', vertical=True)
        tbl.new_th(1, 7, 'Sensitivity', vertical=True)
        tbl.new_th(1, 8, 'Integration', vertical=True)

        # write data rows
        for i, d in enumerate(data['descriptions']):
            r = i + 2
            tbl.new_td_txt(r, 0, d['reference']['name'])
            tbl.new_td_txt(r, 1, d['selectionBiasRating'])
            tbl.new_td_txt(r, 2, d['exposureAssessmentRating'])
            tbl.new_td_txt(r, 3, d['outcomeAssessmentRating'])
            confounders = [
                u'{}: {}'.format(conf['organSiteCategory'], conf['confoundingRating'])
                for conf in d['confounders']
            ]
            tbl.new_td_txt(r, 4, u'\n'.join(confounders))
            tbl.new_td_txt(r, 5, d['analysisRating'])
            tbl.new_td_txt(r, 6, d['selectiveReportingRating'])
            tbl.new_td_txt(r, 7, d['sensitivityRating'])
            tbl.new_td_txt(r, 8, d['overallUtility'])

        return tbl

    def create_content(self):
        doc = self.doc
        d = self.context

        txt = u'{} {}: bias rating tables'.format(
            d['tables'][0]['volumeNumber'],
            d['tables'][0]['monographAgent'],
        )
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d['tables'][0]['name'])
        tbl = self._build_table(d)
        tbl.render(self.doc)

    def get_template_fn(self):
        return 'base.docx'
