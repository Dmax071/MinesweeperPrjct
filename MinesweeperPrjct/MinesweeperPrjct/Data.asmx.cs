
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
            FileDataTools fd = new FileDataTools("GameData.xml");
            bool state = fd.AddRowsToFile(0, inp);
            string rezult = string.Empty;

            if (state)
                rezult = SetOk();
            else
                rezult = SetError("Error");

            return rezult;
        }

        [WebMethod(Description = "Метод добавления данных о победах")]
        public string setWinInfo(string inputsParam)
        {
            Tools tools = new Tools();
            FileDataTools fd = new FileDataTools("GameData.xml");

            if (inputsParam == "null")
            {
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

        [WebMethod(Description = "Метод добавления данных об игре")]
        public string setGameInfo(string inputsParam)
        {
            string rezult = string.Empty;
            Tools tools = new Tools();
            Dictionary<string, object> inp = tools.ParseInpParam(inputsParam);
            FileDataTools fd = new FileDataTools("GameData.json");
            bool state = fd.AddRowsToFileJson(inp);
            if (state)
                rezult = SetOk();
            else
                rezult = SetError("Error");

            return rezult;
        }

        [WebMethod(Description = "Метод проверки есть ли у игрока игра")]
        public string getGameInfo(string inputsParam)
        {
            Tools tools = new Tools();
            Dictionary<string, object> inp = tools.ParseInpParam(inputsParam);
            FileDataTools fd = new FileDataTools("GameData.json");
            Dictionary<string, object> returns = fd.CheckAndReturnsData(inp);
            return fastJSON.JSON.ToJSON(returns);
        }

        private static string SetError(string message)
        {
            return fastJSON.JSON.ToJSON(new RetVal().SetError(message));
        }

        private static string SetOk()
        {
            return fastJSON.JSON.ToJSON("ok");
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

        public string TableToJson(DataTable dataTable)
        {
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
        Tools _tools = new Tools();
        public FileDataTools(string captionFile)
        {
            this._captionFile = HttpContext.Current.Server.MapPath("contents/" + captionFile); ;
        }

        //проверка есть ли такой же логин и пароль
        //false - нет true - есть
        bool CheckFileToDuble(string login, string password)
        {
            bool rezult = false;
            DataTable usersDt = _gameData.Tables["Users"];
            var foundRowAll = usersDt.Rows.Cast<DataRow>().FirstOrDefault(t => (t["login"].ToString() == login) && (t["password"].ToString() == password));
            if (foundRowAll != null)
                rezult = true;
            return rezult;
        }

        bool CheckFileToLogin(string login)
        {
            bool rezult = false;
            DataTable usersDt = _gameData.Tables["Users"];
            var foundRowLogin = usersDt.Rows.Cast<DataRow>().FirstOrDefault(t => t["login"].ToString() == login);
            if (foundRowLogin != null)
                rezult = true;
            return rezult;
        }

        bool CheckGameToLogin(string login)
        {
            Dictionary<string, object> readData = ReadDataToJson();
            object obj = null;
            try
            {
                obj = readData[login];
            }
            catch
            {
                return false;
            }
            return true;//есть игра 
        }

        string GetLoginGame(Dictionary<string, object> data)
        {
            string login = string.Empty;
            Dictionary<string, object> parameters = null;
            try
            {
                parameters = data["parameters"] as Dictionary<string, object>;
                login = parameters["login"].ToString();
            }
            catch {
                parameters = data["login"] as Dictionary<string, object>;
                login = data["login"].ToString();
            }
            return login;
        }
      
        void WriteDataToJson(Dictionary<string, object> dataFile)
        {
            using (StreamWriter sw = new StreamWriter(_captionFile, false, System.Text.Encoding.Default))
            {
                sw.WriteLine(fastJSON.JSON.ToJSON(dataFile));
            }
        }

        Dictionary<string, object> ReadDataToJson()
        {
            string data = string.Empty;
            using (StreamReader sr = new StreamReader(_captionFile, System.Text.Encoding.Default))
            {
                data = sr.ReadToEnd();
            }

            return _tools.ParseInpParam(data);
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

        public bool AddRowsToFileJson(Dictionary<string, object> data)
        {
            string login = GetLoginGame(data);
            try
            {
                if (!File.Exists(_captionFile))
                {
                    Dictionary<string, object> returnsData = new Dictionary<string, object>();
                    returnsData[login] = data;
                    WriteDataToJson(returnsData);
                }
                else
                {
                    Dictionary<string, object> readData = ReadDataToJson();
                    readData[login] = data;
                    WriteDataToJson(readData);
                }
            }
            catch
            {
                return false;
            }
            return true;
        }

        public Dictionary<string, object> CheckAndReturnsData(Dictionary<string, object> data)
        {
            Dictionary<string, object> returnsData = null;
            if (File.Exists(_captionFile))//если файл есть 
            {
                string login = GetLoginGame(data);
                bool hasGame = CheckGameToLogin(login);
                if (hasGame)
                {
                    Dictionary<string, object> readData = ReadDataToJson();
                    returnsData = readData[login] as Dictionary<string, object>;
                    readData.Remove(login);
                    WriteDataToJson(readData);
                }
            }
            return returnsData;
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

        public string RetunsTopTable()
        {
            DataTable returns = null;
            if (_gameData == null)
            {
                try
                {
                    _gameData = LoadFile();
                }
                catch
                {
                    _gameData = CreateFile();
                    returns = _gameData.Tables["GamesTop"];
                }
            }
            try
            {
                DataView view = new DataView(_gameData.Tables["GamesTop"]);
                view.Sort = "q_width ASC, q_mine ASC, q_height ASC, timeGame ASC";
                returns = view.ToTable().AsEnumerable().Take(10).CopyToDataTable();
            }
            catch {
                return string.Empty;
            }
            return _tools.TableToJson(returns);
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

}
