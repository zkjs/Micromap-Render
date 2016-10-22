#-*- coding: utf-8 -*-
from django.shortcuts import render
from django.views import View

# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render
# from django views import View
from .models import MmapObj, Drawable

amapKey = 'f7ac40ee5f12833a51b9ef058600b330'

def index(request):
    objects = [ ]# this is a example of 
    #one map obj included array of drawable objects, which is defined by AMap
    #APIs;
    marker1 = {'type': 'Marker',
            'lnglat':[ 113.956112, 22.530516 ],
            'text': '大沙河停车场（11/19）'}
    polygon1 = {'type': 'Polygon',
            'lnglat':[ 113.955173,22.532146 ],
            'path': [[ 113.95631,22.531987 ],
                [ 113.95601,22.53058 ],
                [ 113.95586,22.528618 ],
                [ 113.954744,22.528935 ]]}
    objects.append(marker1)
    objects.append(polygon1)
    #here objects append some, text, icon, polyline, polygon, etc
    return render(request, 'micromap/index.html', {'amapKey': amapKey,
        'objects':objects})

class Dashboard(View):
    #the view to manipulation of root objs list.
    def get(self, request):
        rootobjs = MmapObj.objects.find
        return render(request, 'micromap/admin.html')

    def post(self, request):
        #for modified a root objects;
        return render(request, 'micromap/admin.html')

class ObjManage(View):
    #for other obj, only API
    def post(self, request):
        #manage a auto-filled form
        return {'result': True}

class DrawManage(View):
    #view for draw add;s
    def post(self, request):
        return {'result': True}
