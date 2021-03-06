#!/usr/bin/env node

var https = require("https"),
    figlet = require("figlet"),
    clear = require("clear"),
    cities = require("cities"),
    chalk = require("chalk"),
    prompt = require("prompt");

var art;

figlet('CLI mate', function (err, fig) {
    if (err) {
        console.log('Something went wrong with figlet...');
        console.dir(err);
        return;
    }
    art = fig;
});

function evaluatePrompt() {
    prompt.get(['zipcode'], function (err, result) {
        var zip = result.zipcode;
        var city = cities.zip_lookup(zip);

        if (city != null) {
            requester(zip, city.latitude, city.longitude);
        } else {
            restart();
        }
    });
}

function restart() {
    console.log("Please enter a valid zip code.");
    console.log("");
    evaluatePrompt();
}

function requester(zip, latitude, longitude) {
    var request = https.get('https://api.forecast.io/forecast/2a65c574d33b0f4ea0c5dda6b777c91c/' + latitude + ',' + longitude, function (response) {
        var body = "";
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            if (response.statusCode === 200) {
                try {
                    var data = JSON.parse(body);
                    printer(data, zip);
                } catch (error) {
                    console.error(error.message);
                }
            } else {
                console.error("Oh no! Error " + response.statusCode);
            }
        });
    });
    request.on("error", function (error) {
        console.error(error.message);
    });
}

function printer(data, zip) {
    clear();
    console.log(art);
    console.log(chalk.inverse(" " + cities.zip_lookup(zip).city + ", " + cities.zip_lookup(zip).state_abbr + " " + zip + " "));
    console.log(data.currently.summary + " and " + chalk.red(data.currently.temperature + "\u00b0F"));
    console.log("Feels like " + chalk.yellow(data.currently.apparentTemperature + "\u00b0F"));
    console.log("Humidity: " + chalk.blue(data.currently.humidity));
    console.log("Wind: " + chalk.magenta(data.currently.windSpeed) + " bearing " + chalk.magenta("\u00b0" + data.currently.windBearing));
    console.log("");
    console.log(chalk.cyan(data.daily.summary));
    console.log("");
    console.log(chalk.inverse(" Tomorrow "));
    console.log("High: " + chalk.red(data.daily.data[0].temperatureMax + "\u00b0F"));
    console.log("Low: " + chalk.yellow(data.daily.data[0].temperatureMin + "\u00b0F"));
    console.log("Precip: " + chalk.blue(Math.round(data.daily.data[0].precipProbability * 100) + "%"));
    console.log("");
}

prompt.start();
evaluatePrompt();
