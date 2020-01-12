angular.module('myApp', [
    'ngRoute',
    'mobile-angular-ui',
	'btford.socket-io'
]).config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'home.html',
        controller: 'Home'
    });
}).factory('mySocket', function (socketFactory) {
	var myIoSocket = io.connect('/webapp');	//Tên namespace webapp

	mySocket = socketFactory({
		ioSocket: myIoSocket
	});
	return mySocket;
	
/////////////////////// Những dòng code ở trên phần này là phần cài đặt, các bạn hãy đọc thêm về angularjs để hiểu, cái này không nhảy cóc được nha!
}).controller('Home', function($scope, mySocket) {
	////Khu 1 -- Khu cài đặt tham số 
    //cài đặt một số tham số test chơi
	//dùng để đặt các giá trị mặc định
	$scope.mode_status = [1]

    $scope.CamBienMua = "Không biết nữa ahihi, chưa thấy có thằng nào cập nhập hết";
    $scope.CamBienAnhSang = "Không biết nữa ahihi, chưa thấy có thằng nào cập nhập hết";
    $scope.CamBienDoAmDat = "Không biết nữa ahihi, chưa thấy có thằng nào cập nhập hết";
    $scope.CamBienDHT11Humi = [""];
    $scope.CamBienDHT11Temp = [""];

    $scope.leds_status = [1, 1, 1]

    $scope.roof_status = [1]

	$scope.lcd = ["", ""]

	$scope.buttons = [] //chả có gì cả, arduino gửi nhiêu thì nhận nhiêu!
	
	////Khu 2 -- Cài đặt các sự kiện khi tương tác với người dùng
	//các sự kiện ng-click, nhấn nút
	$scope.updateSensor  = function() {
		mySocket.emit("SENSOR")
	}
	
	
	//Cách gửi tham số 1: dùng biến toàn cục! $scope.<tên biến> là biến toàn cục
	$scope.changeLED = function() {
		console.log("send LED ", $scope.leds_status)
		
		var json = {
			"relay": $scope.leds_status
		}
		mySocket.emit("RELAY", json)
	}
	
	$scope.changeROOF = function() {
		console.log("send ROOF ", $scope.roof_status)
		
		var json = {
			"ROOF": $scope.roof_status
		}
		mySocket.emit("ROOF", json)
	}

	$scope.changeMODE = function() {
		console.log("send MODE ", $scope.mode_status)
		
		var json = {
			"MODE": $scope.mode_status
		}
		mySocket.emit("MODE", json)
	}

	//cập nhập lcd như một ông trùm 
	$scope.updateLCD = function() {
		
		
		var json = {
			"line": $scope.lcd
		}
		console.log("LCD_PRINT ", $scope.lcd)
		mySocket.emit("LCD_PRINT", json)
	}
	

	
	////Khu 3 -- Nhận dữ liệu từ Arduno gửi lên (thông qua ESP8266 rồi socket server truyền tải!)
	//các sự kiện từ Arduino gửi lên (thông qua esp8266, thông qua server)
	mySocket.on('SENSOR', function(json) {
		console.log("receive SENSOR", json)
		$scope.CamBienMua = (json.rainSensor == 1) ? "Không mưa" : "Có mưa rồi yeah ahihi"
		$scope.CamBienAnhSang = (json.lightSensor == 1) ? "Troi Toi" : "Troi Sang"
		$scope.CamBienDoAmDat = (json.soilMoistureSensor == 1) ? "Do Am Tuong Doi Thap" : "Do Am Cao ^.^ "
		$scope.CamBienDHT11Humi = (json.humidity)
		$scope.CamBienDHT11Temp = (json.temperature)
	})
		//Khi nhận được lệnh RELAY
	mySocket.on('RELAY', function(json) {
		//Nhận được thì in ra thôi hihi.
		console.log("receive RELAY", json)
		$scope.buttons = json
	})

	
	//// Khu 4 -- Những dòng code sẽ được thực thi khi kết nối với Arduino (thông qua socket server)
	mySocket.on('connect', function() {
		console.log("Connected!!!")
		mySocket.emit("SENSOR") //Cập nhập trạng thái mưa
		console.log("Cập nhập trạng thái mưa")
		
	})
		
});