var stories = [
	{
		title: 'Fall from Grace',
		topic: 'UCD & SUSTAINABILITY', tagline: '',
		summary: 'UC Davis used to be thought of as the national leader in college sustainability. We\'ve slacked off considerably since then - let the data explain how.',
		parts: [
			{
				name: 'Glory Days',
				text: 'In 2012, UC Davis was named the "coolest school" in the US by the Sierra Club. The award celebrates campus environmental responsibility in categories like energy use, waste management, food sources, and education. But a lot has changed since then...',
				pointNames: ['UC Davis','Stanford','UC Irvine','UC Berkeley'], metricName: 'COOL SCHOOLS (2012)',
				pointValues: [1,3,9,20], valueType: 'smallerIsHigher', valueRange: [1,23],
				normalStat: {nums: ['1st','3rd','#9','20th'] },
				detailStat: {nums: ['709','681','628','569'], words: ['sierra club' , 'score']},
				pointText: ['2 years ago, we drew praise for our \'well-rounded\' environmental efforts, including bicycle infrastructure and waste diversion.”'
				,'Barely behind us, Stanford earned honors for its commitment to sustainable agriculture in class and cafeteria.'
				,'Then the closest-ranked UC behind Davis, Irvine was noted for its many extracurricular environmental groups and recycling efforts.'
				,'After 10th place, schools don\'t get writeups, but Davis (1st) was trouncing Berkeley (20th) in the sustainability department in 2012.']
			},
			{
				name: 'Fall from Grace',
				text: 'Since then, we\'ve descended to the bottom of the heap. Old, new, near, or far, all kinds of schools are outperforming UCD on the sustainability front.',
				pointNames: ['UC Davis','Stanford','UC Irvine','UC Berkeley'],
				pointType: 'numbers', metricName: 'COOL SCHOOLS 2014',
				pointValues: [55,6,39,19], valueType: 'smallerIsHigher', valueRange: [1,60],
				normalStat: {nums: ['now 55th','6th','New #1','33rd'] }, //random num, numwords, numpics, pics
				detailStat: {nums: ['660','750','813','699'], words: ['sierra club','score'] },
				pointText: ['2 years ago, we drew praise for our \'well-rounded\' environmental efforts, including bicycle infrastructure and waste diversion.”'
				,'Barely behind us, Stanford earned honors for its commitment to sustainable agriculture in class and cafeteria.'
				,'Then the closest-ranked UC behind Davis, Irvine was noted for its many extracurricular environmental groups and recycling efforts.'
				,'After 10th place, schools don\'t get writeups, but Davis (1st) was trouncing Berkeley (20th) in the sustainability department in 2012.']
			},
			{
				name: 'Davis: UC Sustainability Whipping Boy',
				text: 'Within the University of California, Davis is near dead last. The likes of Berkeley, Santa Cruz, Santa Barbara, San Diego, and even Merced are ranked higher, not to mention Irvine, which at #1 occupies our old throne. The only UCs behind us are LA (close at 60) and Riverside (a dubious 90).',
				pointNames: ['UC Davis','UC Berkeley','UC San Diego','UC Irvine'],
				pointType: 'numbers', metricName: 'GREEN SCHOOLS RANK', valuePrefix: '#',
				pointValues: [55,33,17,1], valueType: 'smallerIsHigher', valueRange: [1,60]
			},
			{
				name: 'How it happened 1: Greenhouse Gas Emissions',
				text: 'The criteria the Sierra Club uses has changed some over time, but UC Davis appears to have regressed while other universities have performed better in the last 2 years. One area where we need to make progress '
			}
		]

	},


]
