using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace brechtbaekelandt.Services
{
    public interface ISerializerService
    {
        string SerializeSubscriber(Models.Subscriber subscriber);

        Models.Subscriber DeserializeSubscriber(string base64String);
    }
}
