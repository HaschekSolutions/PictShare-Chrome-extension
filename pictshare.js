var bkg = chrome.extension.getBackgroundPage();

chrome.contextMenus.create({"title": "Upload this image to PictShare", "contexts":["image"], onclick: function(info)
{
  console.log(info.linkUrl);
  //console.log(info);

  if (info.srcUrl.substring(0, 4) == "data")
  {
    console.log("got base64");
    var arr = info.srcUrl.split(";");
    var arr2 = arr[0].split("/");
    uploadBase64(info.srcUrl,arr2[0]);
  }
  else if (info.srcUrl.match(/\.(gif)$/))
  {
    console.log("got gif");
    clickedImage(info.srcUrl);
  }
  else if (!info.srcUrl.match(/\.(jpg|jpeg)$/)) //everything thats not a jpg is a png
  {
    console.log("got png or something else");
    clickedImage(info.srcUrl);
    //convertImgToBase64(info.srcUrl, uploadBase64,'image/png');
  }
  else
  {
    console.log("got jpg");
    clickedImage(info.srcUrl);
    //convertImgToBase64(info.srcUrl, uploadBase64,'image/jpeg');
  }
  
}});

chrome.contextMenus.create({"title": "Show PictShare-stats page of this image", "targetUrlPatterns":["*://www.pictshare.net/*","*://pictshare.net/*"], "contexts":["image"], onclick: function(info2)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.pictshare.net/backend.php?geturlinfo="+encodeURIComponent(info2.srcUrl), true);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4) {
            var resp2 = JSON.parse(xhr.responseText);
            if(resp2.status=='ok')
            {
                chrome.tabs.create({ url: 'http://stats.pictshare.net/#'+resp2.hash });
            }
        }
    }
    xhr.send();
}});



chrome.contextMenus.create({"title": "Upload Screenshot to PictShare","contexts": ["page", "selection", "link"], onclick: function(info) {
    chrome.tabs.captureVisibleTab(null, {}, function (image) {
          console.log("Got screenshot!");
          uploadBase64(image,null);
    });
}});



function clickedImage(url)
{
  //send to pictshare
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://www.pictshare.net/backend.php?getimage="+encodeURIComponent(url), true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var resp = JSON.parse(xhr.responseText);
      if(resp.url)
      {
        chrome.tabs.create({ url: resp.url });
      }
      else if(resp.status='ERR') // if we couldn't upload, try as base64
      {
          if (!url.match(/\.(jpg|jpeg)$/))
            convertImgToBase64(url, uploadBase64,'image/png');
          else convertImgToBase64(url, uploadBase64,'image/jpeg');
      }
      bkg.console.log(resp);
    }
  }
  xhr.send();
}

function uploadBase64(info,format)
{
  console.log("Uploading in format "+format);
  var xhr = new XMLHttpRequest();

  var url = "https://www.pictshare.net/backend.php";
  var params = "format="+format+"&base64="+info;
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var resp = JSON.parse(xhr.responseText);
      if(resp.url)
      {
        chrome.tabs.create({ url: resp.url });
      }
      bkg.console.log(resp);
    }
  }
  xhr.send(params);
}

/**
 * convertImgToBase64
 * @param  {String}   url
 * @param  {Function} callback
 * @param  {String}   [outputFormat='image/png']
 * @author HaNdTriX
 * @example
  convertImgToBase64('http://goo.gl/AOxHAL', function(base64Img){
    console.log('IMAGE:',base64Img);
  })
 */
function convertImgToBase64(url, callback, outputFormat){
  console.log("converting to base64");
  var canvas = document.createElement('CANVAS');
  var ctx = canvas.getContext('2d');
  var img = new Image;
  img.crossOrigin = 'Anonymous';
  img.onload = function(){
    canvas.height = img.height;
    canvas.width = img.width;
      ctx.drawImage(img,0,0);
      var dataURL = canvas.toDataURL(outputFormat || 'image/png');
      callback.call(this, dataURL,outputFormat);
        // Clean up
      canvas = null; 
  };
  img.src = url;
}