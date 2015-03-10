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
		best: ['sweet building', 'rather efficient', 'building mvp', 'singing birds', 'children: saved'],
		good: ['pretty efficient','kinda good','mostly acceptable','probably sustainable'],
		ok: ['mostly alright','kinda mediocre','probably fine','sorta average','barely okay'],
		bad: ['kinda sucks','kinda harmful', 'not efficient','needs improvement','pretty bad','mostly awful','not good', 'approaching awful', 'moderately gross', 'sad animals'],
		terrible: ['the worst','actually shit','totally pernicious','actively pernicious','enviro suicide','weeping planet','kinda sickening','dead puppies', 'earth wrecker', 'wasteland imminent', 'actively harmful']
	},
	'Gallons Per Minute': [

	]
}