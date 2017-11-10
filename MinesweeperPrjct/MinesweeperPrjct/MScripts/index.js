$(document).ready(function () {
    $("body").on("contextmenu", false);

    // проверка символов
    $("input[name^='q']").on('keypress', function (e) {
        e = e || event;
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        var chr = getChar(e);
        if (chr == null) return;
        if (chr < '0' || chr > '9') {
            return false;
        }
    })

    function getChar(event) {
        if (event.which == null) {
            if (event.keyCode < 32) return null;
            return String.fromCharCode(event.keyCode) // IE
        }

        if (event.which != 0 && event.charCode != 0) {
            if (event.which < 32) return null;
            return String.fromCharCode(event.which) // остальные
        }

        return null; // специальная клавиша
    }

    //событие изменения input 
    $("input[type='radio']").on('change', function (e) {

        var value = $(this).val();
        if (value === '3')
            $("input[name^='q']").removeAttr("disabled");
        else
            $("input[name^='q']").attr('disabled', 'disabled');
        var canvasObj = CanvasClearObject.getCanvasObj();
        var game = new Game();
        game.initGame(canvasObj.canvas, canvasObj.context);
    });
    // проверка на допустимые диапазоны
    $("input[name^='q']").on('change', function (e) {
        var caption = $(this).attr('name');
        var value = $(this).val();
        if (caption.indexOf('mine') > -1 && (value < 10 || value > 668)) {
            alert('Поле заполнено не корректно');
            $(this).val('');
            return false
        }
        else if (caption.indexOf('mine') == -1 && (value < 9 || value > 30)) {
            alert('Поле заполнено не корректно');
            $(this).val('');
            return false
        }
        var canvasObj = CanvasClearObject.getCanvasObj();
        var game = new Game();
        game.initGame(canvasObj.canvas, canvasObj.context);
    })

    var user = new UserData();
    user.startUserData();
    var game = new Game();
    game.topInfo();

    $('#input-user').on('click', function (e) {
        user.LogOut();
    })
    $('.log_in_button').on('click', function (e) {
        user.LogIn();
    })
    $('.cancel_log_in_button').on('click', function (e) {
        user.clearFields();
    })

    var colorTheme = new ColorTheme();
    colorTheme.setStartTheme();
    $('.set_default_color_btn').on('click', function (e) {
        colorTheme.setDefaultTheme();
    });
    $('.set_color_btn').on('click', function (e) {
        colorTheme.setCustomTheme();
    });

    $('.rezult_in_button').on('click', function (e) {
        var canvasObj = CanvasClearObject.getCanvasObj();
        var game = new Game();
        game.initGame(canvasObj.canvas, canvasObj.context);
    })

    $('.save_in_button').on('click', function (e) {
        var game = new Game();
        game.saveGameAjax(localStorage.getItem('GameInfo'));
        game.stopGame('');
        localStorage.removeItem('GameInfo');
        game.setNonActiveGame();
    })
    $('.cancel_save_in_button').on('click', function (e) {
        localStorage.removeItem('GameInfo');
        var canvasObj = CanvasClearObject.getCanvasObj();
        var game = new Game();
        game.initGame(canvasObj.canvas, canvasObj.context);
        game.setNonActiveGame();
        setValueToForm();


    })

    $('.cancel_save_in_button').on('click', function (e) {
        var game = new Game();
        game.stopGame('');
        localStorage.removeItem('GameInfo');
    })
})
//Счетчик
var timer;
var Timer = function () {
    this.start_timer = function () {
        if (timer) clearInterval(timer);
        secs = 0;
        $('#timer').text(secs);
        timer = setInterval(
            function () {
                secs++;
                $('#timer').text(secs);
            },
            1000
        );
    }

    this.stop_timer = function () {
        if (timer) clearInterval(timer);
    }
}

//Класс пользователь
var UserData = function () {

    setValueToForm = function () {
        var _userData = JSON.parse(localStorage.getItem('UserInfo'));
        var game = new Game();
        if (!_userData) {
            $('#no-input-user').show();
            $('#input-user').hide();
            game.setNonActiveGame();
            //this.clearFields();
        }
        else {
            $('#login').text(_userData.login);
            $('#no-input-user').hide();
            $('#input-user').show();
            game.setActiveGame();

        }
    }

    this.startUserData = function () {
        var _userData = JSON.parse(localStorage.getItem('UserInfo'));
        if (!_userData)
            $('#modal_login').modal('show');
        else
            setValueToForm();
    }

    this.LogIn = function () {
        var login = $("input[name = login]").val();
        var pasw = $("input[name = password]").val();
        var re = /[,.!?;:'"()]/;
        if (!re.test(pasw) && !re.test(login) && login != '' && pasw != '') {
            var sendJSON = {
                login: login,
                password: pasw
            }
            var game = new Game();
            $.ajax({
                type: "Post",
                url: "./Data.asmx/setPlayerInGame",
                data: "{inputsParam:'" + JSON.stringify(sendJSON) + "'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    let resp = JSON.parse(data.d)
                    if (resp.HasError) {
                        alert('Пользователь под таким логином уже зарегистрирован');
                    }
                    else {
                        localStorage.setItem('UserInfo', JSON.stringify(sendJSON));
                        setValueToForm();
                        game.setActiveGame();
                    }
                },
                error: function (response) {
                    alert('Ошибка сервера :(');
                }
            });
            game.getGameAjax(sendJSON);

        }
        else {
            alert('Введены не допустимые символы!');
        }
    }

    this.LogOut = function () {
        var game = new Game();
        localStorage.removeItem('UserInfo');
        //localStorage.removeItem('GameInfo');
        var _gameInfo = JSON.parse(localStorage.getItem('GameInfo'));
        if (_gameInfo)
            if (!_gameInfo.statusGame)
                $('#modal_save').modal('show');
            else {
                localStorage.removeItem('GameInfo');
                var canvasObj = CanvasClearObject.getCanvasObj();
                game.initGame(canvasObj.canvas, canvasObj.context);
            }
        setValueToForm()
    }

    this.clearFields = function () {
        $("input[name = login]").val('');
        $("input[name = password]").val('');
    }
}


//параметры цветовых схем
var ColorTheme = function () {

    getValueTheme = function () {
        var ColorTheme = JSON.parse(localStorage.getItem('ColorTheme'));
        if (!ColorTheme) {
            var ColorTheme = {
                cl_background: '#ffffff',
                cl_fontlColor: '#000000',
                cl_borderColor: '#000000',
                cl_cellColor: '#dddddd'
            }
            localStorage.setItem('ColorTheme', JSON.stringify(ColorTheme));
        }
        return ColorTheme
    }

    setValue = function (ColorTheme) {
        var canvasObj = CanvasClearObject.getCanvasObj();
        $('.general_area').css({ 'background': ColorTheme.cl_background, 'color': ColorTheme.cl_fontlColor })
        $('canvas').css({ 'border': '2px solid', 'border-color': ColorTheme.cl_borderColor });
        var game = new Game();
        game.initGame(canvasObj.canvas, canvasObj.context);
    }

    this.setStartTheme = function () {
        var ColorTheme = getValueTheme();
        for (var item in ColorTheme) {
            $('input[name=' + item + ']').val(ColorTheme[item]);
        }
        setValue(ColorTheme);
    }

    this.setCustomTheme = function () {
        var objColor = $("input[name^='cl_']");
        var ColorTheme = {}
        for (var i = 0; i < objColor.length; i++) {
            var item = objColor[i];
            var key = $(item).attr('name');
            var value = $(item).val();
            ColorTheme[key] = value.replace('%23', '#');
        }
        localStorage.setItem('ColorTheme', JSON.stringify(ColorTheme));
        setValue(ColorTheme);
    }

    this.setDefaultTheme = function () {
        localStorage.removeItem('ColorTheme');
        var ColorTheme = getValueTheme();
        this.setStartTheme();
    }
}


// перерисовка канвы
var CanvasClearObject = (function () {
    var canvasObject;
    function createCanvasObj() {
        var canvas = document.querySelector('canvas')
        if ($(canvas).hasClass('gray')) 
            $('.canvas_elem').html('<canvas class="gray"></canvas>');
        else
        $('.canvas_elem').html('<canvas></canvas>');
        var canvas = document.querySelector('canvas')
        var context = canvas.getContext('2d')
        var obj = {
            canvas: canvas,
            context: context
        }
        return obj;
    }
    return {
        getCanvasObj: function () {
            canvasObject = createCanvasObj();
            return canvasObject;
        }
    };
})();

//генератор игры
var CellGenerator = function (cellData, parameters) {
    var _cellData = cellData;
    var _parameters = parameters;

    getRandom = function (max) {
        var rand = Math.random() * max;
        rand = Math.floor(rand);
        return rand;
    }

    getMine = function (x, y) {
        var cell = _cellData[x][y];
        var mine = cell.mine;
        return mine;
    }

    setMine = function (x, y) {
        var cell = _cellData[x][y];
        cell.mine = true;
        _cellData[x][y] = cell;

    }

    getCountOfNeighboringMined = function (x, y) {
        var cell = _cellData[x][y];
        var countOfNeighboringMinedCells = cell.countOfNeighboringMinedCells;
        return countOfNeighboringMinedCells;
    }

    setCountOfNeighboringMined = function (x, y, count) {
        var cell = _cellData[x][y];
        cell.countOfNeighboringMinedCells = count;
        _cellData[x][y] = cell;
    }
    
    generatedMine = function (row, col) {
        var _q_width = _parameters.q_width;
        var _q_height = _parameters.q_height;
        var _q_mine = _parameters.q_mine;

        for (var i = 0; i < _q_mine; i++) {
            var _row;
            var _col;
            do {
                _row = getRandom(_q_height);
                _col = getRandom(_q_width);
            }
            while (row == _row && col == _col)
            setMine(_row, _col);
        }
    }

    generatedCountOfNeighboringMined = function () {
        for (var x = 0; x < _cellData.length; x++) {
            for (var y = 0; y < _cellData[x].length; y++) {
                if (getMine(x, y)) {
                    setCountOfNeighboringMined(x, y, -1)
                    continue;
                }

                if ((y - 1) >= 0) {
                    if (getMine(x, y - 1)) {
                        var count = getCountOfNeighboringMined(x, y);
                        setCountOfNeighboringMined(x, y, count + 1)
                    }
                }

                if ((x - 1) >= 0 && (y - 1) >= 0) {
                    if (getMine(x - 1, y - 1)) {
                        var count = getCountOfNeighboringMined(x, y);
                        setCountOfNeighboringMined(x, y, count + 1)
                    }
                }

                if ((x - 1) >= 0) {
                    if (getMine(x - 1, y)) {
                        var count = getCountOfNeighboringMined(x, y);
                        setCountOfNeighboringMined(x, y, count + 1)
                    }
                }

                if ((x - 1) >= 0 && (y + 1) < _cellData[x].length) {
                    if (getMine(x - 1, y + 1)) {
                        var count = getCountOfNeighboringMined(x, y);
                        setCountOfNeighboringMined(x, y, count + 1)
                    }
                }

                if ((y + 1) < _cellData[x].length) {
                    if (getMine(x, y + 1)) {
                        var count = getCountOfNeighboringMined(x, y);
                        setCountOfNeighboringMined(x, y, count + 1)
                    }
                }

                if ((x + 1) < _cellData.length && (y + 1) < _cellData[x].length) {
                    if (getMine(x + 1, y + 1)) {
                        var count = getCountOfNeighboringMined(x, y);
                        setCountOfNeighboringMined(x, y, count + 1)
                    }
                }

                if ((x + 1) < _cellData.length) {
                    if (getMine(x + 1, y)) {
                        var count = getCountOfNeighboringMined(x, y);
                        setCountOfNeighboringMined(x, y, count + 1)
                    }
                }

                if ((x + 1) < _cellData.length && (y - 1) >= 0) {
                    if (getMine(x + 1, y - 1)) {
                        var count = getCountOfNeighboringMined(x, y);
                        setCountOfNeighboringMined(x, y, count + 1)
                    }
                }
            }
        }
        return _cellData;
    }

    this.generatedMinedArea = function (row, col) {
        generatedMine(row, col);
        generatedCountOfNeighboringMined();
        return _cellData;
    }

    this.loadGame = function () { }
}

//класс Игра
var Game = function () {
    var _timeGame = $('#timer').text();
    var _level = $("input[type='radio']:checked").val();
    var _cellData; // массив ячеек игры
    var _statusGame = true; // флаг закончена не закончена true закончена false продолжается
    var _history = [];
    var _parameters = Parameters.getParameters();
    var _timer = new Timer();
    var _mine = _parameters.q_mine;
    var _loadGame = false;
    var _firstClick = true;

    this.firstClick = function (firstClick) {
        if (arguments.length)
            _firstClick = firstClick;
        else
            return _firstClick;
    },
    this.parameters = function (parameters) {
        if (arguments.length)
            _parameters = parameters;
        else
            return _parameters;
    }
    this.loadGameSt = function (loadGameSt) {
        if (arguments.length)
            _loadGame = loadGameSt;
        else
            return _loadGame;
    },
    this.mine = function (mine) {
            if (arguments.length) {
                _mine = mine;
                if (mine >= 0)
                    $('#mine').text(mine)
            }
            else
                return _mine;
        },
    this.timeGame = function (timeGame) {
            if (arguments.length) { 
            _timeGame = timeGame;
            $('#timer').text(timeGame)
        }
            else
                return _timeGame;
        },
    this.level = function (level) {
            if (arguments.length) {
                _level = level;
                var $radios = $("input[type='radio']");
                $radios.filter('[value='+level+']').prop('checked', true);
            }
            else
                return _level;
        },

    sendDataToTop = function (caption) {
            setGameInfo();

            var sendObject = {
                user: _parameters.login,
                timeGame: _timeGame,
                level: _level,
                q_width: _parameters.q_width,
                q_height: _parameters.q_height,
                q_mine: _parameters.q_mine
            }
            debugger
            if (caption.indexOf('Поздравляем') > -1)
                sendDataToTopAjax(sendObject);
        }
    //получить последний ход
    getHistoryItem = function () {
        var index = _history.length - 1;
        var historyCell = _history[index];
        return historyCell;
    }

    setGameInfo = function () {
        var index_level = $("input[type='radio']:checked").val();
        switch (index_level) {
            case "0":
                _level = 'Новичок';
                break;
            case "1":
                _level = 'Любитель';
                break;
            case "2":
                _level = 'Профи';
                break;
            case "3":
                var q_width = _parameters.q_width;
                var q_height = _parameters.q_height;
                var q_mine = _parameters.q_mine;
                _level = 'Особый поле ' + q_width + 'x' + q_height + ' ' + q_mine + 'мин';
                break;
        }
        _timeGame = $('#timer').text();
    }

    sendDataToTopAjax = function (sendObject) {
        $.ajax({
            type: "Post",
            url: "./Data.asmx/setWinInfo",
            data: "{inputsParam:'" + JSON.stringify(sendObject) + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                if (data.d != '') {
                    let resp = JSON.parse(data.d)
                    if (resp.HasError) {
                        alert('что то пошло не так');
                    }
                    else {

                        var txt;
                        for (var i = 0; i < resp.length; i++) {
                            var item = resp[i];
                            txt += '<tr<td></td><td>' + (i + 1) + '</td><td>' + item.user + '</td><td>' + item.level + '</td><td>' + item.q_width + ' x ' + item.q_height + '</td><td>' + item.q_mine + '</td><td>' + item.timeGame + ' сек.</td></tr>';
                        }
                        $('#top').html(txt);
                        $('table').show();
                    }
                }
            },
            error: function (response) {
                alert('Ошибка сервера :(');
            }
        });
    }

    // создание кнопки отмены
    this.createButtons = function () {
            var _this = this;
            var img = $('<img/>', {
                class: 'img-fluid',
                src: './images/arrow.png',
                style: 'width:2.5rem',
            });
            var button = $('<a/>',
                {
                    class: 'cancellaction-button',
                    click: this.cancellAction,
                    style: 'display:none'
                }).append(img)
            $('.cancelActions-area').html(button);


            var newGamebutton = $('<buttons/>',
                {
                    class: 'new-button btn btn-outline-primary btn-sm',
                    click: _this.newGame,
                    text: 'Начать новую игру',
                })
            $('.new-area').html(newGamebutton);

            var saveGamebutton = $('<buttons/>',
                {
                    class: 'save-button btn btn-outline-primary btn-sm',
                    click: _this.saveGame_,
                    text: 'Сохранить игру',
                    style: 'display:none'
                })
            $('.save-area').html(saveGamebutton);

        },

    //добавить ход в историю
    this.setHistoryItem = function (row, col, typeClick) {
            var keyAction;
            var valueAction;

            if (typeClick < 0) {
                keyAction = 'openCell'
                valueAction = true
            }
            else if (typeClick > 0) {
                keyAction = 'suggestMine'
                valueAction = true
            }
            var obj = {
                row: row,
                col: col,
                keyAction: keyAction,
                valueAction: valueAction,
            }
            _history.push(obj);
        }

    this.initGame = function (canvas, context) {
        this.createButtons();
        var gameInfo = JSON.parse(localStorage.getItem('GameInfo'));
        var gameArea = new GameArea(_parameters);
        var _this;
        if (gameInfo) {
            this.timeGame(gameInfo.timeGame);
            this.cellData = _cellData
            this.loadGameSt(true);
            this.mine(gameInfo.mine);
            this.parameters(gameInfo.parameters);
            this.level(gameInfo.level);
            _cellData = gameArea.GameLoad(gameInfo.cellData, context);
        }
        else {
            _cellData = gameArea.drawArea(canvas, context);

        }
        var _this = this;
        canvas.addEventListener('mousedown', function (e) {
            gameArea.clickArea(e, _cellData, context, _this)
        }, false);

    }
    //отмена хода
    this.cancellAction = function () {

        var historyCell = getHistoryItem();
        var cell = _cellData[historyCell.row][historyCell.col];

        var actions = historyCell.keyAction;
        var value = historyCell.valueAction;

        if (actions === 'openCell')
            cell.openCell = !value;
        else
            cell.suggestMine = !value;
        _cellData[historyCell.row][historyCell.col] = cell;
        var canvas = document.querySelector('canvas')
        var context = canvas.getContext('2d');
        cell.redraw(context);
        $('.cancellaction-button').hide();
    }

    this.topInfo = function () {
        sendDataToTopAjax(null);
    }

    this.setActiveTools = function () {
        $('.nav-link ').removeClass('disabled');
        $("input[type='radio']").attr('disabled', false);
    }

    this.setNonActiveTools = function () {
        $('.nav-link ').addClass('disabled');
        $("input[type='radio']").attr('disabled', true);
    }

    this.stopGame = function (caption) {
        setGameInfo();
        $('.status_game').text(caption);
        $('.user_game').text(_parameters.login);
        $('.level_game').text(_level);
        $('.time_game').text(_timeGame);
        $('.cancellaction-button').hide();
        if (caption != '')
            $('#modal_rezult').modal('show');
        _timer.stop_timer();
        localStorage.removeItem('GameInfo');
        sendDataToTop(caption);
        this.setActiveTools();
        this.setNoNActiveButtons();
    }

    this.startGame = function () {
        //localStorage.removeItem('GameInfo');
        $('#mine').text(_parameters.q_mine);
        _timer.start_timer();
        _statusGame = false;
        //this.setActiveGame();
        this.setNonActiveTools()
        this.setActiveButtons();
    }

    this.setActiveButtons = function () {
        $('.save-button').show();

    }

    this.setNoNActiveButtons = function () {
        $('.save-button').hide();
    }

    this.setActiveGame = function () {
        $('canvas').removeClass('gray');
        $('.tools-area').removeClass('gray');
    }

    this.setNonActiveGame = function () {
        $('canvas').addClass('gray');
        $('.tools-area').addClass('gray');
    }

    this.SetLoadGameParam = function () {
        $('#timer').text(this.timeGame());
        $('#mine').text(this.mine());
        //TO DO level
    }

    this.saveGame = function () {
        var obj = {
            timeGame: _timeGame,
            level: _level,
            cellData: _cellData,
            statusGame: _statusGame,
            parameters: Parameters.getParameters(),
            firstClick: _firstClick,
            mine: _mine,
            level: _level
        }
        localStorage.setItem('GameInfo', JSON.stringify(obj));
    }

    this.loadGame = function () {
        var game = new Game();
        game.getGameAjax(sendJSON);
    }

    this.newGame = function () {
        localStorage.removeItem('GameInfo');
        location.reload();
    }

    this.saveGame_ = function () {
        var game = new Game();
        game.saveGameAjax(localStorage.getItem('GameInfo'));
    }

    this.saveGameAjax = function (game) {
        $.ajax({
            type: "Post",
            url: "./Data.asmx/setGameInfo",
            data: "{inputsParam:'" + game + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                let resp = JSON.parse(data.d)
                if (resp.HasError) {
                    alert('что то пошло не так');
                }
                else {
                    alert('Игра успешно сохранена!');
                    //To DO:если нажат выход то выйти если нет то продолжать
                    //localStorage.removeItem('GameInfo');
                }
            },
            error: function (response) {
                alert('Ошибка сервера :(');
            }
        });
    }

    this.getGameAjax = function (sendJSON) {
        $.ajax({
            type: "Post",
            url: "./Data.asmx/getGameInfo",
            data: "{inputsParam:'" + JSON.stringify(sendJSON) + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                let resp = JSON.parse(data.d)
                if (resp != null) {

                    localStorage.setItem('GameInfo', JSON.stringify(resp))
                    $('#modal_load').modal('show');
                }
            },
            error: function (response) {
                alert('Ошибка сервера :(');
            }
        });
    }
}

// формирование обьекта с параметрами игры 
var Parameters = (function () {
    var objParameters;
    //получить праметры с формы 
    function getParametersForm(formCaption) {
        var obj = {};
        var sendStr = $('#' + formCaption).serialize();
        var sendArr = sendStr.split('&');
        var obj = {};
        for (var i = 0; i < sendArr.length; i++) {
            var item = sendArr[i];
            var elem = item.split('=');
            obj[elem[0]] = elem[1];
        }
        return obj;
    }

    function createParameters() {
        var baseParam = getParametersForm('baseForm');
        var userData = JSON.parse(localStorage.getItem('UserInfo'));
        baseParam.login = userData ? userData.login : 'Нет данных';
        baseParam.cell_width = 20;
        baseParam.cell_height = 20;

        switch (baseParam.level) {
            case '0': // easy
                baseParam.q_width = 9;
                baseParam.q_height = 9;
                baseParam.q_mine = 10;
                baseParam.cell_width = 40;
                baseParam.cell_height = 40;
                break
            case '1': // medium
                baseParam.q_width = 16;
                baseParam.q_height = 16;
                baseParam.q_mine = 40;
                baseParam.cell_width = 30;
                baseParam.cell_height = 30;
                break
            case '2': // hard
                baseParam.q_width = 30;
                baseParam.q_height = 16;
                baseParam.q_mine = 99;
                break;
            default: {
                if (baseParam.q_width <= 10 && baseParam.q_height <= 10) {
                    baseParam.cell_width = 40;
                    baseParam.cell_height = 40;
                }
                else if (baseParam.q_width <= 16 && baseParam.q_height <= 16) {
                    baseParam.cell_width = 30
                    baseParam.cell_height = 30;
                }
            }
        }
        return baseParam;
    }
    return {
        getParameters: function () {
            //if (!objParameters) {
            objParameters = createParameters();
            //}
            return objParameters;
        }
    };
})();
// класс ячейка
var Cell = function (x, y, cellWidth, cellHeight, mine, suggestMine, suggestEmpty, countOfNeighboringMinedCells, color) {
    var _cellWidth = cellWidth;
    var _cellHeight = cellHeight;
    var _color = color;
    this.x = x;
    this.y = y;
    this.mine = mine;//мина.не мина
    this.suggestMine = suggestMine; //предположение мина.не мина
    this.countOfNeighboringMinedCells = countOfNeighboringMinedCells; // соседние ячейки(цифра)
    this.openCell = suggestEmpty; // уже открыта

    this.redraw = function (context) {
        context.clearRect(this._x, this._y, _cellWidth, _cellHeight);
        context.strokeStyle = '#000';
        context.lineWidth = 1;
        context.fillStyle = _color.replace('%23', '#');
        context.fillRect(this.x, this.y, _cellHeight, _cellWidth);
        context.strokeRect(this.x, this.y, _cellHeight, _cellWidth);
    }

    //отрисовать пустую закрытую клетку
    this.drawCloseEmpty = function (context) {
        context.strokeStyle = '#000';
        context.lineWidth = 1;
        context.fillStyle = _color.replace('%23', '#');
        context.fillRect(this.x, this.y, this.x + _cellHeight, this.y + _cellWidth);
        context.strokeRect(this.x, this.y, this.x + _cellHeight, this.y + _cellWidth);
    }

    this.drawCountOfNeighboringMinedCells = function (context, x_pos, y_pos) {
        var img = new Image();
        context.beginPath();
        switch (this.countOfNeighboringMinedCells) {
            case -1:
                this.redraw(context);
                img = document.getElementById('img_mine')
                break;
            case 0:
                context.strokeStyle = '#000';
                context.lineWidth = 1;
                context.fillStyle = '#fff';
                context.fillRect(this.x, this.y, _cellHeight, _cellWidth);
                context.strokeRect(this.x, this.y, _cellHeight, _cellWidth);
                break;
            default:
                this.redraw(context);
                img = document.getElementById('img_' + this.countOfNeighboringMinedCells)
                break;
        }

        context.drawImage(img, this.x, this.y, _cellWidth, _cellHeight);
    }

    this.drawFlags = function (context, x_pos, y_pos) {
        this.redraw(context);
        context.drawImage(document.getElementById('flag'), this.x, this.y, _cellWidth, _cellHeight);
    }
}


//класс игровое поле
var GameArea = function (parameters) {
    var _parameters = parameters;
    var _firstClick = true;

    // получить строку столбец массива 
    getCellCoordsInArray = function (e) {
        var _q_width = _parameters.q_width;
        var _q_height = _parameters.q_height;

        var _cell_width = _parameters.cell_width;
        var _cell_height = _parameters.cell_height

        var x;
        var y;
        if (e.pageX != undefined && e.pageY != undefined) {
            x = e.pageX;
            y = e.pageY;
        }
        else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        var offset = $('canvas').offset();
        x -= offset.left;
        y -= offset.top;
        x = Math.min(x, _q_width * _cell_width);
        y = Math.min(y, _q_height * _cell_height);

        var coords = {
            row: Math.floor(y / _cell_height),
            col: Math.floor(x / _cell_width)
        }

        return coords;
    }

    getCellinArray = function (cellData, x, y) {
        var cell = cellData[x][y];
        return cell;
    }

    typeClick = function (e) {
        if (e.which == 1) //left
            return -1;
        else if (e.which == 3) //right
            return 1
        else return 0;
    }

    GameOver = function (cellData, context) {
        for (var row = 0; row < cellData.length; row++)
            for (var col = 0; col < cellData[row].length; col++) {
                var cell = cellData[row][col];
                cell.drawCountOfNeighboringMinedCells(context, row, col);
            }
    }

    firstClick = function (e, cellData, context, game, coords) {
        var cell = getCellinArray(cellData, coords.row, coords.col);
        if (typeClick(e) < 0) {
            cell.drawCountOfNeighboringMinedCells(context, coords.row, coords.col);
            cell.openCell = true;
        }
        else if (typeClick(e) > 0) {
            cell.drawFlags(context, coords.row, coords.col);
            cell.suggestMine = true;

        }

    }

    //нарисовать пустое поле 
    this.drawArea = function (canvas, context) {
        // Представление всех ячеек
        var cells = []
        var canvasWidth = _parameters.q_width * _parameters.cell_width;
        var canvasHeight = _parameters.q_height * _parameters.cell_height;
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        var cellWidth = _parameters.cell_width
        var cellHeight = _parameters.cell_height

        var i = 0;
        for (var y = 0; y < canvasHeight; y += cellHeight) {
            cells[i] = [];
            var j = 0;
            for (var x = 0; x < canvasWidth; x += cellWidth) {
                var cell = new Cell(x, y, _parameters.cell_width, _parameters.cell_height, false, false, false, 0, _parameters.cl_cellColor)
                cell.drawCloseEmpty(context);
                cells[i][j] = cell;
                j++;
            }
            i++;
        }
        return cells;
    }

    this.GameLoad = function (cellData, context) {
        var cells = [];
        var _parameters = Parameters.getParameters();
        var canvas = document.querySelector('canvas')
        var canvasWidth = _parameters.q_width * _parameters.cell_width;
        var canvasHeight = _parameters.q_height * _parameters.cell_height;
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        var cellWidth = _parameters.cell_width
        var cellHeight = _parameters.cell_height

        var i = 0;
        for (var y = 0; y < canvasHeight; y += cellHeight) {
            cells[i] = [];
            var j = 0;
            for (var x = 0; x < canvasWidth; x += cellWidth) {
                var cell = cellData[i][j];
                var _cell = new Cell(cell.x, cell.y, _parameters.cell_width, _parameters.cell_height, cell.mine, cell.suggestMine, cell.openCell, cell.countOfNeighboringMinedCells, _parameters.cl_cellColor)
                if (cell.openCell)
                    _cell.drawCountOfNeighboringMinedCells(context, i, j);
                else if (cell.suggestMine)
                    _cell.drawFlags(context, i, j);
                else
                    _cell.drawCloseEmpty(context);
                cells[i][j] = _cell;
                j++;
            }
            i++;
        }
        return cells;
    }

    this.clickArea = function (e, cellData, context, game) {
        var parameters = Parameters.getParameters();
        var logicsGame = new LogicsGame(cellData, parameters.q_mine);
        var coords = getCellCoordsInArray(e);
        var status = true; //статус игры если true - все норм false - жахнулись на мине
        if (game.firstClick()) {
            game.firstClick(false)
            if (!game.loadGameSt()) {
                cellGenerator = new CellGenerator(cellData, _parameters); // TO DO singleTON
                cellData = cellGenerator.generatedMinedArea(coords.row, coords.col);
            }
            firstClick(e, cellData, context, game, coords);
            game.startGame();
            game.saveGame(cellData);
        }
        else {
            status = logicsGame.checkCell(coords.row, coords.col, typeClick(e));
            game.setHistoryItem(coords.row, coords.col, typeClick(e));
            $('.cancellaction-button').show();
            var cell = cellData[coords.row][coords.col];
            if (status.openCell) {
                cell.openCell = true;
                cell.drawCountOfNeighboringMinedCells(context, coords.row, coords.col);
            }
            else if (status.suggestMine) {
                cell.suggestMine = true;
                cell.drawFlags(context, coords.row, coords.col);
                var mine = game.mine();
                game.mine(mine-1);
            }
            else if (status.hasFinish && status.gameOver) {
                GameOver(cellData, context);
                game.stopGame('Вы проиграли');
                return;
                //проиграли
            }
            else if (status.hasFinish && !status.gameOver) {
                game.stopGame('Поздравляем с победой.');
                return;
                //победили
            }
            game.saveGame();
        }

    }
}

//класс логика
var LogicsGame = function (cellData, q_mine) {
    var _cellData = cellData;
    var _countCell = cellData.length * cellData[0].length;
    var _q_mine = q_mine;

    getOpenCell = function () {
        var countOpenCell = 1;
        for (var row = 0; row < _cellData.length; row++)
            for (var col = 0; col < _cellData[row].length; col++) {
                var cell = _cellData[row][col];
                if (cell.openCell)
                    countOpenCell++;
            }
        return countOpenCell;
    }

    chekfinished = function () {
        var countOpenCell = getOpenCell();
        if (countOpenCell == (_countCell - _q_mine))// если все ячейки без мин открыты то заканчиваем игру
            return true;
        else
            return false;
    }

    this.checkCell = function (row, col, typeClick) {
        var cell = _cellData[row][col];
        var rObj = {
            hasFinish: true,
            gameOver: true,
            openCell: false,
            suggestMine: false
        };

        if (cell.mine && (typeClick < 0)) {
            return rObj;
        }
        else {
            if (typeClick < 0) {
                return rObj = {
                    openCell: true
                }
            }
            else if (typeClick > 0) {
                return rObj = {
                    suggestMine: true
                }
            }
            if (chekfinished()) {
                return rObj = {
                    hasFinish: true,
                    gameOver: false
                }
            }
            else
                return rObj = {
                    hasFinish: false,
                    gameOver: false
                }
        }
    }
}
