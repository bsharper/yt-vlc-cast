javascript:turl="http://localhost:3111/?b64url="+btoa(location.href.toString());st=-1;try{mp=document.getElementById("movie_player");et=Math.round(mp.getVideoStats().len);st=Math.round((mp).getCurrentTime())}catch(e){};if(st>-1)turl+="&st="+st+"&et="+et;location.href=turl;