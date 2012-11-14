import javax.swing.JOptionPane;

import vrml.Event;
import vrml.field.ConstSFBool;
import vrml.field.MFString;
import vrml.field.MFVec3f;
import vrml.field.SFString;
import vrml.field.SFVec3f;
import vrml.field.SFTime;
import vrml.node.Script;


public class MyCode extends Script
{
	public final static int BOX_ANZAHL = 12;
	
	private final static int IMAGE_LOAD_VORWAERTS = 1;
	private final static int IMAGE_LOAD_RUECKWAERTS = 0;
	private final static int IMAGE_LOAD_KEYBOARD = -1;
	
	private final static SFVec3f BOX_SCALE_MIN = new SFVec3f(1f, 1f, 0.1f);
	private final static SFVec3f BOX_SCALE_MAX = new SFVec3f(1f, 1f, 0.1f);
	private final static SFVec3f BOX_POSITION_MAX = new SFVec3f(0f, 0.35f, 2f);
  
  /** Zeigt an, ob die app gerade gestartet wurde (0). */
  private static int app_start = 0;
  /** Gibt an welches Tags gerade geladen sind. */
  private static int image_counter = 0;
  //private static int newImageLoadIndex = 0;
  
  /** Ob threading genutzt werden soll */
  private final boolean use_thread = true;

  /** Thread fuer das Laden der Bilder */
  private Thread t_start;
	
  /* Variablen fuer das interagieren mit den Bilderboxen */
  
  /** Anzahl der Bilderboxen die angezeigt werden */
  
  
  /** Wert der angibt welches Bild gross ist(>=0) oder keins (-1) */
  private int bild_gross_nummer;
  /** List der Bilderurls die angezeigt werden */
  private SFString[] bilder_url_liste;
  /** Liste der Groessen der Bilder die angezeigt werden */
  private SFVec3f[] box_scale_liste;
  /** Liste der Positionen der Bilder die angezeigt werden */
  private SFVec3f[] box_translate_liste;
  
  /** Die Positionensvektoren an denen die Boxen normalerweise liegen */
  private final SFVec3f[] box_position_default = {
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
  
  /** Ein String welcher dem Benutzer anzeigt welche Bildertags geladen sind. */
  private MFString geladenerTag;

  /** Array das alle von Flickr empfangenen urls enthaellt */
  private String[] link_liste_alle 	= new String[BOX_ANZAHL*2];
  /** Array das von Flickr empfangenen Thumbnail-urls enthaellt */
  private String[] link_liste_klein = new String[BOX_ANZAHL];
  /** Array das von Flickr empfangenen Grossbild-urls enthaellt */
  private String[] link_liste_gross = new String[BOX_ANZAHL];	
  
  /** Array das die tags enthaellt die der Benutzer eintippt. */
  private String[] keyboardSuche;
  
  
  /** 
   * Wird vom Instantrealityplayer aufgreufen zum initialisieren. 
   */
  @Override
  public void initialize()
  {	
	  bild_gross_nummer = -1;
    
    /* Events verknuepfen */
    bilder_url_liste = new SFString[BOX_ANZAHL];
    for(int i = 0; i < BOX_ANZAHL; i++){
    	bilder_url_liste[i] = (SFString)getEventOut("url_change_"+i);
    }
    
    box_scale_liste = new SFVec3f[BOX_ANZAHL];
    for(int i = 0; i < BOX_ANZAHL; i++){
    	box_scale_liste[i] = (SFVec3f)getEventOut("box_"+i+"_scale");
    }
	
	box_translate_liste = new SFVec3f[BOX_ANZAHL];
    for(int i = 0; i < BOX_ANZAHL; i++){
    	box_translate_liste[i] = (SFVec3f)getEventOut("box_"+i+"_translation");
    }
    
    geladenerTag = (MFString)getEventOut("tagnotice_text");
    keyboardSuche = new String[]{"nicht", "definiert"};
	
    /* Beim ersten laden brauchen wir kein Thread */
    this.newImageLoad(IMAGE_LOAD_VORWAERTS);
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
	  
	  String[]tag;
	  if(response.contains(" "))
		  tag = response.split(" ");
	  else
		  tag = new String[]{response, ""};
	  
	  if(!tag[0].isEmpty()){
		  //falls wenigstens der erste Suchetag nicht leer ist
		  keyboardSuche = tag;
		  this.newImageLoad(IMAGE_LOAD_KEYBOARD);
	  }else{
		  System.out.println("Bildersuche fehlgeschlagen: Keine Tags");
	  }
  }
  
  /**
   * Wird vom Instantrealityplayer aufgreufen, wenn neue events anliegen.
   * @param event Ein neues event.
   */
  @Override
  public void processEvent(Event event)
  {
	  for(int i = 0; i < BOX_ANZAHL; i++){
		if(event.getName().equals("isActive_"+i)){
			box_bildergallerie(event, i);
			return;
		}
	  }
	  
	  
    if(	event.getName().equals("isActive_links")
    		|| 	event.getName().equals("isActive_rechts")
    		|| 	event.getName().equals("kinect_links_B")
    		|| 	event.getName().equals("kinect_rechts_B"))
    	buttons_bilderladen(event);  
    else if(event.getName().equals("keyPressed"))
    	showSearchDialog(event);
    else{
    	System.out.println("Event wurde nicht abgefangen und hat den Namen "+event.getName());
    }
	  
  }

  /**
   * Wenn einer der Boxen der Bildergallerie mit der Maus gedrueckt wird.
   * @param event Das Mausevent
   * @param box_nummer Die box die gedrueckt wurde; nummeriert von 0 bis BOX_ANZAHL 
   */
  public void box_bildergallerie(Event event, int box_nummer)
  {
    	if (((ConstSFBool)event.getValue()).getValue())
    	{
    		if (bild_gross_nummer == box_nummer) {
    			// das Bild soll klein gemacht werden
				minimizeImage(event, box_nummer);
    			bild_gross_nummer = -1;
    		} else {
    			// das Bild soll gross gemacht werden, andere Bilder klein gemacht
    			if(bild_gross_nummer>=0){
    				minimizeImage(event, bild_gross_nummer);
    			}
				maximizeImage(event, box_nummer);
    			bild_gross_nummer = box_nummer; 
    		}
    	}
    }
  
  private void maximizeImage(Event event, int box_nummer){
	  if(box_nummer==0){
		((MFVec3f)getEventOut("box_0_groesse")).clear();
		((MFVec3f)getEventOut("box_0_groesse")).addValue(BOX_SCALE_MIN);
		((MFVec3f)getEventOut("box_0_groesse")).addValue(BOX_SCALE_MAX);
		((MFVec3f)getEventOut("box_0_position")).clear();
		((MFVec3f)getEventOut("box_0_position")).addValue(box_position_default[box_nummer]);
		((MFVec3f)getEventOut("box_0_position")).addValue(BOX_POSITION_MAX);
		((SFTime)getEventOut("box_0_zeit_minmax")).setValue(event.getTimeStamp());
	  }else {
		bilder_url_liste[box_nummer].setValue(link_liste_gross[box_nummer]);
		box_scale_liste[box_nummer].setValue(3f, 2.7f, 1f);
		box_translate_liste[box_nummer].setValue(0f, 0.35f, 3f);
	  }
  }
  
  private void minimizeImage(Event event, int box_nummer){
	  if(box_nummer==0){
		((MFVec3f)getEventOut("box_0_groesse")).clear();
		((MFVec3f)getEventOut("box_0_groesse")).addValue(BOX_SCALE_MAX);
		((MFVec3f)getEventOut("box_0_groesse")).addValue(BOX_SCALE_MIN);
		((MFVec3f)getEventOut("box_0_position")).clear();
		((MFVec3f)getEventOut("box_0_position")).addValue(BOX_POSITION_MAX);
		((MFVec3f)getEventOut("box_0_position")).addValue(box_position_default[box_nummer]);
		((SFTime)getEventOut("box_0_zeit_minmax")).setValue(event.getTimeStamp());    				
	  }else {
		  bilder_url_liste[box_nummer].setValue(link_liste_klein[box_nummer]);
		  box_scale_liste[box_nummer].setValue(1f, 1f, 1f);
		  box_translate_liste[box_nummer].setValue(box_position_default[box_nummer]);
	  }
  }
  

  public void buttons_bilderladen(Event event)
  {	   
		//Ereignis fuer den Button Links
	    if (event.getName().equals("isActive_links"))
	    {
	    	ConstSFBool isActive_links = (ConstSFBool)event.getValue();   
	    	
	    	if (isActive_links.getValue())
	    	{
	    		newImageLoad(IMAGE_LOAD_RUECKWAERTS);
	    	}
	    }
	    
		//Ereignis fuer den Button Rechts
	    else if (event.getName().equals("isActive_rechts"))
	    {
	    	ConstSFBool isActive_rechts = (ConstSFBool)event.getValue();   
	    	
	    	if (isActive_rechts.getValue())
	    	{
	    		this.newImageLoad(IMAGE_LOAD_VORWAERTS);
	    	}
	    }
	    
		//Ereignis fuer den Button Links
	    else if (event.getName().equals("kinect_links_B"))
	    {
	    	ConstSFBool isActive_links = (ConstSFBool)event.getValue();   
	    	
	    	if (isActive_links.getValue())
	    	{
	    		this.newImageLoad(IMAGE_LOAD_RUECKWAERTS);
	    	}
	    }
	    
		//Ereignis fuer den Button Rechts
	    else if (event.getName().equals("kinect_rechts_B"))
	    {
	    	ConstSFBool isActive_rechts = (ConstSFBool)event.getValue();   
	    	
	    	if (isActive_rechts.getValue())
	    	{
	    		this.newImageLoad(IMAGE_LOAD_VORWAERTS);
	    	}
	    } 
  }
  
  /**
   * Lade neue Bilder von Flickr und aendere die angezeigten Bilderurls.
   * @param suchtyp Der Type des IMAGE_LOAD: vor, rueckwaerts oder Keyboardsuche
   */
public void newImageLoad(int suchtyp)
  { 			
		try
		{
			/** Beim Start der Anwendung */
			if(MyCode.app_start == 0)
			{
				if(use_thread){
					this.t_start = new ImageLoad(this, MyCode.image_counter);
					this.t_start.start();
				}else {
					(new ImageLoad(this, MyCode.image_counter)).getImagesAndCallWithResult();
				}
				MyCode.app_start++;
			}
			/* Bei der nromalen Suche */
			else
			{
				/** Vorwaertssuche */
				if(suchtyp == IMAGE_LOAD_VORWAERTS)
				{
					if(image_counter >= 9)
					{
						MyCode.image_counter = 0;
					}
					else
					{
						MyCode.image_counter++;
					}
					
					if(use_thread){
						this.t_start = new ImageLoad(this, MyCode.image_counter);
						this.t_start.start();
					}else {
						(new ImageLoad(this, MyCode.image_counter)).getImagesAndCallWithResult();
					}
					
				}
			
				/** Rueckwaertssuche */
				else if(suchtyp == IMAGE_LOAD_RUECKWAERTS)
				{				
					if(image_counter <= 0)
					{
						MyCode.image_counter = 9;
					}
					else
					{
						MyCode.image_counter--;
					}
					if(use_thread){
						this.t_start = new ImageLoad(this, MyCode.image_counter);
						this.t_start.start();
					}else {
						(new ImageLoad(this, MyCode.image_counter)).getImagesAndCallWithResult();
					}
				}
				
				/* Keyboardsuche */
				else if(suchtyp == IMAGE_LOAD_KEYBOARD){
					if(use_thread){
						this.t_start = new Thread(new ImageLoad(this, keyboardSuche));
						this.t_start.start();
					}else {
						(new ImageLoad(this, keyboardSuche)).getImagesAndCallWithResult();
					}
				}
			}
		}finally{
			
		}
  }
  
  /**
   * Wird aufgerufen wenn das Flickr-Bilder laden fertig ist.
   * @param image_urls
   */
  @SuppressWarnings("deprecation")
public void onImageLoadDone(String[] image_urls, String[]tagsListe){
	  try{
	  this.link_liste_alle = image_urls;
	  
	  /* Es werden in einem Array die Links sowohl  fuer die kleine Bilder
		als auch fuer die groesse Bilder gespeichert. */
		for(int i = 0, j = BOX_ANZAHL; i < BOX_ANZAHL; i++, j++)
		{
			if(this.link_liste_alle!=null){
				this.link_liste_klein[i] = this.link_liste_alle[i];
				this.link_liste_gross[i] = this.link_liste_alle[j];
			}
		}
		
		/* Initialisiert die Boxe mit bilder aus Flickr */
		for(int i = 0; i < bilder_url_liste.length && i < link_liste_klein.length; i++){
			if(link_liste_klein[i]!=null)
				bilder_url_liste[i].setValue(link_liste_klein[i]);
		}
	    geladenerTag.setValue(tagsListe);
	  }finally{
		// der Thread ist fertig
		if(this.t_start!=null){
			this.t_start.stop();
		}
		this.t_start = null;
	  }
  }
}
