const Jimp = require('jimp');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'Path to the input image (512x512)'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Path to the output image (128x128)'
  })
  .option('help', {
    alias: 'h',
    type: 'boolean',
    description: 'Show help'
  })
  .argv;

if (argv.help) {
  console.log(`
Usage: node imageReducer.js --input <input_path> --output <output_path>

Options:
  --input, -i    Path to the input image (512x512)
  --output, -o   Path to the output image (128x128)
  --help, -h     Show help

Reduction Algorithm:
  The reduction algorithm is based on a 4x4 grid:
    0123
    4567
    89AB
    CDEF

  The resulting pixel is calculated using the following equation:
    maxValuePerRGBChannel(5, 6, 9, A)

  This means that for each 4x4 block of pixels in the input image, we take the maximum value
  of the R, G, and B channels of pixels at positions (1, 1), (2, 1), (1, 2), and (2, 2),
  and set the corresponding pixel in the output image to these maximum values.
  `);
} else {
  const inputPath = argv.input;
  const outputPath = argv.output;

  async function reduceImage(inputPath, outputPath) {
    const image = await Jimp.read(inputPath);
    const newImage = new Jimp(128, 128, (err, image) => {
      if (err) throw err;
    });

    function maxValuePerRGBChannel(a, b, c, d) {
      return [
        Math.max(a[0], b[0], c[0], d[0]),
        Math.max(a[1], b[1], c[1], d[1]),
        Math.max(a[2], b[2], c[2], d[2])
      ];
    }

    for (let y = 0; y < image.bitmap.height; y += 4) {
      for (let x = 0; x < image.bitmap.width; x += 4) {
        const pixelA = Jimp.intToRGBA(image.getPixelColor(x + 1, y));
        const pixelB = Jimp.intToRGBA(image.getPixelColor(x + 2, y));
        const pixelC = Jimp.intToRGBA(image.getPixelColor(x + 1, y + 2));
        const pixelD = Jimp.intToRGBA(image.getPixelColor(x + 2, y + 2));

        const reducedPixel = maxValuePerRGBChannel(pixelA, pixelB, pixelC, pixelD);
        newImage.setPixelColor(Jimp.rgbaToInt(...reducedPixel), x / 4, y / 4);
      }
    }

    await newImage.writeAsync(outputPath);
  }

  reduceImage(inputPath, outputPath).catch(console.error);
}

