var data = {
	ucd_bldg_nrg: {
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
		agg: 10000
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
	{name:'awful',color:'red',min:76,max:100}]
}