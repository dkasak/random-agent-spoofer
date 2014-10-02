var PageMod = require("sdk/page-mod"),
	PrefServ = require("./PrefServ"),
    Ras = require("./Ras"),
	Data = require("./Data"),
    whiteListStateArray = new Array (5), //store the state of the whitelist state and js whitelist options
    dateInfo; 

exports.init = function(){

	PageMod.PageMod({
    	include: "*",
     	contentScriptFile: Data.get("js/inject.js"),
     	contentScriptWhen: "start",
        attachTo: ["top", "frame"],

  		onAttach: function(worker) {

            //(Re)set whitelist values to false 
            for(i=0;i<whiteListStateArray.length;i++){
                whiteListStateArray[i] = false;
            }

            if(PrefServ.getter("extensions.agentSpoof.whiteListDisabled") == false){
                //check if the current url is in the whitelist
                whiteListStateArray[0] = listCheck(PrefServ.getter("extensions.agentSpoof.siteWhiteList").split(','),worker.tab.url);
            }
 
  			if(PrefServ.getter("extensions.agentSpoof.enabled") == true){
                dateInfo = getDateInfo(); //generate fake date info
    			worker.port.emit("inject",getIntParams(),getStrParams(),getBoolParams());
    		}
    	}	
	});

};


//check if  a url is in the list
function listCheck(list,url){ 
       
    for (var i=0; i<list.length; i++){
        if (url.indexOf(list[i]) > -1){
            
            //check the config for the url now confirmed to be in the list
            checkWhiteListConfig(i);
            return true;
        }
        
    }

    return false;
};

function checkWhiteListConfig(index){

    //get the whitelist entry
    var whiteListItem = Ras.getFullWhiteListEntry(index) ;
    
    if(whiteListItem.canvas === true)
        whiteListStateArray[1] = true;
    else
        whiteListStateArray[1] = false;

    if(whiteListItem.windowName === true)
        whiteListStateArray[2] = true;
    else
        whiteListStateArray[2] = false;

    if(whiteListItem.screen === true)
        whiteListStateArray[3] = true;
    else
        whiteListStateArray[3] = false;
    
    if(whiteListItem.date === true)
        whiteListStateArray[4] = true;
    else
        whiteListStateArray[4] = false;

};

function getBoolParams(){
    
    var bParams = new Array();

    bParams[0] = whiteListStateArray[0];

    //check if the canvas has been set to be whitelisted
    if (whiteListStateArray[1] === true)
        bParams[1] = false ;
    else
        bParams[1] = PrefServ.getter("extensions.agentSpoof.canvas");


    //check if window.name has been set to be whitelisted
    if (whiteListStateArray[2] === true)
        bParams[2] = false ;
    else
        bParams[2] = PrefServ.getter("extensions.agentSpoof.windowName");

    //check if screen and window spoofing have been set to whitelisted
    if (whiteListStateArray[3] === true)
        bParams[3] = false ;
    else
        bParams[3] = true;

    //check if date spoofing has been set to be whitelisted or if the default timezone was selected
    if (whiteListStateArray[4] === true || PrefServ.getter("extensions.agentSpoof.tzOffset") == "default")
        bParams[4] = false ;
    else
        bParams[4] = true;

    return bParams;
}


function getStrParams(){
    var sParams = new Array();

    // Vendor override value sent with non whitelisted profiles
    sParams[0] = PrefServ.getter("general.useragent.vendor");
    
    // Whitelist profile values
    // Whitelist headers need to be sent along with this
    // Whitelist headers are sent in Chrome.js

    sParams[1] = PrefServ.getter("extensions.agentSpoof.whiteListUserAgent");
    sParams[2] = PrefServ.getter("extensions.agentSpoof.whiteListAppCodeName");
    sParams[3] = PrefServ.getter("extensions.agentSpoof.whiteListAppName");
    sParams[4] = PrefServ.getter("extensions.agentSpoof.whiteListAppVersion");
    sParams[5] = PrefServ.getter("extensions.agentSpoof.whiteListVendor");
    sParams[6] = PrefServ.getter("extensions.agentSpoof.whiteListVendorSub");
    sParams[7] = PrefServ.getter("extensions.agentSpoof.whiteListPlatform");
    sParams[8] = PrefServ.getter("extensions.agentSpoof.whiteListOsCpu");
    
    //spoofed date strings
    sParams[9] =  dateInfo[0].dateStrings[0];
    sParams[10] = dateInfo[0].dateStrings[1];
    sParams[11] = dateInfo[0].dateStrings[2];

    return sParams;
}


function getIntParams(){
   var params = new Array();
    params[0] = dateInfo[0].tzoffset;

    var screens = getAndSetScreenSize();

    params[1] = screens[0]; // screen.width
    params[2] = screens[1]; // screen.height
    params[3] = screens[0]; // screen.availWidth
    params[4] = screens[1]; // screen.availHeight
    params[5] = screens[0]; // window.innerWidth
    params[6] = screens[1]; // window.innerHeight
    params[7] = screens[0]; // window.outerWidth
    params[8] = screens[1]; // window.outerHeight
    //params[9] = 24; // screen.colorDepth

    return params;
};



function getAndSetScreenSize(){
    
    if (PrefServ.getter("extensions.agentSpoof.screenSize") == "default"){

        return [null,null];

    }else if(PrefServ.getter("extensions.agentSpoof.screenSize") == "random"){
        

        // https://en.wikipedia.org/wiki/Display_resolution#Computer_monitors
        var screensizes = ["800x600","1024x600","1024x768","1152x864","1280x720","1280x768","1280x800",
        "1280x960","1280x1024","1360x768","1366x768","1440x900","1400x1050","1600x900","1600x1200",
        "1680x1050","1920x1080","1920x1200","2048x1152","2560x1440","2560x1600"];
        
        var rand_size = screensizes[Math.floor(Math.random()*screensizes.length)];
        var sizes = rand_size.split('x');

        return [parseInt(sizes[0]),parseInt(sizes[1])];

    }else{

        var sizes = (PrefServ.getter("extensions.agentSpoof.screenSize").split('x'));
        return [parseInt(sizes[0]),parseInt(sizes[1])];
    }

}

//get a random number from 0 - maximum 
function getRandomNum(maximum){
    return Math.floor(Math.random()*maximum) 
};

function getTimeZoneOffset(){
    
    //a random offset was chosen
    if(PrefServ.getter("extensions.agentSpoof.tzOffset") == "random"){
        // https://en.wikipedia.org/wiki/Time_zone#List_of_UTC_offsets
        var offsets =  [-14,-13,-12.75,-12,-11.5,-11,-10.5,
                        -10,-9.5,-9,-8.75,-8,-7,-6.5,-6,-5.75,
                        -5.5,-5,-4.5,-4,-3.5,-3,-2,-1,0,1,2,
                        3.5,4,4.5,5,6,7,8,9,
                        9.5,10,11,12];

        var rand_offset = offsets[getRandomNum(offsets.length)];
        return rand_offset * 60;
        
    }else{ //a specific timezone was chosen
        
        var offset = parseFloat(PrefServ.getter("extensions.agentSpoof.tzOffset"));
        return offset * 60;
    }
};


function pad(num) {
    norm = Math.abs(Math.floor(num));
    return (norm < 10 ? '0' : '') + norm;
};

function getDateInfo(){

    //TimeZone
    var tzoffset = getTimeZoneOffset();

    //if default there is no point in spoofing values as they will be skipped so return
    if(PrefServ.getter("extensions.agentSpoof.tzOffset") == "default"){
        return [{"tzoffset": tzoffset,"dateStrings": ["","",""]}];
    }
 
    //TODO
    //other date functions

    //Date
    var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    //time zone abbreviations which match to utc offsets in getTimeZoneOffset()
    //https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations
    var tzAbbrev = [
            {"-840":["(LINT)"],
            "-780":["(NZDT)","(PHOT)","(TKT)","(TOT)"],
            "-765":["(CHAST)"],
            "-720":["(FJT)","(GILT)","(MAGT)","(MHT)","(NZST)","(PETT)","(TVT)","(WAKT)"],
            "-690":["(NFT)"],
            "-660":["(AEDT)","(KOST)","(LHST)","(MIST)","(NCT)","(PONT)","(SAKT)","(SBT)","(VUT)"],
            "-630":["(ACDT)","(CST)","(LHST)"],
            "-600":["(AEST)","(ChST)","(CHUT)","(DDUT)","(EST)","(PGT)","(VLAT)","(YAKT)"],
            "-570":["(ACST)","(CST)"],
            "-540":["(AWDT)","(EIT)","(IRKT)","(JST)","(KST)","(TLT)"],
            "-525":["(CWST)"],
            "-480":["(ACT)","(AWST)","(BDT)","(CHOT)","(CIT)","(CT)","(HKT)","(MST)","(MYT)","(PST)","(SGT)","(SST)","(ULAT)","(WST)"],
            "-420":["(CXT)","(DAVT)","(HOVT)","(ICT)","(KRAT)","(OMST)","(THA)","(WIT)"],
            "-390":["(CCT)","(MMT)","(MST)"],
            "-360":["(BIOT)","(BST)","(BTT)","(KGT)","(VOST)","(YEKT)"],
            "-345":["(NPT)"],
            "-330":["(IST)","(SLST)"],
            "-300":["(AMST)","(HMT)","(MAWT)","(MVT)","(ORAT)","(PKT)","(TFT)","(TJT)","(TMT)","(UZT)"],
            "-270":["(AFT)","(IRDT)"],
            "-240":["(AMT)","(AZT)","(GET)","(GST)","(MSK)","(MUT)","(RET)","(SAMT)","(VOLT)"],
            "-210":["(IRST)"],
            "-180":["(AST)","(EAT)","(EEDT)","(EEST)","(FET)","(IDT)","(IOT)","(SYOT)"],
            "-120":["(CAT)","(CEDT)","(CEST)","(EET)","(HAEC)","(IST)","(MEST)","(SAST)","(WAST)"],
            "-60":["(BST)","(CET)","(DFT)","(IST)","(MET)","(WAT)","(WEDT)","(WEST)"],
            "0":["(GMT)","(UCT)","(UTC)","(WET)","(Z)"],
            "60":["(AZOST)","(CVT)","(EGT)"],
            "120":["(FNT)","(GST)","(PMDT)","(UYST)"],
            "180":["(ADT)","(AMST)","(ART)","(BRT)","(CLST)","(FKST)","(GFT)","(PMST)","(PYST)","(ROTT)","(SRT)","(UYT)"],
            "210":["(NST)","(NT)"],
            "240":["(AMT)","(AST)","(BOT)","(CDT)","(CLT)","(COST)","(ECT)","(EDT)","(FKT)","(GYT)","(PYT)"],
            "270":["(VET)"],
            "300":["(CDT)","(COT)","(CST)","(EASST)","(ECT)","(EST)","(PET)"],
            "360":["(CST)","(EAST)","(GALT)","(MDT)"],
            "420":["(MST)","(PDT)"],
            "480":["(AKDT)","(CIST)","(PST)"],
            "540":["(AKST)","(GAMT)","(GIT)","(HADT)"],
            "570":["(MART)","(MIT)"],
            "600":["(CKT)","(HAST)","(HST)","(TAHT)"],
            "660":["(NUT)","(SST)"],
            "720":["(BIT)"]}];

    // get localized date object
    var now = new Date();
    var dif = tzoffset <= 0 ? '+' : '-';
    
    //create spoofed date object with offsets to calculate the correct date & time.
    var sdate = new Date(now.getFullYear(),now.getMonth(),now.getDate(),
        now.getUTCHours() + (parseInt((tzoffset * -1) / 60 )),
        now.getUTCMinutes() + ( tzoffset % 60),now.getSeconds());
 
   
    var padHoursOffset = pad(sdate.getHours());
    var padMinsOffset = pad(sdate.getMinutes());
    var padSecsOffset = pad(sdate.getSeconds());


    //Date.toString() override
    var dateString = days[sdate.getDay()] + " ";
        dateString += months[sdate.getMonth()]+ " ";
        dateString += sdate.getDate() + " ";
        dateString += sdate.getFullYear() + " ";
        dateString += padHoursOffset + ":";
        dateString += padMinsOffset + ":"; 
        dateString += padSecsOffset + " GMT";
        dateString += dif + pad(parseInt(tzoffset/60) ); 
        dateString += pad( tzoffset % 60) + " ";
        dateString +=  tzAbbrev[0][tzoffset.toString()][getRandomNum(tzAbbrev[0][tzoffset.toString()].length )];


    //Date.toLocaleString() override
    var localeString = sdate.getDate() + "/" ;
        localeString += (sdate.getMonth()+1) + "/";
        localeString += sdate.getFullYear() + " ";
        localeString += padHoursOffset+ ":";
        localeString += padMinsOffset + ":"; 
        localeString += padSecsOffset;

    //Date.toLocaleDateString() override
    var localeDateString = sdate.getDate() + "/" ;
        localeDateString += (sdate.getMonth()+1) + "/";
        localeDateString += sdate.getFullYear(); 

    return [{"tzoffset": tzoffset,"dateStrings": [dateString,localeString,localeDateString]}];
};