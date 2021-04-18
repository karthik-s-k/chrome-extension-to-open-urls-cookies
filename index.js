document.getElementById('openButton').addEventListener('click',function(){
	let userinput = document.getElementById('urls').value;
    let urls = userinput.split("\n");
	
	for(let url of urls) {
		console.log(url);
		chrome.windows.create({ url: url, "incognito": true });
	}
});