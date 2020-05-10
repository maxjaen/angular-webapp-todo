# Presence

<br>

To use this project, the first step is to clone the project. Navigate to the directory of the app and create a new folder named `server`. A JSON file named `data.json` must then be created in this newly created folder. Then copy the subsequent template into the file you created earlier. In the last step, the development server and the JSON server must now be executed in separate terminals (see below). 


    {
    "exercises": [],
    "weights": [],
    "timetasks": [],
    "trainings": [],
    "tasks": [],
    "settings": [
    {
      "id": 0,
      "startpage": [
        {
          "name": "tasks",
          "symbol": "📚",
          "displaytext": "You have _ pinned task/s",
          "type": "task"
        },
        {
          "name": "timetask",
          "symbol": "⏰",
          "displaytext": "You have worked _ today",
          "type": "task"
        },
        {
          "name": "training",
          "symbol": "🏆",
          "displaytext": "Create or view your trainings",
          "type": "fitness"
        },
        {
          "name": "session",
          "symbol": "🏅",
          "displaytext": "Your previous workout session lasts _ seconds",
          "type": "fitness"
        },
        {
          "name": "weight",
          "symbol": "⚖️",
          "displaytext": "Your weight is currently _ kilograms",
          "type": "fitness"
        },
        {
          "name": "settings",
          "symbol": "⚙️",
          "displaytext": "Change whatever you want",
          "type": "general"
        }
      ],
      "settingsmenu": [
        {
          "name": "General",
          "settings": [
            {
              "displaytext": "Show Tasks module",
              "value": true
            },
            {
              "displaytext": "Show Fitness module",
              "value": true
            }
          ]
        },
        {
          "name": "Tasks",
          "settings": [
            {
              "displaytext": "Show status color",
              "value": false
            },
            {
              "displaytext": "Show creation date",
              "value": "false"
            },
            {
              "displaytext": "Enable history",
              "value": true
            }
          ]
        },
        {
          "name": "Timetasks",
          "settings": [
            {
              "displaytext": "Show total this week",
              "value": "false"
            },
            {
              "displaytext": "Show total today",
              "value": "false"
            },
            {
              "displaytext": "Show week number",
              "value": "false"
            },
            {
              "displaytext": "Enable history",
              "value": true
            }
          ]
        },
        {
          "name": "Session",
          "settings": [
            {
              "displaytext": "Play sound",
              "value": "false"
            }
          ]
        }
      ],
      "theme": {
        "name": "test",
        "colorprimary": "",
        "colorsecundary": ""
      }
    }
  ]
    }

<br/>

-----------------

<br/>


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.17.

## Development server

Run `ng serve -open` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## JSON Server

Run `json-server --watch server/data.json` for a json server. Navigate to `http://localhost:3000/`.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

