import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TasksComponent } from './standard-layout/core/tasks/tasks.component';
import { TimeTaskComponent } from './standard-layout/core/timetask/timetask.component';
import { TrainingOverViewComponent } from './standard-layout/core/training/training-overview.component';
import { TrainingDetailViewComponent } from './standard-layout/core/training/components/training-detailview/training-detailview.component';
import { WeightComponent } from './standard-layout/core/weight/weight.component';
import { DashboardComponent } from './standard-layout/core/dashboard/dashboard.component';
import { SessionComponent } from './standard-layout/core/session/session.component';
import { SettingsComponent } from './standard-layout/core/settings/settings.component';
import { ExerciseOverViewComponent } from './standard-layout/core/exercise/exercise-overview.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'tasks',
    component: TasksComponent,
  },
  {
    path: 'training',
    component: TrainingOverViewComponent,
  },
  {
    path: 'training/:id',
    component: TrainingDetailViewComponent,
  },
  {
    path: 'exercise',
    component: ExerciseOverViewComponent,
  },
  {
    path: 'timetask',
    component: TimeTaskComponent,
  },
  {
    path: 'weight',
    component: WeightComponent,
  },
  {
    path: 'session',
    component: SessionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
