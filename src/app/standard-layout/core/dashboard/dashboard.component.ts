import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../shared/services/core/settings.service';
import { Settings } from '../settings/model/settings';
import { Router } from '@angular/router';
import { TaskService } from '../../shared/services/core/task.service';
import { TimeTaskService } from '../../shared/services/core/timetask.service';
import { TrainingService } from '../../shared/services/core/training.service';
import { WeightService } from '../../shared/services/core/weight.service';
import { Title } from '@angular/platform-browser';
import { TimeService } from '../../shared/services/utils/time.service';
import { KeyService } from '../../shared/services/utils/key.service';
import { Pattern } from '../../shared/model/Enums';
import { Section } from './model/section';

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
  public sections: Section[];
  public settings: Settings;

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
    this.getSections();
    this.getSettings();
    this.getTaskPlaceholder();
    this.getTimeTaskPlaceholder();
    this.getSessionPlaceholder();
    this.getWeightPlaceholder();
  }

  public goToUrl(section: string) {
    this.routerService.navigate(['/' + section]);
  }

  private getSections() {
    this.sections = this.keyService.getSections();
  }

  private getSettings() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings[0];
    });
  }

  private getTaskPlaceholder() {
    this.taskService.getTasks().subscribe((tasks) => {
      const value = tasks.filter((task) => task.pinned).length.toString();

      this.placeHolderArray.push({
        key: 'tasks',
        value,
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
            .map((exercise) => +exercise.repetitions)
            .reduce((sum, current) => sum + current, 0) +
          5 * training.exercises.length
        ).toString();

        this.placeHolderArray.push({
          key: 'session',
          value,
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
          value,
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

  public buildDisplayableMessage(section: Section) {
    let str = '';

    if (this.placeHolderArray && this.placeHolderArray.length > 0
        && section.displaytext.includes('_')
        && this.hasPlaceHolder(section.name)) {
      str = this.replacePlaceholder(section.displaytext, '_', this.getPlaceHolderValueFromKey(section.name));
    } else if (!section.displaytext.includes('_')) {
      str = section.displaytext;
    } else if (!this.hasPlaceHolder(section.name) && !this.isIgnoredModule(section.name)) {
      str = 'No data available';
    }

    return str;
  }

  public hasTaskType(section: Section): boolean {
    return section.type === 'task';
  }

  public hasFitnessType(section: Section): boolean {
    return section.type === 'fitness';
  }

  public hasGeneralType(section: Section): boolean {
    return section.type === 'general';
  }
}
