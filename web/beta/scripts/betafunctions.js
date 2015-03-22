function updatePillars(plr){
	var index = plr.replace('plr','')
	spd = Math.abs((seseme.getObjectByName(plr).position.y - tgtHts[index].y)*100) + 400
	plrTween = new TWEEN.Tween(plrHts[index])
	plrTween.to(tgtHts[index],spd)
	plrTween.easing(TWEEN.Easing.Cubic.InOut)
	plrTween.onUpdate(function(){
		seseme.getObjectByName(plr).position.y = plrHts[index].y
	})
	plrTween.start()
}

function initProjections(tgt,atr){
	var projections = new THREE.Group()
    projections.name = "projections"
    for(var i = 0; i<atr.xyz.length; i++){
    	tgt['p'+i] = new THREE.Mesh(new THREE.PlaneGeometry(atr.xyz[i].dimX,atr.xyz[i].dimY), 
    		new THREE.MeshBasicMaterial({transparent: true, opacity: 0, 
    			map: THREE.ImageUtils.loadTexture('assets/test/test.png')}))
    	tgt['p'+i].rotation.y = atr.origin.ry * (Math.PI/180)
    	tgt['p'+i].expand = {x: atr.xyz[i].x, y: atr.xyz[i].y, z: atr.xyz[i].z}
    	tgt['p'+i].origin = {x: atr.origin.x, y: atr.origin.y, z: atr.origin.z}
    	tgt['p'+i].position.set(atr.origin.x, atr.origin.y, atr.origin.z)
    	tgt['p'+i].scale.set(0.5,0.5,0.5)
    	tgt['p'+i].name = tgt.name + '_' + atr.modes[i]
    	projections.add(tgt['p'+i])
    }
    projections.adjust = {x: atr.adjust.x, z: atr.adjust.z}
    tgt.add(projections)
  }

function clickedSeseme(){
raycast.setFromCamera(mousePos, camera)
if(mode=='explore'){
	var intersects = raycast.intersectObjects([].slice.call(seseme.children))
	clickedObj = intersects[0].object.name
	if(clickedObj!='pedestal'&&clickedObj!='ground'&& clickedObj!='orb'){
		clickRotate()
	}else{
		console.log('clicked a non pillar')
	}
}else if(mode=="pillar"){
	var clickedProj = raycast.intersectObjects(selectedPillar.getObjectByName('projections').children)
	if(clickedProj.length>0){
		console.log('delving from pillar')
		delve(clickedProj[0].object.name)
		return
	}else{ //in pillar mode clicked other pillar
		var intersects = raycast.intersectObjects([].slice.call(seseme.children))
		clickedObj = intersects[0].object.name
		if(clickedObj!='pedestal'&&clickedObj!='ground'&& clickedObj!='orb'){
			clickRotate()
		}else{
			backOut()
		}
	}		
}else if(mode=="detail"){
 	var clickedProj = raycast.intersectObjects(selectedPillar.getObjectByName('projections').children)
	if(clickedProj.length>0){
		console.log('delving from detail')
		delve(clickedProj[0].object.name)
		return
	}else{
		selectProjection(selectedProjection,false)
		selectedProjection = undefined
		mode='pillar'
	}		
}
} //end clicked SESEME

// ------- rotation math -------------
function clickRotate(){
	if(clickedObj!='pedestal'&&clickedObj!='ground'&& clickedObj!='orb'){ //pillars
		rotDistance = rotationIndex.indexOf(clickedObj)
		if(!touchRotating){
			switch(rotDistance){
				case 0:
					if(sRotY!=nearest90){
						autoRotate(0)
					}else{
						if(mode=='explore'){
							delve(rotationIndex[0],"pillar")
						}
					}
					break;
				case 1:
					autoRotate(-90)
					rotDir = -1
					break;
				case 2:
					autoRotate(180*rotDir)
					break;
				case 3:
					autoRotate(90)
					rotDir = 1
					break;
				}
			}
		}
}
function autoRotate(deg){
	current = {rotationY: seseme.rotation.y}
	tgt = {rotationY: (nearest90*(Math.PI/180)) + (deg * (Math.PI/180))}
	// console.log('current ' + current.rotationY*(180/Math.PI) + ' tgt ' + tgt.rotationY*(180/Math.PI))
	spd = Math.abs(tgt.rotationY - current.rotationY)*200 + 350
	rotate = new TWEEN.Tween(current)
	rotate.to(tgt,spd)
	rotate.easing(TWEEN.Easing.Quadratic.Out)
	rotate.onUpdate(function(){
		seseme.rotation.y = current.rotationY
		realRotation()
		rotationOrder(getNearest90())
		if(last90!=anglesIndex[0]){
			browse(rotationIndex[0])
		}
	})
	rotate.start()
	rotate.onStart(function(){
		// zoomHeightCheck()//
		autoRotating = true
	})
	rotate.onComplete(function(){
		autoRotating = false
	})
}
function realRotation(){ 
	sRotY = seseme.rotation.y * (180/Math.PI)
		if(sRotY < 0){
			seseme.rotation.y = (360+sRotY) / (180/Math.PI)
		}
		if(Math.abs(sRotY/360) >= 1){
			numRevs = Math.abs(Math.floor(sRotY/360))
			actRot = sRotY - (numRevs*360)
			if(sRotY < 0){actRot = sRotY+(numRevs*360)}
			seseme.rotation.y = actRot / (180/Math.PI)
		}
	sRotY = seseme.rotation.y * (180/Math.PI)
}
function rotationOrder(distance){
	last90 = anglesIndex[0]
	for(var i = 0; i < distance; i++){
		rotationIndex.push(rotationIndex.shift())
		anglesIndex.push(anglesIndex.shift())
	}
}
function getNearest90(){
	for(var i = 0; i < 5 ;i++){
		if(Math.abs(sRotY-(i*90)) <= 45){
			nearest90 = i*90
			if(i==4){
				// nearest90 = sRotY<=45 ? 0: sRotY>=315 ? 360: 0
				nearest90 = 0 
				//return something else
			}
			return anglesIndex.indexOf(nearest90)
		}
	}
}


function moveCam(tgtPosZoom,addspd){ //translation & zoom of camera
	var currentPosZoom = {x: camera.position.x, y: camera.position.y, zoom: camera.zoom}
	var camSpeed = (Math.abs(camera.zoom - tgtPosZoom.zoom)) * 600 + 300
	if(addspd!=undefined){camSpeed+=addspd}
	var camTween = new TWEEN.Tween(currentPosZoom)
	camTween.to(tgtPosZoom, camSpeed)
	camTween.onUpdate(function(){
		camera.position.x = currentPosZoom.x
		camera.position.y = currentPosZoom.y
		camera.zoom = currentPosZoom.zoom
		camera.updateProjectionMatrix()
	})
	camTween.easing(TWEEN.Easing.Cubic.InOut)
	camTween.start()
}
function browse(obj){ //rotation driven info changes (uiShift equivalent)
	//if explore mode, simple changes (title)
	if(mode=="explore"){
		// index = obj.replace('plr','')
		// var text = document.getElementById('infoBottom')
		// text.textContent = data[dataset].pts[index].name
	}
	//if zoom mode, collapse lastobj's projections/info, deploy new ones
	if(mode=="pillar"){
		collapse(selectedPillar)
		obj = seseme.getObjectByName(obj)
		deploy(obj)
		selectedPillar = obj
		moveCam({zoom: 2,y: 20.75+(obj.position.y*0.65)},500)
	}
	if(mode=='detail'){
		selectedProjection = ''
		collapse(selectedPillar)
		obj = seseme.getObjectByName(obj)
		deploy(obj)
		selectedPillar = obj
		moveCam({zoom: 2,y: 20.75+(obj.position.y*0.65)},500)
	}
}
function delve(obj){ //view depth on selected object
	if(mode == "explore"){
		obj = seseme.getObjectByName(obj)
		selectedPillar = obj
		moveCam({zoom: 2, y: 20.75+(obj.position.y*0.65)})
		deploy(obj)
	}else if(mode == "pillar"){
		console.log(obj)
		obj = selectedPillar.getObjectByName(obj)
		selectProjection(obj, true)
	}else if(mode == "detail"){
		if(selectedProjection!=undefined){
			selectProjection(selectedProjection,false)
		}
		obj = selectedPillar.getObjectByName(obj)
		selectProjection(obj,true)
	}
}

function backOut(){
	if(mode=="pillar"){
		collapse(selectedPillar)
		selectedPillar = undefined
		selectedProjection = undefined
		mode = 'explore'
		moveCam(defaultPosZoom)
	}
}

function deploy(obj){ //deploys projections AND symbolgeo
	// loader.load("assets/" + obj.symbol + ".js", function(geometry){
	// 	symbolgeo = new THREE.Mesh(geometry, obj.symbol.material)
	// 	obj.add(symbolgeo)
	// })

	items = [].slice.call(obj.getObjectByName('projections').children)
	items.forEach(function(ele){
		var current = {x:ele.position.x, y:ele.position.y, z:ele.position.z, 
			opacity:ele.material.opacity, sx:ele.scale.x, sy:ele.scale.y, sz:ele.scale.z}
		var expand = new TWEEN.Tween(current)
		expand.to({x:ele.expand.x,y:ele.expand.y,z:ele.expand.z,opacity:0.85,
			sx:1,sy:1,sz:1},650)
		expand.onUpdate(function(){
			ele.position.x = current.x
			ele.position.y = current.y
			ele.position.z = current.z
			ele.material.opacity = current.opacity
			ele.scale.set(current.sx,current.sy,current.sz)
		})
		expand.easing(TWEEN.Easing.Quintic.Out)
		expand.start()
		expand.onComplete(function(){
		})
	})
	console.log('pillar mode')
	mode = 'pillar'
	
}

function collapse(obj){ //collapses projections
	items = [].slice.call(obj.getObjectByName('projections').children)
	items.forEach(function(ele,i){
		//force finish/stop tween on ele!!!!
		var current = {x:ele.position.x, y:ele.position.y, z:ele.position.z, 
			opacity:ele.material.opacity, sx:ele.scale.x, sy:ele.scale.y, sz:ele.scale.z}
		var fold = new TWEEN.Tween(current)
		fold.to({x:ele.origin.x,y:ele.origin.y,z:ele.origin.z,opacity:0,
			sx:0.3,sy:0.3,sz:0.3},650)
		fold.onUpdate(function(){
			ele.position.x = current.x
			ele.position.y = current.y
			ele.position.z = current.z
			ele.material.opacity = current.opacity
			ele.scale.set(current.sx,current.sy,current.sz)
		})
		fold.easing(TWEEN.Easing.Quintic.Out)
		fold.start()
	})
	
}

function selectProjection(obj, onoff){
	var current = {x:obj.position.x, z:obj.position.z,s: obj.scale.x, opacity: obj.material.opacity}
	var select = new TWEEN.Tween(current)
	if(onoff){
		mode = 'detail'
		selectedProjection = obj
		var adj = obj.parent.adjust
		select.to({x:obj.expand.x+adj.x, z:obj.expand.z+adj.z,s: 1.5, opacity: 1},450)
		select.onComplete(function(){
			console.log('detail mode @ ' +obj.name)
		})
	}else{
		select.to({x:obj.expand.x, z:obj.expand.z, s: 1, opacity: 0.85},450)
	}
	select.onUpdate(function(){
		obj.scale.set(current.s,current.s,current.s)
		obj.material.opacity = current.opacity
		obj.position.x = current.x
		obj.position.z = current.z
	})
	select.easing(TWEEN.Easing.Quintic.Out)
	select.start()
	
	
}

function textMaker(text,fontfamily,position,scale,length,bg,color){

	//also: name, color, bg(combine with transparent?), 

	var canvas1 = document.createElement('canvas')
	var context1 = canvas1.getContext('2d')
	var lengthDiff = text.length-6
	
	canvas1.width = length
	// canvas1.style.width = length
	canvas1.height = 70
	context1.font = '32pt ' + fontfamily 
	context1.fillStyle = color
	context1.fillText(text,10,48)
	var texture = new THREE.Texture(canvas1)
	texture.needsUpdate = true
	var material = new THREE.MeshBasicMaterial({map: texture})
	if(bg==''){
		material.transparent=true
	}
	var mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas1.width, canvas1.height), material)
	mesh.scale.set(scale,scale,scale)
	mesh.position.set(position.x,position.y,position.z)
	seseme.add(mesh)

}