/**
 * Kinect joints
*/
var xnjoints = 
{
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

/**
 * The users hands.
*/
var hands = new Array();

/**
 * Stores the id of the menu selected currently. 
 */
var menuHovered;
/**
 * Stores the menu buttons.
 */
var menu = new Array();
	

var foo;	

/**
 * Called on init. Values of the scene still have their default value.
 */
function initialize() {
	skeleton.render = false;
	create_hands();
	Browser.print('---------Init---------\n');
	
	/*
	All these vars are defaulted during init and don't display their future value.
	
	Browser.print('Testtext: '+testtext+'\n');
	Browser.print('Tmp'+testtranslation+'\n');
	testtranslation = SFVec3f(-5, 1, 1);
	Browser.print('Tmp'+testtranslation+'\n');
	testtext = MFString("foo");
	*/
	//@note: Scale needs to be defined here so that it is correctly read by other JS methods
	testbounding = SFVec3f(1.5, 1, 1);
	testtranslation = SFVec3f(-2, 3, -2);
	
	
	//create_image(SFVec3f(3, 1.5, 1.5), MFString("../img/test_image.jpg"));
	//Browser.print('Tmpy: '+tmpy.children[1].children[0].string+'\n');
	
	//create the right side menu
	menuHovered = -1;
	menu[menu.length] = create_textbox(SFVec3f(3, 1.5, 0.5), MFString("Buildings"), SFColor(1, 0.1, 0.1));
	menu[menu.length] = create_textbox(SFVec3f(3, 0.5, 0.5), MFString("People"), SFColor(0.9, 0.1, 0.1));
	menu[menu.length] = create_textbox(SFVec3f(3, -0.5, 0.5), MFString("Nature"), SFColor(0.7, 0.1, 0.1));
	menu[menu.length] = create_textbox(SFVec3f(3, -1.5, 0.5), MFString("Boats"), SFColor(0.6, 0.1, 0.1));
	menu[menu.length] = create_textbox(SFVec3f(3, -2.5, 0.5), MFString("Cities"), SFColor(0.5, 0.1, 0.1));
	
	foo = create_textbox(SFVec3f(-4.5, -2.5, 0.5), MFString("Foo"), SFColor(0.1, 0.5, 0.1));
}

/**
 * Creates two shapes that represent the users hands.
 */    
function create_hands() {
	for(var i=0; i<2; ++i) {
		var transform = Browser.currentScene.createNode("Transform");
		var shape = Browser.currentScene.createNode("Shape");
		var box = Browser.currentScene.createNode("Box");
		var appearance = Browser.currentScene.createNode("Appearance");
		var material = Browser.currentScene.createNode("Material");

		// SFColor(red, green, blue)
		if(i==0)
			material.diffuseColor = SFColor(1, 0, 0);
		else
			material.diffuseColor = SFColor(0, 1, 0);
		// steuerbord=rechts=grune Farbe
		// backboard=links=rote Farbe
		
		appearance.material = material;
		shape.geometry = box;
		shape.appearance = appearance;
		transform.children[0] = shape;
		transform.scale = SFVec3f(0.1, 0.1, 0.1);

		hands[i] = transform;

		skeleton.children[skeleton.children.length] = transform;
	}
}

/**
 * Called when the Kinect skeleton changes, i.e. every time the user moves
 * @param value: An array of SFVec3f for every Kinect joint
 * @param t: Perhaps the time?
 */
function skeleton_changed(value, t) {
	//Browser.print('-->Skeleton changed\n');
	skeleton.render = true;
	notice.render = false;

	var index;
	
	index = xnjoints.XN_SKEL_LEFT_HAND;
	{
		//hands[0].translation = SFVec3f(-value[index].x/200, value[index].y/200, value[index].z/800);
		hands[0].translation = SFVec3f(-value[index].x/100, value[index].y/60, 2);
	}
	
	index = xnjoints.XN_SKEL_RIGHT_HAND;
	{
		hands[1].translation = SFVec3f(-value[index].x/100, value[index].y/60, 2);
	}
	Browser.print("Foocenter: "+foo.translation+" Fooboxsize: "+foo.bboxSize+"\n");
	if(insideBoundingBox(hands[0].translation, foo.center, foo.bboxSize))
		foo.children[1].children[0].string = MFString("leftHand");
	else if(insideBoundingBox(hands[1].translation, foo.center, testbounding))
		foo.children[1].children[0].string = MFString("rightHand");
	else foo.children[1].children[0].string = MFString("Bar");
	
	//determine if a menu button was hovered over
	var result;
	if(menuHovered>=0){
		result = menuHoverSelectTest(hands[1], menu[menuHovered].translation, menu[menuHovered].children[0].size, true);
		if(result<0){
			menuHovered = -1;
		}else if(result==1){
			//a menu was selected
			Browser.print('Menu '+menuHovered+' selected\n');
			loadFlickrByKeyword(menu.children[menuHovered].children[1].children[0].string);
			menuHovered = -1;
		}else{
			//keep the menu selected
			menuHovered = menuHovered;
		}
	}else{
		for(var i=0; i<menu.length; i++) {
			result = menuHoverSelectTest(hands[1], menu[i].translation, menu[i].children[0].size, true);
			if(result==0){
				//a menu was hovered
				menuHovered = i;
				Browser.print('Menu '+i+' hovered\n');
			}
		}
	}
	
	Browser.print('-->Bounding: '+testbounding+'\n');
	Browser.print('-->Location: '+testtranslation+'\n');
	Browser.print('-->Left hand: '+hands[0].translation+'\n');
	Browser.print('==>Lefty hand: '+value[xnjoints.XN_SKEL_LEFT_HAND]+'\n');
	//Browser.print('-->Diff x: '+(hands[0].translation.x-testtranslation.x)+'\n');
	//Browser.print('-->Diff y: '+(hands[0].translation.y-testtranslation.y)+'\n');
	//Browser.print('-->Diff z: '+(hands[0].translation.z-testtranslation.z)+'\n');
	Browser.print('-->Right hand: '+hands[1].translation+'\n');
	Browser.print('==>Righty hand: '+value[xnjoints.XN_SKEL_RIGHT_HAND]+'\n');
}


/**
 * Tests if the menu button was hovered or selected
 * @param location: A SFVec3f for the queried location
 * @param boundingCorner: A SFVec3f for the corner of the bounding box
 * @param boundingSize: A SFVec2f for the size of the bounding box
 * @param wasHovered: A bool which is true if the box was previously hovered
 * @return 1 if menu is selected, 0 if it is still hoevered, -1 if neither hovered nor selected.
 */
function menuHoverSelectTest(location, boundingCorner, boundingSize, wasHovered) {
	if(wasHovered) {
		if(boundingCorner.y<=location.y && location.y <= boundingCorner.y+boundingSize.y){
			if(location.x+2<=boundingCorner.x)return 1;
			else return 0;
		}
	}else {
		if( (boundingCorner.x<=location.x && location.x <= boundingCorner.x+boundingSize.x)
			&& (boundingCorner.y<=location.y && location.y <= boundingCorner.y+boundingSize.y) ){
			return 0;
		}else {
			return -1;
		}
	}
}

/**
 * Load the flickr images
 * @param keyword: A MFString for the desired flickr keyword
 */
function loadFlickrByKeyword(keyword){
	//@TODO Implement this
}

/**
 * Returns true if the location is inside the 2D-bounding box.
 * @param location: A SFVec3f for the queried location
 * @param boxCorner: A SFVec3f for the corner of the bounding box
 * @param boundingbox: A SFVec3f for the size of the bounding box
 * @return True if inside, else false.
 */
function insideBoundingBox(location, boxCorner, boundingbox) {
	return (location.x>=boxCorner.x && location.x<=boxCorner.x+boundingbox.x)
		&& (location.y>=boxCorner.y && location.y<=boxCorner.y+boundingbox.y);
}

/**
 * Create a 2D rectangle containing text.
 * @param position: A SFVec3f for the position of the image
 * @param boxtext: A MFString for the text inside the box
 * @param color: A SFColor for color of the box
 * @return A SFNode for the top-level transform node
 */
function create_textbox(position, boxtext, color){
  var box = Browser.currentScene.createNode("Rectangle2D");
  box.size = SFVec2f(6, 1);

  var material = Browser.currentScene.createNode("Material");
  material.diffuseColor = color;
  
  var appearance = Browser.currentScene.createNode("Appearance");
  appearance.material = material;

  var shape = Browser.currentScene.createNode("Shape");
  shape.geometry = box;
  shape.appearance = appearance;

  var transformBox = Browser.currentScene.createNode("Transform");
  transformBox.children = new MFNode(shape);

  
  //create the transformnode that contains the text and add it to the top-level transform node
  var transformText = Browser.currentScene.createNode("Transform");
  var text = Browser.currentScene.createNode("Text");
  text.string = boxtext;
  
  transformText.children = new MFNode(text);
  transformText.translation = SFVec3f(-2, -0.25, 0.01);
  transformBox.children[1] = transformText;
  
  transformBox.translation = position;
  // add the transform node to the scene  
  dynamic_group.children[dynamic_group.children.length] = transformBox; 
  
  return transformBox;
}

/**
 * Create a 2D image.
 * @param position: A SFVec3f for the position of the image
 * @param image: A MFString for the image url
 * @return A SFNode for the top-level transform node
 */
function create_image(position, image){
  var box = Browser.currentScene.createNode("Rectangle2D");

  var material = Browser.currentScene.createNode("Material");
  material.diffuseColor = new SFColor(1, 0.5, 1);
	
  var texture = Browser.currentScene.createNode("ImageTexture");
  texture.url = image;
  
  var appearance = Browser.currentScene.createNode("Appearance");
  appearance.material = material;
  appearance.texture = texture;

  var shape = Browser.currentScene.createNode("Shape");
  shape.geometry = box;
  shape.appearance = appearance;

  var transformBox = Browser.currentScene.createNode("Transform");
  transformBox.children = new MFNode(shape);
  transformBox.translation = position;

  // finally add the transform node to the scene  
  dynamic_group.children[dynamic_group.children.length] = transformBox; 
  //if(debug)Browser.print('Created a shape\n');
  return transformBox;
}