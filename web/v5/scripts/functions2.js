
var view = {
	enableUI: function(){
		var bottomUi = document.querySelector('#bottom_ui')
		Velocity(bottomUi, {translateY: [0,bottomUi.offsetHeight]},'easeOutCubic', {duration: 300})

		uiEnabled = true
	},
	disableUI: function(){
		Velocity(bottomUi, {translateY: [bottomUi.offsetHeight,0]})
		Velocity(nav, {translateY: [-nav.offsetHeight*1.5,0]})
		Velocity(helpbutton, {translateX: [help.offsetWidth*1.5,0]},{delay: 200})
		uiEnabled = false
	},
	switchUI: function(){
		//color changes to all UIs
	},

	expandnav: function(){
		nav.isOpen = true
		Velocity(nav, "stop"); Velocity(nav.stuff, "stop"); Velocity(nav.closebtn, "stop")
		Velocity(nav.list, "stop"); Velocity(nav.icons, "stop")

		Velocity(nav.stuff, {height: '8.25rem'})
		Velocity(nav, {height: '8.25rem'})
		Velocity(nav.closebtn, {translateX: [0,'-3rem']}, {delay: 200})
		Velocity(nav.list, {translateY: '2.25rem', height: '100%'})
		Velocity(nav.icons, {translateY: '2rem', height: '6rem'})
	},
	collapsenav: function(){
		nav.isOpen = false
		Velocity(nav, "stop"); Velocity(nav.stuff, "stop"); Velocity(nav.closebtn, "stop")
		Velocity(nav.list, "stop"); Velocity(nav.icons, "stop")

		Velocity(nav.stuff, {height: '1.25rem'})
		Velocity(nav, {height: '1.25rem'})
		Velocity(nav.closebtn, {translateX: ['-3rem',0]})
		Velocity(nav.list, {translateY: 0, height: '1rem'})
		Velocity(nav.icons, {translateY: 0, height: '1.5rem'})
	},
	expandhelp: function(){
		console.log('expand help')
	},
	expandtext: function(){
		Velocity(text, {translateY: [-text.targetHeight,0]})
		Velocity(text.openbtn, {translateY: ['4rem',0]})
		Velocity(text.closebtn, {translateY: ['-4rem',0]})
		text.isOpen = true
	},
	collapsetext: function(){
		Velocity(text, {translateY: 0})
		Velocity(text.openbtn, {translateY: 0})
		Velocity(text.closebtn, {translateY: 0})
		text.isOpen = false
	},

	story: function(){
		// Velocity(part_title, 'stop'); Velocity(part_text, 'stop'); Velocity(whitebox,'stop')
		// Velocity(collapser, 'stop')
		// Velocity(whitebox, {scaleY: 0, opacity: 0})
		// Velocity(part_title, {opacity: 0.75, scale:0.75, top: (window.innerHeight /rem) - 1.75 + 'rem'})
		// Velocity(part_text, {opacity: 0, top: window.innerHeight})
		// Velocity(collapser, {translateX: '3rem'})
	},
	part: function(){
		console.log(collapsed)

		text.part.focus = true

		text.targetHeight = text.part.offsetHeight + rem
		Velocity(text.stuff, {height: text.targetHeight})
		Velocity(text.part, {opacity: 1})
		Velocity(text.points[facing], {opacity: 0})

		if(text.isOpen){
			Velocity(text, {translateY: -text.targetHeight})
		}
		// if(!collapsed){
		// Velocity(part_title, 'stop'); Velocity(part_text, 'stop'); Velocity(points_info, 'stop')
		// Velocity(whitebox, 'stop'); Velocity(collapser, 'stop'); Velocity(toppartinfo, 'stop')
		// collapser.classList.remove('open'); collapser.classList.remove('doneload')
		// collapser.classList.add('close')
		// Velocity(collapser, {backgroundColorAlpha: 0, translateX: 0, top:( window.innerHeight - part_text.offsetHeight)/rem - .5 + 'rem' })
		// Velocity(whitebox, {scaleY: 1, opacity: 1} )
		// Velocity(toppartinfo, {opacity: 0, translateX: '-3rem'})
		// Velocity(part_title, { opacity: 1, translateX: 0, top: window.innerHeight - part_text.offsetHeight, scale: 1})
		// Velocity(part_text, { opacity: 1, top: window.innerHeight - part_text.offsetHeight}, {delay: 50})
		// Velocity(points_info, { opacity: 0, top: window.innerHeight - (points[facing].text.offsetHeight+points[facing].name.offsetHeight) }, {duration: 500})
		// }else{
		// 	view.collapse()
		// }
	},
	point: function(){

		text.part.focus = false

		text.targetHeight = text.points[facing].offsetHeight + rem
		Velocity(text.stuff, {height: text.targetHeight})
		Velocity(text.part, {opacity: 0})
		Velocity(text.points[facing], {opacity: 1})

		if(text.isOpen){
			Velocity(text, {translateY: -text.targetHeight})
		}


		console.log(collapsed)
		// if(!collapsed){
		// Velocity(part_title, 'stop'); Velocity(part_text, 'stop'); Velocity(points_info, 'stop')
		// Velocity(whitebox, 'stop'); Velocity(collapser, 'stop'); Velocity(toppartinfo, 'stop')
		// collapser.classList.remove('open'); collapser.classList.remove('doneload')
		// collapser.classList.add('close')
		// Velocity(collapser, {top: (window.innerHeight-points[facing].text.offsetHeight)/rem - .75 + 'rem', backgroundColorAlpha: 0 })
		// Velocity(whitebox, {opacity: 1, scaleY:  (points[facing].text.offsetHeight+points[facing].name.offsetHeight)/(part_title.offsetHeight + part_text.offsetHeight)} )
		// Velocity(part_title, { opacity: 0, translateX: '-6rem' })
		// Velocity(toppartinfo, {translateX: 0, opacity: 1})
		// Velocity(part_text, { opacity: -1, top: window.innerHeight}, {duration: 500})
		// Velocity(points_info, { translateX: 0, opacity: 1, top: window.innerHeight - (points[facing].text.offsetHeight+points[facing].name.offsetHeight) }, {duration: 500})
		// for(var i = 0; i<4; i++){
		// 	Velocity(points[i].text, 'stop'); Velocity(points[i].name, 'stop')
		// 	Velocity(points[i].text, {translateY: 0}); Velocity(points[i].name, {translateY: 0})
		// }
		// }else{
		// 	view.collapse()
		// }
	},
	cyclePoints: function(show){

		if(!text.part.focus){
			text.targetHeight = text.points[show].offsetHeight + rem
			if(text.isOpen){
				Velocity(text.stuff, {height: text.targetHeight})
				Velocity(text, {translateY: -text.targetHeight})
				if(show===1&&facing===3 || show > facing){
					Velocity(text.points[facing], {opacity: 0, translateX: ['-3rem',0]})
					Velocity(text.points[show], {opacity: 1, translateX: [0,'3rem']})
				}else{
					Velocity(text.points[facing], {opacity: 0, translateX: ['3rem',0]})
					Velocity(text.points[show], {opacity: 1, translateX: [0,'-3rem']})
				}
			}else{
				Velocity(text.points[facing], {opacity: 0, translateX: 0}, {duration: 0})
				Velocity(text.points[show], {opacity: 1, translateX: 0}, {duration: 0})
			}
		}else{
			Velocity(text.points[show], {translateX: 0}, {duration: 0})
		}
	},
	collapse: function(){
		// collapser.classList.remove('close')
		// collapser.classList.add('open')
		// Velocity(collapser,'stop'); Velocity(whitebox, 'stop')
		// Velocity(whitebox, {scaleY: 0, opacity: 0})
		// if(perspective.zoom==='close'){
		// 	 Velocity(points_info, 'stop'); Velocity(part_title,'stop');Velocity(toppartinfo, 'stop')
		// 	Velocity(toppartinfo, {opacity: 1, translateX: 0})
		// 	Velocity(part_title, { opacity: 0, translateX: '-6rem' })
		// 	Velocity(points_info, {top: window.innerHeight-(3.4*rem), opacity: 1})
		// 	Velocity(collapser, {translateX: 0, backgroundColorAlpha: 0.4, top: window.innerHeight/rem - 2.5 + 'rem', opacity: 1})
		// 	for(var i = 0; i<4; i++){
		// 		Velocity(points[i].text, 'stop'); Velocity(points[i].name, 'stop')
		// 		Velocity(points[i].text, {translateY: points[i].text.offsetHeight})
		// 		if(collapsed){Velocity(points[i].name, {translateY: [0,'2.5rem']},{queue: false})}
		// 	}
		// }else if(perspective.zoom==='normal'){
		// 	info.storyring.hide()
		// 	Velocity(part_text, 'stop'); Velocity(part_title, 'stop'); Velocity(points_info, 'stop'); Velocity(toppartinfo, 'stop')
		// 	Velocity(toppartinfo, {opacity: 0, translateX: '-3rem'})
		// 	Velocity(part_title, {opacity: 0.75, scale:0.75, translateX: 0,
		// 		top: (window.innerHeight /rem) - 1.75 + 'rem' })
		// 	Velocity(part_text, {opacity: 0, top: window.innerHeight})
		// 	Velocity(collapser, {translateX: 0, backgroundColorAlpha: 0.4, top: window.innerHeight/rem - 2.5 + 'rem', opacity: 1})
		// 	Velocity(points_info, {opacity: 0})
		// 	if(collapsed){
		// 		for(var i = 0; i<4; i++){
		// 			Velocity(points[i].name, 'stop')
		// 			Velocity(points[i].name, {translateY: ['2.5rem','0']},{queue: false})
		// 		}
		// 	}
		// }
		// collapsed = true
	},
	expand: function(){
		if(perspective.zoom==='close'){
			view.point()
		}else if(perspective.zoom==='normal'){
			view.part()
		}
	},
	newInfo: function(){
		view.collapsetext()
		text.part.textContent = stories[story].parts[part].text
		var rgb = hexToRgb(stories[story].parts[part].color)
		console.log(rgb)
		for(var i = 0; i < 4; i++){
			recolor(seseme['plr'+i].outline, {r: rgb.r, g: rgb.g, b: rgb.b}, 1500)
			recolor(seseme['plr'+i].outcap, {r: rgb.r, g: rgb.g, b: rgb.b}, 1500)
			text.points[i].textContent = stories[story].parts[part].pointText[i]
		}
		text.targetHeight = text.part.offsetHeight + rem
		text.stuff.style.height = text.targetHeight

		text.openbtn.style.backgroundColor = text.stuff.style.backgroundColor =
		stories[story].parts[part].color



		// Velocity(part_title, {opacity: 0, translateX: '-3.5rem'}, {delay: 50, complete: function(){
		// 	part_title.textContent = stories[story].parts[part].name
		// 	part_text.textContent = stories[story].parts[part].text
		// 	toppartinfo.querySelector('#top_title').textContent = stories[story].parts[part].name
		// 	toppartinfo.querySelector('#top_counter').textContent = part+1 + '/' + stories[story].parts.length
		// 	for(var i = 0; i<4; i++){
		// 		points[i].name.textContent = stories[story].parts[part].pointNames[i]
		// 		points[i].text.textContent = stories[story].parts[part].pointText[i]
		// 	}
		// }})
		// Velocity(part_title, {opacity: 1, translateX: [0,'3.5rem']})
	},
	newStory: function(){

	},

	splash: function(){ //splash screen tells user what they're viewing

	}
}

function degs(rads){return rads*(180/Math.PI)}
function rads(degs){return degs*(Math.PI/180)}
function dice(possibilities){return Math.floor(Math.random()*possibilities)}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}



function move(obj,pos,spd,multiplier,twntype,twninout,callback,delay){
	// console.log('move operation')
	if(obj.moveTween){obj.moveTween.stop()}
	var diffs = [Math.abs(obj.position.x-pos.x), Math.abs(obj.position.y-pos.y), Math.abs(obj.position.z-pos.z)]
	, biggest = diffs.indexOf(Math.max.apply(Math, diffs))
	var start = {x: obj.position.x, y: obj.position.y, z: obj.position.z}
	var dist = multiplier*diffs[biggest]
	var translate = new TWEEN.Tween(start).to(pos,spd+dist)
	.onComplete(function(){if(callback){callback()}})
	.onUpdate(function(){
		obj.position.x = start.x; obj.position.y = start.y; obj.position.z = start.z
	})
	.easing(TWEEN.Easing[twntype][twninout])
	if(delay!==undefined){translate.delay(delay)}
	translate.start()
	obj.moveTween = translate
}
function fade(obj,tgtopacity,spd,delay,callback){
	if(obj.fadeTween){obj.fadeTween.stop()}
	var start = {opacity: obj.material.opacity}
	var transition = new TWEEN.Tween(start).to({opacity: tgtopacity}, spd)
	.onComplete(function(){if(callback!==undefined){callback()}})
	.onUpdate(function(){obj.material.opacity = start.opacity}).delay(delay)
	.easing(TWEEN.Easing.Quadratic.Out).start(); obj.fadeTween = transition
}
function size(obj,tgtscale,spd,callback,delay){
	if(obj.sizeTween){obj.sizeTween.stop()}
	var start = {x: obj.scale.x, y: obj.scale.y, z: obj.scale.z}
	var anim = new TWEEN.Tween(start).to(tgtscale,spd).onComplete(function(){
	if(callback!==undefined){callback()}}).onUpdate(function(){obj.scale.x = start.x
	obj.scale.y= start.y; obj.scale.z = start.z}).easing(TWEEN.Easing.Quadratic.Out)
	if(delay){anim.delay(delay)}else{}
	anim.start()
	obj.sizeTween = anim
}
function rotate(obj,tgtrotation,spd,delay,callback){
	if(obj.rotateTween){obj.rotateTween.stop()}
	var start = {x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z}
	obj.rotateTween = new TWEEN.Tween(start).to(tgtrotation,spd).delay(delay).onComplete(
		function(){ if(callback!==undefined){callback()} }).onUpdate(function(){obj.rotation.x = start.x
		obj.rotation.y = start.y; obj.rotation.z = start.z}).easing(TWEEN.Easing.Quadratic.Out)
	.start()
}
function recolor(obj,tgt,spd){
	if(obj.colorTween){obj.colorTween.stop()}
	var start = {r: obj.material.color.r, g: obj.material.color.g, b: obj.material.color.b}
	obj.colorTween = new TWEEN.Tween(start).to({r: tgt.r/255, g: tgt.g/255, b: tgt.b/255},spd).onUpdate(function(){
		obj.material.color.r = start.r; obj.material.color.g = start.g; obj.material.color.b = start.b
	}).start()
}

function Text(words,width,widthmargin,height,color,font,fontSize,fontWeight,align){ //'400 36pt Source Serif Pro'
	this.cvs = document.createElement('canvas'), this.ctx = this.cvs.getContext('2d')
	this.tex = new THREE.Texture(this.cvs); this.tex.needsUpdate = true
	this.cvs.width = this.ctx.measureText(words).width * width + widthmargin; this.cvs.height = height
	// this.ctx.strokeStyle = '#FF0000', this.ctx.lineWidth=5, this.ctx.strokeRect(0,0,this.cvs.width,this.cvs.height)
	this.ctx.scale(3,3); this.ctx.fillStyle = color; this.ctx.font = 'normal '+fontWeight+' '+fontSize+'pt '+font
	this.ctx.textAlign = align;
	if(align==='center'){this.ctx.fillText(words,this.cvs.width/6,this.cvs.height/6+fontSize/2.2)
	}else if(align==='start'){this.ctx.fillText(words,1,this.cvs.height/6+fontSize/2.2)}
	else{this.ctx.fillText(words,this.cvs.width/3-10,this.cvs.height/6+fontSize/2.2)}
}

function meshify(target){ //takes Text objects and turns them into mesh/mat, storing them as attributes in the original obj
	var mtl = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite:false, map: target.tex})
	var obj = new THREE.Mesh(new THREE.PlaneBufferGeometry(target.cvs.width/60,target.cvs.height/60), mtl)
	obj.canvas = target
	return obj
}

function backer(target, hex, margins){
	var mtl = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: hex})
	target.backing = new THREE.Mesh(new THREE.PlaneBufferGeometry(target.canvas.cvs.width/60 + margins[0],
	target.canvas.cvs.height/60 + margins[1]), mtl); target.backing.position.z -= 0.1
	target.add(target.backing)
}


// function showSprites()
// function hideSprites()
//
// function showPreview(i)
// function hidePreview(i)
