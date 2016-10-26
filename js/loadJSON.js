/**
 * Created by Z003EUNW on 10/26/2016.
 */

function load() {
    var xmlhttp = new XMLHttpRequest();
    var url = "js/members.json";

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 ) {
            var myArr = JSON.parse(this.responseText);
            for(var i = 0; i <myArr.members.length; i++)
                alert(myArr.members[i].name + myArr.members[i].type);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}
