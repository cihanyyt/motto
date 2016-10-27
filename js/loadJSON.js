/**
 * Created by Z003EUNW on 10/26/2016.
 */

function loadd() {
    var xmlhttp = new XMLHttpRequest();
    var url = "js/members.json";
    var myArr;
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 ) {
            myArr = JSON.parse(this.responseText);
            <!--
            for(var i = 0; i <myArr.members.length; i++)
                alert(myArr.members[i].name + myArr.members[i].type);
            -->
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    return myArr;
}
