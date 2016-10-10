from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render
# from django views import View


amapKey = 'f7ac40ee5f12833a51b9ef058600b330'

def index(request):
	objects = []
	#here objects append some, text, icon, polyline, polygon, etc
	return render(request, 'micromap/index.html', {'amapKey': amapKey })
