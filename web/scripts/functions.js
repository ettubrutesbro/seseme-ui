// data driven -------------

function dataToHts(){ // translates data vals 
	data[currentDataSet].forEach(function(ele,i,arr){
		var total = 0
		var keyList = Object.keys(ele[currentResource])
		for(var i = 0; i < keyList.length; i++){
			total += (ele[currentResource][keyList[i]])
		}
		allValues.push(total)
	})
	console.log(allValues)
	var highestValue = allValues.indexOf(Math.max.apply( Math, allValues ))
	allValues.forEach(function(ele,i,arr){
		tgtHts[i].y = (ele / arr[highestValue]) * 12
	})
}
function updatePillars(){
	[ seseme.getObjectByName('plr1'),
	seseme.getObjectByName('plr2'),
	seseme.getObjectByName('plr3'),
	seseme.getObjectByName('plr4')	
	].forEach(function(ele,i){
		spd = Math.abs((ele.position.y - tgtHts[i].y) * 100) + 400
		plrTween = new TWEEN.Tween(plrHts[i])
		plrTween.to(tgtHts[i],spd)
		plrTween.easing(TWEEN.Easing.Cubic.InOut)
		plrTween.onUpdate(function(){
			ele.position.y = plrHts[i].y
		})
		plrTween.start()

	})
}
function dataToUI(){ //data to textual / UI elems
	console.log(data[currentResource])
}
function uiShift(){ //click or touch rotate: call 
	var name = document.querySelector('#name')
	var viewNum = document.querySelector('#dataNum')
	var abbr = document.querySelector('#dataUnit')
	if(selectedObj == 'pedestal' ){
		// name.textContent = currentResource + " @ " + currentDataSet 
	}else{
		var index = ['plr1','plr2','plr3','plr4'].indexOf(selectedObj)
		name.textContent = data[currentDataSet][index].name
		viewNum.textContent = allValues[index]
		abbr.textContent = currentAbbr
		console.log(allValues[index])
		if(breakdownOn){
			// console.log(index)
			keyList = Object.keys(data[currentDataSet][index][currentResource])
			breakdownShift((pillars[0].replace('plr','') - 1))
		}
	}
	//how can i specify to only do it when it's different from before? 

function colorAssess(){

}


}
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
				selectedObj = clicked
			}else{
				highlight(0)
				selectedObj = clicked
			}
		}
	}else{ //clicked the ground or the orb
		highlight()
		selectedObj = ''
		clickedNav(mode-1)
		mode = 0
		userActions.push('clicked ground, mode:' + mode)
		// clearHighlight()
	}
}
function clickedNav(index){
	userActions.push('clicked ' + navs[index].id)	
	sections = [].slice.call(document.getElementById('sectionContainer').children)
	console.log(sections[index])
	if(mode==0 || index+1 != mode){ 
		if(mode!=0){
			//close open nav
			Velocity(sections[mode-1],{height: "0"})
			navFuncs[index](false)
		}
		sectionHeights = ["3.7rem","9rem","",""]
		console.log('open nav')
		navFuncs[index](true)
		mode=index+1
		sections[index].style["display"] = "block"
		Velocity(sections[index],{height: sectionHeights[index], opacity: 1})
	}else{
		Velocity(sections[index],{height: 0, opacity: 0.25},{complete: function(){
			sections[index].style["display"] = "none"
		}})
		navFuncs[index](false)
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
	})
	rotate.onComplete(function(){
		realRotation()
		findNearest90()
		highlightCheck()
	})
}
// ------- math processes to make things make sense / work -------------
function findNearest90(){
	for(var i = 0; i < 5 ;i++){
		if(Math.abs(sRotY-(i*90)) <= 45){
			nearest90 = i*90
			if(i==4){nearest90 = 0}
			pillarOrder(all90s.indexOf(nearest90))
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
function pillarOrder(distance){
	//reorders the pillar array by taking everything b4 new selection and putting it at the end
	//'distance' being how deep in the array you clicked
	for(var i = 0; i < distance; i++){
		pillars.push(pillars.shift())
		all90s.push(all90s.shift())
	}
}
function highlight(outlineNumber){
	outlines.forEach(function(ele){
		ele.opacity = 0
	})
	if(outlineNumber!=undefined){
		outlines[outlineNumber].opacity = 1
	}
}
function highlightCheck(){
	if(selectedObj == "pedestal"){

	}else{
		highlightRanges =[{min: 0, max: 45,p:1},{min:315,max: 360,p:1},{min:228,max:314,p:2},{min:137,max:227,p:3},{min:46,max:136,p:4}]
		highlightRanges.forEach(function(ele,i){
			if(ele.max >= sRotY && ele.min <= sRotY){
				highlight(ele.p)
				selectedObj = "plr" + ele.p
			}
		})
	}
}

function zoomHeightCheck(){
	if(mode==1 && !breakdownOn){
		var index = selectedObj.replace('plr','')
		index -= 1
		shift({x: -19.75, y: 17+Math.round((tgtHts[index].y)/1.6), zoom: 2},400)
	}
}
// ----------navigation mode---------------
viewFunc = function(open){
	var name = document.querySelector('#name')
	var icon = document.querySelector('#titleGrade')
	var hide = document.querySelector('#titleRule')
	
	// Velocity(name, "finish")
	Velocity(icon, "finish")
	Velocity(hide, "finish")
	if(open){
			if(selectedObj == 'pedestal' || selectedObj == ''){
			selectedObj = ''
			sRotY = seseme.rotation.y * (180/Math.PI)
			highlightCheck()
		}
		//3d shift 
		var index = selectedObj.replace('plr','')
		index -= 1
		shift({x: -19.75, y: 17+Math.round((tgtHts[index].y)/1.6), zoom: 2})
		//dom manipulation
		Velocity(name, {scale: 1.25, backgroundColorAlpha: 1})
		Velocity(icon, {opacity: 0})
		Velocity(hide, {opacity: 0})
		hammerIcon = new Hammer(icon)
		hammerIcon.on('tap',breakdown)
	}else{
		shift(defaultPosZoom)
		if(breakdownOn){
			breakdown()
		}
		Velocity(name, {scale: 1.0, backgroundColorAlpha: 0})
		Velocity(icon, {scale: 1.0})
		Velocity(hide, 'transition.slideLeftIn')
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
	var semantic = document.querySelector('#semantic'), grade = document.querySelector('#grade'), 
	aggData = document.querySelector('#aggData'), bkdown = document.querySelector('#breakdown'), 
	spelled = document.querySelector('#spelledUnit'), rule = document.querySelector('#viewRule')

	Velocity(semantic, 'finish')
	Velocity(grade, 'finish')
	Velocity(aggData, 'finish')
	Velocity(bkdown, 'finish')
	Velocity(spelled, 'finish')
	Velocity(rule, 'finish')

	if(selectedObj == 'pedestal'){
		selectedObj = ''
		sRotY = seseme.rotation.y * (180/Math.PI)
		highlightCheck()
	}
	 if(!breakdownOn){ //turn on breakdown
	 	shift({x: -19.75, y: 16.5, zoom: 1.3})
	 	breakdown3d()
	 	breakdownDOM()
	 	breakdownOn = true
	 	function breakdownDOM(){
	 		spelled.textContent = currentResource
			Velocity(semantic, {height: "1.75rem"})
			Velocity(grade, {width: 0, opacity: -1},{duration: 500, easing: 'easeInQuad'})
			Velocity(spelled, {width: "70%", opacity: 1},{delay: 850, duration: 700, easing: 'easeOutQuad'})
			Velocity(aggData, {color: '#000', backgroundColorAlpha: 1},{duration: 500})
			Velocity(bkdown, {height: "1.1rem", opacity: 1})
			Velocity(rule, {width: '100%', opacity: 1}, {delay: 200, duration: 500})
	 	}
	 	function breakdown3d(){
	 		index = pillars[0].replace('plr','') - 1,
			keyList = Object.keys(data[currentDataSet][index][currentResource])
			breakdownShift(index)
			pillars.forEach(function(ele,it,arr){
				var total = 0, breakdownHts = [], 
				ht = tgtHts[index].y+1.25, detailStat = [], tMtxs = [[2.7,7.3],[7.3,7.3],[7.3,7.3],[2.7,7.3]]
				
				for(var i = 0; i<keyList.length; i++){ //get the pillar's total
					total += data[currentDataSet][index][currentResource][keyList[i]]
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
			}) //end pillars.forEach
	 	} //end breakdown3d
	 	
	 } else { // if breakdown is already on
	 	console.log(selectedObj)
	 	var index = selectedObj.replace('plr','')
		index -= 1
		if(selectedObj != ''){
			shift({x: -19.75, y: 17+Math.round((tgtHts[index].y)/1.8), zoom: 2})
		}
	 	
	 	remove3d()
	 	revertDOM()
	 	breakdownOn = false
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
			Velocity(semantic, {height: "2.75rem"})
			Velocity(spelled, {width: 0, opacity: 0})
			Velocity(grade, {width: "70%", opacity: 1}, {delay: 200, duration: 700, easing: 'easeOutCubic'})
			Velocity(aggData, {color: '#fff', backgroundColorAlpha: 0}, {delay: 400, duration: 500})
			Velocity(bkdown, {height: 0, opacity: 0.3})
			Velocity(rule, {width: '0%', opacity: 0}, {duration: 600})
	 	}
	 }  
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