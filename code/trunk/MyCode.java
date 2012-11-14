import vrml.Event;
import vrml.field.ConstSFBool;
import vrml.field.MFRotation;
import vrml.field.MFVec3f;
import vrml.field.SFString;
import vrml.field.SFVec3f;
import vrml.field.SFTime;
import vrml.node.Script;

import javax.swing.JOptionPane;

/**
 * MyCode enthaellt saemtlichen Code um Bilder von Flickr zu laden und diese Bilder auch zu
 * manipulieren. Animierte Groessenaenderung geschieht hier zB. Die Methoden sind grob nach
 * Wichtigkeit sortiert. Die wichtigsten Methoden ganz oben und alle Methoden nach rotateBoxes 
 * sind eher von geringem Belang. Am Anfang dieser Klasse befinden sich sehr viele Konstanten die
 * man veraendern kann, um das Programm den eigenen Wuenschen besser anzupassen. 
 * Die Threadingflag ist dabei besonders hervorzuheben. Threading kann deaktiviert werden, da
 * der InstantReality player zT sehr empfindlich darauf reagiert und abstuerzt. Es ist jedoch
 * auffallend wie sehr die Interaktion vom Threading profitiert. Ohne selbiges friert das Bild
 * beim Flickrbilder laden einfach kurz ein. Mit threading ist immernoch ein spuerbares 'ruckeln'
 * merkbar aber ist deutlich kuerzer und angenehmer. 
 * 
 * @author Richard Gross, Felipe Kordek
 *
 */
public class MyCode extends Script
{
	/** 
	 * Anzahl der Bilderboxen die angezeigt werden. Weniger als 12 fuerht nur dazu,
	 * dass weniger Bilder befuellt werden. Es werden nicht weniger als 12 angezeigt.
	 * Koennte die Performance auf schwachen Rechner oder bei schwachem Internet verbessern. 
	 * Mehr als 12 wuerde einfach nur Exceptions erzeugen.  
	 */
	public final static int BOX_ANZAHL = 12;
	
	/** Wahr, wenn threading genutzt werden soll */
	  private final boolean USE_THREAD = true;

	/** Normalerweise true. Kann auf false gesetzt werden, wenn keine Bilder von Flickr geladen werden sollen. */
	  private final boolean ACTIVATE_IMAGE_LOAD = true;

	/** Der Pfad den das default-Bild hat */
	private final static String DEFAULT_IMG_URL = "../img/standard.jpg";
	/** Die Positionensvektoren an denen die Boxen normalerweise liegen */
	private final static SFVec3f[] BOX_POSITION_DEFAULT = {
			  new SFVec3f(-4.5f, 3f, 0f),
			  new SFVec3f(-1.5f, 3f, 0f),
			  new SFVec3f( 1.5f, 3f, 0f),
			  new SFVec3f( 4.5f, 3f, 0f),
			  
			  new SFVec3f(-4.5f, 0.5f, 0f),
			  new SFVec3f(-1.5f, 0.5f, 0f),
			  new SFVec3f( 1.5f, 0.5f, 0f),
			  new SFVec3f( 4.5f, 0.5f, 0f),
			  
			  new SFVec3f(-4.5f, -2f, 0f),
			  new SFVec3f(-1.5f, -2f, 0f),
			  new SFVec3f( 1.5f, -2f, 0f),
			  new SFVec3f( 4.5f, -2f, 0f)
	  };

	private final static String[][] IMG_TAGS = {
		{"Australien", "Canberra"},
		{"Deutschland", "Berlin"},
		{"Frankreich", "Paris"},
		{"Spanien", "Madrid"},
		{"Polen", "Warschau"},
		{"Russland", "Moskau"},
		{"Kolumbien", "Bogota"},
		{"Brazilien", "Sao Paulo"},
		{"Österreich", "Wien"},
		{"Griechenland", "Athen"}
	};


	/** Die maximale Seitenanzahl fuer die Bildersuche */
	  private final int MAX_PAGE_NUMBER = 9;

	/** Die minimale Seitenanzahl fuer die Bildersuche */
	  private final int MIN_PAGE_NUMBER = 1;

	/** Kleine Bilderurls */
	private final static int SMALL_IMAGE = 0;

	/** Mittlere Bilderurls */
	private final static int MEDIUM_IMAGE = 1;

	/** Grosse Bilderurls */
	private final static int LARGE_IMAGE = 2;
	

	/**
	 * Mit dieser Konstante kann man bestimmen welche Bilderurls fuer die minimierten Bilder geladen werden.
	 */
	private final static int MIN_IMAGE_TYPE = MEDIUM_IMAGE;

	/**
	 * Mit dieser Konstante kann man bestimmen welche Bilderurls fuer die maximierten Bilder geladen werden.
	 * 
	 * Bisher habe ich noch keine Moeglichkeit gefunden herauszufinden, 
	 * ob es fuer das ausgewaehlte Flickr Bild eine grosse Aufloesung gibt.
	 * Sollte es kein Bild in der entsprechenden Aufloesung geben gibt Flickr keinen Fehler aus.
	 * Antstatt dessen zeigt die url auf einen Standardplatzhalter. 
	 * Daher sind die grossen Bilder jetzt einfach die selben wie die medium Bilder.
	 * Die meissten Bilder bieten eine Mediumaufloesung an.
	 */
	private final static int MAX_IMAGE_TYPE = MEDIUM_IMAGE;

	/** Groesse eines minimierten Bildes. */
	private final static SFVec3f BOX_SCALE_MIN = new SFVec3f(1f, 1f, 1f);
	/** Groesse eines maximierten Bildes. */
	private final static SFVec3f BOX_SCALE_MAX = new SFVec3f(3f, 2.7f, 1f);
	/** Position eines maximierten Bildes. */
	private final static SFVec3f BOX_POSITION_MAX = new SFVec3f(0f, 0.35f, 3f);

	/** Nach links rotieren. */
	private final static float[][] BOX_ROTATE_LEFT = new float[][]{
		{0, 1, 0, 0}, 
		{0, 1, 0, -1.57f}, 
		{0, 1, 0, -3.14159f}, 
		//{0, 1, 0, -6.28f}
	};
	/** Nach rechts rotieren. */
	private final static float[][] BOX_ROTATE_RIGHT = new float[][]{
		{0, 1, 0, 0}, 
		{0, 1, 0, 1.57f}, 
		{0, 1, 0, 3.14159f}, 
	};
	/** Nach oben rotieren und zur Seite damit Bilder nicht Kopfueber sind danach. */
	private final static float[][] BOX_ROTATE_UP = new float[][]{
		{1, 0, 1, 0}, 
		{1, 0, 1, -3.14f}, 
		{1, 0, 1, -6.28f}, 
	};
	/** Nach unten rotieren und zur Seite damit Bilder nicht Kopfueber sind danach. */
	private final static float[][] BOX_ROTATE_DOWN = new float[][]{
		{1, 0, 1, 0}, 
		{1, 0, 1, 3.14f}, 
		{1, 0, 1, 6.28f}, 
	};
	/** Minianimation, um zu zeigen, dass etwas schief gelaufen ist. */
	private final static float[][] BOX_ROTATE_TILT = new float[][]{
		{0, 0, 1, 0}, 
		{0, 0, 1, 0.05f}, 
		{0, 0, 1, 0.1f}, 
	};
	
	/** Keine Animation. Einfach nur dafuer sorgen, dass Bilder normal orientiert sind. */
	private final static float[][] BOX_ROTATE_NORMAL = new float[][]{
		{0, 0, 1, 0.1f}, 
		{0, 0, 1, 0.05f}, 
		{0, 0, 1, 0f}, 
	};
	

	/** Gibt an welches Tags gerade geladen sind. Auf 0 setzen, damit beim ersten Bilderladen der 0. index geladen wird*/
	  private static int image_counter = 0;
	  /** Gibt an welche Seite der Bilder geladen sind. Auf 1 setzen da die Seiten bei 1 anfangen */
	  private static int page_counter = 1;
	  
	  /** Object(Thread) fuer das Laden der Bilder */
	  private ImageLoad imageLoader;
	
  /* --------------------------------------------------
   * Variablen fuer das interagieren mit den Bilderboxen.
   * Alle Werte die mit o beginnen sind outputs zu X3D
   * --------------------------------------------------*/  
  /** Wert der angibt welches Bild gross ist(>=0) oder keins (-1) */
  private int maxmized_image_number;
  
  /** Wahr, wenn der Benutzer durch einen falsche Eingabe die Bilderboxen leicht gedreht hat. Sonst false. */
  private boolean images_are_tiltet;
  

  /** Ein String welcher dem Benutzer anzeigt welche Bildertags geladen sind. */
	private SFString o_geladenerTag;
  
	/** Ein String der dem Benutzer anzeigt, welchen Namen das maximierte Bild hat. */
	private SFString o_image_name;

	/** List der Bilderurls die angezeigt werden */
  	private SFString[] o_bilder_url_liste;
  	/** ScaleInterpolator */
	private MFVec3f[] o_box_size;
	/** PositionsInterpolator */
	private MFVec3f[] o_box_position;
	/** OrientationInterpolator */
	private MFRotation[] o_box_rotation;
	/** Zeitsensor fuer die Groesse */
	private SFTime[] o_box_time_minmax;
	/** Zeitsensor fuer die Rotation */
	private SFTime[] o_box_time_rotation;
	
  
  /** 
   * Gets called once after loading the VRML scene. 
   * This is the first method that gets called by the Browser. 
   * You usually override this method to get references to the fields 
   * and event-out slots of the Script node.
   */
	@Override
	public void initialize() {	
		super.initialize();
		maxmized_image_number = -1;	 
		images_are_tiltet = false;
	  
	    /* Events verknuepfen */
	    o_bilder_url_liste = new SFString[BOX_ANZAHL];
	    for(int i = 0; i < BOX_ANZAHL; i++){
	    	o_bilder_url_liste[i] = (SFString)getEventOut("url_change_"+i);
	    }
    
//    o_box_scale_liste = new SFVec3f[BOX_ANZAHL];
//    for(int i = 0; i < BOX_ANZAHL; i++){
//        o_box_scale_liste[i] = (SFVec3f)getEventOut("box_"+i+"_scale");
//    }
	
//	o_box_translate_liste = new SFVec3f[BOX_ANZAHL];
//    for(int i = 0; i < BOX_ANZAHL; i++){
//    	o_box_translate_liste[i] = (SFVec3f)getEventOut("box_"+i+"_translation");
//    }
	    o_box_size = new MFVec3f[BOX_ANZAHL];
	    for(int i = 0; i < BOX_ANZAHL; i++){
	    	o_box_size[i] = (MFVec3f)getEventOut("box_"+i+"_groesse");
	    }
	    
	    o_box_position = new MFVec3f[BOX_ANZAHL];
	    for(int i = 0; i < BOX_ANZAHL; i++){
	    	o_box_position[i] = (MFVec3f)getEventOut("box_"+i+"_position");
	    }
	    o_box_rotation = new MFRotation[BOX_ANZAHL];
	    for(int i = 0; i < BOX_ANZAHL; i++){
	    	o_box_rotation[i] = (MFRotation)getEventOut("box_"+i+"_rotation");
	    }
	    o_box_time_minmax = new SFTime[BOX_ANZAHL];
	    for(int i = 0; i < BOX_ANZAHL; i++){
	    	o_box_time_minmax[i] = (SFTime)getEventOut("box_"+i+"_time_minmax");
	    }
	    o_box_time_rotation = new SFTime[BOX_ANZAHL];
	    for(int i = 0; i < BOX_ANZAHL; i++){
	    	o_box_time_rotation[i] = (SFTime)getEventOut("box_"+i+"_time_rotation");
	    }
	    
	    o_geladenerTag = (SFString)getEventOut("tagnotice_text");
		o_image_name = (SFString)getEventOut("image_name");
		
	    // Noch ist kein Bild maximiert, so wird der Tag unsichtbar
		setMaxBoxImageTitle("");
		//lade neue Bilder
	    this.loadNewImages(IMG_TAGS[MyCode.image_counter], createFormattedTag(IMG_TAGS[MyCode.image_counter], true));
	}
  
  /** 
   * Gets called once before leaving/unloading the VRML scene. 
   * This is the last method that gets called by the VRML browser. 
   * It's the counterpart of the initialize() method. 
   * You may override this method to do some cleanup.
   */
	@Override
	public void shutdown(){
	  super.shutdown();
	}
  
  /**
   * Wird vom Instantrealityplayer aufgreufen, wenn neue events anliegen.
   * @param event Ein neues event.
   */
	@Override
	public void processEvent(Event event) {
	  
		String eventName = event.getName();
		for(int i = 0; i < BOX_ANZAHL; i++){
			if(eventName.equals("isActive_"+i)){
				box_bildergallerie(event, i);
				return;
			}
		}
	  
		// linker oder rechter button gedrueckt  
	    if(eventName.equals("isActive_links")
	    	|| eventName.equals("isActive_rechts")
	    	|| eventName.equals("isActive_up")
	    	|| eventName.equals("isActive_down")){
	    	buttons_bilderladen(event);
	    }   	  
	    // ein Spezialknopf auf dem Keyboard wurde gedrueckt
	    else if(eventName.equals("keyPressed"))
	    	showSearchDialog(event);
	    else{
	    	System.out.println("Event wurde nicht abgefangen und hat den Namen "+eventName);
	    }
	    

		if(images_are_tiltet){
			//falls der Benutzer mit dem letzten Zug eine fehlerhafte Eingabe gemacht hat
			rotateBoxes(BOX_ROTATE_NORMAL, event.getTimeStamp());
		}
	}
  
  /**
   * Wird aufgerufen wenn das Flickr-Bilder laden fertig ist.
   * @param image_urls
   */
	synchronized void onImageLoadDone(ImageLoad loader){
		// Setze die urls der Bilder auf die von Flickr; 
		for(int i = 0; i < MyCode.BOX_ANZAHL; i++){
			setBoxImageUrl(i, getMiniumImageUrl(loader, i));
		}
		System.out.println("Setting tag name");
		setLoadedTag(loader.getFormattedTag());
	    
	    if(maxmized_image_number>=0){
			System.out.println("Setting image name");
	    	// falls ein Bild maximiert ist, muss sich auch der Bildname aendern
	    	setMaxBoxImageTitle(loader.getImageTitle(maxmized_image_number));
	    }
	    // es waere sinnvoll die Bilderotation erst hier zu machen
	    // von einem Thread darf diese Rotation aber nicht ausgeloest werden 
  	}

  /**
   * Zeige den Bildersuchdialog an und verarbeite die Nutzereingabe.
   * @param event Ein Keyboardevent.
   */
  	private void showSearchDialog(Event event){
		// Zeige eine Dialogbox an sobald der Benutzer eine von den speziellen Tasten drueck: Home, Pos1, Bild-Auf/Ab
		String response = JOptionPane.showInputDialog(null,
			  "Enter 1 or 2 image tags?",
			  "Image Tags",
			  JOptionPane.QUESTION_MESSAGE);
		if(response==null || response.isEmpty()){
			System.out.println("Keyboardsuche fehlgeschlagen: Keine Tags");
			// zeige dem Benutzer den Fehler an
			rotateBoxes(BOX_ROTATE_TILT, event.getTimeStamp());
			images_are_tiltet = true;
			return;
		}
		  
		//starte die Suche
		System.out.println("Keyboardsuche fuer folgende Tags: "+response);
		String[] searchTags;
		if(response.indexOf(", ")>0){
			searchTags=response.split(", ");
		}else if(response.indexOf(" ")>0){
			//falls es ein Leerzeichen gibt das nicht am Anfang steht
			searchTags=response.split(" ");
		}else{
			searchTags = new String[]{response, ""};
		}
		this.loadNewImages(searchTags, createFormattedTag(searchTags, false));
		rotateBoxes(BOX_ROTATE_UP, event.getTimeStamp());
  	}

  /**
   * Testen, ob das Event von einem der Buttons die zum Bilderladen genutzt werden 
   * ausgeloest wurde. Falls ja darauf reagieren und neue Bilder laden. 
   * @param event Ein Benutzerevent
   */
  private void buttons_bilderladen(Event event) {	   
	  ConstSFBool isActive = (ConstSFBool)event.getValue();
	  if (isActive.getValue()) {
		//Ereignis fuer den Button Links
	    if (event.getName().equals("isActive_links")) {
			// Modulo 10 ergibt eine Zahl nie einen Werte groesser als 9
			// es kann aber ein Wert kleiner al 0 entstehen
			MyCode.image_counter = (MyCode.image_counter-1)%IMG_TAGS.length;
			if(MyCode.image_counter<0)MyCode.image_counter=IMG_TAGS.length-1;
			// beim Laden einer neuen Seite wird der page counter immer zurueckgesetzt
			MyCode.page_counter = MIN_PAGE_NUMBER;
    		this.loadNewImages(IMG_TAGS[MyCode.image_counter], createFormattedTag(IMG_TAGS[MyCode.image_counter], true));
			rotateBoxes(BOX_ROTATE_LEFT, event.getTimeStamp());
	    }
	    
		//Ereignis fuer den Button Rechts
	    else if (event.getName().equals("isActive_rechts")) {	
			// Modulo 10 ergibt eine Zahl nie einen Werte groesser als 9
			// 10%10=10 Modulo 10 ergibt zB 0
			MyCode.image_counter = (MyCode.image_counter+1)%IMG_TAGS.length;
			// beim Laden einer neuen Seite wird der page counter immer zurueckgesetzt
			MyCode.page_counter = MIN_PAGE_NUMBER;
			this.loadNewImages(IMG_TAGS[MyCode.image_counter], createFormattedTag(IMG_TAGS[MyCode.image_counter], true));
			rotateBoxes(BOX_ROTATE_RIGHT, event.getTimeStamp());
		}
		
		//Ereignis fuer den Button Oben
	    else if (event.getName().equals("isActive_up")) {
			if( MyCode.page_counter <= MIN_PAGE_NUMBER) {
				//abbrechen und Fehler notieren
				rotateBoxes(BOX_ROTATE_TILT, event.getTimeStamp());
				images_are_tiltet = true;
				return;
			} else {
				MyCode.page_counter--;
			}
			this.loadNewImages(IMG_TAGS[MyCode.image_counter], createFormattedTag(IMG_TAGS[MyCode.image_counter], true));
			rotateBoxes(BOX_ROTATE_UP, event.getTimeStamp());
		}
		
		//Ereignis fuer den Button Unten
		else if (event.getName().equals("isActive_down")) {
			if( MyCode.page_counter >= MAX_PAGE_NUMBER) {
				//abbrechen und Fehler notieren
				rotateBoxes(BOX_ROTATE_TILT, event.getTimeStamp());
				images_are_tiltet = true;
				return;
			} else {
				MyCode.page_counter++;
			}
			this.loadNewImages(IMG_TAGS[MyCode.image_counter], createFormattedTag(IMG_TAGS[MyCode.image_counter], true));
    		rotateBoxes(BOX_ROTATE_DOWN, event.getTimeStamp());
	    }
	  }
  }

/**
   * Wenn einer der Boxen der Bildergallerie mit der Maus gedrueckt wird.
   * @param event Das Mausevent
   * @param box_nummer Die box die gedrueckt wurde; nummeriert von 0 bis BOX_ANZAHL 
   */
  private void box_bildergallerie(Event event, int box_nummer)
  {
	  
    	if (((ConstSFBool)event.getValue()).getValue())
    	{
    		if (maxmized_image_number == box_nummer) {
    			// das Bild soll klein gemacht werden
				minimizeImage(event, box_nummer);
    			maxmized_image_number = -1;
    		} else {
    			// das Bild soll gross gemacht werden, andere Bilder klein gemacht
    			if(maxmized_image_number>=0){
    				minimizeImage(event, maxmized_image_number);
    			}
				maximizeImage(event, box_nummer);
    			maxmized_image_number = box_nummer; 
    		}
    	}
    }

  /**
   * Lade neue Bilder von Flickr und aendere die angezeigten Bilderurls.
   * @param suchtyp Der Type des IMAGE_LOAD: vor, rueckwaerts oder Keyboardsuche
   */
	private void loadNewImages(String []tags, String formattedTag) {		
		// verhindere seltsame Fehler
		MyCode.image_counter = MyCode.image_counter%IMG_TAGS.length;
		MyCode.page_counter = MyCode.page_counter%MAX_PAGE_NUMBER;
		if(MyCode.page_counter<MIN_PAGE_NUMBER)MyCode.page_counter = MIN_PAGE_NUMBER;
		
		if(this.imageLoader != null && this.imageLoader.isRunning()){
			System.out.println("Keine neuen Bilder laden waehrend ein Thread in Progress ist");
			return;
		}
		this.imageLoader = new ImageLoad(this, tags, MyCode.page_counter, formattedTag);
		if(ACTIVATE_IMAGE_LOAD){
			if(USE_THREAD){
				this.imageLoader.start();
			}else {
				imageLoader.getImagesAndCallWithResult();
			}
		}
	}

private void rotateBoxes(float[][] rotation, double time){	  	
		for(int i = 0; i < BOX_ANZAHL; i++){
			o_box_rotation[i].clear();
			for(int j = 0; j < rotation.length; j++){
				o_box_rotation[i].addValue(rotation[j][0], rotation[j][1], rotation[j][2], rotation[j][3]);
			}
			o_box_time_rotation[i].setValue(time);
		}
		// dieser Fehler wird natuerlich immer korrigiert, wenn due Boxen wieder rotiert werden
		if(images_are_tiltet)images_are_tiltet = false;
  }

  private void maximizeImage(Event event, int box_number){
	  	if(imageLoader==null){
	  		System.out.println("Image Loader ist null, abbrechen");
	  		return;
	  	}
		setBoxImageUrl(box_number, getMaximumImageUrl(imageLoader, box_number));
		setMaxBoxImageTitle(imageLoader.getImageTitle(box_number));
				
		//animiere das maximieren
		o_box_size[box_number].clear();
		// Scale scheint immer 0 zu sein
		//o_box_size[box_number].addValue(o_box_scale_liste[box_number]);
		o_box_size[box_number].addValue(BOX_SCALE_MIN);
		o_box_size[box_number].addValue(BOX_SCALE_MAX);
		o_box_position[box_number].clear();
		o_box_position[box_number].addValue(BOX_POSITION_DEFAULT[box_number]);
		o_box_position[box_number].addValue(BOX_POSITION_MAX);
		o_box_time_minmax[box_number].setValue(event.getTimeStamp());
	}
	  
	private void minimizeImage(Event event, int box_number){
		if(imageLoader==null){
	  		System.out.println("Image Loader ist null, abbrechen");
	  		return;
	  	}
		
		String url = getMiniumImageUrl(imageLoader, box_number);
		
		if(url==null){
			System.out.println("Diese url gibt es nicht");
			setBoxImageUrl(box_number, DEFAULT_IMG_URL);
		}else{
			setBoxImageUrl(box_number, url); 
		}
		// setzte den Namen des Bildes auf nichts, damit der String unsichtbar bleibt
		setMaxBoxImageTitle(""); 	
		
		//animiere das minimieren
		o_box_size[box_number].clear();
		o_box_size[box_number].addValue(BOX_SCALE_MAX);
		o_box_size[box_number].addValue(BOX_SCALE_MIN);
		o_box_position[box_number].clear();
		o_box_position[box_number].addValue(BOX_POSITION_MAX);
		o_box_position[box_number].addValue(BOX_POSITION_DEFAULT[box_number]);
		o_box_time_minmax[box_number].setValue(event.getTimeStamp());  			
	}
  

  /**
	 * Methode nutzen um den formatierten Tag der derzeit geladenen Bilder zu setzen
	 * 
	 * @param searchTag
	 * @param isKeyboardSearch
	 */
	private String createFormattedTag(String[] searchTag, boolean includeImageCounter){
		String imgFormattedTag = "";
		
		imgFormattedTag = searchTag[0]+"";
		if(!searchTag[1].isEmpty())
			imgFormattedTag += " => "+searchTag[1];
		
		if(includeImageCounter)
			imgFormattedTag = (MyCode.image_counter+1)+"/10: "+imgFormattedTag;
		
		imgFormattedTag += " [S:"+MyCode.page_counter+"]";
		
		return imgFormattedTag;
	}
	
	private String getMiniumImageUrl(ImageLoad imgLoader, int boxNumber){
		switch(MIN_IMAGE_TYPE){
		case SMALL_IMAGE:
			return imgLoader.getSmallImageUrl(boxNumber);
		case MEDIUM_IMAGE:
			return imgLoader.getMediumImageUrl(boxNumber);
		case LARGE_IMAGE:
			return imgLoader.getLargeImageUrl(boxNumber);
		default:
			return null;
		}
	}
	
	private String getMaximumImageUrl(ImageLoad imgLoader, int boxNumber){
		switch(MAX_IMAGE_TYPE){
		case SMALL_IMAGE:
			return imgLoader.getSmallImageUrl(boxNumber);
		case MEDIUM_IMAGE:
			return imgLoader.getMediumImageUrl(boxNumber);
		case LARGE_IMAGE:
			return imgLoader.getLargeImageUrl(boxNumber);
		default:
			return null;
		}
	}
	
	// synchronisierte Methoden	  
	
	/**
	 * Setzte die Bild-url der Box.
	 * @param boxNumber Die Nummer der Box die gesetzt werden soll.
	 * @param imgUrl Die url der Bildbox. Falls null, wird ein Platzhalter angezeigt.
	 */
	private synchronized void setBoxImageUrl(int boxNumber, String imgUrl){
		if(imgUrl!=null && !imgUrl.isEmpty())
			o_bilder_url_liste[boxNumber].setValue(imgUrl);
		else
			o_bilder_url_liste[boxNumber].setValue(DEFAULT_IMG_URL);
	}
	
	/**
	 * Setzte den Titel des Bild das maximiert ist.
	 * @param imgName Der Namen des maximierten Bildes. Falls null, wird ein Platzhalter angezeigt.
	 */
	private synchronized void setMaxBoxImageTitle(String imgName){
		if(imgName!=null)
			o_image_name.setValue(imgName);
		else
			o_image_name.setValue("Image has no name");
	}
	
	/**
	 * Setzte den Tag der Bilder die geladen wurden.
	 * @param loadedTag Der Tag der Bilder. Falls null, wird ein Platzhalter angezeigt.
	 */
	private synchronized void setLoadedTag(String loadedTag){
		if(loadedTag!=null && !loadedTag.isEmpty())
			o_geladenerTag.setValue(loadedTag);
		else
			o_geladenerTag.setValue("Tag is not ready");
	}	
}


