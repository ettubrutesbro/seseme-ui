var data = {
	ucd_bldg_nrg: {
		location: 'UC Davis',
		name: ['building energy impact','in CO2 emissions'],
		pts: [
			{name: 'The ARC',
			value: 86,
			facts: ''},
			{name: 'Memorial Union',
			value: 44,
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

var criteria = {
	ucd_bldg_nrg: [{name:'good',color:'green',min:0,max:25},
	{name:'ok',color:'yellow',min:26,max:50},
	{name:'bad',color:'orange',min:51,max:75},
	{name:'awful',color:'red',min:76,max:1000}]
}