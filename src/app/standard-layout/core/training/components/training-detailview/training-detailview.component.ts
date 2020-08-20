import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../../../shared/services/core/training.service';
import { Training } from '../../model/training';
import { ActivatedRoute, Router } from '@angular/router';
import { Exercise } from '../../../exercise/model/exercise';
import { KeyService } from '../../../../shared/services/utils/key.service';
import { ExerciseService } from 'src/app/standard-layout/shared/services/core/exercise.service';

@Component({
  selector: 'app-training-detailview',
  templateUrl: './training-detailview.component.html',
  styleUrls: ['./training-detailview.component.scss'],
})
export class TrainingDetailViewComponent implements OnInit {
  actualTraining: Training;
  dataSource: Exercise[] = [];
  displayedColumns: string[] = ['name', 'category', 'string'];

  constructor(
    public exerciseService: ExerciseService,
    private keyService: KeyService,
    private trainingService: TrainingService,
    private activeRouteService: ActivatedRoute,
    private RouterService: Router
  ) {}

  ngOnInit() {
    this.getTraining();
  }

  private getTraining() {
    this.activeRouteService.params.subscribe((params) => {
      this.trainingService
        .getTrainingByID(+params['id'])
        .subscribe((training) => {
          this.actualTraining = training;
          this.dataSource = this.actualTraining.exercises;
        });
    });
  }

  public removeTraining() {
    if (window.confirm(this.keyService.getKeyTranslation('a11'))) {
      this.activeRouteService.params.subscribe((params) => {
        this.trainingService.deleteTrainingByID(+params['id']).subscribe(() => {
          this.viewDetailedTraining();
        });
      });
    }
  }

  public viewDetailedTraining() {
    this.RouterService.navigate(['/training']);
  }

  public showDateString(date: Date): string {
    const tempDate: Date = new Date(date);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return tempDate.toLocaleDateString('de-DE', options);
  }
}
