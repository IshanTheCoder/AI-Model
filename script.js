const URL = "https://teachablemachine.withgoogle.com/models/Ur8KUWNUn/";

let model, webcam, labelContainer, maxPredictions;

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

async function takePicture() {
  // Capture current webcam frame into a canvas
  const snapshotCanvas = document.createElement("canvas");
  snapshotCanvas.width = webcam.canvas.width;
  snapshotCanvas.height = webcam.canvas.height;
  const context = snapshotCanvas.getContext("2d");
  context.drawImage(webcam.canvas, 0, 0);

  // Display snapshot image
  const imgElement = document.getElementById("snapshot");
  imgElement.src = snapshotCanvas.toDataURL("image/png");
  imgElement.style.display = "block";

  // Get predictions and display top 3
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
