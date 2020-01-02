# Presence

* `ng serve --open` to start the new angular app

<br/>

## Start des Projektes

1. Suche Projektpfad aus: `cd ...`

2. Erstelle neues Projekt: `ng new presence`
    + routing: yes
    + stylesheet: scss

3. Füge Angular Material zum Projekt hinzu: `ng add @angular/material`
    + theme: purple/green
    + gesture recognition: no
    + browser animations: yes
  
4. Erstelle Modul "basic-layout": `ng generate m basic-layout`

5. Füge Angular Material Komponenten zum Modul "basic-layout" hinzu
   1. `ng generate @angular/material:nav basic-layout/nav`
   2. `ng generate @angular/material:dashboard basic-layout/dashboard`

6. Exportiere die Komponenten "NavComponent" und "DashboardComponent" aus dem Modul "basic-layout" um sie in anderen Modulen verfügbar zu machen
   
7. Importiere das Modul "basic-layout" im Modul "app-component"
   
8. Binde den HTML-Tag der NavComponent in app.component.html ein

9. Binde den HTML-Tag der DashboardComponent in nav.component.html ein

<br/>

## JSON Server hinzufügen

1. `sudo npm install -g json-server`

2. Server starten: `json-server --watch server/data.json`

# Router

1. Neue Routes in app-routing.module.ts hinzufügen

        const routes: Routes = [
        {
            path: '', component: NavComponent
        },
        {
            path: 'tasks', component: TasksComponent
        },
        { 
            path: 'training', component: TrainingComponent 
        }
        ];

3. RouterOutlet in Navbar einbinden

        <router-outlet></router-outlet>

4. Links in Sidebar für Router anpassen

         <a mat-list-item href="tasks">Tasks</a>

# Links

1. https://www.w3schools.com/jsref/dom_obj_event.asp

# Angular Material Style Scheme

 * https://medium.com/wineofbits/how-to-change-angular-material-theme-in-just-5-minutes-d8719d1f026
 * angular.json + restart >>


        "styles": [
            "./node_modules/@angular/material/prebuilt-themes/purple-green.css",
            "src/styles.scss"
        ],


<br/>

-----------------

## HAVE FUN!

-----------------

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

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

