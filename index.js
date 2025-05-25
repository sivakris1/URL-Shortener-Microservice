const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

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
  const url = req.body.url;

  try {
    const parsedUrl = urlParser.parse(url);
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'Invalid URL' });
      } else {
        const existing = urls.find((item) => item.original_url === url);
        if (existing) {
          return res.json(existing);
        }

        const newEntry = {
          original_url: url,
          short_url: idCounter++,
        };
        urls.push(newEntry);
        return res.json(newEntry);
      }
    });
  } catch (error) {
    return res.json({ error: 'Invalid URL' });
  }
});

app.get('/api/shorturl/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const found = urls.find((item) => item.short_url === id);
  if (found) {
    res.redirect(found.original_url);
  } else {
    res.status(404).json({ error: 'No short URL found for given input' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
