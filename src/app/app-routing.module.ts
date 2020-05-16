import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TasksComponent } from "./standard-layout/core/tasks/tasks.component";
import { TrainingComponent } from "./standard-layout/core/training/exercise.component";
import { TimeTaskComponent } from "./standard-layout/core/timetask/timetask.component";
import { TrainingViewComponent } from "./standard-layout/core/training/components/training-view/training-view.component";
import { WeightComponent } from "./standard-layout/core/weight/weight.component";
import { DashboardComponent } from "./standard-layout/core/dashboard/dashboard.component";
import { SessionComponent } from "./standard-layout/core/session/session.component";
import { SettingsComponent } from "./standard-layout/core/settings/settings.component";

const routes: Routes = [
  {
    path: "",
    component: DashboardComponent,
  },
  {
    path: "dashboard",
    component: DashboardComponent,
  },
  {
    path: "settings",
    component: SettingsComponent,
  },
  {
    path: "tasks",
    component: TasksComponent,
  },
  {
    path: "training",
    component: TrainingComponent,
  },
  {
    path: "training/:id",
    component: TrainingViewComponent,
  },
  {
    path: "timetask",
    component: TimeTaskComponent,
  },
  {
    path: "weight",
    component: WeightComponent,
  },
  {
    path: "session",
    component: SessionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
