import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TasksComponent } from './standard-layout/tasks/tasks.component';
import { TrainingComponent } from './standard-layout/training/exercise.component';
import { DashboardComponent } from './basic-layout/dashboard/dashboard.component';
import { TimeTaskComponent } from './standard-layout/timetask/timetask.component';
import { TrainingViewComponent } from './standard-layout/training/components/training-view/training-view.component';

const routes: Routes = [
  {
    path: '', component: TasksComponent
  },
  {
    path: 'tasks', component: TasksComponent
  },
  { 
    path: 'training', component: TrainingComponent 
  },
  { 
    path: 'training/:id', component: TrainingViewComponent 
  },
  { 
    path: 'zeiterfassung', component: TimeTaskComponent 
  },
  { 
    path: 'overview', component: DashboardComponent 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
