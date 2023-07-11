"use strict";

class Drawer
{
  static #canvas_ref;
  static #context;

  static initialize()
  {
    this.#canvas_ref = new CanvasRef();
    this.#context = this.#canvas_ref.context;
  }

  static drawArc(xPos, yPos, radius, startAngle, endAngle, lineWidth, anticlockwise, lineColor, fillColor)
  {
    startAngle = startAngle * (Math.PI/180);
    endAngle = endAngle * (Math.PI/180);
    radius = radius;

    this.#context.strokeStyle = lineColor;
    this.#context.fillStyle = fillColor;
    this.#context.lineWidth = lineWidth;
    this.#context.beginPath();
    this.#context.arc(xPos, yPos, radius, startAngle, endAngle, anticlockwise);
    this.#context.fill();
    this.#context.stroke();
  }

  static drawCurvesBetweenCircles(controlX, controlY, startX, startY, beatsArray)
  {
    const theme = new Theme();

    this.#context.beginPath();
    this.#context.moveTo(startX, startY);
    this.#context.lineWidth = 2;
    this.#context.strokeStyle = theme.lineColor;
    this.#context.fillStyle = theme.fillColor;

    for(let i = 1; i < beatsArray.length; i++)
    {
      let endX = beatsArray[i].xPos;
      let endY = beatsArray[i].yPos;
      this.#context.quadraticCurveTo(controlX, controlY, endX, endY);
    }
    if (beatsArray.length >= 2)
    {
      this.#context.quadraticCurveTo(controlX, controlY, startX, startY);
      this.#context.closePath();
      this.#context.fill();
      this.#context.stroke();
    }
  }
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
  fillColor;
  lineColor;
  baseColor;
  baseHighlightedColor;
  alternateColor;
  alternateHighlightedColor;
  mutedColor;

  standartSound;
  accentedSound;
  alternateSound;
  alternatedAccentedSound;
  tickSound;

  constructor()
  {
    if (Theme._instance)
    {
      return Theme._instance;
    }

    Theme._instance = this;
    this.fillColor = "DarkBlue";
    this.lineColor = "MediumSlateBlue";
    this.baseColor = "MediumSlateBlue";
    this.baseHighlightedColor = "LightSeaGreen";
    this.alternateColor = "Moccasin";
    this.alternateHighlightedColor = "Gold";
    this.mutedColor = "DimGray";

    this.standartSound = SoundStruct.getStandartSound();
    this.accentedSound = SoundStruct.getAccentedSound();
    this.alternateSound = SoundStruct.getAlternateSound();
    this.alternatedAccentedSound = SoundStruct.getAlternateAccentedSound();
    this.tickSound = SoundStruct.getTickSound();
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

  get instance()
  {
    if (CanvasRef._instance)
    {
      return CanvasRef._instance;
    }
    return null;
  }

  get context() { return this.#context_ref; }
  get canvas() { return this.#canvas_ref; }
  set canvas(canvas)
  {
    this.#canvas_ref = canvas;
    this.#context_ref = canvas.getContext('2d');
  }
}

class AudioPlayer
{
  #audioContext;
  #gainNode;
  #oscillators = new Array(8);
  #oscCount = 8;  //  Сколько максимум осциляторов
  #oscIndex = 0;
  constructor()
  {
    if (AudioPlayer._instance)
    {
      return AudioPlayer._instance;
    }

    AudioPlayer._instance = this;
    this.#audioContext = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
    this.#gainNode = this.#audioContext.createGain();

    this.#gainNode.connect(this.#audioContext.destination);
    this.#gainNode.gain.value = 2;
  }

  get currentTime() { return this.#audioContext.currentTime; }

  addOscillator(oscillator)
  {
    this.#oscillators[this.#oscIndex] = oscillator;
    this.#oscIndex += 1;
    if (this.#oscIndex >= this.#oscCount)
      this.#oscIndex = 0;
  }

  //time - when sound will be executed
  //duration of the tone in seconds. Default is 0.005
  //frequency of the tone in hertz. default is 440
  //volume of the tone. Default is 1, off is 0.
  //type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
  //callback to use on end of tone
  async beep(time, duration = 0.005, frequency = 500, type = "sawtooth")
  {
    let oscillator = this.#audioContext.createOscillator();
    oscillator.connect(this.#gainNode);
    this.addOscillator(oscillator);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    oscillator.start(time);
    oscillator.stop(time + duration);
  }

  stopAll()
  {
    for (let i = 0; i < this.#oscCount; i++)
    {
      let osc = this.#oscillators[i];
      if (osc)
        osc.stop(0);
    }
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

  async Draw()
  {
    if (!this.drawn)
    {
      Drawer.drawArc(this.#xPos, this.#yPos, this.#radius, 0, 360, this.#lineWidth, false, this.#lineColor, this.#fillColor);
      this.#drawn = true;
    }
  }

  Clear()
  {
    this.#drawn = false;
  }

  async Redraw(fillColor, lineColor)
  {
    this.#lineColor = lineColor;
    this.#fillColor = fillColor;

    this.Clear();
    this.Draw();
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

  doesMakeSound() { return false; }

  highlight(timeDelay)  // Возвращает True, если эта доля издаёт звук
  {
    if (this.beatState.highlight() == false)
      return false;

    setTimeout(() => this.Redraw(this.beatState.highlightedColor, this.beatState.highlightedColor), timeDelay);
    return this.doesMakeSound();
  }

  async makeNormal()
  {
    const beatState = this.beatState
    if (beatState.makeNormal() == false)
      return;

    this.Redraw(beatState.baseColor, beatState.baseColor);
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
  #timeBetweenBeats;
  #scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
                      // This is calculated from lookahead, and overlaps
                      // with next interval (in case the timer is late)
  #lookAhead = 25;    // How frequently to call scheduling function
                      //(in milliseconds)
  #nextNoteTime;
  #player = new AudioPlayer();
  #drawn = false;
  #active = false;
  #created = false;
  #timer;
  constructor(tempo, beat, ticksPerBeat)
  {
    this.#tempo = tempo;
    this.#beat = beat;
    this.#ticksPerBeat = ticksPerBeat;

    this.#beats = new loopedArray();
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
    if (this.#active)
      this.#player.stopAll();

    this.#tempo = value;
    this.#timeBetweenBeats = this.getTimeBetweenBeats();

    this.#nextNoteTime = this.#player.currentTime;

    const ref = this;
    this.timer = setInterval(() => { ref.schedule(); }, this.#lookAhead);

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
  get beatsArray() { return this.#beats.getArray(); }
  get centerX() { return this.#mainCircle.xPos; }
  get centerY() { return this.#mainCircle.yPos; }
  get mainRadius() { return this.#mainCircle.radius; }

  schedule()
  {
    while (this.#nextNoteTime < this.#player.currentTime + this.#scheduleAheadTime )
    {
      this.highlightNext();
      this.#nextNoteTime += this.#timeBetweenBeats;
    }
  }

  getTimeBetweenBeats()
  {
    return 60 / this.#tempo;
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
    if (this.#created == false)
    {
      this.#createCircles();
      this.#created = true;
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

    let controlX = this.centerX;
    let controlY = this.centerY;

    let startX = controlX;
    let startY = controlY - this.mainRadius;

    Drawer.drawCurvesBetweenCircles(controlX, controlY, startX, startY, beatsArray);
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
    if (beat.highlight(this.#nextNoteTime - this.#player.currentTime))
    {
      let sound = beat.beatState.baseSound;
      let frequency = sound["frequency"];
      let type = sound["type"];

      let duration = 0.005;
      this.#player.beep(this.#nextNoteTime, duration, frequency, type);

      for (let i = 1; i < this.ticks; i++)  //  Полудоли
      {
        this.#player.beep(this.#nextNoteTime + (this.#timeBetweenBeats / this.ticks * i));
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
      this.stop();

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
    }
    this.tempo = temp;
    this.#active = true;
  }

  stop()
  {
    if (this.#active == true)
    {
      this.#player.stopAll();
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
    let mainRadius = this.mainRadius;

    let divider = 18;
    if (this.#beat >= 30)
      divider = divider + Math.floor((this.#beat - 30) / 5) * 2.5;

    let radius = mainRadius / divider;
    let xCenter = this.centerX;
    let yCenter = this.centerY;

    let multiplier = 360 / this.#beat;

    for (let i = 0; i < this.#beat; i++)
    {
      let initial_arc = ((i * multiplier) - 90) * (Math.PI/180); // Вычитаем 90, чтобы начало было в Pi/2, переводим в радианы
      let xPos = xCenter + mainRadius * Math.cos(initial_arc);
      let yPos = yCenter + mainRadius * Math.sin(initial_arc);

      let temp = this.createConcreteBeat(xPos, yPos, lineWidth, radius, i);
      this.#addBeat(temp);
    }
  }

  createConcreteBeat(xPos, yPos, lineWidth, radius, index)
  {
    return new SoundedBeat(xPos, yPos, lineWidth, radius, new BaseBeatState());
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

    let radius = (smallSide - lineWidth) * 0.90;
    let lineColor = theme.lineColor;
    let fillColor = theme.fillColor;

    return new Circle(xCenter, yCenter, lineWidth, radius, lineColor, fillColor);
  }

  static createMetronom(tempo, beats, ticks)
  {
    let newMetronom = new Metronom(tempo, beats, ticks);
    newMetronom.drawAll();
    return newMetronom;
  }

  static BeatsChanged(metronom, beats, ticks)
  {
    let tempo = metronom.tempo;;
    metronom.stop();
    metronom.selfDestroy();
    canvas_reference.clear();
    let newMetronom = this.createMetronom(tempo, beats, ticks);
    newMetronom.start(newMetronom.tempo);
    return newMetronom;
  }

  static PlayButtonPress(metronom, tempo, beats, ticks)
  {
    let newMetronom = metronom;
    if (newMetronom.beat != beats)
    {
      newMetronom = this.BeatsChanged(metronom, beats, ticks);
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

}

class Petronom extends Metronom
{
  #firstBeat;
  #secondBeat;
  constructor(tempo, firstBeat, secondBeat)
  {
    let totalBeats = firstBeat * secondBeat;
    super(tempo, totalBeats, 1);
    this.#firstBeat = firstBeat;
    this.#secondBeat = secondBeat;
  }

  get firstBeat() { return this.#firstBeat; }
  get secondBeat() { return this.#secondBeat; }

  createConcreteBeat(xPos, yPos, lineWidth, radius, index)
  {
    if ( index % this.#firstBeat == 0 )
    {
      return new SoundedBeat(xPos, yPos, lineWidth, radius * 1.5, new AlternateBeatState());
    }
    else if ( index % this.#secondBeat == 0 )
    {
      return new SoundedBeat(xPos, yPos, lineWidth, radius * 1.5, new BaseBeatState());
    }
    else
    {
      return new Beat(xPos, yPos, lineWidth, radius, new BaseBeatState());
    }
  }

  getTimeBetweenBeats()
  {
    return super.getTimeBetweenBeats() / this.#firstBeat;
  }

  drawCurves()
  {
    let firstBeatArr = new Array(this.#firstBeat);
    let secondBeatArr = new Array(this.#secondBeat);

    for ( let i = 1; i < this.beatsArray.length; i++ )
    {
      if ( i % this.#firstBeat == 0 )
        firstBeatArr.push(this.beatsArray[i]);
      if ( i % this.#secondBeat == 0 )
        secondBeatArr.push(this.beatsArray[i]);
    }

    let startX = this.centerX;
    let startY = this.centerY - this.mainRadius;

    if (firstBeatArr.length < secondBeatArr.length)
    {
      Drawer.drawCurvesBetweenCircles(this.centerX, this.centerY, startX, startY, secondBeatArr);
      Drawer.drawCurvesBetweenCircles(this.centerX, this.centerY, startX, startY, firstBeatArr);
    }
    else
    {
      Drawer.drawCurvesBetweenCircles(this.centerX, this.centerY, startX, startY, firstBeatArr);
      Drawer.drawCurvesBetweenCircles(this.centerX, this.centerY, startX, startY, secondBeatArr);
    }
  }

  static createPetronom(tempo, firstBeat, secondBeat)
  {
    let newPetronom = new Petronom(tempo, firstBeat, secondBeat);
    newPetronom.drawAll();
    return newPetronom;
  }

  static BeatsChanged(metronom, firstBeat, secondBeat)
  {
    let tempo = metronom.tempo;
    metronom.stop();
    metronom.selfDestroy();
    canvas_reference.clear();
    let newMetronom = this.createPetronom(tempo, firstBeat, secondBeat);
    newMetronom.start(newMetronom.tempo);
    return newMetronom;
  }

  static PlayButtonPress(metronom, tempo, firstBeat, secondBeat)
  {
    let newMetronom = metronom;
    if (newMetronom.firstBeat != firstBeat || newMetronom.secondBeat != secondBeat)
    {
      newMetronom = this.BeatsChanged(metronom, firstBeat, secondBeat);
    }
    else if ( newMetronom.active == true )
    {
      newMetronom.stop();
      return newMetronom;
    }
    newMetronom.start(tempo);
    return newMetronom;
  }
}

