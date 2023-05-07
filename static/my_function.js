let event_flag = -1;
let genre_flag = -1;
let venue_flag = -1;
var event_json;
var venue_json;

function show_locateBox(){
  var check = document.getElementById("checkBox");
  var locate = document.getElementById("location");
  if(check.checked){
    locate.style.display = "none";
  }else{
    locate.style.display = "block";
  }
}

function reset_box(){
  document.getElementById("checkBox").checked=false;
  document.getElementById("location").style.display = "block";
}

function clean_all(){
	reset_box();
	document.getElementById("search_form").reset();
	document.getElementById("venue_toggle").style.display="none";
	document.getElementById("venue_card").style.display="none";
	document.getElementById("event_card").style.display="none";
	clean_table(document.getElementById("events_table"));
	clean_table(document.getElementById("event_table"));
	clean_table(document.getElementById("venue_table"));
}

function clean_table(table){
	while(table.lastChild != null){
		table.removeChild(table.lastChild);
	}
	table.style.display = "none";
}

function click_toggle(){
	var toggle = document.getElementById("venue_toggle");
	toggle.style.display = "none";
	search_venue_details(event_json["venue"]["name"]);
}

function show_venue_table(table, json_data){
	clean_table(table);

	var caption = document.createElement("caption");
	caption.classList.add("venue_table_title");
	caption.innerHTML = "&nbsp"+json_data["venue"]["name"]+"&nbsp";
	if("image_url" in json_data["venue"]){
		var venue_image = document.createElement("img");
		venue_image.classList.add("venue_image");
		venue_image.src = json_data["venue"]["image_url"];
		caption.innerHTML += "<br>";
		caption.appendChild(venue_image);
	}
	table.appendChild(caption);

	var content = document.createElement("tr");
	var left_col = document.createElement("td");
	left_col.classList.add("venue_table_col");
	left_col.style="border-right: 1px solid black;";
	var address_info = document.createElement("table");
	address_info.classList.add("address_info_table");

	var address_row = document.createElement("tr");
	address_row.classList.add("address_row");
	address_row.innerHTML="<b>Address:&nbsp</b>"
	if("address" in json_data["venue"]){
		address_row.innerHTML += json_data["venue"]["address"]+"<br>";
		address_row.innerHTML += "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
		address_row.innerHTML += json_data["venue"]["city"]+", "+json_data["venue"]["state"]+"<br>";
		address_row.innerHTML += "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
		address_row.innerHTML += json_data["venue"]["postalCode"];
	}else{
		address_row.innerHTML += json_data["venue"]["city"]+", "+json_data["venue"]["state"]+"<br>";
		address_row.innerHTML += "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
		address_row.innerHTML += json_data["venue"]["postalCode"];
	}
	address_row.innerHTML += "<br>&nbsp";
	address_info.appendChild(address_row);

	var map_link_row =  document.createElement("tr");
	map_link_row.classList.add("map_link_row");
	var map_link = document.createElement("a");
	map_link.classList.add("ref");
	map_link.innerText = "Open in Google Maps";
	var map_url = "https://www.google.com/maps/search/?api=1&query="+json_data["venue"]["name"];
	if("address" in json_data["venue"])	map_url += "," + json_data["venue"]["address"];
	map_url+=","+json_data["venue"]["city"]+","+json_data["venue"]["state"]+","+json_data["venue"]["postalCode"];
	console.log(map_url);
	map_link.href = map_url;
	map_link_row.appendChild(map_link);
	address_info.appendChild(map_link_row);

	left_col.appendChild(address_info);
	content.appendChild(left_col);

	var right_col = document.createElement("td");
	right_col.classList.add("venue_table_col");
	var venue_link_table = document.createElement("table");
	venue_link_table.classList.add("venue_link_table");
	var venue_link_row = document.createElement("tr");
	venue_link_row.classList.add("address_row");
	var venue_link = document.createElement("a");
	venue_link.classList.add("ref");
	venue_link.innerHTML = "More events at this venue<br>&nbsp<br>&nbsp";
	if("address" in json_data["venue"]){
		venue_link.innerHTML += "<br>&nbsp";
	}
	if("url" in json_data["venue"]){
		venue_link.href = json_data["venue"]["url"];
	}else{
		venue_link.setAttribute("class","disabled");
		venue_link.setAttribute("style","color: black;");
	}
	venue_link_row.appendChild(venue_link);
	venue_link_table.appendChild(venue_link_row);
	var empty_row = document.createElement("tr");
	empty_row.classList.add("map_link_row");
	empty_row.innerHTML="&nbsp";
	venue_link_table.appendChild(empty_row);
	right_col.appendChild(venue_link_table);
	content.appendChild(right_col);

	table.appendChild(content);
	var empty_content_row = document.createElement("tr")
	empty_content_row.innerHTML="&nbsp<br>&nbsp";
	table.appendChild(empty_content_row);
	table.style.display = "block";
	var venue_card = document.getElementById("venue_card");
	venue_card.style.display = "block";
}

function show_event_table(table, json_data){
	var caption = document.createElement("caption");
	caption.classList.add("event_table_title");
	caption.innerText = json_data["name"];
	table.appendChild(caption);

	var content = document.createElement("tr");
	var left_col = document.createElement("td");
	left_col.style="width:550px";
	var event_info = document.createElement("table");
	event_info.classList.add("event_info_table");

	var time_title_row = document.createElement("tr");
	time_title_row.classList.add("event_info_title");
	time_title_row.innerText = "Date";
	event_info.appendChild(time_title_row);
	var time_row = document.createElement("tr");
	time_row.classList.add("event_info_data");
	time_row.innerText = json_data["localDate"];
	if("localTime" in json_data)	time_row.innerText += " " + json_data["localTime"];
	event_info.appendChild(time_row);

	if("Artist/Team" in json_data){
		var attractions_title_row = document.createElement("tr");
		attractions_title_row.classList.add("event_info_title");
		attractions_title_row.innerText = "Artist/Team";
		event_info.appendChild(attractions_title_row);
		var attractions_row = document.createElement("tr");
		attractions_row.classList.add("event_info_data");
		for(let i=0;i<json_data["Artist/Team"].length;i++){
			var attraction = document.createElement("a");
			attraction.classList.add("ref");
			attraction.innerText = json_data["Artist/Team"][i]["name"];
			attraction.href = json_data["Artist/Team"][i]["url"];
			attractions_row.appendChild(attraction);
			if(i<json_data["Artist/Team"].length-1)	attractions_row.innerHTML += "&nbsp|&nbsp";
		}
		event_info.appendChild(attractions_row);
	}

	var venue_title_row = document.createElement("tr");
	venue_title_row.classList.add("event_info_title");
	venue_title_row.innerText = "Venue";
	event_info.appendChild(venue_title_row);
	var venue_row = document.createElement("tr");
	venue_row.classList.add("event_info_data");
	venue_row.innerText = json_data["venue"]["name"];
	event_info.appendChild(venue_row);

	var genres_title_row = document.createElement("tr");
	genres_title_row.classList.add("event_info_title");
	genres_title_row.innerText = "Genres";
	event_info.appendChild(genres_title_row);
	var genres_row = document.createElement("tr");
	genres_row.classList.add("event_info_data");
	genres_row.innerText = json_data["genre"][0];
	for(let i=1;i<json_data["genre"].length;i++){
		genres_row.innerText += " | " + json_data["genre"][i];
	}
	event_info.appendChild(genres_row);

	if("priceRanges" in json_data){
		var price_title_row = document.createElement("tr");
		price_title_row.classList.add("event_info_title");
		price_title_row.innerText = "Price Ranges";
		event_info.appendChild(price_title_row);
		var price_row = document.createElement("tr");
		price_row.classList.add("event_info_data");
		price_row.innerText = json_data["priceRanges"]["min"]+"-"+json_data["priceRanges"]["max"]+" USD";
		event_info.appendChild(price_row);
	}

	var status_title_row = document.createElement("tr");
	status_title_row.classList.add("event_info_title");
	status_title_row.innerText = "Ticket Status";
	event_info.appendChild(status_title_row);
	var status_row = document.createElement("tr");
	status_row.classList.add("event_info_data");
	var status_box = document.createElement("div");
	status_box.classList.add("status");
	if(json_data["status"]=="onsale"){
		status_box.style.background = "green";
		status_box.innerText = "On Sale";
	}else if(json_data["status"]=="offsale") {
		status_box.style.background = "red";
		status_box.innerText = "Off Sale";
	}else if(json_data["status"]=="canceled") {
		status_box.style.background = "black";
		status_box.innerText = "Canceled";
	}else if(json_data["status"]=="postponed") {
		status_box.style.background = "orange";
		status_box.innerText = "Postponed";
	}else if(json_data["status"]=="rescheduled"){
		status_box.style.background = "orange";
		status_box.innerText = "Rescheduled";
	}
	status_row.appendChild(status_box);
	event_info.appendChild(status_row);

	var ticket_title_row = document.createElement("tr");
	ticket_title_row.classList.add("event_info_title");
	ticket_title_row.innerText = "Buy Ticket At:";
	event_info.appendChild(ticket_title_row);
	var ticket_row = document.createElement("tr");
	ticket_row.classList.add("event_info_data");
	var ticket_url = document.createElement("a");
	ticket_url.classList.add("ref");
	ticket_url.innerText = "Ticketmaster";
	ticket_url.href = json_data["url"];
	ticket_row.appendChild(ticket_url);
	event_info.appendChild(ticket_row);

	left_col.appendChild(event_info);
	content.appendChild(left_col);

	var right_col = document.createElement("td");
    right_col.classList.add("seatmap_col");
	right_col.style="width:650px";
	if("seatmap" in json_data){
		var seatmap = document.createElement("img");
		seatmap.classList.add("seatmap");
		seatmap.src = json_data["seatmap"];
		right_col.appendChild(seatmap);
	}else{
		right_col.innerText="No seatmap available";
	}
	content.appendChild(right_col);
	table.appendChild(content);
	var venue_tb = document.getElementById('venue_table');
	table.style.display = "block";
	document.getElementById('venue_toggle').style.display = "block";
	document.getElementById('venue_card').style.display = "none";
	var event_card = document.getElementById("event_card");
	event_card.style.display = "block";
	event_card.scrollIntoView({behavior: 'smooth'});
}

function show_events_table(table, json_data){
	var head_row = document.createElement("tr");
	if(json_data["events_num"]==0){
		var no_result_title = document.createElement("th");
		no_result_title.classList.add("no_result");
		no_result_title.innerText = "No Records found";
		head_row.appendChild(no_result_title);
		table.appendChild(head_row);
	}else{
		var date_title = document.createElement("th");
		date_title.classList.add("events_table_title");
		date_title.innerText = "Date";
		date_title.style="width:225px";
		head_row.appendChild(date_title);
		var icon_title = document.createElement("th");
		icon_title.classList.add("events_table_title");
		icon_title.innerText = "Icon";
		icon_title.style="width:225px";
		head_row.appendChild(icon_title);
		var event_title = document.createElement("th");
		event_title.classList.add("events_table_title");
		event_title.innerText = "Event";
		event_title.style="width:600px";
		event_title.classList.add("sort_ref");
		event_title.addEventListener("click", function(){sort_by_event(json_data)});
		head_row.appendChild(event_title);
		var genre_title = document.createElement("th");
		genre_title.classList.add("events_table_title");
		genre_title.innerText = "Genre";
		genre_title.style="width:175px";
		genre_title.classList.add("sort_ref");
		genre_title.addEventListener("click", function(){sort_by_genre(json_data)});
		head_row.appendChild(genre_title);
		var venue_title = document.createElement("th");
		venue_title.classList.add("events_table_title");
		venue_title.innerText = "Venue";
		venue_title.style="width:275px";
		venue_title.classList.add("sort_ref");
		venue_title.addEventListener("click", function(){sort_by_venue(json_data)});
		head_row.appendChild(venue_title);
		head_row.style="box-shadow:0px 1px 5px black;";
		table.appendChild(head_row);
		for(let i in json_data["events"]){
			var event_row = document.createElement("tr");

			var time = document.createElement("td");
			time.classList.add("events_table_data");
			time.innerText = json_data["events"][i]["localDate"];
			if("localTime" in json_data["events"][i])	time.innerText += "\n"+json_data["events"][i]["localTime"];
			event_row.appendChild(time);

			var image_item = document.createElement("td");
			image_item.classList.add("events_table_data");
			var image = document.createElement("img");
			image.classList.add("icon");
			image.src = json_data["events"][i]["image_url"];
			image_item.appendChild(image);
			event_row.appendChild(image_item);

			var name = document.createElement("td");
			name.classList.add("events_table_data");
			name_link = document.createElement("a");
			name_link.classList.add("event_ref");
			name_link.innerText = json_data["events"][i]["name"];
			name_link.addEventListener("click", function(){search_event_details(json_data["events"][i]["id"])});
			name.appendChild(name_link);
			event_row.appendChild(name);

			var genre = document.createElement("td");
			genre.classList.add("events_table_data");
			genre.innerText = json_data["events"][i]["genre"];
			event_row.appendChild(genre);

			var venue = document.createElement("td");
			venue.classList.add("events_table_data");
			venue.innerText = json_data["events"][i]["venue"];
			event_row.appendChild(venue);

			table.appendChild(event_row);
		}
	}
	table.style.display = "block";
}

//Sort Algorithm is inspired and cited from https://stackoverflow.com/questions/4222690/sorting-a-json-object-in-javascript
function sort_by_event(json_data){
	json_data["events"].sort(function (a, b) {
    	if (b["name"] < a["name"]) {
        	return (-1)*event_flag;
    	}
    	else if (b["name"] > a["name"]) {
        	return 1*event_flag;
    	}
    	else {
        	return 0;
    	}
	});
	event_flag = (-1)*event_flag;
	var events_tb = document.getElementById('events_table');
	clean_table(events_tb);
	show_events_table(events_tb,json_data);
}

function sort_by_genre(json_data){
	json_data["events"].sort(function (a, b) {
		if (b["genre"] < a["genre"]) {
			return (-1)*genre_flag;
		}
		else if (b["genre"] > a["genre"]) {
			return 1*genre_flag;
		}
		else {
			return 0;
		}
	});
	genre_flag = (-1)*genre_flag;
	var events_tb = document.getElementById('events_table');
	clean_table(events_tb);
	show_events_table(events_tb,json_data);
}

function sort_by_venue(json_data){
	json_data["events"].sort(function (a, b) {
		if (b["venue"] < a["venue"]) {
			return (-1)*venue_flag;
		}
		else if (b["venue"] > a["venue"]) {
			return 1*venue_flag;
		}
		else {
			return 0;
		}
	});
	venue_flag = (-1)*venue_flag;
	var events_tb = document.getElementById('events_table');
	clean_table(events_tb);
	show_events_table(events_tb,json_data);
}

function search_venue_details(venue_name){
	var id_url = "https://cs571-hw6-376322.wl.r.appspot.com/venue_details/?name=" + venue_name;
	console.log(id_url);
    fetch(id_url,{
  	  	method:'GET',
   		mode:'cors'
  	})
    .then((response)=>response.json())
  	.then((data)=>{
  		//console.log(data);
		venue_json = data;
		//console.log(venue_json);
		show_venue_table(document.getElementById("venue_table"),venue_json);
  	})
}

function search_event_details(event_id){
	var id_url = "https://cs571-hw6-376322.wl.r.appspot.com/event_details/?id=" + event_id;
	console.log(id_url);
    fetch(id_url,{
  	  	method:'GET',
   		mode:'cors'
  	})
    .then((response)=>response.json())
  	.then((data)=>{
  		//console.log(data);
		event_json = data;
		var event_tb = document.getElementById('event_table');
		clean_table(event_tb);
		show_event_table(event_tb,data);
  	})
}

function search_events(form){
  var keyword = document.getElementById("keyword");
  var location = document.getElementById("location");
  var check = document.getElementById("checkBox");
  if(!keyword.checkValidity()){
      keyword.reportValidity();
      return false;
  }else if(!location.checkValidity() && !check.checked){
      location.reportValidity();
      console.log("fail");
      return false;
  }
  var latitude;
  var longitude;
  if(check.checked){
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET","https://ipinfo.io/?token=2109da12929018",false);
    xmlhttp.send();
    jsonObj= JSON.parse(xmlhttp.responseText);
    //console.log(jsonObj);
    latitude = jsonObj["loc"].split(',')[0];
    longitude = jsonObj["loc"].split(',')[1];
  }else{
    var address = document.getElementById("location").value;
    //console.log(address);
    var google_api_key = "AIzaSyAzgqTav7G_0oLAfY__HQ4WjMtUn9Oitmo";
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + google_api_key;
    //console.log(url);
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET",url,false);
    xmlhttp.send();
    jsonObj= JSON.parse(xmlhttp.responseText);
    //console.log(jsonObj);
    latitude = String(jsonObj["results"][0]["geometry"]["location"]["lat"]);
    longitude = String(jsonObj["results"][0]["geometry"]["location"]["lng"]);
  }
  //console.log(latitude);
  //console.log(longitude);
  var keyword_value = document.getElementById("keyword").value;
  var radius = document.getElementById("distance");
  var radius_value = (radius.value==""?radius.placeholder:radius.value);
  var category_value = document.getElementById("category").value;
  var request_url="https://cs571-hw6-376322.wl.r.appspot.com/search_events/?keyword="+keyword_value+"&radius="+radius_value+"&category="+category_value+"&latitude="+latitude+"&longitude="+longitude;
  console.log(request_url);
  $.ajax({
	  url: request_url,
	  type: "get",
	  dataType: "JSON",
	  success: function (data) {
		  //console.log(data);
		  var events_tb = document.getElementById('events_table');
		  clean_table(events_tb);
		  clean_table(document.getElementById("event_table"));
		  clean_table(document.getElementById("venue_table"));
		  document.getElementById("venue_toggle").style.display="none";
		  document.getElementById("venue_card").style.display="none";
		  document.getElementById("event_card").style.display="none";
		  show_events_table(events_tb,data);
	  }
  });
}
