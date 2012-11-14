/*
 ------------------------------------------
  Aufbau
 ------------------------------------------
 Javascript verarbeitet alle Kinectwerte und nimmt, je nachdem wie die flags unten
 gesetzt sind, auch leichte Modifikationen an dem Szenengraph durch. 
 
 Die interessanten Funktionen sind im Mittelteil angesiedelt und besitzen oft ein
 handle_ oder calculate_ im Namen. calculate_gestures ist interessant, weil hier die
 Gestenerkennung stattfindet. hand_changed ist wichtig, weil hier die von der Kinect
 ermittelten Skelettwerte erstmalig verarbeitet werden. Die Methode ist leicht lang
 geraten. In handle_box wird zT entschieden welche Bilderboxen vergroessert/verkleinert
 werden. In handle_gestures werden errechnete Gestenwerte Gesten zugeordnet und ausgefuehrt.
 
 Ansonsten befinden sich am Anfang dieser Datei sehr viele Konstanten die man nutzen kann
 um das Programm an unterschiedliche Bedingungen anzupassen. Hier sind u.a. auch die
 Werte vermerkt die zum Erkennen der Kinectgesten genutzt werden.
*/

/*
Kleine Hilfe zu Rotationen

 In general, multiply the number of degrees by pi/180.
Degrees   Radians

   0  0

   45  0.78

   90  1.57

   135  2.36

   180  3.14 (pi)

   225  3.93

   270  4.71

   315  5.5

   360  6.28 (2*pi)
   */
   
//--------------------------
// Konstanten
//--------------------------
/** Die ids die Kinect fuer die Gliedmassen nutzt. */
var XNJOINTS = {  
	"XN_SKEL_HEAD": 0,   
	"XN_SKEL_TORSO": 2, 
	"XN_SKEL_WAIST" : 3,
	"XN_SKEL_LEFT_HAND": 8,
	"XN_SKEL_RIGHT_HAND": 14
};


/** Auf true setzen damit der Kopf die Kamera beeinflusst. */
var HEAD_TRACKING = true;

/** Auf wahr setzen fuer extra debug-Ausgaben zum kalibrieren. Zeigt die Werte der erkannten Gesten an. */
var CALIBRATE_GESTURES = true;
/** Auf wahr setzen fuer extra debug-Ausgaben zum kalibrieren. Zeigt die Werte der nicht erkannten Gesten an. */
var CALIBRATE_GESTURES_SHOW_OTHERS = true;
/** Falls alle Gesten 'seltsam' sind hier die Koordinate (string: x,y,z) eintragen die viele Konsolenausgaben bekommen soll. */
var CALIBRATE_EXTREME_GESTURES;
/** Maximale Anzahl an Zustaenden die der Gestenerkenner speichern soll. */
var MAX_GESTURE_STATE_COUNT = 5;
/** Minimale Zeitdifferenz zwischen zwei Gesten in Sekunden */
var MIN_TIME_BETWEEN_GESTURES = 1.0;
/** Zeit die nach dem Erkennen des Skeletts einer Person bis zur ersten Geste gewartet werden soll */
var STARTUP_TIME_TO_FIRST_GESTURE = 1.0;
/** Zeit die zwischen zwei gegensaetzlichen Gesten (zB +y und -y) vergehen muss. Vorteilhaft damit man schnell +y,+y,+y machen kann.*/
var TIME_BETWEEN_OPOSITE_GESTURES = 2.0;

/** Die minimale Gestengeschwindigkeit um die x-Geste zu aktivieren */
var GESTURE_MIN_SPEED_ACTIVATE_X = 1800;
/** Die minimale Gestendistanz um die x-Geste zu aktivieren */
var GESTURE_MIN_DISTANCE_ACTIVATE_X = 80;
/** Die minimale Gestengeschwindigkeitstandardabweichung um die x-Geste zu aktivieren. 
 *  Ruckartige Gesten sollten eine Hohe Varianz haben */
var GESTURE_MIN_STANDARD_ACTIVATE_X = 600;
/** Die minimale Gestengebeschleunigung um die x-Geste zu aktivieren */
var GESTURE_MIN_ACC_ACTIVATE_X = 25000;

/** Die minimale Gestengeschwindigkeit um die y-Geste zu aktivieren */
var GESTURE_MIN_SPEED_ACTIVATE_Y = 1550;
/** Die minimale Gestendistanz um die y-Geste zu aktivieren */
var GESTURE_MIN_DISTANCE_ACTIVATE_Y = 40;
/** Die minimale Gestengeschwindigkeitsvarianz um die y-Geste zu aktivieren */
var GESTURE_MIN_STANDARD_ACTIVATE_Y = 700;//550 vorher
/** Die minimale Gestengebeschleunigung um die y-Geste zu aktivieren */
var GESTURE_MIN_ACC_ACTIVATE_Y = 5000; //30000 vorher

/** Die minimale Gestengeschwindigkeit um die z-Geste zu aktivieren */
var GESTURE_MIN_SPEED_ACTIVATE_Z = 600;
/** Die minimale Gestendistanz um die z-Geste zu aktivieren */
var GESTURE_MIN_DISTANCE_ACTIVATE_Z = 200;
/** Die minimale Gestengeschwindigkeitsvarianz um die z-Geste zu aktivieren */
var GESTURE_MIN_STANDARD_ACTIVATE_Z = 100;
/** Die minimale Gestengebeschleunigung um die z-Geste zu aktivieren */
var GESTURE_MIN_ACC_ACTIVATE_Z = 10000;

/** Minimale Distanz vom Koerper um eine Geste ausloesen zu koennen. */
var GESTURE_MIN_DISTANCE = 300;

/** z-Wert ab dem der Fokus der Bilderbox aktiviert wird. */
var BOX_FOCUS_ACTIVATE_Z = 500;
/** z-Wert ab dem der Fokus der Bilderbox auch wieder deaktiviert werden kann. */
var BOX_FOCUS_MOVE_Z = BOX_FOCUS_ACTIVATE_Z-30;
/** z-Wert bei dem die Box maximiert ist, wenn vorher der Fokus aktiviert wurde. */
var BOX_MAX_Z = 350;


/** der Wert durch den der Kinect x-Wert geteilt werden muss, um ihn ins hiesige Koordinationsystem zu uebertragen */
var DIVIDE_KINECT_X_BY = 45;
/** der Wert durch den der Kinect y-Wert geteilt werden muss, um ihn ins hiesige Koordinationsystem zu uebertragen */
var DIVIDE_KINECT_Y_BY = 45;


/** Wahr, falls der move-Button zum Tagwechseln aktiv sein soll. */
var USE_MOVE_BUTTON = false;
/** Default-Position des linken Buttons */
var BUTTON_LEFT_DEFAULT_POSITION = 		SFVec3f(-6.5, 	-4, 	0);
/** Default-Position des bewegbaren Buttons */
var BUTTON_MOVE_DEFAULT_POSITION = 		SFVec3f(0, 		-4, 	0.1);
/** Default-Position des rechten Buttons */
var BUTTON_RIGHT_DEFAULT_POSITION = 	SFVec3f(6.5, 	-4, 	0);
/** Die Leiste in der sich der move-Button verschieben lassen kann */
var BUTTON_MOVE_AREA_Y = {"top": -3.0, "bottom": -6};


/** Wie viele Boxen interaktionen haben sollen. */
var BOX_COUNT = 12;
/** wo die Bilderboxen normalerweise liegen */
var BOX_POSITION_DEFAULT = [
	SFVec3f(-4.5, 3, 0),
	SFVec3f(-1.5, 3, 0),
	SFVec3f(1.5, 3, 0),
	SFVec3f(4.5, 3, 0),
	
	SFVec3f(-4.5, 0.5, 0),
	SFVec3f(-1.5, 0.5, 0),
	SFVec3f(1.5, 0.5, 0),
	SFVec3f(4.5, 0.5, 0),
	
	SFVec3f(-4.5, -2, 0),
	SFVec3f(-1.5, -2, 0),
	SFVec3f(1.5, -2, 0),
	SFVec3f(4.5, -2, 0)
];
/** Die Groesse einer minimierten Box */
var BOX_SCALE_MIN = SFVec3f(1, 1, 1);
/** Die Groesse einer mit der Kinect fokusierten Box */
var BOX_SCALE_HOVER = SFVec3f(1.3, 1.3, 1);
/** Die Groesse einer maximierten Box */
var BOX_SCALE_MAX = SFVec3f(3, 2.7, 1);
/** Die Position einer maximierten Box */
var BOX_POSITION_MAX = SFVec3f(0, 0.35, 3);
/** die normale Boundingbox jeder Box in x und y-Richtung, also wenn die Box nicht fokusiert/maxmiert ist */
var BOX_DEFAULT_BOUNDING = {x:1, 	y:1};



//--------------------------
// final Variablen, sollten nur einmal gesetzt werden
//--------------------------
/** Die Defaultposition des Kopfes den die Kinect registriert. */
var HEAD_DEFAULT_Y;
/** Der Zeitpunkt an dem das erste mal das Skelett erkannt wurde. */
var TIME_FIRST_RECOGNITION;



//--------------------------
// public Variablen
//--------------------------
/** 
 * Ein array aller Gliedmassen die Kinect registriert. 
 * Wird eigentlich nur fuer das Anzeigen der Haende genutzt. 
 */
var joints = new Array();

/** Die Anzahl an von der Kinect erkannten Personen */
var user_number;

var globalStateArray;

/** Geschwindigkeitsmittelwert zwischen A(nfang) und E(nde) des Zustandsarrays */
var speedMedian = {
	L : {
		x: 0,
		y: 0,
		z: 0
	},
	R : {
		x: 0,
		y: 0,
		z: 0
	}
};

/** Geschwindigkeitsvarianz zwischen A(nfang) und E(nde) des Zustandsarrays */
var speedVariance = {
	L:{
		x: 0,
		y: 0,
		z: 0
	},
	R :{
		x: 0,
		y: 0,
		z: 0
	}
};

/** Gibt die Milisekunden an als die letzte Geste gemacht wurde */
var last_gesture_time;

/** Letzte Geste die gemacht wurde. */
var last_gesture;

/** Push-Lock bedeutet das auf Bilderboxen kein z-Push/Fokus ausgefuehrt werden darf. */
var is_push_lock_on;

/** Eigenschaften der letzten Box die vergroessert wurde */
var selected_box = {
	"STATE_MIN" : -2,
	"STATE_FOCUS_ABORT" : -1,
	"STATE_FOCUS_ACTIVATE" : 0,
	"STATE_FOCUS_USE" : 1,
	"STATE_MAX" : 2
};

selected_box.L = {
  "index" : -1,
  "is_max": function(){return selected_box.L.state==selected_box.STATE_MAX},
  "has_focus": function(){return (selected_box.L.state==selected_box.STATE_FOCUS_ACTIVATE || selected_box.L.state==selected_box.STATE_FOCUS_USE)},
  "has_used_focus": function(){return (selected_box.L.state==selected_box.STATE_FOCUS_USE)},
  "state": selected_box.STATE_MIN
};
selected_box.R = {
  "index" : -1,
  "is_max": function(){return selected_box.R.state==selected_box.STATE_MAX},
  "has_focus": function(){return (selected_box.R.state==selected_box.STATE_FOCUS_ACTIVATE || selected_box.R.state==selected_box.STATE_FOCUS_USE)},
  "has_used_focus": function(){return (selected_box.R.state==selected_box.STATE_FOCUS_USE)},
  "state": selected_box.STATE_MIN
};


//--------------------------
// Methoden zum Setzten von Routen
//--------------------------
/**
 * Mit dieser function kann die scale SFVec3f der gegebenen Boxnummer auf value gesetzt werden.
 * @param box_number Die Nummer der Box deren Wert gesetzt werden soll
 * @param value Die neue Groesse der Box als SFVec3f angegeben.
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
 * @param box_number Die Nummer der Box deren Wert gesetzt werden soll
 * @param value Die neue Position der Box. Ein SFVec3f-Object.
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
 * 
 * @param box_number Die Nummer der Box deren Wert gesetzt werden soll
 * @param z Der neue z-Wert der Box
 */
function setZValue(box_number, z){
	setPositionValue(box_number, 
		SFVec3f(BOX_POSITION_DEFAULT[box_number].x, BOX_POSITION_DEFAULT[box_number].y, z) );
}

/**
 * Mit dieser function kann der Javacode zum max/minimieren der Bilder aufgefordert werden. 
 * Dafuer wird die isActive-Route des TouchSensors genutzt.
 * 
 * @param box_number Die Nummer der Box die maximiert/minimiert werden soll
 * @param isActive Wahr wenn die Box maximiert werden soll, sonst falsch
 */
function setActiveBox(box_number, isActive){
	switch(box_number){
		case 0:
			box_0_max = isActive;
			break;
		case 1:
			box_1_max = isActive;
			break;
		case 2:
			box_2_max = isActive;
			break;
		case 3:
			box_3_max = isActive;
			break;
		case 4:
			box_4_max = isActive;
			break;
		case 5:
			box_5_max = isActive;
			break;
		case 6:
			box_6_max = isActive;
			break;
		case 7:
			box_7_max = isActive;
			break;
		case 8:
			box_8_max = isActive;
			break;	
		case 9:
			box_9_max = isActive;
			break;	
		case 10:
			box_10_max = isActive;
			break;	
		case 11:
			box_11_max = isActive;
			break;		
	}
}

/**
 * Mit dieser function kann der time Wert der gegebenen Boxnummer auf time gesetzt werden.
 * @param box_number Die Nummer der Box dessen Zeitsensor gesetzt werden soll
 * @param time Die Zeit die gestgesetzt werden soll
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



//------------------------------------
// X3d-methoden
//------------------------------------
/** 
 * Wird automatisch vom Instantplayer zum Initialisieren aufgerufen.
 */ 
function initialize() {
    hand_gruppe.render = false;
	plane_box.render = false;
	isKinectActive.render = false;
    create_skeleton(15);
	
	user_number = 0;
	
	letzte_box_nummer_scale = -1;
	button_move_position = BUTTON_MOVE_DEFAULT_POSITION;
	clearGestureStorage();
	
	button_geste_text = MFString(" ");
	last_gesture_time = 0;
	
	// es wurde noch keine Geste gemacht
	last_gesture = "";
	
	if(!USE_MOVE_BUTTON){
		// falls der move-Butto nicht benutzt werden soll
		button_move_text.render = false;
		button_move.render = false;
	}
}

/** 
 * Wird automatisch vom Instantplayer vor dem Beenden aufgerufen.
 */ 
function shutdown() {
  // Your code here...
}


//------------------------------------
// von der Kinect aufgerufene Methoden
//------------------------------------
/* Testvariablen nur fuer diese Funktion */
var countO = 0;
var min_angle = 0;
var max_angle = 0;
/** 
 * Wird immer aufgerufen, wenn sich die Orientierung der von der Kinect erkannten Gliedmassen aendert.
 * 
 * @param rotation Die Orientierung/Rotation der Gliedmassen. Ein Array von SFRotation
 * @param time Der Erkennungszeitpunkt
 */
function skeleton_orientation(rotation, time) {
	//Browser.print("Ortientation changed\n");
	var orientation;
	countO++;
	if(countO>20){
		countO = 0;
	}else{
		return;
	}
    for(var i=0; i<rotation.length; ++i){
		if(i==XNJOINTS.XN_SKEL_HEAD){
			orientation = rotation[i];
			var angle = orientation.angle*180/3.14*orientation.y;
			if(angle<min_angle){
				//print("MinOrientation: "+orientation+" Angle:"+angle);
				min_angle = angle;
			}else if(angle>max_angle){
				//print("MaxOrientation: "+orientation+" Angle:"+angle);
				max_angle = angle;
			}
			//if(angle<-3)print("Min");
			//else if(angle>3)print("Max");
		}
	}
}

/** 
 * Wird immer aufgerufen, wenn sich die Anzahl der von der Kinect erkannten Personen aendert.
 * 
 * @param number Die Anzahl der erkannten Personen.
 */
function users_changed(number){
	var time = new Date();
	//Browser.print("User number changed to "+number+" at time: "+time.getTime()+"\n");
	if(user_number==0 && number>0){
		//Kugel ist blau, da eine Person sichtbar aber noch kein Skelett erkannt
		button_geste_farbe = SFColor(0, 0, 1);
		//Zeige dem Benutzer einen Text an, dass er analysiert wird
		isKinectActive.render = true;
		TIME_FIRST_RECOGNITION = undefined;
	}else if(number==0){
		//Die Kugel ist schwarz da keine Person erkannt wird
		button_geste_farbe = SFColor(0, 0, 0);
		isKinectActive.render = false;
	}
	
	user_number = number;
}

/** 
 * Wird immer aufgerufen, wenn eine Geste erkannt wurde. 
 * 
 * @note Scheint nicht implementiert zu sein.
 * @param gesture Ich nehme an diese Methode erhaellt nur einen Wert.
 */
function gesture_recognized(gesture){
	print("Gesture recognized is: "+gesture);
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
	
	// baue eine leichte Verzoegerung ein, damit das ploetzliche Arme runtern nehmen nach der PSI-Pose
	// nicht aus-versehen eine Geste ausloest
	if(!TIME_FIRST_RECOGNITION){
		// das Skelett wurde zum ersten Mal erkannt
		TIME_FIRST_RECOGNITION = time;
		// der Benutzer kann noch keine Geste machen
		button_geste_farbe = SFColor(1, 0, 0);
		button_geste_text = MFString(".");
		return;
	}else if(time-TIME_FIRST_RECOGNITION<STARTUP_TIME_TO_FIRST_GESTURE){
		//es ist noch nicht genug Zeit verstrichen seit dem die Anwendung gestartet wurde
		return;
	}
	
	if(time-last_gesture_time>MIN_TIME_BETWEEN_GESTURES){
		//es ist genug Zeit zur letzten Geste vergangen
		//signalisiere dem Benutzer, dass eine neue Geste gemacht werden darf
		button_geste_farbe = SFColor(0, 1, 0);
		button_geste_text = MFString(" ");
	}
	
	// falls der Kopf die Kameraposition aendern darf
	if(HEAD_TRACKING) {
		set_camera_position(kinect_joints);
	}
	
	
	var point_l_z = kinect_joints[XNJOINTS.XN_SKEL_RIGHT_HAND].z;
	var point_r_z = kinect_joints[XNJOINTS.XN_SKEL_LEFT_HAND].z;
	var torso_z = kinect_joints[XNJOINTS.XN_SKEL_WAIST].z;
	

	// ob Gesten links/rechts erlaubt sind haengt davon ab, ob mit einer Hand schon fokusiert wurde oder welche Hand naeher der Kamera ist
	var allow_left = selected_box.L.has_focus() 
		|| (!selected_box.R.has_focus() && point_l_z>=point_r_z
				&& Math.abs(point_l_z-torso_z)>GESTURE_MIN_DISTANCE);	
	var allow_right = selected_box.R.has_focus() 
		|| (!selected_box.L.has_focus() && point_r_z>point_l_z 
				&& Math.abs(point_r_z-torso_z)>GESTURE_MIN_DISTANCE);
	
	if(is_push_lock_on){
		//push-Lock bedeutet, dass Bilderboxen nicht in der z-Achse 'gepushed' werden duerfen
		// die Idee ist, dass nach einer +z-Geste keine Box fokusiert werden soll
		// man kann nicht fokusieren/pushen bis die Haende in Ausgangsposition ist
		if(Math.abs(point_l_z-torso_z)<BOX_FOCUS_MOVE_Z && Math.abs(point_r_z-torso_z)<BOX_FOCUS_MOVE_Z )
			is_push_lock_on = false;
	}
	
	//zeige nur den Handballen der interagieren darf
	if(allow_left){
		hand_gruppe.children[1].render = true;
		hand_gruppe.children[0].render = false;
	} else if(allow_right){
		hand_gruppe.children[1].render = false;
		hand_gruppe.children[0].render = true;
	}

	//allow_left = true;
	//allow_right = true;
	//print("Allow L: "+allow_left+", Allow R: "+allow_right+", SelBox.L:"+selected_box.L.has_focus()+", SelBox.R:"+selected_box.R.has_focus());
	
	// Kinect events verarbeiten
	var point_x, point_y, point_z;
	var used_move_button = false;
	
	
	
	for(var i=0; i<kinect_joints.length; ++i) {
		if(i==XNJOINTS.XN_SKEL_LEFT_HAND || i==XNJOINTS.XN_SKEL_RIGHT_HAND) {
			point_x = -kinect_joints[i].x/DIVIDE_KINECT_X_BY;
			point_y =  kinect_joints[i].y/DIVIDE_KINECT_Y_BY;
			//point z ist ein negativer Wert der groesser Wird je naeher er an der Kamera ist
			point_z = kinect_joints[i].z;
			//verschiebe die Handbaelle an die neue Position
			joints[i].translation = SFVec3f(point_x, point_y, 1.5);
			
			if(USE_MOVE_BUTTON){
			// kinect eventuell in der move-Button-Gegend
				used_move_button = used_move_button || handle_move_button(point_x, point_y);
			}
			// kinect events sind vielleicht in einer der Bilderboxen
			else {	
				// nur wenn keine der Boxen maximiert ist
				if(!selected_box.L.is_max() && !selected_box.R.is_max()) {
					//@note: der linke Skelettknoten ist der rechte Handball auf dem Bildschirm und umgekehrt
					// immer wenn im Code von links geredet wird ist also der linke Handball gemeint
					if(i==XNJOINTS.XN_SKEL_LEFT_HAND && !is_push_lock_on){
						//falls die rechte Hand den Bildfokus ausgeloest hat oder die rechte Hand naeher an der Kamera ist
						handle_box(selected_box.R, point_x, point_y, point_z, torso_z, allow_right);	
					} else if(i==XNJOINTS.XN_SKEL_RIGHT_HAND && !is_push_lock_on){
						//falls die linke Hand den Bildfokus ausgeloest hat oder die linke Hand naeher an der Kamera ist
						handle_box(selected_box.L, point_x, point_y, point_z, torso_z, allow_left);
					}
				}
			}
		}
	}
	
	if(USE_MOVE_BUTTON && !used_move_button){
		// falls der move-Button in dieser Runde nicht benutzt wurde setze ihn zurueck
		button_move_position.x = BUTTON_MOVE_DEFAULT_POSITION.x;
		button_move_text.render = true;
	}
	// erzeuge einen neuen Zustand
	var current_state  = getStandardGestureState(kinect_joints, time);
	
	//verarbeite eventuelle Gesten des Benutzers fuer links und rechts	
	//print("Laenge links: "+globalStateArray.L.length);
	//print("Laenge rechts: "+globalStateArray.R.length);
	calculate_gestures(kinect_joints, time, current_state.L, globalStateArray.L, allow_left);
	calculate_gestures(kinect_joints, time, current_state.R, globalStateArray.R, allow_right);
	if(globalStateArray.L.length>MAX_GESTURE_STATE_COUNT)globalStateArray.L = globalStateArray.L.slice((-1)*MAX_GESTURE_STATE_COUNT);
	if(globalStateArray.R.length>MAX_GESTURE_STATE_COUNT)globalStateArray.R = globalStateArray.R.slice((-1)*MAX_GESTURE_STATE_COUNT);
	//print("Left length is: "+globalStateArray.R.length);
}


//------------------------------------
// main Methoden
//------------------------------------
/** 
 * Erzeuge das Skelett fuer die Kinectgliedmassen.
 * @param num_joints Die Anzahl der joints des zu erzeugenden Skeletts
 */
function create_skeleton(num_joints) {
    for(var i=0; i<num_joints; ++i) {
        if(i==8 || i==14) {
				var transform = Browser.currentScene.createNode("Transform");
				var shape = Browser.currentScene.createNode("Shape");
				var sphere = Browser.currentScene.createNode("Sphere");
				var appearance = Browser.currentScene.createNode("Appearance");
				var material = Browser.currentScene.createNode("Material");

				if(i==8)
					material.diffuseColor = SFColor(0.7, 0.2, 0.3);
				else if(i==14)
					material.diffuseColor = SFColor(0.2, 0.7, 0.3);
					
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

function set_camera_position(kinect_joints){
	var kopf_x = -kinect_joints[XNJOINTS.XN_SKEL_HEAD].x/100;
	var kopf_y = kinect_joints[XNJOINTS.XN_SKEL_HEAD].y/100;
	
	// Teilen und multiplizieren, damit die Kamera nicht sehr kleine 'Minispruenge' macht
	// simple Loesung fuer ein komplizierteres Problem; fuer bessere Ergebnisse sollte man aber einen Filter nutzen
	kopf_x = kopf_x/30 * 30;
	kopf_y = kopf_y/30 * 30;
	
	if(HEAD_DEFAULT_Y){
		kopf_y -=HEAD_DEFAULT_Y;
	} else {
		HEAD_DEFAULT_Y = kopf_y;
		kopf_y = 0;
	}
	
	vp_position = SFVec3f(kopf_x, kopf_y, 11);
	var rot_x = SFRotation(0, 1, 0, kopf_x/10);
	var rot_y = SFRotation(1, 0, 0, -kopf_y/10);
	vp_orientation = rot_x.multiply(rot_y);
}

/**
 * Uebernimmt die Interaktion mit dem move-Button. Falls die x,y-Werte ueber dem move-Button sind
 * wird dieser korrekt verschoben und fuehrt eventuell eine Aktion aus.
 *
 * @param point_x Der x-Wert der aktuellen Hand
 * @param point_y Der y-Wert der aktuellen Hand
 */
function handle_move_button(point_x, point_y){
	if(isAboveMoveButton(point_x, point_y)){
		// falls der Button interagierbar sein soll
		button_move_position.x = point_x;
		button_move_text.render = false;
		if(button_move_position.x<=BUTTON_LEFT_DEFAULT_POSITION.x){
			//linker button ausgewaehlt
			button_move_position.x = BUTTON_MOVE_DEFAULT_POSITION.x;
			button_L = true;
			//button_L_time = time;
			button_move_text.render = true;
		} else if (button_move_position.x>=BUTTON_RIGHT_DEFAULT_POSITION.x){
			//rechter button ausgewaehlt
			button_move_position.x = BUTTON_MOVE_DEFAULT_POSITION.x;
			button_R = true;
			//button_R_time = time;
			button_move_text.render = true;
		}
		//es wurde mit dem move-Button interagiert
		return true;
	}
	// es wurde nicht interagiert
	return false;
}

/**
 * Maximiert, fokusiert, minimiert die Bilderboxen.
 *
 * @param sel_box Die mit der aktuellen Hand gewaehlte Box.
 * @param point_x x-Koordinate der aktuellen Hand.
 * @param point_y y-Koordinate der aktuellen Hand.
 * @param point_z z-Koordinate der aktuellen Hand.
 * @param torso_z z-Koordinate des Benutzertorsos.
 * @param allow_interaction Wahr, falls Benutzerinteraktion erlaubt ist.
 */
function handle_box(sel_box, point_x, point_y, point_z, torso_z, allow_interaction){
	// wenn der Benutzer bereits Fokus auf der Box hat entsteht ein 'lock-in' auf diese Box
	
	if(allow_interaction && sel_box.index>=0 && (sel_box.has_used_focus() || isAboveBox(point_x, point_y, sel_box.index)) ){
		//die Box ist bereits fokusiert, man muss sie aber eventuell maximieren
		handleMaximizeBox(point_z, torso_z, sel_box, sel_box.index);
		return;
	}else if(!allow_interaction && sel_box.index>=0){
		// interaktion is nicht (mehr) erlaubt, also muss die fokusierte Box wieder klein gemacht werden
		minimizeBox(sel_box, sel_box.index);
		return;
	}
	
	for(var j=0; j < BOX_COUNT; j++){
		if(isAboveBox(point_x, point_y, j)) {
			//print("isAboveBox; is the box max?=>"+sel_box.is_max());
			// setzen die Groesse der letzten vergroesserten Box zurueck
			if(sel_box.index>=0){
				minimizeBox(sel_box, sel_box.index);
				sel_box.index = -1;
			}
			
			//Browser.print("Torso-z: "+torso_z+" Hand-z: "+point_z+"\n");
			//vergroesserung abhaengig davon ob der rechte Arm gestreckt ist oder nicht
			handleMaximizeBox(point_z, torso_z, sel_box, j);
			
			break;
		}else if(j+1 == BOX_COUNT.length){
			// falls kein passender Button/Box gefunden wurde muss sollte 
			// die vergroesserte Box wieder normal gemacht werden
			if(sel_box.index>=0){
				minimizeBox(sel_box, sel_box.index);
				sel_box.index = -1;
			}
		}
	}
}

/**
 * Minimiere die Box ohne wenn und aber und setzt den Zustand entsprechend auf MIN.
 *
 * @param sel_box Beschreibt die zu minimierenden Box.
 * @param box_number Der Index der Box.
 */
function minimizeBox(sel_box, box_number){
	sel_box.state=selected_box.STATE_MIN;
	setScaleValue(box_number, BOX_SCALE_MIN);
	setPositionValue(box_number, BOX_POSITION_DEFAULT[box_number]);	
}


// Variable nur fuer diese Box zum Debuggen.
// Sorgt dafuert, dass nicht alle Werte auf der Konsole ausgegeben werden.
var count_max = 0;

/**
 * Maximiert die Box, falls die Werte korrekt sind fuer den Vorgang.
 * Setzt den index von sel_box auf die gegebene box_number.
 * Setzt den Zustand der Box auch entsprechend.
 *
 * @param point_z z-Wert der aktuellen Hand
 * @param torso_z z-Wert des Torsos des Benutzers
 * @param sel_box Beschreibt die zu maximierende Box.
 * @param box_number Der Index der Box.
 */
function handleMaximizeBox(point_z, torso_z, sel_box, box_number) {
	count_max++;
	if(count_max>20)count_max = 0;
	// Differenz zwischen Torso und Hand in der z-Achse
	// Der Wert liegt so in der Regel zwischen 200 (Hand am torso) und 500/600
	var diff_torso_hand_z = Math.abs(torso_z-point_z);
	
	sel_box.index = box_number;
	
	// interpolieren von den neuen Boxpositionen
	// interpolator soll zwischen 1 und 0 liegen
	var interpolator = getZInterpolator(diff_torso_hand_z);
	var tmp_x = (BOX_POSITION_MAX.x*(1-interpolator)) + (BOX_POSITION_DEFAULT[box_number].x*interpolator);
	var tmp_y = (BOX_POSITION_MAX.y*(1-interpolator)) + (BOX_POSITION_DEFAULT[box_number].y*interpolator);
	var tmp_z = (BOX_POSITION_MAX.z*(1-interpolator)) + (BOX_POSITION_DEFAULT[box_number].z*interpolator);
	
	switch(sel_box.state){
		case selected_box.STATE_MIN:
			//if(count_max==20)print(diff_torso_hand_z+" State MIN "+tmp_z);
			if(diff_torso_hand_z>BOX_FOCUS_ACTIVATE_Z){
				// der Nutzer hat die Vergroesserung der Box activiert
				sel_box.state=selected_box.STATE_FOCUS_ACTIVATE;
			} else {
				// der Benutzer faehrt nur ueber die Box
				setScaleValue(sel_box.index, BOX_SCALE_HOVER);
				setZValue(sel_box.index, 0.5);
			}
		break;
		case selected_box.STATE_FOCUS_ABORT:
			// der Benutzer hat das Vergroessern abgebrochen
			//if(count_max==20)print(diff_torso_hand_z+" State ABORT "+tmp_z);
			setScaleValue(sel_box.index, BOX_SCALE_MIN);
			setPositionValue(box_number, BOX_POSITION_DEFAULT[box_number]);	
			setZValue(sel_box.index, 0.5);
		break;
		case selected_box.STATE_FOCUS_ACTIVATE:
			//if(count_max==20)print(diff_torso_hand_z+" State ACTIVATE "+tmp_z);
			// Vergroesserungsfokus ist aktiviert, kann aber noch nicht abgebrochen werden
			if(diff_torso_hand_z<BOX_FOCUS_MOVE_Z){
				sel_box.state=selected_box.STATE_FOCUS_USE;
			} else {
				setZValue(sel_box.index, tmp_z);		
			}
		break;
		case selected_box.STATE_FOCUS_USE:
			//if(count_max==20)print(diff_torso_hand_z+" State USE "+tmp_z);
			// Vergroesserungsfokus kann jetzt wieder abgebrochen werden
			if(diff_torso_hand_z>BOX_FOCUS_ACTIVATE_Z){
				// der Nutzer hat die Vergroesserung der Box abgebrochen indem er den Arm wieder ausgestreckt hat
				sel_box.state = selected_box.STATE_FOCUS_ABORT;
			} else if(diff_torso_hand_z<BOX_MAX_Z){
				//der Nutzer maximiert die Box
				setActiveBox(sel_box.index, SFBool(true));
				sel_box.state = selected_box.STATE_MAX;
			} else {
				// Box vergroessern
				setZValue(sel_box.index, tmp_z);	
			}
		break;
	}
}

/**
 * Fuehre Gesten aus, falls diese anhand der gegebenen Werte erkannt werden konnten.
 * 
 * @param distance Gibt die absolute Distance der Geste in x, y und z-Richtung an.
 * @param speed Mittelwert der Geschwindigkeit in x, y und z-Richtung
 * @param maxAcc Maximale Bschleunigung in x, y und z-Richtung
 * @param sMedian Mittelwert der Geschwindigkeit in x, y und z-Richtung
 * @param sVariance Varianz der Geschwindigkeit in x, y und z-Richtung
 * @param sBox Die selected_box der aktuellen Hand
 * @param time Der Zeitpunkt der Geste
 * @param allow_gesture_xy Wahr, falls x,y-Gesten erlaubt sind und ausgefuehrt werden duerfen
 */
function handle_gestures(distance, speed, maxAcc, sMedian, sVariance, time, allow_gesture_xy){
	// Gesten erforderdert schnelles links/rechts, oben/unten, vor/zurueck wischen
	
	// bestimme, ob eine Box maxmimiert ist
	var maxBox;
	if(selected_box.L.index>=0 && selected_box.L.is_max()) {
		maxBox = selected_box.L;
	} else if(selected_box.R.index>=0 && selected_box.R.is_max()) {
		maxBox = selected_box.R;
	}
	// bestimme, ob eine Box fokusiert ist
	var focusBox;
	if(selected_box.L.index>=0 && selected_box.L.has_focus()) {
		focusBox = selected_box.L;
	} else if(selected_box.R.index>=0 && selected_box.R.has_focus()) {
		focusBox = selected_box.R;
	}
	
	//GESTURE_MIN_VARIANCE_ACTIVATE_X
	// x-Geste
	if( 	allow_gesture_xy
		&&	Math.abs(maxAcc.x)>=GESTURE_MIN_ACC_ACTIVATE_X
		&& 	Math.abs(speed.x)>=GESTURE_MIN_SPEED_ACTIVATE_X
		&& 	Math.abs(distance.x)>=GESTURE_MIN_DISTANCE_ACTIVATE_X 
		&& 	Math.sqrt(sVariance.x)>=GESTURE_MIN_STANDARD_ACTIVATE_X){
		if(speed.x>=0) {
			//debug ausgaben
			if(CALIBRATE_GESTURES)
				printGesture(">>>", "-x", speed.x, sVariance.x, distance.x, maxAcc.x);
			if(CALIBRATE_GESTURES_SHOW_OTHERS){
				printGesture("   ", "y", speed.y, sVariance.y, distance.y, maxAcc.y);
				printGesture("   ", "z", speed.z, sVariance.z, distance.z, maxAcc.z);			
			}
				
			if(last_gesture!="+x" || !TIME_BETWEEN_OPOSITE_GESTURES || time-last_gesture_time>TIME_BETWEEN_OPOSITE_GESTURES){
				button_L = true;			
				return "-x";
			}
		} else {
			if(CALIBRATE_GESTURES)
				printGesture(">>>", "+x", speed.x, sVariance.x, distance.x, maxAcc.x);
			if(CALIBRATE_GESTURES_SHOW_OTHERS){
				printGesture("   ", "y", speed.y, sVariance.y, distance.y, maxAcc.y);
				printGesture("   ", "z", speed.z, sVariance.z, distance.z, maxAcc.z);			
			}
			if(last_gesture!="-x" || !TIME_BETWEEN_OPOSITE_GESTURES || time-last_gesture_time>TIME_BETWEEN_OPOSITE_GESTURES){
				button_R = true;
				return "+x";
			}
		}
	}

	// y-Geste
	if( 	allow_gesture_xy
		&& 	Math.abs(maxAcc.y)>=GESTURE_MIN_ACC_ACTIVATE_Y
		&& 	Math.abs(speed.y)>=GESTURE_MIN_SPEED_ACTIVATE_Y
		&& 	Math.abs(distance.y)>=GESTURE_MIN_DISTANCE_ACTIVATE_Y 
		&& 	Math.sqrt(sVariance.y)>=GESTURE_MIN_STANDARD_ACTIVATE_Y) {
		if(speed.y>=0) {
			if(CALIBRATE_GESTURES)
				printGesture("___", "+y", speed.y, sVariance.y, distance.y, maxAcc.y);
			if(CALIBRATE_GESTURES_SHOW_OTHERS){
				printGesture("   ", "x", speed.x, sVariance.x, distance.x, maxAcc.x);
				printGesture("   ", "z", speed.z, sVariance.z, distance.z, maxAcc.z);			
			}
			if(last_gesture!="-y" || !TIME_BETWEEN_OPOSITE_GESTURES || time-last_gesture_time>TIME_BETWEEN_OPOSITE_GESTURES){
				if(maxBox){
				// minimiere die derzeitige Box und maximiere die vorige Box
					setActiveBox(maxBox.index, SFBool(true));
					maxBox.index = (maxBox.index-1)%BOX_COUNT;
					if(maxBox.index<0)maxBox.index = BOX_COUNT-1;
					setActiveBox(maxBox.index, SFBool(true));
				} else {
					// lade die vorige Seite fuer die Tags
					button_U = true;
				}
				return "+y";					
			}
		} else {
			if(CALIBRATE_GESTURES)
				printGesture("___", "-y", speed.y, sVariance.y, distance.y, maxAcc.y);
			if(CALIBRATE_GESTURES_SHOW_OTHERS){
				printGesture("   ", "x", speed.x, sVariance.x, distance.x, maxAcc.x);
				printGesture("   ", "z", speed.z, sVariance.z, distance.z, maxAcc.z);			
			}
			if(last_gesture!="+y" || !TIME_BETWEEN_OPOSITE_GESTURES || time-last_gesture_time>TIME_BETWEEN_OPOSITE_GESTURES){
				if(maxBox){
					// minimiere die derzeitige Box und maximiere die naechste Box
					setActiveBox(maxBox.index, SFBool(true));
					maxBox.index = (maxBox.index+1)%BOX_COUNT;
					setActiveBox(maxBox.index, SFBool(true));
				} else {
					// lade die naechste Seite fuer die Tags
					button_D = true;
				}
				return "-y";
			}
		}
	}
	
	// z-Geste darf man immer ausloesen
	if( 	Math.abs(maxAcc.z)>=GESTURE_MIN_ACC_ACTIVATE_Z
		&& 	Math.abs(speed.z)>=GESTURE_MIN_SPEED_ACTIVATE_Z
		&& 	Math.abs(distance.z)>=GESTURE_MIN_DISTANCE_ACTIVATE_Z 
		&& 	Math.sqrt(sVariance.z)>=GESTURE_MIN_STANDARD_ACTIVATE_Z) {
		if(speed.z>=0) {
			if(CALIBRATE_GESTURES)
				printGesture("###", "+z", speed.z, sVariance.z, distance.z, maxAcc.z);
			if(CALIBRATE_GESTURES_SHOW_OTHERS){
				printGesture("   ", "x", speed.x, sVariance.x, distance.x, maxAcc.x);
				printGesture("   ", "y", speed.y, sVariance.y, distance.y, maxAcc.y);		
			}
			if(last_gesture!="-z" || !TIME_BETWEEN_OPOSITE_GESTURES || time-last_gesture_time>TIME_BETWEEN_OPOSITE_GESTURES){
				// minimiere die mit maximiertes Bilderbox
				if(maxBox){
					setActiveBox(maxBox.index, SFBool(true));
					maxBox.state = selected_box.STATE_MIN;
				}
				//schalte push-lock an
				is_push_lock_on = true;
				return "+z";
			}
		} else {
			if(CALIBRATE_GESTURES)
				printGesture("###", "-z", speed.z, sVariance.z, distance.z, maxAcc.z);
			if(CALIBRATE_GESTURES_SHOW_OTHERS){
				printGesture("   ", "x", speed.x, sVariance.x, distance.x, maxAcc.x);
				printGesture("   ", "y", speed.y, sVariance.y, distance.y, maxAcc.y);			
			}
			if(last_gesture!="+z" || !TIME_BETWEEN_OPOSITE_GESTURES || time-last_gesture_time>TIME_BETWEEN_OPOSITE_GESTURES){
				// maximiere die fokusierte Bilderbox
				if(focusBox){
					setActiveBox(focusBox.index, SFBool(true));
					focusBox.state = selected_box.STATE_MAX;
				}
				return "-z";
			}
		}
	}
}

// Variablen nur fuer diese Funktion damit nicht alle Werte auf der Konsole ausgegeben werden
var counter_x = 0;
var COUNTER_X_MAX = 20;
/**
 * Verarbeitet Kinectpunkte zu Gesten und fuehre diese auch aus, falls erkannt.
 * 
 * @note Verkleinern des Arrays muss von der aufrufenden Methode uebernommen werden.
 *
 * @param kinect_joints Ein Array von SFVec3f fuer jede der von der Kinect erkannten Gliedmassen.
 * @param time Der Erkennungszeitpunkt
 * @param cState der derzeitige Zustand der aktuellen Hand
 * @param stateArray Zustandsarray fuer die aktuelle Hand
 * @param allow_gesture Wahr, falls Gesten mit der aktuellen Hand erlaubt sind, sonst falsch.
 */
function calculate_gestures(kinect_joints, time, cState, stateArray, allow_gesture){	
	counter_x++;
	
	// derzeitigen Zustand am Ende einfuegen
	stateArray.push(cState);
	if(stateArray.length > 1) {
		//falls es genug Zustaende zur Differenzbildung gibt
		
		//vorheriger/previous Zustand
		var pState = stateArray[stateArray.length-2];
		
		cState.distX = cState.x - pState.x;
		cState.distY = cState.y - pState.y;
		cState.distZ = cState.z - pState.z;
		
		var cpTimeDiff = cState.time - pState.time;
		if(cState.distX==0||cState.distY==0||cState.distZ==0||cpTimeDiff<=0){
			//0-Werte vermeiden in dem der Zustand ignoriert wird
			stateArray.pop();
			return;
		}
		
		cState.speedX = cState.distX/cpTimeDiff;
		cState.speedY = cState.distY/cpTimeDiff;
		cState.speedZ = cState.distZ/cpTimeDiff;
		
		//acceleration/beschleunigung
		cState.accX = (Math.pow(cState.speedX, 2)-Math.pow(pState.speedX,2))/(2*cState.distX);
		cState.accY = (Math.pow(cState.speedY, 2)-Math.pow(pState.speedY,2))/(2*cState.distY);
		cState.accZ = (Math.pow(cState.speedZ, 2)-Math.pow(pState.speedZ,2))/(2*cState.distZ);
		//print("AccelerationX: "+cState.accX);
		
		if(stateArray.length >= MAX_GESTURE_STATE_COUNT){
			//falls es genug Zustaende gibt, um auf eine Geste zu schliessen
		
			//erster/first Zustand
			var fState = stateArray[0];
			
			// distance
			var cfDistance = {
				x: cState.x - fState.x,
				y: cState.y - fState.y,
				z: cState.z - fState.z
			};
			
			var cfTimeDiff = cState.time - fState.time;
			
			//in so einem fall sicherheitshalber abbrechen
			if(cfTimeDiff<=0)return;
			
			// speedMedian
			var cfsMedian = {
				x: cfDistance.x/cfTimeDiff,
				y: cfDistance.y/cfTimeDiff,
				z: cfDistance.z/cfTimeDiff
			};
			
			
			// speedVariance
			var cfsVariance = {
				x: 0,
				y: 0,
				z: 0
			};
			
			var maxAcc = {
				x: 0,
				y: 0,
				z: 0
			};
			
			// temporaerer Zustand
			var tState;
			for(var i = 1; i < stateArray.length; i++){
				tState = stateArray[i];
				cfsVariance.x += Math.pow(tState.speedX-cfsMedian.x, 2);
				cfsVariance.y += Math.pow(tState.speedY-cfsMedian.y, 2);
				cfsVariance.z += Math.pow(tState.speedZ-cfsMedian.z, 2);
			}
			for(var i = 0; i < stateArray.length; i++){
				tState = stateArray[i];
				maxAcc.x = Math.max(maxAcc.x, tState.accX);
				maxAcc.y = Math.max(maxAcc.y, tState.accY);
				maxAcc.z = Math.max(maxAcc.z, tState.accZ);
			}
			
			cfsVariance.x = cfsVariance.x/MAX_GESTURE_STATE_COUNT;
			cfsVariance.y = cfsVariance.y/MAX_GESTURE_STATE_COUNT;
			cfsVariance.z = cfsVariance.z/MAX_GESTURE_STATE_COUNT;
			
			if(CALIBRATE_EXTREME_GESTURES){
				if( (counter_x>=COUNTER_X_MAX) ){
					// gebe nicht jeden Wert aus, sondern immer nur eine kleine Auswahl
					counter_x = 0;
					
					if(CALIBRATE_EXTREME_GESTURES=="x")
						print("x: Speed:"+cState.speedX+" SpeedMedian:"+cfsMedian.x+" Distance:"+cfDistance.x+" Varianz:"+cfsVariance.x+" "+(allow_gesture && time-last_gesture_time>MIN_TIME_BETWEEN_GESTURES)+", MaxAccx: "+maxAcc.x);
					else if(CALIBRATE_EXTREME_GESTURES=="y")
						print("y: Speed:"+cState.speedY+" SpeedMedian:"+cfsMedian.y+" Distance:"+cfDistance.y+" Varianz:"+cfsVariance.y+" "+(allow_gesture && time-last_gesture_time>MIN_TIME_BETWEEN_GESTURES)+", MaxAccx: "+maxAcc.y);
					else if(CALIBRATE_EXTREME_GESTURES=="z")
						print("z: Speed:"+cState.speedZ+" SpeedMedian:"+cfsMedian.z+" Distance:"+cfDistance.z+" Varianz:"+cfsVariance.z+" "+(allow_gesture && time-last_gesture_time>MIN_TIME_BETWEEN_GESTURES)+", MaxAccx: "+maxAcc.z);
				}
			}
			
			var tmpSpeed = {
				x: cState.speedX,
				y: cState.speedY,
				z: cState.speedZ
			}
			
			var recognizedGesture;
			//falls eine neue Geste ausgeloest werden darf
			if(time-last_gesture_time>MIN_TIME_BETWEEN_GESTURES) {
				recognizedGesture = handle_gestures(cfDistance, tmpSpeed, maxAcc, cfsMedian, cfsVariance, time, allow_gesture);
			}
			
		
			// ersten Zustand entfernen, damit das Array eine konstante Groesse behaellt
			stateArray = stateArray.slice(1);
			
			if(recognizedGesture){
				//print("MaxAccX: "+maxAccX);
				clearGestureStorage();
				last_gesture_time = time;
				button_geste_farbe = SFColor(1, 0, 0);
				button_geste_text = MFString(recognizedGesture);
				last_gesture = recognizedGesture;
			}
		}
		
	}
}

//---------------------------
// plain helper functions
//---------------------------
/**
 * Nutzt die print-Methode des Browser, fuegt aber am Ende immer ein new line ein.
 */
function print(string){
	Browser.print(string+"\n");
}

/**
 * Gibt die Geste und ihre Werte formatiert aus.
 * @param marker Markiert die Geste besonders am Anfang der Zeile
 * @param name Name der Geste
 * @param speed Geschwindigkeit der Geste
 * @param variance Geschwindigkeitsvarianz der Geste
 * @param distance Distanz der Geste
 * @param acceleration Beschleunigung der Geste
 */
function printGesture(marker, name, speed, variance, distance, acceleration){
	print(marker+" "+name+" - Speed:"+speed+" Standard:"+Math.sqrt(variance)+" Distance:"+distance+" Acceleration:"+acceleration);
}

/**
 * Gibt den Z-Interpolator aus basierend auf der Differenz Hand zu Torso.
 *
 * @param diff_torso_hand_z Differenz Hand zu Torso in der z-Achse.
 */
function getZInterpolator(diff_torso_hand_z){
	return ( (diff_torso_hand_z - BOX_MAX_Z)/(BOX_FOCUS_ACTIVATE_Z-BOX_MAX_Z) );
}

/**
 * Liefert wahr zurueck falls der Punkt oberhalb des bewegbaren Buttons liegt.
 * @param point_x x-Wert des Punktes
 * @param point_y y-Wert des Punktes
 */
function isAboveMoveButton(point_x, point_y){
	return (BUTTON_MOVE_AREA_Y.top>=point_y && point_y>= BUTTON_MOVE_AREA_Y.bottom)
				&& (button_move_position.x-1<=point_x && point_x<=button_move_position.x+1);
}

/**
 * Liefert wahr zurueck falls der Punkt in der boundingbox von der gegebenen Boxnummer ist.
 * @param point_x X-Wert des Punktes
 * @param point_y Y-Wert des Punktes
 * @param box_nummer Die Nummer der Box dessen 'Bounding Box' getestet werden soll.
 */
function isAboveBox(point_x, point_y, box_nummer){
	// je naeher die Box an der Kamera ist desto groesser sollte die Boundingbox sein
	return (point_x >= BOX_POSITION_DEFAULT[box_nummer].x-BOX_DEFAULT_BOUNDING.x &&
			point_x <= BOX_POSITION_DEFAULT[box_nummer].x+BOX_DEFAULT_BOUNDING.x)
		&& (point_y >= BOX_POSITION_DEFAULT[box_nummer].y-BOX_DEFAULT_BOUNDING.y &&
			point_y <= BOX_POSITION_DEFAULT[box_nummer].y+BOX_DEFAULT_BOUNDING.y); 
}

/**
 * Liefert einen leeren Gestenzustand fuer die linke und rechte Hand zurueck. 
 * Zeit und x,y,z-Werte der Haende sind bereits eingetragen.
 *
 *
 */
function getStandardGestureState(kinect_joints, time){
	// der Zustand speichert die x,y,z-Coordinate,
	// enthaellt die Geschwindigkeit/Speed (sX,Y,Z) in x,y,z-Richtung
	// und die Distanz in x,y,z-Richtung (dX,Y,Z)
	// Geschwindigkeit und Distanz sind immer vom ersten Zustand aus zu messen
	var empty_state  = {
		L: {
			x:	kinect_joints[XNJOINTS.XN_SKEL_RIGHT_HAND].x,
			y:	kinect_joints[XNJOINTS.XN_SKEL_RIGHT_HAND].y,
			z:	kinect_joints[XNJOINTS.XN_SKEL_RIGHT_HAND].z, 
			distX: 	0,
			distY: 	0,
			distZ: 	0,
			speedX:  0,
			speedY:  0,
			speedZ:  0,
			accX : 0,
			accY : 0,
			accZ : 0,
			"time": time
		}, 
		R: {
			x:	kinect_joints[XNJOINTS.XN_SKEL_LEFT_HAND].x,
			y:	kinect_joints[XNJOINTS.XN_SKEL_LEFT_HAND].y,
			z:	kinect_joints[XNJOINTS.XN_SKEL_LEFT_HAND].z,
			distX: 	0,
			distY: 	0,
			distZ: 	0,
			speedX:  0,
			speedY:  0,
			speedZ:  0,
			accX : 0,
			accY : 0,
			accZ : 0,
			"time": time
		}
	};
	return empty_state;
}

/**
 * Loesche alle fuer die Kinectgesten gespeicherten Werte.
 */
function clearGestureStorage(){
	speedMedian.L.x = 0;
	speedMedian.L.y = 0;
	speedMedian.L.z = 0;
	speedMedian.R.x = 0;
	speedMedian.R.y = 0;
	speedMedian.R.z = 0;
	speedVariance.L.x = 0;
	speedVariance.L.y = 0;
	speedVariance.L.z = 0;
	speedVariance.R.x = 0;
	speedVariance.R.y = 0;
	speedVariance.R.z = 0;
	// versuche immer einen Zustand im Array zu haben, damit es nicht immer wieder
	// ruckartige Beschleunigungen von 0 an gibt
	if(globalStateArray){
		globalStateArray.L = globalStateArray.L.slice(-1);
		globalStateArray.R = globalStateArray.R.slice(-1);
	}else{
		globalStateArray = {
			L: new Array(),
			R: new Array()
		};
	}
}