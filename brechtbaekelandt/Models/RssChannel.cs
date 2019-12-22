using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace brechtbaekelandt.Models
{
    [XmlType(TypeName = "channel"), Serializable]
    public class RssChannel
    {
        private readonly List<RssChannelItem> _items = new List<RssChannelItem>();

        [XmlElement(ElementName = "language")] 
        public string Language => "en-US";

        [XmlElement(ElementName = "title")]
        public string Title { get; set; }

        [XmlElement(ElementName = "description")]
        public string Description { get; set; }

        [XmlElement(ElementName = "link")]
        public string Link { get; set; }

        [XmlElement(ElementName = "item", Type = typeof(RssChannelItem))]
        public List<RssChannelItem> Items { get; set; }
    }
}
