#-*- coding: utf-8 -*-
from django.shortcuts import render
from django.views import View

# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render
# from django views import View
from .models import MmapObj, Drawable
from bson import ObjectId
from .forms import AddMobjForm

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

def dash(request, obj_id=None):
    try:
        if obj_id == None:
            root_obj = MmapObj.objects.last()
        else:
            root_obj = MmapObj.objects(pk=ObjectId(obj_id))
    except:
        root_obj = None

    form = AddMobjForm()
    return render(request, 'micromap/admin.html', {'objs': root_obj, 'form': form})


class Dashboard(View):
    #the view to manipulation of root objs list.
    def get(self, obj_id, request):
        rootobjs = MmapObj.objects.find
        return render(request, 'micromap/admin.html')

    def post(self, request):
        #for modified a root objects;
        return render(request, 'micromap/admin.html')

class ObjManage(View):
    #for other obj, only API
    def post(self, request):
        #manage a auto-filled form
        #default owner of ever obj:  _id: ObjectId("580df609e97af7b87cdec693") 'public'
        return {'result': True}

class DrawManage(View):
    #view for draw add;s
    def get(self, request):
        #acquire the obj and filter all drawables to pass to front end in {{objects}}
        mmapobj = MmapObj.objects() #syntax to query in mongoengine
        objects = []
        sum = 0
        res = Drawable.objects.find()   #syntax to find drawable for this mmapobj.
        return render(request, 'micromap/admin.html', {'objects': objects, 'sum': sum})


    def post(self, request):
        return {'result': True}
