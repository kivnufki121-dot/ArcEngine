/* BLACKSITE: RAPTOR — Stage 1, sector A-01.
 * Self-contained ArcEngine/Babylon.js gameplay foundation.
 * No external assets or network calls.
 */
(() => {
'use strict';
const $=id=>document.getElementById(id), canvas=$('game');
const engine=new BABYLON.Engine(canvas,true,{stencil:false});
engine.setHardwareScalingLevel(Math.max(1,(devicePixelRatio||1)/1.5));
const scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(.025,.035,.043,1);
scene.ambientColor=new BABYLON.Color3(.16,.2,.22);
const hemi=new BABYLON.HemisphericLight('fill',new BABYLON.Vector3(0,1,0),scene);hemi.intensity=.72;
const light=new BABYLON.PointLight('emergency',new BABYLON.Vector3(0,4,0),scene);
light.diffuse=new BABYLON.Color3(.95,.3,.2);light.intensity=12;light.range=25;
const camera=new BABYLON.FreeCamera('third person shoulder camera',new BABYLON.Vector3(-10,3.3,14),scene);
camera.fov=.85;camera.minZ=.1;scene.activeCamera=camera;
const material=(name,hex,glow=0)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(hex);m.specularColor=new BABYLON.Color3(.07,.08,.09);if(glow)m.emissiveColor=m.diffuseColor.scale(glow);return m};
const wall=material('wall','#435653'),floor=material('floor','#273632'),steel=material('steel','#667b77'),dark=material('dark','#182725'),green=material('keycard','#65ffba',.75),red=material('locked','#e26150',.65),gold=material('save lamp','#d5bc7e',.6),heroMat=material('survivor','#90b2a8');
const colliders=[];
function block(name,x,y,z,w,h,d,mat,solid=false){
 const m=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
 m.position.set(x,y,z);m.material=mat;m.isPickable=solid;
 if(solid)colliders.push({x,z,w,d,active:true,name});
 return m;
}
block('concrete foundation',0,-.18,0,34,.35,30,floor);
block('north boundary',0,2,-15,34,4,.65,wall,true);
block('south boundary',0,2,15,34,4,.65,wall,true);
block('west boundary',-17,2,0,.65,4,30,wall,true);
block('east boundary',17,2,0,.65,4,30,wall,true);
// Four rooms surrounding a central corridor; door gaps face corridor.
for(const z of [-7,7]){
 // Partition segments leave wide traversable doorways near the centre and outer edges.
 for(const x of [-12,12])block('room partition',x,2,z,7,4,.45,wall,true);
}
for(const x of [-2.4,2.4]){
 block('corridor edge',x,2,-11,.4,4,5,wall,true);
 block('corridor edge',x,2,11,.4,4,5,wall,true);
}
for(const x of [-13,13])for(const z of [-11,11]){
 block('workstation',x,1,z,2.5,2,1.4,steel,true);
 block('workstation screen',x,2.15,z,.9,.3,.2,green);
}
const door=block('exit door',0,1.8,-14.45,3.6,3.6,.35,red);
const doorCollider={x:0,z:-14.45,w:3.6,d:.5,active:true,name:'exit door'};colliders.push(doorCollider);
const key=block('access keycard',-11,.75,10,1,.12,.6,green);
const terminal=block('power terminal',10,1.4,-11,1.4,2,.8,steel);
block('terminal screen',10,2.15,-10.5,.9,.55,.09,green);
const save=block('save station',-11,1,-11,1.6,2,1,steel);
block('save station light',-11,2.1,-11,1,.15,.4,gold);
// Sector A-01 visual pass (v0.3): all scenery is non-colliding, preserving the tested routes.
const hazard=material('warning amber','#ffad46',.72);
const cold=material('clinical light','#a5eaff',.9);
const glass=material('smoked display glass','#12323a',.2);
const pipe=material('utility conduit','#263b41');
const trim=material('panel seam','#111d21');
const beacon=material('alarm lens','#ff493e',.85);
const emergencyLamps=[];
for(const z of [-12,-6,0,6,12]){
 // Ceiling light banks and inset corridor runners.
 block('ceiling rail',0,3.85,z,4.5,.16,.22,steel);
 for(const x of [-1.65,1.65]){
  block('ceiling diffuser',x,3.72,z,.27,.08,1.6,cold);
  block('floor guide strip',x,.025,z,.065,.045,2.3,cyan);
 }
}
for(const x of [-15.7,15.7]){
 for(const z of [-10,0,10]){
  block('service pipe',x,3.32,z,.14,.14,7.5,pipe);
  block('conduit bracket',x,3.26,z,.38,.2,.16,steel);
  block('wall warning stripe',x,1.12,z,.09,.14,3.2,hazard);
  block('wall identification panel',x,2.2,z,.10,.65,1.2,glass);
 }
}
for(const z of [-14.55,14.55]){
 for(const x of [-11,-5,5,11]){
  block('wall reinforcement',x,2,z,.25,3.7,.2,steel);
  block('lower wall inset',x,.8,z,.9,.75,.12,dark);
  block('upper wall accent',x,3.35,z,.75,.06,.12,trim);
 }
}
for(const [x,z] of [[-13,-11],[13,-11],[-13,11],[13,11]]){
 block('workstation desk inset',x,2.04,z,1.65,.1,1.1,dark);
 block('diagnostic monitor',x,2.43,z,.85,.48,.12,glass);
 block('monitor status bar',x,2.39,z-.07,.64,.045,.15,cyan);
 block('keyboard',x,2.09,z-.46,.66,.05,.24,trim);
}
for(const [x,z] of [[-8,-14.48],[8,-14.48],[-8,14.48],[8,14.48]]){
 block('emergency beacon housing',x,3.24,z,.55,.25,.2,dark);
 const lens=block('pulsing alarm beacon',x,3.23,z-.13,.36,.13,.12,beacon);
 emergencyLamps.push(lens);
}
for(const [x,z] of [[-5,-13.7],[5,-13.7],[-5,13.7],[5,13.7]]){
 block('wall-mounted emergency kit',x,1.5,z,.75,.8,.3,steel);
 block('kit cross vertical',x,1.5,z-.17,.1,.48,.04,red);
 block('kit cross horizontal',x,1.5,z-.18,.4,.1,.04,red);
}
block('exit frame top',0,3.78,-14.3,4.2,.3,.55,steel);
for(const x of [-2.1,2.1])block('exit frame pillar',x,1.85,-14.3,.3,3.7,.55,steel);
block('exit warning indicator',0,3.48,-14.01,1.1,.16,.09,hazard);
const atmosphereLight=new BABYLON.PointLight('cold corridor fill',new BABYLON.Vector3(0,3.5,1),scene);
atmosphereLight.diffuse=new BABYLON.Color3(.4,.75,1);
atmosphereLight.intensity=2.8;atmosphereLight.range=18;
const farLight=new BABYLON.PointLight('storage fill',new BABYLON.Vector3(-10,3.1,8),scene);
farLight.diffuse=new BABYLON.Color3(.35,.85,.88);farLight.intensity=2.2;farLight.range=12;
// Version 1.03: self-contained survival encounter (no downloaded assets).
const predatorBody=material('raptor feather coat','#596a58'),predatorBelly=material('raptor underside','#9a9973'),predatorEye=material('raptor eye','#e9a943',.8);
const predatorRoot=new BABYLON.TransformNode('feathered dromaeosaur',scene);
function predatorPart(name,w,h,d,x,y,z,mat,parent=predatorRoot){
 const m=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
 m.parent=parent;m.position.set(x,y,z);m.material=mat;m.isPickable=false;return m;
}
predatorPart('torso',.78,.66,1.48,0,.98,0,predatorBody);
predatorPart('neck',.43,.7,.45,0,1.4,-.58,predatorBody);
predatorPart('skull',.43,.32,.66,0,1.69,-.9,predatorBody);
predatorPart('snout',.32,.16,.5,0,1.56,-1.32,predatorBelly);
for(const side of [-1,1]){
 predatorPart('eye',.09,.09,.09,side*.23,1.75,-1.02,predatorEye);
 predatorPart('wing feathers',.16,.38,.92,side*.46,1.08,.05,predatorBelly);
 predatorPart('thigh',.28,.7,.33,side*.28,.57,.37,predatorBody);
 predatorPart('shin',.14,.48,.18,side*.28,.25,.08,predatorBelly);
 predatorPart('sickle claw',.16,.11,.35,side*.28,.08,-.18,predatorEye);
}
for(let i=0;i<5;i++)predatorPart('tail feather',.13,.13,.55,(i-2)*.12,1.1,.9+i*.25,predatorBody);
const predator={x:10,z:9,angle:0,state:'patrol',health:100,attackTimer:0,alert:0,patrolIndex:0};
const patrolPoints=[[10,9],[9,3],[12,-2],[7,5]];
const pickups=[
 {x:-8,z:-8,type:'ammo',amount:8,mesh:null},
 {x:8,z:8,type:'ammo',amount:8,mesh:null},
 {x:-8,z:8,type:'med',amount:1,mesh:null},
 {x:9,z:-7,type:'med',amount:1,mesh:null}
];
for(const item of pickups){
 item.mesh=block(item.type==='ammo'?'ammunition crate':'medical supplies',item.x,.36,item.z,.65,.5,.55,item.type==='ammo'?hazard:green);
}
const survival={health:100,ammo:12,reserve:16,medkits:1,shots:0,story:false,won:false,gameOver:false,shootHeld:false,reloadHeld:false,healHeld:false,inventoryHeld:false,inventoryOpen:false,fireCooldown:0,reloadTimer:0,enemyNotice:0};
const overlay=document.createElement('div');
overlay.style.cssText='position:absolute;right:22px;top:20px;padding:13px 17px;background:#061313d9;border:1px solid #50756a;color:#d9f8e7;font:14px/1.65 system-ui;white-space:pre-line;pointer-events:none;text-shadow:0 1px 2px black;max-width:290px';
document.body.appendChild(overlay);
const radio=document.createElement('div');
radio.style.cssText='position:absolute;left:50%;bottom:23%;transform:translateX(-50%);padding:9px 16px;background:#0a1616d9;color:#c8f8ef;border-left:3px solid #59cfcb;max-width:75vw;text-align:center;font:14px/1.5 system-ui;pointer-events:none;display:none';
document.body.appendChild(radio);
let radioTime=0;
function broadcast(msg,seconds=5){radio.textContent=msg;radio.style.display='block';radioTime=seconds}
function collectNearby(){
 for(const item of pickups){
  if(item.mesh.isEnabled()&&near(item.x,item.z,1.65)){
   if(item.type==='ammo'){survival.reserve+=item.amount;notify('ПАТРОНЫ +'+item.amount)}
   else{survival.medkits+=item.amount;notify('АПТЕЧКА +1')}
   item.mesh.setEnabled(false);return true;
  }
 }
 return false;
}
function fireWeapon(){
 if(survival.fireCooldown>0||survival.reloadTimer>0||survival.gameOver||survival.won)return;
 if(survival.ammo<=0){notify('НЕТ ПАТРОНОВ — R / Y ПЕРЕЗАРЯДКА');return}
 survival.ammo--;survival.shots++;survival.fireCooldown=.28;
 const forwardX=Math.sin(shoulderYaw),forwardZ=Math.cos(shoulderYaw);
 const dx=predator.x-player.x,dz=predator.z-player.z;
 const dist=Math.hypot(dx,dz);
 if(predator.health>0&&dist<18&&(dx*forwardX+dz*forwardZ)/Math.max(.01,dist)>.92){
  predator.health=Math.max(0,predator.health-34);
  predator.alert=8;notify(predator.health===0?'ХИЩНИК ОБЕЗВРЕЖЕН':'ПОПАДАНИЕ!',.9);
 }
 else notify('ВЫСТРЕЛ',.3);
}
function updateSurvival(dt,p,button,running,crouch,length){
 const keyFire=pressed('MouseLeft')||button(7)||pressed('KeyF');
 if(keyFire&&!survival.shootHeld)fireWeapon();
 survival.shootHeld=keyFire;
 const keyReload=pressed('KeyR')||button(3);
 if(keyReload&&!survival.reloadHeld&&survival.ammo<12&&survival.reserve>0&&survival.reloadTimer<=0){survival.reloadTimer=1.1;notify('ПЕРЕЗАРЯДКА',1.1)}
 survival.reloadHeld=keyReload;
 const keyHeal=pressed('KeyH')||button(4);
 if(keyHeal&&!survival.healHeld&&survival.medkits>0&&survival.health<100){survival.medkits--;survival.health=Math.min(100,survival.health+55);notify('ЗДОРОВЬЕ ВОССТАНОВЛЕНО')}
 survival.healHeld=keyHeal;
 const keyInventory=pressed('KeyI')||button(8);
 if(keyInventory&&!survival.inventoryHeld)survival.inventoryOpen=!survival.inventoryOpen;
 survival.inventoryHeld=keyInventory;
 survival.fireCooldown=Math.max(0,survival.fireCooldown-dt);
 if(survival.reloadTimer>0){survival.reloadTimer-=dt;if(survival.reloadTimer<=0){const count=Math.min(12-survival.ammo,survival.reserve);survival.ammo+=count;survival.reserve-=count;notify('ОРУЖИЕ ЗАРЯЖЕНО',.7)}}
 if(predator.health>0&&!survival.gameOver&&!survival.won){
  const dx=player.x-predator.x,dz=player.z-predator.z,dist=Math.hypot(dx,dz);
  const detect=running?11:crouch?4.2:7;
  if(dist<detect||survival.fireCooldown>.20)predator.alert=Math.max(predator.alert,6);
  predator.alert=Math.max(0,predator.alert-dt);
  predator.state=predator.alert>0?'chase':'patrol';
  let tx,tz;
  if(predator.state==='chase'){tx=player.x;tz=player.z}
  else{[tx,tz]=patrolPoints[predator.patrolIndex];if(Math.hypot(tx-predator.x,tz-predator.z)<.7)predator.patrolIndex=(predator.patrolIndex+1)%patrolPoints.length}
  const vx=tx-predator.x,vz=tz-predator.z,vlen=Math.hypot(vx,vz);
  if(vlen>.5){
   const speed=predator.state==='chase'?2.35:1.15;
   const step=Math.min(vlen,speed*dt);
   predator.x+=vx/vlen*step;predator.z+=vz/vlen*step;
   predator.angle=Math.atan2(-vx,-vz);
  }
  predator.attackTimer=Math.max(0,predator.attackTimer-dt);
  if(dist<1.5&&predator.attackTimer<=0){
   survival.health=Math.max(0,survival.health-(dodgeTime>0?0:22));
   predator.attackTimer=1.3;notify(dodgeTime>0?'АТАКА УКЛОНЕНА':'ХИЩНИК АТАКУЕТ!',1);
   if(survival.health<=0){survival.gameOver=true;active=false;intro.style.display='flex';broadcast('СВЯЗЬ ПОТЕРЯНА. Нажмите «НОВАЯ ИГРА», чтобы начать заново.',15)}
  }
 }
 predatorRoot.setEnabled(predator.health>0);
 predatorRoot.position.set(predator.x,0,predator.z);
 predatorRoot.rotation.y=predator.angle;
 if(radioTime>0){radioTime-=dt;if(radioTime<=0)radio.style.display='none'}
 overlay.textContent='ЗДОРОВЬЕ  '+survival.health+'%\nПИСТОЛЕТ  '+survival.ammo+' / '+survival.reserve+'\nАПТЕЧКИ  '+survival.medkits+'\nУГРОЗА  '+(predator.health<=0?'НЕЙТРАЛИЗОВАНА':predator.state==='chase'?'ОБНАРУЖЕНА':'НЕИЗВЕСТНА')+(survival.inventoryOpen?'\n\nИНВЕНТАРЬ\nКлюч-карта: '+(player.key?'есть':'нет')+'\nПитание шлюза: '+(player.power?'включено':'нет')+'\nR / Y — перезарядка\nH / LB — аптечка\nF / RT — стрелять':'');
}
document.addEventListener('mousedown',e=>{if(e.button===0)controls.add('MouseLeft')});
document.addEventListener('mouseup',e=>{if(e.button===0)controls.delete('MouseLeft')});
// Stylized low-poly playable heroine based on the supplied front/side/back turnaround.
// Geometry-only preview: detailed mesh, skinning, hair strands and cloth simulation come later.
const character=new BABYLON.TransformNode('heroine root',scene);
const suit=material('black armored suit','#15131f'),armor=material('violet armor','#272237');
const neon=material('magenta luminous piping','#ff2b9f',.95),cyan=material('cyan accessories','#18d9f4',.9);
const skin=material('skin','#e5b4ac'),hair=material('black violet hair','#16152d'),hairPurple=material('purple hair','#8c35d6'),hairBlue=material('blue hair','#176bd0');
const boot=material('heavy boots','#15131b');
function heroBox(name,w,h,d,x,y,z,mat,parent=character){
 const mesh=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
 mesh.parent=parent;mesh.position.set(x,y,z);mesh.material=mat;mesh.isPickable=false;return mesh;
}
function heroBall(name,diameter,x,y,z,mat,parent=character){
 const mesh=BABYLON.MeshBuilder.CreateSphere(name,{diameter,segments:10},scene);
 mesh.parent=parent;mesh.position.set(x,y,z);mesh.material=mat;mesh.isPickable=false;return mesh;
}
// Additional layered armor and readable silhouette for the playable prototype.
const underArmor=material('flexible undersuit','#211e2c');
const visor=material('violet eye makeup','#392943');
const metalEdge=material('brushed gunmetal','#454654');
const torso=heroBox('armored torso',.61,.72,.34,0,1.38,0,suit);
heroBox('segmented abdomen',.42,.33,.35,0,1.08,-.015,underArmor);
for(const x of [-.15,.15]){
 heroBox('rib plate',.21,.18,.4,x,1.42,-.025,armor);
 heroBox('upper chest plate',.21,.15,.405,x,1.61,-.035,armor);
 heroBox('belt buckle',.12,.12,.36,x,1.00,-.03,metalEdge);
}
heroBox('backpack frame',.37,.56,.13,0,1.38,.26,metalEdge);
heroBox('backpack power cell',.23,.36,.15,0,1.38,.35,cyan);
heroBox('utility belt',.53,.11,.37,0,.96,0,metalEdge);
heroBox('left hip pouch',.18,.22,.22,-.31,.83,0,armor);
heroBox('right hip pouch',.18,.22,.22,.31,.83,0,armor);
heroBox('left armored shoulder',.24,.23,.38,-.39,1.74,0,armor);
heroBox('right armored shoulder',.24,.23,.38,.39,1.74,0,armor);
heroBox('chest armor',.53,.27,.38,0,1.55,-.02,armor);
heroBox('waist',.43,.3,.31,0,.97,0,suit);
heroBall('head',.33,0,2.03,-.01,skin);
heroBox('left eyebrow',.10,.018,.02,-.075,2.08,-.168,visor);
heroBox('right eyebrow',.10,.018,.02,.075,2.08,-.168,visor);
heroBall('left eye',.037,-.074,2.04,-.165,cyan);
heroBall('right eye',.037,.074,2.04,-.165,cyan);
heroBox('neck guard',.24,.12,.24,0,1.84,.01,armor);
heroBox('dark hair crown',.37,.19,.36,0,2.23,.025,hair);
heroBall('high ponytail base',.24,0,2.35,.15,hair);
const hairStrands=[];
for(let i=0;i<8;i++){
 const x=(i-3.5)*.055;
 const strand=heroBox('long ponytail strand',.045,1.17,.065,x,1.65,.26,i%3===0?hairBlue:i%3===1?hairPurple:hair);
 strand.rotation.z=(i-3.5)*.06;
 hairStrands.push(strand);
}
const leftArm=new BABYLON.TransformNode('left arm pivot',scene),rightArm=new BABYLON.TransformNode('right arm pivot',scene);
const leftLeg=new BABYLON.TransformNode('left leg pivot',scene),rightLeg=new BABYLON.TransformNode('right leg pivot',scene);
for(const [pivot,x,y] of [[leftArm,-.39,1.67],[rightArm,.39,1.67],[leftLeg,-.17,.87],[rightLeg,.17,.87]]){pivot.parent=character;pivot.position.set(x,y,0)}
for(const [pivot,side] of [[leftArm,-1],[rightArm,1]]){
 heroBox('armored sleeve',.18,.54,.19,0,-.31,0,suit,pivot);
 heroBox('glove',.17,.21,.19,0,-.68,0,boot,pivot);
 heroBox('glowing arm accent',.045,.43,.21,side*.105,-.32,0,neon,pivot);
 heroBox('wrist tech',.18,.22,.22,0,-.53,-.025,cyan,pivot);
}
for(const [pivot,side] of [[leftLeg,-1],[rightLeg,1]]){
 heroBox('leg armor',.23,.65,.26,0,-.35,0,suit,pivot);
 heroBox('knee guard',.25,.21,.3,0,-.65,-.035,armor,pivot);
 heroBox('heavy boot',.29,.36,.4,0,-.92,-.075,boot,pivot);
 heroBox('boot toe armor',.3,.1,.21,0,-1.035,-.23,metalEdge,pivot);
 heroBox('leg neon seam',.045,.51,.275,side*.13,-.34,0,neon,pivot);
 heroBox('boot light',.21,.055,.41,0,-1.04,-.08,cyan,pivot);
}
heroBox('chest neon left',.055,.52,.37,-.25,1.43,-.005,neon);
heroBox('chest neon right',.055,.52,.37,.25,1.43,-.005,neon);
heroBox('chest cyan badge',.23,.08,.4,0,1.73,-.02,cyan);
let walkCycle=0,walkBlend=0,crouchBlend=0;
const player={x:-10,z:10,heading:0,key:false,power:false,door:false,stamina:100,crouch:false,alive:true};
const controls=new Set();
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();controls.add(e.code)});
addEventListener('keyup',e=>controls.delete(e.code));
addEventListener('blur',()=>controls.clear());
const pressed=k=>controls.has(k);
let active=false,prevAction=false,prevDodge=false,prevSave=false,notice='',noticeTime=0,clock=0,frames=0,fps=0,fpstime=0,dodgeTime=0,dodgeCooldown=0;
let shoulderYaw=Math.PI,shoulderPitch=.2;
canvas.addEventListener('click',()=>{if(active&&document.pointerLockElement!==canvas)canvas.requestPointerLock?.()});
document.addEventListener('mousemove',e=>{if(active&&document.pointerLockElement===canvas){shoulderYaw+=e.movementX*.0025;shoulderPitch=clamp(shoulderPitch-e.movementY*.002,-.35,.65)}});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const near=(x,z,r=2.3)=>Math.hypot(player.x-x,player.z-z)<r;
const notify=(s,t=2.8)=>{notice=s;noticeTime=t};
const gamepad=()=>{const p=navigator.getGamepads?.();return p?Array.from(p).find(x=>x&&x.connected&&x.mapping==='standard'):null};
const dz=x=>Math.abs(x)<.16?0:Math.sign(x)*(Math.abs(x)-.16)/.84;
function passable(x,z){
 if(x<-16.4||x>16.4||z<-14.3||z>14.3)return false;
 return !colliders.some(c=>c.active&&Math.abs(x-c.x)<c.w/2+.38&&Math.abs(z-c.z)<c.d/2+.38);
}
function move(dx,dz){
 if(passable(player.x+dx,player.z))player.x+=dx;
 if(passable(player.x,player.z+dz))player.z+=dz;
}
// Single third-person shoulder camera; no fixed camera zones or toggles.
function updateCamera(dt){
 const distance=4.0,side=.65;
 const sy=Math.sin(shoulderYaw),cy=Math.cos(shoulderYaw);
 const desired=new BABYLON.Vector3(player.x-sy*distance+cy*side,2.35+Math.sin(shoulderPitch)*2.0,player.z-cy*distance-sy*side);
 // Keep camera inside the current room when a wall blocks the desired position.
 const focus=new BABYLON.Vector3(player.x,1.45,player.z);
 const ray=desired.subtract(focus);
 const hit=scene.pickWithRay(new BABYLON.Ray(focus,ray.normalize(),ray.length()),mesh=>mesh.isPickable&&mesh!==character);
 const target=hit?.hit?focus.add(ray.normalize().scale(Math.max(.75,hit.distance-.2))):desired;
 camera.position=BABYLON.Vector3.Lerp(camera.position,target,Math.min(1,dt*12));
 camera.setTarget(new BABYLON.Vector3(player.x+sy*2.6,1.35+Math.sin(shoulderPitch)*2.2,player.z+cy*2.6));
}
function load(){
 try{
  const data=JSON.parse(localStorage.getItem('blacksite-raptor-stage1-v1')||'null');
  if(!data||data.version!==1)return false;
  if(data.survival){Object.assign(survival,{health:data.survival.health??100,ammo:data.survival.ammo??12,reserve:data.survival.reserve??16,medkits:data.survival.medkits??1});predator.health=data.survival.predatorHealth??100;predator.x=data.survival.predatorX??10;predator.z=data.survival.predatorZ??9;for(let i=0;i<pickups.length;i++)pickups[i].mesh.setEnabled(!data.survival.collected?.includes(i))}
  Object.assign(player,{x:data.x,z:data.z,key:!!data.key,power:!!data.power,door:!!data.door,stamina:100});
  if(!passable(player.x,player.z)){player.x=-10;player.z=10}
  sync();notify('ПРОГРЕСС ЗАГРУЖЕН');return true;
 }catch(e){notify('НЕ УДАЛОСЬ ЗАГРУЗИТЬ СОХРАНЕНИЕ');return false}
}
function sync(){
 key.setEnabled(!player.key);door.setEnabled(!player.door);doorCollider.active=!player.door;
}
function saveProgress(){
 try{
  localStorage.setItem('blacksite-raptor-stage1-v1',JSON.stringify({version:1,x:player.x,z:player.z,key:player.key,power:player.power,door:player.door,survival:{health:survival.health,ammo:survival.ammo,reserve:survival.reserve,medkits:survival.medkits,predatorHealth:predator.health,predatorX:predator.x,predatorZ:predator.z,collected:pickups.flatMap((item,i)=>item.mesh.isEnabled()?[]:[i])}}));
  notify('СОХРАНЕНО В БЕЗОПАСНОЙ КОМНАТЕ');
 }catch(e){notify('СОХРАНЕНИЕ НЕДОСТУПНО')}
}
function interact(){
 if(collectNearby())return;
 if(!player.key&&near(-11,10)){player.key=true;sync();notify('ПОЛУЧЕНА КЛЮЧ-КАРТА');return}
 if(near(10,-11)){if(!player.key){notify('ТРЕБУЕТСЯ КЛЮЧ-КАРТА');return}player.power=true;notify('ПИТАНИЕ ШЛЮЗА ВОССТАНОВЛЕНО');return}
 if(near(-11,-11)){saveProgress();return}
 if(near(0,-13,3.4)){
  if(!player.key||!player.power){notify('ШЛЮЗ ЗАБЛОКИРОВАН: НУЖНЫ КЛЮЧ И ПИТАНИЕ');return}
  player.door=true;survival.won=true;sync();notify('ШЛЮЗ ОТКРЫТ. ЭТАП 1 ПРОЙДЕН!',8);broadcast('ОПЕРАТОР: Вы вышли из сектора A-01. Но связь с островом прервана...',12);return;
 }
 notify('ПОБЛИЗОСТИ НЕТ ИНТЕРАКТИВНЫХ ОБЪЕКТОВ',1.4);
}
function update(dt){
 // Deterministic, subtle emergency lighting pulse, no gameplay dependency.
 const pulse=.83+.17*Math.sin(performance.now()*.0035);
 light.intensity=10+2.5*pulse;
 beacon.emissiveColor=new BABYLON.Color3(.8,.12,.09).scale(.7+.3*pulse);
 const p=gamepad(),button=i=>!!p?.buttons[i]?.pressed;
 if(survival.gameOver){updateSurvival(dt,p,button,false,false,0);updateCamera(dt);return}
 // Left stick / WASD moves relative to the shoulder camera.
 let mx=Number(pressed('KeyD')||pressed('ArrowRight'))-Number(pressed('KeyA')||pressed('ArrowLeft'))+dz(p?.axes[0]||0);
 let mz=Number(pressed('KeyS')||pressed('ArrowDown'))-Number(pressed('KeyW')||pressed('ArrowUp'))+dz(p?.axes[1]||0);
 const length=Math.hypot(mx,mz);if(length>1){mx/=length;mz/=length}
 shoulderYaw+=dz(p?.axes[2]||0)*dt*2.6;
 shoulderPitch=clamp(shoulderPitch-dz(p?.axes[3]||0)*dt*1.5,-.35,.65);
 const sx=mx,sz=mz,sy=Math.sin(shoulderYaw),cy=Math.cos(shoulderYaw);
 // Camera-relative basis: right=(cos(yaw), 0, -sin(yaw)), forward=(sin(yaw), 0, cos(yaw)).
 // Keyboard W and Xbox stick up produce sz=-1; hence subtract forward * sz.
 mx=cy*sx-sy*sz;
 mz=-sy*sx-cy*sz;
 const crouch=pressed('ControlLeft')||pressed('ControlRight')||button(1);
 const running=(pressed('ShiftLeft')||pressed('ShiftRight')||button(10))&&!crouch&&player.stamina>1;
 const dodge=pressed('Space')||button(2);
 if(dodge&&!prevDodge&&dodgeCooldown<=0&&player.stamina>=20){dodgeTime=.18;dodgeCooldown=.8;player.stamina-=20;notify('УКЛОНЕНИЕ',.35)}
 prevDodge=dodge;
 dodgeTime=Math.max(0,dodgeTime-dt);dodgeCooldown=Math.max(0,dodgeCooldown-dt);
 const speed=dodgeTime>0?8.5:crouch?1.35:running?5.3:3.1;
 move(mx*speed*dt,mz*speed*dt);
 player.stamina=clamp(player.stamina+(running&&length>.1?-23:16)*dt,0,100);
 player.crouch=crouch;
 // Aim-locked facing: left/right strafe and backward movement never rotate the heroine.
 // The modeled face points toward local -Z, so yaw equals the shoulder camera yaw.
 player.heading=shoulderYaw;
 character.position.set(player.x,0,player.z);
 // Keep the approved aim-locked orientation and camera-relative controls unchanged.
 character.rotation.y=shoulderYaw+Math.PI;
 const blend=Math.min(1,dt*10);
 walkBlend+=(Math.min(1,length)-walkBlend)*blend;
 crouchBlend+=((crouch?1:0)-crouchBlend)*blend;
 character.scaling.y=1-crouchBlend*.28;
 const pace=running?12:8;
 walkCycle+=dt*pace*Math.max(.15,walkBlend);
 const gaitDirection=sz>.15?-1:1;
 const stride=Math.sin(walkCycle)*.5*walkBlend*gaitDirection;
 const strafe=Math.max(-1,Math.min(1,sx));
 leftLeg.rotation.x=stride;
 rightLeg.rotation.x=-stride;
 leftLeg.rotation.z=-strafe*.13*walkBlend;
 rightLeg.rotation.z=-strafe*.13*walkBlend;
 leftArm.rotation.x=-stride*.7;
 rightArm.rotation.x=stride*.7;
 leftArm.rotation.z=-.08-crouchBlend*.1;
 rightArm.rotation.z=.08+crouchBlend*.1;
 const bob=Math.abs(Math.sin(walkCycle))*walkBlend*.045;
 torso.position.y=1.38+bob;
 character.position.y=-crouchBlend*.08;
 for(let i=0;i<hairStrands.length;i++){
  const strand=hairStrands[i];
  strand.rotation.x=Math.sin(walkCycle*.55+i*.3)*.07*walkBlend;
  strand.rotation.z=(i-3.5)*.06+Math.sin(walkCycle*.6+i*.6)*.035*walkBlend;
 }
 updateSurvival(dt,p,button,running,crouch,length);
 if(!survival.story){survival.story=true;broadcast('ОПЕРАТОР: Здесь есть движение. Не шумите. Найдите ключ-карту и восстановите питание шлюза.',8)}
 const action=pressed('KeyE')||button(0);
 if(action&&!prevAction)interact();
 prevAction=action;
 const saveKey=pressed('F5');
 if(saveKey&&!prevSave&&near(-11,-11))saveProgress();
 prevSave=saveKey;
 updateCamera(dt);
 if(noticeTime>0)noticeTime-=dt;else notice='';
 $('message').textContent=notice;
 $('status').innerHTML='СЕКТОР A-01 · '+'ЛАБОРАТОРИЯ'+'<br>Ключ-карта: '+(player.key?'ДА':'НЕТ')+' · Питание: '+(player.power?'ВКЛ':'ВЫКЛ')+'<br>Выносливость: '+Math.ceil(player.stamina)+'% · '+fps+' FPS<br><small>WASD / Xbox LS · E / A взаимодействие · Space / X уклонение · обзор: мышь / правый стик</small>';
}
const intro=$('intro'),panel=$('panel');
panel.innerHTML='<h2>BLACKSITE: RAPTOR</h2><p>ЭТАП 1 — СЕКТОР A-01. Найдите ключ-карту на складе, восстановите питание в пункте управления и откройте северный шлюз. Сохранение доступно только в безопасной комнате.</p><p><b>WASD</b> — движение, <b>Shift</b> — бег, <b>Ctrl</b> — присесть, <b>Space</b> — уклонение, <b>E</b> — взаимодействие; мышь — обзор.</p><p><b>Xbox:</b> левый стик — движение, L3 — бег, B — присесть, X — уклонение, A — взаимодействие, правый стик — обзор.</p><button id="new">НОВАЯ ИГРА</button> <button id="continue">ПРОДОЛЖИТЬ</button><p><small>Камера из-за плеча. Нажмите на игровое поле для управления мышью; Esc освобождает курсор. Версия 1.03: динозавр с патрулём и преследованием, пистолет, здоровье, патроны, аптечки, инвентарь и радиосвязь. F / RT — выстрел, R / Y — перезарядка, H / LB — аптечка, I / Back — инвентарь.</small></p>';
$('new').onclick=()=>{if(survival.gameOver){localStorage.removeItem('blacksite-raptor-stage1-v1');location.reload();return}localStorage.removeItem('blacksite-raptor-stage1-v1');active=true;intro.style.display='none';canvas.requestPointerLock?.();notify('НАЙДИТЕ КЛЮЧ-КАРТУ')};
$('continue').onclick=()=>{load();active=true;intro.style.display='none';canvas.requestPointerLock?.()};
let previous=performance.now();
engine.runRenderLoop(()=>{
 const now=performance.now(),dt=Math.min(.05,(now-previous)/1000);previous=now;
 if(document.hidden)return;
 if(active)update(dt);
 scene.render();
 frames++;fpstime+=dt;if(fpstime>=.6){fps=Math.round(frames/fpstime);frames=0;fpstime=0}
});
addEventListener('resize',()=>engine.resize());
})();