var domain = "https://pictshare.net/";
renderUploads();
console.log("script loaded")
//document.getElementById("updatebtn").addEventListener("click", renderUploads);
//document.getElementById("clearhistory").addEventListener("click", clearHistory);

document.addEventListener('click',function(e){
    console.log("click from:",e.target.getAttribute('hash'));
    if(e.target)
        if(e.target.id=='clearhistory')
            clearHistory();
        else if(e.target.getAttribute('hash')!==null)
        {
            if(confirm('Do you really want to delete this file from the server?'))
                deleteContent(e.target);
        }
})

function clearHistory()
{
    chrome.storage.sync.clear()
    renderUploads()
}

function deleteContent(e)
{
    var hash = e.getAttribute('hash');
    var delcode = e.getAttribute('delcode');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", domain+"delete_"+delcode+"/"+hash, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            console.log("answer from server:"+xhr.responseText);
            chrome.storage.sync.remove([hash], function(Items) {
                console.log("removed"+hash);
                renderUploads();
            });
        }
    }
    xhr.send();
}

function renderUploads()
{
    document.getElementById('uploads').innerHTML="";
    console.log("Rendering uploads");
    chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        
        allKeys.forEach(function(key) {
            chrome.storage.sync.get([key], function(result) {
                console.log(result);
                console.log(key+" ist: ",result[key]);
                document.getElementById('uploads').innerHTML += "<a target='_blank' href='"+domain+key+"'> \
                <figure>\
                    <img src='"+domain+"50x50/forcesize/mp4/preview/"+key+"' />\
                    <figcaption>"+domain+key+"</figcaption>\
                </figure>\
                </a> \
                "+(result[key]===true?'':"<button id='del"+key+"' hash='"+key+"' delcode='"+result[key]+"' >Delete "+key+"</button>");

                //document.getElementById("del"+key).addEventListener("click", deleteContent);
              });
        });
    });

    
}