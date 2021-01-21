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
import { first, last, notEmpty } from '../../shared/utils/ArrayUtils';
import { Exercise } from '../exercise/model/exercise';

const UNDERSCORE = '_';
const SLASH = '/';

interface ModulePlaceholder {
  name: string;
  value: string;
}

enum SectionType {
  GENERAL = 'general',
  TASK = 'task',
  FITNESS = 'fitness'
}

enum Module {
  TASKS = 'tasks',
  TIMETASK = 'timetask',
  SESSION = 'session',
  WEIGHT = 'weight'
}

@Component({
  selector: 'app-dashboard.',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public sections: Section[];
  public settings: Settings;

  public placeHolderArray: ModulePlaceholder[] = [];

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
    this.getDisplayableSections();
    this.getSettings();
    this.getTaskPlaceholder();
    this.getTimeTaskPlaceholder();
    this.getSessionPlaceholder();
    this.getWeightPlaceholder();
  }

  public goToUrl(section: string) {
    this.routerService.navigate([SLASH + section]);
  }

  private getDisplayableSections() {
    this.sections = this.keyService.getSections();
  }

  private getSettings() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = first(settings);
    });
  }

  private getTaskPlaceholder() {
    this.taskService.getTasks().subscribe((tasks) => {
      const value = tasks.filter((task) => task.pinned).length.toString();

      this.placeHolderArray.push({
        name: Module.TASKS,
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
        name: Module.TIMETASK,
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

        const lastTraining = last(timeTrainings);
        const value = (
          lastTraining.exercises
            .map((exercise: Exercise) => +exercise.repetitions)
            .reduce((sum: number, current: number) => sum + current, 0) +
          5 * lastTraining.exercises.length
        ).toString();

        this.placeHolderArray.push({
          name: Module.SESSION,
          value,
        });
      }
    });
  }

  private getWeightPlaceholder() {
    this.weightService.getAllWeights().subscribe((weights) => {
      if (notEmpty(weights)) {
        const lastWeight = last(weights);

        this.placeHolderArray.push({
          name: Module.WEIGHT,
          value: lastWeight.value,
        });
      }
    });
  }

  public buildDisplayableSectionMessage(section: Section) {
    if (this.placeHolderArray && notEmpty(this.placeHolderArray)
        && section.displaytext.includes(UNDERSCORE)
        && this.hasPlaceHolder(this.placeHolderArray, section)) {
      return section.displaytext.replace(UNDERSCORE, this.getModulePlaceHolderValue(this.placeHolderArray, section));
    } else if (!section.displaytext.includes(UNDERSCORE)) {
      return section.displaytext;
    }

    return 'No data available';
  }

  public getModulePlaceHolderValue(array: ModulePlaceholder[], section: Section): string {
    return first(
      array.filter((placeholder) => placeholder.name === section.name)
    ).value;
  }

  public hasPlaceHolder(array: ModulePlaceholder[], section: Section): boolean {
    return first(
      array.filter((placeholder) => placeholder.name === section.name)
     ) !== undefined;
  }

  public hasTaskType(section: Section): boolean {
    return section.type === SectionType.TASK;
  }

  public hasFitnessType(section: Section): boolean {
    return section.type === SectionType.FITNESS;
  }

  public hasGeneralType(section: Section): boolean {
    return section.type === SectionType.GENERAL;
  }
}
