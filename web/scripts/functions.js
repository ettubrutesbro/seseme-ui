// data driven -------------
function getData(reqSet, reqResource){ 
	//add an event listener for a socket update is setup for this
	//alternatively it can be run from the client when they request through the front end
	currentData = reqSet
	currentResource = reqResource
	dataToHts()
	autoRotate(360) //optional visual flourish?
	uiShift()
	assess()
	// hueEvent(true,255,0,0,255,255,255)
}
function dataToHts(){ // translates data vals 
	data[currentDataSet].forEach(function(ele,i,arr){
		var total = 0
		var keyList = Object.keys(ele[currentResource])
		for(var i = 0; i < keyList.length; i++){
			total += (ele[currentResource][keyList[i]])
		}
		allValues.push(total)
	})
	console.log('pillar hts: ' + allValues)
	var highestValue = allValues.indexOf(Math.max.apply( Math, allValues ))
	allValues.forEach(function(ele,i,arr){
		tgtHts[i].y = (ele / arr[highestValue]) * 12
	})
}
function updatePillars(plr){
	var index = plr.replace('plr','')
	index -=1
	spd = Math.abs((seseme.getObjectByName(plr).position.y - tgtHts[index].y)*100) + 400
	plrTween = new TWEEN.Tween(plrHts[index])
	plrTween.to(tgtHts[index],spd)
	plrTween.easing(TWEEN.Easing.Cubic.InOut)
	plrTween.onUpdate(function(){
		seseme.getObjectByName(plr).position.y = plrHts[index].y
	})
	plrTween.start()
}

function hueEvent(on,r,g,b,er,eg,eb){
	//could develop a formula for auto-generating emissive values but
	//for now this gives us more control
	console.log(orbmtl)
	var start = {
		red: orbmtl.color.r,
		green: orbmtl.color.g,
		blue: orbmtl.color.b 
	}
	hueTween = new TWEEN.Tween(start)
	hueTween.to({
		red: r/255,
		green: g/255,
		blue: b/255
	},1000)
	hueTween.onUpdate(function(){
		orbmtl.color.r = start.red
		orbmtl.color.g = start.green
		orbmtl.color.b = start.blue

	})
	hueTween.start()

	// if(on){
	// 	orbmtl.color = new THREE.Color('rgb('+r+','+g+','+b+')')
	// 	orbmtl.emissive = new THREE.Color('rgb('+er+','+eg+','+eb+')')
	// 	orbmtl.specular = new THREE.Color(0xededed)
	// 	orbmtl.shininess = 3
	// }else{
	// 	orbmtl.color = new THREE.Color(0x80848e)
	// 	orbmtl.emissive = new THREE.Color(0x000000)
	// 	orbmtl.specular = new THREE.Color(0x272727)
	// 	orbmtl.shininess = 8
	// }
}


function assess(){ //gets values, adds weights, compares vs. criteria, assembles words
allValues.forEach(function(ele,i){
	var classes = data[currentDataSet][i].classes,
	classWeights = 0
	classes.forEach(function(e){
		classWeights += classWeighting[currentResource][e]
	})
	var weightedValue = ele - classWeights, distances = [], range
	metricMetaData[currentResource].criteria.forEach(function(el,it){
		if(weightedValue >= el.lo && weightedValue <= el.hi){
			grades[i] = it
			distances.push(weightedValue - el.lo)
			distances.push(el.hi - weightedValue)
			range = el.hi - el.lo
		}
	})
	if(distances[0]>distances[1]){
		if(distances[1]+(range/3) >= distances[0]){ //close
			distFromCtr.push('mid') 
		}else{ //wv is close to high end of range
			distFromCtr.push('high')
		}
	}else if(distances[0]<distances[1]){
		if(distances[0]+(range/3) >= distances[0]){ //close
			distFromCtr.push('mid')
		}else { //wval is close to low end of range
			distFromCtr.push('low')
		}
	}else if(distances[0]==distances[1]){ //close
		distFromCtr.push('mid')
	}

})
console.log('grades: ' + grades)
} //end assess

function judgment(grade,distFromCtr){
	// console.log('grade:'+grade + " dist:"+distFromCtr)
	switch(grade){
		case 0: //-----------------------GOOD---------------------------------//
		var r = getOne('adjRs.good')
			switch(distFromCtr){
				case 'low': //really good
					switch(dice(2,1)){
						case 1:
							return getOne('adjMs.more') + " " + r
							break;
						case 2:
							return getOne('specG')
							break;
					}					
					break;
				case 'mid': //pretty good
					switch(dice(2,1)){
						case 1:
							return getOne('adjMs.mid') + " " + r
							break;
						case 2:
							return r + " " + getOne('nouns')
							break;
					}
					break;
				case 'high': //barely good
					return getOne('adjMs.less') + ' ' + r
					break;
			}
			break; 
		case 1: //----------------OK---------------------------------//
			var r = getOne('adjRs.ok')
			switch(distFromCtr){
				case 'low':
					return getOne('adjMs.more') + " " + r
					break;
				case 'mid':
					switch(dice(4,1)){
						case 1:
							return getOne('adjMs.mid') + " " + r
							break;
						case 2:
							return getOne('adjMs.neg') + ' ' + getOne('adjRs.bad')
							break;
						case 3:
							return getOne('specO')
							break;
						case 4:
							return r + ' ' + getOne('nouns')
							break;
					}
					break;
				case 'high':
					switch(dice(2,1)){
						case 1:
							return getOne('adjMs.less') + ' ' + r
							break;
						case 2:
							return getOne('adjMs.neg') + ' ' + getOne('adjRs.good')
							break;
					}
					break;
			}
			break; 
		case 2: //------------------------------BAD------------------------------//
			var r = getOne('adjRs.bad')
			switch(distFromCtr){
				case 'low':
					switch(dice(2,1)){
						case 1:
							return getOne('adjMs.less') + ' ' + r
							break;
						case 2:
							return getOne('adjMs.neg') + ' ' + getOne('adjRs.ok')
							break;
					}
					break;
				case 'mid':
					return getOne('adjMs.mid') + ' ' + r
					break;
				case 'high':
					return getOne('specB')
					break;
			}
			break;
		case 3: //------------------------------AWFUL ------------------------------//
			
			if(distFromCtr=='low'){
				var r = getOne(adjRs.bad)
				switch(dice(2,1)){
					case 1:
						return getOne('adjMs.more')+' '+r
						break;
					case 2:
						return r + ' ' + getOne('nouns')
						break;
				}
			}else{
				return getOne('specA')
			}
		break;
	}

}
function uiShift(){ //selection through rotations populates UI
	if(selectedObj != lastObj){
		console.log('shifting UI')
		var name = document.querySelector('#name')

		if(selectedObj == 'pedestal' ){
			// name.textContent = currentResource + " @ " + currentDataSet 
		}else{
			var index = ['plr1','plr2','plr3','plr4'].indexOf(selectedObj),
			viewNum = document.querySelector('#dataNum'),
			abbr = document.querySelector('#dataUnit'),
			icon = document.querySelector('#gradePic')
			
			name.textContent = data[currentDataSet][index].name
			viewNum.textContent = allValues[index]
			abbr.textContent = currentAbbr

			iconName = metricMetaData[currentResource].assess_images[grades[index]]
			tgtIcon = icons.indexOf(document.getElementById(iconName))
			parent = document.getElementById('gradePic')
			
			icons.forEach(function(ele,i){
				Velocity(ele,'finish')
				if(i!=tgtIcon){
					parent.appendChild(ele)
				}
			})
			var insertGrades = judgment(grades[index],distFromCtr[index])
			console.log(insertGrades)
			insertGrades = insertGrades.split(' ')
			var gradeWords = document.querySelectorAll('.gradeWords')
			gradeWords[0].textContent = insertGrades[0]
			gradeWords[1].textContent = insertGrades[1]

			if(breakdownOn){
				breakdownShift((pillars[0].replace('plr','') - 1))
			}
		}
	}
}//end uiShift

//interaction prompts ---------------


function clickedSeseme(){
	raycast.setFromCamera(mousePos, camera)
	var intersects = raycast.intersectObjects([].slice.call(seseme.children))
	if(intersects == ''){
		var clicked = 'ground'
	}else{
		var clicked = intersects[0].object.name
	}
	
	if(clicked != 'ground' && clicked != 'orb'){ //pillar or pedestal
		index = ['pedestal','plr1','plr2','plr3','plr4'].indexOf(clicked)
		userActions.push('clicked ' + clicked)

		if(clicked == selectedObj){ //already selected
			//zoom/mode/navfunc
			console.log('clicked same one, zoom')
		}else{ //new selection
			if(index > 0){ //pillar
				distance = pillars.indexOf(clicked)
				if(distance==1){
					autoRotate(-90)
					rotDir = -1
				}else if(distance==2){
					autoRotate(rotDir * 180)
				}else if(distance==3){
					autoRotate(90)
					rotDir = 1
				}
			}else{ //pedestal
				highlight(0) //highlights pedestal
				//modify title? do a shift?
			}
			lastObj = selectedObj
			selectedObj = clicked
		}
	}else{ //clicked the ground or the orb
		highlight('')
		lastObj = selectedObj
		selectedObj = ''
		//do this only if we know a nav is selected
		if(mode>0){
			clickedNav(mode-1)
			mode = 0
		}
		userActions.push('clicked ground')
	}
}
function clickedNav(index){
	console.log(index)
	userActions.push('clicked ' + navs[index].id)	
	sections = [].slice.call(document.getElementById('sectionContainer').children)
	console.log(sections[index])
	if(mode==0 || index+1 != mode){ 
		if(mode!=0){
			//close open nav
			Velocity(sections[mode-1],{height: "0"})
			navFuncs[index](false)
		}
		
		sectionHeights = ["6.25rem","9rem","",""]
		console.log('open nav')
		navFuncs[index](true)
		navIconAnim(index,true)
		navIconInvert(index,true) //these funcs can be consolidated
		mode=index+1
		sections[index].style["display"] = "block"
		Velocity(sections[index],{height: sectionHeights[index], opacity: [1,-0.5]})
	}else{
		Velocity(sections[index],{height: 0, opacity: -1.25},{complete: function(){
			sections[index].style["display"] = "none"
		}})
		lastObj = selectedObj
		selectedObj = ''
		navFuncs[index](false)
		navIconAnim(index,false)
		navIconInvert(index,false)
		mode=0
	}
}
// ----------3d operations-----------------
function shift(tgtPosZoom, addspeed){
	var currentPosZoom = {x: camera.position.x, y: camera.position.y, zoom: camera.zoom}
	var shiftSpeed = (Math.abs(camera.zoom - tgtPosZoom.zoom)) * 600 + 300
		if(addspeed != undefined){
			shiftSpeed += addspeed	
		}
	var shiftTween = new TWEEN.Tween(currentPosZoom)
	shiftTween.to(tgtPosZoom, shiftSpeed)
	shiftTween.onUpdate(function(){
		camera.position.x = currentPosZoom.x
		camera.position.y = currentPosZoom.y
		camera.zoom = currentPosZoom.zoom
		camera.updateProjectionMatrix()
	})
	shiftTween.easing(TWEEN.Easing.Cubic.Out)
	shiftTween.start()
}
function autoRotate(deg){
	current = {rotationY: seseme.rotation.y}
	tgt = {rotationY: (nearest90*(Math.PI/180)) + (deg * (Math.PI/180))}
	spd = Math.abs(tgt.rotationY - current.rotationY)*200 + 350
	console.log(current.rotationY + " " + tgt.rotationY)
	rotate = new TWEEN.Tween(current)
	rotate.to(tgt,spd)
	rotate.easing(TWEEN.Easing.Quadratic.Out)
	rotate.onUpdate(function(){
		seseme.rotation.y = current.rotationY
		realRotation()
		findNearest90()
		highlightCheck()
		uiShift()
	})
	rotate.start()
	rotate.onStart(function(){
		zoomHeightCheck()
		isRotating = true
	})
	rotate.onComplete(function(){
		isRotating = false
	})
}
// ------- math processes to make things make sense / work -------------
function findNearest90(){
	for(var i = 0; i < 5 ;i++){
		if(Math.abs(sRotY-(i*90)) <= 45){
			nearest90 = i*90
			if(i==4){nearest90 = 0}
			rotationOrder(all90s.indexOf(nearest90))
		}
	}
}
function realRotation(){ 
	sRotY = seseme.rotation.y * (180/Math.PI)
		if(sRotY < 0){
			seseme.rotation.y = (360+sRotY) / (180/Math.PI)
			revolutionCount +=1
			userActions.push('# revs: ' + revolutionCount)
		}
		if(Math.abs(sRotY/360) >= 1){
			numRevs = Math.abs(Math.floor(sRotY/360))
			actRot = sRotY - (numRevs*360)
			if(sRotY < 0){actRot = sRotY+(numRevs*360)}
			seseme.rotation.y = actRot / (180/Math.PI)
			revolutionCount +=1
			userActions.push('# revs: ' + revolutionCount)
		}
	sRotY = seseme.rotation.y * (180/Math.PI)
}
function rotationOrder(distance){
	//reorders the pillar array by taking everything b4 new selection and putting it at the end
	//'distance' being how deep in the array you clicked
	for(var i = 0; i < distance; i++){
		pillars.push(pillars.shift())
		all90s.push(all90s.shift())
	}
}
function highlight(outlineNumber){
	if(highlightsOK){	
	outlines.forEach(function(ele){
		ele.opacity = 0
	})
	if(outlineNumber!=''&&outlineNumber!=undefined){
		outlines[outlineNumber].opacity = 1
	}}
}
function highlightCheck(){
		if(selectedObj == "pedestal"){
		}else{
			highlightRanges =[{min: 0, max: 45,p:1},{min:315,max: 360,p:1},{min:228,max:314,p:2},{min:137,max:227,p:3},{min:46,max:136,p:4}]
			highlightRanges.forEach(function(ele,i){
				if(ele.max >= sRotY && ele.min <= sRotY){
					highlight(ele.p)
					lastObj = selectedObj
					selectedObj = "plr" + ele.p
				}
			})
		}
	
}
function disableHighlights(){
	highlightsOK = false
	outlines.forEach(function(ele){
		ele.opacity = 0
	})
}
function zoomHeightCheck(){
	if(mode==1 && !breakdownOn){
		var index = selectedObj.replace('plr','')
		index -= 1
		shift({x: -19.75, y: 17+Math.round((tgtHts[index].y)/1.6), zoom: 2},400)
	}
}
// ----------navigation mode---------------

function navIconAnim(tgt,openclose){
	nav = [].slice.call(document.querySelectorAll('.navbutt object'))
	nav = nav[tgt].getSVGDocument()
	if(openclose){
		openAnims = [].slice.call(nav.querySelectorAll('.open'))
		openAnims.forEach(function(e){
			e.beginElement()
		})
	}else{
		closeAnims = [].slice.call(nav.querySelectorAll('.close'))
		closeAnims.forEach(function(e){
			e.beginElement()
		})
	}
}

function navIconInvert(tgt,white){
	//v,d,t-stroke, h-fill 
	navSvgs = [].slice.call(document.querySelectorAll('.navbutt object'))
	navSvgs.forEach(function(ele,i){
		ele = ele.getSVGDocument()
		g = ele.querySelector('g')

		if(white){
			if(g.getAttribute('stroke')!=null){
				Velocity(g,{stroke: "#ededed"})	
			}else{
				Velocity(g,{fill: "#ededed"})
			}
			if(i!=tgt){
				Velocity(g,{opacity: 0.5},{queue: false})
			}else{
				Velocity(g,{opacity: 1},{queue: false})
			}
		}else if(!white){
			if(g.getAttribute('stroke')!=null){
				Velocity(g,{stroke: "#231F20", opacity: 1})
			}else{
				Velocity(g,{fill: "#231F20", opacity: 1})
			}
		}
	})
}

viewFunc = function(open){
	var name = document.querySelector('#name')
	var hide = document.querySelector('#titleRule')
	var options = document.querySelector('#optionsButton')
	
	// Velocity(name, "finish")
	Velocity(hide, "finish")
	Velocity(options,"finish")
	if(open){
			if(selectedObj == 'pedestal' || selectedObj == ''){
			sRotY = seseme.rotation.y * (180/Math.PI)
			highlightCheck()
		}
		//3d shift 
		var index = selectedObj.replace('plr','')
		highlight(index)
		index -= 1
		shift({x: -19.75, y: 17+Math.round((tgtHts[index].y)/1.6), zoom: 2})
		//dom manipulation
		Velocity(name, {scale: 1.25, backgroundColorAlpha: 1})
		Velocity(hide, {opacity: 0})
		Velocity(options, {opacity: 1, translateY: ['-0.75rem','-0.75rem'], translateX: ['0rem','1.5rem']})
		hammerIcon = new Hammer(options)
		hammerIcon.on('tap',breakdown)
	}else{
		shift(defaultPosZoom)
		if(breakdownOn){
			breakdown()
		}
		Velocity(options, {opacity: -1,translateX:['1.5rem','0rem']})
		Velocity(name, {scale: 1.0, backgroundColorAlpha: 0})
		Velocity(hide, {translateX:['0rem','-2rem'], opacity: 1})
		hammerIcon.off('tap',breakdown)
	}
}

dataFunc = function(open){
	if(open){
		shift({x: -19.75, y: 17, zoom: 0.5})
	}else{
		shift(defaultPosZoom)
	}	
}
talkFunc = function(open){
	if(open){
		shift({x: -19.75, y: 17, zoom: 1.7})
	}else{
		shift(defaultPosZoom)
	}
}
helpFunc = function(open){
	if(open){
		shift({x: -19.75, y: 17, zoom: 1.5})
	}else{
		shift(defaultPosZoom)
	}
}
// view specific functions
function breakdown(){ // additive breakdown by #resource inputs (elec, heat, cool for PWR)
	if(!isRotating){
		var semantic = document.querySelector('#semantic'), grade = document.querySelector('#grade'), 
		aggData = document.querySelector('#aggData'), bkdown = document.querySelector('#breakdown'), 
		spelled = document.querySelector('#spelledUnit'), rule = document.querySelector('#viewRule'),
		options = document.querySelector('#optionsButton')
	
		Velocity(semantic, 'finish')
		Velocity(grade, 'finish')
		Velocity(aggData, 'finish')
		Velocity(bkdown, 'finish')
		Velocity(spelled, 'finish')
		Velocity(rule, 'finish')
		Velocity(options, 'finish')
	
		if(selectedObj == 'pedestal'){
			selectedObj = ''
			sRotY = seseme.rotation.y * (180/Math.PI)
			highlightCheck()
		}
		 if(!breakdownOn){ //turn on breakdown
		 	function breakdownDOM(){
		 		spelled.textContent = currentResource
		 		options.className = 'grade'
				Velocity(semantic, {height: "1.75rem"})
				Velocity(grade, {width: 0, opacity: -1},{duration: 500, easing: 'easeInQuad'})
				Velocity(spelled, {width: "70%", opacity: 1, padding: '0.2rem'},{delay: 400, duration: 500, easing: 'easeOutQuad'})
				// Velocity(aggData, {color: '#000', backgroundColorAlpha: 1},{duration: 500})
				Velocity(bkdown, {height: "1.1rem", opacity: 1},{duration: 300})
				Velocity(rule, {width:'100%', opacity: 1,translateY:['0.3rem','0.3rem']}, {delay: 200, duration: 500})	
		 	}
		 	function breakdown3d(){
		 		index = pillars[0].replace('plr','') - 1,
		 		console.log('breakdown starts w/ pillar ' + index)
				keyList = Object.keys(data[currentDataSet][index][currentResource])
				breakdownShift(index)
				
				for(var it = 0; it<4; it++){
					var total = 0, breakdownHts = [], 
					ht = tgtHts[it].y+1.25, detailStat = [], tMtxs = [[2.7,7.3],[7.3,7.3],[7.3,7.3],[2.7,7.3]]
					console.log(ht)
					for(var i = 0; i<keyList.length; i++){ //get the pillar's total
						total += data[currentDataSet][it][currentResource][keyList[i]]
					} //should rewrite this with dataToHts to make global, easily referenced data vals / totals
					for(var i = 0; i<keyList.length; i++){ //math to turn proportions into proper bkdown hts
						proportion = (data[currentDataSet][it][currentResource][keyList[i]]) / total
						breakdownHts[i] = proportion * ht
						geometry = new THREE.BoxGeometry(4,breakdownHts[i],4)
						breakdownMtls[currentResource][i].opacity = 0
						detailStat[i] = new THREE.Mesh(geometry, breakdownMtls[currentResource][i])
						detailStat[i].applyMatrix(new THREE.Matrix4().makeTranslation(tMtxs[it][0],-breakdownHts[i]/2+0.25,tMtxs[it][1]))
						detailStat[i].scale.set(0.9,1,0.9)
						detailStat[i].name = "p" + (it+1) + "bkd" + i
						if(breakdownHts[i-1]!=undefined){
							for (var m = 0; m<i; m++){
								detailStat[i].position.y -= breakdownHts[m]
						}}
						var parent = scene.getObjectByName('plr' + (it+1))
						parent.add(detailStat[i])
					}
					detailStat.forEach(function(e,ii,arr){
						current = {opacity: 0, x: 0.6, z: 0.6}
						e.scaleTween = new TWEEN.Tween(current).delay(ii*100)
						e.scaleTween.to({opacity: 0.9, x: 1.04, z: 1.04},800)
						e.scaleTween.easing(TWEEN.Easing.Cubic.Out)
						e.scaleTween.onUpdate(function(){
							e.scale.x = current.x
							e.scale.z = current.z
							e.material.opacity = current.opacity
						})
						e.scaleTween.start()
					})
				} //end pillars.forEach
		 	} //end breakdown3d
		 	disableHighlights() //no red highlights in bkdown
		 	shift({x: -19.75, y: 15, zoom: 1.2})
		 	breakdownOn = true
		 	breakdown3d()
		 	breakdownDOM()
		 } else { // if breakdown is already on
		 	function remove3d(){
				var bkd = []
				for(var i = 1; i < 5; i++){
					bkd.push(seseme.getObjectByName('plr' + i).children)
				}
				bkd.forEach(function(ele,i){
					ele.forEach(function(e,it,arr){
						if(it>0){ //avoud removing outline e[0]
							current = {opacity: 0.9, x: 1, z: 1}
							e.removeTween = new TWEEN.Tween(current)
							e.removeTween.to({opacity: 0, x: 0.6, z: 0.6}, 500)
							e.removeTween.start()
							e.removeTween.onUpdate(function(){
								e.material.opacity = current.opacity
								e.scale.x = current.x
								e.scale.z = current.z
							})
							e.removeTween.onComplete(function(){
								arr.splice(1,(arr.length-1))
							})
						}
					})
				})
		 	}
		 	function revertDOM(){
		 		options.className = ''
				Velocity(semantic, {height: "2.75rem"})
				Velocity(spelled, {width: 0, opacity: 0, padding: 0})
				Velocity(grade, {width: "70%", opacity: 1}, {delay: 200, duration: 700, easing: 'easeOutCubic'})
				// Velocity(aggData, {color: '#fff', backgroundColorAlpha: 0}, {delay: 400, duration: 500})
				Velocity(bkdown, {height: 0, opacity: 0.3})
				Velocity(rule, {width: '0%',opacity: 0,translateY:['0.3rem','0.3rem']}, {duration: 500})
		 	}
		 	highlightsOK = true
		 	var index = selectedObj.replace('plr','')
		 	highlight(index)
			index -= 1
			if(selectedObj != ''){
				shift({x: -19.75, y: 17+Math.round((tgtHts[index].y)/1.8), zoom: 2})
			}
		 	remove3d()
		 	revertDOM()

		 	breakdownOn = false
		 }  
	} //isRotating
}//end breakdown
function breakdownShift(indexnumber){
	var bkdDom = document.getElementById('breakdown') 
	bkdDom.innerHTML = ''
	for(var i = 0; i<keyList.length; i++){
		var element = document.createElement('div')
		element.class = 'breakdownStat'
		element.style['width'] = (Math.floor(100 / keyList.length - 1) + "%")
		element.style['text-align'] = 'right'
		element.style['padding'] = '0.1rem 0.2rem'
		element.style['backgroundColor'] = ("rgb(" + breakdownMtls[currentResource][i].color.r*255 + "," + 
			breakdownMtls[currentResource][i].color.g*255 + "," + 
			breakdownMtls[currentResource][i].color.b*255 + ")")
		element.textContent = data[currentDataSet][indexnumber][currentResource][keyList[i]]
		bkdDom.appendChild(element)
	}
}

//utilities

function dice(possibilities,add){
	return Math.floor((Math.random()*possibilities) + add)
}

function getOne(array){
	array = array.split('.')
	// console.log(array) why am i getting multiple calls?
	if(array.length>1){
		tgt = dice(grdwds[array[0]][array[1]].length,0)
		return grdwds[array[0]][array[1]][tgt]
	}else{
		tgt = dice(grdwds[array[0]].length,0)
		return grdwds[array[0]][tgt]
	}
}
