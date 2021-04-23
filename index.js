let viewMode = false;
let currentDomain = "";
$("#userInputSection").hide();
$("#cookieDisplay").hide();
$("#errorDisplay").hide();
$("#deleteCookieButton").hide();

$("input[name='userSelection']").on("click", function(){
	if ($("#userURLs").is(":checked")) {
		$("#userInputSection").show();
	}
	else {
		$("#userInputSection").hide();
	}
});
	
$("#submitButton").on("click", function(){
	$("#errorDisplay").empty();
	$("#errorDisplay").hide();
	
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
			$("#errorDisplay").append("<div>Incorrect URL</div>");
			$("#errorDisplay").show();
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
	$("#errorDisplay").empty();
	$("#errorDisplay").hide();
	
	function getCookies(url) {      		
		chrome.cookies.getAll({url: url}, function(cookie) {	
			if(cookie.length < 1) {
				$("#errorDisplay").append("<div>No cookies found</div>");
				$("#errorDisplay").show();
			}
			else {
				$("#showCookieButton").hide();
				$("#cookieDisplay").empty();
				$("#deleteCookieButton").show();
			}
			for(i=0;i<cookie.length;i++){
				if(i < 1) {
					currentDomain = cookie[i].domain;
					$("#cookieDisplay").append("<div class='flex-grid'> Cookie Info [" + cookie[i].domain + " (" + cookie.length + " used)]" + "</div>");
				}
				$("#cookieDisplay").append("<div class='flex-col'>" + cookie[i].name + ": " + cookie[i].value + "</div>");
			}
			$("#cookieDisplay").show();
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
			$("#errorDisplay").append("<div>Incorrect URL " + url + "</div>");
			$("#errorDisplay").show();
			$("#showCookieButton").show();
		}
	});
});

$("#deleteCookieButton").on("click", function(){	
	$("#errorDisplay").empty();
	$("#errorDisplay").hide();

	chrome.cookies.getAll({domain: currentDomain}, function(cookies) {
		for(var i=0; i<cookies.length;i++) {
			chrome.cookies.remove({url: "https://" + cookies[i].domain  + cookies[i].path, name: cookies[i].name});
		}
	});
	
	$("#cookieDisplay").empty();
	$("#showCookieButton").show();
	$("#deleteCookieButton").hide();
});