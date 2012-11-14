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
	private final static boolean debug = true;
	
	private MyCode caller;
	private String[] tags;
	private int imageCount;
	
	public ImageLoad(MyCode caller, String tags[], int imageCount){
		this.caller = caller;
		this.tags = tags;
		this.imageCount = imageCount;
	}
	
	public void run(){
		this.retrieveImages();
	}
	
	private void retrieveImages()
	{
		String[] liste = new String[10];
		String key="4f639b286f876c4380cfb827bfc8831d";
		String svr="www.flickr.com";           
		REST rest = null;
		
		try
		{
			if(debug)System.out.println("ImageLoad: Trying REST");
			rest = new REST();
		} catch (ParserConfigurationException e) 
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
				 
		PhotosInterface photosInterface = flickr.getPhotosInterface();  
		PhotoList photoList = null;
		
		try{
			if(debug)System.out.println("ImageLoad: Trying photoload");
			photoList = photosInterface.search(searchParams, imageCount, 1);
		} catch (IOException e){e.printStackTrace();}
		catch (SAXException e){e.printStackTrace();} 
		catch (FlickrException e){e.printStackTrace();}

		
		if(photoList != null)
		{
			if(debug)System.out.println("ImageLoad: Photolist is not null");
			for(int i = 0; i < photoList.size(); i++)
			{
				Photo photo = (Photo)photoList.get(i);
				liste[i] = photo.getThumbnailUrl();	
			}                            
		}
		
		caller.setLink_liste(liste);
	}
}
