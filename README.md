# README

This is an app that returns an optimistic forecast.

Below are my notes on what I learned on this project.

___

### My learnings on this project

#### Initialise node project
[Setting up the weather app project](https://codeburst.io/build-a-weather-website-in-30-minutes-with-node-js-express-openweather-a317f904897b)
[Useful overview of a basic Node Express site](https://shapeshed.com/creating-a-basic-site-with-node-and-express/)

`npm init`

Make a file called `server.js`

#### You can use express-generator to set it all up
[Setting up an express project, using express-generator](https://expressjs.com/en/starter/generator.html)

* This will create a shell repository, with css and the templating engine you want
* Look at the express docs to get the command line you need to type to install
* Templating engines look like regular HTML, but they allow you to embed data from the app

#### How to install packages
Packages could be for anything. I like Axios which makes API requests and handles the responses asynchronously (using promises)

`npm install --save [something]`

#### How to install nodemon, so your code refreshes
`npm install nodemon`

#### Set up a dynamic port

Dynamic ports are required because Heroku dynamically sets the port. If we specify a port (as tutorials often tell you to do), it'll break in production:

```
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
```

[More info here.](https://scotch.io/tutorials/how-to-deploy-a-node-js-app-to-heroku)

#### How to run the app

Either:
1. `node server.js` or
2. `DEBUG=folder-name:* nodemon` or
3. `DEBUG=folder-name npm start`

#### Initialise git repo

```
git init
echo 'node_modules' > .gitignore
git add .
git commit -m 'initial commit'
```

#### Routes

[Routing allows you to get information and render it on a particular page of the site.](https://shapeshed.com/creating-a-basic-site-with-node-and-express/)

I'm trying to understand the difference between router.get and app.get:
[This is a great explanation of routing.](https://stackoverflow.com/questions/28305120/differences-between-express-router-and-app-get)


##### Middleware

[This is a high level summary of Middleware](https://expressjs.com/en/guide/writing-middleware.html). "Middleware functions are functions that have access to the request object (req), the response object (res), and the next function in the application’s request-response cycle"

Body-parser allows you to make use of key-value pairs in the req-body object:

`npm install body-parser --save`

This is how you get body-parser to work:
```
const bodyParser = require('body-parser');
// ...
// ...
app.use(bodyParser.urlencoded({ extended: true }));
```

Then we want to use this to parse out the JSON:
```
app.post('/', function (req, res) {
  res.render('index');
  console.log(req.body.city);
})
```
#### Using static assets

To get css and images into your project, Express has something built in to help. Otherwise calls like `http://localhost:3000/images/kitten.jpg` just wouldn't work. To get it up and running:

`app.use(express.static('public'))``

#### git

```
git status
git add <file> or git add .
git commit -m "explanation"
git push
```

The first time you do this (if you haven't made the local repository):
```
echo "# optimistic-weather" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin git@github.com:richardcadman/optimistic-weather.git
git push -u origin master
```

If you've already got a local repository:
```
git remote add origin git@github.com:richardcadman/optimistic-weather.git
git push -u origin master
```

#### Heroku

If you install the command line tools to create a site on Heroku and publish it. [Here's helpful again](https://shapeshed.com/creating-a-basic-site-with-node-and-express/).

```
heroku apps:create
git push heroku master
```
Check it's running with:

`heroku ps:scale web=1`

If heroku doesn't run, your `package.json` file probably isn't pointing to the right `.js` file. [You can use](https://scotch.io/tutorials/how-to-deploy-a-node-js-app-to-heroku):

`web: node server.js`

Or, dive into your package.json file and add a 'start' under 'scripts'.

You can then open with:

`$ heroku open`
