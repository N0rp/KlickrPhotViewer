import vrml.Event;
import vrml.field.ConstSFBool;
import vrml.field.MFString;
import vrml.field.SFBool;
import vrml.field.SFNode;
import vrml.field.SFString;
import vrml.node.Node;
import vrml.node.Script;



public class MyCode extends Script
{

	private final static boolean debug = true;
	
	private final static boolean test = true;

  private SFBool flag_1;
  private SFBool flag_2;
  private SFBool flag_3;
  private SFBool flag_4;
  private SFBool flag_5;
  private SFBool flag_6;
  private SFBool flag_7;
  private SFBool flag_8;
  private SFBool flag_9;
  
  private SFString url_change_1;
  private SFString url_change_2;
  private SFString url_change_3;
  private SFString url_change_4;
  private SFString url_change_5;
  private SFString url_change_6;
  private SFString url_change_7;
  private SFString url_change_8;
  private SFString url_change_9;
  
  private String change_link1 = "image1.jpg";
  private String change_link2 = "image2.jpg";
  
  private String[] link_liste = new String[10];
  

  /**
   * 
   * 
   * @note X3D scriptnode binding
   */
  public void initialize()
  {
	/**Instanz der Klasse zum Laden der Bilder erzeugen */
	/**und speichern der Links in der link_liste*/
	if(debug)System.out.println("MyCode: Initializing java code");

	
	
    flag_1 = (SFBool)getField("flag_1");
    flag_2 = (SFBool)getField("flag_2");
    flag_3 = (SFBool)getField("flag_3");
    flag_4 = (SFBool)getField("flag_4");
    flag_5 = (SFBool)getField("flag_5");
    flag_6 = (SFBool)getField("flag_6");
    flag_7 = (SFBool)getField("flag_7");
    flag_8 = (SFBool)getField("flag_8");
    flag_9 = (SFBool)getField("flag_9");
    
    /**Evente verknuepfen*/
    url_change_1 = (SFString)getEventOut("url_change_1");
    url_change_2 = (SFString)getEventOut("url_change_2");
    url_change_3 = (SFString)getEventOut("url_change_3");
    url_change_4 = (SFString)getEventOut("url_change_4");
    url_change_5 = (SFString)getEventOut("url_change_5");
    url_change_6 = (SFString)getEventOut("url_change_6");
    url_change_7 = (SFString)getEventOut("url_change_7");
    url_change_8 = (SFString)getEventOut("url_change_8");
    url_change_9 = (SFString)getEventOut("url_change_9");
    
    setInfo("Loading");
    
	if(!test)return;
	try{
		if(debug)System.out.println("MyCode: Starting image load thread");
		String[] tags=new String[]{"Deutschland","Kolumbien","Polen","Spanien","Frankreich"};
		ImageLoad flickr_image_load = new ImageLoad(this, tags, 9);
		flickr_image_load.start();
	} catch (Exception e){
		e.printStackTrace();
	}	
    
  }

  /**
   * 
   * 
   * @note X3D scriptnode binding
   */
  public void processEvent(Event event)
  {
	if(debug)System.out.println("MyCode: Processing event");
	//Ereignis fuer Box_1
    if (event.getName().equals("isActive_1"))
    {
    	ConstSFBool isActive1 = (ConstSFBool)event.getValue();   
    	
    	if (isActive1.getValue() == true)
    	{
    		if (flag_1.getValue() == false)
    		{
    			flag_1.setValue(true);
    			url_change_1.setValue(change_link2);
    		}
    		else
    		{
        		flag_1.setValue(false);
        		url_change_1.setValue(change_link1);
    		}
    	}
    }
    
	//Ereignis fuer Box_2
    else if (event.getName().equals("isActive_2"))
    {
    	ConstSFBool isActive2 = (ConstSFBool)event.getValue();   
    	
    	if (isActive2.getValue() == true)
    	{
    		if (flag_2.getValue() == false)
    		{
    			flag_2.setValue(true);
    			url_change_2.setValue(change_link2);
    		}
    		else
    		{
        		flag_2.setValue(false);
        		url_change_2.setValue(change_link1);
    		}
    	}
    }
    
	//Ereignis fuer Box_3
    else if (event.getName().equals("isActive_3"))
    {
    	ConstSFBool isActive3 = (ConstSFBool)event.getValue();   
    	
    	if (isActive3.getValue() == true)
    	{
    		if (flag_3.getValue() == false)
    		{
    			flag_3.setValue(true);
    			url_change_3.setValue(change_link2);
    		}
    		else
    		{
        		flag_3.setValue(false);
        		url_change_3.setValue(change_link1);
    		}
    	}
    }
    
	//Ereignis fuer Box_4
    else if (event.getName().equals("isActive_4"))
    {
    	ConstSFBool isActive4 = (ConstSFBool)event.getValue();   
    	
    	if (isActive4.getValue() == true)
    	{
    		if (flag_4.getValue() == false)
    		{
    			flag_4.setValue(true);
    			url_change_4.setValue(change_link2);
    		}
    		else
    		{
        		flag_4.setValue(false);
        		url_change_4.setValue(change_link1);
    		}
    	}
    }
    
	//Ereignis fuer Box_5
    else if (event.getName().equals("isActive_5"))
    {
    	ConstSFBool isActive5 = (ConstSFBool)event.getValue();   
    	
    	if (isActive5.getValue() == true)
    	{
    		if (flag_5.getValue() == false)
    		{
    			flag_5.setValue(true);
    			url_change_5.setValue(change_link2);
    		}
    		else
    		{
        		flag_5.setValue(false);
        		url_change_5.setValue(change_link1);
    		}
    	}
    }
    
	//Ereignis fuer Box_6
    else if (event.getName().equals("isActive_6"))
    {
    	ConstSFBool isActive6 = (ConstSFBool)event.getValue();   
    	
    	if (isActive6.getValue() == true)
    	{
    		if (flag_6.getValue() == false)
    		{
    			flag_6.setValue(true);
    			url_change_6.setValue(change_link2);
    		}
    		else
    		{
        		flag_6.setValue(false);
        		url_change_6.setValue(change_link1);
    		}
    	}
    }
    
	//Ereignis fuer Box_7
    else if (event.getName().equals("isActive_7"))
    {
    	ConstSFBool isActive7 = (ConstSFBool)event.getValue();   
    	
    	if (isActive7.getValue() == true)
    	{
    		if (flag_7.getValue() == false)
    		{
    			flag_7.setValue(true);
    			url_change_7.setValue(change_link2);
    		}
    		else
    		{
        		flag_7.setValue(false);
        		url_change_7.setValue(change_link1);
    		}
    	}
    }
    
	//Ereignis fuer Box_8
    else if (event.getName().equals("isActive_8"))
    {
    	ConstSFBool isActive8 = (ConstSFBool)event.getValue();   
    	
    	if (isActive8.getValue() == true)
    	{
    		if (flag_8.getValue() == false)
    		{
    			flag_8.setValue(true);
    			url_change_8.setValue(change_link2);
    		}
    		else
    		{
        		flag_8.setValue(false);
        		url_change_8.setValue(change_link1);
    		}
    	}
    }
    
	//Ereignis fuer Box_9
    else if (event.getName().equals("isActive_9"))
    {
    	ConstSFBool isActive9 = (ConstSFBool)event.getValue();   
    	
    	if (isActive9.getValue() == true)
    	{
    		if (flag_9.getValue() == false)
    		{
    			flag_9.setValue(true);
    			url_change_9.setValue(change_link2);
    		}
    		else
    		{
        		flag_9.setValue(false);
        		url_change_9.setValue(change_link1);
    		}
    	}
    }
    
  }
  
  /**
   * 
   * 
   * @note X3D scriptnode binding
   */
  public void shutdown()
  {
  }

  public void setLink_liste(String[] link_liste) 
  {
	if(debug)System.out.println("MyCode: Set linked list");
	this.link_liste = link_liste;
	
	if(debug)System.out.println("MyCode: Setting values");
	
	//change the 'Loading' string to an empty string
	setInfo("");
	
    /**Initialisiert die Boxe mit bilder aus Flickr*/
	if(link_liste[0]!=null)
		url_change_1.setValue(link_liste[0]);
    if(link_liste[1]!=null)
    	url_change_2.setValue(link_liste[1]);
    if(link_liste[2]!=null)
    	url_change_3.setValue(link_liste[2]);
    if(link_liste[3]!=null)
    	url_change_4.setValue(link_liste[3]);
    if(link_liste[4]!=null)
    	url_change_5.setValue(link_liste[4]);
    if(link_liste[5]!=null)
    	url_change_6.setValue(link_liste[5]);
    if(link_liste[6]!=null)
    	url_change_7.setValue(link_liste[6]);
    if(link_liste[7]!=null)
    	url_change_8.setValue(link_liste[7]);
    if(link_liste[8]!=null)
    	url_change_9.setValue(link_liste[8]);
  }

  public String[] getLink_liste()
  {
	if(debug)System.out.println("MyCode: Get linked list");
	return link_liste;
  }

  private void setInfo(String newinfo){
	// Get the Text node from "text" field of the Script node
    SFNode textField = (SFNode)getField("text");
    Node textNode = (Node)textField.getValue();
    

    // Get the "string" exposed field of the Text node
    MFString stringField = (MFString)textNode.getExposedField("string");

    // Get the name of the user. This is a privileged method call that
    // will throw an AccessControlException when we do not give this
    // script the right to read that property.
    //String username = System.getProperty("user.name");

    // Write the user name into the "string" field of the Text node
    //stringField.set1Value(1, username);
    stringField.set1Value(0, newinfo);
  }
  
}
