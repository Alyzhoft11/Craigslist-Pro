const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

// async function test(requests){
//     let Temp = [];
//     let multiResults = [];
//     multiResults = await Promise.all(requests)
//                         .then(responses => responses.forEach(
//                             response => response.text()
//                             .then(body => {
//                                 const results = getResults(body);
//                                 Temp.push(...results);
//                             })));
//     return multiResults
// }

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

app.post('/search/:search_term', (req, res) => {
    const { search_term } = req.params;
    const urlData = req.body.url;
    // let multiResults = [];


    if (urlData.length > 1) {        
        const fullURLData = urlData.map(url => `${url}/search/sss?query=${search_term}&sort=rel`)
        let requests = fullURLData.map(url => fetch(url));

        async function getAllResults(fullURLData, callback) {
            let multiResults = []; 
            for (let i = 0; i < fullURLData.length; i++) {
                let data = await fetch(fullURLData[i])
                    .then(res => res.text())
                    .then(body => {
                        const results = getResults(body);
                        return results
                    });
                multiResults.push(...data);
            }
            callback(multiResults);
        }

        function respond(resultData){
            res.json({
                resultData
            });
        }

        getAllResults(fullURLData, respond);        

        // Promise.all(requests)
        //     .then(responses => responses.forEach(
        //         response => response.text()
        //         .then(body => {
        //             const results = getResults(body);
        //             multiResults.push(...results);
        //             i++
        //             if(i == requests.length) {
        //                 res.json({
        //                     multiResults
        //                 });
        //             };                   
        //         })));          
    } else {
        const locationURL = req.body.url.url
        const url = `${locationURL}/search/sss?query=${search_term}&sort=rel`
        fetch(url)
            .then(res => res.text())
            .then(body => {
                const results = getResults(body);
                res.json({
                    results
                });
            });
    }
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

});
