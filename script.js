const URL = "https://teachablemachine.withgoogle.com/models/Ur8KUWNUn/"; // Your Teachable Machine model URL

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
  await webcam.play();

  console.log("Webcam video started:", webcam.canvas);
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
}

// Take a snapshot of the webcam feed
async function takePicture() {
  const snapshotCanvas = document.createElement("canvas");
  snapshotCanvas.width = webcam.canvas.width;
  snapshotCanvas.height = webcam.canvas.height;
  const context = snapshotCanvas.getContext("2d");
  context.drawImage(webcam.canvas, 0, 0);

  const imgElement = document.getElementById("snapshot");
  imgElement.src = snapshotCanvas.toDataURL("image/png");
  imgElement.style.display = "block";

  await getPrediction(snapshotCanvas);
}

// Handle the file upload
function handleUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async function() {
      const snapshotCanvas = document.createElement("canvas");
      snapshotCanvas.width = img.width;
      snapshotCanvas.height = img.height;
      const context = snapshotCanvas.getContext("2d");
      context.drawImage(img, 0, 0);

      const imgElement = document.getElementById("snapshot");
      imgElement.src = snapshotCanvas.toDataURL("image/png");
      imgElement.style.display = "block";

      await getPrediction(snapshotCanvas);
    }
  }
}

// Get predictions from the model and display the top 3
async function getPrediction(canvas) {
  const prediction = await model.predict(canvas);
  
  // Sort the predictions by probability and keep the top 3
  const top3 = prediction
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  labelContainer.innerHTML = ""; // Clear previous labels

  top3.forEach(p => {
    // Only display the label if probability is greater than 5%
    if (p.probability > 0.05) {
      const label = `${p.className}: ${(p.probability * 100).toFixed(2)}%`;
      const div = document.createElement("div");
      div.textContent = label;
      labelContainer.appendChild(div);
    }
  });
}
