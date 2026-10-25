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
// Visual Overhaul 2.0 — renderer-only pass, separate from collision and gameplay.
scene.imageProcessingConfiguration.toneMappingEnabled=true;
scene.imageProcessingConfiguration.toneMappingType=BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
scene.imageProcessingConfiguration.exposure=1.15;
scene.imageProcessingConfiguration.contrast=1.25;
const visualPipeline=new BABYLON.DefaultRenderingPipeline('blacksite cinematic',true,scene,[camera]);
visualPipeline.fxaaEnabled=true;
visualPipeline.bloomEnabled=true;
visualPipeline.bloomThreshold=.72;
visualPipeline.bloomWeight=.23;
visualPipeline.bloomKernel=42;
visualPipeline.samples=2;
const visualMetal=material('brushed industrial steel','#39474c');
visualMetal.specularColor=new BABYLON.Color3(.48,.54,.56);
visualMetal.specularPower=88;
const visualRubber=material('rubber seals','#141b1e');
visualRubber.specularPower=12;
floor.specularColor=new BABYLON.Color3(.22,.3,.32);
floor.specularPower=70;
steel.specularColor=new BABYLON.Color3(.45,.52,.55);
steel.specularPower=80;
wall.specularPower=28;
// FINAL VISUAL PASS — procedural industrial surface details, no network assets.
function industrialTexture(name,base,accent,seed){
 const texture=new BABYLON.DynamicTexture(name,{width:512,height:512},scene,false);
 const ctx=texture.getContext();
 ctx.fillStyle=base;ctx.fillRect(0,0,512,512);
 let state=seed>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 for(let i=0;i<8500;i++){
  const x=random()*512,y=random()*512,a=random()*.085;
  ctx.fillStyle='rgba(220,230,232,'+a+')';ctx.fillRect(x,y,1+random()*3,1+random()*3);
 }
 ctx.strokeStyle=accent;ctx.lineWidth=3;
 for(let i=0;i<=4;i++){
  const p=i*128+.5;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,512);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(512,p);ctx.stroke();
 }
 ctx.fillStyle='rgba(5,10,12,.8)';
 for(let x=8;x<512;x+=128)for(let y=8;y<512;y+=128){
  for(const ox of [0,110])for(const oy of [0,110]){
   ctx.beginPath();ctx.arc(x+ox,y+oy,3.5,0,Math.PI*2);ctx.fill();
  }
 }
 texture.update();texture.uScale=6;texture.vScale=5;return texture;
}
floor.diffuseTexture=industrialTexture('floor plated texture','#354044','rgba(11,18,20,.7)',200);
wall.diffuseTexture=industrialTexture('concrete panel texture','#485358','rgba(19,25,27,.55)',903);
floor.specularColor=new BABYLON.Color3(.35,.42,.46);
function illuminatedSign(name,text,x,y,z,width,rotation=0){
 const tex=new BABYLON.DynamicTexture(name+' texture',{width:1024,height:256},scene,true);
 const ctx=tex.getContext();ctx.fillStyle='#081216';ctx.fillRect(0,0,1024,256);
 ctx.strokeStyle='#d14d3d';ctx.lineWidth=13;ctx.strokeRect(10,10,1004,236);
 ctx.fillStyle='#e7d9ca';ctx.font='bold 66px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillText(text,512,128,950);tex.update();
 const mat=new BABYLON.StandardMaterial(name+' emissive',scene);
 mat.diffuseTexture=tex;mat.emissiveTexture=tex;mat.disableLighting=true;
 const mesh=BABYLON.MeshBuilder.CreatePlane(name,{width,height:width/4},scene);
 mesh.position.set(x,y,z);mesh.rotation.y=rotation;mesh.material=mat;mesh.isPickable=false;
 return mesh;
}
illuminatedSign('north exit label','HELIX MERIDIAN  /  A-01',0,3.3,-14.05,3.5);
illuminatedSign('south quarantine label','BIOHAZARD  /  QUARANTINE',0,3.1,14.1,3.8,Math.PI);
illuminatedSign('east lab label','LABORATORY  /  RESTRICTED',12,3.05,-14.05,3.7);
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
const medMaterial=material('medical supplies','#f3f0dc',.18);
const medKit=block('medical kit pickup',-8,.35,-10,.65,.38,.55,medMaterial);
block('medical kit red mark',-8,.57,-10,.3,.055,.15,red);
block('save station light',-11,2.1,-11,1,.15,.4,gold);
// Sector A-01 visual pass (v0.3): all scenery is non-colliding, preserving the tested routes.
const cyan=material('cyan accessories','#18d9f4',.9);
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
// Decorative geometry is intentionally non-colliding and non-pickable.
for(const z of [-12,-6,0,6,12]){
 for(const x of [-15.95,15.95]){
  block('industrial wall ribs',x,1.8,z,.22,3.45,.3,visualMetal);
  block('rib foot',x,.18,z,.48,.23,.54,visualRubber);
 }
 for(const x of [-1.15,1.15]){
  block('floor metal panel',x,.018,z,1.9,.025,2.45,visualMetal);
  block('floor grating seam',x,.036,z,1.86,.012,.065,visualRubber);
 }
}
for(const x of [-14,-9,9,14]){
 for(const z of [-13.7,13.7]){
  block('service wall console',x,1.75,z,.9,1.2,.12,visualMetal);
  block('console display',x,1.9,z-.09,.7,.57,.04,glass);
  block('console warning stripe',x,1.33,z-.13,.78,.055,.045,hazard);
 }
}
for(const z of [-10,-4,2,8]){
 block('ceiling ventilation',0,3.84,z,1.6,.09,1.1,visualMetal);
 for(const x of [-.56,-.28,0,.28,.56])block('vent slat',x,3.76,z,.075,.05,.94,visualRubber);
}
scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;
scene.fogDensity=.012;
scene.fogColor=new BABYLON.Color3(.045,.065,.074);
const atmosphereLight=new BABYLON.PointLight('cold corridor fill',new BABYLON.Vector3(0,3.5,1),scene);
atmosphereLight.diffuse=new BABYLON.Color3(.4,.75,1);
atmosphereLight.intensity=2.8;atmosphereLight.range=18;
const farLight=new BABYLON.PointLight('storage fill',new BABYLON.Vector3(-10,3.1,8),scene);
farLight.diffuse=new BABYLON.Color3(.35,.85,.88);farLight.intensity=2.2;farLight.range=12;
// Atmospheric environment pass: procedural wet patches, metalwork, floating dust,
// physically plausible pools of light. All objects are decorative/non-colliding.
const wetMat=new BABYLON.StandardMaterial('damp floor reflections',scene);
wetMat.diffuseColor=new BABYLON.Color3(.035,.065,.075);
wetMat.specularColor=new BABYLON.Color3(.9,.95,1);
wetMat.specularPower=128;wetMat.alpha=.45;
wetMat.backFaceCulling=false;
const scratchMat=material('worn metal edge highlights','#73858a');
scratchMat.specularColor=new BABYLON.Color3(.65,.7,.72);
scratchMat.specularPower=96;
const grime=material('floor grime','#121c1d');
grime.alpha=.38;
let scenerySeed=89177;
const sceneryRand=()=>{scenerySeed=(Math.imul(scenerySeed,1664525)+1013904223)>>>0;return scenerySeed/4294967296};
for(let i=0;i<45;i++){
 const x=-15+sceneryRand()*30,z=-13+sceneryRand()*26;
 const w=.4+sceneryRand()*1.65,d=.25+sceneryRand()*1.4;
 const patch=BABYLON.MeshBuilder.CreateDisc('damp floor stain',{radius:1,tessellation:20},scene);
 patch.position.set(x,.032+i*.00003,z);
 patch.rotation.x=Math.PI/2;patch.scaling.set(w,d,1);
 patch.material=i%4===0?grime:wetMat;patch.isPickable=false;
}
for(let i=0;i<38;i++){
 const x=-15.4+sceneryRand()*30.8,z=-13.4+sceneryRand()*26.8;
 const size=.08+sceneryRand()*.22;
 block('floor scattered metal fragment',x,.045,z,size,.035,size*.55,i%3?scratchMat:visualRubber);
}
for(const x of [-15.2,-8,8,15.2]){
 for(const z of [-11,-5,1,7,12]){
  block('service duct',x,3.64,z,.42,.19,2.4,visualMetal);
  block('duct lip',x,3.5,z-1.13,.5,.11,.09,scratchMat);
  block('duct lip',x,3.5,z+1.13,.5,.11,.09,scratchMat);
  for(let k=-1;k<=1;k++)block('duct clasp',x,3.53,z+k*.8,.52,.08,.055,visualRubber);
 }
}
const coldPoolPositions=[[-11,3.2,9],[11,3.2,9],[-11,3.2,-8],[11,3.2,-8]];
for(let i=0;i<coldPoolPositions.length;i++){
 const [x,y,z]=coldPoolPositions[i];
 const fixture=block('cold light fixture',x,y+.15,z,.85,.15,.3,steel);
 block('cold light tube',x,y,z,.62,.05,.12,cold);
 const pool=new BABYLON.PointLight('localized industrial light '+i,new BABYLON.Vector3(x,y-.1,z),scene);
 pool.diffuse=new BABYLON.Color3(.42,.69,.85);pool.intensity=1.15;pool.range=8;
}
const dustParticles=new BABYLON.ParticleSystem('airborne lab dust',150,scene);
const dustTexture=new BABYLON.DynamicTexture('dust sprite',{width:32,height:32},scene,false);
const dustCtx=dustTexture.getContext();
const dustGradient=dustCtx.createRadialGradient(16,16,0,16,16,16);
dustGradient.addColorStop(0,'rgba(255,255,255,.8)');
dustGradient.addColorStop(.35,'rgba(220,240,255,.35)');
dustGradient.addColorStop(1,'rgba(255,255,255,0)');
dustCtx.fillStyle=dustGradient;dustCtx.fillRect(0,0,32,32);dustTexture.update();
dustParticles.particleTexture=dustTexture;
dustParticles.emitter=new BABYLON.Vector3(0,1.5,0);
dustParticles.minEmitBox=new BABYLON.Vector3(-15,-1.3,-13);
dustParticles.maxEmitBox=new BABYLON.Vector3(15,1.3,13);
dustParticles.color1=new BABYLON.Color4(.7,.8,.84,.13);
dustParticles.color2=new BABYLON.Color4(.65,.78,.85,.07);
dustParticles.colorDead=new BABYLON.Color4(.5,.6,.65,0);
dustParticles.minSize=.015;dustParticles.maxSize=.045;
dustParticles.minLifeTime=6;dustParticles.maxLifeTime=12;
dustParticles.emitRate=9;
dustParticles.blendMode=BABYLON.ParticleSystem.BLENDMODE_STANDARD;
dustParticles.gravity=new BABYLON.Vector3(0,.008,0);
dustParticles.direction1=new BABYLON.Vector3(-.08,.02,-.08);
dustParticles.direction2=new BABYLON.Vector3(.08,.08,.08);
dustParticles.minEmitPower=.01;dustParticles.maxEmitPower=.04;
dustParticles.updateSpeed=.02;dustParticles.start();
// Stylized low-poly playable heroine based on the supplied front/side/back turnaround.
// Geometry-only preview: detailed mesh, skinning, hair strands and cloth simulation come later.
const character=new BABYLON.TransformNode('heroine root',scene);
const suit=material('black armored suit','#15131f'),armor=material('violet armor','#272237');
const neon=material('magenta luminous piping','#ff2b9f',.95);
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
// v0.4: isolated dromaeosaur encounter; no changes to player input, camera or puzzles.
const raptorRoot=new BABYLON.TransformNode('raptor patrol root',scene);
const raptorCoat=material('feathered raptor coat','#556b5c'),raptorFeather=material('raptor wing feathers','#9d9b72');
const raptorEye=material('raptor eyes','#f2a84b',.65);
function raptorPart(name,w,h,d,x,y,z,mat){
 // Smooth anatomical volumes replace the prototype's box-only silhouette.
 const mesh=BABYLON.MeshBuilder.CreateSphere(name,{diameter:1,segments:12},scene);
 mesh.scaling.set(w,h,d);mesh.parent=raptorRoot;
 mesh.position.set(x,y,z);mesh.material=mat;mesh.isPickable=false;return mesh;
}
function raptorTalon(name,x,y,z,length,side,mat){
 const mesh=BABYLON.MeshBuilder.CreateCylinder(name,{height:length,diameterTop:0,diameterBottom:.11,tessellation:8},scene);
 mesh.parent=raptorRoot;mesh.position.set(x,y,z);
 mesh.rotation.x=-Math.PI*.58;mesh.rotation.z=side*.2;
 mesh.material=mat;mesh.isPickable=false;return mesh;
}
const raptorScale=material('raptor dark dorsal scales','#283b37');
raptorScale.specularColor=new BABYLON.Color3(.23,.29,.25);
raptorScale.specularPower=42;
raptorCoat.specularColor=new BABYLON.Color3(.28,.33,.27);
raptorCoat.specularPower=55;
raptorFeather.specularColor=new BABYLON.Color3(.13,.14,.1);
raptorPart('raptor body',.72,.58,1.25,0,1.02,0,raptorCoat);
raptorPart('raptor neck',.35,.54,.4,0,1.36,-.54,raptorCoat);
raptorPart('raptor skull',.4,.3,.57,0,1.62,-.83,raptorCoat);
raptorPart('raptor muzzle',.31,.13,.45,0,1.52,-1.25,raptorFeather);
raptorPart('dorsal shoulder muscle',.68,.31,.76,0,1.32,-.1,raptorScale);
raptorPart('lower chest',.52,.38,.69,0,.85,-.21,raptorCoat);
raptorPart('brow ridge',.43,.13,.32,0,1.73,-1.01,raptorScale);
raptorPart('nostril ridge',.23,.09,.23,0,1.58,-1.43,raptorScale);
for(const side of [-1,1]){
 raptorPart('cheek scale',.11,.14,.27,side*.2,1.53,-.99,raptorScale);
 for(let i=0;i<5;i++){
  const z=-.22+i*.27;
  const feather=raptorPart('back plumage',.13,.25,.43,side*(.18+i*.018),1.36-i*.025,z,raptorScale);
  feather.rotation.x=-.35;
 }
 for(let i=0;i<4;i++)raptorTalon('jaw tooth',side*(.08+i*.018),1.41,-1.02-i*.115,.13,side,medMaterial);
}
const raptorLegs=[],raptorArms=[],raptorTail=[];
for(const side of [-1,1]){
 raptorPart('raptor eye',.07,.08,.08,side*.22,1.7,-.96,raptorEye);
 const arm=raptorPart('feathered forearm',.18,.32,.7,side*.43,1.04,-.2,raptorFeather);
 const leg=raptorPart('raptor leg',.2,.73,.24,side*.25,.53,.27,raptorCoat);
 raptorPart('sickle claw',.13,.08,.3,side*.25,.1,-.14,raptorFeather);
 raptorTalon('curved hunting claw',side*.25,.15,-.23,.31,side,raptorScale);
 for(let toe=0;toe<3;toe++)raptorTalon('toe claw',side*.25+(toe-1)*.095,.11,-.2,.19,side,raptorScale);
 raptorArms.push(arm);raptorLegs.push(leg);
 for(let i=0;i<3;i++)raptorPart('wing feather',.12,.08,.28,side*(.44+i*.055),.88,-.44+i*.15,raptorFeather);
}
for(let i=0;i<4;i++)raptorTail.push(raptorPart('tail feathers',.16,.13,.53,0,1.04,.86+i*.34,raptorCoat));
const raptorCrest=raptorPart('neck plumage',.38,.15,.4,0,1.6,-.53,raptorFeather);
const raptorJaw=raptorPart('lower jaw',.32,.09,.43,0,1.42,-1.2,raptorCoat);
let raptorGait=0,raptorHitFlash=0;
function animateRaptor(dt,moving){
 const chase=raptor.mode==='chase',pace=chase?11:6;
 if(moving)raptorGait+=dt*pace;
 const amplitude=moving?(chase?.52:.28):.035;
 const stride=Math.sin(raptorGait)*amplitude;
 raptorLegs[0].rotation.x=stride;raptorLegs[1].rotation.x=-stride;
 raptorArms[0].rotation.x=-stride*.5;raptorArms[1].rotation.x=stride*.5;
 for(let i=0;i<raptorTail.length;i++){
  raptorTail[i].rotation.y=Math.sin(raptorGait*.45+i*.35)*.09;
  raptorTail[i].rotation.x=Math.sin(raptorGait*.6+i*.25)*.035;
 }
 raptorCrest.rotation.z=Math.sin(raptorGait*.8)*.06;
 raptorJaw.rotation.x=raptor.windup>0?-.42:chase?-.17:Math.sin(raptorGait*.3)*.025;
 raptorRoot.scaling.y=raptor.windup>0?.86:1;
 raptorHitFlash=Math.max(0,raptorHitFlash-dt);
 raptorCoat.emissiveColor=raptorHitFlash>0?new BABYLON.Color3(.65,.06,.035):BABYLON.Color3.Black();
}
// External rigged model integration. Only activates when a legitimate GLB file
// is present in assets/raptor/velociraptor.glb; otherwise the tested procedural
// raptor remains visible. All AI, hit detection and navigation stay unchanged.
let externalRaptor=null;
async function loadExternalRaptor(){
 const assetUrl='./assets/raptor/velociraptor.glb';
 try{
  const probe=await fetch(assetUrl,{method:'HEAD'});
  if(!probe.ok||!probe.headers.get('content-type')?.includes('model')&&Number(probe.headers.get('content-length')||0)<1000)return;
  if(!BABYLON.SceneLoader.IsPluginForExtensionAvailable('.glb')){
   await new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js';
    script.onload=resolve;script.onerror=reject;document.head.appendChild(script);
   });
  }
  const result=await BABYLON.SceneLoader.ImportMeshAsync('','./assets/raptor/','velociraptor.glb',scene);
  const visual=new BABYLON.TransformNode('imported velociraptor visual',scene);
  for(const mesh of result.meshes){
   if(!mesh.parent)mesh.parent=visual;
   mesh.isPickable=false;
  }
  const bounds=visual.getHierarchyBoundingVectors();
  const dimensions=bounds.max.subtract(bounds.min);
  const length=Math.max(dimensions.x,dimensions.z,.001);
  visual.scaling.scaleInPlace(2.5/length);
  visual.parent=raptorRoot;
  visual.rotation.y=Math.PI;
  const groups=result.animationGroups||[];
  const findGroup=(words)=>groups.find(g=>words.some(word=>g.name.toLowerCase().includes(word)));
  const idle=findGroup(['idle','breath'])||groups[0];
  const walk=findGroup(['walk','run','locomotion'])||idle;
  const attack=findGroup(['attack','bite'])||walk;
  for(const group of groups)group.stop();
  if(idle)idle.start(true);
  externalRaptor={visual,groups,idle,walk,attack,current:idle};
  for(const child of raptorRoot.getChildren())if(child!==visual&&child instanceof BABYLON.AbstractMesh)child.setEnabled(false);
  notify('ЗАГРУЖЕНА 3D-МОДЕЛЬ ВЕЛОЦИРАПТОРА',3);
 }catch(error){
  console.warn('External raptor unavailable; procedural fallback retained',error);
 }
}
function animateExternalRaptor(moving){
 if(!externalRaptor)return;
 const {idle,walk,attack,groups}=externalRaptor;
 const target=raptor.windup>0?attack:moving?walk:idle;
 if(target&&target!==externalRaptor.current){
  for(const group of groups)group.stop();
  target.start(true);
  externalRaptor.current=target;
 }
}
loadExternalRaptor();
const raptor={x:6,z:4,mode:'patrol',alert:0,attackCooldown:0,waypoint:0,path:[],pathTimer:0,health:100,stunned:0,lastX:6,lastZ:4,windup:0,investigate:0};
const raptorRoute=[[6,4],[6,0],[9,-3],[5,2]];
let health=100;
const survival={medkits:1,kitCollected:false,healHeld:false,ammoCollected:false,extraMedCollected:false};
const objectives={escape:false};
const ammoSupply=block('ammunition supply',9,.32,9,.7,.35,.6,gold);
const extraMedSupply=block('emergency medkit',-8,.32,8,.6,.36,.5,medMaterial);
function currentObjective(){return !player.key?'НАЙТИ КЛЮЧ-КАРТУ':!player.power?'ВОССТАНОВИТЬ ПИТАНИЕ':!player.door?'ОТКРЫТЬ СЕВЕРНЫЙ ШЛЮЗ':'СЕКТОР A-01 ПРОЙДЕН'}
function useMedkit(){
 if(survival.medkits<1){notify('НЕТ АПТЕЧЕК',1.2);return}
 if(health>=100){notify('ЗДОРОВЬЕ УЖЕ ПОЛНОЕ',1.2);return}
 survival.medkits--;health=Math.min(100,health+40);notify('АПТЕЧКА: ЗДОРОВЬЕ '+health+'%',1.6);
}
// Grid search prevents the predator from trying to walk through walls.
// The grid is sampled from the exact same passable() collision test as the heroine.
function raptorPath(startX,startZ,targetX,targetZ){
 const cell=1,cols=33,rows=29,ox=-16,oz=-14;
 const idx=(x,z)=>z*cols+x;
 const coord=(x,z)=>[ox+x*cell,oz+z*cell];
 const nearest=(x,z)=>[Math.max(0,Math.min(cols-1,Math.round((x-ox)/cell))),Math.max(0,Math.min(rows-1,Math.round((z-oz)/cell)))];
 const [sx,sz]=nearest(startX,startZ),[gx,gz]=nearest(targetX,targetZ);
 const start=idx(sx,sz),goal=idx(gx,gz);
 const queue=[start],visited=new Set([start]),previous=new Map();
 let reached=-1,best=start,bestScore=Infinity;
 for(let head=0;head<queue.length;head++){
  const cur=queue[head],x=cur%cols,z=Math.floor(cur/cols);
  const score=Math.abs(x-gx)+Math.abs(z-gz);
  if(score<bestScore){best=cur;bestScore=score}
  if(cur===goal){reached=cur;break}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=x+dx,nz=z+dz;
   if(nx<0||nx>=cols||nz<0||nz>=rows)continue;
   const next=idx(nx,nz);
   if(visited.has(next))continue;
   const [wx,wz]=coord(nx,nz);
   if(!passable(wx,wz))continue;
   visited.add(next);previous.set(next,cur);queue.push(next);
  }
 }
 if(reached<0)reached=best;
 const path=[];
 while(reached!==start&&previous.has(reached)){
  path.push(coord(reached%cols,Math.floor(reached/cols)));
  reached=previous.get(reached);
 }
 path.reverse();
 return path;
}
function updateRaptor(dt,isRunning,isCrouching){
 if(raptor.health<=0){raptorRoot.setEnabled(false);return}
 raptor.stunned=Math.max(0,raptor.stunned-dt);
 const distance=Math.hypot(player.x-raptor.x,player.z-raptor.z);
 const hearingRadius=isRunning?10:isCrouching?3:6;
 if(distance<hearingRadius)raptor.alert=5;
 raptor.alert=Math.max(0,raptor.alert-dt);
 if(distance<hearingRadius){raptor.lastX=player.x;raptor.lastZ=player.z;raptor.investigate=6}
 raptor.investigate=Math.max(0,raptor.investigate-dt);
 raptor.mode=raptor.alert>0?'chase':raptor.investigate>0?'search':'patrol';
 let tx,tz;
 if(raptor.mode==='chase'){tx=player.x;tz=player.z}
 else if(raptor.mode==='search'){tx=raptor.lastX;tz=raptor.lastZ}
 else{
  [tx,tz]=raptorRoute[raptor.waypoint];
  if(Math.hypot(tx-raptor.x,tz-raptor.z)<.6)raptor.waypoint=(raptor.waypoint+1)%raptorRoute.length;
 }
 raptor.pathTimer-=dt;
 if(raptor.pathTimer<=0||!raptor.path.length){
  raptor.path=raptorPath(raptor.x,raptor.z,tx,tz);
  raptor.pathTimer=raptor.mode==='chase'?.35:1.0;
 }
 let raptorMoving=false;
 if(raptor.path.length){
  const [wx,wz]=raptor.path[0],dx=wx-raptor.x,dz=wz-raptor.z,dist=Math.hypot(dx,dz);
  if(dist<.24)raptor.path.shift();
  else{
   const speed=raptor.stunned>0?0:(raptor.mode==='chase'?2.15:1.0),step=Math.min(dist,speed*dt);
   const nx=raptor.x+dx/dist*step,nz=raptor.z+dz/dist*step;
   if(passable(nx,raptor.z))raptor.x=nx;
   if(passable(raptor.x,nz))raptor.z=nz;
   raptorMoving=Math.hypot(raptor.x-nx,raptor.z-nz)<.15&&speed>0;
   raptorRoot.rotation.y=Math.atan2(-dx,-dz);
  }
 }
 animateRaptor(dt,raptorMoving);
 animateExternalRaptor(raptorMoving);
 raptorRoot.position.set(raptor.x,Math.sin(raptorGait*2)*(raptorMoving?.035:.008),raptor.z);
 raptor.attackCooldown=Math.max(0,raptor.attackCooldown-dt);
 if(raptor.windup>0){
  raptor.windup=Math.max(0,raptor.windup-dt);
  if(raptor.windup===0&&distance<1.65&&raptor.health>0){
   raptor.attackCooldown=1.5;
   if(dodgeTime<=0){health=Math.max(0,health-20);notify('УКУС ХИЩНИКА! ЗДОРОВЬЕ: '+health+'%',1.5)}
   else notify('УКЛОНЕНИЕ ОТ УКУСА!',1.1);
   if(health===0){health=100;player.x=-10;player.z=10;raptor.alert=0;notify('ГЕРОИНЯ РАНЕНА — ВОЗВРАТ В НАЧАЛО',4)}
  }
 }
 if(distance<1.4&&raptor.attackCooldown===0&&raptor.windup===0&&raptor.stunned===0){
  raptor.windup=.65;raptor.attackCooldown=1.5;notify('ХИЩНИК ГОТОВИТСЯ К АТАКЕ — УКЛОНИТЕСЬ!',.7);
 }

}
// v0.5: small isolated combat module; movement and shoulder camera are unchanged.
const weapon={ammo:8,capacity:8,reserve:24,fireCooldown:0,reloadTimer:0,fireHeld:false,reloadHeld:false,shots:0};
const muzzleLight=new BABYLON.PointLight('pistol muzzle flash',new BABYLON.Vector3(0,1.4,0),scene);
muzzleLight.diffuse=new BABYLON.Color3(1,.72,.32);muzzleLight.range=5;muzzleLight.intensity=0;
const gunMat=material('pistol steel','#444a52'),gunGrip=material('pistol grip','#171c23');
heroBox('holstered sidearm grip',.12,.28,.18,.33,.91,-.05,gunGrip);
heroBox('holstered sidearm barrel',.13,.11,.35,.33,1.01,-.17,gunMat);
function firePistol(){
 if(weapon.fireCooldown>0||weapon.reloadTimer>0)return;
 if(weapon.ammo<=0){notify('МАГАЗИН ПУСТ — R / Y ПЕРЕЗАРЯДКА',1.4);return}
 weapon.ammo--;weapon.shots++;weapon.fireCooldown=.26;
 muzzleLight.position.set(player.x,1.45,player.z);
 muzzleLight.intensity=5;
 // The gun fires in the approved camera aim direction, not movement direction.
 const dx=raptor.x-player.x,dz=raptor.z-player.z,dist=Math.hypot(dx,dz);
 const forwardX=Math.sin(shoulderYaw),forwardZ=Math.cos(shoulderYaw);
 const aligned=dist>0&&(dx*forwardX+dz*forwardZ)/dist>.93;
 // Solid walls block shots, even when the target is directly behind one.
 const wallHit=scene.pickWithRay(new BABYLON.Ray(new BABYLON.Vector3(player.x,1.35,player.z),new BABYLON.Vector3(dx,0,dz).normalize(),dist),mesh=>mesh.isPickable);
 if(raptor.health>0&&dist<18&&aligned&&!(wallHit?.hit&&wallHit.distance<dist-.25)){
  raptor.health=Math.max(0,raptor.health-25);
  raptor.stunned=.45;raptor.windup=0;raptorHitFlash=.18;raptor.alert=8;raptor.pathTimer=0;
  notify(raptor.health===0?'ХИЩНИК НЕЙТРАЛИЗОВАН':'ПОПАДАНИЕ! ЗДОРОВЬЕ ХИЩНИКА: '+raptor.health+'%',1.2);
 }else{
  raptor.alert=6;notify('ВЫСТРЕЛ',.5);
 }
}
function updateWeapon(dt,p){
 const button=i=>!!p?.buttons[i]?.pressed;
 weapon.fireCooldown=Math.max(0,weapon.fireCooldown-dt);
 muzzleLight.intensity=Math.max(0,muzzleLight.intensity-dt*45);
 if(weapon.reloadTimer>0){
  weapon.reloadTimer-=dt;
  if(weapon.reloadTimer<=0){
   const amount=Math.min(weapon.capacity-weapon.ammo,weapon.reserve);
   weapon.ammo+=amount;weapon.reserve-=amount;
   notify('ПЕРЕЗАРЯДКА ЗАВЕРШЕНА',.8);
  }
 }
 const fire=pressed('KeyF')||button(7);
 if(fire&&!weapon.fireHeld)firePistol();
 weapon.fireHeld=fire;
 const reload=pressed('KeyR')||button(3);
 if(reload&&!weapon.reloadHeld&&weapon.reloadTimer<=0&&weapon.ammo<weapon.capacity&&weapon.reserve>0){
  weapon.reloadTimer=1.2;notify('ПЕРЕЗАРЯДКА...',1.2);
 }
 weapon.reloadHeld=reload;
}
const player={x:-10,z:10,heading:0,key:false,power:false,door:false,stamina:100,crouch:false,alive:true};
// v0.7: three optional story terminals. No new colliders or mandatory quest steps.
const story={read:[false,false,false]};
const storyEntries=[
 {x:-9,z:8,title:'АРХИВ 01 · ПРОЕКТ КАЙРОС',body:'2041 год. Остров Кайрос. Helix Meridian официально исследует восстановление вымерших видов. Секретный протокол «Раптор» запрещён к публикации.'},
 {x:9,z:-9,title:'АРХИВ 02 · НАРУШЕНИЕ КАРАНТИНА',body:'Журнал безопасности: защитный периметр сектора A-01 нарушен. Образец D-07 реагирует на шум. Рекомендовано передвигаться тихо и избегать прямого контакта.'},
 {x:-8,z:-8,title:'АРХИВ 03 · СИГНАЛ БЕДСТВИЯ',body:'Неизвестный сотрудник: «Если кто-то получил этот сигнал, не верьте отчётам Helix Meridian. Эвакуация была отменена до аварии. Найдите северный шлюз».'}
];
const storyScreens=storyEntries.map((entry,i)=>{
 const mesh=block('story terminal '+(i+1),entry.x,1.2,entry.z,.65,.95,.2,glass);
 block('story terminal indicator '+(i+1),entry.x,1.65,entry.z,.35,.1,.23,cyan);
 return mesh;
});
function readStory(i){
 story.read[i]=true;
 const entry=storyEntries[i];
 notify(entry.title+' — '+entry.body,9);
}
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
 const focus=new BABYLON.Vector3(player.x,1.45,player.z);
 const desired=new BABYLON.Vector3(player.x-sy*distance+cy*side,2.35+Math.sin(shoulderPitch)*2.0,player.z-cy*distance-sy*side);
 const isWall=mesh=>mesh.isPickable;
 // Use multiple nearby rays to give the shoulder camera a safety margin.
 function safePosition(candidate){
  const offsets=[[0,0,0],[.22,0,0],[-.22,0,0],[0,.22,0],[0,-.22,0]];
  const rayVector=candidate.subtract(focus),length=rayVector.length();
  if(length<.001)return candidate;
  const direction=rayVector.scale(1/length);
  let allowed=length;
  for(const [ox,oy,oz] of offsets){
   const origin=focus.add(new BABYLON.Vector3(ox,oy,oz));
   const hit=scene.pickWithRay(new BABYLON.Ray(origin,direction,length),isWall);
   if(hit&&hit.hit)allowed=Math.min(allowed,Math.max(.55,hit.distance-.3));
  }
  return focus.add(direction.scale(allowed));
 }
 const target=safePosition(desired);
 // Smooth outward motion; when a wall intervenes, snap inward instead of interpolating through it.
 const oldDistance=BABYLON.Vector3.Distance(focus,camera.position);
 const newDistance=BABYLON.Vector3.Distance(focus,target);
 const alpha=newDistance<oldDistance?1:Math.min(1,dt*10);
 const candidate=BABYLON.Vector3.Lerp(camera.position,target,alpha);
 camera.position=safePosition(candidate);
 camera.setTarget(new BABYLON.Vector3(player.x+sy*2.6,1.35+Math.sin(shoulderPitch)*2.2,player.z+cy*2.6));
}
function load(){
 try{
  const data=JSON.parse(localStorage.getItem('blacksite-raptor-stage1-v1')||'null');
  if(!data||data.version!==1)return false;
  Object.assign(player,{x:data.x,z:data.z,key:!!data.key,power:!!data.power,door:!!data.door,stamina:100});
  if(!passable(player.x,player.z)){player.x=-10;player.z=10}
  health=Number.isFinite(data.health)?clamp(data.health,1,100):100;
  survival.medkits=Number.isFinite(data.medkits)?Math.max(0,Math.floor(data.medkits)):1;
  survival.kitCollected=!!data.kitCollected;
  survival.ammoCollected=!!data.ammoCollected;survival.extraMedCollected=!!data.extraMedCollected;
  story.read=Array.isArray(data.storyRead)?[0,1,2].map(i=>!!data.storyRead[i]):[false,false,false];
  weapon.ammo=Number.isFinite(data.ammo)?clamp(data.ammo,0,weapon.capacity):8;
  weapon.reserve=Number.isFinite(data.reserve)?Math.max(0,Math.floor(data.reserve)):24;
  sync();notify('ПРОГРЕСС ЗАГРУЖЕН');return true;
 }catch(e){notify('НЕ УДАЛОСЬ ЗАГРУЗИТЬ СОХРАНЕНИЕ');return false}
}
function sync(){
 key.setEnabled(!player.key);door.setEnabled(!player.door);doorCollider.active=!player.door;medKit.setEnabled(!survival.kitCollected);ammoSupply.setEnabled(!survival.ammoCollected);extraMedSupply.setEnabled(!survival.extraMedCollected);
}
function saveProgress(){
 try{
  localStorage.setItem('blacksite-raptor-stage1-v1',JSON.stringify({version:1,x:player.x,z:player.z,key:player.key,power:player.power,door:player.door,health,medkits:survival.medkits,kitCollected:survival.kitCollected,ammo:weapon.ammo,reserve:weapon.reserve,storyRead:story.read,ammoCollected:survival.ammoCollected,extraMedCollected:survival.extraMedCollected}));
  notify('СОХРАНЕНО В БЕЗОПАСНОЙ КОМНАТЕ');
 }catch(e){notify('СОХРАНЕНИЕ НЕДОСТУПНО')}
}
// Cinematic story sequences are self-contained and keyboard/gamepad accessible.
let cinematicActive=false;
const cinematic=document.createElement('div');
cinematic.id='blacksite-cinematic';
cinematic.style.cssText='position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(1,6,10,.97),rgba(6,15,21,.9));color:#e5eeee;font-family:Arial,sans-serif;text-align:center;padding:5vw;box-sizing:border-box';
cinematic.innerHTML='<div style="max-width:850px"><div id="cinematic-label" style="color:#f26453;letter-spacing:.32em;font-size:13px;margin-bottom:25px">HELIX MERIDIAN</div><h1 id="cinematic-title" style="font-size:clamp(27px,5vw,60px);letter-spacing:.1em;margin:0 0 22px"></h1><p id="cinematic-body" style="font-size:clamp(16px,2vw,23px);line-height:1.65;white-space:pre-line"></p><button id="cinematic-next" style="margin-top:28px;padding:15px 32px;background:#8e302d;color:white;border:1px solid #e37563;cursor:pointer;font-size:17px">ПРОДОЛЖИТЬ ▶</button><p style="opacity:.55;font-size:13px">Enter / Пробел / Xbox A — продолжить</p></div>';
document.body.appendChild(cinematic);
let cinematicSlides=[],cinematicIndex=0,cinematicDone=null,cinematicPadHeld=false;
function showCinematic(slides,done){
 cinematicSlides=slides;cinematicIndex=0;cinematicDone=done;cinematicActive=true;
 active=false;document.exitPointerLock?.();cinematic.style.display='flex';renderCinematic();
}
function renderCinematic(){
 const slide=cinematicSlides[cinematicIndex];
 if(!slide)return;
 document.getElementById('cinematic-title').textContent=slide[0];
 document.getElementById('cinematic-body').textContent=slide[1];
 document.getElementById('cinematic-next').textContent=cinematicIndex===cinematicSlides.length-1?'ЗАВЕРШИТЬ ▶':'ДАЛЕЕ ▶';
}
function nextCinematic(){
 if(!cinematicActive)return;
 cinematicIndex++;
 if(cinematicIndex<cinematicSlides.length){renderCinematic();return}
 cinematic.style.display='none';cinematicActive=false;
 const done=cinematicDone;cinematicDone=null;if(done)done();
}
document.getElementById('cinematic-next').onclick=nextCinematic;
addEventListener('keydown',e=>{if(cinematicActive&&['Enter','Space'].includes(e.code)){e.preventDefault();nextCinematic()}});
function introSequence(){
 showCinematic([
  ['ИНЦИДЕНТ A-01','02:14. Сибирский исследовательский комплекс HELIX MERIDIAN.\\nЭксперимент по восстановлению вымерших видов вышел из-под контроля.'],
  ['ПОСЛЕДНИЙ СИГНАЛ','«Всем сотрудникам: карантин нарушен. Объект RAPTOR-7 покинул камеру содержания. Не приближайтесь к лабораторному крылу».'],
  ['ПРОТОКОЛ ЭВАКУАЦИИ','Вы — единственная сотрудница, оставшаяся в секторе A-01.\\nНайдите ключ-карту, восстановите питание шлюза и доберитесь до выхода.']
 ],()=>{active=true;canvas.requestPointerLock?.();notify('НАЙДИТЕ КЛЮЧ-КАРТУ')});
}
function endingSequence(){
 showCinematic([
  ['ШЛЮЗ РАЗБЛОКИРОВАН','Герметичная дверь открывается. За спиной слышен металлический скрежет — RAPTOR-7 снова выходит на охоту.'],
  ['ПРОТОКОЛ ЗАВЕРШЁН','Вы выжили в секторе A-01 и восстановили систему эвакуации.\\nАрхивы: '+story.read.filter(Boolean).length+'/3. Здоровье: '+health+'%.'],
  ['BLACKSITE: RAPTOR','КОНЕЦ ИСТОРИИ: ПОБЕГ ИЗ СЕКТОРА A-01.\\nСигнал тревоги стихает. Но за дверью комплекса кто-то отвечает на зов хищника…']
 ],()=>{intro.style.display='flex';active=false;document.exitPointerLock?.()});
}
function interact(){
 if(!survival.ammoCollected&&near(9,9,1.8)){survival.ammoCollected=true;weapon.reserve+=8;sync();notify('НАЙДЕНЫ ПАТРОНЫ: +8');return}
 if(!survival.extraMedCollected&&near(-8,8,1.8)){survival.extraMedCollected=true;survival.medkits++;sync();notify('НАЙДЕНА АПТЕЧКА: +1');return}
 for(let i=0;i<storyEntries.length;i++)if(near(storyEntries[i].x,storyEntries[i].z,1.5)){readStory(i);return}
 if(!survival.kitCollected&&near(-8,-10,1.8)){survival.kitCollected=true;survival.medkits++;sync();notify('ПОЛУЧЕНА АПТЕЧКА (+1)');return}
 if(!player.key&&near(-11,10)){player.key=true;sync();notify('ПОЛУЧЕНА КЛЮЧ-КАРТА');return}
 if(near(10,-11)){if(!player.key){notify('ТРЕБУЕТСЯ КЛЮЧ-КАРТА');return}player.power=true;notify('ПИТАНИЕ ШЛЮЗА ВОССТАНОВЛЕНО');return}
 if(near(-11,-11)){saveProgress();return}
 if(near(0,-13,3.4)){
  if(!player.key||!player.power){notify('ШЛЮЗ ЗАБЛОКИРОВАН: НУЖНЫ КЛЮЧ И ПИТАНИЕ');return}
  player.door=true;sync();saveProgress();endingSequence();return;
 }
 notify('ПОБЛИЗОСТИ НЕТ ИНТЕРАКТИВНЫХ ОБЪЕКТОВ',1.4);
}
function update(dt){
 // Deterministic, subtle emergency lighting pulse, no gameplay dependency.
 const pulse=.83+.17*Math.sin(performance.now()*.0035);
 light.intensity=10+2.5*pulse;
 beacon.emissiveColor=new BABYLON.Color3(.8,.12,.09).scale(.7+.3*pulse);
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
 updateRaptor(dt,running&&length>.1,crouch);
 updateWeapon(dt,p);
 const heal=pressed('KeyH')||button(4);
 if(heal&&!survival.healHeld)useMedkit();
 survival.healHeld=heal;
 const action=pressed('KeyE')||button(0);
 if(action&&!prevAction)interact();
 prevAction=action;
 const saveKey=pressed('F5');
 if(saveKey&&!prevSave&&near(-11,-11))saveProgress();
 prevSave=saveKey;
 updateCamera(dt);
 if(noticeTime>0)noticeTime-=dt;else notice='';
 $('message').textContent=notice;
 $('status').innerHTML='СЕКТОР A-01 · '+'ЛАБОРАТОРИЯ'+'<br>Ключ-карта: '+(player.key?'ДА':'НЕТ')+' · Питание: '+(player.power?'ВКЛ':'ВЫКЛ')+'<br>Цель: '+currentObjective()+'<br>Здоровье: '+health+'% · Хищник: '+(raptor.mode==='chase'?'ПРЕСЛЕДУЕТ':raptor.mode==='search'?'ИЩЕТ':'ПАТРУЛЬ')+'<br>Архивы: '+story.read.filter(Boolean).length+'/3 · E / A — читать терминалы'+'<br>Аптечки: '+survival.medkits+' · H / LB — лечение'+'<br>Пистолет: '+weapon.ammo+'/'+weapon.capacity+' · Запас: '+weapon.reserve+(weapon.reloadTimer>0?' · ПЕРЕЗАРЯДКА':'')+'<br>Выносливость: '+Math.ceil(player.stamina)+'% · '+fps+' FPS<br><small>WASD / Xbox LS · E / A взаимодействие · Space / X уклонение · обзор: мышь / правый стик</small>';
}
const intro=$('intro'),panel=$('panel');
panel.innerHTML='<h2>BLACKSITE: RAPTOR</h2><p>ЭТАП 1 — СЕКТОР A-01. Найдите ключ-карту на складе, восстановите питание в пункте управления и откройте северный шлюз. Сохранение доступно только в безопасной комнате.</p><p><b>WASD</b> — движение, <b>Shift</b> — бег, <b>Ctrl</b> — присесть, <b>Space</b> — уклонение, <b>E</b> — взаимодействие; мышь — обзор.</p><p><b>Xbox:</b> левый стик — движение, L3 — бег, B — присесть, X — уклонение, A — взаимодействие, правый стик — обзор.</p><button id="new">НОВАЯ ИГРА</button> <button id="continue">ПРОДОЛЖИТЬ</button><p><small>Камера из-за плеча. Нажмите на игровое поле для управления мышью; Esc освобождает курсор. Версия 3.1 Atmosphere Edition: влажные полы, локальные светильники, промышленный декор, пыль в воздухе. Story Edition: вступительные и финальные катсцены, завершение сюжетной главы. Creature Visual Pass: сглаженная анатомия раптора, когти, чешуя, зубы, оперение. Visual Edition: процедурные текстуры металла, маркировка Helix Meridian, ACES, bloom, сглаживание, туман и лабораторный декор. Visual Overhaul: ACES, bloom, сглаживание, туман, металлические панели и лабораторный декор. Хищник предупреждает об атаке, ищет последнюю позицию игрока; дополнительные патроны и аптечка, журнал текущей цели, сохранение ресурсов и архивов. E / A — читать терминалы и взаимодействовать, H / LB — аптечка, F / RT — стрелять, R / Y — перезарядить.</small></p>';
$('new').onclick=()=>{localStorage.removeItem('blacksite-raptor-stage1-v1');health=100;survival.medkits=1;survival.kitCollected=false;survival.ammoCollected=false;survival.extraMedCollected=false;weapon.ammo=8;weapon.reserve=24;raptor.health=100;raptorRoot.setEnabled(true);raptor.x=6;raptor.z=4;raptor.alert=0;raptor.windup=0;raptor.investigate=0;raptor.stunned=0;raptor.path=[];raptor.pathTimer=0;raptor.mode='patrol';raptorRoot.scaling.y=1;player.x=-10;player.z=10;player.key=false;player.power=false;player.door=false;story.read=[false,false,false];sync();active=false;intro.style.display='none';introSequence()};
$('continue').onclick=()=>{load();active=true;intro.style.display='none';canvas.requestPointerLock?.()};
let previous=performance.now();
engine.runRenderLoop(()=>{
 const now=performance.now(),dt=Math.min(.05,(now-previous)/1000);previous=now;
 if(document.hidden)return;
 if(cinematicActive){const gp=gamepad();const down=!!gp?.buttons[0]?.pressed;if(down&&!cinematicPadHeld)nextCinematic();cinematicPadHeld=down;}
 if(active)update(dt);
 scene.render();
 frames++;fpstime+=dt;if(fpstime>=.6){fps=Math.round(frames/fpstime);frames=0;fpstime=0}
});
addEventListener('resize',()=>engine.resize());
})();