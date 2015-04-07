var scene = new THREE.Scene(), camera, renderer, controls
var resources = {geos: {}, mtls: {}}
var seseme = new THREE.Group(), ground
var lightrig

function setup(){
	cameraDomSetup()
	loadAssets()
	eventListeners()

function cameraDomSetup(){
	var aspect = window.innerWidth / window.innerHeight
	 
	var d = 20
	camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 0, 100 )
	camera.position.set( -d, 10, d )
	camera.rotation.order = 'YXZ'
	camera.rotation.y = - Math.PI / 4
	camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) )
	camera.updateProjectionMatrix()

	controls = new THREE.OrbitControls(camera)
	controls.damping = 5
	controls.addEventListener( 'change', render )

	var containerSESEME = document.getElementById("containerSESEME")
	renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
	renderer.setSize( window.innerWidth, window.innerHeight)
	containerSESEME.appendChild( renderer.domElement )
}//cameraDomSetup 	
function loadAssets(){
	var allModels = ['pedestal','pillarA','pillarB']
	var allTextures = ['grade_good','grade_ok','grade_bad','grade_awful']

	var resourceMgr = new THREE.LoadingManager()
	resourceMgr.itemStart('mdlMgr'); resourceMgr.itemStart('mtlMgr')
	resourceMgr.onLoad = function(){ console.log('all resources done'); buildScene()}

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

	function buildScene(){
		//one-time mtls (except orb)
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
			{type:'A',ry:0, pos:{x:-5,z:-5}},{type:'B',ry:0, pos:{x:-5,z:-5}},{type:'B',ry:90, pos:{x:-5,z:5}},{type:'A',ry:-90, pos:{x:5,z:-5}}
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
		lightrig = new THREE.Group()
		backlight = new THREE.SpotLight(0xeaddb9, 1.2)
	    backlight.position.set(-15,35,-10)
	  	amblight = new THREE.AmbientLight( 0x232330 )
	  	camlight = new THREE.SpotLight(0xffffff, .35)
	  	lightrig.add(backlight)
	  	lightrig.add(amblight) 
	  	lightrig.add(camlight)
	  	
	  	camlight.position.set(camera.position.x*2,camera.position.y-30,camera.position.z*-1.25)
	  	camlight.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshNormalMaterial()))
	  	backlight.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color: 0x000000})))
	  	lightrig.add(new THREE.Mesh(new THREE.PlaneBufferGeometry(5,5,5),new THREE.MeshNormalMaterial()))

	  	 //adding to scene
		scene.add(ground)
		scene.add(seseme)
		scene.add(lightrig)
		

	}//buildModel
}//assetLoader
function eventListeners(){
	window.addEventListener('deviceorientation', function(evt){
		// lightrig.rotation.y = rads(evt.gamma/1.5)
		lightrig.position.y = rads(evt.beta)*2
		lightrig.position.x = rads(evt.gamma)*2
		lightrig.position.z = -rads(evt.gamma)*2
		
	})
}

}//setup

function animate(){ 
    requestAnimationFrame( animate )
    controls.update()
    lightrig.rotation.set(-camera.rotation.x/2, camera.rotation.y + rads(45), -camera.rotation.z/2)
    render()
    TWEEN.update()
  } 
function render() { 
    renderer.render( scene, camera )
} 