const yargs = require('yargs');
const axios = require('axios');

var apiQuery = encodeURIComponent(address);
var geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBqDhTbhw6tdOVrLVK55PXXTX-8TsCjgcE&address=${apiQuery}`;

axios.get(geocodeURL).then((response) => {
  //this automatically calls, you could call response anything you want
  if(response.data.status === 'ZERO_RESULTS') {
    throw new Error('Unable to find that address.');
  }
  var lat = response.data.results[0].geometry.location.lat;
  var lng = response.data.results[0].geometry.location.lng;

  var weatherUrl = `https://api.darksky.net/forecast/bf0082ec3476ce838caddf0d89587967/${lat},${lng}?units=si`;
  console.log(response.data.results[0].formatted_address);
  return axios.get(weatherUrl);
}).then((response) => {
  var temperature = response.data.currently.temperature;
  var apparentTemperature = response.data.currently.apparentTemperature;
  console.log(`It's currently ${temperature} but feels like ${apparentTemperature}`);
}).catch((e) => {
  if (e.code === 'ENOTFOUND') {
    console.log('Unable to connect to API servers.')
  } else {
    console.log(e.message);
  }
});
