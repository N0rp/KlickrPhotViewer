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

public class ImageLoad extends Thread
{
	private MyCode caller;
	
	private String [] gewaehlte_tags;
	
	private String[] tagsliste;
	
	private int index;
	
	public ImageLoad(MyCode caller, int index){
		this.caller = caller;
		String[][] tags = {
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
		this.gewaehlte_tags = tags[index];
		this.index = index;
	}
	
	public ImageLoad(MyCode caller, String[] keyboardTags){
		this.caller = caller;
		this.gewaehlte_tags = keyboardTags;
		this.index = -1;
	}
	
	@Override
	public void run(){
		getImagesAndCallWithResult();
	}
	
	/** 
	 * Nur manuel aufrufen wenn kein Threading eingesetzt werden soll.
	 */
	@SuppressWarnings("deprecation")
	public void getImagesAndCallWithResult(){
		try{
			String [] image_urls = getImages(this.gewaehlte_tags);
			this.caller.onImageLoadDone(image_urls, this.tagsliste);
		}finally{
			//stop sollte verhindern, dass der Thread, wenn Instantreality abstuerzt, blockiert
			this.stop();
		}
	}
		
	
	
	private String[] getImages(String[]tags)
	{
		String urlliste[] = new String[MyCode.BOX_ANZAHL*2];
		
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
		searchParams.setSort(SearchParameters.INTERESTINGNESS_DESC);           
		
		

		searchParams.setTags(tags);
		/** Diese Variable zeigt welche tags geladen werden */
		this.tagsliste = new String[1];
		this.tagsliste[0] = tags[0];
		if(!tags[1].isEmpty()) this.tagsliste[0]+= "=> " + tags[1];
		
		if(this.index>=0)
			this.tagsliste[0] = (index+1)+"/10: "+this.tagsliste[0];
				 
		PhotosInterface photosInterface = flickr.getPhotosInterface();  
		PhotoList photoList = null;
		
		//Parameters: searchPrams, Number of images per page, page offset
		try{photoList = photosInterface.search(searchParams, MyCode.BOX_ANZAHL, 1);} 
		catch (IOException e){e.printStackTrace();}
		catch (SAXException e){e.printStackTrace();} 
		catch (FlickrException e){e.printStackTrace();}

		
		if(photoList != null)
		{
			for(int i = 0, j = MyCode.BOX_ANZAHL; i < photoList.size(); i++, j++)
			{	
				Photo photo = (Photo)photoList.get(i);
				//System.out.println(i+" - "+photo.getTitle());
				//photo.originalFormat() ist jpeg, o.a.
				urlliste[i] = photo.getMediumUrl();
				/*
				 * bisher habe ich noch keine Moeglichkeit gefunden herauszufinden, 
				 * ob es ein grosses Bild gibt. Falls es keines gibt zeigt Flickr
				 * einen sehr haesslichen Platzhalter an. Daher sind die grossen
				 * Bilder jetzt einfach die selben wie die medium Bilder.
				 */
				urlliste[j] = photo.getMediumUrl();
				//urlliste[j] = photo.getLargeUrl();
			}                            
		}
		
		
		return urlliste;
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
}
