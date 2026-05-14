import { Task } from "@/types";

export interface SortingStrategy {
  name: string;
  sort(tasks: Task[]): Task[];
}
