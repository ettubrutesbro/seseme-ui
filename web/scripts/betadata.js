var data = {
	arc_saver: {
		pts: [
			{name: 'The ARC', value: 86,
			info: ['a','b','c']},
			{name: 'The ARC', value: 86,
			info: ['a','b','c']},
			{name: 'The ARC', value: 86,
			info: ['a','b','c']},
			{name: 'The ARC', value: 86,
			info: ['a','b','c']}
		],
		caption: "ENERGY USE @",
		criteria: [
		{name:'good',color:'#158C61',min:21,max:51},
		{name:'ok',color:'#C07E2A',min:52,max:82},
		{name:'bad',color:'#C23D26',min:83,max:113},
		{name:'awful',color:'#562F2D',min:114,max:153}
		],
		caption: 'ENERGY USE @',
		specificsType: 'energy',
		nounType: 'building',
		unit: ['ENERGY UNIT', 'INTENSITY']
	},

	ucd_bldg_nrg: {
		location: 'UC Davis',
		name: ['ENERGY USE','AT UCD','(POPULAR', 'BUILDINGS)'],
		pts: [
			{name: 'The ARC',
			value: 86,
			info: ['EST. 2004','200+ EXERCISE MACHINES','4 TOTAL TONS OF WEIGHTS']},
			{name: 'Memorial Union',
			value: 49,
			info: ['EST. 1955','RENOVATIONS BEGIN SPRING \'15','COHO SERVES 800 STUDENTS/DAY']},
			{name: 'The SCC',
			value: 99,
			info: ['EST 2012','RENT A MEETING ROOM HERE','MFDB ARCHITECTS, INC.'],
			suppGrade: 'building energy use accounts for 39% '
			},
			{name: 'Shields Library',
			value: 54,
			info: ['3RD LARGEST LIBRARY IN UC','PETER J SHIELDS WAS A JUDGE','50TH ANNIVERSARY ON APR. 18'],
			suppGrade: 'brain freeze: 57% of students say it\'s too cold in Shields. (check out the Thermal Feedback Tile on myUCD)'
			}
		],
		criteria: [
		{name:'good',color:'#158C61',min:21,max:51},
		{name:'ok',color:'#C07E2A',min:52,max:82},
		{name:'bad',color:'#C23D26',min:83,max:113},
		{name:'awful',color:'#562F2D',min:114,max:153}
		],
		caption: "ENERGY USE @",
		specificsType: 'energy',
		nounType: 'building',
		unit: ['ENERGY UNIT','INTENSITY'],
		dataTotal: 10000
	},
	ucd_creative_nrg: {
		location: 'UC Davis',
		name: ['creative ppl','use energy @','uc davis','too!?'],
		pts: [
			{name: 'Cruess (Design)',
			value: 31,
			info: ['THE HOME OF UCD\'S DESIGN DEPT:','ONLY DESIGN DEPARTMENT IN THE UC','FORMERLY FOOD SCIENCE']
			},
			{name: 'Art Building',
			value: 298,
			info: ['MAKING ART USES A LOT OF ENERGY;', '(I.E. CLAY FIRING, METAL WORKING)', 'BUILT IN 1966','4 FLOORS','76 SPACES','36,800 SQUARE FEET'],
			},
			{name: 'Music Building',
			value: 100,
			info: ['EST. 1966','YOU CAN COME AND PRACTICE','TRY THE LISTENING LAB']
			},
			{name: 'Hunt (LDA)',
			value: 83,
			info: ['HOME OF LANDSCAPE ARCHITECTURE:','SEASONAL STUDENT EXHIBITIONS','IN THE COURTYARD']
			}
			],
		criteria: [
			{name: 'good', min:31, max:98 , color: '#158C61'},
			{name: 'ok', min:99, max:165 , color: '#C07E2A'},
			{name: 'bad', min:166, max:232 , color: '#C23D26'},
			{name: 'awful', min:233, max:298, color: '#562F2D'}
		],
		unit: ['ENERGY UNIT', 'INTENSITY'],
		nounType: 'building',
		specificsType: 'energy'

	},
	ucd_utility_wtr: {
		location: 'UC Davis',
		name: ['UCD water use', '& DROUGHT','(we need to','improve 20%)'],
		pts: [
			{name: 'Cruess (Design)',
			value: 51,
			info: ['THE HOME OF UCD\'S DESIGN DEPT:','ONLY DESIGN DEPARTMENT IN THE UC','FORMERLY FOOD SCIENCE']
			},
			{name: 'Art Building',
			value: 108,
			info: ['MAKING ART USES A LOT OF ENERGY;', '(I.E. CLAY FIRING, METAL WORKING)', 'BUILT IN 1966','4 FLOORS','76 SPACES','36,800 SQUARE FEET'],
			},
			{name: 'Music Building',
			value: 20,
			info: ['EST. 1966','YOU CAN COME AND PRACTICE','TRY THE LISTENING LAB']
			},
			{name: 'Hunt (LDA)',
			value: 193,
			info: ['HOME OF LANDSCAPE ARCHITECTURE:','SEASONAL STUDENT EXHIBITIONS','IN THE COURTYARD']
			}
			],
		criteria: [
			{name: 'good', min:31, max:98 , color: '#158C61'},
			{name: 'ok', min:99, max:165 , color: '#C07E2A'},
			{name: 'bad', min:166, max:232 , color: '#C23D26'},
			{name: 'awful', min:233, max:298, color: '#562F2D'}
		],
		unit: ['ENERGY UNIT', 'INTENSITY'],
		nounType: 'building',
		specificsType: 'energy'
	}
}

var blurbs = {
	energy:{
		grade:['building emissions account for 30% of the world\'s atmospheric carbon',
		'the world\'s ending and it\s largely our fault', 'we are fucked' ],
		stats:[],
		info:[]
	}
}

var vocab = {
	modifiers: {
		more: ['TOTALLY','PRETTY','RATHER','DECIDEDLY','SIMPLY','REMARKABLY','ABSOLUTELY','RESOLUTELY','RESOUNDINGLY','THOROUGHLY','STRAIGHT'],
		mid: ['KINDA','BASICALLY','SORTA','PROBABLY','APPROACHING','DECENTLY','LIKELY','JUST','ACTUALLY'],
		less: ['BARELY','HARDLY','ALMOST','NEARLY','TECHNICALLY','NEARING']
	},
	descriptors: {
		good: ['EFFICIENT','ACCEPTABLE','SUSTAINABLE','COOL','FINE','SOLID'],
		ok: ['ALRIGHT','MEDIOCRE','FINE','AVERAGE','OKAY','MEH','\\_(ツ)_/','BASIC','INOFFENSIVE'],
		bad: ['TRASH','GARBAGE','HARMFUL','SADDENING','AWFUL','PITIFUL','SHAMEFUL','ABUSIVE','JANKY','SHITE','SHIT','DUBIOUS','CRAPPY','JANKY','ABUSIVE','GROSS','WASTEFUL','SICKENING'],
		awful: ['PERNICIOUS','SINISTER','TERRIBLE','TURRIBLE']
	},
	specifics: {
		energy: {		
			good: {
				more: ['REAL MVP','BUILDING #LIFEGOALS','ROLE MODEL','*BREATHES HEAVILY*'],
				mid: ['GOOD JOB','CORRECT DIRECTION','ENCOURAGING SIGNS','ACTUALLY GOOD'],
				less: ['SUB EFFICIENT','NOT TRASH','DOING BETTER','ALMOST THERE','NEARLY THERE','ALMOST ACCEPTABLE']
			},
			ok: {
				more: ['','NOT QUITE','WHAT EVER','NEEDS EFFORT','EFFORT REQUIRED','COULD IMPROVE','NOT EFFICIENT','NEEDS WORK','PLEASE IMPROVE'],
				mid: ['NEEDS INTERVENTION','WHAT EVER','BASIC BUILDING','SIMPLY MEDIOCRE','ABSOLUTELY AVERAGE','MILDLY UNFORTUNATE','LAME SAUCE','SNOOZE FEST','HELLO MEDIOCRITY','ASPIRATION -LESS','AVERAGE HARMFUL','LOW EFFICIENCY'],
				less: ['CONGRATULATIONS (NOT)','NEEDS EFFORT','EFFORT REQUIRED','THOROUGHLY UNINSPIRING','NORMALLY UNFORTUNATE','MILDLY DISTASTEFUL','NORMALLY HARMFUL','JUST UNFORTUNATE','*FURROWED EYEBROWS*','WEAK SAUCE','POTENTIAL JOKE','KINDA HARMFUL','POOR EFFICIENCY']
			},
			bad: {
				less: ['HELLO POLLUTION','ANTI EFFICIENT','CRAP PERFORMANCE','PLANET -HARMING','DUDE C\'MON','FROWN INDUCER','DUBIOUS BUILDING','NO THANKS'],
				mid: ['GOODBYE FLOWERS','WOW #SMH','FACE PALM','GLOBE WARMED','DUDE WHY','C\'MON NOW','WEAK AF','NATURE ABUSE','ENERGY GLUTTON','ABYSS GAZING','PRETTY WASTEFUL','PLZ STOP','INSPIRES NIHILISM','ACTUALLY GARBAGE'],
				more: ['VERGING TEARS','SAD ANIMALS','DISOWN NOW','SELF DESTRUCT','OMG SUX','JUST... ...NO','WEEPING PLANET','ENVIRO SUICIDE','NATURE ANTAGONIST','EARTH\'S NEMESIS','NATURE\'S NEMESIS','SO WASTEFUL']
			},
			awful: {
				less: ['EPIC WASTE','WASTELAND HARBINGER','DESERVES DEMOLITION','BULLDOZE IMMEDIATELY','ABORT BUILDING','POST APOCALYPSE','DEMOLISH NOW','*SAD VIOLIN*','EPIC WASTE','<<SEE IMAGE','OMG SUX'],
				mid: ['WASTE FOREVER','IT\'S OVER','WE\'RE SCREWED','POST APOCALYPTIC','HELLO APOCALYPSE','DEMOLISH PLZ','EARTH KILLER','STRAIGHT GARBAGE','STRAIGHT TRASH','UBER TRASH','ACTUAL SHIT','ACTUALLY SHITE'],
				more: ['EXTINCTION IMMINENT','*SAD VIOLIN*','OBLITERATION- -WORTHY']
			}
		},
		water: {

		}
	},
	nouns: {
		building: ['BUILDING','PLACE','SPACE','SPOT','STUFF','EXAMPLE','SHOW','JOB'],
		abstract: ['STORY','HAPPENINGS','STATISTIC','NEWS','INFORMATION','EVENT','DAYS','SHOW']
	}
}

var plrAprojections = {
origin: {x:2, y:2, z:8, ry: -45},
modes: ['grade','info','stats'],
adjusts: [{x:0,y:1.4,z:0,s:1.25},{x:-1,y:1.5,z:1,s:1.25},{x:-1,y:-1,z:1,s:1.4}],
xyz: [
	{dimX:3, dimY:3.75, x:1.5, y:7, z:8.5},
	{dimX:3, dimY:3.75, x:5, y:5, z:11.5},
	{dimX:3, dimY:3.75, x:-1.5, y:5, z:5},
	]
}

var plrBprojections = {
	origin: {x:8, y:2, z:8, ry: 45},
	modes: ['info','stats','grade'],
	adjusts: [{x:1,y:1.5,z:1,s:1.25},{x:1,y:-1.5,z:1,s:1.3},{x:0,y:1.4,z:0,s:1.25}],
	xyz: [
		{dimX:3, dimY:3.75, x:11, y:5, z:5},
		{dimX:3, dimY:3.75, x:5, y:5, z:11},
		{dimX:3, dimY:3.75, x:8, y:7, z:8}
	]
}

var prompts = {
	welcome: [['try touching to','explore energy'],['carbon emissions:','bad stuff'],['hello UCD','i am SESEME']],
}