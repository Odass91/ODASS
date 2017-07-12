(function()
{
	var odass = angular.module("odass", ['ngSanitize', 'html5.sortable', 'rzModule', 'ui.tree', 'xeditable', 'slick', 'ngFileUpload']);
	
	odass.config(['$httpProvider', function($httpProvider) 
	{
		  
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
	}]);
    
    odass.config(function ($locationProvider)
    {
        $locationProvider.html5Mode(false).hashPrefix("!");
    });
	
	angular.module("odass").controller('OdassController', ['$http', '$location', '$scope','Upload', function($http, $location, $scope, Upload)
	{
		this.backgrounds = [];
		this.backgroundindex = 0;
		
		this.changeBackground = function()
		{
			this.backgroundindex++;

			if (this.backgroundindex == this.backgrounds.length)
			{
				this.backgroundindex = 0;
			}
			$("#page-accueil").css("background-image", "url('images/" + this.backgrounds[this.backgroundindex] + "')");
		}
		
		
		this.init = function()
		{
			this.api_hostname = "http://perso.odass.org";
            if (window.location.hostname.match("odass.org"))
            {
                this.node_hostname = "http://node.odass.org";
            }
            else
            {
                this.node_hostname = "http://127.0.0.1:8080";
            }
			this.httpService = new OdassHTTPService($http, this.api_hostname);
			this.user = {"name": "", "modules": ["dashboard", "dubito"]};
			this.module = "page-accueil";
			
			this.debug = (window.location.search.match("debug=true")) ? true : false;
			
			this.moduleQueue = {};
			
			this.config = 
			{
				"google.maps.key": "AIzaSyBhHyThm-0LHPSoC2umkTwWNwDZyMom2Oc"
			};
			
			this.changeModule("page-accueil");
            
			if (window.location.href.match("index-cac"))
			{
				this.user.loggedIn = true;
				this.user.name = "cac";
				this.changeModule("annuaire");
			}
			else
            {
				this.user.loggedIn = true;
				this.user.name = "cac";
				this.changeModule("annuaire");
            }
            
            /* DEMO */
            if(window.location.search.match("quiz="))
            {
				this.switchToDubitoDemoMode();
            }
            
            if (! this.user.loggedIn)
			{
				$('#menu-odass-site a#' + this.module + '-item').tab('show');
			}
			else
			{
				$('#menu-odass-backoffice a#' + this.module + '-item').tab('show');
			}
			/*DEBUG mode*/
            
			/**/
		};
		
        this.switchToDubitoDemoMode = function(force)
        {
            this.user.loggedIn = true;
            this.user.name = "demo";
            var options = {"mode": "dubito"};
            if (window.location.search.match("quiz="))
            {
                var quizuuid = window.location.search.split("quiz=");
                quizuuid = quizuuid[1];
                options["quizuuid"] = quizuuid;
            }
            options.mode = "full";
            this.changeModule("dubito", options);
        }
		
		this.debugAPIcall = function()
		{
			var parameters = JSON.parse($("#form-data").val());
			var serverUrl = $("#form-action").val();
			var odass = this;
			
			console.log("debugAPIcall", parameters, serverUrl);
			
			$http.post(serverUrl, parameters).success(function(data)
            {
				odass.callbackSuccessData = "[SUCCESS] Donnees reçues : " + data;
            }).error(function(data)
            {
				odass.callbackFailureData = "[ERROR] Donnees reçues : " + data;
            });	
			
		};
		
		this.login = function()
		{
			this.user.name = $("#userNameInput").val();
			var password = $("#passwordField").val();	
            
            
            if (true)
            {
                this.user.loggedIn = true;
                this.user.name = "david";
                this.user.modules = ["dashboard", "dubito", "wizard"];
                this.changeModule("dubito");
                
                $("#login-popup").modal('hide');
                
                return;
            }
            
            
			var odass = this;
			$http.post(odass.api_hostname + "/api/apilogin", 
			{
				"login": odass.user.name,
				"motdepasse": password
			}).then(
			/**   SERVER ANSWER  */
			function(response)
			{
				if (response.data.message.Statut == "OK")
				{
					odass.user.loggedIn = true;
					odass.user.modules = ["dashboard", "dubito", "wizard"];
					odass.changeModule("dashboard");
					$("#login-popup").modal('hide');
				}
				else
				{					
					switch (response.data.message.Statut)
					{
						case "ERREUR_LOGIN_INCONNU": 
							odass.loginFeedback = "Erreur de connexion : login inconnu.";
							break;
						case "ERREUR_MOTDEPASSE_INCORRECT": 
							odass.loginFeedback = "Erreur de connexion : mot de passe incorrect.";
							break;
						default: 
							odass.loginFeedback = response.data.message.Message
							break;
					}
				}
			},
			/**   SERVER ERROR */
			function(data)
			{
				if (data.status == 404)
				{
					odass.loginFeedback = "Erreur serveur : page non trouvée.";
				}
				if (data.status == 500)
				{
					odass.loginFeedback = "Erreur serveur : exception sur le serveur";
				}
				odass.loginFeedback = data;
			});
		};
		
		
		
		this.logout = function()
		{
			this.user.name = "Anonyme"
			this.user.loggedIn = false;
			this.changeModule("page-accueil");
		};
		
		this.isModule = function(module)
		{
			return (this.module == module);
		};
		
		this.changeModule = function(module, options)
		{
			this.module = module;
			
			if (! this.user.loggedIn)
			{
				$('#menu-odass-site a#' + this.module + '-item').tab('show');
			}
			else
			{
				$('#menu-odass-backoffice a#' + this.module + '-item').tab('show');
			}
			
			if (module != "page-accueil")
            {
                this.initModule(options);
            }
		};
		
		this.initModule = function(options)
		{
			if (! this.moduleQueue[this.module])
			{
				this.moduleQueue[this.module] = true;
			}
			
			if (this.module == "dubito")
			{
				this.moduleQueue["wizard"] = true;
				//console.log("ODASS> broadcast message : ", "wizard");
				$scope.$broadcast('initModule', {"message": "wizard", "options": options});
			}
			//console.log("ODASS> broadcast message : ", this.module);
			$scope.$broadcast('initModule', {"message": this.module, "options": options});
			
			window.setTimeout(this.waitForModulesInit, 500, this, options);
		};
		
		this.waitForModulesInit = function(contexte, options)
		{
			//console.log("WINDOW> waiting for tomorrow ", contexte.moduleQueue);
			if (contexte.moduleQueue && Object.keys(contexte.moduleQueue).length > 0)
			{
				for (key in contexte.moduleQueue)
				{
					$scope.$broadcast('initModule', {"message": key, "options": options});
				}
				window.setTimeout(contexte.waitForModulesInit, 500, contexte, options);
			}
		};
		
		$('#menu-odass-site a, #menu-odass-backoffice a').click(function (e) 
		{
			  e.preventDefault();
			  $(this).tab('show');
		});
		
		this.init();
		
	}]);
	

	odass.directive("pageAccueil", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/index-odass.html'};});
	odass.directive("pageOutils", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/outils.html'};});
	odass.directive("pagePartenaires", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/partenaires.html'};});
	odass.directive("pageServices", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/services.html'};});
	odass.directive("navbarLoggedOff", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/navbar.html'};});
	odass.directive("debug", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/debug.html'};});


	odass.directive("dashboard", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/dashboard.html'};});
	odass.directive("navbarLoggedIn", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/navbar.html'};});
	
	
	odass.directive("dubito", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito/dubito.html'};});
	odass.directive("wizard", function(){return{restrict: 'E', templateUrl: 'src/app/modules/dubito-wizard/wizard.html'};});
	
	odass.directive("reperto", function(){return{restrict: 'E', templateUrl: 'src/app/modules/reperto/reperto.html'};});

	odass.directive("petitio", function(){return{restrict: 'E', templateUrl: 'src/app/modules/petitio/petitio.html'};});
	
	odass.directive("recoPopup", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/reco-popup.html'};});
	odass.directive("donatePopup", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/donate-popup.html'};});
	odass.directive("loginPopup", function(){return{restrict: 'E', templateUrl: 'src/app/backoffice/login-popup.html'};});
	odass.directive("ethiquePopup", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/ethique-odass.html'};});
	odass.directive("cguPopup", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/cgu.html'};});
	odass.directive("contactPopup", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/contact.html'};});
	odass.directive("mentionsLegalesPopup", function(){return{restrict: 'E', templateUrl: 'src/app/modules/site/mentions-legales.html'};});
})();

$(document).ready(function (){
    $("#page-accueil-item").click(function (){
        $('html, body').animate({
            scrollTop: $("body").offset().top
        }, 2000);
    });
    $("#page-outils-item").click(function (){
        $('html, body').animate({
            scrollTop: $("#page-outils").offset().top
        }, 2000);
    });
    $("#page-services-item").click(function (){
        $('html, body').animate({
            scrollTop: $("#page-services").offset().top
        }, 2000);
    });
});
