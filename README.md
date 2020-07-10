# Presence



##  Inspiration

The current application was developed in order to accomplish tasks and obligations in everyday life as easily, quickly and efficiently as possible. 

The range of functions therefore goes from the simple creation of a task, through personal time recording to the presentation and analysis of data from the fitness sector. If necessary, this information is provided by means of appropriate visualization options. 

<br>

Note on the project
- The technology stack moves only in the areas of Typescript, HTML, SCSS. Other technologies were deliberately not used in the current system. 
- Since this is a pure hobby project of mine, commit messages and the code quality were not always put into focus by me - this lies mainly in the generation of new functions. 
  - If, on the other hand, I work professionally in a project, then the code quality and a strong project team are in the foreground, where everyone contributes his or her share for the common higher goal. 
- I was particularly inspired by [here](https://symmetricstrength.com/), [here](https://www.reddit.com/r/productivity/comments/eg9tf9/) and [here](https://www.youtube.com/watch?v=nH0oO1aWpSs) in this project. 
- The use of code snippets is not permitted for commercial use.

<br>

Installation (step by step)

1. Install npm
```
Available for linux, windows, mac...
```

2. Install Angular
```
npm install -g @angular/cli
```


3. Install json-server

```
npm install -g json-server
```
4. Clone the project to your local directory

```
git clone https://github.com/maxjaen/project_presence.git
```

5. Install dependencies in directory

```
npm install
```

The development server and the JSON server must now be executed in separate terminals (see below). 

<br>

<hr>

<br>

## Development server

Run `ng serve -open` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## JSON Server

Run `json-server --watch server/example.json` for a json server. Navigate to `http://localhost:3000/`.

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

