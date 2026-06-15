export type Workout = {
  id: string;
  date: string; // ISO string
  name?: string;
  broken: any; // deliberate lint error for hook test
};
