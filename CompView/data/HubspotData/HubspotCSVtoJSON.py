#!/usr/bin/env python
# -*- coding: utf-8 -*-


import csv
import json
import random 
import datetime 


csvfile = open('hubspotCSV.csv', 'r')
jsonfile = open('RESULT.json', 'w')

fieldnames = ("Name","City","Lifecycle Stage","Type","Company Relation - Integrated at","Company Relation - App team at","Company Relation - Related to","Annual Revenue","HubSpot Owner","Year Founded","Country","Website URL","Industry","Systems")
indType = ("JORDBRUK, SKOGSBRUK OCH FISKE","UTVINNING AV MINERAL","TILLVERKNING","FÖRSÖRJNING AV EL, GAS, VÄRME OCH KYLA","VATTENFÖRSÖRJNING; AVLOPPSRENING, AVFALLSHANTERING OCH SANERING","BYGGVERKSAMHET","HANDEL; REPERATION AV MOTORFORDON OCH MOTORCYKLAR","TRANSPORT OCH MAGASINERING","HOTELL- OCH RESTAURANGVERKSAMHET","INFORMATINOS- OCH KOMMUNIKATIONSVERKSAMHET","FINANS- OCH FÖRSÄKRINGSVERKSAMHET","FASTIGHETSVERKSAMHET","VERKSAMHET INOM JURIDIK, EKONOMI, VETENSKAP OCH TEKNIK","UTHYRNING, FASTIGHETSSERVICE, RESETJÄNSTER OCH ANDRA STÖDTJÄNSTER","OFFENTLIG FÖRVALTNING OCH FÖRSVAR; OBLIGATORISK SOCIALFÖRSÄKRING","UTBILDNING","VÅRD OCH OMSORG; SOCIALA TJÄNSTER","KULTUR, NÖJE OCH FRITID","ANNAN SERVICEVERKSAMHET","FÖRVÄRVSARBETE I HUSHÅLL; HUSHÅLLENS PRODUKTION AV DIVERSE VAROR OCH TJÄNSTER FÖR EGET BRUK","VERKSAMHET VID INTERNATIONELLA ORGINISATIONER, UTLÄNDSKA AMBASSADER O.D.","OTHER","NOT SET")
reader = csv.DictReader( csvfile, fieldnames)



jsonfile.write('{\n "elements":  {\n  "nodes": [')
next(reader) #Skip first line containing fieldnames
row1 = next(reader)
i=1

#Print the first element 
jsonfile.write('\n   {')
jsonfile.write('\n    "data": {')
jsonfile.write('\n     "id": "'+row1["Name"]+'",')
jsonfile.write('\n     "CompanyType": "'+indType[0]+'",')																	#Missing data
jsonfile.write('\n     "Company Domain Name": "'+row1["Website URL"]+'",')
jsonfile.write('\n     "City": "'+row1["City"]+'",')
jsonfile.write('\n     "NodeType": "'+row1["Type"]+'",')	
jsonfile.write('\n     "LifecycleStage": "'+row1["Lifecycle Stage"]+'",')	
if row1["Company Relation - Integrated at"]:
	jsonfile.write('\n     "CompanyRelationIntegratedAt": "'+row1["Company Relation - Integrated at"]+'",')
if row1["Company Relation - App team at"]:
	jsonfile.write('\n     "CompanyRelationAppTeamAt": "'+row1["Company Relation - App team at"]+'",')
if row1["Company Relation - Related to"]:
	jsonfile.write('\n     "CompanyRelationRelatedTo": "'+row1["Company Relation - Related to"]+'",')
if row1["Systems"]:
	jsonfile.write('\n     "hasApplication": "'+row1["Systems"]+'",')																#Missing data
jsonfile.write('\n     "Owner": "'+row1["HubSpot Owner"]+'",')
jsonfile.write('\n     "Country": "'+row1["Country"]+'",')
jsonfile.write('\n     "WebsiteURL": "'+row1["Website URL"]+'",')
if row1["Annual Revenue"]:
	jsonfile.write('\n     "AnnRevenue": '+row1["Annual Revenue"]+',')	
else: 
	jsonfile.write('\n     "AnnRevenue": 130000000,')																		#Missing data
jsonfile.write('\n     "yearFounded": "'+row1["Year Founded"]+'"')	
jsonfile.write('\n    },')
jsonfile.write('\n    "position": {')
jsonfile.write('\n    },')
jsonfile.write('\n    "group": "nodes",')
jsonfile.write('\n    "removed": false,')
jsonfile.write('\n    "selected": false,')
jsonfile.write('\n    "selectable": true,')
jsonfile.write('\n    "locked": false,')
jsonfile.write('\n    "grabbable": true,')
jsonfile.write('\n    "classes": ""')
jsonfile.write('\n   }')

# #print rest of the elements
for row in reader:
	i=i+1
	jsonfile.write(',\n   {')
	jsonfile.write('\n    "data": {')
	jsonfile.write('\n     "id": "'+row["Name"]+'",')
	jsonfile.write('\n     "CompanyType": "'+indType[i%23]+'",')															#Missing data
	jsonfile.write('\n     "Company Domain Name": "'+row["Website URL"]+'",')
	jsonfile.write('\n     "City": "'+row["City"]+'",')
	jsonfile.write('\n     "NodeType": "'+row["Type"]+'",')	
	jsonfile.write('\n     "LifecycleStage": "'+row["Lifecycle Stage"]+'",')	
	if row["Company Relation - Integrated at"]:
		jsonfile.write('\n     "CompanyRelationIntegratedAt": "'+row["Company Relation - Integrated at"]+'",') 			#Missing data
	if row["Company Relation - App team at"]:
		jsonfile.write('\n     "CompanyRelationAppTeamAt": "'+row["Company Relation - App team at"]+'",')					#Missing data
	if row["Company Relation - Related to"]:	
		jsonfile.write('\n     "CompanyRelationRelatedTo": "'+row["Company Relation - Related to"]+'",')					#Missing data
	if row["Systems"]:
		jsonfile.write('\n     "hasApplication":"'+row["Systems"]+'",')																		#Missing data
	jsonfile.write('\n     "Owner": "'+row["HubSpot Owner"]+'",')
	jsonfile.write('\n     "Country": "'+row["Country"]+'",')
	jsonfile.write('\n     "WebsiteURL": "'+row["Website URL"]+'",')
	if row["Annual Revenue"]:
		jsonfile.write('\n     "AnnRevenue": '+row["Annual Revenue"]+',')	
	else: 
		jsonfile.write('\n     "AnnRevenue": 130000000,')
	jsonfile.write('\n     "yearFounded": "'+row["Year Founded"]+'"')	
	jsonfile.write('\n    },')
	jsonfile.write('\n    "position": {')
	jsonfile.write('\n    },')
	jsonfile.write('\n    "group": "nodes",')
	jsonfile.write('\n    "removed": false,')
	jsonfile.write('\n    "selected": false,')
	jsonfile.write('\n    "selectable": true,')
	jsonfile.write('\n    "locked": false,')
	jsonfile.write('\n    "grabbable": true,')
	jsonfile.write('\n    "classes": ""')
	jsonfile.write('\n   }')

jsonfile.write("\n  ]")
jsonfile.write("\n }")
jsonfile.write("\n}")