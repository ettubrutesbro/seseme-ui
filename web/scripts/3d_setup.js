    
    //3d.js: all three.js code for SESEME UI. 1) DISPLAY   2) ANIMATE   3) INTERACT

    //basic display 
    var scene = new THREE.Scene(), camera, renderer,
   
    //dividing loaded model into manipulable groups 
    seseme = new THREE.Group(), pedestal, pillargroup = new THREE.Group()

    //variables for INTERACT functions
    var raycaster
    var mouseLocation = new THREE.Vector2()
    var mouseTarget
    
    var rotationTargetArray = [360, 270, 180, 90]

    //variables for ANIMATION
    var currentPosition = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0}
    var targetPosition = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0}

    var pillarHeights = [{y:0},{y:0},{y:0},{y:0}]
    var pillarTargets = [{y:12},{y:12},{y:12},{y:12}]
    var outlineArray = []

    var selectedPillar

    //responsive prototype
     var dips = window.devicePixelRatio
      var uiScale = 1//Math.abs(((aspect*aspect) - aspect).toFixed(2))
      if(dips>2){
        uiScale=2.2
      }else if(dips<2){
        uiScale=0.5
      } //uiScale is there to make touch interactions that measure pixels
      //equal across multiple devices
    //debug

    //experimental variables
    var revolutionCount = 0


    //-----------------------------------------------
    // END GLOBAL VARIABLE DECLARATION
    //-----------------------------------------------
    //core functions setup scene and draw it every frame
    setup()
    animate() //render() is nested in here
    initTouchEvents()
    //lightDebug()


    // ------------------------------------------------------
    // SETUP FUNCTIONS: setup, aesthetic settings, and rendering
    // ------------------------------------------------------
    function setup(){
      var aspect = window.innerWidth / window.innerHeight
     
      var d = 20
      camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 5, 100 )
      camera.position.set( -19, 10, 20 )
      camera.rotation.order = 'YXZ'
      camera.rotation.y = - Math.PI / 4
      camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) )
      camera.zoom = .91
      camera.updateProjectionMatrix()

      //place the renderer(canvas) within DOM element (div)
      var container = document.getElementById("containerSESEME")
      renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
      //renderer.setClearColor{0xefefef, 0}
      renderer.shadowMapEnabled = true
      renderer.shadowMapType = THREE.PCFSoftShadowMap
      renderer.setSize( window.innerWidth, window.innerHeight)
      container.appendChild( renderer.domElement )

      //materials for seseme & orb (eventually need multiples for seseme?)
      var sesememtl = new THREE.MeshPhongMaterial({color: 0x80848e, 
        shininess: 21, specular: 0x9e6f49, emissive: 0x101011})
      var groundmtl = new THREE.MeshBasicMaterial({color: 0xededed})
      var orbmtl = new THREE.MeshPhongMaterial({color: 0x80848e, 
        shininess: 8, specular: 0x272727})
   

      //LIGHTING
      backlight = new THREE.SpotLight(0xeaddb9, 1.2)
      backlight.position.set(-15,75,-10)
      backlight.castShadow = true
      backlight.shadowDarkness = 0.2
      backlight.shadowMapWidth = 768 // default is 512
      backlight.shadowMapHeight = 768 // default is 512
      scene.add(backlight)

      var amblight = new THREE.AmbientLight( 0x232330 )
      scene.add(amblight)
     
      camlight = new THREE.SpotLight(0xffffff, .35)
      camlight.position.set(camera.position.x-25,camera.position.y-29,camera.position.z-30)     
      scene.add(camlight)

      // INTERACT setup -- event listener, initializing interact vars
      window.addEventListener( 'mousemove', onMouseMove, false)
      window.addEventListener( 'mouseup', onMouseUp, false)
      window.addEventListener( 'touchend', onMouseUp, false)
      window.addEventListener( 'mousedown', onMouseDown, false)
      window.addEventListener( 'deviceorientation', onDeviceOrient, false)
      //prevent touch scrolling
      document.body.addEventListener('touchmove', function(e){ e.preventDefault(); })

      mouseLocation = { x:0, y:0, z:1 }
      raycaster = new THREE.Raycaster()

      // EXTERNAL LOADING - getting .js 3d models into the canvas
      var pillar1, pillar2, pillar3, pillar4
      var loader = new THREE.JSONLoader()

      loader.load("assets/pedestal.js", function(geometry,evt){
        pedestal = new THREE.Mesh(geometry, sesememtl)
        pedestal.applyMatrix( new THREE.Matrix4().makeTranslation(1.5, 0, 1))
        pedestal.castShadow = true
        pedestal.name = "pedestal"
        seseme.add(pedestal)
      }) 
      loader.load("assets/pillarA.js", function(geometry,evt){
        pillar1 = new THREE.Mesh(geometry, sesememtl)
        pillar1.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
        pillar1.name = "pillar1"
        pillar1.castShadow = true
        pillargroup.add(pillar1)

        pillar4 = new THREE.Mesh(geometry, sesememtl)
        pillar4.applyMatrix( new THREE.Matrix4().makeTranslation( 5, 0, -5 ) )
        pillar4.rotation.y = -90 * Math.PI / 180
        pillar4.name = "pillar4"
        pillar4.castShadow = true
        setTimeout(function(){
          pillargroup.add(pillar4)
        },10) //this is awful and should not be
        loader.load("assets/pillarA_outline.js", function(g){
          outlineArray[0] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
          outlineArray[3] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
          var pillar1o = new THREE.Mesh(g, outlineArray[0])
          var pillar4o = new THREE.Mesh(g, outlineArray[3])
          pillar1.add(pillar1o)
          setTimeout(function(){
            pillar4.add(pillar4o)
          },50)
        })

      })
 

      loader.load("assets/pillarB.js", function(geometry,evt){
        pillar2 = new THREE.Mesh(geometry, sesememtl)
        pillar2.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, -5 ) )
        pillar2.name = "pillar2"
        pillar2.castShadow = true
        pillargroup.add(pillar2)

        pillar3 = new THREE.Mesh(geometry, sesememtl)
        pillar3.applyMatrix( new THREE.Matrix4().makeTranslation( -5, 0, 5 ) )
        pillar3.rotation.y = 90 * Math.PI / 180
        pillar3.castShadow = true
        pillar3.name = "pillar3"
        pillargroup.add(pillar3)
        loader.load("assets/pillarB_outline.js", function(g){
          outlineArray[1] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
          outlineArray[2] = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, color: 0xff0000, side: THREE.BackSide })
          var pillar2o = new THREE.Mesh(g, outlineArray[1])
          var pillar3o = new THREE.Mesh(g, outlineArray[2])
          pillar2.add(pillar2o)
          pillar3.add(pillar3o)
        })
      })


      seseme.add(pillargroup)

      //the orb is generated here (adjust segments for smooth)
      var orb = new THREE.Mesh( new THREE.SphereGeometry( 2.5, 7, 5 ), orbmtl )
      orb.name = "orb"
      orb.position.set(0,-3.75,0) //it's down but visible
      seseme.add(orb)  

      //groundplane
      var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry( 70, 70, 70 ), 
        groundmtl)
      ground.position.set(0,-17.7,0)
      ground.rotation.x = -90*(Math.PI/180)
      ground.receiveShadow = true
      scene.add(ground)

      scene.add(seseme)

      setTimeout(function(){updateValues()
      },800) //no idea why, but this only
      // works with a setTimeout that waits (even 10ms is enough) to fire it
    } //end setup

    function animate(){ //put 3d animations here
        requestAnimationFrame( animate )
        render()
        TWEEN.update()
      } // end animate

    function render() { 
        renderer.render( scene, camera )
    } // end render
