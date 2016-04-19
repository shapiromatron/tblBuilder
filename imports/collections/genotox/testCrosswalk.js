export default {
    'Non-mammalian': {
        'Acellular systems': {
            'Genotox': {
                'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'Intercalation', 'Other'],
            },
        },
        'Prokaryote (bacteria)': {
            'Genotox': {
                'DNA damage': ['DNA strand breaks', 'DNA cross-links', 'Other'],
                'Mutation': ['Reverse mutation', 'Forward mutation', 'Other'],
                'DNA repair': ['Other'],
            },
        },
        'Lower eukaryote (yeast, mold)': {
            'Genotox': {
                'DNA damage': ['DNA strand breaks', 'DNA cross-links', 'Other'],
                'Mutation': ['Reverse mutation', 'Forward mutation', 'Gene conversion', 'Other'],
                'Chromosomal damage': ['Chromosomal aberrations', 'Aneuploidy', 'Other'],
            },
        },
        'Insect': {
            'Genotox': {
                'Mutation': ['Somatic mutation and recombination test (SMART)', 'Sex-linked recessive lethal mutations', 'Heritable translocation test', 'Dominant lethal test', 'Other'],
                'Chromosomal damage': ['Aneuploidy', 'Other'],
                'DNA repair': ['Other'],
            },
        },
        'Plant systems': {
            'Genotox': {
                'DNA damage': ['Unscheduled DNA synthesis', 'Other'],
                'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                'Mutation': ['Reverse mutation', 'Forward mutation', 'Gene conversion', 'Other'],
            },
        },
        'Other (fish, worm, bird, etc)': {
            'Genotox': {
                'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
                'Mutation': ['Oncogene', 'Tumour suppressor', 'Other'],
                'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                'DNA repair': ['Other'],
            },
        },
    },
    'Mammalian and human in vitro': {
        'Human': {
            'Genotox': {
                'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
                'Mutation': ['Oncogene', 'Tumour suppressor', 'Other'],
                'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                'DNA repair': ['Other'],
                'Cell transformation': ['Other'],
            },
        },
        'Non-human mammalian': {
            'Genotox': {
                'DNA damage': ['DNA adducts ', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
                'Mutation': ['tk', 'hprt ', 'ouabain resistance', 'Other gene', 'Chromosomal damage', 'Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                'DNA repair': ['Other'],
                'Cell transformation': ['Other'],
            },
        },
    },
    'Animal in vivo': {
        'Genotox': {
            'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
            'Mutation': ['Mouse spot test', 'Mouse specific locus test', 'Dominant lethal test', 'Transgenic animal tests ', 'Other'],
            'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
            'DNA repair': ['Other'],
        },
    },
    'Human in vivo': {
        'Genotox': {
            'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
            'Mutation': ['Oncogene', 'Tumour suppressor', 'Other'],
            'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
            'DNA repair': ['Other'],
        },
    },
};
