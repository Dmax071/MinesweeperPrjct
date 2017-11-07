
using fastJSON;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.Services;

namespace MinesweeperPrjct
{
    [WebService(Namespace = "http://miniswepear.ru/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [System.Web.Script.Services.ScriptService]
    public class Data : System.Web.Services.WebService
    {

        public readonly static JSONParameters Jpar = new JSONParameters
        {
            UseExtensions = false,
            SerializeNullValues = true,
            UseEscapedUnicode = false,
            UseFastGuid = false,
            EnableAnonymousTypes = true,
            UseUTCDateTime = false
        };

        [WebMethod(Description = "Метод добавления игрока в систему")]
        public string setPlayerInGame(string inputsParam)
        {
            Tools tools = new Tools();
            Dictionary<string, object> inp = tools.ParseInpParam(inputsParam);
            FileTools fileTools = new FileTools("Users.json");
            fileTools.WriteData(inputsParam);

            return fastJSON.JSON.ToJSON("ok"); ;
        }
    }


    public class Tools
    {
        public Dictionary<string, object> ParseInpParam(string inputsParam)
        {
            Dictionary<string, object> inp = new Dictionary<string, object>();
            object ob = fastJSON.JSON.Parse(inputsParam);
            inp = ob as Dictionary<string, object>;
            return inp;
        }

        public List<Dictionary<string, object>> ParseFileParam(string inputsParam)
        {
            List<Dictionary<string, object>> inp = new List<Dictionary<string, object>>();
            List<object> list = JSON.ToObject<List<object>>(inputsParam);

            foreach (var item in list)
            {
                inp.Add(item as Dictionary<string, object>);
            }
            return inp;
        }

    }

    public class FileTools
    {
        string _captionFile;
        Tools tools = null;
        public FileTools(string captionFile)
        {
            this._captionFile = HttpContext.Current.Server.MapPath("contents/" + captionFile); ;
        }

        public void WriteData(string dataToFile)
        {
            List<string> list = new List<string>();
            Dictionary<string, object> elemDataFile = tools.ParseInpParam(dataToFile);
            List<Dictionary<string, object>> dataFile = null;
            if (!File.Exists(_captionFile))
            {
                dataFile = new List<Dictionary<string, object>>();
                using (StreamWriter sw = new StreamWriter(_captionFile, false, System.Text.Encoding.Default))
                {
                    dataFile.Add(elemDataFile);
                    sw.WriteLine(fastJSON.JSON.ToJSON(dataFile));
                }
                // если создан файл и записан
            }
            else
            {

                bool chekedDataFile = ChekDataInFile(elemDataFile);
                if (!chekedDataFile)
                {
                    //если не найден пользователь
                    string strData = ReadData();
                    dataFile = tools.ParseFileParam(strData);
                    dataFile.Add(elemDataFile);

                    using (StreamWriter sw = new StreamWriter(_captionFile, false, System.Text.Encoding.Default))
                    {
                        sw.WriteLine(fastJSON.JSON.ToJSON(dataFile));
                    }
                }
                //// если записан

            }
        }

        string ReadData()
        {
            string data = string.Empty;
            using (StreamReader sr = new StreamReader(_captionFile, System.Text.Encoding.Default))
            {
                data = sr.ReadToEnd();
            }

            return data;
        }
        // true есть false нет
        public bool ChekDataInFile(object chekedData)
        {
            string strData = ReadData();
            List<Dictionary<string, object>> dataFile = tools.ParseFileParam(strData);
            if (dataFile.Contains(chekedData as Dictionary<string, object>))
                return true;
            return false;
        }
    }

}
