"use strict"


function DisplayFindResults()
{
  
  var myObj = {FromDate :window.sessionStorage.getItem("FromDate"), FromTime:window.sessionStorage.getItem("FromTime"), ToDate:window.sessionStorage.getItem("ToDate"), ToTime:window.sessionStorage.getItem("ToTime"), SearchCategory: window.sessionStorage.getItem("SearchCategory"), SearchLocation: window.sessionStorage.getItem("SearchLocation")};
  var i; 
  document.getElementById("SearchResultTitle").innerHTML = window.sessionStorage.getItem("FromDate") + " - " + window.sessionStorage.getItem("ToDate") + ", " + window.sessionStorage.getItem("SearchCategory") + " , " + window.sessionStorage.getItem("SearchLocation");

  const xhr = new XMLHttpRequest();
  // it will be a POST request, the URL will this page's URL+"/upload" 
  xhr.open("POST", "/SubmitSearchResults", true);
  xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
  xhr.onreadystatechange = function()
  {
    if(xhr.readyState===4 && xhr.status === 200)
    {
          
         let responseStr = xhr.responseText;// get the JSON string
         //alert(responseStr);
         var array = JSON.parse("[" + responseStr + "]");

         // iterate through the JSON objects received from the server 
         // and print each object contents into the inner HTML
         for (i=0; i<array[0].length; i++)
         {
            var menuitemnode = document.createElement("div");  // Create a menu item node
            menuitemnode.setAttribute('class','menu-item');
            var buttonitemnode = document.createElement("button");  // Create a button/collapsible item
            buttonitemnode.setAttribute('id', 'title');
            buttonitemnode.setAttribute('class','collapsible');
            buttonitemnode.innerHTML = array[0][i].title;
            menuitemnode.appendChild(buttonitemnode);
            
            //create the contents of this searched item
            var contentsNode = document.createElement("div");
            contentsNode.setAttribute('class','content');
           
            // add the image to the collapsible element
            var imgNode = document.createElement("IMG");
            imgNode.setAttribute("src", array[0][i].imageurl);
            imgNode.setAttribute("id", "serverImage");
            imgNode.setAttribute("class", "pic");
            contentsNode.appendChild(imgNode);
           
            // add the text div tag
           var textNode = document.createElement("div");
           textNode.setAttribute('class','text');
            
            // add the category of the searched element
            var contentFlexNode1 = document.createElement("div");
            contentFlexNode1.innerHTML = "<div class='content-flex'><p class='name'>Category:</p><p id='category'>" + array[0][i].category + "</p></div>";
            textNode.appendChild(contentFlexNode1);
           
            // add the location of the searched element
            var contentFlexNode2 = document.createElement("div");
            contentFlexNode2.innerHTML = "<div class='content-flex'><p class='name'>Location:</p><p id='location'>" + array[0][i].location + "</p></div>";
            textNode.appendChild(contentFlexNode2);
           
            // add the Date of the searched element
            var contentFlexNode3 = document.createElement("div");
            contentFlexNode3.setAttribute('class', 'text');
            contentFlexNode3.innerHTML = "<div class='content-flex'><p class='name'>Date:</p><p id='date'>" + array[0][i].date + "</p></div>";
            textNode.appendChild(contentFlexNode3);           
           
            // add the Time of the searched element
            var contentFlexNode4 = document.createElement("div");
            contentFlexNode4.setAttribute('class', 'text');
            contentFlexNode4.innerHTML = "<div class='content-flex'><p class='name'>Time:</p><p id='time'>" + array[0][i].time + "</p></div>";
            textNode.appendChild(contentFlexNode4);             
            
            // add the Description of the searched element
            var contentFlexNode5 = document.createElement("div");
            contentFlexNode5.setAttribute('class', 'text');
            contentFlexNode5.innerHTML = "<div class='content-flex'><p class='name'>Description:</p><p id='description'>" + array[0][i].description + "</p></div>";
            textNode.appendChild(contentFlexNode5);  
	          
           // append textNode to the contentsNode
           contentsNode.appendChild(textNode);
           
            // append the contentsNode to the menuitemnode 
            menuitemnode.appendChild(contentsNode); 
           
            // finally add the menuitemnode to the collapsible menu ID
            document.getElementById("collapsible-menuid").appendChild(menuitemnode);                                              	
         } 
        var coll = document.getElementsByClassName("collapsible");
        var i;

        for (i = 0; i < coll.length; i++) {
          coll[i].addEventListener("click", function() {
          this.classList.toggle("active");
          var content = this.nextElementSibling;
          if (content.style.display === "flex") {
            content.style.display = "none";
          } else {
            content.style.display = "flex";
            content.style.flexDirection = "row";

          }
        });
      }
    }
  };
  var data = JSON.stringify(myObj);
  xhr.send(data);
}

window.onload=DisplayFindResults;
