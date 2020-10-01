import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../shared/services/core/settings.service';
import { Settings } from '../settings/model/settings';
import { startPageSetting } from '../settings/model/start-page-setting';
import { Router } from '@angular/router';
import { TaskService } from '../../shared/services/core/task.service';
import { TimeTaskService } from '../../shared/services/core/timetask.service';
import { TrainingService } from '../../shared/services/core/training.service';
import { WeightService } from '../../shared/services/core/weight.service';
import { Title } from '@angular/platform-browser';
import { TimeService } from '../../shared/services/utils/time.service';
import { KeyService } from '../../shared/services/utils/key.service';
import { Pattern } from '../../shared/model/Enums';

interface KeyValuePair {
  key: string;
  value: string;
}

@Component({
  selector: 'app-dashboard.',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public settings: Settings[] = [];

  public placeHolderArray: KeyValuePair[] = [];
  private ignoreModules: string[] = ['settings', 'training', 'exercise'];

  constructor(
    public settingsService: SettingsService,
    private taskService: TaskService,
    private timeTaskService: TimeTaskService,
    private trainingService: TrainingService,
    private weightService: WeightService,
    private tabTitleService: Title,
    private timeService: TimeService,
    private routerService: Router,
    private keyService: KeyService
  ) {
    this.tabTitleService.setTitle(this.keyService.getKeyTranslation('d1'));
  }

  ngOnInit(): void {
    this.getSettings();
    this.getTaskPlaceholder();
    this.getTimeTaskPlaceholder();
    this.getSessionPlaceholder();
    this.getWeightPlaceholder();
  }

  public goToUrl(component: startPageSetting) {
    this.routerService.navigate(['/' + component.name]);
  }

  private getSettings() {
    this.settingsService.getSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }

  private getTaskPlaceholder() {
    this.taskService.getTasks().subscribe((tasks) => {
      const value = tasks.filter((task) => task.pinned).length.toString();

      this.placeHolderArray.push({
        key: 'tasks',
        value: value,
      });
    });
  }

  private getTimeTaskPlaceholder() {
    this.timeTaskService.getTimeTasks().subscribe((timeTasks) => {
      const value = timeTasks
        .filter(
          (timeTaskData) =>
            this.timeTaskService.isToday(timeTaskData) &&
            this.timeTaskService.isValid(timeTaskData)
        )
        .map((validTimeTasks) =>
          this.timeTaskService.extractTimeBetweenStartAndEnd(validTimeTasks)
        )
        .reduce((a, b) => a + b, 0);

      this.placeHolderArray.push({
        key: 'timetask',
        value: this.timeService.formatMillisecondsToString(value).toString(),
      });
    });
  }

  private getSessionPlaceholder() {
    this.trainingService.getTrainings().subscribe((trainings) => {
      if (trainings.length > 0) {
        const timeTrainings = trainings.filter((trainingData) =>
          trainingData.exercises.every(
            (exercise) => exercise.category === Pattern.CONDITIONAL1
          )
        );

        const training = timeTrainings[timeTrainings.length - 1];
        const value = (
          training.exercises
            .map((exercise) => +exercise['repetitions'])
            .reduce((sum, current) => sum + current, 0) +
          5 * training.exercises.length
        ).toString();

        this.placeHolderArray.push({
          key: 'session',
          value: value,
        });
      }
    });
  }

  private getWeightPlaceholder() {
    this.weightService.getAllWeights().subscribe((weights) => {
      if (weights.length > 0) {
        const value = weights[weights.length - 1].value.toString();

        this.placeHolderArray.push({
          key: 'weight',
          value: value,
        });
      }
    });
  }

  /**
   * Get value from element in placeholder array
   * @param key to identify an specific element from the array
   */
  public getPlaceHolderValueFromKey(key: string): string {
    return this.placeHolderArray.filter(
      (placeholder) => placeholder.key === key
    )[0].value;
  }

  /**
   * Checks if element is in placeholder array and not undefined
   * @param key to identify an specific element from the array
   */
  public hasPlaceHolder(key: string): boolean {
    return (
      this.placeHolderArray.filter(
        (placeholder) => placeholder.key === key
      )[0] !== undefined
    );
  }

  /**
   * Checks if an argument of type string is an ignored module
   * @param str check if ignore module
   */
  public isIgnoredModule(str: string) {
    return this.ignoreModules.indexOf(str) > -1;
  }

  /**
   * Replace characters in a string
   * @param word where you want to replace characters
   * @param from character
   * @param to character
   */
  public replacePlaceholder(word: string, from: string, to: string) {
    return word.replace(from, to);
  }
}
