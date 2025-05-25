const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urls = [];
let idCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Basic protocol validation before DNS lookup
  let hostname;
  try {
    const urlObj = new URL(originalUrl);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }
    hostname = urlObj.hostname;
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Check if URL already exists in db
      const found = urls.find((item) => item.original_url === originalUrl);
      if (found) {
        return res.json(found);
      }

      // Create new short URL entry
      const newEntry = {
        original_url: originalUrl,
        short_url: idCounter++,
      };
      urls.push(newEntry);
      return res.json(newEntry);
    }
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const found = urls.find((item) => item.short_url === id);
  if (found) {
    return res.redirect(found.original_url);
  } else {
    return res.status(404).json({ error: 'No short URL found for given input' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
