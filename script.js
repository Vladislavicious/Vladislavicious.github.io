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
    if (CanvasRef._instance)
    {
      return CanvasRef._instance;
    }

    CanvasRef._instance = this;
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

  #Redraw(xPos = null, yPos = null, lineWidth = null, radius = null, lineColor = null, fillColor = null)
  {
    if (xPos != null){
      this.#xPos = xPos;
    }
    if (yPos != null){
      this.#yPos = yPos;
    }
    if (lineWidth != null){
      this.#lineWidth = lineWidth;
    }
    if (radius != null){
      this.#radius = radius;
    }
    if (lineColor != null){
      this.#lineColor = lineColor;
    }
    if (fillColor != null){
      this.#fillColor = fillColor;
    }

    this.Clear();
    this.Draw();
  }

  radius()
  {
    return this.#radius;
  }

  lineColor()
  {
    return this.#lineColor;
  }

  fillColor()
  {
    return this.#fillColor;
  }

  lineWidth()
  {
    return this.#lineWidth;
  }

  xPos()
  {
    return this.#xPos;
  }

  yPos()
  {
    return this.#yPos;
  }
}

class Metronom
{
  #tempo;
  #beat;
  #ticksPerBeat;
  #circles;
  #drawn = false;
  constructor(tempo, beat, ticksPerBeat)
  {
    this.#tempo = tempo;
    this.#beat = beat;
    this.#ticksPerBeat = ticksPerBeat;

    this.#circles = new Array();

    this.#makeCircles();
  }

  #addCircle(circle)
  {
    this.#circles.push(circle)
  }

  #clearCircles()
  {
    this.#circles.length = 0;
    this.#drawn = false;
  }

  drawAllCircles()
  {
    if (this.#drawn == true){
      return;
    }
    for(let i = 0; i < this.#circles.length; i++)
    {
      this.#circles[i].Draw();
    }
    this.#drawn = true;
  }

  redrawAllCircles()
  {
    if (this.#drawn == false)
      return;
    this.#clearCircles()

    this.#makeCircles();

    this.drawAllCircles();
  }

  #makeCircles()
  {
    let mainCircle = this.#createMainCircle();

    this.#addCircle(mainCircle);

    this.#createBeats(mainCircle);

  }

  #createBeats(mainCircle)
  {
    let lineColor = mainCircle.lineColor();
    let fillColor = mainCircle.fillColor();
    let lineWidth = mainCircle.lineWidth();
    let mainRadius = mainCircle.radius();

    let divider = 10;
    if (this.#beat >= 30)
      divider = divider + Math.floor((this.#beat - 30) / 5) * 2.5;

    let radius = mainRadius / divider;
    let xCenter = mainCircle.xPos();
    let yCenter = mainCircle.yPos();

    let multiplier = 360 / this.#beat;

    for (let i = 0; i < this.#beat; i++)
    {
      let initial_arc = ((i * multiplier) - 90) * (Math.PI/180); // Вычитаем 90, чтобы начало было в Pi/2, переводим в радианы
      let xPos = xCenter + mainRadius * Math.cos(initial_arc);
      let yPos = yCenter + mainRadius * Math.sin(initial_arc);

      let temp = new Circle(xPos, yPos, lineWidth, radius, lineColor, fillColor);
      this.#addCircle(temp)
    }
  }

  #createMainCircle()
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

    let radius = (smallSide - lineWidth) * 0.9;
    let lineColor = "MediumSlateBlue";
    let fillColor = "DarkBlue";

    return new Circle(xCenter, yCenter, lineWidth, radius, lineColor, fillColor);
  }
}

const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');

canvas_reference = new CanvasRef(canvas);

button = document.getElementById("myButton");

const metronom = new Metronom(90, 5, 1);
metronom.drawAllCircles();

button.addEventListener("click", function(event) {metronom.drawAllCircles();});

window.addEventListener("resize", function(event) {metronom.redrawAllCircles();});
