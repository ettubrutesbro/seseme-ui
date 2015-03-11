//specific data-bound visuals: iconography, materials, potentially bedaviors

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
		terrible: ['literal chamberpot','frightful prospects','wasteful horror',"nature's nemesis",'the worst','actually shit','totally pernicious','actively pernicious','enviro suicide','weeping planet','kinda sickening','please no','dead puppies','earth wrecker','wasteland imminent','actively harmful','post apocalyptic','doves cry','wholly garbage','entirely shameful','earth killer','waste incarnate','see image']
	},
	'Gallons Per Minute': [

	]
}