var box_translation_default;

/**
 * Called on init. Values of the scene still have their default value.
 */
function initialize() {
	print('---------Init---------');
	print("Buttonscount: "+buttonz[0].children.length);
	
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
	print("Box position 0: "+getBoxTranslation(0));
	
	print("Position 0default: "+box_translation_default[0]);
	print("Button 1 scale: "+getBoxScale(1));
	setBoxTranslation(0, new SFVec3f(1, 1, 1));
	print("Position 0default: "+box_translation_default[0]);
	print("Button 0 url: "+getBoxUrl(0));
	print("Button 0 size: "+getBoxSize(0));
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

function box_0_touch(value){
	if(value){
		print("Touch: "+value);
	}
}

function print(string){
	Browser.print(string+'\n');
}
