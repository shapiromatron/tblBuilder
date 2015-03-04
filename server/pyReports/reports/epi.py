from docx.shared import Inches
from docx.enum.section import WD_ORIENT

from utils import DOCXReport


def make_landscape(doc):
    section = doc.sections[-1]
    section.orientation = WD_ORIENT.LANDSCAPE
    section.left_margin = Inches(0.5)
    section.right_margin = Inches(0.5)
    section.page_width  = Inches(11)
    section.page_height  = Inches(8.5)

def build_header_cell(row, col, width, text, colspan=None, rowspan=None):
    cell = {
        "row": row,
        "col": col,
        "width": width,
        "runs": [{ "text": text, "bold": True, "italic": False }]}
    if rowspan:
        cell["rowspan"] = rowspan
    if colspan:
        cell["colspan"] = colspan
    return cell

def build_text_cell(row, col, text, rowspan=None, colspan=None):
    cell = {"row": row, "col": col, "text": text}
    if rowspan:
        cell["rowspan"] = rowspan
    if colspan:
        cell["colspan"] = colspan
    return cell

def build_run_cell(row, col, runs, rowspan=None, colspan=None):
    cell = {"row": row, "col": col, "runs": runs}
    if rowspan:
        cell["rowspan"] = rowspan
    if colspan:
        cell["colspan"] = colspan
    return cell

def run_maker(txt, newline=True, b=False, i=False):
    if newline: txt += u"\n"
    return {"text": txt, "bold": b, "italic": i}

def build_dual_field(row, header, text="", runs=None, colspan=None):
    h = build_header_cell(row, 0, 2, header)
    if runs:
        d = build_run_cell(row, 1, runs, colspan=colspan)
    else:
        d = build_text_cell(row, 1, text, colspan=colspan)
    return [h, d]


class NtpEpiDescriptive(DOCXReport):

    def build_desc_tbl(self, d):
        rows = 2
        cols = 5

        # write header
        txt = u"Table X: Study description and methodologies: {}".format(d["reference"]["name"])
        cells = [
            build_header_cell(0, 0, 10, txt, colspan=5),
            build_header_cell(1, 0, 1.5, "Field"),
            build_header_cell(1, 1, 1.0, "Description", colspan=4),
            build_header_cell(1, 2, 1.5, ""),
            build_header_cell(1, 3, 1.5, ""),
            build_header_cell(1, 4, 4.5, ""),
        ]

        # write data-rows
        runs = [
            run_maker(d["reference"]["name"], i=True),
            run_maker(d["reference"]["fullCitation"], newline=False)
        ]
        cells.extend(build_dual_field(rows, "Reference", runs=runs, colspan=4))
        rows += 1

        txt = d["studyDesign"]
        cells.extend(build_dual_field(rows, "Study-design type", text=txt, colspan=4))
        rows += 1

        txt = u"{}; {}".format(d["location"], d["enrollmentDates"])
        cells.extend(build_dual_field(rows, "Location and enrollment dates", text=txt, colspan=4))
        rows += 1

        txt = d.get("populationDescription", "")
        cells.extend(build_dual_field(rows, "Population description", text=txt, colspan=4))
        rows += 1

        if d["isCaseControl"]:

            # build specialized table
            txt = "Case-control description and eligibility criteria"
            cells.append(build_header_cell(rows, 0, 2, txt, rowspan=3))

            cells.append(build_run_cell(rows, 2, [run_maker("Population size", i=True, newline=False)]))
            cells.append(build_run_cell(rows, 3, [run_maker("Response rates", i=True, newline=False)]))
            cells.append(build_run_cell(rows, 4, [run_maker("Source", i=True, newline=False)]))
            rows +=1

            cells.append(build_text_cell(rows, 1, "Cases"))
            cells.append(build_text_cell(rows, 2, d["populationSizeCase"]))
            cells.append(build_text_cell(rows, 3, d["responseRateCase"]))
            cells.append(build_text_cell(rows, 4, d["sourceCase"]))
            rows +=1

            cells.append(build_text_cell(rows, 1, "Controls"))
            cells.append(build_text_cell(rows, 2, d["populationSizeControl"]))
            cells.append(build_text_cell(rows, 3, d["responseRateControl"]))
            cells.append(build_text_cell(rows, 4, d["sourceControl"]))
            rows +=1

        else:
            txt = d.get("eligibilityCriteria", "")
            cells.extend(build_dual_field(rows, "Eligibility criteria", text=txt, colspan=4))
            rows += 1

            runs = [
                run_maker("Population size: ", i=True, newline=False),
                run_maker(unicode(d.get("populationSize", ""))),
                run_maker("Loss-to-follow-up: ", i=True, newline=False),
                run_maker(unicode(d.get("lossToFollowUp", ""))),
                run_maker("Referent Group: ", i=True, newline=False),
                run_maker(d.get("referentGroup", ""), newline=False),
            ]
            cells.extend(build_dual_field(rows, "Cohort details", runs=runs, colspan=4))
            rows += 1

            txt = d.get("outcomeDataSource", "")
            cells.extend(build_dual_field(rows, "Outcome data source", text=txt, colspan=4))
            rows += 1

        txt = d["exposureAssessmentType"]
        cells.extend(build_dual_field(rows, "Exposure assessment", text=txt, colspan=4))
        rows += 1

        txt = d.get("exposureAssessmentNotes", "")
        cells.extend(build_dual_field(rows, "Exposure assessment notes", text=txt, colspan=4))
        rows += 1

        txt = d.get("exposureLevel", "")
        cells.extend(build_dual_field(rows, "Exposure-level", text=txt, colspan=4))
        rows += 1

        txt = d.get("coexposuresList", "")
        cells.extend(build_dual_field(rows, "Coexposures", text=txt, colspan=4))
        rows += 1

        runs = [
            run_maker("Analytical methods: ", i=True, newline=False),
            run_maker(d.get("notes", "")),
            run_maker("Covariates: ", i=True, newline=False),
            run_maker("{add}"),
            run_maker("Confounder consideration: ", i=True, newline=False),
            run_maker("{add}", newline=False),
        ]
        cells.extend(build_dual_field(rows, "Analysis methods and control for confounding", runs=runs, colspan=4))
        rows += 1

        self.build_table(rows, cols, cells, numHeaders=2, style="ntpTbl")

    def create_content(self):
        doc = self.doc
        d = self.context

        make_landscape(doc)

        # title
        txt = "{} {}: Study descriptions and methodologies".format(d["volumeNumber"], d["monographAgent"])
        doc.add_heading(txt, 0)

        # build table for each organ-site
        for desc in d["descriptions"]:
            self.build_desc_tbl(desc)
            self.doc.add_page_break()


class NtpEpiResults(DOCXReport):

    def build_res_tbl(self, caption, results):
        rows = 2
        cols = 7

        # write header
        cells = [
            build_header_cell(0, 0, 10, caption, colspan=7),
            build_header_cell(1, 0, 1.5, "Reference, study-design, location, and year"),
            build_header_cell(1, 1, 1.5, "Population description & exposure assessment method"),
            build_header_cell(1, 2, 0.8, "Exposure category or level"),
            build_header_cell(1, 3, 0.7, "Exposed cases/deaths"),
            build_header_cell(1, 4, 1.0, "Risk estimate\n(95% CI)"),
            build_header_cell(1, 5, 1.5, "Co-variates controlled"),
            build_header_cell(1, 6, 2.0, "Comments, strengths, and weaknesses"),
        ]

        # write additional rows
        for res in results:

            rowspan = len(res["riskEstimates"])
            if res["hasTrendTest"]:
                rowspan += 1

            # Column A
            txt = u"{}\n{}\n{}\n{}".format(
                res["descriptive"]["reference"]["name"],
                res["descriptive"]["studyDesign"],
                res["descriptive"]["location"],
                res["descriptive"]["enrollmentDates"]
            )
            cells.append(build_text_cell(rows, 0, txt, rowspan=rowspan))

            # Column B
            runs = [
                run_maker(res["descriptive"].get("eligibilityCriteria", "")),
                run_maker("Exposure assessment method: ", b=True, newline=False),
                run_maker(res["descriptive"]["exposureAssessmentType"], newline=False)
            ]
            cells.append(build_run_cell(rows, 1, runs, rowspan=rowspan))

            # Columns C,D,E
            for i, est in enumerate(res["riskEstimates"]):
                cells.append(build_text_cell(rows+i, 2, est["exposureCategory"]))
                cells.append(build_text_cell(rows+i, 3, unicode(est["numberExposed"])))
                cells.append(build_text_cell(rows+i, 4, unicode(est["riskFormatted"])))

            if res["hasTrendTest"]:
                txt = u"Trend-test p-value: {}".format(res["trendTest"])
                cells.append(build_text_cell(rows+i+1, 2, txt, colspan=3))

            # Column F
            txt = res["covariatesList"]
            cells.append(build_text_cell(rows, 5, txt, rowspan=rowspan))

            # Column G
            runs = [
                run_maker(res["descriptive"].get("exposureLevel", "")),
                run_maker("Confounding:", b=True),
                run_maker(res.get("covariatesControlledText", "")),
                run_maker("Strengths:", b=True),
                run_maker(res["descriptive"]["strengths"]),
                run_maker("Limitations:", b=True),
                run_maker(res["descriptive"]["limitations"], newline=False)
            ]
            cells.append(build_run_cell(rows, 6, runs, rowspan=rowspan))
            rows += rowspan

        self.build_table(rows, cols, cells, numHeaders=2, style="ntpTbl")

    def create_content(self):
        doc = self.doc
        d = self.context

        make_landscape(doc)

        # title
        txt = "{} {}: Results by organ-site".format(d["volumeNumber"], d["monographAgent"])
        doc.add_heading(txt, 0)

        # build table for each organ-site
        for organSite in d["organSites"]:
            txt = "Table X: Epidemiological exposure to {}: {}".format(d["monographAgent"], organSite["organSite"])
            self.build_res_tbl(txt, organSite["results"])
            self.doc.add_page_break()
