import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TasksComponent } from './standard-layout/tasks/tasks.component';
import { TrainingComponent } from './standard-layout/training/exercise.component';
import { DashboardComponent } from './basic-layout/dashboard/dashboard.component';
import { ZeiterfassungComponent } from './standard-layout/zeiterfassung/zeiterfassung.component';


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
    path: 'zeiterfassung', component: ZeiterfassungComponent 
  },
  { 
    path: 'overview', component: DashboardComponent 
  }
];
// TODO Routerlink für Training Detailseite ergänzen

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
