using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;

namespace brechtbaekelandt.Services
{
    public class SerializerService : ISerializerService
    {
        public string SerializeSubscriber(Models.Subscriber subscriber)
        {
            using (var ms = new MemoryStream())
            {
                new BinaryFormatter().Serialize(ms, subscriber);
                ms.Position = 0;

                return Convert.ToBase64String(ms.ToArray());
            }
        }

        public Models.Subscriber DeserializeSubscriber(string base64String)
        {
            var bytes = Convert.FromBase64String(base64String);

            using (var ms = new MemoryStream(bytes, 0, bytes.Length))
            {
                ms.Write(bytes, 0, bytes.Length);
                ms.Position = 0;

                return new BinaryFormatter().Deserialize(ms) as Models.Subscriber;
            }
        }
    }
}
