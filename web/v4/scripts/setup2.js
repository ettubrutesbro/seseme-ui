var story = 0, part = 0

var scene = new THREE.Scene(), camera, renderer, controls,
resources = {geos: {}, mtls: { prev: {} }}
var seseme = new THREE.Group(), ground, lights, gyro
var info = {prev: [], summ: [], multi: [], detail: []}

var plrmax = 12, defaultiso

var facing = 0, perspective = {height: 'isometric', zoom: 'normal', zoomswitch: false}
var thresholds = {zoom: [.8,1.3], height: [-12,-60]}

var part_title = document.getElementById('part_title'),part_text = document.getElementById('part_text'),
points_info = document.getElementById('points_info'), points = document.getElementsByClassName('point'),
whitebox = document.getElementById('whitebox'), collapser = document.getElementById('collapser'),
rem = parseInt(window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size'))

collapsed = false

function setup(){
	loader()

function loader(){
	var allModels = ['pedestal','pillarA','pillarB']
	var allTextures = ['grade_good','grade_ok','grade_bad','grade_awful','tri','shadow'] //names of external imgs (PNG)
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
		var aspect = window.innerWidth / window.innerHeight; var d = 20
		camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 0, 100 )
		camera.position.set( -d, 10, d ); camera.rotation.order = 'YXZ'
		camera.rotation.y = - Math.PI / 4 ; camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) ); camera.zoom = 0.9
		camera.updateProjectionMatrix(); defaultiso = camera.rotation.x
		var containerSESEME = document.getElementById("containerSESEME")
		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
		// renderer.setClearColor(0xbbbbbb)
		renderer.setSize( window.innerWidth, window.innerHeight)
		containerSESEME.appendChild( renderer.domElement )
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
			// seseme['plr'+i].cpos = ele.pos; seseme['plr'+i].crot = rads(ele.ry)
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
		if(stories[story].parts[part].valueType === 'smallerIsHigher'){
			var top = stories[story].parts[part].valueRange[0]; var bottom = stories[story].parts[part].valueRange[1]
		}else if(stories[story].parts[part].valueType === 'biggerIsHigher'){
			var top = stories[story].parts[part].valueRange[1]; var bottom = stories[story].parts[part].valueRange[0]
		}
		range = Math.abs(bottom-top)
		stories[story].parts[part].pointValues.forEach(function(ele,i){
			seseme['plr'+i].position.y = Math.abs(bottom-ele)/range * plrmax
		})

		part_title.textContent = stories[story].parts[part].name
		part_text.textContent = stories[story].parts[part].text

		for(var i = 0; i < points.length; i++){
			points[i].name = points[i].querySelector('.title'); points[i].text = points[i].querySelector('.text')
			points[i].name.textContent = stories[story].parts[part].pointNames[i]
			points[i].text.textContent = stories[story].parts[part].pointText[i]
		}

		part_title.style.top = part_text.style.top = window.innerHeight - part_text.offsetHeight
		points_info.style.top = window.innerHeight - (points[facing].text.offsetHeight+points[facing].name.offsetHeight)
		whitebox.style.height = part_title.offsetHeight + part_text.offsetHeight
		collapser.style.top = parseInt(part_title.style.top)/rem - .5 + 'rem'
		collapser.style.right = .75*rem

		var stattype = [Object.keys(stories[story].parts[part].normalStat).toString().replace(',',''),
		Object.keys(stories[story].parts[part].detailStat).toString().replace(',','')
		]
		for(var i = 0; i<4; i++){ //pillar-matching infos
			//PREVIEWS: label(title,caption,pointer) and stat showing facing pillar data
			info.prev[i] = new THREE.Group()
				info.prev[i].position.set(seseme['plr'+i].cxlat.sx,0,seseme['plr'+i].cxlat.sz)
				info.prev[i].rotation.y = rads(seseme['plr'+i].cxlat.pr)

				var label = new Text(stories[story].parts[part].pointNames[i],11.5,200,200,'white','Source Serif Pro',
				36, 400, 'center')
				label.mtl = new THREE.MeshBasicMaterial({depthWrite: false, transparent: true, map: label.tex,opacity: 0})
				label.obj = new THREE.Mesh(new THREE.PlaneBufferGeometry(label.cvs.width/60,label.cvs.height/60),label.mtl)
				label.obj.rotation.x = defaultiso; label.obj.origin = {x:0,y:-seseme['plr'+i].position.y-1,z:6.5}
				label.obj.expand = {x: 0, y: -seseme['plr'+i].position.y-3.5, z:6.5}
				label.obj.position.y = -seseme['plr'+i].position.y-3.5; label.obj.position.z = 6.5
				info.prev[i].label = label.obj;
					var caption = new Text(stories[story].parts[part].metricName,11.5,200,80,'white','Fira Sans',16,500,'center')
					caption.mtl = new THREE.MeshBasicMaterial({depthWrite: false, transparent: true, map:caption.tex,opacity: 0})
					caption.obj = new THREE.Mesh(new THREE.PlaneBufferGeometry(caption.cvs.width/60,caption.cvs.height/60),caption.mtl)
					caption.obj.origin={x:0,y:0.5,z:0};caption.obj.expand={x:0,y:2,z:0};
					caption.obj.position.set(caption.obj.origin.x,caption.obj.origin.y,caption.obj.origin.z)
					label.obj.caption = caption; label.obj.add(caption.obj);
					var pointer = new THREE.Mesh(new THREE.PlaneBufferGeometry(.75,.75), resources.mtls.tri.clone())
					pointer.material.opacity = 0; pointer.expand={x:0,y:3.4,z:.1};pointer.origin={x:0,y:1,z:.1}
					pointer.position.set(pointer.origin.x,pointer.origin.y,pointer.origin.z)
					label.obj.pointer = pointer; label.obj.add(pointer)
				info.prev[i].labelgroup = new THREE.Group(); info.prev[i].labelgroup.add(label.obj); info.prev[i].add(info.prev[i].labelgroup)

				var stat = new THREE.Group(); stat.stats = []
				stat.expand = {x:0,y:3.1+((plrmax-seseme['plr'+i].position.y)/6),z:0}
				stat.origin = {x:0,y:1.5,z:0}; stat.position.set(stat.origin.x,stat.origin.y,stat.origin.z)
				stat.scale.set(.75,.75,.75)
				info.prev[i].add(stat); info.prev[i].stat = stat
				stattype.forEach(function(ele,ite){
					var which = ite===0? 'normalStat': 'detailStat'
					if(ele==='nums'){
						stat.stats[ite] = new Text(stories[story].parts[part][which].nums[i],
						13,70,200,'white','Source Serif Pro',36,400,'center')
						stat.stats[ite].width = stat.stats[ite].cvs.width/60; stat.stats[ite].height = stat.stats[ite].cvs.height/60
						stat.stats[ite].mtl = new THREE.MeshBasicMaterial({depthWrite:false,transparent:true,map:stat.stats[ite].tex,opacity:0})
						stat.stats[ite].obj = new THREE.Mesh(new THREE.PlaneBufferGeometry(stat.stats[ite].width,stat.stats[ite].height),stat.stats[ite].mtl)
						stat.stats[ite].obj.position.z = 0.1
					}else if(ele==='numswords'){
						var words = stories[story].parts[part][which].words
						var longest = Math.max(words[0].length,words[1].length)
						stat.stats[ite] = new Text(stories[story].parts[part][which].nums[i],
						12.5,longest*28,200,'white','Source Serif Pro',32,400,'start')
						stat.stats[ite].ctx.font = 'normal 500 14pt Fira Sans'; stat.stats[ite].ctx.textAlign = 'end'
						stat.stats[ite].ctx.fillText(words[0],stat.stats[ite].cvs.width/3,28)
						stat.stats[ite].ctx.fillText(words[1],stat.stats[ite].cvs.width/3,52)
						stat.stats[ite].width = stat.stats[ite].cvs.width/60;stat.stats[ite].height = stat.stats[ite].cvs.height/60
						stat.stats[ite].mtl = new THREE.MeshBasicMaterial({depthWrite:false,transparent:true,opacity:0,map:stat.stats[ite].tex})
						stat.stats[ite].obj = new THREE.Mesh(new THREE.PlaneBufferGeometry(stat.stats[ite].width,stat.stats[ite].height),
						stat.stats[ite].mtl); stat.stats[ite].obj.position.z = 0.2;
					}
				})
				stat.normalStat = stat.stats[0].obj; stat.detailStat = stat.stats[1].obj

					var statbox = new THREE.Mesh(new THREE.PlaneBufferGeometry(stat.stats[0].width*1.2,stat.stats[0].height*1.2),
					new THREE.MeshBasicMaterial({depthWrite: false, color: 0x000000, transparent: true, opacity: 0 }))
					var triangle = new THREE.Mesh(resources.geos.triangleA,statbox.material); triangle.position.y=-2

					stat.add(triangle); stat.statbox = statbox; stat.add(stat.statbox); stat.add(stat.normalStat)

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
						var scalefactor = this.stat.stats[1].width / this.stat.stats[0].width
						size(this.stat.statbox,{x:scalefactor,y:1,z:1},300)
						 this.stat.add(this.stat.detailStat); this.stat.normalStat.disabled = true;
						this.stat.detailStat.disabled = false
						fade(this.stat.normalStat,0,300,0)
						if(info.prev[facing] === this){	fade(this.stat.detailStat,1,300,0)}
					}
					info.prev[i].normal = function(){
						size(this.stat.statbox,{x:1,y:1,z:1},300)
						this.stat.add(this.stat.normalStat); this.stat.detailStat.disabled = true;
						this.stat.normalStat.disabled = false
						fade(this.stat.detailStat,0,300,0)
						if(info.prev[facing] === this){	fade(this.stat.normalStat,1,300,0)}
					}
				seseme['plr'+i].add(info.prev[i])
		}
		info.prev[facing].show()
		points[facing].name.style.opacity = points[facing].text.style.opacity = 1

	} //end view.fill() --------------------
	function behaviors(){
		controls = new THREE.OrbitControls(camera)
		window.addEventListener('deviceorientation', function(evt){
			gyro.rotation.y = rads(evt.gamma)/1.5
		})

		collapser.addEventListener('click',function(){
			if(collapsed){view.expand()}else{view.collapse()}
			collapsed = !collapsed
		})


		controls.addEventListener( 'change', function(){

			//ROTATING: WHAT IS FACING PILLAR? WHAT INFO? + MOVE LIGHTS
			lights.rotation.set(-camera.rotation.x/2, camera.rotation.y + rads(45), -camera.rotation.z/2)

			facingRotations = [-45,45,135,-135]
			facingRotations.some(function(ele,i){
				if(Math.abs(degs(camera.rotation.y)-ele)<45){

					if(facing!==i){
						view.cyclePoints(i)
						console.log('facing diff plr')
						if(perspective.height==='isometric'&&perspective.zoom!=='far'){
							info.prev[facing].hide();	info.prev[i].show()
						}
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
			controls.zoomSpeed = 0.7-(Math.abs(camera.zoom-1)/4)

			if(perspective.height!==height){ //on height change
				perspective.height = height
				if(perspective.height!=='isometric'){
					info.prev.forEach(function(ele){ele.hide()})
				}else{info.prev[facing].show()}
			}
			if(perspective.zoom!==zoom){ //on zoom change
				collapsed = false
				if(perspective.zoom==='close' && zoom === 'normal'){ view.part(); info.prev.forEach(function(ele){ ele.normal()})}
				else if(zoom === 'close'){ view.point(); info.prev.forEach(function(ele){ele.detail()})	}
				else if(zoom === 'far'){ info.prev.forEach(function(ele){ele.hide()}); view.story() }
				else{	info.prev[facing].show(); view.part() }
				perspective.zoom = zoom
			}

			if(perspective.zoom==='close'&&perspective.zoomswitch===false){
				//scene moves up and down at close zoom levels
				scene.position.y = -(seseme['plr'+facing].position.y)*addzoom-(addzoom*4)
				info.prev.forEach(function(ele){
					ele.position.y = addzoom * 3; ele.scale.set(1-addzoom/3,1-addzoom/3,1-addzoom/3)
					ele.labelgroup.position.y = -addzoom * 25; ele.labelgroup.scale.set(1-addzoom/3,1-addzoom/3,1-addzoom/3)
				})
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
