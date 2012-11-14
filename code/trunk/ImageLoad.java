import java.io.IOException;

import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.SAXException;

import com.aetrion.flickr.Flickr;
import com.aetrion.flickr.FlickrException;
import com.aetrion.flickr.REST;
import com.aetrion.flickr.photos.Photo;
import com.aetrion.flickr.photos.PhotoList;
import com.aetrion.flickr.photos.PhotosInterface;
import com.aetrion.flickr.photos.SearchParameters;

/**
 * ImageLoad laedt Daten von Flickr-Bildern und speichert das Ergebnis in lokal in der Instanz ab.
 * Daher sollte nach ausfuehren des Flickrequests die Instanz dieser Klasse beibehalten werden.
 * Urls der Bilder werden dann ueber die public getter abgefragt.
 * 
 * @author Richard Gross, Felipe Kordek
 *
 */
public class ImageLoad extends Thread
{
	/** Flickr hat ein Safetylevel fuer die Bilder. Auf null setzen zum deaktivieren. */
	private final static String SEARCH_SAFETY_LEVEL = com.aetrion.flickr.Flickr.SAFETYLEVEL_SAFE;
	
	/** Nach welchen Kriterien Flickr die Bilder sortieren soll. Nicht auf null setzen. */
	private final static int SEARCH_SORT_BY = SearchParameters.INTERESTINGNESS_DESC;
	
	private MyCode caller;
	
	private String [] searchTags;
	private String formattedTag;
	
	private String[] smallImageUrl;
	private String[] mediumImageUrl;
	private String[] largeImageUrl;
	private String[] imageTitle;	
	private int pageNum;
	
	private boolean isRunning;
	

	
	
	/**
	 * Erstelle ein neues Bildladungsobject. Das eigentliche Laden wird begonnen
	 * indem entweder der Thread gestartet wird oder (ohne threading) die Methode
	 * getImagesAndCallWithResult aufgerufen wird.
	 * 
	 * @note: Anscheinend werden die Bilder mit folgendem fehlerhaften Typ herunter geladen:
	 * 'image/pjpeg'. Das erzeugt eine Warnung in der Konsole, wenn Avalon die Bilder
	 * zuweisen soll. Die Bilder werden aber immernoch korrekt dargestellt.
	 * Mehr zu dem vermuteten Grund fuer das pjpeg-Problem unter folgendem Link. 
	 * Hat vermutlich nichts mit Instantreality zu tun.
	 * http://www.zigpress.com/2010/01/14/non-standard-imagepjpeg-mimetype-on-ie/
	 * 
	 * @param caller Das Object das benachrichtigt werden soll, wenn das Laden fertig ist.
	 * @param searchTags Die Tags die gesucht werden sollen.
	 * @param pageNum Die Seite der Flickrbilder die geladen werden soll. Beginnt mit dem Wert 1.
	 * @param formattedTag Die Suchtags fuer Menschen lesbar formatiert.
	 */
	public ImageLoad(MyCode caller, String[] searchTags, int pageNum, String formattedTag){
		this.caller = caller;
		this.searchTags = searchTags;
		this.pageNum = pageNum;
		this.formattedTag = formattedTag;

		smallImageUrl = new String[MyCode.BOX_ANZAHL];
		mediumImageUrl = new String[MyCode.BOX_ANZAHL];
		largeImageUrl = new String[MyCode.BOX_ANZAHL];
		imageTitle = new String[MyCode.BOX_ANZAHL];
	}
	
	@Override
	public void run(){
		getImagesAndCallWithResult();
	}
	
	/** 
	 * Laedt Bilde von Flickr (mit den im Konstruktor angegebenen werten) und sagt danach dem
	 * Ersteller dieses Objekts bescheid.
	 * @note Nur manuel aufrufen wenn kein Threading eingesetzt werden soll. 
	 * Threading einsetzen durch Thread.start() ganz klassisch.
	 */
	public void getImagesAndCallWithResult(){
		System.out.println("Lade neue Bilder fuer formatieren Tag:"+this.formattedTag);
		isRunning = true;
		getImages();	
		isRunning = false;
		this.caller.onImageLoadDone(this);
	}
	
	/**
	 * Liefert zurueck, ob immernoch Bilder von Flickr geladen werden.
	 * @return Wahr, falls immernoch Bilder von Flickr geladen werden, sonst falsch.
	 */
	public boolean isRunning(){
		return isRunning;
	}
	
	/**
	 * Laedt Bilder von Flickr mit den global variablen und speichert das Ergebnis global im Object.
	 */
	private void getImages()
	{
		
		String key = "4f639b286f876c4380cfb827bfc8831d";
		String svr = "www.flickr.com";           
		REST rest = null;
		
		try
		{
			rest = new REST();
		}
		
		catch (ParserConfigurationException e) 
		{
			e.printStackTrace();
		}
		
		rest.setHost(svr);
		
		Flickr flickr = new Flickr(key, rest);
		flickr.setSharedSecret("bd64d50714c81d84");
		Flickr.debugStream = false;
		
		SearchParameters searchParams=new SearchParameters(); 
		searchParams.setSort(SEARCH_SORT_BY);           
		
		

		searchParams.setTags(searchTags);
				 
		PhotosInterface photosInterface = flickr.getPhotosInterface();  
		PhotoList photoList = null;
		
		if(SEARCH_SAFETY_LEVEL!=null)
			searchParams.setSafeSearch(SEARCH_SAFETY_LEVEL);			
		
		//Parameters: searchPrams, Number of images per page, page offset
		try{photoList = photosInterface.search(searchParams, MyCode.BOX_ANZAHL, pageNum);} 
		catch (IOException e){e.printStackTrace();}
		catch (SAXException e){e.printStackTrace();} 
		catch (FlickrException e){e.printStackTrace();}

		
		if(photoList != null)
		{
			for(int i = 0; i < photoList.size(); i++)
			{	
				Photo photo = (Photo)photoList.get(i);
				//System.out.println(i+" - "+photo.getTitle());
				//photo.originalFormat() ist jpeg, o.a.
				smallImageUrl[i] = photo.getSmallUrl();
				mediumImageUrl[i] = photo.getMediumUrl();
				largeImageUrl[i] = photo.getLargeUrl();
				imageTitle[i] = photo.getTitle();
			}                            
		}
	}
	/*
	 * Bilder eines spezifischen Nutzers
	 * 
	 * Transport t = new REST();
	Flickr f = new Flickr("key", "secret", t);
	PhotoList list = f.getPhotosetsInterface().getPhotos("setId", 100, 1);
	for (Iterator iterator = list.iterator(); iterator.hasNext();) {
    Photo photo = (Photo) iterator.next();
    File file = new File("/tmp/" + photo.getId() + ".jpg");
    ByteArrayOutputStream b = new ByteArrayOutputStream();
    b.write(photo.getOriginalAsStream());
    FileUtils.writeByteArrayToFile(file, b.toByteArray());
}
	 */
	
	/**
	 * Gibt den Titel des Flickrbildes zurueck.
	 * @param box_number Der Index des Bildes.
	 * @return Der Titel oder null, falls es die Box nicht gibt.
	 */
	public String getImageTitle(int box_number){
		if(box_number<=imageTitle.length)
			return imageTitle[box_number];
		else 
			return null;
	}
	
	/**
	 * Gibt die kleine Aufloesung des Flickrbildes zurueck.
	 * @param box_number Der Index des Bildes.
	 * @return Eine url oder null, falls es die Box nicht gibt.
	 */
	public String getSmallImageUrl(int box_number){
		if(box_number<=smallImageUrl.length)
			return smallImageUrl[box_number];
		else 
			return null;
	}
	
	/**
	 * Gibt die mittlere Aufloesung des Flickrbildes zurueck.
	 * @param box_number Der Index des Bildes.
	 * @return Eine url oder null, falls es die Box nicht gibt.
	 */
	public String getMediumImageUrl(int box_number){
		if(box_number<=mediumImageUrl.length)
			return mediumImageUrl[box_number];
		else 
			return null;
	}
	
	/**
	 * Gibt die grosse Aufloesung des Flickrbildes zurueck.
	 * @param box_number Der Index des Bildes.
	 * @return Eine url oder null, falls es die Box nicht gibt.
	 */
	public String getLargeImageUrl(int box_number){
		if(box_number<=largeImageUrl.length)
			return largeImageUrl[box_number];
		else 
			return null;
	}
	
	/**
	 * Gibt den Tag der Bilder zurueck der bei Flickr gesucht wurde. 
	 * @return Ein Tag. Formatiert damit Menschen ihn besser lesen koennen.
	 */
	public String getFormattedTag(){
		return formattedTag;
	}
}
