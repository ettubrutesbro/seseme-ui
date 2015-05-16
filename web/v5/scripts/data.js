var stories = [
	{
		title: 'UCD vs. The World',
		topic: 'school sustainability ratings',
		taglines: ['If environmental stewardship is a competition, we\'re losing.',
		'The biggest green movement happening here is from your bank to Mrak.'],
		geo: 'simplecow',
		parts: [
			{
				name: 'Glory Days',
				text: 'In 2012, UC Davis was named the "coolest school" in the US by the Sierra Club. The award celebrates campus environmental responsibility in categories like energy use, waste management, food sources, and education. But a lot has changed since then...',
				pointNames: ['UC Davis','Stanford','UC Irvine','UC Berkeley'], metricName: 'COOL SCHOOLS (2012)',
				pointValues: [1,3,9,20], valueType: 'smallerIsHigher', valueRange: [1,23],
				normalStat: {nums: ['1st','3rd','#9','20th'] },
				detailStat: {nums: ['709','681','628','569'], words: ['sierra club' , 'score (2012)']},
				pointText: ['2 years ago, we drew praise for our \'well-rounded\' environmental efforts, including bicycle infrastructure and waste diversion.”'
				,'Barely behind us, Stanford earned honors for its commitment to sustainable agriculture in class and cafeteria.'
				,'Then the closest-ranked UC behind Davis, Irvine was noted for its many extracurricular environmental groups and recycling efforts.'
				,'After 10th place, schools don\'t get writeups, but Davis (1st) was trouncing Berkeley (20th) in the sustainability department in 2012.']
			},
			{
				name: 'Fall from Grace',
				text: 'Since then, our sustainability rank has fallen precipitously: in their most recent Coolest School report, UC Davis ranked #55 - eclipsed by nearly every UC, and many schools near, far, public or private.',
				pointNames: ['UC Davis','Stanford','UC Irvine','UC Berkeley'],
				pointType: 'numbers', metricName: 'COOL SCHOOLS 2014',
				pointValues: [55,6,1,33], valueType: 'smallerIsHigher', valueRange: [1,60],
				normalStat: {nums: [':( 55th','6th','New #1','33rd'] }, //random num, numwords, numpics, pics
				detailStat: {nums: ['660','750','813','699'], words: ['sierra club','score (2014)'] },
				pointText: ['2 years ago, we drew praise for our \'well-rounded\' environmental efforts, including bicycle infrastructure and waste diversion.”'
				,'Barely behind us, Stanford earned honors for its commitment to sustainable agriculture in class and cafeteria.'
				,'Then the closest-ranked UC behind Davis, Irvine was noted for its many extracurricular environmental groups and recycling efforts.'
				,'After 10th place, schools don\'t get writeups, but Davis (1st) was trouncing Berkeley (20th) in the sustainability department in 2012.']
			},
			{
				name: 'Eastern Shade',
				text: 'Within the University of California, Davis is near dead last. The likes of Berkeley, Santa Cruz, Santa Barbara, San Diego, and even Merced are ranked higher, not to mention Irvine, which at #1 occupies our old throne. The only UCs behind us are LA (close at 60) and Riverside (a dubious 90).',
				pointNames: ['UC Davis','UC Berkeley','UC San Diego','UC Irvine'],
				pointType: 'numbers', metricName: 'GREEN SCHOOLS RANK', valuePrefix: '#',
				pointValues: [55,33,17,1], valueType: 'smallerIsHigher', valueRange: [1,60]
			},

		]

	}, //end story 0
	// {
	//
	// }

]
