const express = require('express');
const axios = require('axios');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const app = express();

//Port set up, has to be dynamic for heroku
var port = process.env.PORT || 3000;

//These set up middleware, our templating engine (Handlebars) and allow Express to access public files in the browser (CSS and images)
app.use(bodyParser.urlencoded({extended: true})); //Not quite sure how body-parser line works, type of Middleware that allows you to extra data from response objects e.g. req.body.address
app.use(express.static('public'));
app.set('view engine', 'hbs');

//Initial index page
app.get('/', function (req, res) {
  res.render('index')
});

//What happens when user posts (i.e. submits an address)
app.post('/', function(req, res) {

  //Take input address from browser, encodes it as a URL ready to call via API
  var address = req.body.address;
  var weather_data = {};
  var apiQuery = encodeURIComponent(address);
  var geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBqDhTbhw6tdOVrLVK55PXXTX-8TsCjgcE&address=${apiQuery}`;

  //Call google API
  axios.get(geocodeURL).then((response) => {
    //this automatically calls, you could call response anything you want
    if(response.data.status === 'ZERO_RESULTS') {
      throw new Error('Unable to find that address.');
    }

    //Extract lat lng results from the Google API call
    var lat = response.data.results[0].geometry.location.lat;
    var lng = response.data.results[0].geometry.location.lng;
    weather_data.formatted_address = response.data.results[0].formatted_address;

    //Prepare URL to DarkSky to get weather, then call the API using Axios
    var weatherUrl = `https://api.darksky.net/forecast/bf0082ec3476ce838caddf0d89587967/${lat},${lng}?units=si`;
    console.log(response.data.results[0].formatted_address);
    return axios.get(weatherUrl);
  }).then((response) => {

    //Take response from DarkSky and extract key info
    var icon = response.data.currently.icon;
    var temperature = Math.round(response.data.currently.temperature);
    var summary = response.data.currently.summary;
    var apparentTemperature = `Feels like ${Math.round(response.data.currently.apparentTemperature)}`;
    console.log(apparentTemperature);

    //Push the key information through to the templating engine / browser
    res.render('index', {
      success: {
        source: "DarkSky",
        icon: "/images/sun.svg",
        address: weather_data.formatted_address,
        temperature: temperature,
        summary: summary,
        apparentTemperature: apparentTemperature,
      },
      error: null,
    });

    //Any errors should be caught here
  }).catch((e) => {

    if (e.code === 'ENOTFOUND') {
      console.log('Unable to connect to API servers.');
      res.render('index', {success: null, error: 'Unable to connect to API servers.'});
    } else {
      console.log(e.message);
      res.render('index', {success: null, error: e.message});
    }
  });
  console.log('made it');
});

app.listen(port, function () {
  console.log('Our app is running on http://localhost:' + port)
});

/*
var icons {
  'darkSky': {
    'clear-day':
    'clear-night':
    'rain':
    'snow':
    'sleet':
    'wind':
    'fog':
    'cloudy':
    'partly-cloudy-day':
    'partly-cloudy-night':
  },
  'openWeather': {

  },
}
*/
