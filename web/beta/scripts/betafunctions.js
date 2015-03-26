//server & data responses / connections
function getValues(){
	data[dataset].pts.forEach(function(ele,ite){
		allValues[ite] = ele.value
	})
}
function getVocab(mod, desc){
	var phraseType = dice(6,1)
	if(phraseType < 4){
		var modifier = vocab.modifiers[mod][dice(vocab.modifiers[mod].length,0)]
		var descriptor = vocab.descriptors[desc][dice(vocab.descriptors[desc].length,0)]
		return modifier + " " + descriptor
	}else if(phraseType === 4){
		var specific = vocab.specifics[desc][mod][dice(vocab.specifics[desc][mod].length,0)]
		return specific
	}else if(phraseType === 5){
		return "negatory " + mod + " " + desc
	}else if(phraseType === 6){
		return desc + " noun"
	}
	// var options = vocab.
}	
function assess(){
	allValues.forEach(function(ele,ite){
		criteria[dataset].forEach(function(el,it){
			if(ele>=el.min&&ele<=el.max){
				grades[ite].what = el.name
				grades[ite].color = el.color

				var range = el.max-el.min, mid = el.max-(range/2), rel
				if(Math.abs(ele-mid)<range/3){
					rel = 'mid'
				}else{
					if(el.name == 'good' || el.name == 'ok'){
						if((ele-mid)>0){
							rel = "less"
						}else if((ele-mid)<0){
							rel = "more"
						}	
					}else if(el.name == 'bad' || el.name == "awful"){
						 if((ele-mid)>0){
							rel = "more"
						}else if((ele-mid)<0){
							rel = "less"
						}	
					}
				}
				grades[ite].rel = rel
				
				
				grades[ite].icon = new THREE.ImageUtils.loadTexture('assets/'+el.name+'.png')
				grades[ite].words=getVocab(rel,el.name) 
			}
		})
	})
}
function updatePillars(plr){
	var index = plr.name.replace('plr','')
	spd = Math.abs((plr.position.y - tgtHts[index].y)*100) + 400
	plrTween = new TWEEN.Tween(plrHts[index])
	plrTween.to(tgtHts[index],spd)
	plrTween.easing(TWEEN.Easing.Cubic.InOut)
	plrTween.onUpdate(function(){
		plr.position.y = plrHts[index].y
	})
	plrTween.start()
}

// labeling and projection initialization (styling happens here)


function initProjections(tgt,atr){ 
	var projections = new THREE.Group()
	var index = tgt.name.replace('plr','')
    projections.name = "projections"
    for(var i = 0; i<atr.xyz.length; i++){
    	var mtl = new THREE.MeshBasicMaterial({transparent:true,opacity:0})
    	mtl.needsUpdate = true
    	tgt['p'+i] = new THREE.Mesh(new THREE.PlaneBufferGeometry(atr.xyz[i].dimX,atr.xyz[i].dimY), 
    		mtl)
    	tgt['p'+i].rotation.y = rads(atr.origin.ry)
    	tgt['p'+i].expand = {x: atr.xyz[i].x, y: atr.xyz[i].y, z: atr.xyz[i].z}
    	tgt['p'+i].origin = {x: atr.origin.x, y: atr.origin.y, z: atr.origin.z}
    	tgt['p'+i].position.set(atr.origin.x, atr.origin.y, atr.origin.z)
    	tgt['p'+i].scale.set(0.5,0.5,0.5)
    	tgt['p'+i].name = tgt.name + '_' + atr.modes[i]
    	projections.add(tgt['p'+i])
    }
    projections.adjust = {x: atr.adjust.x, y: atr.adjust.y, z: atr.adjust.z}
    tgt.add(projections)
}

function populateProjections(){ //pass appropriate imagery & numbers to plr projections
	for(var i = 0; i<4; i++){
		var plr = seseme.getObjectByName('plr'+i)
		var projs = plr.getObjectByName('projections')
		var gradeIcon = projs.getObjectByName('plr'+i+'_grade')
		var statIcon = projs.getObjectByName('plr'+i+'_stats')
		gradeIcon.material.map = grades[i].icon

		gradeIcon.more = [] //2 canvases for text

		var statCvs = document.createElement('canvas'), statCtx = statCvs.getContext('2d'),
		statTex = new THREE.Texture(statCvs), typeSize = "144pt"
		statTex.needsUpdate = true
		statCvs.height = 300
		statCtx.fillStyle = grades[i].color
		statCtx.fillRect(0,0,300,300)
		statCtx.fillStyle = 'black'
		if(allValues[i]>99){
			typeSize="120pt"
		}
		statCtx.font = 'normal 400 '+typeSize+' Source Serif Pro'
		statCtx.textAlign = 'center'
		statCtx.fillText(allValues[i],150,200)
		statIcon.material.map = statTex

		for(var it = 0; it<data[dataset].unit.length; it++){
			var stMoreCvs = document.createElement('canvas'), stMoreCtx = stMoreCvs.getContext('2d'),  
			stMoreTex = new THREE.Texture(stMoreCvs), mesh
			stMoreTex.needsUpdate = true
			stMoreCvs.height = 85
			stMoreCvs.width = data[dataset].unit[it].length * 29.5
			stMoreCtx.fillStyle = grades[i].color
			stMoreCtx.fillRect(0,0,stMoreCvs.width,stMoreCvs.height)
			stMoreCtx.fillStyle = 'black'
			stMoreCtx.font = 'normal 500 36pt Fira Sans'
			stMoreCtx.fillText(data[dataset].unit[it],20,60)
			mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(stMoreCvs.width/100,stMoreCvs.height/100),
				new THREE.MeshBasicMaterial({map: stMoreTex, transparent: true,opacity:0}))
			mesh.position.set(0,0.5-it*1.1,-0.25)
			mesh.defpos = {x:0,y:0.5-it*1.1,z:-0.25}
			mesh.expand = {x:1.55+stMoreCvs.width/200,y:0.5-it*1.1,z:-0.25}
			mesh.name = "sub"+it
			statIcon.add(mesh)
		}
	}	
}

function makePrev(text,type,position,scale,bg,color){
	var cvs = document.createElement('canvas'), ctx = cvs.getContext('2d')
	var tex = new THREE.Texture(cvs)
	var mtl= new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0}), subY
	tex.needsUpdate = true
	
	if(type=='A'){
		cvs.height = text.length>8 ? 110: 60
		cvs.width = text.length<8 ? text.length * 26.5: 208
		if(bg !==''){
			ctx.fillStyle = bg	
			ctx.fillRect(0,0,300,300)
		}
		ctx.font = 'normal 300 32pt Source Serif Pro' 
		ctx.fillStyle = color
		ctx.textAlign = 'center' 
		if(text.length>8){
			mtl.doubleLine = true
			text = text.split(" ")
			text.forEach(function(e,i){
				// e=e.split("").join(String.fromCharCode(8202))
				ctx.fillText(e,cvs.width/2,42+(i*52))
				subY=1.55
			}) 
		}else{
			mtl.doubleLine = false
			// text = text.split("").join(String.fromCharCode(8202))
			ctx.fillText(text,cvs.width/2,42)
			subY=0
		}
	}
	if(type=='B'){

		cvs.width=340
		if(bg !==''){
			ctx.fillStyle = bg	
			ctx.fillRect(0,0,340,65)
		}
		ctx.font = 'normal 500 32pt Fira Sans' 
		ctx.fillStyle = color
		ctx.textAlign = 'center' 
		ctx.fillText(text,cvs.width/2,45)
		subY=0
	}
	console.log(cvs.height)
	var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(cvs.width, cvs.height), mtl)
	mesh.scale.set(scale,scale,scale)
	mesh.position.set(position.x,position.y-subY,position.z)
	mesh.rotation.set(position.rx,position.ry,position.rz)
	return mesh
}
function createPreviews(){ //inits previews for each pillar in exp/browse
	var dataTitles = []
	data[dataset].pts.forEach(function(e,i){
		dataTitles.push(e.name)
	})
	var xlats = [{x:-8.4, z:5.8},{x:5.5, z:6},{x:5.35, z:-8},{x:-8.75, z:-8.25}]
	for(var i=0;i<4;i++){
		var plr_prev = new THREE.Group()
		var title = makePrev(dataTitles[i],'A',{x:0, y:-3,z:0,rx:camera.rotation.x,ry:0,rz:rads(0)},0.055,'','white')
		plr_prev.add(title)
		
		var addY = 0
		if(title.material.doubleLine){
			addY = 25
		}
		var caption = makePrev('ENERGY USE @','B',{x:0, y:25+addY,z:0,rx:0,ry:0,rz:rads(0)},0.55,'','white')
		title.add(caption)
		
		
		var whtBack = new THREE.Mesh(new THREE.PlaneBufferGeometry(title.geometry.parameters.width,title.geometry.parameters.height),
			new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}))
		var blkBack = new THREE.Mesh(new THREE.PlaneBufferGeometry(caption.geometry.parameters.width,65),
			new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0}))
		var dir = i===0 ? 1: i===1 ? 1: i===2 ? -1: -1
		blkBack.position.set(dir*-xlats[i].x/5,42,dir*-xlats[i].z/5)
		whtBack.position.set(dir*-xlats[i].x/5,0,dir*-xlats[i].z/5)

		whtBack.scale.set(0.1,1,0.1)
		blkBack.scale.set(0.1,1,0.1)
		title.add(whtBack)
		caption.add(blkBack)

		whtBack.name = 'whtBack'
		blkBack.name = 'blkBack'
		title.name = 'title'
		caption.name = 'caption'
		plr_prev.name = 'plr'+i+"_preview" 
		pedestal.add(plr_prev)
		plr_prev.rotation.y = rads(-45)+(i*rads(90))
		plr_prev.position.set(xlats[i].x,1,xlats[i].z)
	}
}

//root interactions ------------------------------
function clickedSeseme(){
raycast.setFromCamera(mousePos, camera)
if(mode==='explore'){
	var intersects = raycast.intersectObjects([].slice.call(seseme.children))
	clickedObj = intersects[0].object.name
	if(clickedObj!='pedestal'&&clickedObj!='ground'&& clickedObj!='orb'){
		clickRotate()
	}else{
		console.log('clicked a non pillar')
	}
}else if(mode==="pillar"){
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
}else if(mode==="detail"){
 	var clickedProj = raycast.intersectObjects(selectedPillar.getObjectByName('projections').children)
	if(clickedProj.length>0){
		console.log('delving from detail')
		if(clickedProj[0].object.name===selectedProjection.name){
			console.log('clicked same one again?')
			selectProjection(selectedProjection,false)
			selectedProjection = 0
			mode='pillar'
		}else{
			delve(clickedProj[0].object.name)
			return
		}
		
	}else{
		selectProjection(selectedProjection,false)
		selectedProjection = 0
		mode='pillar'
	}		
}
} //clickedSESEME

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
						if(mode==='explore'){
							browse(rotationIndex[0])
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
	tgt = {rotationY: (rads(nearest90)) + (rads(deg))}
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
	sRotY = degs(seseme.rotation.y)
		if(sRotY < 0){
			seseme.rotation.y = (360+sRotY) / (180/Math.PI)
		}
		if(Math.abs(sRotY/360) >= 1){
			numRevs = Math.abs(Math.floor(sRotY/360))
			actRot = sRotY - (numRevs*360)
			if(sRotY < 0){actRot = sRotY+(numRevs*360)}
			seseme.rotation.y = actRot / (180/Math.PI)
		}
	sRotY = degs(seseme.rotation.y)
	distCtr = Math.abs(nearest90-sRotY)
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
			if(i===4){
				// nearest90 = sRotY<=45 ? 0: sRotY>=315 ? 360: 0
				nearest90 = 0 
				//return something else
			}
			return anglesIndex.indexOf(nearest90)
		}
	}	
}

//global UI state changes
function browse(obj){ //rotation driven info changes 
	if(obj!==lookingAt){
		if(lookingAt!==undefined){
			var fadeOut = pedestal.getObjectByName(lookingAt+'_preview')
			var fadetitle = fadeOut.getObjectByName('title')
			var fadecaption = fadetitle.getObjectByName('caption')
			if(mode==="explore"){
				move({y:1},fadeOut,500)
				growShrink({s:0.75},fadeOut,500)
			}
			fade(false,fadetitle,500,0)
			fade(false,fadetitle.getObjectByName('whtBack'),500,0)
			stretch({x:0.1,y:1,z:0.1},fadetitle.getObjectByName('whtBack'),500,0)
			fade(false,fadecaption,500,0)
			fade(false,fadecaption.getObjectByName('blkBack'),500,0)
			stretch({x:0.1,y:1,z:0.1},fadecaption.getObjectByName('blkBack'),500,0)
		}
	}
	var preview = pedestal.getObjectByName(obj+'_preview')
	var prevtitle = preview.getObjectByName('title')
	var prevcaption = prevtitle.getObjectByName('caption')
	if(mode==='explore'){
		move({y:-1},preview,500)
		growShrink({s:1},preview,500)
	}
	fade(true,prevtitle,500,0)
	fade(true,prevcaption,500,0)

	lookingAt = obj
	if(mode==="explore"){

	}
	else if(mode==="pillar"||mode==='detail'){
		if(selectedProjection!=0){
		selectProjection(selectedProjection,false)
		}
		collapse(selectedPillar)
		selectedProjection = 0
		obj = seseme.getObjectByName(obj)
		deploy(obj)
		selectedPillar = obj
		moveCam({zoom: 2, y: 19+(obj.position.y*0.8)},500)
		
		fade(true,prevtitle.getObjectByName('whtBack'),500,0)
		stretch({x:1,y:1,z:1},prevtitle.getObjectByName('whtBack'),500,0)
		fade(true,prevcaption.getObjectByName('blkBack'),500,200)
		stretch({x:1,y:1,z:1},prevcaption.getObjectByName('blkBack'),500,200)
	}
}
function delve(obj){ //view depth on selected object
	if(mode==="explore"){
		obj = seseme.getObjectByName(obj)
		selectedPillar = obj
		previewShift(true,obj.position.y)
		moveCam({zoom: 2, y: 19+(obj.position.y*0.8)})
		deploy(obj)
	}else if(mode==="pillar"){
		console.log(obj)
		obj = selectedPillar.getObjectByName(obj)
		selectProjection(obj, true)
	}else if(mode==="detail"){
		if(selectedProjection!=0){
			selectProjection(selectedProjection,false)
		}
		obj = selectedPillar.getObjectByName(obj)
		selectProjection(obj,true)
	}
}
function backOut(){
	if(mode=="pillar"){
		collapse(selectedPillar)
		if(selectedProjection!=0){
		selectProjection(selectedProjection,false)
		}
		previewShift(false)
		selectedPillar = undefined
		selectedProjection = 0
		mode = 'explore'
		moveCam(defaultPosZoom)
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

//projection animation and removal ----------
function deploy(obj){ //deploys projections AND symbolgeo
	// loader.load("assets/" + obj.symbol + ".js", function(geometry){
	// 	symbolgeo = new THREE.Mesh(geometry, obj.symbol.material)
	// 	obj.add(symbolgeo)
	// })

	items = [].slice.call(obj.getObjectByName('projections').children)
	items.forEach(function(ele,i){
		var current = {x:ele.position.x, y:ele.position.y, z:ele.position.z, 
			opacity:ele.material.opacity, sx:ele.scale.x, sy:ele.scale.y, sz:ele.scale.z}
		var expand = new TWEEN.Tween(current)
		expand.to({x:ele.expand.x,y:ele.expand.y,z:ele.expand.z,opacity:0.85,
			sx:1,sy:1,sz:1},700)
		expand.onUpdate(function(){
			ele.position.x = current.x
			ele.position.y = current.y
			ele.position.z = current.z
			ele.material.opacity = current.opacity
			ele.scale.set(current.sx,current.sy,current.sz)
		})
		expand.easing(TWEEN.Easing.Quintic.Out)
		expand.delay(50*i)
		expand.start()
		expand.onComplete(function(){
		})
	})
	console.log('pillar mode')
	mode = 'pillar'	
}
function collapse(obj){ //collapses projections
	//delete symbolgeo after it goes down
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
	var current = {x:obj.position.x,y:obj.position.y,z:obj.position.z,s: obj.scale.x, opacity: obj.material.opacity}
	var select = new TWEEN.Tween(current)
	var bottom = document.getElementById('infoBottom')
	var subs = [].slice.call(obj.children)

	if(onoff){
		mode = 'detail'
		selectedProjection = obj
		var adj = obj.parent.adjust
		select.to({x:obj.expand.x+adj.x,y:obj.expand.y+adj.y,z:obj.expand.z+adj.z,s: 1.3, opacity: 1},450)
		// Velocity(bottom,{height:'6rem'})
		if(subs.length>0){
			subs.forEach(function(ele,i){
				fade(true,ele,600,0)
				move(ele.expand,ele,600,30*i)
			})
		}

	}else{
		select.to({x:obj.expand.x,y:obj.expand.y, z:obj.expand.z, s: 1, opacity: 0.85},450)
		if(subs.length>0){
			subs.forEach(function(ele,i){
				fade(false,ele,400,0)
				move(ele.defpos,ele,600)
			})
		}
	}
	select.onUpdate(function(){
		obj.scale.set(current.s,current.s,current.s)
		obj.material.opacity = current.opacity
		obj.position.x = current.x
		obj.position.y = current.y
		obj.position.z = current.z
	})
	select.easing(TWEEN.Easing.Quintic.Out)
	select.start()
}
function previewShift(up){ //previews translate depending on explore/pillar modes
	var index = selectedPillar.name.replace('plr','')
	if(up){
		// console.log(index)
		for(var i=0;i<4;i++){
			var prevs = pedestal.getObjectByName('plr'+i+'_preview')
			var title = prevs.getObjectByName('title')
			var plrht = seseme.getObjectByName('plr'+i).position.y
			move({y:1+plrht},prevs,800)
			growShrink({s:0.55},prevs,800)
			colorize({r:0,g:0,b:0},title,800)
			if(i==index){
				var wht = title.getObjectByName('whtBack')
				var blk = prevs.getObjectByName('caption').getObjectByName('blkBack')
				fade(true,wht,800,0)
				fade(true,blk,800,0)
				stretch({x:1,y:1,z:1},wht,800,0)
				stretch({x:1,y:1,z:1},blk,800,0)
			}
			
		}
	}else{ //shift previews back
		for(var i=0;i<4;i++){
			var prevs = pedestal.getObjectByName('plr'+i+'_preview')
			var title = prevs.getObjectByName('title')
			growShrink({s:1},prevs,800)
			move({y:0},prevs,800)
			colorize({r:255,g:255,b:255},title,800)
			if(i==index){
				var wht = title.getObjectByName('whtBack')
				var blk = prevs.getObjectByName('caption').getObjectByName('blkBack')
				fade(false,wht,800,0)
				fade(false,blk,800,0)
				stretch({x:0.1,y:1,z:0.1},wht,800,0)
				stretch({x:0.1,y:1,z:0.1},blk,800,0)
			}
		}	
	}
}

// generic tools for a variety of situations
function degs(rads){ //get degrees for my comprehension
	return rads*(180/Math.PI)
}
function rads(degs){ //get radians for THREE instructions
	return degs*(Math.PI/180)
}
function fade(inOut,tgt,spd,delay){
	var current = {opacity: tgt.material.opacity}
	var opTween = new TWEEN.Tween(current)
	if(inOut){opTween.to({opacity: 1},spd+delay)}else{opTween.to({opacity: 0},spd+delay)}
	opTween.onUpdate(function(){tgt.material.opacity = current.opacity})
	opTween.easing(TWEEN.Easing.Cubic.Out)
	opTween.start()
}
function colorize(col,tgt,spd){
	var current = {r: tgt.material.color.r, g:tgt.material.color.g,b:tgt.material.color.b}
	var colorTween = new TWEEN.Tween(current)
	colorTween.to({r:col.r/255,g:col.g/255,b:col.b/255},spd)
	colorTween.onUpdate(function(){
		tgt.material.color.r = current.r
		tgt.material.color.g = current.g
		tgt.material.color.b = current.b
	})
	colorTween.easing(TWEEN.Easing.Cubic.Out)
	colorTween.start()
}
function move(pos,tgt,spd,delay){
	var current = {x:tgt.position.x, y:tgt.position.y, z:tgt.position.z}
	var moveTween = new TWEEN.Tween(current)
	moveTween.to(pos,spd)
	moveTween.onUpdate(function(){
		tgt.position.x = current.x
		tgt.position.y = current.y
		tgt.position.z = current.z
	})
	moveTween.easing(TWEEN.Easing.Cubic.Out)
	if(delay!=undefined){moveTween.delay(delay)}
	moveTween.start()
}
function rotate(rot,tgt,spd){
	var current = {x:tgt.rotation.x,y:tgt.rotation.y,z:tgt.rotation.z}
	var rotTween = new TWEEN.Tween(current)
	rotTween.to(rot,spd)
	rotTween.onUpdate(function(){
		tgt.rotation.x = current.x
		tgt.rotation.y = current.y
		tgt.rotation.z = current.z
	})
	rotTween.easing(TWEEN.Easing.Cubic.Out)
}
function growShrink(scale,tgt,spd){
	var current = {s: tgt.scale.x}
	var scaleTween = new TWEEN.Tween(current)
	scaleTween.to(scale,spd)
	scaleTween.onUpdate(function(){
		tgt.scale.set(current.s,current.s,current.s)
	})
	scaleTween.easing(TWEEN.Easing.Cubic.Out)
	scaleTween.start()
}
function stretch(scale,tgt,spd,delay){
	var current = {x: tgt.scale.x,y:tgt.scale.y,z:tgt.scale.z}
	var stretchTween = new TWEEN.Tween(current)
	stretchTween.to(scale,spd+delay)
	stretchTween.onUpdate(function(){
		tgt.scale.set(current.x,current.y,current.z)
	})
	stretchTween.easing(TWEEN.Easing.Cubic.InOut)
	stretchTween.start()
}
function dice(possibilities,add){
	return Math.floor((Math.random()*possibilities) + add)
}