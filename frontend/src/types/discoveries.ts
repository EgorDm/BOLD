import { Dataset } from "./datasets";

export interface Discovery {
  dataset_id: Dataset['id'];
  dataset_name: Dataset['name'];
  triples_matched: [number, number];
}
