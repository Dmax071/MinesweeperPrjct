
using fastJSON;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
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
            FileDataTools fd = new FileDataTools("GameData");
            bool state = fd.AddRowsToFile(0, inp);
            string rezult = string.Empty;

            if (state)
                rezult = fastJSON.JSON.ToJSON("ok");
            else
                rezult = SetError("Error");

            return rezult;
        }
        [WebMethod(Description = "Метод добавления данных о победах")]
        public string setWinInfo(string inputsParam)
        {
            Tools tools = new Tools();
            FileDataTools fd = new FileDataTools("GameData");

            if (inputsParam == "null") {
                return fd.RetunsTopTable();
            }
            Dictionary<string, object> inp = tools.ParseInpParam(inputsParam);
            bool state = fd.AddRowsToFile(1, inp);
            string rezult = string.Empty;

            if (state) 
                rezult = fd.RetunsTopTable();
            else
                rezult = SetError("Error");

            return rezult;
        }

        private static string SetError(string message)
        {
            return fastJSON.JSON.ToJSON(new RetVal().SetError(message));
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

        public string TableToJson(DataTable dataTable) {
            Dictionary<string, string> rezItem = null;
            List<Dictionary<string, string>> rez = new List<Dictionary<string, string>>();

            for (int i = 0; i < dataTable.Rows.Count; i++)
            {
                rezItem = new Dictionary<string, string>();
                foreach (DataColumn item in dataTable.Columns)
                    rezItem[item.Caption] = dataTable.Rows[i][item].ToString();
                rez.Add(rezItem);
            }
            return fastJSON.JSON.ToJSON(rez);
        }

    }

    public class FileDataTools
    {
        string _captionFile;
        DataSet _gameData = null;
        public FileDataTools(string captionFile)
        {
            this._captionFile = HttpContext.Current.Server.MapPath("contents/" + captionFile + ".xml"); ;
        }
        //проверка есть ли такой же логин и пароль
        //false - нет true - есть
        public bool CheckFileToDuble(string login, string password)
        {
            bool rezult = false;
            DataTable usersDt = _gameData.Tables["Users"];
            var foundRowAll = usersDt.Rows.Cast<DataRow>().FirstOrDefault(t => (t["login"].ToString() == login) && (t["password"].ToString() == password));
            if (foundRowAll != null)
                rezult = true;
            return rezult;
        }

        public bool CheckFileToLogin(string login)
        {
            bool rezult = false;
            DataTable usersDt = _gameData.Tables["Users"];
            var foundRowLogin = usersDt.Rows.Cast<DataRow>().FirstOrDefault(t => t["login"].ToString() == login);
            if (foundRowLogin != null)
                rezult = true;
            return rezult;
        }


        DataTable CreateTable(byte typeData)
        {
            DataTable dt = null;
            if (typeData == 0)
            {
                DataTable usersDt = new DataTable();
                usersDt.TableName = "Users";
                usersDt.TableName = "Users";
                usersDt.Columns.Add("index");
                usersDt.Columns.Add("login");
                usersDt.Columns.Add("password");
                dt = usersDt;
            }
            else
            {
                DataTable gamesDt = new DataTable();
                gamesDt.TableName = "GamesTop";
                gamesDt.Columns.Add("index");
                gamesDt.Columns.Add("user");
                gamesDt.Columns.Add("level");
                gamesDt.Columns.Add("timeGame");
                gamesDt.Columns.Add("q_width");
                gamesDt.Columns.Add("q_height");
                gamesDt.Columns.Add("q_mine");
                dt = gamesDt;
            }
            return dt;

        }


        DataSet CreateFile()
        {
            DataSet gameData = new DataSet();
            gameData.Tables.Add(CreateTable(0));
            gameData.Tables.Add(CreateTable(1));
            return gameData;
        }
        DataSet LoadFile()
        {
            DataSet gameData = new DataSet();
            gameData.ReadXml(_captionFile);
            return gameData;
        }

        //добавление строки в файл 0-Users 1-GamesTop
        public bool AddRowsToFile(byte typeData, Dictionary<string, object> data)
        {
            _gameData = new DataSet();
            if (File.Exists(_captionFile))
            {
                _gameData = LoadFile();
                if (_gameData.Tables["GamesTop"] == null)
                {
                    _gameData.Tables.Add(CreateTable(1));
                }
            }
            else
                _gameData = CreateFile();


            if (typeData == 0)
            {
                bool logPsw = CheckFileToDuble(data["login"].ToString(), data["password"].ToString());
                if (!logPsw)
                {
                    bool log = CheckFileToLogin(data["login"].ToString());
                    if (!log)
                    {
                        WriteToFile(typeData, data);
                        return true;
                    }
                    else return false;

                }
                else return true;
            }
            else
            {
                WriteToFile(typeData, data);
                return true;
            }


        }

        void WriteToFile(byte typeData, Dictionary<string, object> data)
        {
            DataRow row = _gameData.Tables[(typeData == 0 ? "Users" : "GamesTop")].NewRow();
            foreach (KeyValuePair<string, object> kvp in data)
            {
                row["index"] = 0;
                row[kvp.Key] = kvp.Value.ToString();
            }
            _gameData.Tables[(typeData == 0 ? "Users" : "GamesTop")].Rows.Add(row);
            _gameData.WriteXml(_captionFile);
        }

        public string RetunsTopTable() {
            Tools tools = new Tools();
            if (_gameData == null) {
                _gameData = LoadFile();
            }
            return tools.TableToJson(_gameData.Tables["GamesTop"]);
        }

    }
    public class RetVal
    {
        public bool HasError;
        public string Message;
        public RetVal SetError(string errMessage)
        {
            HasError = true;
            Message = errMessage;
            return this;
        }
    }


    //грохнуть
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
