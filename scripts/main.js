const canvas = document.getElementById("myCanvas");
const context = canvas.getContext('2d');

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

class Theme
{
  fillColor = "DarkBlue";
  lineColor = "MediumSlateBlue";
  baseColor = "MediumSlateBlue";
  baseHighlightedColor = "LightSeaGreen";
  alternateColor = "DarkTurquoise";
  alternateHighlightedColor = "DeepSkyBlue";

  constructor()
  {
    if (Theme._instance)
    {
      return Theme._instance;
    }

    Theme._instance = this;
  }
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

  getMousePos(event) {
    var rect = this.#canvas_ref.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) / (rect.right - rect.left) * this.#canvas_ref.width,
        y: (event.clientY - rect.top) / (rect.bottom - rect.top) * this.#canvas_ref.height
    };
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

  Redraw(fillColor, xPos = null, yPos = null, lineWidth = null, radius = null, lineColor = null)
  {
    let changed = false;
    if (xPos != null){
      this.#xPos = xPos;
      changed = true;
    }
    if (yPos != null){
      this.#yPos = yPos;
      changed = true;
    }
    if (lineWidth != null){
      this.#lineWidth = lineWidth;
      changed = true;
    }
    if (radius != null){
      this.#radius = radius;
      changed = true;
    }
    if (lineColor != null){
      this.#lineColor = lineColor;
      changed = true;
    }
    if (fillColor != null){
      this.#fillColor = fillColor;
      changed = true;
    }

    if (changed == true)
    {
      this.Clear();
      this.Draw();
    }
  }

  intersects(xPos, yPos)
  {
    if ((this.#xPos + this.#radius >= xPos) && (this.#xPos - this.#radius <= xPos))
    {
      if ((this.#yPos + this.#radius >= yPos) && (this.#yPos - this.#radius <= yPos))
        return true;
    }
    return false;
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

class Beat extends Circle
{
  #baseColor;
  #highlightedColor;
  #alternated = false;
  #highlighted = false;

  constructor(xPos, yPos, lineWidth, radius)
  {
    const theme = new Theme();
    let lineColor = theme.baseColor;
    let fillColor = theme.baseColor;
    super(xPos, yPos, lineWidth, radius, lineColor, fillColor);
    this.#baseColor = theme.baseColor;
    this.#highlightedColor = theme.baseHighlightedColor;
  }

  changeColorPalette()
  {
    const theme = new Theme();
    let newBaseColor;
    let newHighlightedColor;
    if (this.#alternated == true)
    {
      newBaseColor = theme.baseColor;
      newHighlightedColor = theme.baseHighlightedColor;
      this.#alternated = false;
    }
    else
    {
      newBaseColor = theme.alternateColor;
      newHighlightedColor = theme.alternateHighlightedColor;
      this.#alternated = true;
    }

    this.Redraw(newBaseColor, undefined, undefined, undefined, undefined, newBaseColor);
    this.#baseColor = newBaseColor;
    this.#highlightedColor = newHighlightedColor;

  }

  Highlight()
  {
    if (this.#highlighted == true)
      return;

    this.Redraw(this.#highlightedColor, undefined, undefined, undefined, undefined, this.#highlightedColor);
    this.#highlighted = true;
  }

  makeNormal()
  {
    if (this.#highlighted == false)
      return;

    this.Redraw(this.#baseColor, undefined, undefined, undefined, undefined, this.#baseColor);
    this.#highlighted = false;
  }
}

class loopedArray
{
  #array = new Array();
  #index = 0;
  #length = 0;

  addElement(element)
  {
    this.#array.push(element);
    this.#length = this.#array.length;
  }

  clearArray()
  {
    this.#array.length = 0;
    this.#index = 0;
    this.length = 0;
  }

  next()
  {
    this.#index += 1;
    if (this.#index >= this.#length)
    {
      this.#index = 0;
    }
    return this.#array[this.#index];
  }

  current()
  {
    return this.#array[this.#index];
  }

  getLength()
  {
    return this.#length;
  }

  onIndex(index)
  {
    return this.#array[index];
  }
}

class Metronom
{
  #tempo;
  #beat;
  #ticksPerBeat;
  #mainCircle;
  #circles;
  #drawn = false;
  #active = false;
  #timer;
  constructor(tempo, beat, ticksPerBeat)
  {
    this.#tempo = tempo;
    this.#beat = beat;
    this.#ticksPerBeat = ticksPerBeat;

    this.#circles = new loopedArray();

    this.#makeCircles();
  }

  #addCircle(circle)
  {
    this.#circles.addElement(circle);
  }

  #clearCircles()
  {
    this.#mainCircle = null;
    this.#circles.clearArray();
    this.#drawn = false;
  }

  drawAllCircles()
  {
    if (this.#drawn == true){
      return;
    }
    this.#mainCircle.Draw();
    for(let i = 0; i < this.#circles.getLength(); i++)
    {
      this.#circles.onIndex(i).Draw();
    }
    this.#drawn = true;
  }

  redrawAllCircles()
  {
    if (this.#drawn == false)
      return;
    this.#clearCircles();

    this.#makeCircles();

    this.drawAllCircles();
  }

  highLightNext()
  {
    this.#circles.current().makeNormal();
    this.#circles.next().Highlight();
  }

  checkForIntersections(xPos, yPos)
  {
    for(let i = 0; i < this.#circles.getLength(); i++)
    {
      if ( this.#circles.onIndex(i).intersects(xPos, yPos) == true )
      {
        this.#circles.onIndex(i).changeColorPalette();
        break;
      }
    }
  }

  start()
  {
    if (this.#active == false)
    {
      let time = 60000 / this.#tempo;
      const ref = this;
      this.#timer = setInterval(() => ref.highLightNext(), time);
      this.#active = true;
    }
    else
    {
      clearInterval(this.#timer);
      this.#active = false;
    }
  }

  #makeCircles()
  {
    this.#mainCircle = this.#createMainCircle();
    this.#mainCircle.Draw();
    this.#createBeats();
  }

  #createBeats()
  {
    let lineWidth = this.#mainCircle.lineWidth();
    let mainRadius = this.#mainCircle.radius();

    let divider = 10;
    if (this.#beat >= 30)
      divider = divider + Math.floor((this.#beat - 30) / 5) * 2.5;

    let radius = mainRadius / divider;
    let xCenter = this.#mainCircle.xPos();
    let yCenter = this.#mainCircle.yPos();

    let multiplier = 360 / this.#beat;

    for (let i = 0; i < this.#beat; i++)
    {
      let initial_arc = ((i * multiplier) - 90) * (Math.PI/180); // Вычитаем 90, чтобы начало было в Pi/2, переводим в радианы
      let xPos = xCenter + mainRadius * Math.cos(initial_arc);
      let yPos = yCenter + mainRadius * Math.sin(initial_arc);

      let temp = new Beat(xPos, yPos, lineWidth, radius);
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
    let lineColor = theme.lineColor;
    let fillColor = theme.fillColor;

    return new Circle(xCenter, yCenter, lineWidth, radius, lineColor, fillColor);
  }
}

function logPosition(object)
{
  console.log("x:" + object["x"]);
  console.log("y:" + object["y"]);
}


canvas_reference = new CanvasRef(canvas);
theme = new Theme();


const metronom = new Metronom(300, 55, 1);
metronom.drawAllCircles();

canvas.addEventListener("mousedown", function(event)
{
  coordinates = canvas_reference.getMousePos(event);
  metronom.checkForIntersections(coordinates["x"], coordinates["y"]);
});


button = document.getElementById("myButton");
button.addEventListener("click", function(event) {metronom.drawAllCircles();});
button.addEventListener("click", function(event) {metronom.highLightNext();});

startButton = document.getElementById("startButton");
startButton.addEventListener("click", function(event) {metronom.start();});

window.addEventListener("resize", function(event) {metronom.redrawAllCircles();});
