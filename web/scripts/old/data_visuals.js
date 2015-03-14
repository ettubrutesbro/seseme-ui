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
	'Energy Use Intensity': {
		best: ['(heavy breathing)','sweet building','totally sweet','rather efficient','building mvp','singing birds','children: saved','example setter','role model','trend setter','building #lifegoals','efficiency amazeballs','*breathes heavily*','efficiency wunderkind','best building',"doesn't waste",'bright hope','best&brightest'],
		good: ['pretty efficient','kinda good','mostly acceptable','probably sustainable', 'almost there!', 'doing better', 'getting there!', 'not bad','cool building','almost... ..there..','not wasteful'],
		ok: ['mostly alright','kinda mediocre','probably fine','sorta average','barely okay', 'almost garbage', 'nearly acceptable', 'pretty meh','what ever','mediocre building','okay building','rating: ¯\\_(ツ)_/¯','needs effort','try harder','do better','.... ..ok','basic building','totally average'],
		bad: ['abyss gazing', 'kinda sucks','kinda harmful', 'not efficient','needs improvement','pretty bad','mostly awful','not good','approaching awful', 'moderately gross', 'sad animals', 'straight garbage', 'nature cries','nature abuse','just no'],
		terrible: ['campus chamberpot','frightful prospects','wasteful horror',"nature's nemesis",'the worst','actually shit','totally pernicious','actively pernicious','enviro suicide','weeping planet','kinda sickening','please no','dead puppies','earth wrecker','wasteland imminent','actively harmful','post apocalyptic','doves cry','wholly garbage','entirely shameful','earth killer','waste incarnate','see image']
	},
	'Gallons Per Minute': [
		
	]
}

var assessWords = {
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