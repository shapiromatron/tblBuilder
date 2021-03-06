# -*- coding: utf-8 -*-

from collections import defaultdict, OrderedDict

from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class NtpAnimalHtmlTables(DOCXReport):
    # Attempt to recreate HTML table in a Word-report.

    def __init__(self, *args, **kwargs):
        super(NtpAnimalHtmlTables, self).__init__(*args, **kwargs)
        self.footnotes = OrderedDict()

    @classmethod
    def group_results_by_site(cls, results):
        sites = defaultdict(list)
        for result in results:
            sites[result["tumourSite"]].append(result)
        return sites

    @classmethod
    def get_study_rowspan(cls, sites):
        rows = sum([cls.get_site_rowspan(results) for results in list(sites.values())])
        return max(1, rows)

    @classmethod
    def get_site_rowspan(cls, results):
        return sum([cls.get_result_rowspan(result) for result in results])

    @classmethod
    def get_result_rowspan(cls, result):
        rows = len(result["endpointGroups"]) + 1
        if result.get("trendTest"):
            rows += 1
        return rows

    COLUMN_WIDTHS = (1.5, 1.5, 1, 1.5, 3.5)

    def _build_study(self, study):

        row = 0
        tbl = TableMaker(
            self.COLUMN_WIDTHS, numHeaders=0, firstRowCaption=False, tblStyle="ntpTbl"
        )

        sites = self.group_results_by_site(study["results"])
        study_rowspan = self.get_study_rowspan(sites)

        # Column A
        runs = [
            tbl.new_run(study["reference"]["name"], b=True),
            tbl.new_run("Animal:", b=True),
            tbl.new_run(f'{study["species"]} {study["strain"]}'),
            tbl.new_run(study["sex"]),
            tbl.new_run("Animal age at the beginning of exposure:", b=True),
            tbl.new_run(study["ageAtStart"]),
            tbl.new_run("Study duration:", b=True),
            tbl.new_run(study["duration"], newline=False),
        ]
        tbl.new_td_run(row, 0, runs, rowspan=study_rowspan)

        # Column B
        runs = [
            tbl.new_run("Agent and purity:", b=True),
            tbl.new_run(study["agent"]),
            tbl.new_run(study["purity"]),
            tbl.new_run("Exposure route:", b=True),
            tbl.new_run(study["dosingRoute"]),
            tbl.new_run("Exposure concentrations, frequency, and duration:", b=True),
            tbl.new_run(study["dosingRegimen"], newline=False),
        ]
        tbl.new_td_run(row, 1, runs, rowspan=study_rowspan)

        site_row = row
        for results in list(sites.values()):

            # Column C & D
            for result in results:

                # save significance footnotes
                notes = result.get("significanceNotes", "") or ""
                if notes and hash(notes) not in self.footnotes:
                    self.footnotes[hash(notes)] = notes

                # write histology (and footnote adjustment)
                txt = result["tumourSite"]
                histology = result.get("histology")
                if histology:
                    txt = f"{txt} – {histology}"

                if result["adjustedIncidence"]:
                    txt += "ᵃ"
                    fn = "ᵃ Adjusted percent incidence based on Poly-3 estimated neoplasm incidence after adjustment for intercurrent mortality."  # noqa
                    self.footnotes[hash(fn)] = fn

                runs = [tbl.new_run(txt, b=True, newline=False)]
                tbl.new_td_run(site_row, 2, runs, colspan=2)
                site_row += 1

                # write groups
                for group in result["endpointGroups"]:
                    dose = group["dose"]
                    tbl.new_td_txt(site_row, 2, dose)

                    txt = group.get("incidence", "")
                    val = group.get("incidenceSymbol", None)
                    if val:
                        txt += val
                    val = group.get("incidencePercent", "None")
                    if val:
                        txt += f" ({val}%)"
                    tbl.new_td_txt(site_row, 3, txt)

                    site_row += 1

                # write trend test
                txt = result.get("trendTest")
                if txt:
                    # italicize 'P' in 'P-value'
                    runs = [
                        tbl.new_run("Trend ", newline=False),
                        tbl.new_run("P", i=True, newline=False),
                        tbl.new_run(f"-value: {txt}"),
                    ]
                    tbl.new_td_run(site_row, 2, runs, colspan=2)
                    site_row += 1

        # Column E
        first_result = study["results"][0] if len(study["results"]) > 0 else {}

        # blank runs are extra newlines as requested by report writers
        runs = [
            tbl.new_run("Survival: ", b=True, newline=False),
            tbl.new_run(first_result["survivalNotes"] or ""),
            tbl.new_run(""),
            tbl.new_run("Body weight: ", b=True, newline=False),
            tbl.new_run(first_result["bodyWeightNotes"] or ""),
            tbl.new_run(""),
            tbl.new_run(
                "Significantly increased preneoplastic lesions: ", b=True, newline=False
            ),
            tbl.new_run(first_result["nonNeoplasticFindings"] or ""),
            tbl.new_run(""),
            tbl.new_run("Other comments: ", b=True, newline=False),
            tbl.new_run(first_result["comments"] or ""),
            tbl.new_run(""),
            tbl.new_run(
                f'Overall utility: [{study["overallUtility"]}] ', b=True, newline=False
            ),
            tbl.new_run(study["overallUtilityRationale"] or ""),
        ]
        tbl.new_td_run(row, 4, runs, rowspan=study_rowspan)

        return tbl

    def build_tbl(self, studies):
        tbl = TableMaker(
            self.COLUMN_WIDTHS, numHeaders=1, firstRowCaption=False, tblStyle="ntpTbl"
        )

        # write header
        tbl.new_th(0, 0, "Reference and study design")
        tbl.new_th(0, 1, "Exposure")
        tbl.new_th(0, 2, "Dose levels")
        tbl.new_th(0, 3, "Tumor incidence (n/N) (%)")
        tbl.new_th(0, 4, "Comments")

        docx_tbl = tbl.render(self.doc)

        # write body
        for study in studies:
            inner_tbl = self._build_study(study)
            docx_tbl_inner = inner_tbl.render(self.doc)
            docx_tbl._cells.extend(docx_tbl_inner._cells)

        self.doc.add_paragraph("\n".join(list(self.footnotes.values())))

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        txt = f'{d["table"]["volumeNumber"]} {d["table"]["monographAgent"]}: Animal evidence'
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d["table"]["name"])

        self.build_tbl(d["studies"])

    def get_template_fn(self):
        return "base.docx"
