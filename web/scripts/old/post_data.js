//"post-process" data info: language database, iconography, materials, behaviors 

var breakdownMtls = { //material index for breakdown view by resource/metric
	'Energy Use Intensity': [ //elec, cool, heat 
		new THREE.MeshLambertMaterial({color: 0xdddd26, emissive: 0x8B9E1E, transparent: true}),
		new THREE.MeshLambertMaterial({color: 0x1aa9c7, emissive: 0x1962a3, transparent: true}), 
		new THREE.MeshLambertMaterial({color: 0xf59222, emissive: 0xc13725, transparent: true})
		],
	water: []
}

var grdwds = {
adjMs: {
	more: ['simply','totally','proper','entirely','awfully','wholly','absolutely','resolutely','thoroughly','decidedly','straight','really'],
	mid: ['.....','pretty','probably','kinda','rather','mostly','basically','sorta','likely','just'],
	less: ['nearly','almost','nearing','technically,','hardly','barely'],
	neg: ['not','below','sub-']
},
adjRs: {
	good: ['optimal','efficient','acceptable','sustainable','awesome','nice','good','cool'],
	ok: ['alright','mediocre','fine','average','okay','meh','\\_(ツ)_/','basic'],
	bad: ['pernicious','garbage','harmful','terrible','saddening','awful','pitiful','shameful','shite','shit','crappy','janky','abusive','gross','wasteful','sickening']
},
nouns: ['building','place','example','job','stuff'],
specG: ['good job','real mvp','building #lifegoals','role model','animal savior','earth friend'],
specO: ['what ever','could improve','needs effort','basic building','basically forgettable'],
specB: ['abyss gazer','energy glutton','sad animals','nature abuse',"dude c'mon",'please improve','frown inducing','eyebrow furrower','face palm','dubious building','needs intervention'],
specA: ['epic waste','campus chamberpot','nature nemesis','earth nemesis','nature antagonist','enviro suicide','weeping planet','just... ...no','inspires nihilism','earth killer','waste incarnate','wasteland imminent','wasteland harbinger','vomit inducing','face palm','hello apocalypse','post apocalyptic','doves cry','god why','please stop','<<see image','bulldoze worthy','omg sux','fucking sucks','deserves demolition','energy bogeyman','demolish worthy']
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
		//static criteria: [0]=good,[1]=ok,[2]=bad,[3]=awful
		criteria: [{lo:30, hi:70},{lo:71, hi:180},{lo:181, hi:220},{lo:221, hi:999}],
		assess_images: ['leaves','okleaf','burnleaf','shit']		
	}
}

var classWeighting = { //josh for values, these are exaggerated
	'Energy Use Intensity': {
		'Computer Lab': 30,
		'Food Service': 25,
		'Science Lab': 40,
		'Large Scale Refrigeration': 50,
		'Heavy Engineering Equipment': 50,
		'High Student Traffic': 30,
		'Study Space': 10,
		'Open Nights': 15
	}
}