var story = 0, part = 0

var scene = new THREE.Scene(), camera, renderer, controls,
resources = {geos: {}, mtls: { prev: {} }}
var seseme = new THREE.Group(), ground, lights, gyro, orbitpointer
var info = {prev: [], sprite: []}

var plrmax = 12, defaultiso

var facing = 0, perspective = {height: 'isometric', zoom: 'normal', zoomswitch: false}
var thresholds = {zoom: [.7,1.3], height: [-3,-60]}

var part_title = document.getElementById('part_title'),part_text = document.getElementById('part_text'),
points_info = document.getElementById('points_info'), points = document.getElementsByClassName('point'),
whitebox = document.getElementById('whitebox'), collapser = document.getElementById('collapser'),
toppartinfo = document.getElementById('partinfo'),
rem = parseInt(window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size'))

init = true, collapsed = false, loading = true

function setup(){
	loader()

function loader(){
	var allModels = ['pedestal','pillarA','pillarB']
	var allTextures = ['orbitpointer','storypointer','diamond','circle','chevron','tri','shadow'] //names of external imgs (PNG)
	stories.forEach(function(ele){ allModels.push(ele.geo); allTextures.push(ele.geo) })
	var resourceMgr = new THREE.LoadingManager()
	resourceMgr.itemStart('mdlMgr'); resourceMgr.itemStart('mtlMgr'); resourceMgr.itemStart('fonts')
	resourceMgr.onLoad = function(){
		console.log('all resources done')
		//////////////////////////////////////////////////////////////////////////////////
		///--------------CORE FUNCTIONS FOR INITIALIZING EVERYTHING--------------------//
		query(); build(); view.fill(); init = false; behaviors(); display()
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
		seseme.pedestal = new THREE.Mesh(resources.geos.pedestal,resources.mtls.seseme)
		seseme.pedestal.position.set(1.5,0,1)
		seseme.pillars = new THREE.Group()
		plrXlats = [
			{type:'A',ry:0,pos:{x:-5,z:-5}},
			{type:'B',ry:0, pos:{x:-5,z:-5}},
			{type:'B',ry:90, pos:{x:-5,z:5}},
			{type:'A',ry:-90, pos:{x:5,z:-5}}
		]
		plrXlats.forEach(function(ele,i){
			seseme['plr'+i] = new THREE.Mesh(resources.geos['pillar'+ele.type],resources.mtls.seseme)
			seseme['plr'+i].position.set(ele.pos.x,0,ele.pos.z)
			seseme['plr'+i].rotation.y = rads(ele.ry)
			seseme['plr'+i].cxlat = ele.type==='A'? {sx:3,sz:7,px:-1.5,pz:11.5,pr:-45} : {sx:7,sz:7,px:11.5,pz:11.5,pr:45}
			seseme.pillars.add(seseme['plr'+i])
		})
		seseme.add(seseme.pedestal)
		seseme.add(seseme.pillars)
		//lighting
		lights = new THREE.Group(); gyro = new THREE.Group(); amblight = new THREE.AmbientLight( 0x232330 )
		backlight = new THREE.SpotLight(0xeaddb9, 1.2); camlight = new THREE.PointLight(0xffffff, .35)
	  	backlight.position.set(-7,25,-4); camlight.position.set(-40,-7,-24)
	  	lights.add(backlight); lights.add(amblight); lights.add(camlight);
	  	gyro.add(lights)
	  	//other FX
	  	shadow = new THREE.Mesh(new THREE.PlaneBufferGeometry(16,16), resources.mtls.shadow)
	  	shadow.rotation.x = rads(-90); shadow.position.set(-0.1,-17.99,0.1)
	  	// scene.fog = new THREE.FogExp2( 0xbbbbbb, 1.2 )
		//misc one-time setups: one-off geos and mtls
			var triangleA = new THREE.Shape()
			triangleA.moveTo(-0.75,0);triangleA.lineTo(0.75,0);triangleA.lineTo(0,-1);triangleA.lineTo(-0.75,0)
	  	resources.geos.triangleA = new THREE.ShapeGeometry(triangleA)
			 //adding to scene
		scene.add(ground); seseme.add(shadow); scene.add(seseme); scene.add(gyro)

	}//build
	view.fill = function(){
		loading = true; controls.noZoom = true

		var stattype = [Object.keys(stories[story].parts[part].normalStat).toString().replace(',',''),
		Object.keys(stories[story].parts[part].detailStat).toString().replace(',','')
	]
		if(stories[story].parts[part].valueType === 'smallerIsHigher'){
			var top = stories[story].parts[part].valueRange[0]; var bottom = stories[story].parts[part].valueRange[1]
		}else if(stories[story].parts[part].valueType === 'biggerIsHigher'){
			var top = stories[story].parts[part].valueRange[1]; var bottom = stories[story].parts[part].valueRange[0]
		}
		range = Math.abs(bottom-top)

		var changes = []
		stories[story].parts[part].pointValues.forEach(function(ele,i){
			var current = seseme['plr'+i].position.y; var target = Math.abs(bottom-ele)/range*plrmax
			changes.push(Math.abs(current-target))
		})
		var biggestDiff = changes.indexOf(Math.max.apply(Math, changes))

		if(init){ //snap in stuff (no transitions) for first load
			stories[story].parts[part].pointValues.forEach(function(ele,i){
				seseme['plr'+i].position.y = Math.abs(bottom-ele)/range * plrmax
				projection(i)
				points[i].name = points[i].querySelector('.title'); points[i].text = points[i].querySelector('.text')
				points[i].name.textContent = stories[story].parts[part].pointNames[i]
				points[i].text.textContent = stories[story].parts[part].pointText[i]
			})
			part_title.textContent = stories[story].parts[part].name
			part_text.textContent = stories[story].parts[part].text
			part_title.style.top = part_text.style.top = window.innerHeight - part_text.offsetHeight
			points_info.style.top = window.innerHeight - (points[facing].text.offsetHeight+points[facing].name.offsetHeight)
			whitebox.style.height = part_title.offsetHeight + part_text.offsetHeight
			collapser.style.top = parseInt(part_title.style.top)/rem - .5 + 'rem'
			collapser.style.right = .75*rem
			toppartinfo.querySelector('#top_title').textContent = stories[story].parts[part].name
			toppartinfo.querySelector('#top_counter').textContent = part+1 + '/' + stories[story].parts.length
			points[facing].name.style.opacity = points[facing].text.style.opacity = 1

			//create a single BIRDVIEW: object for height='plan'
				info.birdview = new THREE.Group()
				var birdstory = meshify(new Text(stories[story].title,12,140,180,'black','Source Serif Pro',32,400,'center'))
				info.birdview.position.y = plrmax+1; info.birdview.rotation.y = camera.rotation.y
				birdstory.rotation.x = rads(-90); birdstory.position.set(0,-3,-2)
				birdstory.origin = {x: 0, y: 2.5, z: -1.5}; birdstory.expand = {x: 0, y: 0, z: -1.5}
				backer(birdstory, 0xffffff, [.75,.25])

				var nextlabel = meshify(new Text('NEXT'.split('').join(String.fromCharCode(8202)),7.5,40,100,'white','Fira Sans',18,600,'center'))
				var nextpart = part!==stories[story].parts.length?
				meshify(new Text(stories[story].parts[part+1].name,8,70,120,'white','Fira Sans',21,300,'center')) :
				meshify(new Text('(back to start)',8,70,120,'white','Fira Sans',21,300,'center'))

				nextpart.expand = {x:birdstory.canvas.cvs.width/120 - nextpart.canvas.cvs.width/120, y:-birdstory.canvas.cvs.height/120 - nextpart.canvas.cvs.height/60, z:-.5}
				nextpart.origin = {x:birdstory.canvas.cvs.width/120 - nextpart.canvas.cvs.width/120, y:0, z:-1}
				nextpart.position.set(nextpart.origin.x, nextpart.origin.y, nextpart.origin.z)
				backer(nextpart, 0x000000, [nextlabel.canvas.cvs.width/60+.75,.5])
				nextpart.backing.position.x = (nextpart.canvas.cvs.width/60 - (nextpart.canvas.cvs.width/60 + nextlabel.canvas.cvs.width/60))/2
				nextlabel.position.x -= nextpart.canvas.cvs.width/120 + (nextlabel.canvas.cvs.width/120)

				nextpart.add(nextlabel); birdstory.add(nextpart); info.birdview.add(birdstory)
				seseme.add(info.birdview)

				info.birdview.show = function(){
					var bird_i = 0
					this.traverse(function(child){if(child.material){fade(child,1,300,50*bird_i)};bird_i++})
					move(birdstory,birdstory.expand,500,1,'Quadratic','Out',function(){},60)
					move(nextpart,nextpart.expand,500,1,'Quadratic','Out',function(){},0)
					size(birdstory,{x:1,y:1,z:1},400)
				}
				info.birdview.hide = function(){
					var bird_i = 0
					this.traverse(function(child){if(child.material){fade(child,0,300,0)};bird_i++})
					move(birdstory,birdstory.origin,500,1,'Quadratic','Out',function(){},0)
					move(nextpart,nextpart.origin,500,1,'Quadratic','Out',function(){},0)
					size(birdstory,{x:0.8,y:0.8,z:0.8},400)
				}
				info.birdview.cycle = function(){
					size(nextpart,{x:1,y:0.5,z:1},470)
					move(nextpart,nextpart.origin,500,1,'Quadratic','Out',function(){
						birdstory.remove(nextpart)
						nextpart = ''; nextpart = part!==stories[story].parts.length?
						meshify(new Text(stories[story].parts[part+1].name,8,70,120,'white','Fira Sans',21,300,'center')) :
						meshify(new Text('(back to start)',8,70,120,'white','Fira Sans',21,300,'center'))
						nextpart.expand = {x:birdstory.canvas.cvs.width/120 - nextpart.canvas.cvs.width/120, y:-birdstory.canvas.cvs.height/120 - nextpart.canvas.cvs.height/60, z:-.5}
						nextpart.origin = {x:birdstory.canvas.cvs.width/120 - nextpart.canvas.cvs.width/120, y:0, z:-1}
						backer(nextpart, 0x000000, [nextlabel.canvas.cvs.width/60+.75,.5])
						nextpart.backing.position.x = (nextpart.canvas.cvs.width/60 - (nextpart.canvas.cvs.width/60 + nextlabel.canvas.cvs.width/60))/2
						nextlabel.position.x = -(nextpart.canvas.cvs.width/120 + (nextlabel.canvas.cvs.width/120))
						nextpart.position.set(nextpart.expand.x*5,nextpart.expand.y,0)
						birdstory.add(nextpart); nextpart.add(nextlabel)
						size(nextpart,{x:1,y:1,z:1},500)
						if(perspective.height==='plan'){
							nextpart.traverse(function(child){fade(child,1,500,0)})
							move(nextpart,nextpart.expand,500,1,'Cubic','Out',function(){})
						}
					},0)
				}
				info.birdview.change = function(){

				}
			//end birdview creation code

			//STORY RING: when zoomed out, users can see/preview all stories (just not access them)

			info.storyring = new THREE.Group(); info.storyring.rotation.x = rads(-90);
			// info.storyring.position.y = -17.7
			info.storyring.position.y = -8
			var circle = new THREE.Mesh(new THREE.PlaneBufferGeometry(46,46), resources.mtls.circle)
			var diamond = new THREE.Mesh(new THREE.PlaneBufferGeometry(25,25), resources.mtls.diamond)
			// orbitpointer = new THREE.Mesh(new THREE.PlaneBufferGeometry(4.5,4.5), resources.mtls.orbitpointer)
			// var storypointer = new THREE.Mesh(new THREE.PlaneBufferGeometry(4.5,4.5), resources.mtls.storypointer)
			circle.rotation.z = rads(-45); diamond.rotation.z = rads (-45)
			// orbitpointer.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-15,0))
			// storypointer.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,-15,0))
			// orbitpointer.material.opacity = storypointer.material.opacity = 0
			// orbitpointer.rotation.z = camera.rotation.y; storypointer.rotation.z = camera.rotation.y

			info.storyring.add(circle); info.storyring.add(diamond);

			stories.forEach(function(ele){
				var storygeo = new THREE.Mesh(resources.geos[ele.geo], new THREE.MeshLambertMaterial({
					map: resources.mtls[ele.geo].map, emissive: 0x9A9A9A, depthWrite: true}))
					storygeo.rotation.x = rads(90); storygeo.position.y = -24
					circle.add(storygeo)
			})

			// info.storyring.add(orbitpointer); info.storyring.add(storypointer)
			circle.scale.set(.2,.2,.2); diamond.scale.set(.4,.4,.4)
			seseme.add(info.storyring)

			info.storyring.show = function(){
				// fade(storypointer,1,300,0); fade(orbitpointer,1,300,0)
				size(circle, {x: 1, y: 1, z: 1}, 400)
				fade(circle, 1, 400, 0)
				size(diamond, {x: 1, y: 1, z: 1}, 300)
				fade(diamond, 1, 300, 0)
				// size(orbitpointer,{x:1,y:1,z:1},300)
				// size(storypointer,{x:1,y:1,z:1},300)
			}
			info.storyring.hide = function(){
				// fade(storypointer,0,300,0); fade(orbitpointer,0,300,0)
				size(circle, {x: 0.2, y: 0.2, z: 0.2}, 450)
				fade(circle, 0, 450, 0)
				size(diamond, {x: 0.4, y: 0.4, z: 0.4}, 350, function(){}, 30)
				fade(diamond, 0, 350, 40)
				// size(orbitpointer,{x:0.25,y:0.25,z:0.25},300)
				// size(storypointer,{x:0.25,y:0.25,z:0.25},300)
			}
			info.storyring.pulse = function(){
				size(diamond, {x: 0.7,y:0.7,z:0.7})
			}
			info.storyring.change = function(){
				var rotate = new TWEEN.Tween({rz: storypointer.rotation.z}).to({rz: rads(-45 + (story*45))},300+(story*200)).
				onUpdate(function(){ storypointer.rotation.z = this.rz }).
				easing(TWEEN.Easing.Quadratic.Out).start()
			}


		}// end INITIAL 3D FILL

		// EVERY TIME FILLING 3D, EXCEPT THE FIRST  --------------------
		else{
			if(!collapsed){ perspective.zoom = 'normal'; view.collapse()
			setTimeout(function(){collapser.classList.remove('open'); collapser.classList.add('loading')},500)}else{
				collapser.classList.remove('open'); collapser.classList.add('loading')}
			Velocity(collapser, {opacity: 0.75},{queue:false})

			info.birdview.cycle()

			view.newInfo()

			var zoomout = new TWEEN.Tween({zoom: camera.zoom, sceneY: scene.position.y}).to({zoom: 1, sceneY: 0},500).onUpdate(function(){
			camera.zoom = this.zoom; camera.updateProjectionMatrix(); scene.position.y = this.sceneY}).start()

			stories[story].parts[part].pointValues.forEach(function(ele,i){
				info.prev[i].disappear(); info.sprite[i].disappear()
				move(seseme['plr'+i],{x:seseme['plr'+i].position.x,y: Math.abs(bottom-ele)/range * plrmax,z:seseme['plr'+i].position.z}
				,4000,45,'Cubic','InOut',function(){projection(i)})
			})
		}//end init check of 3d FILL ----------------------------

		function projection(i){
			 //pillar-matching infos
				//PREVIEWS: label(title,caption,pointer) and stat showing facing pillar data
				info.prev[i] = new THREE.Group()
					info.prev[i].position.set(seseme['plr'+i].cxlat.sx,0,seseme['plr'+i].cxlat.sz)
					info.prev[i].rotation.y = rads(seseme['plr'+i].cxlat.pr)

					var label = meshify(new Text(stories[story].parts[part].pointNames[i],11.5,200,200,'white','Source Serif Pro',
					36, 400, 'center'))
					label.rotation.x = defaultiso; label.origin = {x:0,y:-seseme['plr'+i].position.y-1,z:6.5}
					label.expand = {x: 0, y: -seseme['plr'+i].position.y-3.5, z:6.5}
					label.position.set(0,-seseme['plr'+i].position.y-3.5,6.5)
						var caption = meshify(new Text(stories[story].parts[part].metricName,11.5,200,80,'white','Fira Sans',16,500,'center'))
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
					info.prev[i].add(stat); info.prev[i].stat = stat
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
					info.sprite[i] = new THREE.Group(); info.sprite[i].position.set(seseme['plr'+i].cxlat.sx,0,seseme['plr'+i].cxlat.sz)
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
						console.log('show facing now')
						loading = false
						controls.noZoom = false
						if(perspective.height==='isometric'){ info.prev[facing].show() }
						else if(perspective.height==='elevation'){ for(var i=0;i<4;i++){info.sprite[i].show()} }
						else if(perspective.height==='plan'){ console.log('show birdview') }
						if(!init){
							Velocity(collapser,'stop'); Velocity(collapser,{rotateZ:'360deg',opacity:1},{duration:100})
							collapser.classList.remove('loading'); collapser.classList.add('doneload')
						}

					} // end if last projection (biggestDiff)

		} // end projection

		//experimental testing - take random # and apply UI configurations
			//collapse or no?
			//starting zoom amount?
			//tutorial or no?

	} //end view.fill() --------------------
	function behaviors(){

		Origami.fastclick(document.body) //attaches fastclick to body so shitty iOS doesnt wait 300ms
		window.addEventListener('deviceorientation', function(evt){
			gyro.rotation.y = rads(evt.gamma)/1.5
		})

		collapser.addEventListener('click',function(){
			if(!loading){if(collapsed){collapsed=false;view.expand()}else{view.collapse()}}
		})
		collapser.addEventListener('animationend',function(){
			if(collapser.classList.contains('loading')){Velocity(collapser,{rotateZ: '360deg'},{loop:true, easing:'linear'})}
		})
			collapser.addEventListener('webkitAnimationEnd',function(){if(collapser.classList.contains('loading')){Velocity(collapser,{rotateZ: '360deg'},{loop:true, easing:'linear'})}})
			collapser.addEventListener('mozAnimationEnd',function(){if(collapser.classList.contains('loading')){Velocity(collapser,{rotateZ: '360deg'},{loop:true, easing:'linear'})}})

		controls.addEventListener( 'change', function(){
			lights.rotation.set(-camera.rotation.x/2, camera.rotation.y + rads(45), -camera.rotation.z/2)
			info.birdview.rotation.y = camera.rotation.y
			// orbitpointer.rotation.z = camera.rotation.y
			//ROTATING: WHAT IS FACING PILLAR? WHAT INFO? + MOVE LIGHTS

			facingRotations = [-45,45,135,-135]
			facingRotations.some(function(ele,i){
				if(Math.abs(degs(camera.rotation.y)-ele)<45){

					if(facing!==i){
						console.log('facing diff plr')
						if(perspective.height==='isometric'&&perspective.zoom!=='far'&&!loading){
							info.prev[facing].hide();	info.prev[i].show()
						}
						view.cyclePoints(i)
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
				scene.position.y = -(seseme['plr'+facing].position.y)*addzoom-(addzoom*4)
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
