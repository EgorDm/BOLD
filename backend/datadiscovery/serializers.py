import json
import uuid
from rest_framework import serializers

from datasets.serializers import DatasetSerializer
from datasets.models import Dataset
from reports.tasks import run_sparql


class SearchSerializer(serializers.ModelSerializer):
    dataset = DatasetSerializer(read_only=True)

    class Meta:
        model = Dataset
        exclude = []
    terms = serializers.SerializerMethodField()

    def get_terms(self, dataset):
        filter_field = self.context.get('filter_field')
        filter_operator = self.context.get('filter_operator')
        filter_value = self.context.get('filter_value')
        filter_search = self.context.get('filter_search')

        query = ""
        if filter_field is None or filter_value is None:
            query = "SELECT * { ?s ?p ?o } LIMIT 20"
            pass
        elif filter_field == "terms" and filter_operator == "contains":
            query = f'''
              SELECT ?s ?p ?o
              WHERE {{
                {{?s ?p ?o. FILTER CONTAINS(str(?s), "{filter_value}")}}
                UNION
                {{?s ?p ?o. FILTER CONTAINS(str(?p), "{filter_value}")}}
                UNION
                {{?s ?p ?o. FILTER CONTAINS(str(?o), "{filter_value}")}}
              }}
              LIMIT 20
            '''
        else:
            # filtering is only allowed on terms
            return []

        outputs, error = run_sparql(dataset, query, 20, 20)

        if error:
            return []

        raw_json = outputs[0]['data']['application/sparql-results+json']
        terms = [{ 'id': uuid.uuid4()
                 , 'dataset_id': dataset.id
                 , 'dataset_name': dataset.name
                 , 'term': f"{d['s']['value']} {d['p']['value']} {d['o']['value']}"} for d in json.loads(raw_json)['results']['bindings']]

        return terms
