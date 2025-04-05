const URL = "https://teachablemachine.withgoogle.com/models/Ur8KUWNUn/";

let model, webcam, labelContainer, maxPredictions;

async function init() {
  // Load the model and metadata
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  
  try {
    model = await tmImage.load(modelURL, metadataURL);
    console.log("Model loaded!");
  } catch (error) {
    console.error("Error loading model:", error);
    return;
  }

  maxPredictions = model.getTotalClasses();

  // Set up the webcam
  const flip = true; // Whether to flip the webcam
  webcam = new tmImage.Webcam(200, 200, flip);
  
  try {
    await webcam.setup();  // Request access to the webcam
    await webcam.play();   // Start playing the webcam feed
    console.log("Webcam started:", webcam.canvas);
  } catch (error) {
    console.error("Error starting webcam:", error);
    alert("⚠️ Please allow camera access.");
    return;
  }

  // Append webcam canvas to the DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  
  // Set up the label container
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  // Start the loop to continually update the webcam
  window.requestAnimationFrame(loop);
}

async function loop() {
  // Update the webcam frame
  webcam.update();

  // Make predictions
  await predict();

  // Keep the loop going
  window.requestAnimationFrame(loop);
}

async function predict() {
  // Get predictions from the model for the current webcam frame
  const prediction = await model.predict(webcam.canvas);

  // Sort predictions by probability (descending order) and display top 3
  const top3 = prediction
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  labelContainer.innerHTML = "";
  top3.forEach(p => {
    const label = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
    const div = document.createElement("div");
    div.textContent = label;
    labelContainer.appendChild(div);
  });
}

async function takePicture() {
  // Capture the current frame from the webcam into a canvas
  const snapshotCanvas = document.createElement("canvas");
  snapshotCanvas.width = webcam.canvas.width;
  snapshotCanvas.height = webcam.canvas.height;
  const context = snapshotCanvas.getContext("2d");
  context.drawImage(webcam.canvas, 0, 0);

  // Show the snapshot image in the DOM
  const imgElement = document.getElementById("snapshot");
  imgElement.src = snapshotCanvas.toDataURL("image/png");
  imgElement.style.display = "block";

  // Get predictions and display the top 3
  const prediction = await model.predict(snapshotCanvas);
  const top3 = prediction
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  labelContainer.innerHTML = "";
  top3.forEach(p => {
    const label = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
    const div = document.createElement("div");
    div.textContent = label;
    labelContainer.appendChild(div);
  });
}
