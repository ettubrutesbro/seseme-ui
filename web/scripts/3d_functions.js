
    function onMouseMove(evt){ //mouse movements update X / Y pos
      evt.preventDefault()
      mouseLocation.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
      mouseLocation.y = - ( evt.clientY / window.innerHeight ) * 2 + 1;

     } // end onMouseMove
     function onMouseDown(evt){
      raycaster.setFromCamera(mouseLocation, camera)
      var intersects = raycaster.intersectObjects(pillargroup.children)
      if(intersects != ''){
        console.log(intersects)
        mouseTarget = intersects[0].object.name
      }
     }
     function onMouseUp(evt){

     
      raycaster.setFromCamera(mouseLocation, camera)
      var intersects = raycaster.intersectObjects(pillargroup.children)
      
      if(intersects!=''){
        console.log(intersects[0].object.name)
        if(intersects[0].object.name == mouseTarget){ //did you let go on the same pillar you started on?
          var index = (intersects[0].object.name).replace('pillar','') 
          console.log('begin at ' + seseme.rotation.y*(180/Math.PI))
          currentPosition.ry = seseme.rotation.y
          targetPosition.ry = rotationTargetArray[index-1]*(Math.PI / 180)

        
        oldRotation = seseme.rotation.y*(180/Math.PI)

        var rotationTween = new TWEEN.Tween(currentPosition)

        var update = function(){
          seseme.rotation.y = currentPosition.ry
        }

        rotationTween.to(targetPosition,750) 
        rotationTween.easing(TWEEN.Easing.Quadratic.Out)
        rotationTween.onUpdate(update)
        rotationTween.onComplete(function(){
          console.log('finished at ' + seseme.rotation.y*(180/Math.PI))
          newRotation = seseme.rotation.y*(180/Math.PI)
           if(oldRotation>newRotation){ //1>2, 2>4, etc
              console.log('you rotated backwards') 
            } else {
              console.log('you rotated forwards')//reconf. array to go pos
            }
        })
        rotationTween.start()
        hilightOn(index-1, false)
        

        } else { //didn't mousedown on a pillar to begin with
          console.log('no')
        }
      } // end if !undefined

     }


    function updateValues(){ //valarray[index] is updated,
      // causing pillar[index] to move by change over duration
        pillargroup.children.forEach(function(e,i){
        var index = (e.name).replace('pillar','')
        //need to convert the above into a number
        var pillarUpd = function(){
          e.position.y = pillarHeights[index-1].y
        }
        var pillarTween = new TWEEN.Tween(pillarHeights[index-1])
        pillarTween.to(pillarTargets[index-1],1200)
        pillarTween.onUpdate(pillarUpd)
        pillarTween.easing(TWEEN.Easing.Quadratic.InOut)
        pillarTween.start()
      })

    }

    function onDeviceOrient(evt){
      //debugInfo.textContent = evt.beta

    }

    function initTouchEvents(){
      var myElement = document.getElementById('containerSESEME')
      touchEvts = new Hammer(myElement)
      touchEvts.on('pan',function(evt){
        seseme.rotation.y-=(evt.velocity*uiScale)*(Math.PI/90)
      })
      touchEvts.on('panend',function(evt){
       
        var currentSpeed = {speed: evt.velocity*uiScale}
        var update = function(){
          seseme.rotation.y-=(currentSpeed.speed * (Math.PI/90)) 
        }
        rotationDeceleration = new TWEEN.Tween(currentSpeed)
        rotationDeceleration.to({speed: 0},700)
        rotationDeceleration.onUpdate(update)
        rotationDeceleration.easing(TWEEN.Easing.Quadratic.Out)
        rotationDeceleration.onComplete(function(){
           var finalRotate = seseme.rotation.y * (180/Math.PI)

           if(finalRotate < 0){
            var actRotation = 360 + finalRotate
            seseme.rotation.y = actRotation / (180/Math.PI)
            revolutionCount +=1
           }
           
           if(Math.abs(finalRotate/360) >= 1){
            console.log('abs value > 1')
            var numRevs = Math.abs(Math.floor(finalRotate/360))
            var actRotation = finalRotate-(numRevs*360)
            if(finalRotate < 0){
              actRotation = finalRotate+(numRevs*360)
            }
            seseme.rotation.y = actRotation / (180/Math.PI)
            revolutionCount +=1
           }

           console.log(seseme.rotation.y * (180/Math.PI))
           evaluateHighlight()
           if(revolutionCount>0){
            console.log(revolutionCount)
            //update value server-side with revolutionCount for this user
           }
        })
        rotationDeceleration.start()
      })
    }
    
    function cameraMove(zoom,zoomAmt,pan,panTgt){
      if(zoom){
        var currentZoom= {zoom: camera.zoom}
        var zoomSpd = (Math.abs(currentZoom.zoom - zoomAmt)) * 1000 + 200

        var updatezoom = function(){
          camera.zoom = currentZoom.zoom
          camera.updateProjectionMatrix()
        }
        var zoomTween = new TWEEN.Tween(currentZoom)
        zoomTween.to({zoom: zoomAmt},zoomSpd)
        zoomTween.easing(TWEEN.Easing.Cubic.Out)
        zoomTween.onUpdate(updatezoom)
        zoomTween.start()
      }

      if(pan){
        //var panTarget = {x: camera.position.x + panTgt.x, y: camera.position.y + panTgt.y}
        var pan = {x: camera.position.x, y: camera.position.y}
        var panTween = new TWEEN.Tween(pan)
        var updatepan = function(){
          camera.position.x = pan.x
          camera.position.y = pan.y
        }
        panTween.to(panTgt,1000)
        panTween.onUpdate(updatepan)
        panTween.easing(TWEEN.Easing.Cubic.Out)
        panTween.start()

      }
    }

    function lightDebug(){
      light.shadowCameraVisible = true
      if(debugState == 1){
        var newInfo = debugInput.textContent
        newInfo = newInfo.split(" ")
        console.log(newInfo)
        light.position.x = newInfo[0]
        light.position.y = newInfo[1]
        light.position.z = newInfo[2]
        light.target.position.set(newInfo[3],newInfo[4],newInfo[5])
        debugInfo.textContent = "x:" + light.position.x +
        " y:" + light.position.y + " z:" + light.position.z + 
        " px: " + light.target.position.x + " py:" + light.target.position.y +
        " pz:" + light.target.position.z
      }
    }

    function evaluateHighlight(target){
      console.log('evaluating')
     var rotationArray = [{min: 315, max: 45, dual: true},{min:226,max:314},{min:136,max:225},{min: 46, max:135}]
     var r = seseme.rotation.y * (180/Math.PI) 
     rotationArray.forEach(function(ele,i,arr){
    
      if(ele.dual==undefined){
        if(r>ele.min && r<ele.max){
          hilightOn(i, false)
        }
      }else{ //for the dual-sided 340-360, 0-20 case
        if(r>ele.min || r<ele.max){
          hilightOn(i, false)
        }
      }
     })
    }

    function hilightOn(target, clear){ 
      if(clear){
        if(selectedPillar != undefined){
          console.log("clearing")
          outlineArray.forEach(function(el){
            el.opacity = 0
          })
          selectedPillar = undefined
        }
      } else{
        console.log('turning on')
        if(selectedPillar != target || selectedPillar == undefined){
        
          var op = {opacity: 0}
          var opUpdate = function(){
            outlineArray[target].opacity = op.opacity
          }
          var opTween = new TWEEN.Tween(op)
          opTween.to({opacity: 1},500)
          opTween.easing(TWEEN.Easing.Quadratic.Out)
          opTween.onUpdate(opUpdate)
          opTween.start()
          outlineArray.forEach(function(el,i){
            if(i!=target){
              var elo = {opacity: el.opacity}
              var ftupd = function(){
                el.opacity = elo.opacity
              }
              var fadeTweens = new TWEEN.Tween(elo)
              fadeTweens.to({opacity: 0},350)
              fadeTweens.onUpdate(ftupd)
              fadeTweens.start()
            }
          })
          selectedPillar = target
        }else{ // same one
        }
      }
    }

    function breakdown(on, targetPillar, breakdownType){
      //use selectedPillar
      //get height

      //new cube geometries depending
      // start tweens for its height
    }