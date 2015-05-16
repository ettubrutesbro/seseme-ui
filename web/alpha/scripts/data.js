
var data = {
	'UC Davis':
	[
		{
			name: 'The SCC',
			constructed: 2012,
			'Energy Use Intensity': { elec: 35, cool: 55, heat: 70},
			'Gallons Per Minute': { galm: 3, galh: 100 },
			classes: ['Open Nights','Computer Lab','Food Service','Study Space','High Student Traffic'],
			//classplanations match up with classes and when visual class
			//markers are interacted with, the magnitude is listed
			classPlanations: ['open until 2am', '3 labs, 60 iMacs', '100 lbs of food served / day', 'est. 900 visits / day'],
			//potentially add a "class multiplier" that multiplies
			//class weighting magnitude based on proportion and
			//scale of specialized facilities,
			reasons: ['','','']
			//reasons: an array of strings that offers detail facts
			//about why an building's energy profile might be good/bad
			//year of construction, sustained damage, ongoing construction,
			//temporary overcrowding/logistics, etc...
		},
		 {
			name: 'Chemistry Annex',
			constructed: 1971,
			'Energy Use Intensity': {elec: 102, cool: 58, heat: 114},
			'Gallons Per Minute': { galm: 13, galh: 800},
			classes: ['Science Lab','High Student Traffic'],
			classPlanations: ['18 undergrad labs / quarter', 'hella students everyday'],
			reasons: ['','','']
		},
		 {
			name: 'Giedt Hall',
			constructed: 2006,
			'Energy Use Intensity': {elec: 18, cool: 8, heat: 18},
			'Gallons Per Minute': { galm: 5, galh: 80},
			classes: [],
			classPlanations: [''],
			reasons: ['','','']
		},
		 {
			name: 'Plant & Env. Sci',
			constructed: 2002,
			'Energy Use Intensity': {elec: 166, cool: 59, heat: 98},
			'Gallons Per Minute': { galm: 0.6, galh: 20},
			classes: ['Science Lab','Large Scale Refrigeration'],
			classPlanations: ['50% of ANS. ECO, and AGR classes are in PES', '300 cubic feet of crop refrigeration'],
			reasons: ['','','']
		}
	],

	'University of California':
	[

	]
}
