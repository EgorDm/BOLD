from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from datasets.models import Dataset
from datadiscovery.serializers import SearchSerializer
from reports.tasks import run_sparql


class DatadiscoveryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows data inside datasets to be discovered by search
    """
    queryset = Dataset.objects.all()
    serializer_class = SearchSerializer
    pagination_class = LimitOffsetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'id'] # of the dataset
