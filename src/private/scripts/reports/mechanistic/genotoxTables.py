# -*- coding: utf-8 -*-

from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


HUMAN_VIVO_FOOTNOTE = u'''+, positive
–, negative
+/–, equivocal (variable response in several experiments within an adequate study)
* Significance is indicated using asterisks
(+) or (–), positive/negative in a study of limited quality (specify reason in comments, e.g. only a single dose tested; data or methods not fully reported; confounding exposures, etc.)'''  # noqa

ANIMAL_VIVO_FOOTNOTE = u'HID, highest ineffective dose; LED, lowest effective dose (units as reported); NT, not tested'  # noqa

MAMMAL_VITRO_FOOTNOTE = u'HIC, highest ineffective concentration; LEC, lowest effective concentration, NT, not tested'  # noqa

NONMAMMAL_VITRO_FOOTNOTE = u'HIC, highest ineffective concentration; LEC, lowest effective concentration, NA, not applicable; NT, not tested'  # noqa


class GenotoxTables(DOCXReport):

    def buildHeader(self):
        doc = self.doc
        d = self.context
        txt = u'{} {}: Genotoxicity evidence summary'.format(
            d['table']['volumeNumber'],
            d['table']['monographAgent'],
        )
        p = doc.paragraphs[0]
        p.text = txt
        p.style = 'Title'
        doc.add_paragraph(d['table']['name'])

    def getAgent(self):
        return self.context['table']['monographAgent']

    def buildHumanVivoTbl(self):
        colWidths = [0.9, 1.2, 1.2, 1.3, 1.4, 0.8, 1.4, 0.8]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle='ntpTbl')

        # write title
        txt = 'Table 1 [Genotoxicity and related effects] of [{}] in '\
              'humans in vivo'.format(self.getAgent())
        tbl.new_th(0, 0, txt, colspan=8)

        # write header
        tbl.new_th(1, 0, 'End-point')
        tbl.new_th(1, 1, 'Test')
        tbl.new_th(1, 2, 'Tissue')
        tbl.new_th(1, 3, 'Cell type\n(if specified)')
        tbl.new_th(1, 4, 'Description of exposed and controls')
        tbl.new_th(1, 5, 'Response/ significance*')
        tbl.new_th(1, 6, 'Comments')
        tbl.new_th(1, 7, 'Reference')

        row = 2
        for d in self.context['humanInVivo']:
            tbl.new_td_txt(row, 0, d['endpoint'])
            tbl.new_td_txt(row, 1, d['endpointTest'])

            tbl.new_td_txt(row, 2, d['tissueHuman'])
            tbl.new_td_txt(row, 3, d['cellType'])
            tbl.new_td_txt(row, 4, d['exposureDescription'])

            txt = u'{} {}'.format(d['result'], d['wrd_significance'])
            tbl.new_td_txt(row, 5, txt)

            tbl.new_td_txt(row, 6, d['wrd_comments'])
            tbl.new_td_txt(row, 7, d['reference']['name'])
            row += 1

        tbl.render(self.doc)
        self.doc.add_paragraph(HUMAN_VIVO_FOOTNOTE)
        self.doc.add_page_break()

    def buildHumanInVitro(self):
        colWidths = [1.0, 1.2, 1.4, 0.9, 0.9, 1.0, 1.6, 1.0]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle='ntpTbl')

        # write title
        txt = 'Table 2 [Genotoxicity and related effects] of [{}] in '\
              'human cells in vitro'.format(self.getAgent())
        tbl.new_th(0, 0, txt, colspan=8)

        # write header
        tbl.new_th(1, 0, 'End-point')
        tbl.new_th(1, 1, 'Test')
        tbl.new_th(1, 2, 'Tissue, cell line')
        tbl.new_th(1, 3, 'Results/\nResults without metabolic activation')
        tbl.new_th(1, 4, 'Results with metabolic activation')
        tbl.new_th(1, 5, 'Concentration (LEC or HIC)')
        tbl.new_th(1, 6, 'Comments')
        tbl.new_th(1, 7, 'Reference')

        row = 2
        for d in self.context['humanInVitro']:

            tbl.new_td_txt(row, 0, d['endpoint'])
            tbl.new_td_txt(row, 1, d['endpointTest'])

            tbl.new_td_txt(row, 2, d['tissueCellLine'])

            tbl.new_td_txt(row, 3, d['wrd_resultA'])
            tbl.new_td_txt(row, 4, d['wrd_resultB'])

            txt = u'{} {}'.format(d['wrd_led'], d['units'])
            tbl.new_td_txt(row, 5, txt)

            tbl.new_td_txt(row, 6, d['wrd_comments'])
            tbl.new_td_txt(row, 7, d['reference']['name'])
            row += 1

        tbl.render(self.doc)
        self.doc.add_paragraph(MAMMAL_VITRO_FOOTNOTE)
        self.doc.add_page_break()

    def buildAniVivoTbl(self):
        colWidths = [1.0, 1.0, 1.0, 1.0, 0.5, 0.7, 1.2, 1.6, 1]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle='ntpTbl')

        # write title
        txt = 'Table 3 [Genotoxicity and related effects] of [{}] in non-human '\
              'mammals in vivo'.format(self.getAgent())
        tbl.new_th(0, 0, txt, colspan=9)

        # write header
        tbl.new_th(1, 0, 'End-point')
        tbl.new_th(1, 1, 'Test')
        tbl.new_th(1, 2, 'Species, strain, sex')
        tbl.new_th(1, 3, 'Tissue')
        tbl.new_th(1, 4, 'Results')
        tbl.new_th(1, 5, 'Agent, dose (LED or HID)')
        tbl.new_th(1, 6, 'Route, duration, dosing regimen')
        tbl.new_th(1, 7, 'Comments')
        tbl.new_th(1, 8, 'Reference')

        row = 2
        for d in self.context['animalInVivo']:

            tbl.new_td_txt(row, 0, d['endpoint'])

            tbl.new_td_txt(row, 1, d['endpointTest'])

            txt = u'{} {} {}'.format(d['species'], d['strain'], d['sex'])
            tbl.new_td_txt(row, 2, txt)

            tbl.new_td_txt(row, 3, d['tissueAnimal'])

            tbl.new_td_txt(row, 4, d['result'])

            txt = u'{}\nLED/HID: {} {}'.format(
                d['agent'], d['wrd_led'], d['units'])
            tbl.new_td_txt(row, 5, txt)

            txt = u'{};\n{}'.format(d['dosingRoute'], d['dosingDuration'])
            tbl.new_td_txt(row, 6, txt)

            tbl.new_td_txt(row, 7, d['wrd_comments'])
            tbl.new_td_txt(row, 8, d['reference']['name'])
            row += 1

        tbl.render(self.doc)
        self.doc.add_paragraph(ANIMAL_VIVO_FOOTNOTE)
        self.doc.add_page_break()

    def buildMammInVitroTbl(self):
        colWidths = [0.9, 0.9, 2.2, 0.7, 0.7, 1.0, 1.6, 1]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle='ntpTbl')

        # write title
        txt = 'Table 4 [Genotoxicity and related effects] of [{}] in non-human '\
              'mammalians in vitro'.format(self.getAgent())
        tbl.new_th(0, 0, txt, colspan=8)

        # write header
        tbl.new_th(1, 0, 'End-point')
        tbl.new_th(1, 1, 'Test')
        tbl.new_th(1, 2, 'Species/tissue/cell line')
        tbl.new_th(1, 3, 'Results/\nResults without metabolic activation')
        tbl.new_th(1, 4, 'Results with metabolic activation')
        tbl.new_th(1, 5, 'Agent, concentration (LEC or HIC)')
        tbl.new_th(1, 6, 'Comments')
        tbl.new_th(1, 7, 'Reference')

        row = 2
        for d in self.context['nonHumanInVitro']:

            tbl.new_td_txt(row, 0, d['endpoint'])
            tbl.new_td_txt(row, 1, d['endpointTest'])

            txt = u'{} {}'.format(d['speciesMamm'], d['tissueCellLine'])
            tbl.new_td_txt(row, 2, txt)

            tbl.new_td_txt(row, 3, d['wrd_resultA'])
            tbl.new_td_txt(row, 4, d['wrd_resultB'])

            txt = u'{}, {} {}'.format(d['agent'], d['wrd_led'], d['units'])
            tbl.new_td_txt(row, 5, txt)

            tbl.new_td_txt(row, 6, d['wrd_comments'])
            tbl.new_td_txt(row, 7, d['reference']['name'])
            row += 1

        tbl.render(self.doc)
        self.doc.add_paragraph(MAMMAL_VITRO_FOOTNOTE)
        self.doc.add_page_break()

    def buildNonMammInVitroTbl(self):
        colWidths = [0.8, 1.2, 0.9, 0.9, 0.7, 0.7, 1, 1.8, 1]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle='ntpTbl')

        # write title
        txt = 'Table 5 [Genotoxicity and related effects] of [{}] in non-mammalian '\
              'species'.format(self.getAgent())
        tbl.new_th(0, 0, txt, colspan=9)

        # write header
        tbl.new_th(1, 0, 'Phylogenetic class')
        tbl.new_th(1, 1, 'Test system\n(species, strain)')
        tbl.new_th(1, 2, 'End-point')
        tbl.new_th(1, 3, 'Test')
        tbl.new_th(1, 4, 'Results/\nResults without metabolic activation')
        tbl.new_th(1, 5, 'Results with metabolic activation')
        tbl.new_th(1, 6, 'Agent, concentration (LEC or HIC)')
        tbl.new_th(1, 7, 'Comments')
        tbl.new_th(1, 8, 'Reference')

        row = 2
        for d in self.context['nonMammalianInVitro']:
            tbl.new_td_txt(row, 0, d['phylogeneticClass'])
            tbl.new_td_txt(row, 1, d['wrd_testSystem'])
            tbl.new_td_txt(row, 2, d['endpoint'])
            tbl.new_td_txt(row, 3, d['endpointTest'])
            tbl.new_td_txt(row, 4, d['wrd_resultA'])
            tbl.new_td_txt(row, 5, d['wrd_resultB'])
            tbl.new_td_txt(row, 6, d['wrd_experimental'])
            tbl.new_td_txt(row, 7, d['wrd_comments'])
            tbl.new_td_txt(row, 8, d['reference']['name'])
            row += 1

        tbl.render(self.doc)
        self.doc.add_paragraph(NONMAMMAL_VITRO_FOOTNOTE)
        self.doc.add_page_break()

    def create_content(self):
        self.setLandscape()
        self.buildHeader()
        self.buildHumanVivoTbl()
        self.buildHumanInVitro()
        self.buildAniVivoTbl()
        self.buildMammInVitroTbl()
        self.buildNonMammInVitroTbl()

    def get_template_fn(self):
        return 'base.docx'
