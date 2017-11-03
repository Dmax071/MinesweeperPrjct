$(document).ready(function () {
    init();

    //событие изменения input 
    $('input').on('change keyup paste', function () {
        var parameters = Parameters.getParameters();
        var gameArea = new GameArea(parameters);
        gameArea.draArea();
    });

    //   //читаем параметры 
    //var parameters = Parameters.getParameters();
    //  //формируем поле 
    //var gameArea = new GameArea(parameters);
    //// рисуем поле
    //gameArea.draArea();

})


// формирование обьекта с параметрами игры 
var Parameters = (function () {
    var objParameters;
    //получить праметры с формы 
    function getParametersForm(formCaption) {
        var obj = {};
        var sendStr = $('#'+formCaption).serialize();
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
                if (baseParam.q_width <= 10) {
                    baseParam.cell_width = 40;
                    baseParam.cell_height = 40;
                }
                else if (baseParam.q_width <= 16) {
                    baseParam.cell_width = 30
                    baseParam.cell_height =30;
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

var Cell = (function () { })()

/// 
var GameArea = function (parameters) {
    this._parameters = parameters;
}

GameArea.prototype.draArea = function () {
    var canvas = document.querySelector('canvas')
    var context = canvas.getContext('2d')

    // Представление всех ячеек
    var cells = []
    var canvasWidth = this._parameters.q_width * this._parameters.cell_width;
    var canvasHeight = this._parameters.q_height * this._parameters.cell_height;
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    var cellWidth = this._parameters.cell_width
    var cellHeight = this._parameters.cell_height
    //setParamToGameArea()
    var cellsInRow = Math.floor(canvasWidth / cellWidth)
    var cellsInColumn = Math.floor(canvasHeight / cellHeight)

    for (var top = 0; top < canvasWidth; top += cellWidth) {
        for (var left = 0; left < canvasHeight; left += cellHeight) {
            var cell = {
                top: top,
                left: left,
                solid: false,
                // аргумент говорит о том каким цветом закрашивать клетку. Предполагается что у клетки может быть 2 цвета. 
                fill: function (solid) {
                    // запоминаем состояние закрашенности клетки
                    this.solid = solid
                    if (!solid) {
                        var img = new Image();
                        img.src = './images/1.png';
                        context.drawImage(img, this.top, this.left, cellWidth, cellHeight);
                    }
                    else {
                        context.fillStyle = '#ddd';
                        context.fillRect(this.top, this.left, cellWidth + 1, cellHeight + 1 );
                    }

                },
                drawBorder: function () {
                    context.beginPath();
                    context.strokeStyle = '#000';
                    context.lineWidth = 1;

                    // magic. According to http://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
                    context.strokeRect(this.top, this.left, this.top + cellHeight, this.left + cellWidth);

                    //context.stroke()
                },
                getTop: function () {
                    return this.top
                },
                getLeft: function () {
                    return this.left
                }
            }
            cells.push(cell)
            cell.fill(true)
            cell.drawBorder()
        }
    }

}

///

var timer = 0;
//обработчик нажатия кнопки старта игры 
function StartGameClick() {
    
    // запускаем секундомер
    // блокируем меню
    // блокируем кнопку старт отображаем кнопки сохранить отмена
    timer = new Date().getTime()
}


//обработчик нажатия кнопки отмена игры 
function CancelGameClick() {
}

//обработчик нажатия кнопки сохранить 
function SaveGameClick() {

}

//обработчик нажатия кнопки старта игры 
function SetColorOptionClick() {


}





//получить данные с формы
function getFormParamToObj(formcaption) {
    var sendStr = $('#' + formcaption).serialize();
    var sendArr = sendStr.split('&');

    var sendObj = {};
    sendArr.forEach((value, index, sendArr) => {
        var elem = value.split('=');
        sendObj[elem[0]] = elem[1];
    })
    return sendObj;
}



//главный метод
function init() {
        var canvas = document.querySelector('canvas')
        var context = canvas.getContext('2d')
        
        var parameters = Parameters.getParameters();

        // Представление всех ячеек
        var cells = []
        var canvasWidth = parameters.q_width * parameters.cell_width;
        var canvasHeight = parameters.q_height * parameters.cell_height;
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        var cellWidth = parameters.cell_width
        var cellHeight = parameters.cell_height
        //setParamToGameArea()
        var cellsInRow = Math.floor(canvasWidth / cellWidth)
        var cellsInColumn = Math.floor(canvasHeight / cellHeight)

        for (var top = 0; top < canvasWidth; top += cellWidth) {
            for (var left = 0; left < canvasHeight; left += cellHeight) {
                var cell = {
                    top: top,
                    left: left,
                    solid: false,
                    // аргумент говорит о том каким цветом закрашивать клетку. Предполагается что у клетки может быть 2 цвета. 
                    fill: function (solid) {
                        // запоминаем состояние закрашенности клетки
                        this.solid = solid
                        if (!solid) {
                            var img = new Image();
                            img.src = './images/1.png';
                            context.drawImage(img, this.top, this.left, cellWidth, cellHeight);
                        }
                        else {
                            context.fillStyle ='#ddd';
                        context.fillRect(this.top, this.left, cellWidth-1, cellHeight-1);
                        }

                    },
                    drawBorder: function () {
                        context.beginPath();
                        context.strokeStyle = '#000';
                        context.lineWidth = 1;

                        // magic. According to http://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
                        context.strokeRect(this.top, this.left, this.top + cellHeight, this.left + cellWidth);

                        //context.stroke()
                    },
                    getTop: function () {
                        return this.top
                    },
                    getLeft: function () {
                        return this.left
                    }
                }
                cells.push(cell)
                cell.fill(true)
                cell.drawBorder()
            }
        }

        function getCellByPosition(top, left) {
            var topIndex = Math.floor(top / cellHeight) * cellsInRow
            var leftIndex = Math.floor(left / cellWidth)
            return cells[topIndex + leftIndex]
        }

        // Взаимодействие
        var filling = false

        function fillCellAtPositionIfNeeded(x, y, fillingMode) {
            var cellUnderCursor = getCellByPosition(x, y)
            if (cellUnderCursor.solid !== fillingMode) {
                cellUnderCursor.fill(fillingMode)
            }
            cell.drawBorder()
        }
        function handleMouseDown(event) {
            // нужно вычислить координаты клика относительно верхнего левого края canvas
            // это делается с использованием вычисления координат канваса и кроссбраузерных свойств объекта event
            // я использую некроссбраузерные свойства объекта событий
            filling = !getCellByPosition(event.layerX, event.layerY).solid
            fillCellAtPositionIfNeeded(event.layerX, event.layerY, filling)

            canvas.addEventListener('mousemove', handleMouseMove, false)
        }

        function handleMouseUp() {
            canvas.removeEventListener('mousemove', handleMouseMove)
        }

        function handleMouseMove(event) {
            fillCellAtPositionIfNeeded(event.layerX, event.layerY, filling)
        }

        canvas.addEventListener('mousedown', handleMouseDown, false)
        canvas.addEventListener('mouseup', handleMouseUp, false)

}