const express = require('express');
const app = express();
const sharp = require('sharp');
const multer = require('multer');
const lame = require('node-lame');
const { PitchShift, Volume, Player, Context } = require('tone');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/re', (req, res) => {
  res.render('gambar/resize');
});


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
const upload = multer({ storage: storage });

// app.post('/resize', upload.single('image'), async (req, res) => {
//   const { width, height } = req.body;
//   const file = req.file;

//   const resizedImage = await sharp(file.path)
//     .resize(parseInt(width), parseInt(height))
//     .toBuffer();

//     const ori = await sharp(file.path).clone().toBuffer();

//     const Metadataori = await sharp(ori).metadata();
//     const Metadataresize = await sharp(resizedImage).metadata();
//     console.log(Metadataori);
//   res.render('resizehasil', { 
//     resized: resizedImage,
//     ori: ori,
//     metaori : Metadataori,
//     metaresize : Metadataresize
//   });
// });
  
app.post('/resize', upload.single('image'), async (req, res) => {
  const { width, height } = req.body;
  const file = req.file;

  const resultImage = await sharp(file.path)
    .resize(parseInt(width), parseInt(height))
    .toBuffer();

  const ori = await sharp(file.path).clone().toBuffer();

  const Metadataori = await sharp(ori).metadata();
  const Metadataresult = await sharp(resultImage).metadata();

  console.log(Metadataresult);

  const resultHtml = `
  <div class="row">
    <div class="col text-center">
      <img class="img-fluid mx-auto" src="data:image/png;base64, ${ori.toString('base64')}" />
    </div>
    <div class="col text-center">
      <img class="img-fluid mx-auto" src="data:image/png;base64, ${resultImage.toString('base64')}" />
    </div>
  </div>

  <div class="row">
    <div class="col text-center">
      <p>Metadata</p>
      <p>Size : ${Metadataori.size}</p>
      <p>Height : ${Metadataori.height}</p>
      <p>Width : ${Metadataori.width}</p>
    </div>
    <div class="col text-center">
      <p>Metadata</p>
      <p>Size : ${Metadataresult.size}</p>
      <p>Height : ${Metadataresult.height}</p>
      <p>Width : ${Metadataresult.width}</p>
    </div>
  </div>
  `;

  res.send(resultHtml);
});

  
  
  

// sharp('gambar.jpg')
//   .resize(300, 200)
//   .crop(sharp.gravity.center)
//   .toFile('gambar_crop.jpg');

//   sharp('gambar.jpg')
//   .rotate(90)
//   .toFile('gambar_rotasi.jpg');

//   sharp('gambar.jpg')
//   .flip(true) // horizontal flip
//   .toFile('gambar_flip_horizontal.jpg');

// sharp('gambar.jpg')
//   .flip(false) // vertical flip
//   .toFile('gambar_flip_vertikal.jpg');

//   sharp('gambar.jpg')
//   .grayscale()
//   .toFile('gambar_grayscale.jpg');

//   sharp('gambar.jpg')
//   .blur(5)
//   .toFile('gambar_blur.jpg');

//   const background = sharp('background.jpg')
//   .resize(800, 600);

// const overlay = sharp('overlay.png')
//   .resize(200, 200);

// background
//   .composite([{
//     input: overlay,
//     gravity: 'northwest'
//   }])
//   .toFile('gambar_composite.jpg');

app.listen(3000, () => {
    console.log('Server berjalan pada http://localhost:3000');
  });
