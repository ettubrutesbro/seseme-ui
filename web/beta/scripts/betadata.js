var data = {
	ucd_bldg_nrg: {
		location: 'UC Davis',
		name: ['building energy impact','in CO2 emissions'],
		pts: [
			{name: 'The ARC',
			value: 86,
			facts: ''},
			{name: 'Memorial Union',
			value: 0,
			facts: ''},
			{name: 'The SCC',
			value: 99,
			facts: ''},
			{name: 'Shields Library',
			value: 54,
			facts: ''}
		],
		criteria: [
		{name:'good',color:'green',min:0,max:0},
		{name:'ok',color:'yellow',min:0,max:0},
		{name:'bad',color:'orange',min:0,max:0},
		{name:'awful',color:'red',min:0,max:0}
		],
		caption: "ENERGY USE @",
		specificsType: 'energy',
		nounType: 'building',
		unit: ['POUNDS OF CO2','PRODUCED PER YEAR'],
		dataTotal: 10000
	},
	ucd_utility_wtr: {
		location: 'UC Davis',
		name: ['water use by utility'],
		pts: [
			{name: '', value:0, facts: ''},
			{name: '', value:0, facts: ''},
			{name: '', value:0, facts: ''},
			{name: '', value:0, facts: ''}
		]
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

var criteria = { //temporary, delete this later
	ucd_bldg_nrg: [{name:'good',color:'green',min:0,max:25},
	{name:'ok',color:'yellow',min:26,max:50},
	{name:'bad',color:'orange',min:51,max:75},
	{name:'awful',color:'red',min:76,max:100}]
}

var vocab = {
	modifiers: {
		more: ['totally','pretty','rather','decidedly','simply','remarkably','absolutely','resolutely','resoundingly','thoroughly','straight'],
		mid: ['kinda','basically','sorta','probably','approaching','decently','likely','just','actually'],
		less: ['barely','hardly','almost','nearly','technically','nearing'],
		neg: ['not','sub-','below','non','anti']
	},
	descriptors: {
		good: ['efficient','acceptable','sustainable','cool','fine','solid'],
		ok: ['alright','mediocre','fine','average','okay','meh','\\_(ツ)_/','basic','inoffensive'],
		bad: ['trash','garbage','harmful','saddening','awful','pitiful','shameful','abusive','janky','shite','shit','dubious','crappy','janky','abusive','gross','wasteful','sickening'],
		awful: ['pernicious','sinister','terrible','turrible']
	},
	specifics: {
		energy: {		
			good: {
				more: ['real mvp','building #lifegoals','role model','*breathes heavily*'],
				mid: ['good job','correct direction','encouraging signs','actually good'],
				less: ['not trash','doing better','almost there','nearly there','almost acceptable']
			},
			ok: {
				more: ['not quite','what ever','needs effort','effort required','could improve','not efficient','needs work','please improve'],
				mid: ['needs intervention','what ever','basic building','simply mediocre','absolutely average','mildly unfortunate','lame sauce','snooze fest','hello mediocrity','aspiration -less','average harmful','low efficiency'],
				less: ['congratulations (not)','needs effort','effort required','thoroughly uninspiring','normally unfortunate','mildly distasteful','normally harmful','just unfortunate','*furrowed eyebrows*','weak sauce','potential joke','kinda harmful','poor efficiency']
			},
			bad: {
				less: ['hello pollution','anti efficient','crap performance','planet -harming','dude c\'mon','frown inducer','dubious building','no thanks'],
				mid: ['goodbye flowers','wow #smh','face palm','globe warmed','dude why','c\'mon now','weak af','nature abuse','energy glutton','abyss gazing','pretty wasteful','plz stop','inspires nihilism','actually garbage'],
				more: ['verging tears','sad animals','disown now','self destruct','omg sux','just... ...no','weeping planet','enviro suicide','nature antagonist','earth\'s nemesis','nature\'s nemesis','so wasteful','']
			},
			awful: {
				less: ['epic waste','wasteland harbinger','deserves demolition','bulldoze immediately','abort building','post apocalypse','demolish now','*sad violin*','epic waste','<<see image','omg sux'],
				mid: ['waste forever','it\'s over','we\'re screwed','post apocalyptic','hello apocalypse','demolish plz','earth killer','straight GARBAGE','straight trash','uber trash','actual shit','actually shite'],
				more: ['extinction imminent','*sad violin*','obliteration- -worthy']
			}
		},
		water: {

		}
	},
	nouns: {
		building: ['building','place','space','spot','stuff','example','show','job'],
		abstract: ['story','happenings','statistic','news','information','event','days','show']
	}
}