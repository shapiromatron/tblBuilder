from ..utils import TableMaker, DOCXReport


class NtpEpiResults(DOCXReport):

    def build_res_tbl(self, caption, studies):
        colWidths = [1.5, 1.5, 0.75, 0.75, 1.0, 1.5, 3.0]
        styles = {
            "title": "RoCTabletitle",
            "header": "RoCColumnheading",
            "body": "RoCTablebody",
            "subheading": None
        }
        tbl = TableMaker(colWidths, styles=styles, numHeaders=2, tblStyle="ntpTbl")

        # write title
        tbl.new_tbl_title(caption)

        # write header
        tbl.new_th(1, 0, "Reference, study-design, location, and year")
        tbl.new_th(1, 1, "Population description & exposure assessment method")
        tbl.new_th(1, 2, "Exposure category or level")
        tbl.new_th(1, 3, "Exposed cases/deaths")
        tbl.new_th(1, 4, "Risk estimate\n(95% CI)")
        tbl.new_th(1, 5, "Co-variates controlled")
        tbl.new_th(1, 6, "Comments, strengths, and weaknesses")

        # write additional rows
        rows = 2
        for st in studies:

            # get row-span for each study
            for res in st["results"]:
                res["_rowspan"] = len(res["riskEstimates"])+1
                if res["hasTrendTest"]:
                    res["_rowspan"] += 1

            st_rowspan = sum(res["_rowspan"] for res in st["results"])

            # Column A
            txt = u"{}\n{}\n{}\n{}".format(
                st["reference"]["name"],
                st["studyDesign"],
                st["location"],
                st["enrollmentDates"]
            )
            tbl.new_td_txt(rows, 0, txt, rowspan=st_rowspan)

            # Column B
            if st["isCaseControl"]:
                popD = tbl.new_run(u"{}\nCases: {}; Controls: {}".format(
                    st.get("eligibilityCriteria", ""),
                    st.get("populationSizeCase", ""),
                    st.get("populationSizeControl", "")))
            else:
                popD = tbl.new_run(u"{}\n{}".format(
                    st.get("populationDescription", ""),
                    st.get("populationSize", "")))

            runs = [
                popD,
                tbl.new_run("Exposure assessment method: ", b=True, newline=False),
                tbl.new_run(st["exposureAssessmentType"], newline=False)
            ]
            tbl.new_td_run(rows, 1, runs, rowspan=st_rowspan)

            # Columns C, D, E, F
            irows = rows
            covariates = []
            for res in st["results"]:

                runs = [
                    tbl.new_run(res.get("organSite", ""), b=True, newline=False),
                ]
                tbl.new_td_run(irows, 2, runs, colspan=4, style="Tablesubheadings")

                for i, est in enumerate(res["riskEstimates"]):
                    tbl.new_td_txt(irows+i+1, 2, est["exposureCategory"])
                    tbl.new_td_txt(irows+i+1, 3, unicode(est["numberExposed"]))
                    tbl.new_td_txt(irows+i+1, 4, unicode(est["riskFormatted"]))

                # Column F
                txt = res["covariatesList"]
                tbl.new_td_txt(irows+1, 5, txt, rowspan=len(res["riskEstimates"]))

                if res["hasTrendTest"]:
                    runs = [
                        tbl.new_run("Trend-test ", newline=False),
                        tbl.new_run("P", i=True, newline=False),
                        tbl.new_run("-value: {}".format(res["trendTest"]), newline=False),
                    ]
                    tbl.new_td_run(irows+i+2, 2, runs, colspan=4)

                covariates.append(res.get("covariatesControlledText", ""))
                irows += res["_rowspan"]

            # Column G
            covariates = u', '.join([v for v in sorted(set(covariates)) if len(v) > 0])
            runs = [
                tbl.new_run(st.get("exposureLevel", "")),
                tbl.new_run("Confounding:", b=True),
                tbl.new_run(covariates),
                tbl.new_run("Strengths:", b=True),
                tbl.new_run(st["strengths"]),
                tbl.new_run("Limitations:", b=True),
                tbl.new_run(st["limitations"], newline=False)
            ]
            tbl.new_td_run(rows, 6, runs, rowspan=st_rowspan)

            rows += st_rowspan

        tbl.render(self.doc)

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        # title
        txt = "{} {}: Results by organ-site".format(d["table"]["volumeNumber"], d["table"]["monographAgent"])
        p = doc.paragraphs[0]
        p.text = txt
        p.style = "Title"

        # build table for each organ-site
        for tbl in sorted(d["tables"], key=lambda v: v["caption"]):
            txt = "Table X: {}".format(tbl["caption"])
            self.build_res_tbl(txt, tbl["studies"])
            self.doc.add_page_break()

    def get_template_fn(self):
        return "baseRoC.docx"
