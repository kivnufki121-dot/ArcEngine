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
const torso=heroBox('armored torso',.61,.72,.34,0,1.38,0,suit);
heroBox('left armored shoulder',.24,.23,.38,-.39,1.74,0,armor);
heroBox('right armored shoulder',.24,.23,.38,.39,1.74,0,armor);
heroBox('chest armor',.53,.27,.38,0,1.55,-.02,armor);
heroBox('waist',.43,.3,.31,0,.97,0,suit);
heroBall('head',.33,0,2.03,-.01,skin);
heroBox('dark hair crown',.37,.19,.36,0,2.23,.025,hair);
heroBall('high ponytail base',.24,0,2.35,.15,hair);
for(let i=0;i<8;i++){
 const x=(i-3.5)*.055;
 const strand=heroBox('long ponytail strand',.045,1.17,.065,x,1.65,.26,i%3===0?hairBlue:i%3===1?hairPurple:hair);
 strand.rotation.z=(i-3.5)*.06;
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
 heroBox('leg neon seam',.045,.51,.275,side*.13,-.34,0,neon,pivot);
 heroBox('boot light',.21,.055,.41,0,-1.04,-.08,cyan,pivot);
}
heroBox('chest neon left',.055,.52,.37,-.25,1.43,-.005,neon);
heroBox('chest neon right',.055,.52,.37,.25,1.43,-.005,neon);
heroBox('chest cyan badge',.23,.08,.4,0,1.73,-.02,cyan);
let walkCycle=0;
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
  localStorage.setItem('blacksite-raptor-stage1-v1',JSON.stringify({version:1,x:player.x,z:player.z,key:player.key,power:player.power,door:player.door}));
  notify('СОХРАНЕНО В БЕЗОПАСНОЙ КОМНАТЕ');
 }catch(e){notify('СОХРАНЕНИЕ НЕДОСТУПНО')}
}
function interact(){
 if(!player.key&&near(-11,10)){player.key=true;sync();notify('ПОЛУЧЕНА КЛЮЧ-КАРТА');return}
 if(near(10,-11)){if(!player.key){notify('ТРЕБУЕТСЯ КЛЮЧ-КАРТА');return}player.power=true;notify('ПИТАНИЕ ШЛЮЗА ВОССТАНОВЛЕНО');return}
 if(near(-11,-11)){saveProgress();return}
 if(near(0,-13,3.4)){
  if(!player.key||!player.power){notify('ШЛЮЗ ЗАБЛОКИРОВАН: НУЖНЫ КЛЮЧ И ПИТАНИЕ');return}
  player.door=true;sync();notify('ШЛЮЗ ОТКРЫТ. ЭТАП 1 ПРОЙДЕН!',8);return;
 }
 notify('ПОБЛИЗОСТИ НЕТ ИНТЕРАКТИВНЫХ ОБЪЕКТОВ',1.4);
}
function update(dt){
 const p=gamepad(),button=i=>!!p?.buttons[i]?.pressed;
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
 if(length>.1)player.heading=Math.atan2(mx,mz);
 character.position.set(player.x,0,player.z);
 character.scaling.y=crouch?.72:1;
 character.rotation.y=player.heading;
 walkCycle+=dt*(running?12:8)*(length>.1?1:0);
 const swing=length>.1?Math.sin(walkCycle)*.45:0;
 leftLeg.rotation.x=swing;rightLeg.rotation.x=-swing;
 leftArm.rotation.x=-swing*.75;rightArm.rotation.x=swing*.75;
 if(length<=.1){leftLeg.rotation.x*=.7;rightLeg.rotation.x*=.7;leftArm.rotation.x*=.7;rightArm.rotation.x*=.7;}
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
panel.innerHTML='<h2>BLACKSITE: RAPTOR</h2><p>ЭТАП 1 — СЕКТОР A-01. Найдите ключ-карту на складе, восстановите питание в пункте управления и откройте северный шлюз. Сохранение доступно только в безопасной комнате.</p><p><b>WASD</b> — движение, <b>Shift</b> — бег, <b>Ctrl</b> — присесть, <b>Space</b> — уклонение, <b>E</b> — взаимодействие; мышь — обзор.</p><p><b>Xbox:</b> левый стик — движение, L3 — бег, B — присесть, X — уклонение, A — взаимодействие, правый стик — обзор.</p><button id="new">НОВАЯ ИГРА</button> <button id="continue">ПРОДОЛЖИТЬ</button><p><small>Камера из-за плеча. Нажмите на игровое поле для управления мышью; Esc освобождает курсор. Тестовая лаборатория и стилизованная 3D-героиня по присланному референсу.</small></p>';
$('new').onclick=()=>{localStorage.removeItem('blacksite-raptor-stage1-v1');active=true;intro.style.display='none';canvas.requestPointerLock?.();notify('НАЙДИТЕ КЛЮЧ-КАРТУ')};
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