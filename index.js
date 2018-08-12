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

    //Set address data
    weather_data.formatted_address = response.data.results[0].formatted_address;

    //Prepare URL to DarkSky to get weather, then call the API using Axios
    var darkSkyUrl = `https://api.darksky.net/forecast/bf0082ec3476ce838caddf0d89587967/${lat},${lng}?units=si`;
    var openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&APPID=b6be8e9fc8e14d5e8d29e69749cfe204`;

    console.log(response.data.results[0].formatted_address);
    return axios.all([axios.get(darkSkyUrl), axios.get(openWeatherUrl)])
  }).then(axios.spread((response, openWeather) => {


    var address = weather_data.formatted_address;
    var darkSkyIconId = response.data.currently.icon;
    var openWeatherIconId = openWeather.data.weather[0].icon;

    console.log(response.data.currently.temperature);

    //Take response from DarkSky and extract key info
    var darkSkyBlob = {
      source: "DarkSky",
      icon_id: darkSkyIconId,
      icon: icons.darkSky[darkSkyIconId],
      address: weather_data.formatted_address,
      temperature: Math.round(response.data.currently.temperature * 10)/10,
      summary: response.data.currently.summary,
    };

    //Take response from OpenWeather and extract key info
    var openWeatherBlob = {
      source: "OpenWeather",
      icon_id: openWeatherIconId,
      icon: icons.openWeather[openWeatherIconId],
      address: weather_data.formatted_address,
      temperature: Math.round(openWeather.data.main.temp * 10)/10,
      summary: openWeather.data.weather[0].main,
    };

    console.log(openWeatherBlob.temperature);
    console.log(openWeatherBlob.icon_id);
    console.log(openWeatherBlob.summary);

    //Formula to decide rank of sites (this is pretty basic for now)
    var siteRank = {};
    if(darkSkyBlob.icon_id === "rain"){
      siteRank.firstResult = openWeatherBlob;
      siteRank.secondResult = darkSkyBlob;
    } else if(openWeatherBlob.icon_id === "09d"){
      siteRank.firstResult = darkSkyBlob;
      siteRank.secondResult = openWeatherBlob;
    } else if(openWeatherBlob.icon_id === "09n"){
      siteRank.firstResult = darkSkyBlob;
      siteRank.secondResult = openWeatherBlob;
    } else if(openWeatherBlob.icon_id === "10d"){
      siteRank.firstResult = darkSkyBlob;
      siteRank.secondResult = openWeatherBlob;
    } else if(openWeatherBlob.icon_id === "10n"){
      siteRank.firstResult = darkSkyBlob;
      siteRank.secondResult = openWeatherBlob;
    } else if(openWeatherBlob.icon_id === "11d"){
      siteRank.firstResult = darkSkyBlob;
      siteRank.secondResult = openWeatherBlob;
    } else if(openWeatherBlob.icon_id === "11n"){
      siteRank.firstResult = darkSkyBlob;
      siteRank.secondResult = openWeatherBlob;
    } else if(darkSkyBlob.temperature >= openWeatherBlob.temperature){
      siteRank.firstResult = darkSkyBlob;
      siteRank.secondResult = openWeatherBlob;
    } else {
      siteRank.firstResult = openWeatherBlob;
      siteRank.secondResult = darkSkyBlob;
    };

    //Push the key information through to the templating engine / browser
    res.render('index', {
      address: address,
      firstResult: siteRank.firstResult,
      secondResult: siteRank.secondResult,
      error: null,
    });

    //Any errors should be caught here
  })).catch((e) => {

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

//Setting up icons

var icons = {
  darkSky: {
    'clear-day': '/images/sun.svg',
    'clear-night': '/images/moon.svg',
    'rain': '/images/umbrella.svg',
    'snow': '/images/snowflake.svg',
    'sleet': '/images/cloud-hail.svg',
    'wind': '/images/wind.svg',
    'fog': '/images/cloud-fog.svg',
    'cloudy': '/images/cloud.svg',
    'partly-cloudy-day': '/images/cloud-sun.svg',
    'partly-cloudy-night': '/images/cloud-moon.svg',
  },
  'openWeather': {
    '01d': '/images/sun.svg',
    '02d': '/images/cloud-sun.svg',
    '03d': '/images/cloud.svg',
    '04d': '/images/cloud.svg',
    '09d': '/images/umbrella.svg',
    '10d': '/images/umbrella.svg',
    '11d': '/images/umbrella.svg',
    '13d': '/images/snowflake.svg',
    '50d': '/images/cloud-fog.svg',
    '01n': '/images/moon.svg',
    '02n': '/images/cloud-moon.svg',
    '03n': '/images/cloud-moon.svg',
    '04n': '/images/cloud.svg',
    '09n': '/images/umbrella.svg',
    '10n': '/images/umbrella.svg',
    '11n': '/images/umbrella.svg',
    '13n': '/images/snowflake.svg',
    '50n': '/images/cloud-fog.svg',
  },
};
