var $ = function(selector){return document.querySelector(selector)};

var canvas = new fabric.Canvas('canv');
canvas.selection = false;
var isObjectsSelectable = true;

var figureList = [];

fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.originX = 'center';
fabric.Object.prototype.originY = 'center';

function createFigure(params) {
  var type = $('input[name="tool"]:checked').value;
  var size = parseInt(sizeControl.value, 10);
  var angle = parseInt(angleControl.value, 10);
  var color = '#' + colorControl.value;
  var pointer = canvas.getPointer(params.e);
  var x = pointer.x;
  var y = pointer.y;
  var figure;
  switch (type) {
    case 'square':
      figure = new fabric.Rect({
        left: x,
        top: y,
        fill: color,
        width: size,
        height: size,
        angle: angle
      });
      break;
    case 'circle':
      figure = new fabric.Circle({
        left: x,
        top: y,
        fill: color,
        radius: size / 2,
        angle: angle
      });
      break;
    case 'triangle':
      figure = new fabric.Triangle({
        left: x,
        top: y,
        fill: color,
        width: size,
        height: size,
        angle: angle
      });
      break;
    case 'selection':
      figure = false;
      if (!isObjectsSelectable) {
        canvas.forEachObject(function(obj) {
          obj.selectable = true;
        });
        isObjectsSelectable = true;
      }
      break;
    default:
      throw 'Что-то пошло не так';
  }

  if (figure) {
    var options = {
      bl: true, br: true, mb: false,
      ml: false, mr: false, mt: false,
      tl: true, tr: true, mtr: true
    };
    figure.setControlsVisibility(options);
    figure.centeredScaling = true;
    figure.selectable = false;
    canvas.add(figure);
    figureList.push(figure);
    canvas.bringToFront(OutlineList[type]);
  }
}


var angleControl = $('#angle-control');
angleControl.oninput = function() {
  var val = parseInt(this.value, 10);
  $('#angle-value').innerText = this.value;
  var selectedFigure = canvas.getActiveObject();
  if (selectedFigure != null) {
    selectedFigure.setAngle(val).setCoords();
  }
  squareOutline.setAngle(val).setCoords();
  circleOutline.setAngle(val).setCoords();
  triangleOutline.setAngle(val).setCoords();
  canvas.renderAll();
};

var sizeControl = $('#size-control');
sizeControl.oninput = function() {
  $('#size-value').innerText = this.value;
  var val = parseInt(this.value, 10);
  var selectedFigure = canvas.getActiveObject();
  if (selectedFigure != null) {
    if (selectedFigure.get('type') == 'circle') {
      selectedFigure.setRadius(val / 2);
    } else {
      selectedFigure.setWidth(val).setCoords();
      selectedFigure.setHeight(val).setCoords();
      selectedFigure.setScaleX(1);
      selectedFigure.setScaleY(1);
    }
  }
  squareOutline.setWidth(val).setCoords();
  squareOutline.setHeight(val).setCoords();
  triangleOutline.setWidth(val).setCoords();
  triangleOutline.setHeight(val).setCoords();
  circleOutline.setRadius(val / 2);
  canvas.renderAll();
};

var colorControl = $('#color-control');
colorControl.onchange = function() {
  var val = '#' + this.value;
  var selectedFigure = canvas.getActiveObject();
  if (selectedFigure != null) {
    selectedFigure.setColor(val).setCoords();
  }
  canvas.renderAll();
};

function initAddingFigure(evt) {
  sizeControl.oninput();
  angleControl.oninput();
  canvas.bringToFront(OutlineList[evt.target.value]);
  canvas.deactivateAll().renderAll();
  figureList.forEach(function(obj) {
    obj.selectable = false;
  });
}

$('#square').onclick = initAddingFigure;
$('#circle').onclick = initAddingFigure;
$('#triangle').onclick = initAddingFigure;
$('#selection').onclick = function() { figureList.forEach(function(obj) { obj.selectable = true; });};

function updateControls() {
  var selectedFigure = canvas.getActiveObject();
  if (selectedFigure != null) {
    var size = selectedFigure.getWidth();
    var n_size = false;
    if (size > parseInt(sizeControl.max, 10)) n_size = parseInt(sizeControl.max, 10);
    if (size < parseInt(sizeControl.min, 10)) n_size = parseInt(sizeControl.min, 10);
    if (n_size){
      if (selectedFigure.get('type') == 'circle') {
        selectedFigure.setRadius(n_size / 2);
      } else {
        selectedFigure.setWidth(n_size);
        selectedFigure.setHeight(n_size);
      }
      selectedFigure.setScaleX(1);
      selectedFigure.setScaleY(1);
    }
  }
  sizeControl.value = size;
  angleControl.value = canvas.getActiveObject().getAngle();
  colorControl.jscolor.fromString(canvas.getActiveObject().getFill().substr(1));
  $('#size-value').innerText = sizeControl.value;
  $('#angle-value').innerText = angleControl.value;
}

squareOutline = new fabric.Rect({
  left: 100,
  top: 100,
  width: parseInt(sizeControl.value, 10),
  height: parseInt(sizeControl.value, 10),
  angle: parseInt(angleControl.value, 10),
  visible: true,
  fill: "transparent",
  stroke: "grey",
  strokeWidth: 1,
  strokeDashArray: [5, 5]
});

circleOutline = new fabric.Circle({
  left: 0,
  top: 0,
  radius: parseInt(sizeControl.value, 10) / 2,
  height: parseInt(sizeControl.value, 10),
  angle: parseInt(angleControl.value, 10),
  visible: false,
  fill: "transparent",
  stroke: "grey",
  strokeWidth: 1,
  strokeDashArray: [5, 5]
});

triangleOutline = new fabric.Triangle({
  left: 0,
  top: 0,
  width: parseInt(sizeControl.value, 10),
  height: parseInt(sizeControl.value, 10),
  angle: parseInt(angleControl.value, 10),
  visible: false,
  fill: "transparent",
  stroke: "grey",
  strokeWidth: 1,
  strokeDashArray: [5, 5]
});

var OutlineList = {
  square: squareOutline,
  circle: circleOutline,
  triangle: triangleOutline
};

canvas.add(squareOutline);
canvas.add(circleOutline);
canvas.add(triangleOutline);

function moveOutline (params) {
  var type = $('input[name="tool"]:checked').value;
  var pointer = canvas.getPointer(params.e);
  var x = pointer.x;
  var y = pointer.y;
  switch (type) {
    case 'square':
      squareOutline.set({left: x, top: y, visible: true});
      circleOutline.set({visible: false});
      triangleOutline.set({visible: false});
      $('.upper-canvas').style.cursor = 'none';
      break;
    case 'circle':
      circleOutline.set({left: x, top: y, visible: true});
      squareOutline.set({visible: false});
      triangleOutline.set({visible: false});
      $('.upper-canvas').style.cursor = 'none';
      break;
    case 'triangle':
      triangleOutline.set({left: x, top: y, visible: true});
      circleOutline.set({visible: false});
      squareOutline.set({visible: false});
      $('.upper-canvas').style.cursor = 'none';
      break;
    case 'selection':
      triangleOutline.set({visible: false});
      circleOutline.set({visible: false});
      squareOutline.set({visible: false});
      $('.upper-canvas').style.cursor = undefined;
      break;
    default:
      throw 'Что-то пошло не так';

  }
  canvas.renderAll();
}

$('.upper-canvas').onmouseout = function (argument) {
  triangleOutline.set({visible: false});
  circleOutline.set({visible: false});
  squareOutline.set({visible: false});
  canvas.renderAll();
};

canvas.on({
  // 'object:moving': updateControls,
  'object:scaling': updateControls,
  'object:resizing': updateControls,
  'object:rotating': updateControls,
  'mouse:up': createFigure,
  'mouse:move': moveOutline,
  'object:selected': updateControls
});

function changeContolValue (control, newVal) {
  var val = parseInt(control.value, 10);
  val += newVal;
  control.value = val;
  control.oninput();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFigure (type) {
  var size = getRandomInt(parseInt(sizeControl.min, 10), parseInt(sizeControl.max, 10));
  var angle = getRandomInt(0, 360);
  var color = '#' + Math.floor(Math.random()*16777215).toString(16);
  var x = getRandomInt(size, canvas.width - size);
  var y = getRandomInt(size, canvas.height - size);
  var figure;
  switch (type) {
    case 'square':
      figure = new fabric.Rect({
        left: x,
        top: y,
        fill: color,
        width: size,
        height: size,
        angle: angle
      });
      break;
    case 'circle':
      figure = new fabric.Circle({
        left: x,
        top: y,
        fill: color,
        radius: size / 2,
        angle: angle
      });
      break;
    case 'triangle':
      figure = new fabric.Triangle({
        left: x,
        top: y,
        fill: color,
        width: size,
        height: size,
        angle: angle
      });
      break;
    default:
      throw 'Что-то пошло не так';
  }
  var options = {
    bl: true, br: true, mb: false,
    ml: false, mr: false, mt: false,
    tl: true, tr: true, mtr: true
  };
  figure.setControlsVisibility(options);
  figure.centeredScaling = true;
  figureList.push(figure);
  canvas.add(figure);
  canvas.bringToFront(OutlineList[type]);
}

function deleteAll() {
  if (figureList.length == 0) return;
  figureList.forEach(function(obj) {
    obj.remove();
  });
  figureList = [];
}

document.onkeydown = function(evt) {
  var selectedFigure = canvas.getActiveObject();
  switch (evt.keyCode) {
    case 38:
      if (evt.shiftKey) {
        changeContolValue(sizeControl, 5);
      } else {
        selectedFigure.top--;
        canvas.renderAll();
      }
      return false;
      break;
    case 40:
      if (evt.shiftKey) {
        changeContolValue(sizeControl, -5);
      } else {
        selectedFigure.top++;
        canvas.renderAll();
      }
      return false;
      break;
    case 37:
      if (evt.shiftKey) {
        changeContolValue(angleControl, -5);
      } else {
        selectedFigure.left--;
        canvas.renderAll();
      }
      return false;
      break;
    case 39:
      if (evt.shiftKey) {
        changeContolValue(angleControl, 5);
      } else {
        selectedFigure.left++;
        canvas.renderAll();
      }
      return false;
      break;
    case 49:
      randomFigure('square');
      break;
    case 50:
      randomFigure('circle');
      break;
    case 51:
      randomFigure('triangle');
      break;
    case 32:
      if (figureList.length == 0) return;
      var idx = figureList.indexOf(selectedFigure) + 1;
      if (idx >= figureList.length) idx = 0;
      canvas.setActiveObject(figureList[idx]);
      $('#selection').click();
      return false;
      break;
    case 46:
      if (figureList.length == 0 || selectedFigure == null) return;
      var idx = figureList.indexOf(selectedFigure);
      figureList.splice(idx, 1)
      selectedFigure.remove();
      return false;
      break;
    default:
      ;

  }
}
