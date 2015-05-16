//server & data responses / connections
function getValues(){
	data[dataset].pts.forEach(function(ele,ite){
		allValues[ite] = ele.value
	})
	var highVal = allValues.indexOf(Math.max.apply(Math , allValues))
	allValues.forEach(function(ele,i,arr){
		tgtHts[i].y = (ele/ arr[highVal]) * 12
	})
}
function getVocab(mod, desc){
	var phraseType = dice(6,1)
	if(phraseType < 4){
		console.log('modifier descriptor')
		var modifier = vocab.modifiers[mod][(dice(vocab.modifiers[mod].length,0))]
		var descriptor = vocab.descriptors[desc][(dice(vocab.descriptors[desc].length,0))]
		return [modifier,descriptor]
	}else if(phraseType == 4){
		console.log('specific')
		var which = dice(vocab.specifics[data[dataset].specificsType][desc][mod].length,0)
		var specific = vocab.specifics[data[dataset].specificsType][desc][mod][which]
		return specific.split(' ')
	}else if(phraseType >= 5){
		console.log('descriptive noun')
		var modifier = vocab.descriptors[desc][dice(vocab.descriptors[desc].length,0)]
		var noun = vocab.nouns[data[dataset].nounType][dice(vocab.nouns[data[dataset].nounType].length,0)]
		return [modifier,noun]
	}
}	
function assess(){
	allValues.forEach(function(ele,ite){
		data[dataset].criteria.forEach(function(el,it){
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
				grades[ite].words=getVocab(rel,el.name) 
			}
		})
	})
}
function updatePillars(plr){
	var index = plr.name.replace('plr','')
	spd = Math.abs((plr.position.y - tgtHts[index].y)*100) + 400
	var current = {y: plr.position.y}
	plrTween = new TWEEN.Tween(current)
	plrTween.to(tgtHts[index],spd)
	plrTween.easing(TWEEN.Easing.Cubic.InOut)
	plrTween.onUpdate(function(){
		plr.position.y = current.y
	})
	plrTween.start()
}

function updateHue(r, g, b){

}

// labeling and projection initialization (styling happens here)


function initProjections(tgt,atr){ 
	var projections = new THREE.Group()
	var index = tgt.name.replace('plr','')
    projections.name = "projections"
    for(var i = 0; i<atr.xyz.length; i++){
    	var mtl = new THREE.MeshBasicMaterial({transparent:true,opacity:0})
    	var subs = new THREE.Group()
    	subs.name = 'subs'

    	//DIFFERENT MATERIALS ARE APPLIED FOR PROJECTION TYPES
    	if(atr.modes[i]==='info'){ //materials for info mode: 
			mtl.map = THREE.ImageUtils.loadTexture('assets/info.png')
			for(var it = 0; it<3; it++){
				var factCvs = document.createElement('canvas'), factCtx = factCvs.getContext('2d'),
				factTex = new THREE.Texture(factCvs), factPlane; factTex.needsUpdate = true
				factCvs.width = 29 * data[dataset].pts[index].info[it].length; factCvs.height = 120
				factCtx.fillStyle = "#172B54"; factCtx.fillRect(0,0,factCvs.width, factCvs.height); 
				factCtx.fillStyle = "white"; factCtx.font = "normal 500 36pt FiraSans"; factCtx.textAlign = 'center'
				factCtx.fillText(data[dataset].pts[index].info[it],factCvs.width/2,80)
				factPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(factCvs.width/100, factCvs.height/100),
					new THREE.MeshBasicMaterial({map: factTex, transparent: true, opacity: 0}))
				subs.add(factPlane)
				factPlane.position.set(factCvs.width/100,-2.5-it*1.2,0)
				factPlane.defpos={x: factCvs.width/100, y:-2.5-it*1.2, z:0}
				factPlane.expand={x: -factCvs.width/200+1.25, y:-2.5-it*1.2, z:0}

			}
		}else if(atr.modes[i]=='grade'){
			mtl.map = THREE.ImageUtils.loadTexture('assets/grade_'+grades[index].what+'.png')
			for(var it = 0; it<2; it++){
				var gWordCvs = document.createElement('canvas'), gWordCtx = gWordCvs.getContext('2d'),
				gWordTex = new THREE.Texture(gWordCvs), gradeWord 
				gWordTex.needsUpdate = true; gWordCvs.width = 350; gWordCvs.height = 150
				gWordCtx.fillStyle = 'black'; gWordCtx.fillRect(0,0,gWordCvs.width,gWordCvs.height)
				var fontSize = grades[index].words[it].length > 8? "36pt" : grades[index].words[it].length <= 4? "50pt": "42pt"
				gWordCtx.fillStyle = "white"; gWordCtx.font = 'normal 500 ' +fontSize+ ' FiraSans';
				gWordCtx.textAlign= 'center'; var dir = it===0? -1: 1
				gWordCtx.fillText(grades[index].words[it],175,100)
				gradeWord = new THREE.Mesh(new THREE.PlaneBufferGeometry(gWordCvs.width/100,gWordCvs.height/100),
					new THREE.MeshBasicMaterial({map: gWordTex,transparent: true, opacity: 0}))
				gradeWord.position.set(dir*gWordCvs.width/100-(dir),-1,-0.5)
				gradeWord.defpos = {x:dir*gWordCvs.width/100-(dir),y:-1,z:-0.5}
				gradeWord.expand = {x:dir*gWordCvs.width/100-(0.5*dir),y:0.75,z:0.45}
				gradeWord.name = 'word_'+it
				subs.add(gradeWord)
			}
		}else if(atr.modes[i]==='stats'){ //materials for stats projection: shape + numbers
			var statCvs = document.createElement('canvas'), statCtx = statCvs.getContext('2d'),
			statTex = new THREE.Texture(statCvs), typeSize = "100pt"; statTex.needsUpdate = true;
			statCvs.height = 300; statCtx.fillStyle = grades[index].color; statCtx.beginPath();
			if(grades[index].what == "good"){
				statCtx.moveTo(150,10); statCtx.lineTo(270,80); statCtx.lineTo(270,220); 
				statCtx.lineTo(150,290); statCtx.lineTo(30,220); statCtx.lineTo(30,80)
			}
			else if(grades[index].what == "ok"){
				statCtx.moveTo(150,0); statCtx.lineTo(300,150); statCtx.lineTo(150,300); statCtx.lineTo(0,150)
			}else if(grades[index].what == "bad"){
				statCtx.moveTo(300,225); statCtx.lineTo(280,255); statCtx.lineTo(20,255); statCtx.lineTo(0,225); statCtx.lineTo(135,0); statCtx.lineTo(165,0)
			}else if(grades[index].what == "awful"){
			 	statCtx.moveTo(300,98); statCtx.lineTo(280,70); statCtx.lineTo(20,70); statCtx.lineTo(0,98); statCtx.lineTo(135,300); statCtx.lineTo(165,300)
			}
			statCtx.closePath(); statCtx.fill() 
			statCtx.fillStyle = 'white'; if(allValues[index]>99){typeSize="84pt"}
			statCtx.font = 'normal 400 '+typeSize+' SourceSerifPro'
			statCtx.textAlign = 'center'
			statCtx.fillText(allValues[index],150,200)

			mtl.map = statTex
			
			for(var ite = 0; ite<data[dataset].unit.length; ite++){
				var stMoreCvs = document.createElement('canvas'), stMoreCtx = stMoreCvs.getContext('2d'),  
				stMoreTex = new THREE.Texture(stMoreCvs), mesh; stMoreTex.needsUpdate = true; stMoreCvs.height = 85;
				stMoreCvs.width = data[dataset].unit[ite].length * 28; stMoreCtx.fillStyle = grades[index].color
				stMoreCtx.fillRect(0,0,stMoreCvs.width,stMoreCvs.height); stMoreCtx.fillStyle = 'white'
				stMoreCtx.font = 'normal 500 33pt FiraSans'; stMoreCtx.fillText(data[dataset].unit[ite],20,60);
				mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(stMoreCvs.width/100,stMoreCvs.height/100),
					new THREE.MeshBasicMaterial({map: stMoreTex, transparent: true,opacity:0}))
				mesh.position.set(0,0.5-ite*1.1,-0.25); mesh.defpos = {x:0,y:0.5-ite*1.1,z:-0.25} 
				mesh.expand = {x:1.75+stMoreCvs.width/200,y:0.5-ite*1.1,z:-0.25}; mesh.name = "sub"+ite 
				subs.add(mesh)
			}//end stat preps
		}
    	mtl.needsUpdate = true
    	tgt['p'+i] = new THREE.Mesh(new THREE.PlaneBufferGeometry(atr.xyz[i].dimX,atr.xyz[i].dimY), 
    		mtl)
    	tgt['p'+i].rotation.y = rads(atr.origin.ry)
    	tgt['p'+i].expand = {x: atr.xyz[i].x, y: atr.xyz[i].y, z: atr.xyz[i].z}
    	tgt['p'+i].origin = {x: atr.origin.x, y: atr.origin.y, z: atr.origin.z}
    	tgt['p'+i].position.set(atr.origin.x, atr.origin.y, atr.origin.z)
    	tgt['p'+i].scale.set(0.5,0.5,0.5)
    	tgt['p'+i].adjust = {x: atr.adjusts[i].x, y:atr.adjusts[i].y, z:atr.adjusts[i].z, s:atr.adjusts[i].s}
    	tgt['p'+i].name = tgt.name + '_' + atr.modes[i]
    	tgt['p'+i].add(subs)
    	projections.add(tgt['p'+i])
    }
    tgt.add(projections)
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
		ctx.font = 'normal 400 32pt SourceSerifPro' 
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
		ctx.font = 'normal 500 32pt FiraSans' 
		ctx.fillStyle = color
		ctx.textAlign = 'center' 
		ctx.fillText(text,cvs.width/2,45)
		subY=0
	}
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
		var title = makePrev(dataTitles[i],'A',{x:0, y:-3,z:0,rx:0,ry:0,rz:0},0.055,'','white')
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

		whtBack.scale.set(0.1,1,0.1); blkBack.scale.set(0.1,1,0.1); title.add(whtBack); caption.add(blkBack);

		whtBack.name = 'whtBack'; blkBack.name = 'blkBack'; title.name = 'title'; caption.name = 'caption';
		plr_prev.name = 'plr'+i+"_preview" ; pedestal.add(plr_prev)
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
		if(clickedObj==='pedestal'){
			var previewInd = rotationIndex[0].replace('plr','')
			var clickedPrev = raycast.intersectObjects([].slice.call(pedestal.getObjectByName('plr'+previewInd+'_preview').children))
			console.log(clickedPrev)
			if(clickedPrev.length > 0){
				console.log('clicked preview')
				clickedObj = rotationIndex[0]
				clickRotate()
			}else{
				console.log('explore: clicked pedestal body')
			}
		}
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
	rotater = new TWEEN.Tween(current)
	rotater.to(tgt,spd)
	rotater.easing(TWEEN.Easing.Quadratic.Out)
	rotater.onUpdate(function(){
		seseme.rotation.y = current.rotationY
		realRotation()
		rotationOrder(getNearest90())
		if(last90!=anglesIndex[0]){
			browse(rotationIndex[0])
		}
		flipPrev()
	})
	rotater.start()
	rotater.onStart(function(){
		// zoomHeightCheck()//
		autoRotating = true
	})
	rotater.onComplete(function(){
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
			fade(0,fadetitle,500,0)
			fade(0,fadetitle.getObjectByName('whtBack'),500,0)
			stretch({x:0.1,y:1,z:0.1},fadetitle.getObjectByName('whtBack'),500,0)
			fade(0,fadecaption,500,0)
			fade(0,fadecaption.getObjectByName('blkBack'),500,0)
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
	fade(1,prevtitle,500,0)
	fade(1,prevcaption,500,0)

	lookingAt = obj
	if(mode==="explore"){

	}
	else if(mode==="pillar"||mode==='detail'){
		if(selectedProjection!=0){
		selectProjection(selectedProjection,false)
		}
		collapse(selectedPillar)
		selectedProjection = 0

		moveCam({zoom: 2, y: 19+(tgtHts[obj.replace('plr','')].y*0.8)},200)
		obj = seseme.getObjectByName(obj)
		deploy(obj)
		selectedPillar = obj

		
		fade(1,prevtitle.getObjectByName('whtBack'),500,0)
		stretch({x:1,y:1,z:1},prevtitle.getObjectByName('whtBack'),500,0)
		fade(1,prevcaption.getObjectByName('blkBack'),500,200)
		stretch({x:1,y:1,z:1},prevcaption.getObjectByName('blkBack'),500,200)
	}
}
function delve(obj){ //view depth on selected object
	if(mode==="explore"){
		moveCam({zoom: 2, y: 19+(tgtHts[obj.replace('plr','')].y*0.8)},200)
		obj = seseme.getObjectByName(obj)
		selectedPillar = obj
		previewShift(true,obj.position.y)
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
	if(mode=="pillar"||mode=="detail"){
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


function summon(parent,riseamt,updown){
	
	parent.children.forEach(function(ele){
		var current = {y: ele.position.y}
		var rise = new TWEEN.Tween(current).to({y: ele.position+riseamt},800).onUpdate(function(){
			ele.position.y = current.y
		})
	})
}
function selectProjection(obj, onoff){
	var current = {x:obj.position.x,y:obj.position.y,z:obj.position.z,s: obj.scale.x, opacity: obj.material.opacity}
	var select = new TWEEN.Tween(current)
	var bottom = document.getElementById('infoBottom')
	var subs = [].slice.call(obj.getObjectByName('subs').children)

	if(onoff){
		mode = 'detail'
		selectedProjection = obj
		var adj = obj.adjust
		select.to({x:obj.expand.x+adj.x,y:obj.expand.y+adj.y,z:obj.expand.z+adj.z,s:adj.s, opacity: 1},450)
		// Velocity(bottom,{height:'6rem'})
		if(subs.length>0){
			subs.forEach(function(ele,i){
				fade(1,ele,600,0)
				move(ele.expand,ele,600,30*i)
			})
		}

	}else{
		select.to({x:obj.expand.x,y:obj.expand.y, z:obj.expand.z, s: 1, opacity: 0.85},450)
		if(subs.length>0){
			subs.forEach(function(ele,i){
				fade(0,ele,400,0)
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

function flipPrev(){
if(mode==="explore"){var prev = pedestal.getObjectByName(lookingAt + "_preview").getObjectByName('title')
	if(!centerish && distCtr < 17){
		rotate({x:camera.rotation.x,y:0,z:0},prev,500)
		centerish = true
	}else if(centerish && distCtr >= 17){
		rotate({x:0,y:0,z:0},prev,500)
		centerish = false
	}}
}

function previewShift(up){ //previews translate depending on explore/pillar modes
	var index = selectedPillar.name.replace('plr','')
	if(up){
		// console.log(index)
		for(var i=0;i<4;i++){
			var prevs = pedestal.getObjectByName('plr'+i+'_preview')
			var title = prevs.getObjectByName('title')
			move({y:1+tgtHts[i].y},prevs,800)
			growShrink({s:0.55},prevs,800)
			colorize({r:0,g:0,b:0},title,800)
			rotate({x:camera.rotation.x,y:0,z:0},title,800)
			if(i==index){
				var wht = title.getObjectByName('whtBack')
				var blk = prevs.getObjectByName('caption').getObjectByName('blkBack')
				fade(1,wht,800,0)
				fade(1,blk,800,0)
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
			if(i!=index){ rotate({x:0,y:0,z:0},title,800) }
			if(i==index){
				var wht = title.getObjectByName('whtBack')
				var blk = prevs.getObjectByName('caption').getObjectByName('blkBack')
				fade(0,wht,800,0)
				fade(0,blk,800,0)
				stretch({x:0.1,y:1,z:0.1},wht,800,0)
				stretch({x:0.1,y:1,z:0.1},blk,800,0)
			}
		}	
	}
}
function footProject(text){ //projects text from the base for 5-7 seconds then retracts and destroys itself
	if(text!==undefined&&text!==null&&text!==''){
	var footprojections = new THREE.Group()
	var p_xlats = [{x:-8.5, z:-1,rx:rads(-90),rz:rads(-90)},{x: -1.5, z: 6, rx:rads(-90),rz:0},{x: 5.5, z: -1, rx:rads(-90),rz:rads(90)},
	{x: -1.5, z: -8, rx:rads(-90),rz:rads(180)}]
	for(var i=0;i<4;i++){
		var cvs = document.createElement('canvas'), ctx = cvs.getContext('2d')
		cvs.width = 240; cvs.height = 40
		ctx.font = 'normal 300 30pt FiraSans'; ctx.fillStyle = "black";
		ctx.textAlign = "center"; ctx.fillText(text[i],120,30)
		var tex = new THREE.Texture(cvs); tex.needsUpdate = true
		var mtl = new THREE.MeshBasicMaterial(
			{map: tex,transparent: true, opacity: 0.25})
		var projection = new THREE.Mesh(new THREE.PlaneBufferGeometry(12,2),mtl) 
		projection.position.set(p_xlats[i].x*.5, 0, p_xlats[i].z*.5)
		projection.rotation.set(p_xlats[i].rx,0,p_xlats[i].rz)
		footprojections.add(projection)
	}
	pedestal.add(footprojections)
	footprojections.position.set(0,-17.6,0)

	footprojections.children.forEach(function(ele,i){
		var start = {x: ele.position.x, z: ele.position.z, o:0.25}
		var out = new TWEEN.Tween(start).to({x:p_xlats[i].x*1.15,z:p_xlats[i].z*1.15,o:1},1000).onUpdate(function(){
			ele.position.x = start.x; ele.position.z = start.z; ele.material.opacity = start.o }).easing(TWEEN.Easing.Cubic.Out)
		out.start()
		out.onComplete(function(){ 
			start = {x: ele.position.x, z: ele.position.z, o:1}; 
			var backIn = new TWEEN.Tween(start).to({x: p_xlats[i].x*.5, z: p_xlats[i].z*.5, o: 0},1000).onUpdate(function(){
			ele.position.x = start.x; ele.position.z = start.z; ele.material.opacity = start.o}).easing(TWEEN.Easing.Cubic.In).delay(5000)
			backIn.start() 
		})
	})
	}else{
		console.log('broken quit out')
	}
}
function secret(){
	footProject(['hold on','for a sec','!!!!','????'])
	forcing = true
	rotationIndex.forEach(function(ele,i){
		ele = seseme.getObjectByName(ele)
		var start = {y: ele.position.y}
		var danceUp = new TWEEN.Tween(start).to({y: 12},5000).onUpdate(function(){
			ele.position.y=start.y
		}).easing(TWEEN.Easing.Cubic.InOut)
		danceUp.onComplete(function(){
			var back = {y: ele.position.y}
			var danceDown = new TWEEN.Tween(back).to({y: tgtHts[i].y},5000).onUpdate(function(){
				ele.position.y = back.y
			}).delay(1000).start().onComplete(function(){
				forcing = false
				console.log('routine complete')
			}).easing(TWEEN.Easing.Cubic.InOut)
		})

		danceUp.start()
	})
}

function clearText(){
	for(var i=0; i<4; i++){
		var prev = pedestal.getObjectByName('plr'+i+'_preview')
		var proj = seseme.getObjectByName('plr'+i).getObjectByName('projections')
		prev.traverse(function(child){
			pedestal.remove(child)
		})
		proj.traverse(function(child){
			seseme.getObjectByName('plr'+i).remove(child)
		})
}}

// generic tools for a variety of situations
function degs(rads){ //get degrees for my comprehension
	return rads*(180/Math.PI)
}
function rads(degs){ //get radians for THREE instructions
	return degs*(Math.PI/180)
}
function fade(opa,tgt,spd,delay){
	var current = {opacity: tgt.material.opacity}
	var opTween = new TWEEN.Tween(current).to({opacity: opa},spd+delay)
	// if(inOut){opTween.to({opacity: 1},spd+delay)}else{opTween.to({opacity: 0},spd+delay)}
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
	rotTween.start()
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