var appswitcher_visible;
var focusedElement = null;
var switchOpen = false;
document.onkeydown = function(e){ 
          if (e == null) { // ie 
            keycode = event.keyCode; 
          } else { // mozilla 
            keycode = e.which; 
          } 
          if(keycode == 27){  
              if(switchOpen){
              	
              	hideSwitcher();
              }else{
              	displaySwitcher();
              }
	} 
};

$(document).ready(function() {
	$('body').append('<div id="appswitcher-outer" class="SwitcherDisabled"></div>');
	$('body').append('<div id="appswitcher-inner" class="SwitcherDisabled"></div>');
	$('#appswitcher-inner').append('<a  tabindex="1" id="appswitcher-start"/></a>');
	createAppEntry(1, carDevice.geo, '../../obd-manager/general/images/icon.png', 'javascript:findGeo();');
	createAppEntry(2, carDevice.obd, '../../obd-manager/tripcomputer_obdreview/icon.png', 'javascript:findObd();');
	$('#appswitcher-inner').append('<a  tabindex="1" id="appswitcher-end"/></a>');
	$('#appswitcher-start').bind('focus', function(){
		$('#app1').focus();
	});
	
	$('#appswitcher-end').bind('focus', function(){
		$('#app2').focus();
	});

});
function resultsFromDashboard(data){
    if (waitingFromDashboard != null){
        if (data.result.length == 1){
            if (carDevice[waitingFromDashboard]==null || carDevice[waitingFromDashboard].id != data.result[0].id){
                carDevice[waitingFromDashboard] = data.result[0];
                waitingFromDashboard = null;
                carDevice.changed = true;
                if (typeof localStorage != "undefined"){
                    localStorage.setItem("vehicleHubCarDevice", JSON.stringify(carDevice));
                }
            }
        }
        updateOptions();
    }
}
var waitingFromDashboard = null;
function findObd(){
    webinos.dashboard.open({
        module:'explorer',
        data:{
            service:[
                'http://webinos.org/api/sensors/rpm',
                'http://webinos.org/api/sensors/vss',
                'http://webinos.org/api/sensors/load_pct',
                'http://webinos.org/api/sensors/frp',
                'http://webinos.org/api/sensors/temp'
            ],
            select:"devices"
        }
    }, function(){waitingFromDashboard = "obd";})
        .onAction(resultsFromDashboard);
}
function findGeo(){
    webinos.dashboard.open({
        module:'explorer',
        data:{
            service:['http://www.w3.org/ns/api-perms/geolocation'],
            select:"devices"
        }
    }, function(){waitingFromDashboard = "geo";})
        .onAction(resultsFromDashboard);
}
function displaySwitcher(){
//    updateOptions();
	$('#appswitcher-inner').removeClass('SwitcherDisabled');
	$('#appswitcher-outer').removeClass('SwitcherDisabled');
	focusedElement = document.activeElement.id;
	$('#app1').focus();
    switchOpen = true;
    
}

function hideSwitcher(){
	$('#appswitcher-inner').addClass('SwitcherDisabled');
	$('#appswitcher-outer').addClass('SwitcherDisabled');
	$('#'+focusedElement).focus();
    switchOpen = false;
//    deviceListChanged();
    if (carDevice.changed)
        window.location.reload()
}

function updateOptions() {
    var opt1 = $('#option1');
    var opt2 = $('#option2');
    for (var i = 0; i < webinos.session.getConnectedPzp().length; i++) {
        var tmpDevice = webinos.session.getConnectedPzp()[i];
        if (carDevice.geo && tmpDevice.id == carDevice.geo.id){
            carDevice.geo = tmpDevice;
        }
        if (carDevice.obd && tmpDevice.id == carDevice.obd.id){
            carDevice.obd = tmpDevice;
        }
    }
    if (carDevice.geo!=null){
        opt1.children(".app-desc").text(carDevice.geo.friendlyName);
        if (typeof carDevice.geo.isConnected !== "undefined"){
            if (carDevice.geo.isConnected){
                opt1.toggleClass("online", true);
                opt1.toggleClass("offline", false);
            }else{
                opt1.toggleClass("online", false);
                opt1.toggleClass("offline", true);
            }
        }else{
            opt1.toggleClass("online", false);
            opt1.toggleClass("offline", false);
        }
    }else{
        opt1.children(".app-desc").text("");
        opt1.toggleClass("online", false);
        opt1.toggleClass("offline", false);
    }
    if (carDevice.obd!=null){
        opt2.children(".app-desc").text(carDevice.obd.friendlyName);
        if (typeof carDevice.obd.isConnected !== "undefined"){
            if (carDevice.obd.isConnected){
                opt2.toggleClass("online", true);
                opt2.toggleClass("offline", false);
            }else{
                opt2.toggleClass("online", false);
                opt2.toggleClass("offline", true);
            }
        }else{
            opt2.toggleClass("online", false);
            opt2.toggleClass("offline", false);
        }
    }else{
        opt2.children(".app-desc").text("");
        opt2.toggleClass("online", false);
        opt2.toggleClass("offline", false);
    }
}

function createAppEntry(id, device, icon, url){
	if(url.trim() == ""){
		url = "javascript:hideSwitcher();";
	}
    if (device == null) device = "";
    var statusClass = "";
    if (typeof device.isConnected !== "undefined"){
        if (device && device.isConnected) statusClass = "online";
        if (device && !device.isConnected) statusClass = "offline";
    }

	
	$('#appswitcher-inner').append('<div class="appbox '+statusClass+'" id="option'+id+'"><div class="app-icon"><ul><li><a href="'+url+'" id="app'+id+'" tabindex="1"><img src="'+icon+'" height="90" width="90"></a></li></ul></div><div class="app-desc">'+device+'</div></div>');

}
