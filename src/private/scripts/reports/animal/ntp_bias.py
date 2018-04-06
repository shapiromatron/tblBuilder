from textwrap import dedent
from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class NtpAnimalBias(DOCXReport):
    """
    NTP animal potential bias report.
    """

    def add_rr_header(self, tbl, row, header):
        tbl.new_th(row, 0, header, colspan=2)

    def add_rr_row(self, tbl, row, header, rating, rationale):
        tbl.new_td_txt(row, 0, header)
        tbl.new_td_txt(row, 1, dedent(f'''\
            {rating}
            {rationale}'''))

    def build_tbl(self, study):
        colWidths = (2, 4.5)
        tbl = TableMaker(colWidths, numHeaders=1, firstRowCaption=False,
                         tblStyle='ntpTbl')

        # Table caption
        txt = (f'Table X: {study["reference"]["name"]} ({study["sex"]} '
               f'{study["species"]}): {study["agent"]}: {study["dosingRoute"]}')
        self.doc.add_heading(txt, level=2)

        # write header
        tbl.new_th(0, 0, 'Study utility domain and question')
        tbl.new_th(0, 1, 'Rating and rationale')

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

        self.add_rr_row(
            tbl, 5, 'Animal model (sensitivity)',
            study['animalModelSensitivityRating'],
            study['animalModelSensitivityRationale'])

        self.add_rr_row(
            tbl, 6, 'Statistical power (sensitivity)',
            study['statisticalPowerRating'],
            study['statisticalPowerRationale'])

        # exposure section
        self.add_rr_header(tbl, 7, 'Exposure')

        self.add_rr_row(
            tbl, 8, 'Chemical characterization',
            study['chemicalCharacterizationRating'],
            study['chemicalCharacterizationRationale'])

        self.add_rr_row(
            tbl, 9, 'Dosing regimen',
            study['dosingRegimenRating'],
            study['dosingRegimenRationale'])

        self.add_rr_row(
            tbl, 10, 'Exposure duration (sensitivity)',
            study['exposureDurationRating'],
            study['exposureDurationRationale'])

        self.add_rr_row(
            tbl, 11, 'Dose-response (sensitivity)',
            study['doseResponseRating'],
            study['doseResponseRationale'])

        # outcome section
        self.add_rr_header(tbl, 12, 'Outcome')

        self.add_rr_row(
            tbl, 13, 'Pathology',
            study['outcomeMethodsRating'],
            study['outcomeMethodsRationale'])

        self.add_rr_row(
            tbl, 14, 'Consistency between groups',
            study['groupConsistencyRating'],
            study['groupConsistencyRationale'])

        self.add_rr_row(
            tbl, 15, 'Study duration (sensitivity)',
            study['durationRating'],
            study['durationRationale'])

        # confounding section
        self.add_rr_header(tbl, 16, 'Confounding')

        self.add_rr_row(
            tbl, 17, 'Confounding',
            study['confoundingRating'],
            study['confoundingRationale'])

        # reporting & analysis section
        self.add_rr_header(tbl, 18, 'Reporting and analysis')

        self.add_rr_row(
            tbl, 19, 'Reporting data and statistics',
            study['statisticalReportingRating'],
            study['statisticalReportingRationale'])

        self.add_rr_row(
            tbl, 20, 'Combining lesions',
            study['tumorCombiningRating'],
            study['tumorCombiningRationale'])

        # render table
        tbl.render(self.doc)

        # overall utility
        txt = f' {study["overallUtility"]}. {study["overallUtilityRationale"]}'
        p = self.doc.add_paragraph('')
        p.add_run('Overall utility: ').bold = True
        p.add_run(txt)

        self.doc.add_page_break()

    def create_content(self):
        doc = self.doc
        d = self.context

        txt = f'{d["table"]["volumeNumber"]} {d["table"]["monographAgent"]}: potential bias'
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d['table']['name'])

        for study in d['studies']:
            self.build_tbl(study)

    def get_template_fn(self):
        return 'base.docx'
