var story = 0, part = 0

var scene = new THREE.Scene(), camera, renderer, controls, 
resources = {geos: {}, mtls: { plrs: { plns: [], sprs: []} }}
var seseme = new THREE.Group(), ground, lights, gyro
var plrmax = 12, defaultiso

var facing = 'plr0', perspective = {height: 'isometric', zoom: 'normal', zoomswitch: false} 
var thresholds = {zoom: [.8,1.2], height: [-15,-60]}

function setup(){
	loader()

function loader(){
	var allModels = ['pedestal','pillarA','pillarB']
	var allTextures = ['grade_good','grade_ok','grade_bad','grade_awful'] //names of all external images
	var resourceMgr = new THREE.LoadingManager()
	resourceMgr.itemStart('mdlMgr'); resourceMgr.itemStart('mtlMgr'); resourceMgr.itemStart('fonts')
	resourceMgr.onLoad = function(){ 
		console.log('all resources done')
		//////////////////////////////////////////////////////////////////////////////////
		///--------------CORE FUNCTIONS FOR INITIALIZING EVERYTHING--------------------//
		query(); build(); fill(); behaviors(); display()
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
			resources.mtls[ele] = new THREE.MeshBasicMaterial({map:texture})
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
		camera.rotation.y = - Math.PI / 4 ; camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) )
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
			{type:'A',ry:0,pos:{x:-5,z:-5}},{type:'B',ry:0, pos:{x:-5,z:-5}},
			{type:'B',ry:90, pos:{x:-5,z:5}},{type:'A',ry:-90, pos:{x:5,z:-5}}
		]
		plrXlats.forEach(function(ele,i){
			seseme['plr'+i] = new THREE.Mesh(resources.geos['pillar'+ele.type],resources.mtls.seseme)
			seseme['plr'+i].position.set(ele.pos.x,0,ele.pos.z)
			seseme['plr'+i].rotation.y = rads(ele.ry)
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
	  	// scene.fog = new THREE.FogExp2( 0xbbbbbb, 1.2 )
	  	 //adding to scene
		scene.add(ground); scene.add(seseme); scene.add(gyro)

	}//build
	function fill(){
		if(stories[story].parts[part].valueType === 'smallerIsHigher'){
			var top = stories[story].parts[part].valueRange[0]; var bottom = stories[story].parts[part].valueRange[1]
		}else if(stories[story].parts[part].valueType === 'biggerIsHigher'){
			var top = stories[story].parts[part].valueRange[1]; var bottom = stories[story].parts[part].valueRange[0]
		}
		range = Math.abs(bottom-top)
		stories[story].parts[part].pointValues.forEach(function(ele,i){
			seseme['plr'+i].position.y = Math.abs(bottom-ele)/range * plrmax
		})

		plrxlats = [{sx:3,sz:7,px:-1,pz:11,pr:-45},{sx:7,sz:7,px:11,pz:11,pr:45},{sx:7,sz:7,px:11,pz:11,pr:45},{sx:3,sz:7,px:-1,pz:11,pr:-45}]
		seseme.pillars.children.forEach(function(ele,i){ //pillar objects
			var title = stories[story].parts[part].pointNames[i]
			var capt = stories[story].parts[part].metricName
			//top sprite (for close-plan)
				var spritecvs = document.createElement( 'canvas' ), spritectx = spritecvs.getContext('2d'), spritetex = new THREE.Texture(spritecvs) 
				spritetex.needsUpdate = true; spritecvs.height = 360; spritecvs.width = spritectx.measureText(title).width * 18;
				spritectx.scale(3,3); spritectx.beginPath(); spritectx.arc(spritecvs.width/6, 75, 8, 0, Math.PI*2, true);  
				spritectx.closePath(); spritectx.fillStyle = 'black'; spritectx.fill(); spritectx.textAlign = 'center'
				spritectx.font= 'normal 500 32pt Fira Sans'; spritectx.fillText(title.toUpperCase(),spritecvs.width/6,50); 
				resources.mtls.plrs.sprs[i] = new THREE.SpriteMaterial({map: spritetex, transparent: true, opacity: 0})
				var sprite = new THREE.Sprite( resources.mtls.plrs.sprs[i] ); sprite.scale.set(spritecvs.width/100,spritecvs.height/100,1)
				sprite.position.set(plrxlats[i].sx,0.75,plrxlats[i].sz); sprite.name = 'sprite'; ele.add(sprite);
			//face plane (for normal-iso)
				var planecvs = document.createElement( 'canvas' ), planectx = planecvs.getContext('2d') 
				var planetex = new THREE.Texture(planecvs); planetex.needsUpdate = true; 
				planecvs.width = planectx.measureText(title).width * 11.5+200; planecvs.height = 200
				planectx.scale(3,3); planectx.fillStyle = 'white'; 
				planectx.font = 'normal 400 36pt Source Serif Pro';planectx.textAlign = 'center'; 
				planectx.fillText(title,planecvs.width/6,50)
				resources.mtls.plrs.plns[i] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, map: planetex})
				var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(planecvs.width/60,planecvs.height/60), resources.mtls.plrs.plns[i])
				plane.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(defaultiso))
				plane.position.set(plrxlats[i].px,-seseme['plr'+i].position.y-5,plrxlats[i].pz)
				plane.rotation.set(0,rads(plrxlats[i].pr),0); plane.name = 'plane'
				ele.add(plane) 
			//caption accompaniment
				var captioncvs = document.createElement( 'canvas' ), captionctx = captioncvs.getContext('2d') 
				var captiontex = new THREE.Texture(captioncvs); captiontex.needsUpdate = true;  
				captioncvs.width = captionctx.measureText(caption).width*11.5+200; captioncvs.height = planecvs.height; captionctx.scale(3,3); 
				captionctx.fillStyle = 'white'; captionctx.font = 'normal 500 16pt Fira Sans'; captionctx.textAlign = 'center'
				captionctx.fillText(capt,captioncvs.width/6,50)
				resources.mtls.plrs.plns[i].caption = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, map: captiontex})
				var caption = new THREE.Mesh(new THREE.PlaneBufferGeometry(captioncvs.width/60,captioncvs.height/60),
					resources.mtls.plrs.plns[i].caption); caption.rotation.x = defaultiso
				ele.getObjectByName('plane').add(caption); caption.position.set(0,3,-1)

				isoprev(facing) //onetimeonly
			//geo (for all close views)
		})

	}
	function behaviors(){
		controls = new THREE.OrbitControls(camera)
		window.addEventListener('deviceorientation', function(evt){
			gyro.rotation.y = rads(evt.gamma)/1.5
		})
		controls.addEventListener( 'change', function(){ 
			lights.rotation.set(-camera.rotation.x/2, camera.rotation.y + rads(45), -camera.rotation.z/2)

			facingRotations = [-45,45,135,-135]
			facingRotations.some(function(ele,i){
				if(Math.abs(degs(camera.rotation.y)-ele)<45){
					if(facing!=='plr'+i){
						console.log('facing diff plr') 
						if(perspective.height === 'isometric' && perspective.zoom === 'normal'){
							isoprev('plr'+i,facing)
						}
						facing = 'plr'+i

						if(perspective.zoom==='close'){
							perspective.zoomswitch = true
							addzoom = camera.zoom-thresholds.zoom[1]
							zoomswitchcallback = function(){perspective.zoomswitch = false}
							move(scene,{x:0,y:-(seseme[facing].position.y)*addzoom-(addzoom*4),z:0},100,70,'Quadratic','InOut',zoomswitchcallback)
						} 
					}
				return true }
			})
			deviation = degs(camera.rotation.y) - facingRotations[facing.replace('plr','')]

			height = degs(camera.rotation.x)>thresholds.height[0]?'elevation':degs(camera.rotation.x)<thresholds.height[1]?'plan':'isometric'
			zoom = camera.zoom>thresholds.zoom[1]? 'close' : camera.zoom<thresholds.zoom[0]? 'far' : 'normal'
			controls.zoomSpeed = 0.6-(Math.abs(camera.zoom-1)/5)
			console.log(controls.zoomSpeed)
			if(perspective.height!==height){
				view(height)
			}
			if(perspective.zoom!==zoom){
				zooming(zoom)
			}

			if(perspective.zoom==='close'&&perspective.zoomswitch===false){
				addzoom = camera.zoom-thresholds.zoom[1]
				scene.position.y = -(seseme[facing].position.y)*addzoom-(addzoom*4)
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