const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

let urlDatabase = [];
let id = 1;

function isValidUrl(url) {
  const regex = /^(http|https):\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/i;
  return regex.test(url);
}

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  let found = urlDatabase.find(item => item.original_url === originalUrl);
  if (found) {
    return res.json(found);
  }

  const newEntry = { original_url: originalUrl, short_url: id++ };
  urlDatabase.push(newEntry);

  res.json(newEntry);
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  const entry = urlDatabase.find(item => item.short_url === shortUrl);

  if (!entry) {
    return res.json({ error: 'No short URL found for given input' });
  }

  res.redirect(entry.original_url);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('App listening on port ' + listener.address().port);
});
