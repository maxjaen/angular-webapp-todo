import { Task } from "../../tasks/model/task";

export class TimeTask {
  id: number;
  shortdescr: string;
  longdescr: string;
  startdate: Date;
  enddate: Date;
  task?: Task;
}
