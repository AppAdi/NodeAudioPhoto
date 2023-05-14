const express = require('express');
const app = express();
const sharp = require('sharp');
const multer = require('multer');
const { PitchShift, Volume, Player, Context } = require('tone');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('resizetest');
});

app.get('/au', (req, res) => {
    res.render('audiotest');
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

app.post('/resize', upload.single('image'), async (req, res) => {
  const { width, height } = req.body;
  const file = req.file;

  const resizedImage = await sharp(file.path)
    .resize(parseInt(width), parseInt(height))
    .toBuffer();

    const ori = await sharp(file.path).clone().toBuffer();

    const Metadataori = await sharp(ori).metadata();
    const Metadataresize = await sharp(resizedImage).metadata();
    console.log(Metadataori);
  res.render('resizehasil', { 
    resized: resizedImage,
    ori: ori,
    metaori : Metadataori,
    metaresize : Metadataresize
  });
});

app.post('/aud', upload.single('audio'), async (req, res) => {
    const { pitch, volume } = req.body;
    const file = req.file;
  
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
  
    reader.onload = async () => {
      const audioBuffer = await Context.decodeAudioData(reader.result);
  
      // create a player and set the buffer
      const player = new Player(audioBuffer).toDestination();
  
      // create a pitch shift effect
      const pitchShift = new PitchShift(pitch).toDestination();
  
      // create a volume effect
      const volumeNode = new Volume(volume).toDestination();
  
      // connect the player to the pitch shift and volume nodes
      player.connect(pitchShift);
      pitchShift.connect(volumeNode);
  
      // start playing the modified audio
      player.start();
  
      // generate URIs for original and edited audio
      const originalUri = `/audio/${file.originalname}`;
      const editedUri = `/audio/${outputFilename}`;
  
      // render the audiohasil page with original and edited URIs
      res.render('audiohasil', { originalUri, editedUri });
    };
  
    reader.onerror = (error) => {
      console.error(error);
      res.status(500).send('Error processing audio file');
    };
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
