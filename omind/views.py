# Create your views here.
from django.shortcuts import render_to_response
from django.http import HttpResponse
import os.path
import datetime
from mind_parser import mind_read_xml as mind_read_xml1
from mind_parser import xml_context as xml_context1
from mind_parser2 import mind_read_xml as mind_read_xml2
from mind_parser2 import xml_context as xml_context2
from django.conf import settings


def mind_show(request, file):
    path = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(path, "files/"+file+".mm")
    if os.path.isfile(path):
        ctx = xml_context1()
        mind_read_xml1(path, ctx)
        return render_to_response('mind_show.html',{'mind_html':ctx.html_string, 'mind_script':ctx.script_string});
    else:
        return HttpResponse('<h1>Page not found</h1>');

def mind_show2(request, file):
    path = settings.PROJECT_PATH
    path = os.path.join(path, "files/"+file+".mm")
    if os.path.isfile(path):
        ctx = xml_context2()
        mind_read_xml2(path, ctx)
        str = ';(function(){var theRoot = mindMapWrap.root;var theObjMap = mindMapWrap.objMap;'
        str = str + ctx.script_string;
        str = str + '})();'
        '''f = open("js/ObjWrap.js", 'w')
        f.write(';(function(){\n');
        f.write('var theRoot = mindMapWrap.root;var theObjMap = mindMapWrap.objMap;\n');
        f.write(ctx.script_string)
        f.write('})();');'''
        s1 = '{'
        s2 = '{{'
        return render_to_response('mind2.html',{'mind_script':str, 'mind_title':ctx.title, 's1':s1, 's2':s2});
    else:
        return HttpResponse('<h1>Page not found</h1>');
