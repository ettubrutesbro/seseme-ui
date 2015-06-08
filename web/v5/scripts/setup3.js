var story = 0, part = 0

var scene = new THREE.Scene(), camera, renderer, controls,
resources = {geos: {}, mtls: { prev: {} }}
var seseme = new THREE.Group(), ground, lights, shadow, orbitpointer
var info = {prev: [], sprite: []}

var plrmax = 12, defaultiso

var facing = 0, perspective = {height: 'isometric', zoom: 'normal', zoomswitch: false}
var thresholds = {zoom: [.7,1], height: [-3,-60]}

var socket = io('http://169.237.123.19:5000')

var rem = parseInt(window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size'))

var nav = document.querySelector('#nav'), help = document.querySelector('#help'),
text = document.querySelector('#text')



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
		query(); build(); display()
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
		socket.emit('whereWeAt')
		socket.on('hereWeAt',function(d){
			part = d.page
			view.fill()

			if(stories[story].parts[part].valueType === 'smallerIsHigher'){
				var top = stories[story].parts[part].valueRange[0]; var bottom = stories[story].parts[part].valueRange[1]
			}else if(stories[story].parts[part].valueType === 'biggerIsHigher'){
				var top = stories[story].parts[part].valueRange[1]; var bottom = stories[story].parts[part].valueRange[0]
			}
			range = Math.abs(bottom-top)

			var delayMotor = function(i){
				setTimeout(function(){
					var mpos = Math.abs(bottom-stories[story].parts[part].pointValues[i-1])/range * 100
					socket.emit('moveMotorJack',{name: 'm'+i, position: mpos})
				}, i*500 )
			}
			var unisonMotor = function(i){
				var mpos = Math.abs(bottom-stories[story].parts[part].pointValues[i-1])/range * 100
				socket.emit('moveMotorJack',{name: 'm'+i, position: mpos})
			}

				// for(var i=1; i<5; i++){delayMotor(i)}
				for(var i=1; i<5; i++){unisonMotor(i)}

			socket.emit('setHSL',stories[story].parts[part].fakeHueVal)
		})

		socket.on('buttonPressed',function(){
			socket.emit('whereWeAt')
		})

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
				z: seseme['plr'+which].position.z}, 3500, 5, 'Quadratic', 'Out', function(){
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
	// defining DOM relationships
			var ui = [nav, help, text]
			ui.forEach(function(ele){
				ele.isOpen = false
				ele.openbtn = ele.querySelector('.open')
				ele.closebtn = ele.querySelector('.close')
				ele.stuff = ele.querySelector('.stuff')
			})

			text.part = text.querySelector('#part')
			text.points = text.querySelectorAll('.point')

	//DOM manipulations to get sizing, textContent, color info during fill()


	var rgb = hexToRgb(stories[story].parts[part].color)
	console.log(rgb)

			text.part.textContent = stories[story].parts[part].text
			for(var i = 0; i < 4; i++){
				text.points[i].textContent = stories[story].parts[part].pointText[i]
				recolor(seseme['plr'+i].outline, {r: rgb.r, g: rgb.g, b: rgb.b}, 100)
				recolor(seseme['plr'+i].outcap, {r: rgb.r, g: rgb.g, b: rgb.b}, 100)
			}
			text.targetHeight = text.part.offsetHeight + rem
			text.stuff.style.height = text.targetHeight

			text.openbtn.style.backgroundColor = text.stuff.style.backgroundColor =
			 stories[story].parts[part].color



			// navclose.style.borderLeftColor = outlineColor
			// navclose.style.borderTopColor = outlineColor
			// helpcontent.style.height = window.innerHeight

			// colorUi.forEach(function(ele,i){
			// 	document.getElementById(ele).style.backgroundColor = outlineColor
			// })

			behaviors()

		}// end INITIAL 3D FILL

		// EVERY TIME FILLING 3D, EXCEPT THE FIRST  --------------------
		else{
			view.newInfo()
			var zoomout = new TWEEN.Tween({zoom: camera.zoom, sceneY: scene.position.y}).to({zoom: .875, sceneY: 0},500).onUpdate(function(){
			camera.zoom = this.zoom; camera.updateProjectionMatrix(); scene.position.y = this.sceneY}).start()
			stories[story].parts[part].pointValues.forEach(function(ele,i){
				info.prev[i].disappear(); info.sprite[i].disappear()
				move(seseme['plr'+i],{x:seseme['plr'+i].position.x,y: Math.abs(bottom-ele)/range * plrmax,z:seseme['plr'+i].position.z}
				,6000,45,'Cubic','InOut',function(){projection(i)})
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
					label.expand = {x: 0, y: -seseme['plr'+i].position.y-4, z:6.5}
					label.position.set(0,-seseme['plr'+i].position.y-3.5,6.5)
						var caption = meshify(new Text(stories[story].parts[part].pointTitles[i],11.5,200,80,'white','Fira Sans',16,500,'center'))
						caption.origin={x:0,y:3,z:0};caption.expand={x:0,y:2,z:0};
						caption.position.set(caption.origin.x,caption.origin.y,caption.origin.z)
						label.add(caption);
					info.prev[i].labelgroup = new THREE.Group()
					info.prev[i].label = label
					info.prev[i].labelgroup.add(label)
					info.prev[i].add(info.prev[i].labelgroup)


						//PREVIEW FUNCTIONS: transform, show, hide, newdata, enable, disable
						info.prev[i].show = function(){
							var label_i = 0
							this.label.traverse(function(child){
								fade(child,1,200,label_i*100)
								move(child,child.expand,400,1,'Quadratic','Out',function(){},0);label_i++
							})

						}
						info.prev[i].hide = function(){
							var label_i = 0
							this.label.traverse(function(child){
								fade(child,0,400-(label_i*150),0);
								move(child,child.origin,400,1,'Quadratic','Out',function(){},0)
								label_i++
							})
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
					sprpointer.expand = {y: -1}; info.sprite[i].expand = {y: 2.7}
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
						fade(seseme['plr'+facing].outline,1,400,100)
						fade(seseme['plr'+facing].outcap,1,400,100)
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
		var ui = [nav, help, text]
		ui.forEach(function(ele){
			ele.openbtn.addEventListener('click',view['expand'+ele.getAttribute('id')])
			ele.closebtn.addEventListener('click',view['collapse'+ele.getAttribute('id')])
		})

		// nav.addEventListener('click',function(){
		// 	if(!nav.isOpen){ 	view.expandnav()}
		// })

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
						if(perspective.height==='isometric'&&perspective.zoom!=='close'&&perspective.zoom!=='far'&&!loading){
							info.prev[facing].hide();	info.prev[i].show()
							fade(seseme['plr'+i].outline,1,350,0)
							fade(seseme['plr'+i].outcap,1,350,0)
							fade(seseme['plr'+facing].outline,0,300,0)
							fade(seseme['plr'+facing].outcap,0,300,0)
						}


						view.cyclePoints(i)
						facing = i

						if(perspective.zoom==='close'){
							perspective.zoomswitch = true
							zoomswitchcallback = function(){perspective.zoomswitch = false}
							move(scene,{x:0,y:-(seseme['plr'+facing].position.y)*(addzoom/1.5)-(addzoom*4),z:0},100,70,'Quadratic','InOut',zoomswitchcallback)

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
						fade(seseme['plr'+i].outline,0,350,0)
						fade(seseme['plr'+i].outcap,0,350,0)
						if(perspective.height==='elevation'&&perspective.zoom!=='far'){info.sprite[i].show()}
						else if(perspective.height==='plan'&&perspective.zoom!=='far'){  }
					}
				}else if(!loading&&zoom!=='far'){
					info.prev[facing].show(); for(var i=0;i<4;i++){info.sprite[i].hide()}
					fade(seseme['plr'+facing].outline,1,350,0)
					fade(seseme['plr'+facing].outcap,1,350,0)
				}
			}
			if(perspective.zoom!==zoom){ //on zoom change
				perspective.zoom = zoom
				if(zoom === 'close'){ view.point(); for(var i=0;i<4;i++){
					fade(seseme['plr'+i].outline,0,500,0); fade(seseme['plr'+i].outcap,0,500,0); info.prev[i].hide()}; 	}
				else if(zoom === 'far'){ info.prev.forEach(function(ele,i){ele.hide();info.sprite[i].hide()
					fade(seseme['plr'+i].outline,0,500,0); fade(seseme['plr'+i].outcap,0,500,0)}) }
				else{	if(perspective.height==='isometric'){info.prev[facing].show(); fade(seseme['plr'+facing].outline,1,500,0); fade(seseme['plr'+facing].outcap,1,500,0)}
				else if(perspective.height==='elevation'){for(var i =0;i<4;i++){info.sprite[i].show()}} view.part() }
			}

			if(perspective.zoom==='close'){
				info.sprite.forEach(function(ele){ele.scale.set(1-addzoom/4,1-addzoom/4,1-addzoom/4)})
				if(perspective.zoomswitch===false){//scene moves up and down at close zoom levels
				scene.position.y = -(seseme['plr'+facing].position.y)*(addzoom/1.5)-(addzoom*4)
				}
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
