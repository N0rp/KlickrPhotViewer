var box_translation_default;

/**
 * Called on init. Values of the scene still have their default value.
 */
function initialize() {
	print('---------Init---------');
	print("Buttonscount: "+buttonz[0].children.length);
	print("Box 0 tmp: "+buttonz[0].children[0].children[0].children[1]);
	
	var box_count = buttonz[0].children.length;
	box_translation_default = [box_count];
	
	/*
	 * buttonz ist field. 
	 * buttonz[0] ist der Gruppenknoten
	 * buttonz[0].children[i] ist box_i, der Transformationsknoten
	 * buttonz[0].children[i].children[0] ist box_template, ein Gruppenknoten
	 * buttonz[0].children[i].children[0].children[0] ist ein Shapeknoten
	 * buttonz[0].children[i].children[0].children[1] ist ein Timesensor
	 * buttonz[0].children[i].children[0].children[0].children[0] ist eine Box
	 */
}

function setBoxTranslation(box_index, translation){
	buttonz[0].children[box_index].translation = translation;
}

function getBoxTranslation(box_index){
	return buttonz[0].children[box_index].translation;
}

function getBoxScale(box_index){
	return buttonz[0].children[box_index].scale;
}

function getBoxSize(box_index){
	return buttonz[0].children[box_index].children[0].children[0].geometry.size;
}

function getBoxUrl(box_index){
	return buttonz[0].children[box_index].children[0].children[0].appearance.texture.url;
}

function rotateBoxLeft(box_index){
	var rotate = new MFRotation();
	rotate[rotate.length] = new SFRotation(0, 1, 0, 0);
	rotate[rotate.length] = new SFRotation(0, 1, 0, -3.14159);
	rotate[rotate.length] = new SFRotation(0, 1, 0, -6.28);
	buttonz[0].children[0].children[4].keyValue = rotate;
	buttonz[0].children[0].children[2].startTime = (new Date()).getTime()/1000;
}

function rotateBoxRight(box_index){
	var rotate = new MFRotation();
	rotate[rotate.length] = new SFRotation(0, 1, 0, 0);
	rotate[rotate.length] = new SFRotation(0, 1, 0, 3.14159);
	rotate[rotate.length] = new SFRotation(0, 1, 0, 6.28);
	buttonz[0].children[0].children[4].keyValue = rotate;
	buttonz[0].children[0].children[2].startTime = (new Date()).getTime()/1000;
}

function rotateBoxUp(box_index){
	var rotate = new MFRotation();
	rotate[rotate.length] = new SFRotation(1, 0, 0, 0);
	rotate[rotate.length] = new SFRotation(1, 0, 0, 3.14159);
	rotate[rotate.length] = new SFRotation(1, 0, 0, 6.28);
	buttonz[0].children[0].children[4].keyValue = rotate;
	buttonz[0].children[0].children[2].startTime = (new Date()).getTime()/1000;
}

function rotateBoxDown(box_index){
	var rotate = new MFRotation();
	rotate[rotate.length] = new SFRotation(1, 0, 0, 0);
	rotate[rotate.length] = new SFRotation(1, 0, 0, -3.14159);
	rotate[rotate.length] = new SFRotation(1, 0, 0, -6.28);
	buttonz[0].children[0].children[4].keyValue = rotate;
	buttonz[0].children[0].children[2].startTime = (new Date()).getTime()/1000;
}


function box_0_touch(value){
	if(value){
		rotateBoxLeft(0);
	}
}

function box_1_touch(value){
	if(value){
		rotateBoxUp(1);
	}
}

function startTime(time){
	print("touchtime: "+time);
}

function print(string){
	Browser.print(string+'\n');
}
