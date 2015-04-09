var story = 0, part = 0

var scene = new THREE.Scene(), camera, renderer, controls, resources = {geos: {}, mtls: {}}
var seseme = new THREE.Group(), ground, lights, gyro
var plrmax = 12

var facing = 'plr0', perspective = {height: 'isometric', zoom: 'normal', zoomswitch: false}

function setup(){
	loader()

function loader(){
	var allModels = ['pedestal','pillarA','pillarB']
	var allTextures = ['grade_good','grade_ok','grade_bad','grade_awful']
	var resourceMgr = new THREE.LoadingManager()
	resourceMgr.itemStart('mdlMgr'); resourceMgr.itemStart('mtlMgr')
	resourceMgr.onLoad = function(){ 
		console.log('all resources done')
		query(); build(); fill(); behaviors(); display()
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
		camera.updateProjectionMatrix()
		var containerSESEME = document.getElementById("containerSESEME")
		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
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
	  	 //adding to scene
		scene.add(ground); scene.add(seseme); scene.add(gyro)
	}//build
	function fill(){
		if(stories[story].parts[part].valueType === 'smallerIsHigher'){
			var top = stories[story].parts[part].valueRange[0]; var bottom = stories[story].parts[part].valueRange[1]
		}else if(stories[story].parts[part].valueType === 'biggerIsHigher'){
			var top = stories[story].parts[part].valueRange[1]; var bottom = stories[story].parts[part].valueRange[0]
		}
		var range = Math.abs(bottom-top)
		stories[story].parts[part].pointValues.forEach(function(ele,i){
			seseme['plr'+i].position.y = Math.abs(bottom-ele)/range * plrmax
		})
	}
	function behaviors(){
		controls = new THREE.OrbitControls(camera)
		controls.damping = 5
		window.addEventListener('deviceorientation', function(evt){
			gyro.rotation.y = rads(evt.gamma)/1.5
		})
		controls.addEventListener( 'change', function(){ 
			lights.rotation.set(-camera.rotation.x/2, camera.rotation.y + rads(45), -camera.rotation.z/2)

			facingRotations = [-45,45,135,-135]
			facingRotations.some(function(ele,i){
				if(Math.abs(degs(camera.rotation.y)-ele)<45){
					if(facing!=='plr'+i){
						console.log('facing diff plr'); facing = 'plr'+i
						if(perspective.zoom==='close'){
							perspective.zoomswitch = true
							addzoom = camera.zoom-1.5
							zoomswitchcallback = function(){
								console.log('done tweening @ zoom switch')
								perspective.zoomswitch = false
							}
							move(scene,{x:0,y:-(seseme[facing].position.y)*addzoom-(addzoom*4),z:0},100,70,'Quadratic','InOut',zoomswitchcallback)
						} 
					}
				return true }
			})
			deviation = degs(camera.rotation.y) - facingRotations[facing.replace('plr','')]

			height = degs(camera.rotation.x)>-14?'elevation':degs(camera.rotation.x)<-40?'plan':'isometric'
			zoom = camera.zoom>1.5? 'close' : camera.zoom<.85? 'far' : 'normal'
			if(perspective.height!==height){console.log('changed perspective height'); perspective.height = height}
			if(perspective.zoom!==zoom){console.log('changed perspective zoom'); perspective.zoom = zoom}

			if(perspective.zoom==='close'&&perspective.zoomswitch===false){
				addzoom = camera.zoom-1.5
				scene.position.y = -(seseme[facing].position.y)*addzoom-(addzoom*4)
			}
		} )

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