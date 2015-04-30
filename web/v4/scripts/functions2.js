
var view = {
	next: function(){
		for(var i = 0; i<4; i++){seseme['plr'+i].remove(info.prev[i])}
		part+=1; view.fill()
	},

	story: function(){
		Velocity(part_title, 'stop'); Velocity(part_text, 'stop'); Velocity(whitebox,'stop')
		Velocity(whitebox, {scaleY: 0.1})
		Velocity(part_title, {opacity: 0.75, scale:[0.75,1],
			translateY: [window.innerHeight-parseInt(part_title.style.top),0]})
		Velocity(part_text, {opacity: 0, translateY: ['3rem',0], transformOriginX: ['100%','100%']})
	},

	part: function(){
		Velocity(part_title, 'stop'); Velocity(part_text, 'stop'); Velocity(points_info, 'stop'); Velocity(whitebox, 'stop')
		Velocity(whitebox, {scaleY: 1}, {delay: 200, duration: 600} )
		Velocity(part_title, { opacity: 1, scale: 1, translateY: 0}
			, {duration: 600}, [.42, .21, .5, 1])
		Velocity(part_text, { opacity: 1, translateY: 0}, {duration: 500})
		Velocity(points_info, { opacity: 0, translateY: '3rem' }, {duration: 500})
	},

	point: function(){
		Velocity(part_title, 'stop'); Velocity(part_text, 'stop'); Velocity(points_info, 'stop'); Velocity(whitebox, 'stop')
		Velocity(whitebox, {scaleY:  (points[0].text.offsetHeight+points[0].name.offsetHeight)/(part_title.offsetHeight + part_text.offsetHeight)} )
		Velocity(part_title, { opacity: .7, scale: [.75,1],
			translateY: [-parseInt(part_title.style.top)-(part_text.offsetHeight),0]}
			, {duration: 600}, [.42, .21, .5, 1])
		Velocity(part_text, { opacity: -1, translateY: part_text.offsetHeight/2}, {duration: 500})
		Velocity(points_info, { opacity: [1,0], translateY: [ 0,'3rem'] }, {duration: 500})
	},

	cyclePoints: function(show){
		Velocity(points[show].name, 'stop'); Velocity(points[facing].name, 'stop')
		Velocity(points[show].text, 'stop'); Velocity(points[facing].text, 'stop')
		if(show===1&&facing===3 || show > facing){
			Velocity(points[show].name, {opacity: 1, translateX: ['0', '4rem']}, {duration: 400})
			Velocity(points[show].text, {opacity: 1, translateX: ['0', '3rem']}, {duration: 300})
			Velocity(points[facing].name, {opacity: 0, translateX: ['-4rem',0]}, {duration: 300})
			Velocity(points[facing].text, {opacity: 0, translateX: ['-3rem',0]}, {duration: 200})
		}else{
			Velocity(points[show].name, {opacity: 1, translateX: [0, '-4rem']}, {duration: 400})
			Velocity(points[show].text, {opacity: 1, translateX: [0, '-3rem']}, {duration: 300})
			Velocity(points[facing].name, {opacity: 0, translateX: ['4rem',0]}, {duration: 300})
			Velocity(points[facing].text, {opacity: 0, translateX: ['3rem',0]}, {duration: 200})
		}
	}
}

function degs(rads){
	return rads*(180/Math.PI)
}
function rads(degs){
	return degs*(Math.PI/180)
}
function move(obj,pos,spd,multiplier,twntype,twninout,callback,delay){
	// console.log('move operation')
	if(obj.moveTween){obj.moveTween.stop()}
	var start = {x: obj.position.x, y: obj.position.y, z: obj.position.z}
	var dist = multiplier*((Math.abs(obj.position.x-pos.x))+(Math.abs(obj.position.y-pos.y))+(Math.abs(obj.position.z-pos.z)))
	var translate = new TWEEN.Tween(start).to(pos,spd+dist)
	.onComplete(function(){if(callback!==undefined){callback()}})
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
function size(obj,tgtscale,spd,callback){
	if(obj.sizeTween){obj.sizeTween.stop()}
	var start = {x: obj.scale.x, y: obj.scale.y, z: obj.scale.z}
	var anim = new TWEEN.Tween(start).to(tgtscale,spd).onComplete(function(){
	if(callback!==undefined){callback()}}).onUpdate(function(){obj.scale.x = start.x
	obj.scale.y= start.y; obj.scale.z = start.z}).easing(TWEEN.Easing.Quadratic.Out).start()
	obj.sizeTween = anim
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
