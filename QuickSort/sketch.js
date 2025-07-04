// QuickSort Algorithm Visualizer for Public Github V1
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
/** Indicates when a frame updates */
let flag = false; 
/** Indicates when a loop is running inside a recursion */
let looping = false; 
/** Indicates if quickSort has been called */
let started = false;
/** Indicates if quickSort has been returned */
let finished = false;

// Visualization Globals
/** Index of the current pivot in items array */
let pivotIndex = -1;
/** Index of the column being compared to the pivot */
let choice = -1;
/** Starting index of the partition */
let lowerBound = -1; 
/** Final index of the partion */
let upperBound = -1;

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

  if (!started&&playing){
    quickSort(0, items.length);
    started = true;
  }
  
  if(finished&&flag){endAnim();}

  flag = true;
  
  visualize();
}

// Sorting Algorithm Functions
/**
 * A recursive sorting algorithm modified to be visualized in p5js. The first call to this function should have start 
 * as 0 and stop as the length of the array.
 * @param {*} start The first element in the partition (inclusive).
 * @param {*} stop The end of the partition (exclusive).
 * @returns 
 */
async function quickSort(start, stop){
  // Aknowledge call and wait for new frame
  finished = false; 
  await until(_ => flag === true && looping === false);
  flag = false;
  
  // End condition
  if (start+1 >= stop){ // Start is inclusive, stop is exclusive
    finished = true;
    return;} 
  
  // Update tracking values for visualization
  pivotIndex = start;
  lowerBound = start;
  upperBound = stop;

  // Sort elements around the pivot
  let pivot = items[start];
  /**
   * Tracks the number of elements between start and pivot
   */
  let lessThan = 0;
  for(let i = start+1; i < stop; i++){
    looping = true;
    await until(_ => flag === true); // Run only one loop per frame
    flag = false;
    choice = i; // Update tracking value for visualization

    // Move values to left of pivot if lower
    if (items[i] < pivot){
      shiftItems(pivotIndex, i);  // Shift element to left of pivot
      pivotIndex++;               // Thus pivot must shift right one
      lessThan++;                 // And the number of elements between start and pivot increases one
    }
    // Else leave the element where it is
  }
  looping = false;

  // Calling the recursion on each partition
  lessThan++; // Acount for the pivot in the partition
  quickSort(start, start + lessThan); 
  quickSort(start + lessThan, stop); 
}
/**
 * Moves the given element of index "bump" to the given start position of the array and shifts all displaced elements 
 * right.
 * @param {*} front The position at the start of the section to be shifted; where the element is bumped to.
 * @param {*} bump The element in the array to be bumped leftward.
 * @returns 
 */
function shiftItems(front, bump){
  if(front >= bump){return;}
  for(let i = front; i < bump; i++){
    temp = items[i];
    items[i] = items[bump];
    items[bump] = temp;
  }
}
/** Stops the algorithm and plays an ending animation */
async function endAnim(){
  pivotIndex = -1;
  lowerBound = -1;
  upperBound = -1;
  for(let i = 0; i <= cols; i++){
    await until(_ => flag === true);
    flag = false;
    choice = i;
  }
  finished = false; // Stop the animation
  osc.stop();
}
/** Sets all of the values to be drawn each frame and plays the tone. */
function visualize(){
  background(220);

  // Highlight selection
  for (let i = lowerBound; i < upperBound; i++){
    fill(250);
		noStroke();
    rect(i*size, 0, size, height);
  }

  // Draw every column
  for (let i = 0; i < cols; i++){
    fill(255);
    stroke(0);
    rect(i*size, height, size, -items[i]);
  }

  // Mark choice in black
  fill(0);
  rect(choice*size, height, size, -items[choice]);

  // Mark pivot in red
  fill(255,0,0);
  rect(pivotIndex*size, height, size, -items[pivotIndex]);

  // Play sound for given column
  chirp(items[choice]);
}
/** Causes an async function to pause until the conditional function returns true */
function until(conditionalFunction){
  const poll = resolve => {
    if(conditionalFunction()) resolve();
    else setTimeout(_ => poll(resolve), 0); // Checks every event loop
  }
  return new Promise(poll);
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
  // x/200 = a/100
  // a = (x/200)*100
  return (x/height)*(maxFreq-minFreq)+minFreq;
}
/** Starts the tone generator */
function startAudio(){
  osc.start();
  playing = true;
}


