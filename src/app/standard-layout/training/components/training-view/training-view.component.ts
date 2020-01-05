import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../services/training.service';
import { Training } from '../../model/training';
import { ActivatedRoute, Router } from '@angular/router';
import { Exercise } from '../../model/exercise';

@Component({
  selector: 'app-training-view',
  templateUrl: './training-view.component.html',
  styleUrls: ['./training-view.component.scss']
})
export class TrainingViewComponent implements OnInit {

  actualTraining: Training = {id:0, date: null, description:"", exercices: null};
  dataSource: Exercise[] = []
  displayedColumns: string[] = ['name', 'category', 'string'];
  constructor(private trainingService: TrainingService,  private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.getTrainingFromService();
   }

  getTrainingFromService(){
    this.route.params.subscribe(params => {
      this.trainingService.getTrainingByID(+params['id'])
      .subscribe(training => {
        this.actualTraining = training;  
        this.dataSource = this.actualTraining.exercices;
        console.log(this.dataSource);        
      });
    });
  }

  removeTraining(){
    this.route.params.subscribe(params => {
      this.trainingService.deleteTrainingByID(+params['id'])
      .subscribe(() => {
          this.gotoTraining();  
      })
    });
  }

  gotoTraining() {
    this.router.navigate(['/training']);
  }
}
