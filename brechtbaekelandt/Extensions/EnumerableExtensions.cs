using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace brechtbaekelandt.Extensions
{
    public static class EnumerableExtensions
    {
        public static ICollection<T> ToCollection<T>(this IEnumerable<T> source)
        {
            if (source == null)
            {
                return null;
            }

            var arr = source.ToArray();

            return new Collection<T>(arr);
        }

        public static IEnumerable<T> AddRange<T>(this IEnumerable<T> sourceArr, IEnumerable<T> arrToAdd)
        {
            if (arrToAdd == null)
            {
                return sourceArr;
            }

            var enumerable = sourceArr as T[] ?? sourceArr.ToArray();

            var newList = enumerable.ToList();

            foreach (var obj in arrToAdd)
            {
                newList.Add(obj);
            }

            return newList.AsEnumerable();
        }
    }
}
