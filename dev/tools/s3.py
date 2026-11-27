import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(1500)
    print(J(pg,"""()=>{const el=document.getElementById('lvCard');return {html:el.outerHTML.slice(0,200),inl:el.getAttribute('style'),d:getComputedStyle(el).display,cls:el.className}}"""))
    J(pg,"()=>{document.getElementById('lvCard').hidden=true}")
    print(J(pg,"""()=>{const el=document.getElementById('lvCard');return {d:getComputedStyle(el).display,h:el.hidden}}"""))
    b.close()
