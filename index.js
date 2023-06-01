const express = require('express');
const app = express();
const sharp = require('sharp');
const multer = require('multer');
const Tone = require('tone');
const fs = require('fs');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/resize', (req, res) => {
  res.render('gambar/resize');
});

app.get('/crop', (req, res) => {
  res.render('gambar/crop');
});

app.get('/rotate', (req, res) => {
  res.render('gambar/rotate');
});

app.get('/flip', (req, res) => {
  res.render('gambar/flip');
});

app.get('/blur', (req, res) => {
  res.render('gambar/blur');
});

app.get('/sharpen', (req, res) => {
  res.render('gambar/sharpen');
});

app.get('/colourmanip', (req, res) => {
  res.render('gambar/colour-manipulation');
});

app.get('/channelmanip', (req, res) => {
  res.render('gambar/channel-manipulation');
});

app.get('/composite', (req, res) => {
  res.render('gambar/composite');
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    },
    multipart: true 
  });
  
const upload = multer({ storage: storage });

  
app.post('/resize', upload.single('image'), async (req, res) => {
  const { width, height } = req.body;
  const file = req.file;

  const resultImage = await sharp(file.path)
    .resize(parseInt(width), parseInt(height), {
      fit: 'fill'
    })
    .toBuffer();

  const ori = await sharp(file.path).clone().toBuffer();
  const Metadataori = await sharp(ori).metadata();
  const Metadataresult = await sharp(resultImage).metadata();

  const resultHtml = generateResultHtml(ori, resultImage, Metadataori, Metadataresult);
  res.send(resultHtml);
});


app.post('/crop', upload.single('image'), async (req, res) => {
  const { width, height } = req.body;
  const file = req.file;

  const ori = await sharp(file.path).clone().toBuffer();
  const Metadataori = await sharp(ori).metadata();

  const left = Math.floor((Metadataori.width - parseInt(width)) / 2);
  const top = Math.floor((Metadataori.height - parseInt(height)) / 2);

  const resultImage = await sharp(file.path)
    .extract({ left, top, width: parseInt(width), height: parseInt(height) })
    .toBuffer();

  const Metadataresult = await sharp(resultImage).metadata();
  const resultHtml = generateResultHtml(ori, resultImage, Metadataori, Metadataresult);
  res.send(resultHtml);
});

app.post('/rotate', upload.single('image'), async (req, res) => {
  const {angle} = req.body;
  const file = req.file;

  const resultImage = await sharp(file.path)
    .rotate(parseInt(angle))
    .toBuffer();

  const ori = await sharp(file.path).clone().toBuffer();
  const Metadataori = await sharp(ori).metadata();
  const Metadataresult = await sharp(resultImage).metadata();

  const resultHtml = generateResultHtml(ori, resultImage, Metadataori, Metadataresult);
  res.send(resultHtml);
});

app.post('/flip', upload.single('image'), async (req, res) => {
  const {method} = req.body;
  const file = req.file;
  let resultImage = "";

  if(parseInt(method) == 1){
    resultImage = await sharp(file.path)
    .flip()
    .toBuffer();
  }else{
    resultImage = await sharp(file.path)
    .flop()
    .toBuffer();
  }
  
  const ori = await sharp(file.path).clone().toBuffer();
  const Metadataori = await sharp(ori).metadata();
  const Metadataresult = await sharp(resultImage).metadata();

  const resultHtml = generateResultHtml(ori, resultImage, Metadataori, Metadataresult);
  res.send(resultHtml);
});

app.post('/sharpen', upload.single('image'), async (req, res) => {
  const {value} = req.body;
  const file = req.file;

  const resultImage = await sharp(file.path)
    .sharpen(parseFloat(value))
    .toBuffer();

  const ori = await sharp(file.path).clone().toBuffer();
  const Metadataori = await sharp(ori).metadata();
  const Metadataresult = await sharp(resultImage).metadata();

  const resultHtml = generateResultHtml(ori, resultImage, Metadataori, Metadataresult);
  res.send(resultHtml);
});

app.post('/blur', upload.single('image'), async (req, res) => {
  const {value} = req.body;
  const file = req.file;

  const resultImage = await sharp(file.path)
    .blur(parseFloat(value))
    .toBuffer();

  const ori = await sharp(file.path).clone().toBuffer();
  const Metadataori = await sharp(ori).metadata();
  const Metadataresult = await sharp(resultImage).metadata();

  const resultHtml = generateResultHtml(ori, resultImage, Metadataori, Metadataresult);
  res.send(resultHtml);
});

app.post('/colourmanip', upload.single('image'), async (req, res) => {
  const {method} = req.body;
  const file = req.file;
  let resultImage = "";

  if(parseInt(method) == 1){
    resultImage = await sharp(file.path)
    .greyscale()
    .toBuffer();
  }else if(parseInt(method) == 2){
    resultImage = await sharp(file.path)
    .negate()
    .toBuffer();
  }else{
    resultImage = await sharp(file.path)
    .tint({ r: 255, g: 240, b: 16 })
    .toBuffer();
  }
  
  const ori = await sharp(file.path).clone().toBuffer();
  const Metadataori = await sharp(ori).metadata();
  const Metadataresult = await sharp(resultImage).metadata();

  const resultHtml = generateResultHtml(ori, resultImage, Metadataori, Metadataresult);
  res.send(resultHtml);
});

app.post('/channelmanip', upload.single('image'), async (req, res) => {
  const {method} = req.body;
  const file = req.file;
  let resultImage = "";

  if(parseInt(method) == 1){
    resultImage = await sharp(file.path)
    .removeAlpha()
    .toBuffer();
  }else if(parseInt(method) == 2){
    resultImage = await sharp(file.path)
    .ensureAlpha()
    .toBuffer();
  }else{
    resultImage = await sharp(file.path)
    .extractChannel('green')
    .toBuffer();
  }
  
  const ori = await sharp(file.path).clone().toBuffer();
  const Metadataori = await sharp(ori).metadata();
  const Metadataresult = await sharp(resultImage).metadata();

  const resultHtml = generateResultHtml(ori, resultImage, Metadataori, Metadataresult);
  res.send(resultHtml);
});

app.post('/composite', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'secondImage', maxCount: 1 }]), async (req, res) => {
  const files = req.files;

  const image1 = files['image'][0];
  const image2 = files['secondImage'][0];

  const resultImage = await sharp(image1.path)
    .composite([{ input: image2.path }])
    .toBuffer();

  const ori = await sharp(image1.path).clone().toBuffer();
  const Metadataori = await sharp(ori).metadata();
  const Metadataresult = await sharp(resultImage).metadata();

  const resultHtml = generateResultHtml(ori, resultImage, Metadataori, Metadataresult);
  res.send(resultHtml);
});

function generateResultHtml(ori, resultImage, Metadataori, Metadataresult, callback) {
  const resultHtml = `
  <h2 class="text-center mt-5 mb-5">Hasil Pemrosesan</h2>
  <div class="row">
    <div class="col-md-4 offset-md-2 text-center image-fluid">
      <h3 class="mb-3">Original</h3>
      <img class="img-fluid mx-auto" src="data:image/png;base64, ${ori.toString('base64')}" />
    </div>
    <div class="col-md-4 text-center image-fluid">
      <h3 class="mb-3">Hasil</h3>
      <img class="img-fluid mx-auto" src="data:image/png;base64, ${resultImage.toString('base64')}" />
    </div>
  </div>

  <div class="row mt-5">
    <div class="col-md-4 offset-md-2 text-center">
      <h6>Metadata</h6>
      <p class="mt-3">Size : ${Metadataori.size}</p>
      <p>Height : ${Metadataori.height}</p>
      <p>Width : ${Metadataori.width}</p>
    </div>
    <div class="col-md-4 text-center">
      <h6>Metadata</h6>
      <p class="mt-3">Size : ${Metadataresult.size}</p>
      <p>Height : ${Metadataresult.height}</p>
      <p>Width : ${Metadataresult.width}</p>
    </div>
  </div>
  `;

  return(resultHtml);
}





app.get('/volume', (req, res) => {
  res.render('audio/volume');
});

app.listen(3000, () => {
    console.log('Server berjalan pada http://localhost:3000');
  });
