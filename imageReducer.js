const fileInput = document.getElementById('file-input');
const canvas = document.getElementById('reduced-image');
const ctx = canvas.getContext('2d');
const saveButton = document.getElementById('save-button');

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(image, 0, 0);

    for (let y = 0; y < image.height; y += 4) {
      for (let x = 0; x < image.width; x += 4) {
        const pixelA = tempCtx.getImageData(x + 1, y, 1, 1);
        const pixelB = tempCtx.getImageData(x + 2, y, 1, 1);
        const pixelC = tempCtx.getImageData(x + 1, y + 1, 1, 1);
        const pixelD = tempCtx.getImageData(x + 2, y + 1, 1, 1);

        const maxPixel = [
          Math.max(pixelA.data[0], pixelB.data[0], pixelC.data[0], pixelD.data[0]),
          Math.max(pixelA.data[1], pixelB.data[1], pixelC.data[1], pixelD.data[1]),
          Math.max(pixelA.data[2], pixelB.data[2], pixelC.data[2], pixelD.data[2])
        ];

        ctx.fillStyle = `rgb(${maxPixel[0]}, ${maxPixel[1]}, ${maxPixel[2]})`;
        ctx.fillRect(x / 4, y / 4, 1, 1);
      }
    }

    canvas.style.display = 'block';
    saveButton.style.display = 'block';
  };
});

saveButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'reduced-image.png';
  link.click();
});
