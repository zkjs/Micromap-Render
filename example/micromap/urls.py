#-*- coding: utf-8 -*-
# ganben created

from django.conf.urls import url

from . import views

urlpatterns = [
	url(r'^$', views.index, name='index'),
	url(r'^dash/$', views.dash, name='dash'),
	url(r'^dash/(?P<obj_id>\w+)/$', views.dash),
	url(r'^api/(?P<obj_id>)/mmap/$', views.ObjManage.as_view, name='objapi'),
	url(r'^api/(?P<obj_id>)/draw/$', views.DrawManage.as_view, name='drawapi'),
]