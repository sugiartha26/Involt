var involt = window.parent.involt;

var involtPin = involt.involtPin;
var involtString = involt.involtString;
var involtReceivedPin = involt.involtReceivedPin;
var involtFunction = involt.involtFunction;
var involtListenForPin = involt.involtListenForPin;

var gotData = function(receiveInfo){
	if (isSerial && receiveInfo.connectionId !== involt.id) return;
	if (isBluetooth && receiveInfo.socketId !== involt.id) return;

	var encodedString = involt.receivedStringConvert(receiveInfo.data);
	//console.log(encodedString);

	var matchingPattern = /[AF][^EAF]+\E/g;
	var dataBlock = encodedString.match(matchingPattern);

	if(dataBlock !== null){
		parseData(dataBlock);
		involt.fullString = '';
	}
	else {
		involt.fullString += encodedString;
		
		var isCompleted = involt.fullString.match(matchingPattern);

		if(isCompleted !== null){
			parseData(isCompleted);
			involt.fullString = '';
		};
		
	}; 
};

var parseData = function(data){
	//console.log(dataBlock);
	for (var j=0; j<data.length; j++){
		var indexA = data[j].indexOf('A');
		var indexV = data[j].indexOf('V');
		var indexE = data[j].indexOf('E');

		if(indexA == 0){

			var index = parseInt(data[j].substring(indexA+1,indexV));
			var value = data[j].substring(indexV+1,indexE);

			if(!isNaN(value)){
				if(value.indexOf('.')>0){
					involtReceivedPin[index] = parseFloat(value);
				}
				else {
					involtReceivedPin[index] = parseInt(value);
				};
			}
			else{
				involtReceivedPin[index] = value;
			};
			if(typeof involtListenForPin[index] === 'function') involtListenForPin[index](index, value);
		}
		else if (data[j].indexOf('F') == 0){
			var name = data[j].substring(1,indexE);
			if(typeof window["involtFunction"][name] !== 'undefined'){
				window["involtFunction"][name]();
			};
		};
	};
}

//Putting this inside the iframe has no need of post message (fix for mobile issues, postMessage is slower and causes problems in cordova);

var startListening = function(){
	if(isSerial){
		window.parent.chrome.serial.onReceive.addListener(gotData);
		window.parent.chrome.serial.onReceiveError.addListener(involt.onError);
	}
	else if(isBluetooth){
		window.parent.chrome.bluetoothSocket.onReceive.addListener(gotData);
		window.parent.chrome.bluetoothSocket.onReceiveError.addListener(involt.onError);
	};
	involt.isListening = true;
};

if(!involt.isListening){
	startListening();
}