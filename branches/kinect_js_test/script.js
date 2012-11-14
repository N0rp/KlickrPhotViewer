var debug = 1;
var currentDate = new Date();

var joints = new Array();


var xnjoints = {
  "XN_SKEL_HEAD":0,   
  "XN_SKEL_NECK":1,   
  "XN_SKEL_TORSO":2,   
  "XN_SKEL_WAIST":3,  
  "XN_SKEL_LEFT_COLLAR":4,   
  "XN_SKEL_LEFT_SHOULDER":5,   
  "XN_SKEL_LEFT_ELBOW":6,  
  "XN_SKEL_LEFT_WRIST":7,   
  "XN_SKEL_LEFT_HAND":8,   
  "XN_SKEL_LEFT_FINGERTIP":9,   
  "XN_SKEL_RIGHT_COLLAR":10,   
  "XN_SKEL_RIGHT_SHOULDER":11,   
  "XN_SKEL_RIGHT_ELBOW":12,   
  "XN_SKEL_RIGHT_WRIST":13,   
  "XN_SKEL_RIGHT_HAND":14,   
  "XN_SKEL_RIGHT_FINGERTIP":15,   
  "XN_SKEL_LEFT_HIP":16,   
  "XN_SKEL_LEFT_KNEE":17,   
  "XN_SKEL_LEFT_ANKLE":18,   
  "XN_SKEL_LEFT_FOOT":19,   
  "XN_SKEL_RIGHT_HIP":20,   
  "XN_SKEL_RIGHT_KNEE":21,   
  "XN_SKEL_RIGHT_ANKLE":22,   
  "XN_SKEL_RIGHT_FOOT":23
};

/*
 * Attempt at retrieving and changing some node values.
 */
var sto = Browser.currentScene.getNamedNode('image2d');
var hi = Browser.currentScene.getNamedNode('done');
hi.text= "foo";


/**
 * Get all methods of an object.
 */
function getMethods(obj) {
  var result = [];
  for (var id in obj) {
    try {
      if (typeof(obj[id]) == "function") {
        result.push(id + ": " + obj[id].toString());
      }
    } catch (err) {
      result.push(id + ": inaccessible");
    }
  }
  return result;
}

/**
 * Create an image at the given SFVec3f position, the given MFString image url and the index in the group
 */
function create_image(position, image){
  var box = Browser.currentScene.createNode("Box");

  var material = Browser.currentScene.createNode("Material");
  material.diffuseColor = new SFColor(1, 0.5, 1);
	
  var texture = Browser.currentScene.createNode("ImageTexture");
  texture.url = image;
  //"../img/test_image.jpg"
  //texture.url = ;
  
  var appearance = Browser.currentScene.createNode("Appearance");
  appearance.material = material;
  appearance.texture = texture;

  var shape = Browser.currentScene.createNode("Shape");
  shape.geometry = box;
  shape.appearance = appearance;

  var transform = Browser.currentScene.createNode("Transform");
  transform.children = new MFNode(shape);
  //transform.scale = SFVec3f(2, 0.1, 0.1);
  transform.translation = position;

  // finally add the transform node to the scene  
  dynamic_group.children[dynamic_group.children.length] = transform; 
  if(debug)Browser.print('Created a shape\n');
}

/**
 * Creates image cubes in the dynamic_group
 */
function create_image_cube(){ 
  create_image(SFVec3f(3, 1.5, 1.5), MFString("../img/test_image.jpg"));
  create_image(SFVec3f(3, -1.5, 1.5), MFString("../img/test_image.jpg"));
  
  create_image(SFVec3f(0, 1.5, 1.5), MFString("../img/test_image.jpg"));
  create_image(SFVec3f(0, -1.5, 1.5), MFString("../img/test_image.jpg"));
  
  create_image(SFVec3f(-3, 1.5, 1.5), MFString("../img/test_image.jpg"));
  create_image(SFVec3f(-3, -1.5, 1.5), MFString("../img/test_image.jpg"));
  
  
  create_image(SFVec3f(3, 1.5, -1.5), MFString("../img/test_image.jpg"));
  create_image(SFVec3f(3, -1.5, -1.5), MFString("../img/test_image.jpg"));
  
  create_image(SFVec3f(0, 1.5, -1.5), MFString("../img/test_image.jpg"));
  create_image(SFVec3f(0, -1.5, -1.5), MFString("../img/test_image.jpg"));
  
  create_image(SFVec3f(-3, 1.5, -1.5), MFString("../img/test_image.jpg"));
  create_image(SFVec3f(-3, -1.5, -1.5), MFString("http://www.google.com/intl/en_ALL/images/srpr/logo1w.png"));
}

/**
 * Automatically called by X3D to initialize
 */
function initialize() {
  if(debug)Browser.print('>>>>>>>>>>>>>>>>>>>>>>'+currentDate+'>>>>>>>>>>>>>>>>>>>>>>\n');
  skeleton.render = false;
  create_skeleton(24);
  create_image_cube();
  if(debug)Browser.print('<<<<<<<<<<<<<<<<<<<<<<'+currentDate+'<<<<<<<<<<<<<<<<<<<<<<\n');
}

var lines_temp;

/* -----------------------
 * Lotsa Kinect methods
 * ----------------------- */

/**
 * Create the Kinect skeleton
 */
function create_skeleton(num_joints) {
  for(var i=0; i<num_joints; ++i) {
	var transform = Browser.currentScene.createNode("Transform");
	var shape = Browser.currentScene.createNode("Shape");
	var box = Browser.currentScene.createNode("Box");
	var appearance = Browser.currentScene.createNode("Appearance");
	var material = Browser.currentScene.createNode("Material");

	material.diffuseColor = SFColor(Math.random(), Math.random(), Math.random());
	appearance.material = material;
	shape.geometry = box;
	shape.appearance = appearance;
	transform.children[0] = shape;
	transform.scale = SFVec3f(0.1, 0.1, 0.1);

	joints[i] = transform;

	skeleton.children[skeleton.children.length] = transform;
  }
}

function draw_limb(j1, j2){
  lines_temp.coord.point[lines_temp.coord.point.length] = joints[j1].translation;
  lines_temp.coord.point[lines_temp.coord.point.length] = joints[j2].translation;
  lines_temp.vertexCount[lines_temp.vertexCount.length] = 2;
}

function skeleton_changed(value, t) {
  skeleton.render = true;
  notice.render = false;

  for(var i=0; i<joints.length; ++i) {
	joints[i].translation = SFVec3f(-value[i].x/200, value[i].y/200, value[i].z/800);
  }

  lines_temp = Browser.currentScene.createNode('LineSet');
  lines_temp.coord = Browser.currentScene.createNode('Coordinate3D');

  draw_limb(xnjoints.XN_SKEL_HEAD, xnjoints.XN_SKEL_NECK);

  draw_limb(xnjoints.XN_SKEL_NECK, xnjoints.XN_SKEL_LEFT_SHOULDER);
  draw_limb(xnjoints.XN_SKEL_LEFT_SHOULDER, xnjoints.XN_SKEL_LEFT_ELBOW);
  draw_limb(xnjoints.XN_SKEL_LEFT_ELBOW, xnjoints.XN_SKEL_LEFT_HAND);

  draw_limb(xnjoints.XN_SKEL_NECK, xnjoints.XN_SKEL_RIGHT_SHOULDER);
  draw_limb(xnjoints.XN_SKEL_RIGHT_SHOULDER, xnjoints.XN_SKEL_RIGHT_ELBOW);
  draw_limb(xnjoints.XN_SKEL_RIGHT_ELBOW, xnjoints.XN_SKEL_RIGHT_HAND);

  draw_limb(xnjoints.XN_SKEL_LEFT_SHOULDER, xnjoints.XN_SKEL_TORSO);
  draw_limb(xnjoints.XN_SKEL_RIGHT_SHOULDER, xnjoints.XN_SKEL_TORSO);

  draw_limb(xnjoints.XN_SKEL_TORSO, xnjoints.XN_SKEL_LEFT_HIP);
  draw_limb(xnjoints.XN_SKEL_LEFT_HIP, xnjoints.XN_SKEL_LEFT_KNEE);
  draw_limb(xnjoints.XN_SKEL_LEFT_KNEE, xnjoints.XN_SKEL_LEFT_FOOT);

  draw_limb(xnjoints.XN_SKEL_TORSO, xnjoints.XN_SKEL_RIGHT_HIP);
  draw_limb(xnjoints.XN_SKEL_RIGHT_HIP, xnjoints.XN_SKEL_RIGHT_KNEE);
  draw_limb(xnjoints.XN_SKEL_RIGHT_KNEE, xnjoints.XN_SKEL_RIGHT_FOOT);

  draw_limb(xnjoints.XN_SKEL_LEFT_HIP, xnjoints.XN_SKEL_RIGHT_HIP);

  lines.geometry = lines_temp;
}