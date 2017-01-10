from collections import defaultdict, OrderedDict

from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class NtpAnimalHtmlTables(DOCXReport):
    # Attempt to recreate HTML table in a Word-report.

    @classmethod
    def group_results_by_site(cls, results):
        sites = defaultdict(list)
        for result in results:
            sites[result['tumourSite']].append(result)
        return sites

    @classmethod
    def get_study_rowspan(cls, sites):
        rows = sum([
            cls.get_site_rowspan(results)
            for results in sites.values()
        ])
        return max(1, rows)

    @classmethod
    def get_site_rowspan(cls, results):
        return sum([
            cls.get_result_rowspan(result)
            for result in results
        ])

    @classmethod
    def get_result_rowspan(cls, result):
        rows = len(result['endpointGroups']) + 1
        if result.get('trendTest'):
            rows += 1
        return rows

    def build_tbl(self, studies):
        colWidths = (1.3, 1.3, 1.3, 0.7, 1.0, 1.0, 2.5)
        tbl = TableMaker(colWidths, numHeaders=1, firstRowCaption=False,
                         tblStyle='ntpTbl')

        # write header
        tbl.new_th(0, 0, 'Reference & year, animal, study duration')
        tbl.new_th(0, 1, 'Substance & purity')
        tbl.new_th(0, 2, 'Dosing regimen')
        tbl.new_th(0, 3, 'Organ site')
        tbl.new_th(0, 4, 'Dose levels')
        tbl.new_th(0, 5, 'Tumor incidence (n/N) (%)')
        tbl.new_th(0, 6, 'Survival, strengths, limitations, comments')

        footnotes = OrderedDict()

        # write body
        row = 1
        for study in studies:

            sites = self.group_results_by_site(study['results'])
            study_rowspan = self.get_study_rowspan(sites)

            # Column A
            runs = [
                tbl.new_run(study['reference']['name'], b=True),
                tbl.new_run(u'{} {}'.format(study['species'], study['strain'])),
                tbl.new_run(u'{} {}'.format(study['sex'], study['ageAtStart'])),
                tbl.new_run(u'{}'.format(study['duration'], newline=False)),
            ]
            tbl.new_td_run(row, 0, runs, rowspan=study_rowspan)

            # Column B
            runs = [
                tbl.new_run(study['agent']),
                tbl.new_run(study['purity'], newline=False),
            ]
            tbl.new_td_run(row, 1, runs, rowspan=study_rowspan)

            # Column C
            runs = [
                tbl.new_run(study['dosingRoute']),
                tbl.new_run(study['dosingRegimen'], newline=False),
            ]
            tbl.new_td_run(row, 2, runs, rowspan=study_rowspan)

            site_row = row
            for results in sites.values():

                # Column D
                txt = results[0]['tumourSite']
                tbl.new_td_txt(site_row, 3, txt,
                               rowspan=self.get_site_rowspan(results))

                # Column E & F
                for result in results:

                    # write histology (and footnote adjustment)
                    txt = result.get('histology', '')
                    if result['adjustedIncidence']:
                        txt += '*'
                    tbl.new_td_txt(site_row, 4, txt, colspan=2)

                    # write groups
                    for group in result['endpointGroups']:
                        site_row += 1

                        dose = u'{} {}'.format(group['dose'], result['units'])
                        tbl.new_td_txt(site_row, 4, dose)

                        txt = u'{}'.format(group.get('incidence', ''))
                        val = group.get('incidenceSymbol', None)
                        if val:
                            txt += val
                        val = group.get('incidencePercent', 'None')
                        if val:
                            txt += u' ({}%)'.format(val)
                        tbl.new_td_txt(site_row, 5, txt)

                    notes = result.get('significanceNotes', '') or ''
                    if notes and hash(notes) not in footnotes:
                        footnotes[hash(notes)] = notes

                    # write trend test
                    txt = result.get('trendTest')
                    if txt:
                        site_row += 1
                        txt = u'Trend p-value: {}'.format(txt)
                        tbl.new_td_txt(site_row, 4, txt, colspan=2)

                    site_row += 1

            # Column G
            first_result = study['results'][0] \
                if len(study['results']) > 0 \
                else {}

            runs = [
                tbl.new_run('Survival: ', b=True, newline=False),
                tbl.new_run(first_result['survivalNotes'] or ''),
                tbl.new_run('Strengths: ', b=True, newline=False),
                tbl.new_run(study['strengths'] or ''),
                tbl.new_run('Limitations: ', b=True, newline=False),
                tbl.new_run(study['limitations'] or ''),
                tbl.new_run('Other comments: ', b=True, newline=False),
                tbl.new_run(first_result['comments'] or ''),
                tbl.new_run(
                    'Significantly increased non-neoplastic lesions: ',
                    b=True, newline=False
                ),
                tbl.new_run(first_result['nonNeoplasticFindings'] or ''),

            ]
            tbl.new_td_run(row, 6, runs, rowspan=study_rowspan)

            row = site_row + 1

        tbl.render(self.doc)

        self.doc.add_paragraph(u'\n'.join(footnotes.values()))


    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        txt = u'{} {}: Animal evidence'.format(
            d['table']['volumeNumber'],
            d['table']['monographAgent'],
        )
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d['table']['name'])

        self.build_tbl(d['studies'])

    def get_template_fn(self):
        return 'base.docx'
