
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;

namespace MinesweeperPrjct
{
    [WebService(Namespace = "http://miniswepear.ru/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [System.Web.Script.Services.ScriptService]
    public class Data : System.Web.Services.WebService
    {

        //public readonly static JSONParameters Jpar = new JSONParameters
        //{
        //    UseExtensions = false,
        //    SerializeNullValues = true,
        //    UseEscapedUnicode = false,
        //    UseFastGuid = false,
        //    EnableAnonymousTypes = true,
        //    UseUTCDateTime = false
        //};

        [WebMethod(Description = "Метод добавления игрока в тоp 10")]
        public string setPlayerTop()
        {
            return null;
        }
    }
}
