"use strict";
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
  mutedColor = "DimGray";

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
  #context_ref;

  constructor(canvas)
  {
    if (CanvasRef._instance)
    {
      return CanvasRef._instance;
    }

    CanvasRef._instance = this;
    this.#canvas_ref = canvas;
    this.#context_ref = canvas.getContext('2d');
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

  clear()
  {
    this.#context_ref.clearRect(0, 0, this.#canvas_ref.width, this.#canvas_ref.height);
  }

  get context() { return this.#context_ref; }
  get canvas() { return this.#canvas_ref; }
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
  beep(duration = 10, frequency = 500, volume = 2, type = "sawtooth")
  {
    this.#oscillator = this.#audioContext.createOscillator();
    this.#oscillator.connect(this.#gainNode);

    this.#gainNode.gain.value = volume;
    this.#oscillator.frequency.value = frequency;
    this.#oscillator.type = type;

    this.#oscillator.start(this.#audioContext.currentTime);
    this.#oscillator.stop(this.#audioContext.currentTime + (duration / 1000));
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

  get drawn()
  {
    return this.#drawn;
  }

  Draw()
  {
    if (!this.drawn)
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

  get radius() { return this.#radius; }

  get lineColor() { return this.#lineColor; }

  get fillColor() { return this.#fillColor; }

  get lineWidth() { return this.#lineWidth; }

  get xPos() { return this.#xPos; }

  get yPos() { return this.#yPos; }
}

class BeatState
{
  baseColor;
  highlightedColor;
  baseSound;
  highlighted = false;
  makesSound = false;

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
    this.makesSound = true;
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
    this.makesSound = true;
  }
  changeBeatState()
  {
    return new MutedBeatState();
  }
}

class MutedBeatState extends BeatState
{
  constructor()
  {
    super();
    let theme = new Theme();
    this.baseColor = theme.mutedColor;
    this.highlightedColor = theme.mutedColor;
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
    this.beatState = beatState;
  }

  get beatState() { return this.#beatState; }
  set beatState(state)
  {
    if (state instanceof BeatState)
      this.#beatState = state;
  }

  changeColorPalette()
  {
    this.beatState = this.beatState.changeBeatState();
    let newBaseColor = this.beatState.baseColor;

    this.Redraw(newBaseColor, newBaseColor);
  }

  Redraw(newFillColor, newLineColor)
  {
    super.Redraw(newFillColor, undefined, undefined, undefined, undefined, newLineColor);
  }

  doesMakeSound() { return false; }

  highlight()  // Возвращает True, если эта доля издаёт звук
  {
    if (this.beatState.highlight() == false)
      return false;

    this.Redraw(this.beatState.highlightedColor, this.beatState.highlightedColor);
    return this.doesMakeSound();
  }

  makeNormal()
  {
    if (this.beatState.makeNormal() == false)
      return;

    this.Redraw(this.beatState.baseColor, this.beatState.baseColor);
  }
}

class SoundedBeat extends Beat
{
  doesMakeSound()
  {
    return this.beatState.makesSound;
  }
}

class loopedArray
{
  #array = new Array();
  #ind = 0;
  #length = 0;

  get length()
  {
    return this.#length;
  }
  get #index() { return this.#ind; }
  set #index(value)
  {
    if (value < 0)
    {
      console.log("отрицательный индекс");
      return;
    }
    let newIndex = value;
    if (value >= this.length)
      newIndex = 0;
    this.#ind = newIndex;
  }

  addElement(element)
  {
    this.#array.push(element);
    this.#length = this.#array.length;
  }

  clearArray()
  {
    this.#array.length = 0;
    this.#ind = 0;
    this.#length = 0;
  }

  getArray()
  {
    return this.#array;
  }

  next()
  {
    this.#index += 1;
    return this.#array[this.#index];
  }

  current()
  {
    return this.#array[this.#index];
  }


  onIndex(index)
  {
    return this.#array[index];
  }

  startFromIndex(index)
  {
    this.#index = index;
  }

  reset()
  {
    this.#ind = 0;
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

  clear()
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
    this.drawCurves();
    for(let i = 0; i < this.#beats.length; i++)
    {
      this.#beats.onIndex(i).Draw();
    }
    this.#drawn = true;
  }

  drawCurves()
  {
    if (this.#beat > 12)
      return;

    let beatsArray = this.#beats.getArray();
    this.#drawCurvesBetweenCircles(beatsArray);
  }

  #drawCurvesBetweenCircles(beatsArray)
  {
    let controlX = this.#mainCircle.xPos;
    let controlY = this.#mainCircle.yPos;

    let startX = controlX;
    let startY = controlY - this.#mainCircle.radius;

    const canvas_ref = new CanvasRef();
    const context_ref = canvas_ref.context;
    const theme = new Theme();

    context_ref.beginPath();
    context_ref.moveTo(startX, startY);
    context_ref.lineWidth = 2;
    context_ref.strokeStyle = theme.lineColor;
    context_ref.fillStyle = theme.fillColor;

    for(let i = 1; i < beatsArray.length; i++)
    {
      let endX = beatsArray[i].xPos;
      let endY = beatsArray[i].yPos;
      context_ref.quadraticCurveTo(controlX, controlY, endX, endY);
    }
    if (beatsArray.length >= 2)
    {
      context_ref.quadraticCurveTo(controlX, controlY, startX, startY);
      context_ref.closePath();
      context_ref.fill();
      context_ref.stroke();
    }
  }

  redrawAllCircles()
  {
    if (this.#drawn == false)
      return;
    this.clear();

    this.#createCircles();

    this.drawAll();
  }

  highlightNext()
  {
    this.#beats.current().makeNormal();

    const beat = this.#beats.next();
    this.#clickBeat(beat);
  }

  #clickBeat(beat)
  {
    if (beat.highlight())
    {
      let sound = beat.beatState.baseSound;
      let frequency = sound["frequency"];
      let type = sound["type"];
      let player = new AudioPlayer();

      let duration = 10;
      player.beep(duration, frequency, 2, type);

      let clickTime = 60000 / this.#tempo;
      for (let i = 1; i < this.ticks; i++)  //  Полудоли
      {
        setTimeout(function() { player.beep(); }, clickTime / this.ticks * i);
      }
    }
  }

  checkForIntersections(xPos, yPos)
  {
    for(let i = 0; i < this.#beats.length; i++)
    {
      if ( this.#beats.onIndex(i).intersects(xPos, yPos) == true )
      {
        this.#beats.onIndex(i).changeColorPalette();
        break;
      }
    }
  }

  selfDestroy()
  {
    if (this.#active == true)
      this.start();

    this.clear();
  }

  #reset()
  {
    this.#beats.current().makeNormal();
    this.#beats.reset();
  }

  start(temp)
  {
    if (this.#active == false)
    {
      this.#beats.startFromIndex(this.#beats.length - 1);
      this.#active = true;
    }
    this.tempo = temp;
  }

  stop()
  {
    if (this.#active == true)
    {
      this.#reset();
      this.tempo = 0;
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
    let lineWidth = this.#mainCircle.lineWidth;
    let mainRadius = this.#mainCircle.radius;

    let divider = 18;
    if (this.#beat >= 30)
      divider = divider + Math.floor((this.#beat - 30) / 5) * 2.5;

    let radius = mainRadius / divider;
    let xCenter = this.#mainCircle.xPos;
    let yCenter = this.#mainCircle.yPos;

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

    let radius = (smallSide - lineWidth) * 0.95;
    let lineColor = theme.lineColor;
    let fillColor = theme.fillColor;

    return new Circle(xCenter, yCenter, lineWidth, radius, lineColor, fillColor);
  }
  get tempo() { return this.#tempo; }
  set tempo(value)
  {
    if (value < 0)
    {
      console.log("отрицательный темп");
      return;
    }
    if ( value == 0 )
    {
      clearInterval(this.timer);
      this.#tempo = 0;
      return;
    }

    this.#tempo = value;
    let time = 60000 / this.#tempo;
    const ref = this;
    this.timer = setInterval(() => ref.highlightNext(), time);

  }
  get beat() { return this.#beat; }
  get ticks() { return this.#ticksPerBeat; }
  set ticks(value)
  {
    this.#ticksPerBeat = value;
  }
  get active() { return this.#active; }
  get timer() { return this.#timer; }
  set timer(value)
  {
    if (this.#timer)
      clearInterval(this.#timer);
    this.#timer = value;
  }

  static createMetronom(tempo, beats, ticks)
  {
    let newMetronom = new Metronom(tempo, beats, ticks);
    newMetronom.drawAll();
    return newMetronom;
  }
}


function BeatsChanged(metronom, beats)
{
  let tempo = metronom.tempo;
  let ticks = metronom.ticks;
  metronom.stop();
  metronom.selfDestroy();
  canvas_reference.clear();
  let newMetronom = Metronom.createMetronom(tempo, beats, ticks);
  newMetronom.start(newMetronom.tempo);
  return newMetronom;
}
function PlayButtonPress(metronom, tempo, beats, ticks)
{
  let newMetronom = metronom;
  if (newMetronom.beat != beats)
  {
    newMetronom = BeatsChanged(metronom, beats);
    return newMetronom;
  }
  else if ( newMetronom.active == true )
  {
    newMetronom.stop();
    return newMetronom;
  }
  newMetronom.ticks = ticks;
  newMetronom.start(tempo);
  return newMetronom;
}


const tempoInput = document.getElementById("tempoInput");
const beatsInput = document.getElementById("beatsInput");
const ticksInput = document.getElementById("ticksInput");


let canvas_reference = new CanvasRef(canvas);
let theme = new Theme();

let g_metronom = null;
g_metronom = Metronom.createMetronom(tempoInput.value, beatsInput.value, ticksInput.value);

function getMetronomRef() { return g_metronom; }
function setMetronomRef(metronom) { g_metronom = metronom; }


const startButton = document.getElementById("startButton");
startButton.addEventListener("click", function()
{
  let newMetronom = PlayButtonPress(getMetronomRef(), tempoInput.value, beatsInput.value, ticksInput.value);
  setMetronomRef(newMetronom);
});

canvas_reference.canvas.addEventListener("mousedown", function(event)
{
  let coordinates = canvas_reference.getMousePos(event);
  g_metronom.checkForIntersections(coordinates["x"], coordinates["y"]);
});

window.addEventListener("resize", function(event) {g_metronom.redrawAllCircles();});

tempoInput.onchange = function()
{
  if (g_metronom.active)
  {
    if ( g_metronom.tempo != tempoInput.value )
      g_metronom.tempo = tempoInput.value;
  }
}

beatsInput.onchange = function()
{
  if (g_metronom.active)
  {
    if ( g_metronom.beats != beatsInput.value )
      g_metronom = BeatsChanged(g_metronom, beatsInput.value);
  }
}

ticksInput.onchange = function()
{
  if (g_metronom.active)
  {
    if ( g_metronom.ticks != ticksInput.value )
      g_metronom.ticks = ticksInput.value;
  }
}
