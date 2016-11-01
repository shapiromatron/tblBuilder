from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class NtpAnimalBias(DOCXReport):
    """
    NTP animal potential bias report.
    """

    def add_rr_header(self, tbl, row, header):
        tbl.new_td_txt(row, 0, header)
        tbl.new_td_txt(row, 1, '')

    def add_rr_row(self, tbl, row, header, rating, rationale):
        tbl.new_td_txt(row, 0, header)
        tbl.new_td_txt(row, 1, u'{}\n{}'.format(rating, rationale))

    def build_tbl(self, study):
        colWidths = (2, 4.5)
        tbl = TableMaker(colWidths, numHeaders=1, firstRowCaption=False,
                         tblStyle="ntpTbl")

        # Table caption
        txt = u'Table X: {} ({}): {}: {}'.format(
            study['reference']['name'],
            study['species'],
            study['agent'],
            study['dosingRoute'],
        )
        self.doc.add_heading(txt, level=2)

        # write header
        tbl.new_th(0, 0, 'Study utility domain\nQuestion')
        tbl.new_th(0, 1, 'Rating\nRationale')

        # study design section
        self.add_rr_header(tbl, 1, 'Study design')

        self.add_rr_row(
            tbl, 2, 'Randomization',
            study['randomizationRating'],
            study['randomizationRationale'])

        self.add_rr_row(
            tbl, 3, 'Controls',
            study['concurrentControlsRating'],
            study['concurrentControlsRationale'])

        tbl.new_td_txt(4, 0, 'Historical data')
        response = 'Yes' if study['historicalDataAvailable'] is True else 'No'
        tbl.new_td_txt(4, 1, response)

        # exposure section
        self.add_rr_header(tbl, 5, 'Exposure')

        self.add_rr_row(
            tbl, 6, 'Chemical characterization',
            study['chemicalCharacterizationRating'],
            study['chemicalCharacterizationRationale'])

        self.add_rr_row(
            tbl, 7, 'Dosing regimen',
            study['concurrentControlsRating'],
            study['concurrentControlsRationale'])

        # outcome section
        self.add_rr_header(tbl, 8, 'Outcome')

        self.add_rr_row(
            tbl, 9, 'Pathology',
            study['outcomeMethodsRating'],
            study['outcomeMethodsRationale'])

        self.add_rr_row(
            tbl, 10, 'Consistency between groups',
            study['groupConsistencyRating'],
            study['groupConsistencyRationale'])

        # confounding section
        self.add_rr_header(tbl, 11, 'Confounding')

        self.add_rr_row(
            tbl, 12, 'Confounding',
            study['confoundingRating'],
            study['confoundingRationale'])

        # reporting & analysis section
        self.add_rr_header(tbl, 13, 'Reporting and analysis')

        self.add_rr_row(
            tbl, 14, 'Reporting data and statistics',
            study['statisticalReportingRating'],
            study['statisticalReportingRationale'])

        self.add_rr_row(
            tbl, 15, 'Combining lesions',
            study['tumorCombiningRating'],
            study['tumorCombiningRationale'])

        # sensitivity section
        self.add_rr_header(tbl, 16, 'Sensitivity')

        self.add_rr_row(
            tbl, 17, 'Animal model',
            study['animalModelSensitivityRating'],
            study['animalModelSensitivityRationale'])

        self.add_rr_row(
            tbl, 18, 'Statistical power',
            study['statisticalPowerRating'],
            study['statisticalPowerRationale'])

        self.add_rr_row(
            tbl, 19, 'Exposure duration',
            study['exposureDurationRating'],
            study['exposureDurationRationale'])

        self.add_rr_row(
            tbl, 20, 'Dose response relationships',
            study['doseResponseRating'],
            study['doseResponseRationale'])

        self.add_rr_row(
            tbl, 21, 'Study duration',
            study['durationRating'],
            study['durationRationale'])

        # render table
        tbl.render(self.doc)

        # overall utility
        txt = u'Overall utility: {}\n{}'.format(
            study['overallUtility'],
            study['overallUtilityRationale']
        )
        self.doc.add_paragraph(txt)
        self.doc.add_page_break()

    def create_content(self):
        doc = self.doc
        d = self.context

        txt = u"{} {}: potential bias".format(
            d["table"]["volumeNumber"],
            d["table"]["monographAgent"],
        )
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d["table"]["name"])

        for study in d['studies']:
            self.build_tbl(study)

    def get_template_fn(self):
        return "base.docx"
