$(document).ready(function () {
    init();
    $('input').on('change keyup paste', function () {
        alert($('#baseForm').serialize());
    });
})

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

function setParamToGameArea() {
    var cellWidth = 40; // const
    var cellHeight = 40;// const

    var obj = getFormParamToObj('baseForm');

    var canvas = document.querySelector('canvas')
    var context = canvas.getContext('2d')

    canvas.width = obj.width * cellWidth;
    canvas.height = obj.height * cellHeight
}


//главный метод
function init() {
        var canvas = document.querySelector('canvas')
        var context = canvas.getContext('2d')

        // Представление всех ячеек
        var cells = []
        var canvasWidth = 400
        var canvasHeight = 400
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        var cellWidth = 40
        var cellHeight = 40
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
                        context.fillStyle = solid ? '#ddd' : '#fff';
                        context.fillRect(this.top, this.left, cellWidth, cellHeight);
                    },
                    drawBorder: function () {
                        context.beginPath();
                        context.strokeStyle = '#000';
                        // magic. According to http://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
                        context.moveTo(this.top - 0.5, this.left - 0.5)
                        context.lineTo(this.top - 0.5, this.left + cellWidth - 0.5)
                        context.lineTo(this.top + cellHeight - 0.5, this.left + cellWidth - 0.5)
                        context.lineTo(this.top + cellHeight - 0.5, this.left - 0.5)
                        context.lineTo(this.top - 0.5, this.left - 0.5)
                        context.stroke()
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