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
        public string Version { get; set; }

        [XmlElement(ElementName = "channel")] 
        public RssChannel Channel { get; set; }
    }
}
