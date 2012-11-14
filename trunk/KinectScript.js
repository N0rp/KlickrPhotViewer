/** 
 * Ein array aller Gliedmassen die Kinect registriert. 
 * Wird eigentlich nur fuer das Anzeigen der Haende genutzt. 
 */
var joints = new Array();

/** Die Anzahl an von der Kinect erkannten Personen */
var user_number;

var zustandsliste = new Array();

var max_zustandsanzahl = 10;

/** Die Defaultposition des Kopfes den die Kinect registriert. */
var kopf_default_y;

/** Auf true setzen damit der Kopf die Kamera beeinflusst. */
var kopf_dreht_mit = true;

/** Auf wahr setzen fuer extra debug-Ausgaben zum kalibrieren */
var gesten_kalibrieren = false;

/** Geschwindigkeitsmittelwert zwischen A(nfang) und E(nde) des Zustandsarrays */
var aETempoMittL = {
	"x": 0,
	"y": 0,
	"z": 0
};

/** Geschwindigkeitsvarianz zwischen A(nfang) und E(nde) des Zustandsarrays */
var aETempoVarianzL = {
	"x": 0,
	"y": 0,
	"z": 0
};

/** Gibt die Milisekunden an als die letzte Geste gemacht wurde */
var letzte_gesten_zeit;

/** Minimale Zeitdifferenz zwischen zwei Gesten in Sekunden */
var min_gesten_zeit_differenz = 1.5;

/** Eigenschaften der letzten Box die vergroessert wurde */
var gewaehlte_box = {
	"index" : -1,
	"ist_max": false
}
		   
/** Die ids die Kinect fuer die Gliedmassen nutzt. */
var xnjoints = {  
	"XN_SKEL_HEAD": 0,   
	"XN_SKEL_TORSO": 2, 
	"XN_SKEL_LEFT_HAND": 8,
	"XN_SKEL_RIGHT_HAND": 14
};

/** Default-Position des linken Buttons */
var button_left_position_default = 		SFVec3f(-6.5, 	-4, 	0);
/** Default-Position des bewegbaren Buttons */
var button_move_position_default = 		SFVec3f(0, 		-4, 	0.1);
/** Default-Position des rechten Buttons */
var button_right_position_default = 	SFVec3f(6.5, 	-4, 	0);

/** Die Leiste in der sich der move-Button verschieben lassen kann */
var button_leiste = {"top": -3.0, "bottom": -6};

var BOX_ANZAHL = 12;

/** wo die Bilderboxen normalerweise liegen */
var box_position_default = [
	{x:-4.5, 	y:3, 		z:0},
	{x:-1.5, 	y:3, 		z:0},
	{x: 1.5, 	y:3, 		z:0},
	{x: 4.5, 	y:3, 		z:0},
	
	{x:-4.5, 	y:0.5, 		z:0},
	{x:-1.5, 	y:0.5, 		z:0},
	{x: 1.5, 	y:0.5, 		z:0},
	{x: 4.5, 	y:0.5, 		z:0},
	
	
	{x:-4.5, 	y:-2, 		z:0},
	{x:-1.5, 	y:-2, 		z:0},
	{x: 1.5, 	y:-2, 		z:0},
	{x: 4.5, 	y:-2, 		z:0}
];


/** die Boundingbox der Bilder in x und y-Richtung */
var box_bounding = {x:1, 	y:1};

/**
 * Mit dieser function kann die scale SFVec3f der gegebenen Boxnummer auf value gesetzt werden.
 */
function setScaleValue(box_number, value){
	switch(box_number){
		case 0:
			box_0_scale = value;
			break;
		case 1:
			box_1_scale = value;
			break;
		case 2:
			box_2_scale = value;
			break;
		case 3:
			box_3_scale = value;
			break;
		case 4:
			box_4_scale = value;
			break;
		case 5:
			box_5_scale = value;
			break;
		case 6:
			box_6_scale = value;
			break;
		case 7:
			box_7_scale = value;
			break;
		case 8:
			box_8_scale = value;
			break;	
		case 9:
			box_9_scale = value;
			break;	
		case 10:
			box_10_scale = value;
			break;	
		case 11:
			box_11_scale = value;
			break;		
	}
}

/**
 * Mit dieser function kann der Positions-SFVec3f der gegebenen Boxnummer auf value gesetzt werden.
 */
function setPositionValue(box_number, value){
	switch(box_number){
		case 0:
			box_0_pos = value;
			break;
		case 1:
			box_1_pos = value;
			break;
		case 2:
			box_2_pos = value;
			break;
		case 3:
			box_3_pos = value;
			break;
		case 4:
			box_4_pos = value;
			break;
		case 5:
			box_5_pos = value;
			break;
		case 6:
			box_6_pos = value;
			break;
		case 7:
			box_7_pos = value;
			break;
		case 8:
			box_8_pos = value;
			break;	
		case 9:
			box_9_pos = value;
			break;	
		case 10:
			box_10_pos = value;
			break;	
		case 11:
			box_11_pos = value;
			break;		
	}
}

/**
 * Mit dieser function kann der z-Wert der gegebenen Boxnummer auf value gesetzt werden.
 */
function setZValue(box_number, z){
	setPositionValue(box_number, 
		SFVec3f(box_position_default[box_number].x, box_position_default[box_number].y, z) );
}

/**
 * Mit dieser function kann der Javacode zum max/minimieren der Bilder aufgefordert werden.
 */
function doMaxMinBox(box_number, doMaxMin){
	switch(box_number){
		case 0:
			box_0_max = doMaxMin;
			break;
		case 1:
			box_1_max = doMaxMin;
			break;
		case 2:
			box_2_max = doMaxMin;
			break;
		case 3:
			box_3_max = doMaxMin;
			break;
		case 4:
			box_4_max = doMaxMin;
			break;
		case 5:
			box_5_max = doMaxMin;
			break;
		case 6:
			box_6_max = doMaxMin;
			break;
		case 7:
			box_7_max = doMaxMin;
			break;
		case 8:
			box_8_max = doMaxMin;
			break;	
		case 9:
			box_9_max = doMaxMin;
			break;	
		case 10:
			box_10_max = doMaxMin;
			break;	
		case 11:
			box_11_max = doMaxMin;
			break;		
	}
}

/**
 * Mit dieser function kann der time Wert der gegebenen Boxnummer auf time gesetzt werden.
 */
function setBoxTimeValue(box_number, time){
	switch(box_number){
		case 0:
			kinect_box_0_time = time;
			break;
		case 1:
			kinect_box_1_time = time;
			break;
		case 2:
			kinect_box_2_time = time;
			break;
		case 3:
			kinect_box_3_time = time;
			break;
		case 4:
			kinect_box_4_time = time;
			break;
		case 5:
			kinect_box_5_time = time;
			break;
		case 6:
			kinect_box_6_time = time;
			break;
		case 7:
			kinect_box_7_time = time;
			break;
		case 8:
			kinect_box_8_time = time;
			break;
		case 9:
			kinect_box_9_time = time;
			break;
		case 10:
			kinect_box_10_time = time;
			break;
		case 11:
			kinect_box_11_time = time;
			break;
	}
}            


/** 
 * Wird automatisch vom Instantplayer zum initialisieren aufgerufen.
 */ 
function initialize()
{
    hand_gruppe.render = false;
	plane_box.render = false;
	isKinectActive.render = false;
    create_skeleton(15);
	
	user_number = 0;
	
	letzte_box_nummer_scale = -1;
	button_move_position = button_move_position_default;
	clearGestureStorage();
	
	button_geste_text = MFString(" ");
	letzte_gesten_zeit = 0;
}

/** 
 * Erzeuge das Skelett fuer die Kinectgliedmassen.
 */
function create_skeleton(num_joints) 
{
    for(var i=0; i<num_joints; ++i)
    {
		if(i==8 || i==14)
		{
            var transform = Browser.currentScene.createNode("Transform");
            var shape = Browser.currentScene.createNode("Shape");
            var sphere = Browser.currentScene.createNode("Sphere");
            var appearance = Browser.currentScene.createNode("Appearance");
            var material = Browser.currentScene.createNode("Material");

            material.diffuseColor = SFColor(0.7, 0.2, 0.3);
            appearance.material = material;
            shape.geometry = sphere;
            shape.appearance = appearance;
            transform.children[0] = shape;
            transform.scale = SFVec3f(0.3, 0.3, 0.3);

            joints[i] = transform;

            hand_gruppe.children[hand_gruppe.children.length] = transform;
		}
    }
}

var count = 0;

function skeleton_orientation(rotation, time){
	//Browser.print("Ortientation changed\n");
	var orientation;
	count++;
	if(count>20){
		count = 0;
	}else{
		return;
	}
    for(var i=0; i<rotation.length; ++i){
		if(i==8){
			orientation = rotation[i];
			//Browser.print(i+": Orientation: "+orientation+"\n");
		}
	}
}

/** 
 * Wird immer aufgerufen, wenn sich die Anzahl der von der Kinect erkannten Personen aendert.
 */
function users_changed(number){
	var time = new Date();
	//Browser.print("User number changed to "+number+" at time: "+time.getTime()+"\n");
	if(user_number==0 && number>0){
		//Kugel ist blau, da eine Person sichtbar aber noch kein Skelett erkannt
		button_geste_farbe = SFColor(0, 0, 1);
		//Zeige dem Benutzer einen Text an, dass er analysiert wird
		isKinectActive.render = true;
	}else if(number==0){
		//Die Kugel ist schwarz da keine Person erkannt wird
		button_geste_farbe = SFColor(0, 0, 0);
		isKinectActive.render = false;
	}
	
	user_number = number;
}

function gesture_recognized(gesture){
	Browser.print("Gesture recognized is: "+gesture+"\n");
	
	
}

/**
 * Wird jedes mal aufgerufen, wenn die Kinect eine Aenderung registriert.
 *
 * @param kinect_joints Ein Array aller Glieder die die Kinect erfassen kann und deren Position.
 * @param time Der Zeitpunkt in Milisekunden der Aenderung.
*/
function hand_changed(kinect_joints, time) {
	isKinectActive.render = false;
    hand_gruppe.render = true;
	if(time-letzte_gesten_zeit>min_gesten_zeit_differenz){
		//es ist genug Zeit zur letzten Geste vergangen
		
		//signalisiere dem Benutzer, dass eine neue Geste gemacht werden darf
		button_geste_farbe = SFColor(0, 1, 0);
		button_geste_text = MFString(" ");
	}
	
	// Kinect events verarbeiten
	var punkt_x, punkt_y;
	
	// falls der Kopf die Kameraposition aendern darf
	if(kopf_dreht_mit) {
		var kopf_x = -kinect_joints[xnjoints.XN_SKEL_HEAD].x/100;
		var kopf_y = kinect_joints[xnjoints.XN_SKEL_HEAD].y/100;
		
		// Teilen und multiplizieren, damit die Kamera nicht so 'huepft' 
		kopf_x = kopf_x/30 * 30;
		kopf_y = kopf_y/30 * 30;
		
		if(kopf_default_y){
			kopf_y -=kopf_default_y;
		} else {
			kopf_default_y = kopf_y;
			kopf_y = 0;
		}
		
		vp_position = SFVec3f(kopf_x, kopf_y, 11);
		var rot_x = SFRotation(0, 1, 0, kopf_x/10);
		var rot_y = SFRotation(1, 0, 0, -kopf_y/10);
		vp_orientation = rot_x.multiply(rot_y);
	}
	
    for(var i=0; i<kinect_joints.length; ++i)
    {
		if(i == 8 || i==14)
		{			
			punkt_x = -kinect_joints[i].x/45;
			punkt_y =  kinect_joints[i].y/45;
			//verschiebe die Handbaelle an die neue Position
			joints[i].translation = SFVec3f(punkt_x, punkt_y, 1.5);
			
			// kinect in der Leiste
			if( (button_leiste.top>=punkt_y && punkt_y>= button_leiste.bottom)
				&& (button_move_position.x-1<=punkt_x && punkt_x<=button_move_position.x+1) ){
				
				button_move_position.x = punkt_x;
				button_move_text.render = false;
				if(button_move_position.x<=button_left_position_default.x){
					//linker button ausgewaehlt
					button_move_position.x = button_move_position_default.x;
					button_L = true;
					button_L_time = time;
					button_move_text.render = true;
				} else if (button_move_position.x>=button_right_position_default.x){
					//rechter button ausgewaehlt
					button_move_position.x = button_move_position_default.x;
					button_R = true;
					button_R_time = time;
					button_move_text.render = true;
				}
			}
			// kinect events vielleicht in einer der Bilderboxen
			else {	
				// nur wenn keine der Boxen maximiert ist
				if(!gewaehlte_box.ist_max)
					kinect_box(kinect_joints, time);
			}
		}
    }
	//verarbeite eventuelle Gesten des Benutzers
	handle_gesture(kinect_joints, time);
}

function handle_gesture(kinect_joints, time){
	// Zustaende notieren
	var jetziger_zustand  = {
		"zeit": time,
		"L": {
			"x":	kinect_joints[xnjoints.XN_SKEL_RIGHT_HAND].x,
			"y":	kinect_joints[xnjoints.XN_SKEL_RIGHT_HAND].y,
			"z":	kinect_joints[xnjoints.XN_SKEL_RIGHT_HAND].z, 
			"dX": 	0,
			"dY": 	0,
			"dZ": 	0,
			"tX" : 	0,
			"tY" : 	0,
			"tZ" : 	0
		}, "R": {
			"x":	kinect_joints[xnjoints.XN_SKEL_LEFT_HAND].x,
			"y":	kinect_joints[xnjoints.XN_SKEL_LEFT_HAND].y,
			"z":	kinect_joints[xnjoints.XN_SKEL_LEFT_HAND].z,
			"dX": 	0,
			"dY": 	0,
			"dZ": 	0,
			"tX" : 	0,
			"tY" : 	0,
			"tZ" : 	0
		}
	};
	
	if(zustandsliste.length>0){
		// mit dem vorigen Zustand vergleichen
		var voriger_zustand = zustandsliste[zustandsliste.length-1];
		var zeitDiff = jetziger_zustand.zeit - voriger_zustand.zeit;
		//events zu nahe bei einander koennen auch entstehen
		if(zeitDiff<=0)return;
		//Linke Hand: x-Wert jetzt minus xWert vorher ergibt die Distanz in x-Richtung
		jetziger_zustand.L.dX = jetziger_zustand.L.x - voriger_zustand.L.x;
		jetziger_zustand.L.dY = jetziger_zustand.L.y - voriger_zustand.L.y;
		jetziger_zustand.L.dZ = jetziger_zustand.L.z - voriger_zustand.L.z;
		//Linke Hand: x-Distanz durch Zeitdifferenz ergibt das Tempo in x-Richtung
		jetziger_zustand.L.tX = jetziger_zustand.L.dX / zeitDiff;
		jetziger_zustand.L.tY = jetziger_zustand.L.dY / zeitDiff;
		jetziger_zustand.L.tZ = jetziger_zustand.L.dZ / zeitDiff;
		//Browser.print("Diff-zz: "+jetziger_zustand.L.dZ+" Speed-z:"+jetziger_zustand.L.tZ+"\n");
	}
	
	// derzeitigen Zustand am Ende einfuegen
	zustandsliste[zustandsliste.length] = jetziger_zustand;
	
	
	
	// Berechnungen koennen beginnen wenn genug Werte gespeichert sind
	if(zustandsliste.length>=max_zustandsanzahl) {
		var erster_zustand = zustandsliste[0];
		
		//alles Berechnungen nur fuer die linke (Gesten)Hand
		
		// bevor neue Werte berechnet werden erst die Werte vom geloeschten Zustand abgeziehen
		aETempoVarianzL.x -=	Math.pow(erster_zustand.L.tX-aETempoMittL.x, 2)/max_zustandsanzahl;
		aETempoVarianzL.y -=	Math.pow(erster_zustand.L.tY-aETempoMittL.y, 2)/max_zustandsanzahl;
		aETempoVarianzL.Z -= 	Math.pow(erster_zustand.L.tZ-aETempoMittL.z, 2)/max_zustandsanzahl;
		
		// Tempomittelwert und Varianz errechnen
		aETempoMittL.x -= 		erster_zustand.L.tX/max_zustandsanzahl;
		aETempoMittL.y -= 		erster_zustand.L.tY/max_zustandsanzahl;
		aETempoMittL.z -= 		erster_zustand.L.tZ/max_zustandsanzahl;
		
		// Tempomittelwert und Varianz errechnen
		aETempoMittL.x += 		jetziger_zustand.L.tX/max_zustandsanzahl;
		aETempoMittL.y += 		jetziger_zustand.L.tY/max_zustandsanzahl;
		aETempoMittL.z += 		jetziger_zustand.L.tZ/max_zustandsanzahl;
		
		// nicht gerade die korrekte Art die Varianz zu berechnen, dafuer aber schnell
		aETempoVarianzL.x +=	Math.pow(jetziger_zustand.L.tX-aETempoMittL.x, 2)/max_zustandsanzahl;
		aETempoVarianzL.y +=   Math.pow(jetziger_zustand.L.tY-aETempoMittL.y, 2)/max_zustandsanzahl;
		aETempoVarianzL.z +=   Math.pow(jetziger_zustand.L.tZ-aETempoMittL.z, 2)/max_zustandsanzahl;
		
		var distanz = {
			"x": Math.abs(jetziger_zustand.L.x - erster_zustand.L.x),
			"y": Math.abs(jetziger_zustand.L.y - erster_zustand.L.y),
			"z": Math.abs(jetziger_zustand.L.z - erster_zustand.L.z)
		}
		
		var recognizedGesture;
		//falls eine neue Geste ausgeloest werden darf
		if(time-letzte_gesten_zeit>min_gesten_zeit_differenz) {
			// Geste erforderdert ruckartiges/schnelles links/rechts wischen
			//if(distanz.x > 0) {//max_zustandsanzahl*30
				if(aETempoMittL.x>1000) {
					if(gesten_kalibrieren)
						Browser.print(">>>x:L-R Speed: "+aETempoMittL.x+" Standard:"+Math.sqrt(aETempoVarianzL.x)+" Distanz:"+distanz.x+"\n");
					button_L = true;
					button_L_time = time;
					recognizedGesture = "+x";
				} else if(aETempoMittL.x<-1000) {
					Browser.print(">>>x:R-L Speed: "+aETempoMittL.x+" Standard:"+Math.sqrt(aETempoVarianzL.x)+" Distanz:"+distanz.x+"\n");
					button_R = true;
					button_R_time = time;
					recognizedGesture = "-x";
				}
			//} else if(distanz.y > 0) {//500
				else if(aETempoMittL.y>1000) {
					if(gesten_kalibrieren)
						Browser.print("---y:O-U Speed: "+aETempoMittL.y+" Standard:"+Math.sqrt(aETempoVarianzL.y)+" Distanz:"+distanz.y+"\n");
					// wechsle zur naechsten grossen Box
					//Browser.print("Boxindex: "+gewaehlte_box.index+" Gross? "+gewaehlte_box.ist_max+"\n");
					if(gewaehlte_box.index>=0 && gewaehlte_box.ist_max){
						doMaxMinBox(gewaehlte_box.index, SFBool(true));
						gewaehlte_box.index = (gewaehlte_box.index+1)%BOX_ANZAHL;
						doMaxMinBox(gewaehlte_box.index, SFBool(true));
					}
					recognizedGesture = "+y";					
				} else if(aETempoMittL.y<-1000){
					Browser.print("---y:U-O Speed: "+aETempoMittL.y+" Standard:"+Math.sqrt(aETempoVarianzL.y)+" Distanz:"+distanz.y+"\n");
					// wechsle zur vorigen Box
					if(gewaehlte_box.index>=0 && gewaehlte_box.ist_max){
						doMaxMinBox(gewaehlte_box.index, SFBool(true));
						gewaehlte_box.index = (gewaehlte_box.index-1)%BOX_ANZAHL;
						doMaxMinBox(gewaehlte_box.index, SFBool(true));
					}
					recognizedGesture = "-y";
				}
			else if(distanz.z > 300) {//300
				if(aETempoMittL.z>400) {
					if(gesten_kalibrieren)
						Browser.print("###z:V-Z Speed: "+aETempoMittL.z+" Standard:"+Math.sqrt(aETempoVarianzL.z)+" Distanz:"+distanz.z+"\n");
					// minimiere die mit rechts gewaehlte Bilderbox
					if(gewaehlte_box.index>=0 && gewaehlte_box.ist_max){
						doMaxMinBox(gewaehlte_box.index, SFBool(true));
						gewaehlte_box.ist_max = !gewaehlte_box.ist_max;
					}
					recognizedGesture = "+z";
				} else if(aETempoMittL.z<-400) {
					if(gesten_kalibrieren)
						Browser.print("###z:Z-V Speed: "+aETempoMittL.z+" Standard:"+Math.sqrt(aETempoVarianzL.z)+" Distanz:"+distanz.z+"\n");
					// maximiere die mit rechts gewaehlte Bilderbox
					if(gewaehlte_box.index>=0 && !gewaehlte_box.ist_max){
						doMaxMinBox(gewaehlte_box.index, SFBool(true));
						gewaehlte_box.ist_max = !gewaehlte_box.ist_max;
					}
					recognizedGesture = "-z";
				}
			}
		}
		
		// ersten Zustand entfernen, damit das Array eine konstante Groesse behaellt
		if(recognizedGesture){
			clearGestureStorage();
			letzte_gesten_zeit = time;
			button_geste_farbe = SFColor(1, 0, 0);
			button_geste_text = MFString(recognizedGesture);
		} else {
			zustandsliste = zustandsliste.slice(1);
		}
	} else {
		// Tempomittelwert und Varianz errechnen
		aETempoMittL.x += 		jetziger_zustand.L.tX/max_zustandsanzahl;
		aETempoMittL.y += 		jetziger_zustand.L.tY/max_zustandsanzahl;
		aETempoMittL.z += 		jetziger_zustand.L.tZ/max_zustandsanzahl;
		// nicht gerade die korrekte Art die Varianz zu berechnen, dafuer aber schnell
		aETempoVarianzL.x +=   Math.pow(jetziger_zustand.L.tX-aETempoMittL.x, 2)/max_zustandsanzahl;
		aETempoVarianzL.y +=   Math.pow(jetziger_zustand.L.tY-aETempoMittL.y, 2)/max_zustandsanzahl;
		aETempoVarianzL.z +=   Math.pow(jetziger_zustand.L.tZ-aETempoMittL.z, 2)/max_zustandsanzahl;
		
		//Browser.print("Speed-x: "+aETempoMittL.x+" Varianz-x:"+aETempoVarianzL.x+" Test:"+max_zustandsanzahl+"\n");
	}
}

function clearGestureStorage(){
	aETempoMittL.x = 0;
	aETempoMittL.y = 0;
	aETempoMittL.z = 0;
	aETempoVarianzL.x = 0;
	aETempoVarianzL.y = 0;
	aETempoVarianzL.z = 0;
	zustandsliste = new Array();
}

/** 
 * Wird aufgerufen, wenn ueberprueft werden soll, ob mit der Kinect eine der Bilderboxen beruehrt wurde.
 */
function kinect_box(kinect_joints, time) {
	var torso_z = kinect_joints[xnjoints.XN_SKEL_TORSO].z;

	var punkt_x, punkt_y, punkt_z;
	// vorerst sind die Boxen nur mit der linken Hand zu bedienen, daher keine Schleife
	var i = xnjoints.XN_SKEL_LEFT_HAND;
	//for(var i=0; i<kinect_joints.length; ++i) {
	{
		punkt_x = -kinect_joints[i].x/45;
		punkt_y =  kinect_joints[i].y/45;
		punkt_z =  kinect_joints[i].z;
		//man kann nur mit der rechten Hand Bilder vergroessern
		//der linke Skelettknoten ist der rechte Handball auf dem Bildschirm...
		if(i==xnjoints.XN_SKEL_LEFT_HAND) {	
			
			if(gewaehlte_box.index>=0 && istInBox(punkt_x, punkt_y, gewaehlte_box.index) ){
				//die Box ist bereits vergroessert, man muss kaum noch etwas machen
				if(Math.abs(torso_z-punkt_z)>400){
					setScaleValue(gewaehlte_box.index, SFVec3f(2, 2, 1));
					setZValue(gewaehlte_box.index, 0.5);
				} else {
					setScaleValue(gewaehlte_box.index, SFVec3f(1.3, 1.3, 1));
					setZValue(gewaehlte_box.index, 0.5);
				}
				return;
			}
			
			for(var j=0; j < BOX_ANZAHL; j++){
				if(istInBox(punkt_x, punkt_y, j)) {
					// setzen die Groesse der letzten vergroesserten Box zurueck
					if(gewaehlte_box.index>=0){
						setScaleValue(gewaehlte_box.index, SFVec3f(1, 1, 1));
						setZValue(gewaehlte_box.index, 0);
					}
					
					gewaehlte_box.index = j;
					//Browser.print("Torso-z: "+torso_z+" Hand-z: "+punkt_z+"\n");
					//vergroesserung abhaengig davon ob der rechte Arm gestreckt ist oder nicht
					if(Math.abs(torso_z-punkt_z)>400){
						setScaleValue(gewaehlte_box.index, SFVec3f(2, 2, 1));
						setZValue(gewaehlte_box.index, 0.5);
					} else {
						setScaleValue(gewaehlte_box.index, SFVec3f(1.3, 1.3, 1));
						setZValue(gewaehlte_box.index, 0.5);
					}
					
					break;
				}else if(j+1 == BOX_ANZAHL.length){
					// falls kein passender Button/Box gefunden wurde muss sollte 
					// die vergroesserte Box wieder  normal gemacht werden
					if(gewaehlte_box.index>=0){
						setScaleValue(gewaehlte_box.index, SFVec3f(1, 1, 1));
						setZValue(gewaehlte_box.index, 0);	
					}
					gewaehlte_box.index = -1;
				}
			}
		}
	}
}

/**
 * Liefert wahr zurueck falls der Punkt in der boundingbox von der gegebenen Boxnummer ist.
 */
function istInBox(punkt_x, punkt_y, box_nummer){
	return (punkt_x >= box_position_default[box_nummer].x-box_bounding.x &&
			punkt_x <= box_position_default[box_nummer].x+box_bounding.x)
		&& (punkt_y >= box_position_default[box_nummer].y-box_bounding.y &&
			punkt_y <= box_position_default[box_nummer].y+box_bounding.y); 
}
