using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace brechtbaekelandt.Models
{
    [XmlRoot(ElementName =  "rss", Namespace = ""), Serializable]
    public class Rss
    {
        [XmlAttribute(AttributeName = "version")]
        public string Version => "2.0";

        [XmlElement(ElementName = "channel")] 
        public RssChannel Channel { get; set; }

        //[XmlIgnore]
        //public RssChannelItem this[string title] => this.Channel.FindItem(title);

        //[XmlIgnore]
        //public RssChannelItem this[int index] => this.Channel.FindItem(index);
    }
}
