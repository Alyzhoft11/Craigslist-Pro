const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();

app.use(cors());
app.use(morgan('tiny'));

function getStateResults(body) {
    const $ = cheerio.load(body);
    const cities = $('ul.geo-site-list li');
    const cityNames = [];

    cities.each((index, element) => {
        const city = $(element);
        const name = city.text();
        const url = city.find('a').attr('href');

        cityNames.push({
            name,
            url
        });
    });
    return cityNames
}

function getResults(body) {
    const $ = cheerio.load(body);
    const rows = $('li.result-row');
    const results = [];

    rows.each((index, element) => {
        const result = $(element);
        const title = result.find('.result-title').text();
        const link = result.find('.result-title').attr('href');
        const date = result.find('.result-date').text();
        const price = $(result.find('.result-price').get(0)).text();
        let location = result.find('.result-hood').text()
            if (location){
                location = location.match(/\((.*)\)/)[1];
            }
        const imageData = result.find('a.result-image').attr('data-ids');
        let images = [];
        if (imageData) {
            const parts = imageData.split(',');
            images = parts.map((id) => {
                return `https://images.craigslist.org/${id.split(':')[1]}_300x300.jpg`;
            });
        }
        results.push({
            title,
            link,
            date,
            price,
            location,
            price,
            images
        });
    });
    return results;
}

app.get('/', (req, res) => {
    res.json({
        message: 'Hello World'
    });
});

app.get('/search/:location/:search_term', (req, res) => {
    const { location, search_term } = req.params;
    const url = `https://${location}.craigslist.org/search/sss?query=${search_term}&sort=rel`
    fetch(url)
        .then(res => res.text())
        .then(body => {
            const results = getResults(body);
            res.json({
                results
            });
        });
});

app.get('/search/:state', (req, res) => {
    const { state } = req.params;
    const url = `https://geo.craigslist.org/iso/us/${state}`
    fetch(url)
        .then(res => res.text())
        .then(body => {
            const results = getStateResults(body);
            res.json({
                results
            })
        });
});

app.use((req, res, next) => {
    const error = new Error('Not Found');
    res.status(404);
    next(error);
});

app.use((error, req, res, next) => {
    res.status(res.statusCode || 500);
    res.json({
        message: error.message
    });
});

app.listen(5000, () => {
    console.log('listening on port 5000');
});
