from django.urls import path
from .views import analyze_position, analyze_batch

urlpatterns = [
    path('analyze/',analyze_position, name='analyze_position'),
    path('analyze_batch/', analyze_batch, name='analyze_batch'),
]
