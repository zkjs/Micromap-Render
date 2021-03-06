#-*- encoding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from mongoengine import *
import datetime
# Create your models here.

connect('test')

class Organization(Document):
    title = StringField(max_length=50, required=True)
    date_modified = DateTimeField(default=datetime.datetime.now)
    level = IntField(default=0) # represent levels, 0 is root level
    parent = ReferenceField('self') #self linked, has only one parent
    # meta = {'collections': 'mapOrgization'}
    # insert a default organization;

class MmapObj(Document):
    lnglat = GeoPointField(required=True)
    name = StringField(max_length=100, required=True)
    owner = ReferenceField('Organization', required=False)  #linked to organization model
    visible = BooleanField(default=True)
    address = StringField(max_length=100)
    level = IntField(default=0)  #root level = 0
    parent = ReferenceField('self') #self netted relationships
    draw = ListField(ReferenceField('Drawable'), required=False)  #One-To-Many relationships# not necessary for defined ref in drawables
    hasfloors = IntField(default=1) # 有几层
    infloors = IntField(default=1) # 位于几层
    created = DateTimeField()
    modified = DateTimeField(default=datetime.datetime.now)
    # default ognization = xxxx

class Drawable(DynamicDocument):
    type = StringField(required=True, max_length=20)
    lnglat = GeoPointField(required=True)
    mmapobj = ReferenceField('MmapObj') #should not reverse delete


