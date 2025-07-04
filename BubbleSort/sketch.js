// BubbleSort Algorithm Visualizer for Public Github V1
// Canvas Globals
const height = 600;
const width = 1000;
const cols = 100;
const fr = 3;
let size;
/** Determines the degree of randomness in the data */
const chunkSize = 20;

// Audio Globals
let osc, playing, cnv; 
let minFreq = 100; 
let maxFreq = 900;
let trans = 0;

// Tracking Globals
/** The global array of data to be sorted. This will be visualized with columns of a size proportional to the value 
 * of each element in the array. */
let items = [];
/** The element being compaired to its neighbour */
let pos = 0;
/** The index of the last unsorted element in the array */
let end = 0; 
/** Tracks if the algorithm has finished sorting */
let finished = false;

// Visualization Globals
/** Swap is false if pos is lesser than its neighbour and true if greater than */
let swap = false;

function setup() {
  //frameRate(fr);
  size = width / cols;
  cnv = createCanvas(width, height);

  // Generate random data
  randomItems();
  //mostlySortedItems();
  //mostlyReversedItems()

  // Create sound objects
  osc = new p5.Oscillator("square");
  osc.start();

  // Handle starting and stopping sound
  this.addEventListener('click', function() { 
    if(playing){
      osc.stop();
      playing = false;
    }else{startAudio();}});

    this.addEventListener('visibilitychange', function() { 
      if(playing){
        osc.stop();
        playing = false;
      }});
    
    // Algorithm Globals initializing
    end = cols - 2; // cols-2 is the second to last index of items
}

function draw() {
  cnv.mouseClicked(startAudio);

  if(playing && !finished){bubbleSort();}

  if(playing && finished){endAnim();}

  visualize();
}

// Sorting Algorithm Functions
/** Uses a modified bubbleSort algorithm to visualize sorting the data in items[] with p5js */
function bubbleSort(){
  // Sorting
  let current = items[pos];
  let next = items[pos+1];
  swap = false; // Tracking if values are swapped for the visualization
  if(current > next){
    swap = true;
    // swap positions without temp var
    items[pos] += items[pos+1];
    items[pos+1] = items[pos] - items[pos+1];
    items[pos] -= items[pos+1];
  }

  // Iterate
  pos++;
  if (pos > end) {
    pos = 0;
    end--;
  }

  // End condition
  if (end === -2){finished = true;} // End starts two lower than the length of the array
}
/** Plays an ending animation once sorting is complete */
function endAnim(){
  swap = true;
  pos++;
  if (pos > cols-1) {
    playing = false;
    pos = -1;
    osc.stop();
  }
}
/** Sets all of the values to be drawn each frame and plays the tone. */
function visualize(){
  background(220);

  fill(255);
  noStroke();
  rect((pos)*size, height, size, -height);

  // Draw every column
  for (let i = 0; i < end+2; i++){
    fill(255,200,200); // Pale red
    stroke(0);
    rect(i*size, height, size, -items[i]);
  }
  for (let i = end+2; i < cols; i++){
    fill(200,255,200); // Pale Green
    stroke(0);
    rect(i*size, height, size, -items[i]);
  }

  let colour = "red";
  if(swap){colour = "green";}
  fill(colour);
  stroke(0);
  rect((pos)*size, height, size, -items[pos]);

  // Play sound for given column
  chirp(items[pos+1]);

}

// Data Generating Functions
/**
 * Creates a sorted list of values with equal spacing based on the window size and desired columns.
 * @returns The array of sorted values
 */
function getItems(){
  let r = 5;
  let output = [];
  for (let i = 0; i < cols; i++){
    output[i] = r;
    r += (height-10)/cols;
  }
  return output;
}
/** Fills items[] with random values */
function randomItems(){
  items = shuffle(getItems());
}
/** Fills items[] with almost sorted values. The degree of randomness is set by the global chunkSize */
function mostlySortedItems(){
  /** An array of values that will become one part of the items[] array. A "chunk" of the array. */
  let itemChunk = [];
  /** The array of values to be randomized */
  let sorted = getItems();
  /** The iterator which tracks the starting index of the next chunk */
  let chunkIndex = 0;
  
  for (;chunkIndex < cols; chunkIndex += chunkSize){// For each chunk + remainder
      for(let i = chunkIndex; i < chunkIndex+chunkSize && i < cols; i++){
        // Fill in each chunk with sorted values
        itemChunk[i-(chunkIndex)] = sorted[i];
      }
      itemChunk = shuffle(itemChunk); // Randomize itemChunk
      for (let i = chunkIndex; i < chunkIndex+chunkSize && i < cols; i++){
        // Copy randomized chunk to corresponding section of items[]
        items[i] = itemChunk[i-(chunkIndex)];
      }
  }
}
/** Fills items[] with almost reverse-sorted values. The degree of randomness is set by the global chunkSize */
function mostlyReversedItems(){
  mostlySortedItems();
  items = reverse(items);    
}

// Audio Functions
/** Plays a sound of the given tone */
function chirp(tone){
  if(tone === undefined){return;}
  osc.freq(crossMult(tone),trans);
}
/** Scales the given value of items[] to be proportional to the desired min and max frequency */
function crossMult(x){
  return (x/height)*(maxFreq-minFreq)+minFreq;
}
/** Starts the tone generator */
function startAudio(){
  osc.start();
  playing = true;
}

