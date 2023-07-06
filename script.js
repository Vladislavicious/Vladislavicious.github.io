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

class CanvasRef
{
  #canvas_ref;

  constructor(canvas)
  {
    this.#canvas_ref = canvas;
  }

  get_size()
  {
    let canvasWidth = this.#canvas_ref.clientWidth;
    let canvasHeight = this.#canvas_ref.clientHeight;

    if (this.#canvas_ref.width  != canvasWidth ||
      this.#canvas_ref.height != canvasHeight) {
        // подгоняем размер буфера отрисовки под размер HTML-элемента
        this.#canvas_ref.width  = canvasWidth;
        this.#canvas_ref.height = canvasHeight;
      }

    return [canvasWidth, canvasHeight];
  }
}

class Circle
{
  #xPos;
  #yPos;
  #lineWidth;
  #radius;
  #lineColor;
  #fillColor;
  #drawn;

  constructor(xPos, yPos, lineWidth, radius, lineColor, fillColor)
  {
    this.#xPos = xPos;
    this.#yPos = yPos;
    this.#lineWidth = lineWidth;
    this.#radius = radius;
    this.#lineColor = lineColor;
    this.#fillColor = fillColor;

    this.#drawn = false;
  }

  isDrawn()
  {
    return this.#drawn;
  }

  Draw()
  {
    if (!this.isDrawn())
    {
      drawArc(this.#xPos, this.#yPos, this.#radius, 0, 360, this.#lineWidth, false, this.#lineColor, this.#fillColor);
      this.#drawn = true;
    }
  }

  Clear()
  {
    this.#drawn = false;
  }

}

class Metronom
{
  #tempo;
  #beat;
  #ticksPerBeat;
  #circles;
  constructor(tempo, beat, ticksPerBeat)
  {
    this.#tempo = tempo;
    this.#beat = beat;
    this.#ticksPerBeat = ticksPerBeat;

    this.#circles = new Array();

    let mainCircle = this.#createCenteredCircle();

    this.#addCircle(mainCircle);
  }

  #addCircle(circle)
  {
    this.#circles.push(circle)
  }

  drawAllCircles()
  {
    for(let i = 0; i < this.#circles.length; i++)
    {
      this.#circles[i].Draw();
    }
  }

  #createCenteredCircle()
  {
    const [width, height] = canvas_reference.get_size();
    let xCenter = width / 2;
    let yCenter = height / 2;
    let lineWidth = 2;

    let smallSide = yCenter;
    if (xCenter < smallSide)
    {
      smallSide = xCenter;
    }

    let radius = smallSide - lineWidth;
    let lineColor = "MediumSlateBlue";
    let fillColor = "DarkBlue";

    return new Circle(xCenter, yCenter, lineWidth, radius, lineColor, fillColor);
  }
}

const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');

canvas_reference = new CanvasRef(canvas);

button = document.getElementById("myButton");

const metronom = new Metronom(120, 4, 1);

function drawCircles()
{
  metronom.drawAllCircles();
}

button.addEventListener("click", drawCircles);

//window.addEventListener("resize", drawCircles);
