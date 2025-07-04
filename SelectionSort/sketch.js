// SelesctionSort Algorithm Visualizer for Public Github V1
// Canvas Globals
const height = 600;
const width = 1000;
const cols = 100;
const fr = 1;
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
/** Lowest value found in items[] */
let minVal = Infinity;
/** Index of the element with the lowest value in items[] */
let minIndex = 0;
/** Current element being checked in items[] */
let pos = -1;
/** Index of the first unsorted element in items[] */
let sortIndex = 0;
/** Indicates if the algorithm has finished sorting items[] */
let finished = false;

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
}

function draw() {
  cnv.mouseClicked(startAudio);

  if(playing && !finished){selectionSort();}

  if(playing && finished){endAnim();}

  //#####################################
  //# UPDATE FRAME TRACKER HERE IF USED #
  //#####################################
  
  visualize();
}

// Sorting Algorithm Functions
/** Modified selectionSort algorithm to allow visualization in p5js */
function selectionSort(){
  // End condition
  if(sortIndex >= cols - 1){
    finished = true;
    pos = -1; // reset for endAnim
    return;
  }

  // Find the lowest value
  if(items[pos] < minVal) {
    minVal = items[pos];
    minIndex = pos;
  }
  pos++;

  // Return unless at the end of the array
  if(pos < cols){return;}

  // Else swap the lowest value with the first unsorted one
  let temp = items[sortIndex];
  items[sortIndex] = items[minIndex];
  items[minIndex] = temp;

  // And reset for the next loop through
  sortIndex++;
  pos = sortIndex+1;
  minVal = items[sortIndex];
  minIndex = sortIndex;
}
/** Plays an ending animation once sorting is complete */
function endAnim(){
  // Set conditions
  sortIndex = cols;
  minIndex = pos+1; 

  // End condition
  if (pos >= cols){ 
    playing = false;
    osc.stop();
  }

  // Run animation
  pos++;
}

/** Sets all of the values to be drawn each frame and plays the tone. */
function visualize(){
  background(220);

  // Highlight pos
  fill(255);
  noStroke();
  rect(pos*size, height, size, -height);

  // Draw every unsorted column
  for (let i = sortIndex; i < cols; i++){
    fill(255,240,240); // light red
    stroke(0);
    rect(i*size, height, size, -items[i]);
  }
  // Draw every sorted column
  for (let i = 0; i < sortIndex; i++){
    fill(240,255,240); // light green
    stroke(0);
    rect(i*size, height, size, -items[i]);
  }


  if(!playing){return;} 

  // Mark pos
  fill("red");
  stroke(0);
  rect(pos*size, height, size, -items[pos]);

  // Mark minimum value
  fill("green");
  stroke(0);
  rect(minIndex*size, height, size, -items[minIndex]);

  // Play sound for given column
  chirp(items[pos]);

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
