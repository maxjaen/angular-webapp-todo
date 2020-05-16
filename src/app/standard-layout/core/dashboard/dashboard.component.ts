import { Component, OnInit } from "@angular/core";
import { SettingsService } from "../settings/services/settings.service";
import { Settings } from "../settings/model/settings";
import { StartPageSetting } from "../settings/model/start-page-setting";
import { Router } from "@angular/router";
import { TaskService } from "../tasks/services/task.service";
import { TimeTaskService } from "../timetask/services/timetask.service";
import { UtilityService } from "../../shared/services/utility.service";
import { TrainingService } from "../training/services/training.service";
import { WeightService } from "../weight/services/weight.service";
import { Title } from "@angular/platform-browser";

interface KeyValuePair {
  key: string;
  value: string;
}

@Component({
  selector: "app-dashboard.",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  settings: Settings[] = [];
  placeHolderArray: KeyValuePair[] = [];
  ignoreModules: string[] = ["settings", "training"];

  constructor(
    private settingsService: SettingsService,
    private taskService: TaskService,
    private timeTaskService: TimeTaskService,
    private trainingService: TrainingService,
    private weightService: WeightService,
    private _tabTitle: Title,
    private _utilityService: UtilityService,
    private _router: Router
  ) {
    this._tabTitle.setTitle("Home");
  }

  ngOnInit(): void {
    this.getSettingsFromService();
    this.getTaskPlaceholderFromService();
    this.getTimeTaskPlaceholderFromService();
    this.getSessionPlaceholderFromService();
    this.getWeightPlaceholderFromService();

    console.log(this.placeHolderArray);
  }

  goToUrl(component: StartPageSetting) {
    this._router.navigate(["/" + component.name]);
  }

  // Get all settings from service
  getSettingsFromService() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  getTaskPlaceholderFromService() {
    this.taskService.getAllTasks().subscribe((tasks) => {
      let element: KeyValuePair = {
        key: "tasks",
        value: tasks.filter((task) => task.pinned).length.toString(),
      };

      this.placeHolderArray.push(element);
    });
  }

  getTimeTaskPlaceholderFromService() {
    this.timeTaskService.getAllTimeElements().subscribe((timetasks) => {
      let tempValue = 0;

      if (timetasks.length > 0) {
        tempValue = timetasks
          .filter((e) => {
            let startdate: Date = new Date(e.startdate);
            let now: Date = new Date();

            if (
              startdate.getDate() == now.getDate() &&
              startdate.getMonth() == now.getMonth() &&
              startdate.getFullYear() == now.getFullYear()
            ) {
              return true;
            }
            return false;
          })
          .map(
            (filteredData) =>
              new Date(filteredData.enddate).getTime() -
              new Date(filteredData.startdate).getTime()
          )
          .reduce((a, b) => a + b, 0);
      }

      let element: KeyValuePair = {
        key: "timetask",
        value: this.millisecondsToTimestring(tempValue).toString(),
      };

      this.placeHolderArray.push(element);
    });
  }

  getSessionPlaceholderFromService() {
    this.trainingService.getAllTrainings().subscribe((trainings) => {
      if (trainings.length > 0) {
        let timetrainings = trainings.filter((training) =>
          training.exercices.every(
            (exercise) => exercise.category == "conditionalpattern1d"
          )
        );

        let training = timetrainings[timetrainings.length - 1];

        let element: KeyValuePair = {
          key: "session",
          value: (
            training.exercices
              .map((exercise) => +exercise["repetitions"])
              .reduce((sum, current) => sum + current, 0) +
            5 * training.exercices.length
          ).toString(),
        };
        this.placeHolderArray.push(element);
      }
    });
  }

  getWeightPlaceholderFromService() {
    this.weightService.getAllWeights().subscribe((weights) => {
      if (weights.length > 0) {
        let element: KeyValuePair = {
          key: "weight",
          value: weights[weights.length - 1].value.toString(),
        };

        this.placeHolderArray.push(element);
      }
    });
  }

  getPlaceHolderValueFromKey(key: string) {
    return this.placeHolderArray.filter((e) => e.key == key)[0].value;
  }

  hasPlaceHolder(key: string) {
    return this.placeHolderArray.filter((e) => e.key == key)[0] != undefined;
  }

  isIgnoredModule(str: string) {
    return this.ignoreModules.indexOf(str) > -1;
  }

  replacePlaceholder(word: string, from: string, to: string) {
    return word.replace(from, to);
  }

  // Create time view string from milliseconds
  millisecondsToTimestring(milliseconds: number): string {
    let seconds: any = Math.floor((milliseconds / 1000) % 60);
    let minutes: any = Math.floor((milliseconds / (1000 * 60)) % 60);
    let hours: any = Math.floor(milliseconds / (1000 * 60 * 60));
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }
}
