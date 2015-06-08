var story = 0, part = 0

var scene = new THREE.Scene(), camera, renderer, controls,
resources = {geos: {}, mtls: { prev: {} }}
var seseme = new THREE.Group(), ground, lights, shadow, orbitpointer
var info = {prev: [], sprite: []}

var plrmax = 12, defaultiso

var facing = 0, perspective = {height: 'isometric', zoom: 'normal', zoomswitch: false}
var thresholds = {zoom: [.7,1.3], height: [-3,-60]}

var socket = io('http://169.237.123.19:5000')
// var socket = require('socket.io-client')(IP)

var rem = parseInt(window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size'))

var nav = document.querySelector('#nav'), help = document.querySelector('#help'),
text = document.querySelector('#text')

var ui = [nav, help, text]
ui.forEach(function(ele){
	ele.isOpen = false
	ele.openbtn = ele.querySelector('.open')
	ele.closebtn = ele.querySelector('.close')
	ele.stuff = ele.querySelector('.stuff')
})

//consider moving many of these global vars to inside the loader function, which includes
//basically all setup functions

var init = true, collapsed = false, loading = true, uiEnabled = false

function setup(){
	loader()

function loader(){
	var allModels = ['quaped','pillarA','pillarB','pillarA_outline','pillarB_outline'] //symbolgeos?
	var allTextures = ['orbitpointer','storypointer','diamond','circle','chevron','tri','shadow'] //names of external imgs (PNG)
	stories.forEach(function(ele){ allModels.push(ele.geo); allTextures.push(ele.geo) })
	var resourceMgr = new THREE.LoadingManager()
	resourceMgr.itemStart('mdlMgr'); resourceMgr.itemStart('mtlMgr'); resourceMgr.itemStart('fonts')
	resourceMgr.onLoad = function(){
		console.log('all resources done')
		//////////////////////////////////////////////////////////////////////////////////
		///--------------CORE FUNCTIONS FOR INITIALIZING EVERYTHING--------------------//
		query(); build(); view.fill(); behaviors(); display()
		//-----------------------END CORE FUNCTIONS FOR INIT---------------------------//
		//////////////////////////////////////////////////////////////////////////////////
	}
	var mdlMgr = new THREE.LoadingManager()
	mdlMgr.onProgress = function(item,loaded, total){console.log(item,loaded, total)}
	mdlMgr.onLoad = function(){console.log('models done'); resourceMgr.itemEnd('mdlMgr')}
	for(var i = 0; i<allModels.length;i++){ mdlMgr.itemStart('assets/'+allModels[i]+'.js') }
	var mdlLoader = new THREE.JSONLoader()
	allModels.forEach(function(ele){
		mdlLoader.load('assets/'+ele+'.js',function(geo){
			resources.geos[ele] = geo; mdlMgr.itemEnd('assets/'+ele+'.js')
		})
	})
	//shapes for geo resources
	triangleA = new THREE.Shape() //normal triangle
	triangleA.moveTo(-0.75,0);triangleA.lineTo(0.75,0);triangleA.lineTo(0,-1);triangleA.lineTo(-0.75,0)
	resources.geos.triangleA = new THREE.ShapeGeometry(triangleA)
	rightTri = new THREE.Shape() //right triangle
	rightTri.moveTo(-1,-1);rightTri.lineTo(1,1);rightTri.lineTo(-1,1);rightTri.lineTo(-1,-1)
	resources.geos.rightTri = new THREE.ShapeGeometry(rightTri)

	var mtlMgr = new THREE.LoadingManager()
	mtlMgr.onProgress = function(item,loaded,total){console.log(item,loaded,total)}
	mtlMgr.onLoad = function(){console.log('textures done'); resourceMgr.itemEnd('mtlMgr')}
	var texLoader = new THREE.TextureLoader( mtlMgr )
	allTextures.forEach(function(ele){
		texLoader.load('assets/'+ele+'.png',function(texture){
			resources.mtls[ele] = new THREE.MeshBasicMaterial({depthWrite: false, map:texture, transparent: true, opacity: 1})
		})
	})
	WebFontConfig = {
		google: {families: ['Source Serif Pro', 'Fira Sans']},
		classes: false,
		active: function(){ console.log('fonts loaded'); resourceMgr.itemEnd('fonts') }
	}


	function query(){
		//socket.emit('get')
		//socket.on('data',function(d){
			// story = d.story ; part = d.part
		// })
	}
	function build(){
		//camera/renderer/dom
		var containerSESEME = document.getElementById("containerSESEME")
		var aspect = containerSESEME.offsetWidth / containerSESEME.offsetHeight; var d = 20
		camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 0, 100 )
		camera.position.set( -d, 10, d ); camera.rotation.order = 'YXZ'
		camera.rotation.y = - Math.PI / 4 ; camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) );
		camera.zoom = .875
		camera.updateProjectionMatrix(); defaultiso = camera.rotation.x

		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
		// renderer.setClearColor(0xbbbbbb)
		renderer.setSize( containerSESEME.offsetWidth, containerSESEME.offsetHeight)
		containerSESEME.appendChild( renderer.domElement )
		controls = new THREE.OrbitControls(camera)
		//materials
		resources.mtls.seseme = new THREE.MeshPhongMaterial({color: 0x80848e,shininess:21,specular:0x9e6f49,emissive: 0x101011})
		resources.mtls.orb = new THREE.MeshPhongMaterial({color:0xff6666,emissive:0x771100,shininess:1,specular:0x272727})
		resources.mtls.ground = new THREE.MeshBasicMaterial({color: 0xededed})
		//meshes
		ground = new THREE.Mesh(new THREE.PlaneBufferGeometry( 150, 150 ), resources.mtls.ground)
		ground.rotation.x = rads(-90); ground.position.set(0,-18,0)

		xlats = [
			{type:'A', qua: {x:1.5,z:1, r: 0}},
			{type:'B', qua: {x:1,z:-1.5, r: 90}},
			{type:'B', qua: {x:-1.5,z:-1, r: 180}},
			{type:'A', qua: {x:-1,z:1.5, r: -90}}
		]
		var pillarStartY = dice(2)===1? 0: 72
		xlats.forEach(function(ele,i){
			seseme['quad'+i] = new THREE.Mesh(resources.geos.quaped,resources.mtls.seseme)
			seseme['quad'+i].end = {x:ele.qua.x, y:0, z:ele.qua.z}
			seseme.add(seseme['quad'+i])
			seseme['plr'+i] = new THREE.Mesh(resources.geos['pillar'+ele.type],resources.mtls.seseme)
			seseme['plr'+i].position.set(-3.5,pillarStartY,1)
			seseme['plr'+i].geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-4,0))
			seseme['plr'+i].rotation.y = ele.type==='B'?rads(-90) : 0
			seseme['plr'+i].prevrot = ele.type==='B'? rads(45) : rads(-	45)
			//outline addition
			var outline, outlineColor = stories[story].parts[part].color
			if(ele.type==='A'){
				outline = new THREE.Mesh(resources.geos.pillarA_outline, new THREE.MeshBasicMaterial({color: outlineColor}))
			}else{
				outline = new THREE.Mesh(resources.geos.pillarB_outline, new THREE.MeshBasicMaterial({color: outlineColor}))
			}
			outline.material.side = THREE.BackSide
			outline.material.transparent = true; outline.material.depthWrite = false
			outline.material.opacity = 0
			outline.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-4,0))

			seseme['plr'+i].outline = outline; seseme['plr'+i].add(outline)

			var outcap = new THREE.Mesh(resources.geos.rightTri, new THREE.MeshBasicMaterial({color: outlineColor, transparent: true, opacity: 0}))
			outcap.rotation.x=rads(-90); outcap.rotation.z=rads(90)
			outcap.scale.set(1.9,1.9,1.9); outcap.position.set(-4,-0.6,1.5)
			seseme['plr'+i].outcap = outcap; seseme['quad'+i].add(outcap)

			seseme['quad'+i].add(seseme['plr'+i])
		})

		//lighting
		lights = new THREE.Group(); amblight = new THREE.AmbientLight( 0x232330 )
		backlight = new THREE.SpotLight(0xeaddb9, 1.2); camlight = new THREE.PointLight(0xffffff, .35)
	  	backlight.position.set(-7,25,-4); camlight.position.set(-40,-7,-24)
	  	lights.add(backlight); lights.add(amblight); lights.add(camlight)
	  	//other FX
	  	shadow = new THREE.Mesh(new THREE.PlaneBufferGeometry(16,16), resources.mtls.shadow)
	  	shadow.rotation.x = rads(-90); shadow.position.set(-0.1,-17.99,0.1)
			shadow.material.opacity = 0
			//adding to scene
		scene.add(ground); scene.add(seseme); scene.add(lights); scene.add(shadow)

	}//build
	view.fill = function(){
//booleans lock down user input when we are filling w/ new data
		loading = true; controls.noZoom = true
// stat type: how to fill statbox??? [0] = normal, [1] = detail
		var uiColor = stories[story].parts[part].color
		var stattype = [Object.keys(stories[story].parts[part].normalStat).toString().replace(',',''),
		Object.keys(stories[story].parts[part].detailStat).toString().replace(',','')
		]
//values-to-heights handling
		if(stories[story].parts[part].valueType === 'smallerIsHigher'){
			var top = stories[story].parts[part].valueRange[0]; var bottom = stories[story].parts[part].valueRange[1]
		}else if(stories[story].parts[part].valueType === 'biggerIsHigher'){
			var top = stories[story].parts[part].valueRange[1]; var bottom = stories[story].parts[part].valueRange[0]
		}
		range = Math.abs(bottom-top)
// deducing largest change, so callback can be assigned to that one
		var changes = []
		stories[story].parts[part].pointValues.forEach(function(ele,i){
			changes.push(Math.abs(seseme['plr'+i].position.y-Math.abs(bottom-ele)/range*plrmax))
		})
		var biggestDiff = changes.indexOf(Math.max.apply(Math, changes))

// FILLING ACTIONS: FIRST TIME (ON RUN): INIT ANIMATION
		if(init){
			var initAnim = dice(3) //2=flyin, 1=riseup, 0/other= flower
			var pillarAnim = function(which){
				move(seseme['plr'+which],{x: seseme['plr'+which].position.x,
				y: Math.abs(bottom-stories[story].parts[part].pointValues[which])/range * plrmax,
				z: seseme['plr'+which].position.z}, 1500, 5, 'Quadratic', 'Out', function(){
					projection(which)
				}, which*200)
			}
			//init anim: set position and rotation of quads, then animate them to correct position
			if(initAnim === 2){ //fly in (sides) animation
				console.log('flyin')
				for(var i = 0; i<4; i++){
					var q = seseme['quad'+i]
					q.position.set(q.end.x*-13, 0, q.end.z*-13)
					q.rotation.y = rads(i*90)
					move(q,{x:q.end.x,y:q.end.y,z:q.end.z},1700,1,'Quadratic','Out',pillarAnim(i),0)
				}
				fade(shadow, 1, 800, 1200)
			} else if (initAnim === 1){ // rise up animation
				console.log('riseup')
				for(var i = 0; i<4; i++){
					var q = seseme['quad'+i]
					q.position.set(q.end.x, -31, q.end.z)
					q.rotation.y = rads(i*90)
					move(q,{x:q.end.x,y:q.end.y,z:q.end.z},1700,1,'Quadratic','Out',pillarAnim(i),i*250)
				}
				fade(shadow, 1, 800, 1200)
			} else { //flower animation
				console.log('flower')
				for(var i = 0; i<4; i++){
					var q = seseme['quad'+i]
					q.position.set(q.end.x*-1.5,q.end.y,q.end.z*-1.5)
					q.rotation.y = rads((i*90)-30)
					move(q,{x:q.end.x,y:q.end.y,z:q.end.z},1700,1,'Quadratic','Out',pillarAnim(i),0)
					rotate(q,{x:0,y:rads(i*90),z:0},1700,0)
				}
				fade(shadow, 1, 800, 1200)
			}

	//DOM manipulations to get sizing, textContent, color info during fill()

			var part_text = document.querySelector('#part')
			nav.style.width = nav.stuff.offsetWidth
			part_text.textContent = stories[story].parts[part].text
			text.stuff.style.height = part_text.offsetHeight
			// navclose.style.borderLeftColor = outlineColor
			// navclose.style.borderTopColor = outlineColor
			// helpcontent.style.height = window.innerHeight

			// colorUi.forEach(function(ele,i){
			// 	document.getElementById(ele).style.backgroundColor = outlineColor
			// })


		}// end INITIAL 3D FILL

		// EVERY TIME FILLING 3D, EXCEPT THE FIRST  --------------------
		else{
			view.newInfo()
			var zoomout = new TWEEN.Tween({zoom: camera.zoom, sceneY: scene.position.y}).to({zoom: 1, sceneY: 0},500).onUpdate(function(){
			camera.zoom = this.zoom; camera.updateProjectionMatrix(); scene.position.y = this.sceneY}).start()
			stories[story].parts[part].pointValues.forEach(function(ele,i){
				info.prev[i].disappear(); info.sprite[i].disappear()
				move(seseme['plr'+i],{x:seseme['plr'+i].position.x,y: Math.abs(bottom-ele)/range * plrmax,z:seseme['plr'+i].position.z}
				,4000,45,'Cubic','InOut',function(){projection(i)})
			})
		}//end after first timeL ----------------------------

		function projection(i){
			 //pillar-matching infos
				//PREVIEWS: label(title,caption,pointer) and stat showing facing pillar data
				info.prev[i] = new THREE.Group()
					info.prev[i].position.set(0,0,0)
					info.prev[i].rotation.y = seseme['plr'+i].prevrot

					var label = meshify(new Text(stories[story].parts[part].pointNames[i],11.5,200,200,'white','Source Serif Pro',
					36, 400, 'center'))
					label.rotation.x = defaultiso; label.origin = {x:0,y:-seseme['plr'+i].position.y-1,z:6.5}
					label.expand = {x: 0, y: -seseme['plr'+i].position.y-3.5, z:6.5}
					label.position.set(0,-seseme['plr'+i].position.y-3.5,6.5)
						var caption = meshify(new Text(stories[story].parts[part].pointTitles[i],11.5,200,80,'white','Fira Sans',16,500,'center'))
						caption.origin={x:0,y:0.5,z:0};caption.expand={x:0,y:2,z:0};
						caption.position.set(caption.origin.x,caption.origin.y,caption.origin.z)
						label.add(caption);
						var pointer = new THREE.Mesh(new THREE.PlaneBufferGeometry(.75,.75), resources.mtls.tri.clone())
						pointer.material.opacity = 0; pointer.expand={x:0,y:3.4,z:.1};pointer.origin={x:0,y:1,z:.1}
						pointer.position.set(pointer.origin.x,pointer.origin.y,pointer.origin.z)
						label.add(pointer)
					info.prev[i].labelgroup = new THREE.Group()
					info.prev[i].label = label
					info.prev[i].labelgroup.add(label)
					info.prev[i].add(info.prev[i].labelgroup)

					var stat = new THREE.Group(); stat.stats = []
					stat.expand = {x:0,y:3.1+((plrmax-seseme['plr'+i].position.y)/6),z:0}
					stat.origin = {x:0,y:1.5,z:0}; stat.position.set(stat.origin.x,stat.origin.y,stat.origin.z)
					stat.scale.set(.75,.75,.75)
					// info.prev[i].add(stat) // removed...this should be added to a closer view
					info.prev[i].stat = stat
					stattype.forEach(function(ele,ite){
						var which = ite===0? 'normalStat': 'detailStat'
						if(ele==='nums'){
							stat.stats[ite] = meshify(new Text(stories[story].parts[part][which].nums[i],
							13,70,200,'white','Source Serif Pro',36,400,'center'))
							stat.stats[ite].position.z = 0.1
						}else if(ele==='numswords'){
							var words = stories[story].parts[part][which].words
							var longest = Math.max(words[0].length,words[1].length)
							stat.stats[ite] = meshify(new Text(stories[story].parts[part][which].nums[i],
							12.5,longest*28,200,'white','Source Serif Pro',32,400,'start'))
							stat.stats[ite].canvas.ctx.font = 'normal 500 14pt Fira Sans'; stat.stats[ite].canvas.ctx.textAlign = 'end'
							stat.stats[ite].canvas.ctx.fillText(words[0],stat.stats[ite].canvas.cvs.width/3,28)
							stat.stats[ite].canvas.ctx.fillText(words[1],stat.stats[ite].canvas.cvs.width/3,52)
							stat.stats[ite].position.z = 0.2;
						}else if(ele==='picswords'){
							//WIP: also, pics only? nums pics? nums pics words?
						}
					})
					stat.normalStat = stat.stats[0]; stat.detailStat = stat.stats[1]

						var statbox = new THREE.Mesh(new THREE.PlaneBufferGeometry((stat.stats[0].canvas.cvs.width*1.2)/60,(stat.stats[0].canvas.cvs.height*1.2)/60),
						new THREE.MeshBasicMaterial({depthWrite: false, color: 0x000000, transparent: true, opacity: 0 }))
						var triangle = new THREE.Mesh(resources.geos.triangleA,statbox.material); triangle.position.y=-2

						stat.add(triangle); stat.statbox = statbox; stat.add(stat.statbox);
						stat.add(stat.normalStat)

						//PREVIEW FUNCTIONS: transform, show, hide, newdata, enable, disable
						info.prev[i].show = function(){
							var label_i = 0
							this.label.traverse(function(child){
								fade(child,1,200,label_i*100)
								move(child,child.expand,400,1,'Quadratic','Out',function(){},0);label_i++
							})
							this.stat.traverse(function(child){
								if(!child.disabled){ if(child.material){fade(child,1,200,0)} }})
							size(this.stat,{x:1,y:1,z:1},400)
							move(this.stat,this.stat.expand,400,1,'Quadratic','Out',function(){},0)
						}
						info.prev[i].hide = function(){
							var label_i = 0
							this.label.traverse(function(child){
								fade(child,0,400-(label_i*150),0);
								move(child,child.origin,400,1,'Quadratic','Out',function(){},0)
								label_i++
							})
							this.stat.traverse(function(child){if(child.material){fade(child,0,200,0)}})
							size(this.stat,{x:.75,y:.75,z:.75},400)
							move(this.stat,this.stat.origin,400,1,'Quadratic','Out',function(){},0)
						}
						info.prev[i].detail = function(){
							var scalefactor = this.stat.stats[1].canvas.cvs.width / this.stat.stats[0].canvas.cvs.width
							size(this.stat.statbox,{x:scalefactor,y:1,z:1},300)
							this.stat.add(this.stat.detailStat); this.stat.normalStat.disabled = true;
							this.stat.detailStat.disabled = false
							fade(this.stat.normalStat,0,300,0)
							if(info.prev[facing] === this && perspective.height==='isometric'){	fade(this.stat.detailStat,1,300,0)}
						}
						info.prev[i].normal = function(){
							size(this.stat.statbox,{x:1,y:1,z:1},300)
							this.stat.add(this.stat.normalStat); this.stat.detailStat.disabled = true;
							this.stat.normalStat.disabled = false
							fade(this.stat.detailStat,0,300,0)
							if(info.prev[facing] === this && perspective.height==='isometric'){	fade(this.stat.normalStat,1,300,0)}
						}
						info.prev[i].disappear = function(){
							this.traverse(function(child){if(child.material){fade(child,0,500,0)}})
							size(this,{x:0.1,y:0.1,z:0.1},800,function(){
								seseme['plr'+i].remove(info.prev[i])
							})
						}
					seseme['plr'+i].add(info.prev[i])

				//SPRITES: objects for height="elevation"
					info.sprite[i] = new THREE.Group();
					var txt = new Text(stories[story].parts[part].pointNames[i],
					11,240,125,'black','Fira Sans',30,500,'center')
					var sprmtl = new THREE.SpriteMaterial({transparent:true,map:txt.tex,opacity:0})
					var sprite = new THREE.Sprite(sprmtl); sprite.scale.set(txt.cvs.width/150,txt.cvs.height/150,1)

					var sprpointer = new THREE.Sprite(new THREE.SpriteMaterial({transparent: true, map: resources.mtls.chevron.map, opacity:0}))

					sprite.expand = {y: 0, sx: txt.cvs.width/100, sy:txt.cvs.height/100 }
					sprpointer.expand = {y: -1}; info.sprite[i].expand = {y: 1.75}
					sprpointer.position.y = -2; info.sprite[i].add(sprpointer); info.sprite[i].obj = sprite
					info.sprite[i].add(info.sprite[i].obj)

					seseme['plr'+i].add(info.sprite[i])

					info.sprite[i].show = function(){
						size(this.obj,{x:this.obj.expand.sx,y:this.obj.expand.sy,z:1},300)
						var spr_i = 0
						this.traverse(function(child){
							if(child.material){fade(child,1,300+(spr_i*100),i*100)}
							move(child,{x:child.position.x,y:child.expand.y,z:child.position.z},300+(spr_i*125),1,'Quadratic','Out',function(){},i*100)
							spr_i++
						})
					}
					info.sprite[i].hide = function(){
						size(this.obj,{x:this.obj.expand.sx/1.5,y:this.obj.expand.sy/1.5,z:1},300)
						var spr_i = 0
						this.traverse(function(child){if(child.material){
							fade(child,0,200+(spr_i*50),i*100)}
							move(child,{x:child.position.x,y:child.expand.y-(spr_i),z:child.position.z},200+(spr_i*100),1,'Quadratic','Out',function(){},i*50)
							spr_i++
						})
					}
					info.sprite[i].disappear = function(){
						size(this,{x:0.75,y:0.75,z:1},500, function() {seseme['plr'+i].remove(info.sprite[i]) })
						this.traverse(function(child){if(child.material){ fade(child,0,200,i*50,function(){}) }})
					}

				//EVENT: last projection = initialize controls, take off 'loading' boolean
					if(i===biggestDiff){ //is this pillar the last one to finish?
						if(init){
							setTimeout(function(){view.enableUI()},100)
							init = false
						}//init finish: display UI, whereas normally we just collapse it?
						//(nav stays in normal load)
						console.log('enable controls and UI')

						loading = false
						controls.noZoom = false
						if(perspective.height==='isometric'){ info.prev[facing].show() }
						else if(perspective.height==='elevation'){ for(var i=0;i<4;i++){info.sprite[i].show()} }
						else if(perspective.height==='plan'){  }
						if(!init){
							// Velocity(collapser,'stop'); Velocity(collapser,{rotateZ:'360deg',opacity:1},{duration:100})
							// collapser.classList.remove('loading'); collapser.classList.add('doneload')
						}

					} // end if last projection (biggestDiff)

		} // end projection

	} //end view.fill() --------------------
	function behaviors(){

		Origami.fastclick(document.body) //attaches fastclick so iOS doesnt wait 300ms
		window.addEventListener('deviceorientation', function(evt){


		})

		//dom UI element interactions

		ui.forEach(function(ele){
			ele.openbtn.addEventListener('click',view['expand'+ele.getAttribute('id')])
			ele.closebtn.addEventListener('click',view['collapse'+ele.getAttribute('id')])
		})

		nav.addEventListener('click',function(){
			if(nav.isOpen){ //nav is open, close it
				view.collapsenav()
			}else{ //nav is closed, open it
				view.expandnav()
			}
		})

		// var domUis = document.querySelectorAll('.ui-element')
		// for(var i = 0; i<domUis.length; i++){
		// 	domUis[i].isOpen = false
		// 	domUis[i].expand = view['expand'+domUis[i].getAttribute('id')]
		// 	domUis[i].collapse = view['collapse'+domUis[i].getAttribute('id')]
		//
		// 	domUis[i].querySelector('.open').addEventListener('click',domUis[i].expand)
		// 	domUis[i].querySelector('.open').addEventListener('click',domUis[i].collapse)
		// }
		// document.querySelector('#nav').addEventListener('click',view.expandnav)


		//3d controls manipulation
		controls.addEventListener( 'change', function(){
			lights.rotation.set(-camera.rotation.x/2, camera.rotation.y + rads(45), -camera.rotation.z/2)

			//ROTATING: WHAT IS FACING PILLAR? WHAT INFO? + MOVE LIGHTS

			facingRotations = [-45,45,135,-135]
			facingRotations.some(function(ele,i){
				if(Math.abs(degs(camera.rotation.y)-ele)<45){

					if(facing!==i){
						console.log('facing diff plr')
						if(perspective.height==='isometric'&&perspective.zoom!=='far'&&!loading){
							info.prev[facing].hide();	info.prev[i].show()
						}

						fade(seseme['plr'+i].outline,1,250,0)
						fade(seseme['plr'+i].outcap,1,250,0)
						fade(seseme['plr'+facing].outline,0,300,0)
						fade(seseme['plr'+facing].outcap,0,300,0)

						facing = i

						if(perspective.zoom==='close'){
							perspective.zoomswitch = true
							zoomswitchcallback = function(){perspective.zoomswitch = false}
							move(scene,{x:0,y:-(seseme['plr'+facing].position.y)*addzoom-(addzoom*4),z:0},100,70,'Quadratic','InOut',zoomswitchcallback)
						}
					}
				return true }
			})

			//HEIGHT AND ZOOM: NEW HEIGHt/ZOOM? WHAT ACTION?
			height = degs(camera.rotation.x)>thresholds.height[0]?'elevation':degs(camera.rotation.x)<thresholds.height[1]?'plan':'isometric'
			zoom = camera.zoom>thresholds.zoom[1]? 'close' : camera.zoom<thresholds.zoom[0]? 'far' : 'normal'
			addzoom = camera.zoom-thresholds.zoom[1]
			controls.zoomSpeed = 0.7-(Math.abs(camera.zoom-1)/3)

			if(perspective.height!==height){ //on height change
				perspective.height = height
				if(perspective.height!=='isometric'){
					for(var i = 0; i<4; i++){
						info.prev[i].hide()
						if(perspective.height==='elevation'&&perspective.zoom!=='far'){info.sprite[i].show()}
						else if(perspective.height==='plan'&&perspective.zoom!=='far'){ info.birdview.show() }
					}
				}else if(!loading&&zoom!=='far'){
					info.prev[facing].show(); for(var i=0;i<4;i++){info.sprite[i].hide()}; info.birdview.hide()
				}
			}
			if(perspective.zoom!==zoom){ //on zoom change
				if(perspective.zoom==='close' && zoom === 'normal'){ info.prev.forEach(function(ele){ ele.normal()})}
				perspective.zoom = zoom
				if(zoom === 'close'){ view.point(); info.prev.forEach(function(ele){ele.detail()})	}
				else if(zoom === 'far'){ info.prev.forEach(function(ele,i){ele.hide();info.sprite[i].hide()}); info.birdview.hide(); view.story(); }
				else{	if(perspective.height==='isometric'){info.prev[facing].show();}
				else if(perspective.height==='elevation'){for(var i =0;i<4;i++){info.sprite[i].show()}} view.part() }
			}

			if(perspective.zoom==='close'){
				info.sprite.forEach(function(ele){ele.scale.set(1-addzoom/4,1-addzoom/4,1-addzoom/4)})
				if(perspective.zoomswitch===false){//scene moves up and down at close zoom levels
				scene.position.y = -(seseme['plr'+facing].position.y)*(addzoom/1.5)-(addzoom*4)
				info.prev.forEach(function(ele){
					ele.position.y = addzoom * 3; ele.scale.set(1-addzoom/2.5,1-addzoom/2.5,1+addzoom/2.5)
					ele.labelgroup.position.y = -addzoom * 20; ele.labelgroup.scale.set(1-addzoom/3,1-addzoom/3,1-addzoom/3)
				})}
			}

		})//end controls 'change' event

		window.addEventListener('resize', function(){
			var aspect = window.innerWidth / window.innerHeight; var d = 20
			camera.left = -d*aspect; camera.right = d*aspect; camera.top = d; camera.bottom = -d
	  		renderer.setSize( window.innerWidth, window.innerHeight); camera.updateProjectionMatrix()
		}, false)

	}//behaviors
}//loader
}//setup

function display(){
    requestAnimationFrame( display ); renderer.render( scene, camera )
    controls.update(); TWEEN.update();
}
