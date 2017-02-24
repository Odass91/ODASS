(function()
{
	var odass = angular.module("odass", ['ngSanitize', 'html5.sortable', 'rzModule', 'ui.tree', 'xeditable', 'slick']);
	
	odass.config(['$httpProvider', function($httpProvider) 
	{
		  
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
	}]);
	
	angular.module("odass").controller('OdassController', ['$http', '$location', '$scope', function($http, $location, $scope)
	{
		this.backgrounds = 
		[
		 	"vitrine-background.jpg", 
			"vitrine-background-1.jpg",
			"vitrine-background-2.jpg",
			"vitrine-background-3.jpg",
			"vitrine-background-4.jpg",
			"vitrine-background-5.jpg",
			"vitrine-background-6.jpg",
			"vitrine-background-7.jpg",
			"vitrine-background-8.jpg",
			"vitrine-background-9.jpg"
		];
		
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
			this.hostname = "http://perso.odass.org";
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
                this.user.name = "david";
                this.changeModule("dashboard");
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
			var odass = this;
			$http.post(odass.hostname + "/api/apilogin", 
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
		
		this.changeModule = function(module)
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
                this.initModule();
            }
		};
		
		this.initModule = function()
		{
			if (! this.moduleQueue[this.module])
			{
				this.moduleQueue[this.module] = true;
			}
			
			if (this.module == "dubito")
			{
				this.moduleQueue["wizard"] = true;
				$scope.$broadcast('initModule', {"message": "wizard"});
			}
            console.log("EMISSION DU MESSAGE", this.module);
			$scope.$broadcast('initModule', {"message": this.module});
			
			window.setTimeout(this.waitForModulesInit, 500, this);
		};
		
		this.waitForModulesInit = function(contexte)
		{
            console.log("WAITING FOR TOMORROW", Object.keys(contexte.moduleQueue).length);
			if (contexte.moduleQueue && Object.keys(contexte.moduleQueue).length > 0)
			{
				for (key in contexte.moduleQueue)
				{
					$scope.$broadcast('initModule', {"message": key});
				}
				window.setTimeout(contexte.waitForModulesInit, 500, contexte);
			}
		};
		
		$('#menu-odass-site a, #menu-odass-backoffice a').click(function (e) 
		{
			  e.preventDefault();
			  $(this).tab('show');
		});
		
		this.init();
		
	}]);
	

	odass.directive("pageAccueil", function(){return{restrict: 'E', templateUrl: 'modules/site/index-odass.html'};});
	odass.directive("pageOutils", function(){return{restrict: 'E', templateUrl: 'modules/site/outils.html'};});
	odass.directive("pagePartenaires", function(){return{restrict: 'E', templateUrl: 'modules/site/partenaires.html'};});
	odass.directive("pageServices", function(){return{restrict: 'E', templateUrl: 'modules/site/services.html'};});
	odass.directive("navbarLoggedOff", function(){return{restrict: 'E', templateUrl: 'modules/site/navbar.html'};});
	odass.directive("debug", function(){return{restrict: 'E', templateUrl: 'modules/site/debug.html'};});


	odass.directive("dashboard", function(){return{restrict: 'E', templateUrl: 'backoffice/dashboard.html'};});
	odass.directive("navbarLoggedIn", function(){return{restrict: 'E', templateUrl: 'backoffice/navbar.html'};});
	
	
	odass.directive("dubito", function(){return{restrict: 'E', templateUrl: 'modules/dubito/dubito.html'};});
	odass.directive("wizard", function(){return{restrict: 'E', templateUrl: 'modules/dubito-wizard/wizard.html'};});
	
	odass.directive("calendo", function(){return{restrict: 'E', templateUrl: 'modules/calendo/calendo.html'};});
	odass.directive("agendo", function(){return{restrict: 'E', templateUrl: 'modules/agendo/agendo.html'};});
	odass.directive("reperto", function(){return{restrict: 'E', templateUrl: 'modules/reperto/reperto.html'};});

	odass.directive("projecto", function(){return{restrict: 'E', templateUrl: 'modules/projecto/projecto.html'};});
	odass.directive("ressourczo", function(){return{restrict: 'E', templateUrl: 'modules/ressourczo/ressourczo.html'};});
	odass.directive("niouzo", function(){return{restrict: 'E', templateUrl: 'modules/niouzo/niouzo.html'};});

	odass.directive("panamo", function(){return{restrict: 'E', templateUrl: 'modules/panamo/panamo.html'};});
	odass.directive("budgeto", function(){return{restrict: 'E', templateUrl: 'modules/budgeto/budgeto.html'};});
	odass.directive("facturo", function(){return{restrict: 'E', templateUrl: 'modules/facturo/facturo.html'};});

	odass.directive("agoro", function(){return{restrict: 'E', templateUrl: 'modules/agoro/agoro.html'};});
	odass.directive("collabo", function(){return{restrict: 'E', templateUrl: 'modules/collabo/collabo.html'};});
	odass.directive("votatio", function(){return{restrict: 'E', templateUrl: 'modules/votatio/votatio.html'};});
	odass.directive("texto", function(){return{restrict: 'E', templateUrl: 'modules/texto/texto.html'};});
	odass.directive("petitio", function(){return{restrict: 'E', templateUrl: 'modules/petitio/petitio.html'};});

	odass.directive("stocko", function(){return{restrict: 'E', templateUrl: 'modules/stocko/stocko.html'};});
	odass.directive("catalogo", function(){return{restrict: 'E', templateUrl: 'modules/catalogo/catalogo.html'};});
	odass.directive("boutico", function(){return{restrict: 'E', templateUrl: 'modules/boutico/boutico.html'};});
	
	odass.directive("recoPopup", function(){return{restrict: 'E', templateUrl: 'backoffice/reco-popup.html'};});
	odass.directive("donatePopup", function(){return{restrict: 'E', templateUrl: 'backoffice/donate-popup.html'};});
	odass.directive("loginPopup", function(){return{restrict: 'E', templateUrl: 'backoffice/login-popup.html'};});
	odass.directive("ethiquePopup", function(){return{restrict: 'E', templateUrl: 'modules/site/ethique-odass.html'};});
	odass.directive("cguPopup", function(){return{restrict: 'E', templateUrl: 'modules/site/cgu.html'};});
	odass.directive("contactPopup", function(){return{restrict: 'E', templateUrl: 'modules/site/contact.html'};});
	odass.directive("mentionsLegalesPopup", function(){return{restrict: 'E', templateUrl: 'modules/site/mentions-legales.html'};});
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
