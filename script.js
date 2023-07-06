const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');

let g_canvasWidth = undefined;
let g_canvasHeight = undefined;

let count = 0;

changeCanvasSize();

function changeCanvasSize()
{
  g_canvasWidth = canvas.clientWidth;
  g_canvasHeight = canvas.clientHeight;
  console.log(g_canvasWidth);
  console.log(g_canvasHeight);
  console.log(count)
  count = count + 1;

  if (canvas.width  != g_canvasWidth ||
    canvas.height != g_canvasHeight) {
  // подгоняем размер буфера отрисовки под размер HTML-элемента
  canvas.width  = g_canvasWidth;
  canvas.height = g_canvasHeight;
  }
}

function drawArc(xPos, yPos, radius, startAngle, endAngle, lineWidth, anticlockwise, lineColor, fillColor)
{
  startAngle = startAngle * (Math.PI/180);
  endAngle = endAngle * (Math.PI/180);
  radius = radius;
  context.strokeStyle = lineColor;
  context.fillStyle = fillColor;
  context.lineWidth = lineWidth;
  context.beginPath();
  context.arc(xPos, yPos, radius, startAngle, endAngle, anticlockwise);
  context.fill();
  context.stroke();
}

function drawCenterCircle()
{
  let startAngle = 0;
  let endAngle = 360;
  let xPos = g_canvasWidth / 2;
  let yPos = g_canvasHeight / 2;
  let lineWidth = 2;

  let smallSide = yPos;
  if (xPos < smallSide)
  {
    smallSide = xPos;
  }

  let radius = smallSide - lineWidth;
  let lineColor = "black";
  let fillColor = "blue";

  drawArc(xPos, yPos, radius, startAngle, endAngle, lineWidth, false, lineColor, fillColor);

}

button = document.getElementById("myButton");

button.addEventListener("click", changeCanvasSize);
button.addEventListener("click", drawCenterCircle);
