from flask import Flask,jsonify,request
from flask_cors import CORS, cross_origin
import requests
from requests import get,post
import json
from geolib import geohash

app = Flask(__name__)
cors = CORS(app)

Ticketmaster_Key = "GBngPbqojMzEIxXGL69kv6QWLAAid4mm"
Geocoding_API_KEY = "AIzaSyAzgqTav7G_0oLAfY__HQ4WjMtUn9Oitmo"
IPInfo_Token = "2109da12929018"
segmentId_dict = {"Default": "", "Music": "KZFzniwnSyZfZ7v7nJ", "Sports": "KZFzniwnSyZfZ7v7nE", "Arts & Theatre": "KZFzniwnSyZfZ7v7na", "Film": "KZFzniwnSyZfZ7v7nn", "Miscellaneous": "KZFzniwnSyZfZ7v7n1"}

def add_header(response):
	response.headers['Access-Control-Allow-Origin'] = '*'
	print(response.headers)
	return response

@app.route('/')
def hello_world():
	result ="<html><body>"
	result += "<h1>Welcome to Qiushi Xu's Backend Server deployed on GCP of homework6</h1><br>"
	result += "Please visit <a href='https://cs571-hw6-376322.wl.r.appspot.com/static/hw6.html'>search page</a> for homework6<br>"
	result += "To test cloud service, here are examples:<br>"
	result += "An example for <a href='https://cs571-hw6-376322.wl.r.appspot.com/search_events/?keyword=Taylor Swift&category=Default&radius=10&latitude=34.03564453125&longitude=-118.27880859375'>searching events</a><br>"
	result += "An example for <a href='https://cs571-hw6-376322.wl.r.appspot.com/event_details/?id=vvG1IZ9p2w_7HY'>searching details of specific event</a><br>"
	result += "An example for <a href='https://cs571-hw6-376322.wl.r.appspot.com/venue_details/?name=Sofi Stadium'>searching details of specific venue</a><br>"
	result += "</body></html>"
	return result

def send_search_request(apikey, keyword, segmentId, radius, unit, geoPoint):
	url = "https://app.ticketmaster.com/discovery/v2/events.json?"
	url += "apikey=" + apikey + "&"
	url += "keyword=" + keyword + "&"
	url += "segmentId=" + segmentId + "&"
	url += "radius=" + radius + "&"
	url += "unit=" + unit + "&"
	url += "geoPoint=" + geoPoint
	#print(url)
	response = get(url)
	data_dict = json.loads(str(response.text))
	#print(data_dict["_embedded"]["events"])
	ret_dict = {"events_num": 0, "events": []}
	if data_dict["page"]["totalElements"]==0:
		print("No Records Found!")
	else:
		ret_dict["events_num"] = len(data_dict["_embedded"]["events"])
		#print("Number of events = ", len(data_dict["_embedded"]["events"]))
		for event in data_dict["_embedded"]["events"]:
			event_dict={}
			#print(event["dates"]["start"]["localDate"])
			event_dict["localDate"]=event["dates"]["start"]["localDate"]
			#print(event["dates"]["start"]["localTime"])
			if "localTime" in event["dates"]["start"]:
				event_dict["localTime"]=event["dates"]["start"]["localTime"]
			#print(event["images"][0]["url"])
			event_dict["image_url"]=event["images"][0]["url"]
			#print(event["name"])
			event_dict["name"]=event["name"]
			event_dict["id"]=event["id"]
			#print(event["classifications"][0]["segment"]["name"])
			event_dict["genre"]=event["classifications"][0]["segment"]["name"]
			#print(event["_embedded"]["venues"][0]["name"])
			event_dict["venue"]=event["_embedded"]["venues"][0]["name"]
			ret_dict["events"].append(event_dict)
	#print(ret_dict)
	return ret_dict
	#print("events" in data_dict["_embedded"])

def send_event_details_request(apikey, id):
	url = "https://app.ticketmaster.com/discovery/v2/events/"
	url += id + ".json?" + "apikey=" + apikey
	#print(url)
	response = get(url)
	data_dict = json.loads(str(response.text))
	ret_dict = {}
	ret_dict["name"] = data_dict["name"]
	ret_dict["localDate"] = data_dict["dates"]["start"]["localDate"]
	if "localTime" in data_dict["dates"]["start"]:
		ret_dict["localTime"] = data_dict["dates"]["start"]["localTime"]
	if "attractions" in data_dict["_embedded"]:
		ret_dict["Artist/Team"] = []
		for element in data_dict["_embedded"]["attractions"]:
			Artist_Team_dict = {}
			Artist_Team_dict["name"] = element["name"]
			Artist_Team_dict["url"] = element["url"]
			ret_dict["Artist/Team"].append(Artist_Team_dict)
	ret_dict["venue"] = {}
	ret_dict["venue"]["name"] = data_dict["_embedded"]["venues"][0]["name"]
	ret_dict["venue"]["id"] = data_dict["_embedded"]["venues"][0]["id"]
	if "line1" in data_dict["_embedded"]["venues"][0]["address"]:
		ret_dict["venue"]["address"] = data_dict["_embedded"]["venues"][0]["address"]["line1"]
	ret_dict["venue"]["city"] = data_dict["_embedded"]["venues"][0]["city"]["name"]
	ret_dict["venue"]["state"] = data_dict["_embedded"]["venues"][0]["state"]["stateCode"]
	ret_dict["venue"]["postalCode"] = data_dict["_embedded"]["venues"][0]["postalCode"]
	if "images" in data_dict["_embedded"]["venues"][0] and len(data_dict["_embedded"]["venues"][0]["images"])>0:
		ret_dict["venue"]["image_url"] = data_dict["_embedded"]["venues"][0]["images"][0]["url"]
	if "url" in data_dict["_embedded"]["venues"][0]:
		ret_dict["venue"]["url"] = data_dict["_embedded"]["venues"][0]["url"]
	ret_dict["genre"] = []
	if "segment" in data_dict["classifications"][0] and data_dict["classifications"][0]["segment"]["name"]!="Undefined":
		ret_dict["genre"].append(data_dict["classifications"][0]["segment"]["name"])
	if "genre" in data_dict["classifications"][0] and data_dict["classifications"][0]["genre"]["name"]!="Undefined":
		ret_dict["genre"].append(data_dict["classifications"][0]["genre"]["name"])
	if "subGenre" in data_dict["classifications"][0] and data_dict["classifications"][0]["subGenre"]["name"]!="Undefined":
		ret_dict["genre"].append(data_dict["classifications"][0]["subGenre"]["name"])
	if "type" in data_dict["classifications"][0] and data_dict["classifications"][0]["type"]["name"]!="Undefined":
		ret_dict["genre"].append(data_dict["classifications"][0]["type"]["name"])
	if "subType" in data_dict["classifications"][0] and data_dict["classifications"][0]["subType"]["name"]!="Undefined":
		ret_dict["genre"].append(data_dict["classifications"][0]["subType"]["name"])
	if "priceRanges" in data_dict:
		ret_dict["priceRanges"] = {}
		ret_dict["priceRanges"]["min"] = data_dict["priceRanges"][0]["min"]
		ret_dict["priceRanges"]["max"] = data_dict["priceRanges"][0]["max"]
	ret_dict["status"] = data_dict["dates"]["status"]["code"]
	ret_dict["url"] = data_dict["url"]
	if "seatmap" in data_dict and "staticUrl" in data_dict["seatmap"]:
		ret_dict["seatmap"] = data_dict["seatmap"]["staticUrl"]
	#print(ret_dict)
	return ret_dict

def send_venue_details_request(apikey, name):
	url = "https://app.ticketmaster.com/discovery/v2/venues?apikey=" + Ticketmaster_Key
	url += "&keyword=" + name
	#print(url)
	response = get(url)
	data_dict = json.loads(str(response.text))
	ret_dict = {}
	ret_dict["venue"] = {}
	ret_dict["venue"]["name"] = data_dict["_embedded"]["venues"][0]["name"]
	ret_dict["venue"]["id"] = data_dict["_embedded"]["venues"][0]["id"]
	if "line1" in data_dict["_embedded"]["venues"][0]["address"]:
		ret_dict["venue"]["address"] = data_dict["_embedded"]["venues"][0]["address"]["line1"]
	ret_dict["venue"]["city"] = data_dict["_embedded"]["venues"][0]["city"]["name"]
	ret_dict["venue"]["state"] = data_dict["_embedded"]["venues"][0]["state"]["stateCode"]
	ret_dict["venue"]["postalCode"] = data_dict["_embedded"]["venues"][0]["postalCode"]
	if "images" in data_dict["_embedded"]["venues"][0] and len(data_dict["_embedded"]["venues"][0]["images"])>0:
		ret_dict["venue"]["image_url"] = data_dict["_embedded"]["venues"][0]["images"][0]["url"]
	if "url" in data_dict["_embedded"]["venues"][0]:
		ret_dict["venue"]["url"] = data_dict["_embedded"]["venues"][0]["url"]
	return ret_dict

@app.route('/search_events/',methods=["POST","GET"])
def serach_events():
   #print(request.values)
   #print(request.values["user"])
   #print(request.values.to_dict())
   data_dict = request.values.to_dict()
   #print("keyword=", data_dict["keyword"])
   #print("category=", data_dict["category"])
   #print(type(data_dict["category"]))
   #print(len(data_dict["segmentId"]))
   #print("radius=", data_dict["radius"])
   #print(type(data_dict["radius"]))
   #print("latitude=", data_dict["latitude"])
   #print(type(data_dict["latitude"]))
   #print("longitude=", data_dict["longitude"])
   #print(type(data_dict["longitude"]))
   geoPoint = geohash.encode(data_dict["latitude"], data_dict["longitude"], 7)
   #print("geoPoint=", geoPoint)
   #print(type(geoPoint))
   return jsonify(send_search_request(Ticketmaster_Key, data_dict["keyword"], segmentId_dict[data_dict["category"]], data_dict["radius"], "miles", geoPoint))
   #return "OK "+data_dict["keyword"]

@app.route('/event_details/',methods=["POST","GET"])
def event_details():
	data_dict = request.values.to_dict()
	#print("id=", data_dict["id"])
	return jsonify(send_event_details_request(Ticketmaster_Key, data_dict["id"]))

@app.route('/venue_details/',methods=["POST","GET"])
def venue_details():
	data_dict = request.values.to_dict()
	#print("id=", data_dict["id"])
	return jsonify(send_venue_details_request(Ticketmaster_Key, data_dict["name"]))

if __name__ == '__main__':
   app.run(host='127.0.0.1', port=8080, debug=True)
