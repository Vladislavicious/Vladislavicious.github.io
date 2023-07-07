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

class SoundStruct
{
  frequency;
  type;

  constructor(frequency, type)
  {
    this.frequency = frequency;
    this.type = type;
  }

  static getStandartSound()
  {
    return new SoundStruct(500, "sine");
  }

  static getAccentedSound()
  {
    return new SoundStruct(800, "sine");
  }

  static getAlternateSound()
  {
    return new SoundStruct(500, "square");
  }

  static getAlternateAccentedSound()
  {
    return new SoundStruct(800, "square");
  }

  static getTickSound()
  {
    return new SoundStruct(500, "sawtooth");
  }
}

class Theme
{
  fillColor = "DarkBlue";
  lineColor = "MediumSlateBlue";
  baseColor = "MediumSlateBlue";
  baseHighlightedColor = "LightSeaGreen";
  alternateColor = "Moccasin";
  alternateHighlightedColor = "Gold";

  standartSound = SoundStruct.getStandartSound();
  accentedSound = SoundStruct.getAccentedSound();
  alternateSound = SoundStruct.getAlternateSound();
  alternatedAccentedSound = SoundStruct.getAlternateAccentedSound();
  tickSound = SoundStruct.getTickSound();

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

class AudioPlayer
{
  #audioContext;
  #oscillator;
  #gainNode;
  constructor()
  {
    if (AudioPlayer._instance)
    {
      return AudioPlayer._instance;
    }

    AudioPlayer._instance = this;
    this.#audioContext = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
    this.#oscillator = this.#audioContext.createOscillator();
    this.#gainNode = this.#audioContext.createGain();

    this.#oscillator.connect(this.#gainNode);
    this.#gainNode.connect(this.#audioContext.destination);
  }

  //All arguments are optional:
  //duration of the tone in milliseconds. Default is 500
  //frequency of the tone in hertz. default is 440
  //volume of the tone. Default is 1, off is 0.
  //type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
  //callback to use on end of tone
  beep(duration, frequency, volume, type, callback)
  {
    this.#oscillator = this.#audioContext.createOscillator();
    this.#oscillator.connect(this.#gainNode);

    if (volume) {this.#gainNode.gain.value = volume;}
    if (frequency) {this.#oscillator.frequency.value = frequency;}
    if (type) {this.#oscillator.type = type;}
    if (callback) {this.#oscillator.onended = callback;}

    this.#oscillator.start(this.#audioContext.currentTime);
    this.#oscillator.stop(this.#audioContext.currentTime + ((duration || 75) / 1000));
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

class BeatState
{
  baseColor;
  highlightedColor;
  baseSound;
  highlighted = false;

  changeBeatState() {}
  highlight()
  {
    if ( this.highlighted == true )
      return false;

      this.highlighted = true;
      return true;
  }
  makeNormal()
  {
    if ( this.highlighted == false )
      return false;

      this.highlighted = false;
      return true;
  }
}

class BaseBeatState extends BeatState
{
  constructor()
  {
    super();
    let theme = new Theme();
    this.baseColor = theme.baseColor;
    this.highlightedColor = theme.baseHighlightedColor;
    this.baseSound = theme.standartSound;
  }
  changeBeatState()
  {
    return new AlternateBeatState();
  }
}

class AlternateBeatState extends BeatState
{
  constructor()
  {
    super();
    let theme = new Theme();
    this.baseColor = theme.alternateColor;
    this.highlightedColor = theme.alternateHighlightedColor;
    this.baseSound = theme.alternateSound;
  }
  changeBeatState()
  {
    return new BaseBeatState();
  }
}

class Beat extends Circle
{
  #beatState;


  constructor(xPos, yPos, lineWidth, radius, beatState)
  {
    let lineColor = beatState.baseColor;
    let fillColor = beatState.baseColor;
    super(xPos, yPos, lineWidth, radius, lineColor, fillColor);
    this.#beatState = beatState;
  }

  getBeatState()
  {
    return this.#beatState;
  }

  changeColorPalette()
  {
    this.#beatState = this.#beatState.changeBeatState();
    let newBaseColor = this.#beatState.baseColor;

    this.Redraw(newBaseColor, newBaseColor);
  }

  Redraw(newFillColor, newLineColor)
  {
    super.Redraw(newFillColor, undefined, undefined, undefined, undefined, newLineColor);
  }

  makeSound() { return false; }

  highlight()  // Возвращает True, если эта доля издаёт звук
  {
    if (this.#beatState.highlight() == false)
      return false;

    this.Redraw(this.#beatState.highlightedColor, this.#beatState.highlightedColor);
    return this.makeSound();
  }

  makeNormal()
  {
    if (this.#beatState.makeNormal() == false)
      return;

    this.Redraw(this.#beatState.baseColor, this.#beatState.baseColor);
  }
}

class SoundedBeat extends Beat
{
  makeSound()
  {
    return true;
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
  #beats;
  #drawn = false;
  #active = false;
  #timer;
  constructor(tempo, beat, ticksPerBeat)
  {
    this.#tempo = tempo;
    this.#beat = beat;
    this.#ticksPerBeat = ticksPerBeat;

    this.#beats = new loopedArray();

    this.#createCircles();
  }

  #addBeat(beat)
  {
    this.#beats.addElement(beat);
  }

  #clear()
  {
    this.#mainCircle = null;
    this.#beats.clearArray();
    this.#drawn = false;
  }

  drawAll()
  {
    if (this.#drawn == true){
      return;
    }
    this.#mainCircle.Draw();
    for(let i = 0; i < this.#beats.getLength(); i++)
    {
      this.#beats.onIndex(i).Draw();
    }
    this.#drawn = true;
  }

  redrawAllCircles()
  {
    if (this.#drawn == false)
      return;
    this.#clear();

    this.#createCircles();

    this.drawAll();
  }

  highLightNext()
  {
    this.#beats.current().makeNormal();

    const beat = this.#beats.next();
    if (beat.highlight())
    {
      let sound = beat.getBeatState().baseSound;
      let frequency = sound["frequency"];
      let type = sound["type"];
      let player = new AudioPlayer();

      let duration = 100;
      player.beep(duration, frequency, 2, type);
    }
  }

  checkForIntersections(xPos, yPos)
  {
    for(let i = 0; i < this.#beats.getLength(); i++)
    {
      if ( this.#beats.onIndex(i).intersects(xPos, yPos) == true )
      {
        this.#beats.onIndex(i).changeColorPalette();
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

  #createCircles()
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

      let temp = new SoundedBeat(xPos, yPos, lineWidth, radius, new BaseBeatState());
      this.#addBeat(temp)
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


const metronom = new Metronom(180, 8, 1);
metronom.drawAll();

canvas.addEventListener("mousedown", function(event)
{
  coordinates = canvas_reference.getMousePos(event);
  metronom.checkForIntersections(coordinates["x"], coordinates["y"]);
});


button = document.getElementById("myButton");
button.addEventListener("click", function(event) {metronom.drawAll();});
button.addEventListener("click", function(event) {metronom.highLightNext();});

startButton = document.getElementById("startButton");
startButton.addEventListener("click", function(event) {metronom.start();});

window.addEventListener("resize", function(event) {metronom.redrawAllCircles();});