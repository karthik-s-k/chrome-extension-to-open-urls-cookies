let viewMode = false;
let currentDomain = "";

$("#urlLayout").show();
$("#cookieLayout").hide();
$("#errorLayout").hide();

$("#userInputSection").hide();

$("#showURLButton").show();
$("#showCookieButton").hide();
$("#deleteCookieButton").hide();

$("select").on("change", function() {
	var optionSelected = $(this).find("option:selected");
    var valueSelected  = optionSelected.val();
	
	$("#errorLayout").empty();
	$("#errorLayout").hide();
	
	if(valueSelected === "url") {		
		$("#actionType").text("Open bulk URL(s)");
		$("#cookieLayout").hide();
		$("#urlLayout").show();
		
		$("#showURLButton").show();
		$("#showCookieButton").hide();
		$("#deleteCookieButton").hide();
	}
	else if(valueSelected === "cookie") {
		$("#actionType").text("Current tab cookie(s)");		
		$("#cookieLayout").show();	
		$("#urlLayout").hide();	
		
		$("#showURLButton").hide();
		$("#showCookieButton").show();
		$("#deleteCookieButton").hide();
	}
});

$("input[name='userSelection']").on("click", function(){
	if ($("#userURLs").is(":checked")) {
		$("#userInputSection").show();
	}
	else {
		$("#userInputSection").hide();
	}
});
	
$("#showURLButton").on("click", function(){
	$("#errorLayout").empty();
	$("#errorLayout").hide();
	
	if ($("#private").is(":checked")) {
	   viewMode = true;
	}
	else if ($("#normal").is(":checked")) {
	   viewMode = false;
	}
	
	function openURL(url) {
		if(url !== "" && url !== "chrome://extensions/" && url !== "chrome://newtab") {
			chrome.windows.create({ url: url, "incognito": viewMode });
		}
		else {
			$("#errorLayout").append("<div>Incorrect URL</div>");
			$("#errorLayout").show();
		}
	}

	if ($("#currentURL").is(":checked")) {
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
			openURL(tabs[0].url);
		});
	}
	else if ($("#openURLs").is(":checked")) {
		chrome.tabs.query({}, function(tabs){	
			tabs.forEach(function(tab){	
				if (viewMode) {
					openURL(tab.url);
				}
				else {
					chrome.tabs.reload(tab.id);
				}
			});
		});
	}	
	else if($("#userURLs").is(":checked")) {
		let userinput = $("#urls").val();
		let urls = userinput.split("\n");
		
		for(let url of urls) {
			openURL(url);
		}
	}	
});

$("#showCookieButton").on("click", function(){		
	$("#errorLayout").empty();
	$("#errorLayout").hide();
	
	function getCookies(url) {      		
		chrome.cookies.getAll({url: url}, function(cookie) {	
			if(cookie.length < 1) {
				$("#errorLayout").append("<div>No cookie found</div>");
				$("#errorLayout").show();
			}
			else {
				$("#showCookieButton").hide();
				$("#cookieData").empty();
				$("#deleteCookieButton").show();
			}
			for(i=0;i<cookie.length;i++){
				if(i < 1) {
					currentDomain = cookie[i].domain;
					$("#cookieData").append("<div class='flex-grid'> Cookie(s) in " + cookie[i].domain + " (" + cookie.length + " used)" + "</div>");
				}
				$("#cookieData").append("<div class='flex-col'>" + cookie[i].name + ": " + cookie[i].value + "</div>");
			}
			$("#cookieData").show();
		});		
	}
	
	function getDomainFromURL(url) {
		var arr = url.split("/");
		return arr[0] + "//" + arr[2];
	}
	
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
		let url = getDomainFromURL(tabs[0].url);
		if (url !== null && url !== "" && url !== "chrome://extensions/" && url !== "chrome://newtab") {
			getCookies(url);
		}
		else {
			$("#errorLayout").append("<div>Incorrect URL " + url + "</div>");
			$("#errorLayout").show();
		}
	});
});

$("#deleteCookieButton").on("click", function(){	
	$("#errorLayout").empty();
	$("#errorLayout").hide();
	
	chrome.cookies.getAll({domain: currentDomain}, function(cookies) {
		for(var i=0; i<cookies.length;i++) {
			chrome.cookies.remove({url: "https://" + cookies[i].domain  + cookies[i].path, name: cookies[i].name});
		}
	});
	
	$("#cookieData").empty();
	$("#showCookieButton").show();
	$("#deleteCookieButton").hide();
});