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
        query = "SELECT * { ?s ?p ?o } LIMIT 20"
        outputs, error = run_sparql(dataset, query, 20, 20)
        if error:
            return []

        raw_json = outputs[0]['data']['application/sparql-results+json']
        terms = [{ 'id': uuid.uuid4()
                 , 'dataset_id': dataset.id
                 , 'dataset_name': dataset.name
                 , 'term': f"{d['s']['value']} {d['p']['value']} {d['o']['value']}"} for d in json.loads(raw_json)['results']['bindings']]

        return terms
