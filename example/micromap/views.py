from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render
# from django views import View


amapKey = 'f7ac40ee5f12833a51b9ef058600b330'

def index(request):
    objects = [ ]
    marker1 = {'type': 'Marker',
            'lnglat':[ 113.962737,22.528965 ],
            'text': 'good marker'}
    polygon1 = {'type': 'Polygon',
            'lnglat':[ 113.955173,22.532146 ],
            'path': [[ 113.95631,22.531987 ],
                [ 113.95601,22.53058 ],
                [ 113.95586,22.528618 ],
                [ 113.954744,22.528935 ]]}
    objects.append(marker1)
    # objects.append(polygon1)
    #here objects append some, text, icon, polyline, polygon, etc
    return render(request, 'micromap/index.html', {'amapKey': amapKey,
        'objects':objects})
