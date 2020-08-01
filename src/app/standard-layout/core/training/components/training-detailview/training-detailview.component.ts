import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../../../shared/services/core/training.service';
import { Training } from '../../model/training';
import { ActivatedRoute, Router } from '@angular/router';
import { Exercise } from '../../../exercise/model/exercise';
import { KeyService } from '../../../../shared/services/utils/key.service';

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
    private keyService: KeyService,
    private trainingService: TrainingService,
    private activeRouteService: ActivatedRoute,
    private RouterService: Router
  ) {}

  ngOnInit() {
    this.getTrainingFromService();
  }

  getTrainingFromService() {
    this.activeRouteService.params.subscribe((params) => {
      this.trainingService
        .getTrainingByID(+params['id'])
        .subscribe((training) => {
          this.actualTraining = training;
          this.dataSource = this.actualTraining.exercices;
        });
    });
  }

  removeTraining() {
    if (window.confirm(this.keyService.getString('a11'))) {
      this.activeRouteService.params.subscribe((params) => {
        this.trainingService.deleteTrainingByID(+params['id']).subscribe(() => {
          this.viewTraining();
        });
      });
    }
  }

  viewTraining() {
    this.RouterService.navigate(['/training']);
  }

  showDatestring(date: Date): string {
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
