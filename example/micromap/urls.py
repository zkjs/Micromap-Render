#-*- coding: utf-8 -*-
# ganben created

from django.conf.urls import url

from . import views

urlpatterns = [
	url(r'^$', views.index, name='index'),
]