const express = require('express');
const Parser = require('rss-parser');
const path = require('path');

const app = express();
const parser = new Parser();

const FEED_URL = 'https://news.google.com/rss/search?q=Santa%20Vitoria%20do%20Palmar&hl=pt-BR&gl=BR&ceid=BR:pt-419';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/news', async (req, res) => {
  try {
    const feed = await parser.parseURL(FEED_URL);
    const items = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.contentSnippet,
      image: item.enclosure ? item.enclosure.url : null,
      source: item.source ? item.source.title : null
    }));
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
