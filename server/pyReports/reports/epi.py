from docx.shared import Inches
from docx.enum.section import WD_ORIENT

from utils import DOCXReport


def build_header_cell(row, col, width, text, colspan=1):
    return {
        "row": row,
        "col": col,
        "width": width,
        "colspan": colspan,
        "runs": [{ "text": text, "bold": True, "italic": False }]}

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


class NtpEpiDescriptive(DOCXReport):

    def create_content(self):
        d = self.context

        header = "{} {}: Study descriptions and methodologies".format(d["volumeNumber"], d["monographAgent"])
        self.doc.add_heading(header, 0)


class NtpEpiResults(DOCXReport):

    def build_tbl_cells(self, caption, results):
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

            # Column A
            txt = "{}\n{}\n{}\n{}".format(
                res["descriptive"]["reference"]["name"],
                res["descriptive"]["studyDesign"],
                res["descriptive"]["location"],
                res["descriptive"]["enrollmentDates"]
            )
            colA = build_text_cell(rows, 0, txt, rowspan=rowspan)

            # Column B
            runs = [
                run_maker("{descriptive other population descriptors}"),
                run_maker("Exposure assessment method", b=True),
                run_maker(res["descriptive"]["exposureAssessmentType"], newline=False)
            ]
            colB = build_run_cell(rows, 1, runs, rowspan=rowspan)

            # Columns C,D,E
            for i, est in enumerate(res["riskEstimates"]):
                cells.append(build_text_cell(rows+i, 2, est["exposureCategory"]))
                cells.append(build_text_cell(rows+i, 3, unicode(est["numberExposed"])))
                cells.append(build_text_cell(rows+i, 4, unicode(est["riskFormatted"])))

            # Column F
            runs = [
                run_maker(res["covariatesList"]),
            ]
            if res["hasTrendTest"]:
                runs.append(run_maker("Trend-test p-value:", b=True))
                runs.append(run_maker(unicode(res["trendTest"]), newline=False))
            colF = build_run_cell(rows, 5, runs, rowspan=rowspan)

            # Column G
            runs = [
                run_maker("{descriptive quantitative exposure}"),
                run_maker("Confounding:", b=True),
                run_maker("{results covariates controlled notes}"),
                run_maker("Strengths:", b=True),
                run_maker(res["descriptive"]["strengths"]),
                run_maker("Limitations:", b=True),
                run_maker(res["descriptive"]["limitations"], newline=False)
            ]
            colG = build_run_cell(rows, 6, runs, rowspan=rowspan)

            cells.append(colA)
            cells.append(colB)
            cells.append(colF)
            cells.append(colG)
            rows += rowspan

        self.build_table(rows, cols, cells)
        self.doc.add_paragraph("\n")

    def create_content(self):
        doc = self.doc
        d = self.context

        # make landscape
        section = doc.sections[-1]
        section.orientation = WD_ORIENT.LANDSCAPE
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)
        section.page_width  = Inches(11)
        section.page_height  = Inches(8.5)

        # title
        txt = "{} {}: Results by organ-site".format(d["volumeNumber"], d["monographAgent"])
        doc.add_heading(txt, 0)

        # build table for each organ-site
        for organSite in d["organSites"]:

            txt = "Table X: Epidemiological exposure to {}: {}".format(d["monographAgent"], organSite["organSite"])
            self.build_tbl_cells(txt, organSite["results"])

