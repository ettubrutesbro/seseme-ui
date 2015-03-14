//post data info: language database, iconography, materials, behaviors 

var breakdownMtls = { //material index for breakdown view by resource/metric
	'Energy Use Intensity': [ //elec, cool, heat 
		new THREE.MeshLambertMaterial({color: 0xdddd26, emissive: 0x8B9E1E, transparent: true}),
		new THREE.MeshLambertMaterial({color: 0x1aa9c7, emissive: 0x1962a3, transparent: true}), 
		new THREE.MeshLambertMaterial({color: 0xf59222, emissive: 0xc13725, transparent: true})
		],
	water: []
}

var gradeWords = {
adjModifiers: {
	upper: ['totally','entirely','awfully','wholly','absolutely','resolutely','thoroughly','decidedly','straight'],
	mid: ['pretty','probably','kinda','rather','mostly','basically','sorta','likely','just'],
	lower: ['nearly','almost','nearing','technically,'],
	negatory: ['not','never','hardly','barely']
},
adjRatings: {
	good: ['efficient','acceptable','sustainable','awesome','nice','good','great','cool'],
	ok: ['alright','mediocre','fine','average','okay','meh','¯\\_(ツ)_/¯','basic'],
	bad: ['pernicious','garbage','harmful','terrible','sad','bad','awful','pitiful','shameful','shite','shit','crappy','janky','abusive','gross','wasteful','sickening']
},
nounRatings: ['building','place','example'],
specificGood: ['good job','real mvp','building #lifegoals','role model','animal savior','earth friend'],
specificOk: ['what ever','could improve','needs effort','basic building','basically forgettable'],
specificBad: ['abyss gazer','sad animals','nature abuse',"dude c'mon",'please improve','frown inducing','eyebrow furrower','face palm','dubious building','needs intervention'],
specificTerrible: ['epic waste','campus chamberpot','nature nemesis','earth nemesis','nature antagonist','enviro suicide','weeping planet','just... ...no', 'earth killer','waste incarnate','wasteland imminent','wasteland harbinger','vomit inducing','face palm','hello apocalypse','post apocalyptic','doves cry','god why','please stop','<<see image','bulldoze worthy','omg sux','fucking sucks','deserves demolition','energy bogeyman']
}

var metricMetaData = {
	'Energy Use Intensity': {		
		metric_abbr: 'EUI',
		breakdown_type: 'divide',
		breakdown_icons: ['elec','heat','cool'],
		breakdown_mtls: [
			new THREE.MeshLambertMaterial({color: 0xdddd26, emissive: 0x8B9E1E, transparent: true}),
			new THREE.MeshLambertMaterial({color: 0x1aa9c7, emissive: 0x1962a3, transparent: true}), 
			new THREE.MeshLambertMaterial({color: 0xf59222, emissive: 0xc13725, transparent: true})
		],
		//static criteria: [0]=good,[1]=ok,[2]=bad,[3]=terrible
		criteria: [{l:0, h:55},{l:56, h:100},{l:101, h:250},{l:251, h:500}],
		assess_images: ['leaves','shrug','burnleaf','shit']		
	}
}