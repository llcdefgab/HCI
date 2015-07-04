//用于绑定参照物对象
var target : Transform;
/*
var tapCountText:GameObject; 
var scoreText:GameObject; 
var xVecText:GameObject;  
var yVecText:GameObject;  
var zVecText:GameObject;
var touchVecText:GameObject;
var printText:GameObject;

*/

//缩放系数
private var distance = 26.0;
//左右滑动移动速度
private var xSpeed = 250.0;
private var ySpeed = 120.0;
//缩放限制系数
private var yMinLimit = -50;
private var yMaxLimit = 80;
//摄像头的位置
private var x = 0.0;
private var y = 0.0;

//记录上一次手机触摸位置判断用户是在左放大还是缩小手势
private var oldPosition1 : Vector2;
private var oldPosition2 : Vector2;
private var score=0;
  
  
private var axis: Transform;
private var xAxis: Transform;
private var yAxis: Transform;
private var zAxis: Transform;
private var xPlane: Transform;     //x
private var yPlane: Transform;    //y
private var zPlane: Transform;    //z

//x,y,z world position
private var oWorld = Vector3(0,0,0);
private var currWorld : Vector3;

//x,y,z screen position
private var oPoint: Vector2;
private var xPoint: Vector2;
private var yPoint: Vector2;
private var zPoint: Vector2;

//x,y,z screen vector
private var currScreen: Vector2;

private var lastPos0: Vector2;
private var lastPos1: Vector2;
private var currPos0: Vector2;
private var currPos1: Vector2;
private var touchVec: Vector2;
private var currIndex=0;
private var angVec=Vector3(0.0,0.0,0.0);

function World2Screen(v3:Vector3 ):Vector2{
    var p1=Camera.main.WorldToScreenPoint(oWorld);
    var p2=Camera.main.WorldToScreenPoint(v3);
    return (p2-p1).normalized; 
}

function showAxis(){
     for (var child : Transform in axis) {
        child.GetComponent.<Renderer>().enabled = true;
    }
}
function hideAxis(){
     for (var child : Transform in axis) {
        child.GetComponent.<Renderer>().enabled = false;
    }
}
function showBlueAxis(i:int){
    if(i==0){
        xAxis.GetComponent.<Renderer>().enabled = true;
        hideBlueAxis(1);
        hideBlueAxis(2);
    }else if(i==1){
        yAxis.GetComponent.<Renderer>().enabled = true;
        hideBlueAxis(0);
        hideBlueAxis(2);
    }else if(i==2){
        zAxis.GetComponent.<Renderer>().enabled = true;
        hideBlueAxis(0);
        hideBlueAxis(1);
    }
    hidePlane(3);
}
function hideBlueAxis(i:int){
    if(i==0){
        xAxis.GetComponent.<Renderer>().enabled = false;
    }else if(i==1){
        yAxis.GetComponent.<Renderer>().enabled = false;
    }else if(i==2){
        zAxis.GetComponent.<Renderer>().enabled = false;
    }else if(i==3){
        hideBlueAxis(0);
        hideBlueAxis(1);
        hideBlueAxis(2);
    }
}

function showPlane(i:int){
    if(i==0){
        xPlane.gameObject.SetActive(true);
        //xPlane.GetComponent.<Renderer>().enabled = true;
        hidePlane(1);
        hidePlane(2);
    }else if(i==1){
        yPlane.gameObject.SetActive(true);
        //yPlane.GetComponent.<Renderer>().enabled = true;
        hidePlane(0);
        hidePlane(2);
    }else if(i==2){
        zPlane.gameObject.SetActive(true);
        //zPlane.GetComponent.<Renderer>().enabled = true;
        hidePlane(0);
        hidePlane(1);
    }
    hideBlueAxis(3);
}

function hidePlane(i:int){
    if(i==0){
        xPlane.gameObject.SetActive(false);
        //xPlane.GetComponent.<Renderer>().enabled = false;
    }else if(i==1){
        yPlane.gameObject.SetActive(false);
        //yPlane.GetComponent.<Renderer>().enabled = false;
    }else if(i==2){
        zPlane.gameObject.SetActive(false);
        //zPlane.GetComponent.<Renderer>().enabled = false;
    }else if(i==3){
        hidePlane(0);
        hidePlane(1);
        hidePlane(2);
    }
}

private var frameCount=0;
private var ang = 5; 
private var transMode=0; //0 translate 1 rotate 2 scale 
private var meanDeltaLen=0;
private var meanCosTrans=0;
private var hasMoved = 0;
private var touch2Moved = 0;
private var touch2Tapped = 0;
private var ScreenVec: Vector2[]; 
private var WorldVec: Vector3[]; 
private var CosAxis=Vector3(0.0,0.0,0.0);        
private var transX=Vector3(0,0,0);
private var transY=Vector3(0,0,0);
private var transZ=Vector3(0,0,0);
private var targetScale=Vector3(0.0,0.0,0.0);


function targetInit(t:Transform){
    
    target=t;
    axis=t.GetChild(0).transform;
    var axisBlue=t.GetChild(1);
    xAxis=axisBlue.GetChild(0).transform;
    yAxis=axisBlue.GetChild(1).transform;
    zAxis=axisBlue.GetChild(2).transform;
    
    var plane=t.GetChild(2).transform;
    xPlane=plane.GetChild(0).transform;
    yPlane=plane.GetChild(1).transform;
    zPlane=plane.GetChild(2).transform;
    
    targetScale=target.localScale;
    
    showAxis();
}

function targetHide(){
    hideBlueAxis(3);
    hidePlane(3);
    //hideAxis();
}


function printTarget(t:Transform){
    var string=t.name;
    print(string);
    for(var i=0;i<t.childCount;i++){
        var c=t.GetChild(i);
        string+="\n"+c.name+": ";
        for(var j=0;j<c.childCount;j++){
            string+=c.GetChild(j).name+" ";    
        }
        
    }
    print(string);
    //printText.GetComponent(UI.Text).text = string;
}

function getParent(t:Transform): Transform{
    while(t.parent!=null){
        t=t.parent;
    }
    return t;
}

function Start () {
        
    targetInit(target);
    ScreenVec = new Vector2[3];
    WorldVec = new Vector3[3];
    hideAxis();
    hideBlueAxis(3);
    hidePlane(3);        
    
    var angles = transform.eulerAngles;
    x = angles.y;
    y = angles.x;
}
private var start=0;

function Update (){
    //tapCountText.GetComponent(UI.Text).text = "Tap Count: "+Input.touchCount;
    //scoreText.GetComponent(UI.Text).text = "Score: "+score;
    
    WorldVec[0]=target.right;
    WorldVec[1]=target.up;
    WorldVec[2]=target.forward;
        
    ScreenVec[0]=World2Screen(WorldVec[0]);
    ScreenVec[1]=World2Screen(WorldVec[1]);
    ScreenVec[2]=World2Screen(WorldVec[2]);
    
    //------------------ one finger ------------------
    if(Input.touchCount == 1){
        if(Input.GetTouch(0).phase==TouchPhase.Began){
            hasMoved = 0;
        }
        if(Input.GetTouch(0).phase==TouchPhase.Moved){
            //根据触摸点计算X与Y位置
            x += Input.GetAxis("Mouse X") * xSpeed * 0.02;
            y -= Input.GetAxis("Mouse Y") * ySpeed * 0.02;
            hasMoved=1;
        }
        if(Input.GetTouch(0).phase==TouchPhase.Ended){
            if(start==0){
                var ray : Ray = Camera.main.ScreenPointToRay(Input.GetTouch(0).position);
                 var hit : RaycastHit;
                 if (Physics.Raycast(ray, hit, 1000)) {
                    showAxis();
                    start=1;
                }else{
                    hideAxis();
                	score--;
            	}    
            }
                
        }    
    }
    
    //------------------ two fingers ------------------
    if(Input.touchCount == 2 ){
        var string = "";
        currPos0 = Input.GetTouch(0).position;
        currPos1 = Input.GetTouch(1).position;
        touchVec = currPos0-currPos1;
        var touchVecN=touchVec.normalized;
        
        if(Input.GetTouch(0).phase==TouchPhase.Began||Input.GetTouch(1).phase==TouchPhase.Began){
            frameCount=0;
            touch2Moved=0;
            
            CosAxis[0]=Mathf.Abs(touchVecN.x * ScreenVec[0][0]+touchVecN.y * ScreenVec[0][1]);
            CosAxis[1]=Mathf.Abs(touchVecN.x * ScreenVec[1][0]+touchVecN.y * ScreenVec[1][1]);
            CosAxis[2]=Mathf.Abs(touchVecN.x * ScreenVec[2][0]+touchVecN.y * ScreenVec[2][1]);
            if(CosAxis[0]>=CosAxis[1] && CosAxis[0]>=CosAxis[2]){//close to x axis
                currIndex=0;
            }else if(CosAxis[1]>=CosAxis[0] && CosAxis[1]>=CosAxis[2]){
                currIndex=1;
            }else if(CosAxis[2]>=CosAxis[0] && CosAxis[2]>=CosAxis[1]){
                currIndex=2;
            }
        }
        else if(Input.GetTouch(0).phase==TouchPhase.Moved || Input.GetTouch(1).phase==TouchPhase.Moved){
            
            
            touch2Moved=1;
            frameCount=frameCount+1;
            currScreen=ScreenVec[currIndex];
            currWorld=WorldVec[currIndex];
            var deltaLen=deltaLength(lastPos0,lastPos1,currPos0,currPos1);
            var deltaTrans = currPos0-lastPos0+currPos1-lastPos1;
			var deltaTransN = deltaTrans.normalized;
			var cosTrans = deltaTransN.x * currScreen.x + deltaTransN.y * currScreen.y;
			var crossTrans = deltaTransN.x * currScreen.y - deltaTransN.y * currScreen.x;                    
			var trans=currWorld*Time.deltaTime*12;                          
			CosAxis[0]=deltaTransN.x * ScreenVec[0][0]+deltaTransN.y * ScreenVec[0][1];
            CosAxis[1]=deltaTransN.x * ScreenVec[1][0]+deltaTransN.y * ScreenVec[1][1];
            CosAxis[2]=deltaTransN.x * ScreenVec[2][0]+deltaTransN.y * ScreenVec[2][1];
            var deltaTrans0 = (currPos0-lastPos0).normalized;
            var deltaTrans1 = (currPos1-lastPos1).normalized;
            var cosFinger = deltaTrans0.x * deltaTrans1.x+deltaTrans0.y * deltaTrans1.y;
            
               //plane
               if(touch2Tapped==1){
                   if(frameCount==1){
                    //if(Mathf.Abs(deltaLen)<12){
                    if(cosFinger>0){
                        transMode=0;
                    }else{
                        transMode=1;}
                    string+="\ntransMode: "+transMode;
                }
                else if(frameCount>1){
                    if(transMode==0){
                        //translate
                        CosAxis[currIndex]=0;
                        var transX=CosAxis[0]*WorldVec[0];
                        var transY=CosAxis[1]*WorldVec[1];
                        var transZ=CosAxis[2]*WorldVec[2];
                        target.position+=transX*Time.deltaTime*8;
                        target.position+=transY*Time.deltaTime*8;
                        target.position+=transZ*Time.deltaTime*8;
                       }
                       else if(transMode==1){
                           //scale                        
                           if(deltaLen>=0){
                               for(var i=0;i<3;i++){
                                   if(i!=currIndex){
                                       targetScale[i]+=0.1;
                                       if(targetScale[i]>8.0){
                                           targetScale[i]=8.0;
                                       }
                                   }
                               }
                           }
                           else{
                               for(var iter=0;iter<3;iter++){
                                   if(iter!=currIndex){
                                       targetScale[iter]-=0.1;
                                       if(targetScale[iter]<0.5){
                                           targetScale[iter]=0.5;
                                       }
                                   }
                               }
                           }
                           target.localScale=targetScale;
                       }
                   }
               }
               //axis
               if(touch2Tapped==0){
                if(frameCount==1){
                    showBlueAxis(currIndex);
                    if(cosFinger>0){
                        if(Mathf.Abs(cosTrans)>0.5*Mathf.Sqrt(2)){
                            transMode=0;
                        }else{
                            transMode=1;}
                    }else{ 
                        transMode=2;}
                }
                else if(frameCount>1){
                    if(transMode==0){
                        //translate
                           if(cosTrans>0){
                               target.position+=trans;
                           }else if(cosTrans<0){
                               target.position-=trans;
                           }
                       }
                       else if(transMode==1){
                           //rotation
                           if(crossTrans>0){
                               ang = -5;
                           }else{
                               ang =5;
                           }
                           var EularAng=Vector3(0,0,0);
                           EularAng[currIndex]=ang;
                           var rotateQ=Quaternion.Euler(EularAng[0],EularAng[1],EularAng[2]);
                           target.rotation*=rotateQ;
                           
                       }
                       else if(transMode==2){
                           //scale 
                           if(deltaLen>=0){
                               targetScale[currIndex]+=0.1;
                               if(targetScale[currIndex]>8.0){
                                   targetScale[currIndex]=8.0;
                               }
                           }
                           else{
                               targetScale[currIndex]-=0.1;
                               if(targetScale[currIndex]<0.5){
                                   targetScale[currIndex]=0.5;
                               }
                           }
                           target.localScale=targetScale;
                       }
                       
                }
            }
        }
        if(Input.GetTouch(0).phase==TouchPhase.Ended||Input.GetTouch(1).phase==TouchPhase.Ended){
            if(touch2Moved==0){
                touch2Tapped=1;
                showPlane(currIndex);
            }
            else if(touch2Tapped==1){
                touch2Tapped=0;
            }
        }
        
        string+="frameCount: "+frameCount;
        string += "\ntouch2Tapped: "+touch2Tapped;
        string += "\ntouch2Moved: "+touch2Moved;
        lastPos0=currPos0;
        lastPos1=currPos1;
        //printText.GetComponent(UI.Text).text = string;
    }
    else if(Input.touchCount==3){
        if(Input.GetTouch(0).phase==TouchPhase.Began||Input.GetTouch(1).phase==TouchPhase.Began||Input.GetTouch(2).phase==TouchPhase.Began){
            //var clone :Transform = Instantiate(target.gameObject, target.position, target.rotation).transform;
        }
    }
    
    
}

function deltaLength(oP1 : Vector2,oP2 : Vector2,nP1 : Vector2,nP2 : Vector2) : float{
    var leng1 =Mathf.Sqrt((oP1.x-oP2.x)*(oP1.x-oP2.x)+(oP1.y-oP2.y)*(oP1.y-oP2.y));
    var leng2 =Mathf.Sqrt((nP1.x-nP2.x)*(nP1.x-nP2.x)+(nP1.y-nP2.y)*(nP1.y-nP2.y));
    return leng2-leng1;
}
 
//Update方法一旦调用结束以后进入这里算出重置摄像机的位置
function LateUpdate () {
/*
    if (target) {        
        //重置摄像机的位置
         y = ClampAngle(y, yMinLimit, yMaxLimit);
        var rotation = Quaternion.Euler(y, x, 0);
        var position = rotation * Vector3(0.0, 0.0, -distance) + target.position;
        transform.rotation = rotation;
        transform.position = position;
    }
    //*/
}
 
static function ClampAngle (angle : float, min : float, max : float) {
    if (angle < -360)
        angle += 360;
    if (angle > 360)
        angle -= 360;
    return Mathf.Clamp (angle, min, max);
}




