$(document).ready(function () {
    $("body").on("contextmenu", false);

    var canvas = document.querySelector('canvas')
    var context = canvas.getContext('2d')

    $('.log_in_button').on('click', function (e) {
        var login = $("input[name = login]").val();
        var pasw = $("input[name = password]").val();
        var re = /[,.!?;:'"()]/;//не знаю что ограничивать, думаю только знаки препинания кроме тире и слеша
        if (!re.test(pasw) && !re.test(login)) {
            //все прошло
            var sendJSON = {
                login: login,
                password : pasw
            }

            //localStorage.setItem('UserInfo', JSON.stringify(data));
            //var userObj = JSON.parse(localStorage.getItem('UserInfo'));
            //localStorage.removeItem('UserInfo');

            $.ajax({
                type: "Post",
                url: "./Data.asmx/setPlayerInGame",
                data: "{inputsParam:'" + JSON.stringify(sendJSON) + "'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    let resp = JSON.parse(data.d)
                    alert(resp)
                },
                error: function (response) {
                    alert('Error to sent data :(');
                }
            }
            );
        }
        else
            alert('Введены не допустимые символы!')
    })

    $('.cancel_log_in_button').on('click', function (e) {
        alert('cacel');
    })

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
        var parameters = Parameters.getParameters();
        var gameArea = new GameArea(parameters);
        gameArea.drawArea();

    })

    var game = new Game();
    game.initGame(canvas, context);

})

// перерисовка канвы
var CanvasClearObject = (function () {
    var canvasObject;
    function createCanvasObj() {
        $('.canvas_elem').html('');
        $('.canvas_elem').html('<canvas style="border: 1px solid #000;"></canvas>');
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
            //if (!objParameters) {
            canvasObject = createCanvasObj();
            //}
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
        var mine = cell.mine();
        return mine;
    }

    setMine = function (x, y) {
        var cell = _cellData[x][y];
        cell.mine(true);
        _cellData[x][y] = cell;

    }
    getCountOfNeighboringMined = function (x, y) {
        var cell = _cellData[x][y];
        var countOfNeighboringMinedCells = cell.countOfNeighboringMinedCells();
        return countOfNeighboringMinedCells;
    }

    setCountOfNeighboringMined = function (x, y, count) {
        var cell = _cellData[x][y];
        cell.countOfNeighboringMinedCells(count);
        _cellData[x][y] = cell;
    }
    // row col координаты в массиве кликнутой ячейки
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
    var _user;
    var _timeGame; // время игры
    var _level; // сложность
    var _dateGame; // когда проходила игр
    var _cellData; // массив ячеек игры
    var _statusGame; // флаг закончена не закончена
    var _history = [];

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

        var savebutton = $('<buttons/>',
            {
                class: 'save-button btn btn-outline-primary btn-sm',
                click: this.saveGame,
                text: 'Сохранить игру'
            })
        $('.save-area').html(savebutton);

        var loadbutton = $('<buttons/>',
            {
                class: 'save-button btn btn-outline-primary btn-sm',
                click: this.loadGame,
                text: 'Загрузить игру'
            })
        $('.load-area').html(loadbutton);

        var newGamebutton = $('<buttons/>',
            {
                class: 'save-button btn btn-outline-primary btn-sm',
                click: _this.newGame,
                text: 'Начать заново'
            })
        $('.new-area').html(newGamebutton);

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
    //получить последний ход
    getHistoryItem = function () {
        var index = _history.length - 1;
        var historyCell = _history[index];
        return historyCell;
    }

    this.initGame = function (canvas, context) {
        this.createButtons();

        //   //читаем параметры 
        var parameters = Parameters.getParameters();
        //  //формируем поле 
        var gameArea = new GameArea(parameters);
        //// рисуем поле

        _cellData = gameArea.drawArea(canvas, context);
        var _this = this;
        canvas.addEventListener('mousedown', function (e) {
            gameArea.clickArea(e, _cellData, context, _this)
        }, false);

        canvas.addEventListener('mouseup', function (e) {
            gameArea.clickArea(e, _cellData, context)
        }, false);


    }
    //отмена хода
    this.cancellAction = function () {

        var historyCell = getHistoryItem();
        var cell = _cellData[historyCell.row][historyCell.col];

        var actions = historyCell.keyAction;
        var value = historyCell.valueAction;

        if (actions === 'openCell')
            cell.openCell(!value)
        else
            cell.suggestMine(!value)
        _cellData[historyCell.row][historyCell.col] = cell;
        var canvas = document.querySelector('canvas')
        var context = canvas.getContext('2d');
        cell.redraw(context);
        $('.cancellaction-button').hide();
    }
    this.startGame = function () {
        alert('стартанули');

    }
    this.stopGame = function () {
        alert('End')
    }
    this.saveGame = function () {
        alert('save')
    }
    this.loadGame = function () {
        alert('load')
    }


    this.newGame = function () {
        var canvas = document.querySelector('canvas')
        var context = canvas.getContext('2d')
        var parameters = Parameters.getParameters();
        var gameArea = new GameArea(parameters);
        gameArea.drawArea(canvas, context);
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
        sendArr.forEach((value, index, sendArr) => { //TO DO: IE
            var elem = value.split('=');
            obj[elem[0]] = elem[1];
        })
        return obj;
    }

    function createParameters() {
        var baseParam = getParametersForm('baseForm');
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
var Cell = function (x, y, cellWidth, cellHeight, suggestMine, suggestEmpty) {
    var _x = x;
    var _y = y;
    var _cellWidth = cellWidth;
    var _cellHeight = cellHeight;
    var _mine = false;//мина.не мина
    var _suggestMine = suggestMine; //предположение мина.не мина
    var _countOfNeighboringMinedCells = 0; // соседние ячейки(цифра)
    var _open = false; // уже открыта 


    this.x = function (x) {
        if (arguments.length)
            _x = x;
        else
            return _x;
    },

        this.y = function (y) {
            if (arguments.length)
                _y = y;
            else
                return _y;
        },

        this.mine = function (mine) {
            if (arguments.length)
                _mine = mine;
            else
                return _mine;
        },

        this.countOfNeighboringMinedCells = function (countOfNeighboringMinedCells) {
            if (arguments.length)
                _countOfNeighboringMinedCells = countOfNeighboringMinedCells;
            else
                return _countOfNeighboringMinedCells;
        },
        this.openCell = function (open) {
            if (arguments.length)
                _open = open;
            else
                return _open;
        },
        this.suggestMine = function (suggestMine) {
            if (arguments.length)
                _suggestMine = suggestMine;
            else
                return _suggestMine;
        },

        this.redraw = function (context) {
            context.clearRect(_x, _y, _cellWidth, _cellHeight);
            context.strokeStyle = '#000';
            context.lineWidth = 1;
            context.fillStyle = '#ddd';
            context.fillRect(_x, _y, _cellHeight, _cellWidth);
            context.strokeRect(_x, _y, _cellHeight, _cellWidth);

        }

    //отрисовать пустую закрытую клетку
    this.drawCloseEmpty = function (context) {
        context.strokeStyle = '#000';
        context.lineWidth = 1;
        context.fillStyle = '#ddd';
        context.fillRect(_x, _y, _x + _cellHeight, _y + _cellWidth);
        context.strokeRect(_x, _y, _x + _cellHeight, _y + _cellWidth);
    }


    this.drawCountOfNeighboringMinedCells = function (context, x_pos, y_pos) {
        var img = new Image();
        switch (_countOfNeighboringMinedCells) {
            case -1:
                this.redraw(context);
                img.src = './images/mine.png';
                break;
            case 0:
                context.beginPath();
                context.strokeStyle = '#000';
                context.lineWidth = 1;
                context.fillStyle = '#fff';
                context.fillRect(_x, _y, _cellHeight, _cellWidth);
                context.strokeRect(_x, _y, _cellHeight, _cellWidth);
                break;
            default:
                this.redraw(context);
                img.src = './images/' + _countOfNeighboringMinedCells + '.png';
                break;
        }

        context.drawImage(img, _x, _y, _cellWidth, _cellHeight);
    }

    this.drawFlags = function (context, x_pos, y_pos) {
        var img = new Image();
        img.src = './images/flag.png';
        this.redraw(context);
        context.drawImage(img, _x, _y, _cellWidth, _cellHeight);
    }



}


/// 
var GameArea = function (parameters) {
    var _parameters = parameters;
    var _firstClick = true;
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
                var cell = new Cell(x, y, _parameters.cell_width, _parameters.cell_height, false, false, 0)
                cell.drawCloseEmpty(context);
                cells[i][j] = cell;
                j++;
            }
            i++;
        }
        return cells;
    }

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


    this.clickArea = function (e, cellData, context, game) {
        var parameters = Parameters.getParameters();
        var logicsGame = new LogicsGame(cellData, context, parameters.q_mine);
        var coords = getCellCoordsInArray(e);
        var status = true; //статус игры если true - все норм false - жахнулись на мине
        if (_firstClick) {
            cellGenerator = new CellGenerator(cellData, _parameters); // TO DO singleTON
            cellData = cellGenerator.generatedMinedArea(coords.row, coords.col);
            _firstClick = false;
            var cell = getCellinArray(cellData, coords.row, coords.col);
            if (typeClick(e) < 0)
                cell.drawCountOfNeighboringMinedCells(context, coords.row, coords.col);
            else if (typeClick(e) > 0)
                cell.drawFlags(context, coords.row, coords.col);
            game.startGame();

        }
        else {
            status = logicsGame.checkCell(coords.row, coords.col, typeClick(e));
            game.setHistoryItem(coords.row, coords.col, typeClick(e));
            $('.cancellaction-button').show();
            if (status.hasFinish && status.gameOver) {
                //game.stopGame();
                $('.cancellaction-button').hide();
                return;
                //проиграли
            }
            else if (status.hasFinish && !status.gameOver) {
                //победили
            }

        }

    }
}
///

var LogicsGame = function (cellData, context, q_mine) {
    var _cellData = cellData;
    var _context = context;
    var _countCell = cellData.length * cellData[0].length;
    var _q_mine = q_mine;

    getOpenCell = function () {
        var countOpenCell = 1;
        for (var row = 0; row < _cellData.length; row++)
            for (var col = 0; col < _cellData[row].length; col++) {
                var cell = _cellData[row][col];
                if (cell.openCell())
                    countOpenCell++;
            }
        return countOpenCell;
    }

    this.checkCell = function (row, col, typeClick) {
        var cell = _cellData[row][col];
        var rObj = {
            hasFinish: true,
            gameOver: true
        };

        if (cell.mine() && (typeClick < 0)) {
            GameOver()
            return rObj;
        }
        else {
            if (typeClick < 0) {
                cell.openCell(true);
                cell.drawCountOfNeighboringMinedCells(_context, row, col);
            }
            else if (typeClick > 0) {
                cell.suggestMine(true);
                cell.drawFlags(context, row, col);
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

    GameOver = function () {
        for (var row = 0; row < _cellData.length; row++)
            for (var col = 0; col < _cellData[row].length; col++) {
                var cell = _cellData[row][col];
                cell.drawCountOfNeighboringMinedCells(_context, row, col);
            }
    }
    chekfinished = function () {
        var countOpenCell = getOpenCell();
        if (countOpenCell == (_countCell - _q_mine))// если все ячейки без мин открыты то заканчиваем игру
            return true;
        else
            return false;
    }
}
