import { literal, namedNode } from "@rdfjs/data-model";
import namespace from "@rdfjs/namespace";
import { CellErrorOutput, CellOutput } from "../types/notebooks";
import { Term } from "../types/terms";

export const termToSparql = (term: Term) => {
  if (term.type === 'literal') {
    return literal(term.value, term.lang ?? undefined);
  } else {
    return namedNode(term.value);
  }
}


export const PREFIXES = {
  rdf: namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  rdfs: namespace('http://www.w3.org/2000/01/rdf-schema#'),
  owl: namespace('http://www.w3.org/2002/07/owl#'),
}


export const extractSparqlResult = (output: CellErrorOutput | CellOutput) => {
  if (output.output_type === 'execute_result') {
    const contentType = Object.keys(output.data)[0];
    const data = output.data[contentType];

    return JSON.parse(data);
  }

  return null;
}