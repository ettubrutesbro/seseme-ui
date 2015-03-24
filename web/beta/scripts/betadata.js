var data = {
	ucd_bldgA: {
		metrics: ['ENERGY USE','WATER USE'],
		pts: [
			{name: 'The ARC',
			 breakdown: [true, false],
			 stats: [{elec: 20, heat: 10, cool: 10},{galm: 10}],
			 etc: ''},
			{name: 'Memorial Union',
			 breakdown: [false, false],
			 stats: [{elec: 10, heat: 10, cool: 10},{galm: 10}],
			 etc: ''},
			{name: 'The SCC',
			 breakdown: [true, false],
			 stats: [{elec: 10, heat: 10, cool: 10},{galm: 10}],
			 etc: ''},
			{name: 'Shields Library',
			 breakdown: [false, false],
			 stats: [{elec: 10, heat: 10, cool: 10},{galm: 10}],
			 etc: ''},
		],
		agg: 10000
	}
}

var blurbs = {
	energy:{
		grade:[],
		stats:[],
		info:[]
	}

}