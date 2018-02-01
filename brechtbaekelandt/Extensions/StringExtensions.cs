using System.Text;

namespace brechtbaekelandt.Extensions
{
    public static class StringExtensions
    {
        public static string RemoveSpecialCharactersAndSpaces(this string str, char charToReplaceSpace = '-')
        {
            var sb = new StringBuilder();

            foreach (var c in str)
            {
                if ((c < '0' || c > '9') && (c < 'A' || c > 'Z') && (c < 'a' || c > 'z') && c != '_' && c!= ' ' && c != '-')
                {
                    continue;
                }

                sb.Append(c == ' ' ? charToReplaceSpace : c);
            }
            return sb.ToString();
        }
    }
}
