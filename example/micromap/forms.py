#-*- coding: utf-8 -*-
# ganben created

from django.utils.encoding import python_2_unicode_compatible
from django import forms

class AddMobjForm(forms.Form):
    #this file is 4 space as indent;
    #this form is to proceed form data for Mmapobjects as fixed fields or automated fields;
	#the drawables use json to deal with dynamic drawing types, not neccessary use various forms for each type
    #for root objs;
    name = forms.CharField(label='Name: ', max_length=100)
    address = forms.CharField(label='Addr: ', max_length=100, required=False)
    level = forms.IntegerField(label='Obj level: ')  #not sure if level choice support this;
    hasfloors = forms.IntegerField(label='total floors: ')
    infloors = forms.IntegerField(label='locate floors')
