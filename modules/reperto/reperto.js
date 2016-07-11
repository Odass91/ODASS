(function()
{
	
	/** 
	 * 
	 * TODO : 
	 * 		-> suppression de filtre
	 * 		-> sauvegarde des favoris
	 *    	-> ajustement de la liste de suggestions de mot-clefs
	 * 
	 * */
	var odass = angular.module("odass").controller('RepertoController', ['$http', '$location', function($http, $location)
	{
		
		/** Google maps data */
		this.geoloc = 
		{
			"national": new google.maps.LatLng(48.858273,2.3473697),
			"chaville": new google.maps.LatLng(48.807273, 2.187902),
			"nanterre": new google.maps.LatLng(48.887187, 2.200389),
			"nantes": new google.maps.LatLng(47.215795, -1.551078),
			"notre dame des landes": new google.maps.LatLng(47.375285, -1.705601),
			"hauts de seine": new google.maps.LatLng(48.8399131,2.1009993)
		};
		
		this.markerList = {};
		this.initiatives_gmap = null;
	
		
		/** Thesaurus data */
		this.data = 
		{
			"thesaurus":
			[
				{
					"label": "Ecologie",
					"type": "keywords",
					"description": "Répertoire de propositions concrètes pour une écologie au quotidien",
					"keywords": ["ecologie"],
					"tree":
					[
					 	{
					 		"id": "ecologie-1",
					 		"parent": "#",
					 		'state' : { 'opened' : true},
					 		"text": "Que faire personnellement ?",
					 		"keywords": ["ecologie"],
					 		"description": "Des modes de vie, d’échanges et de consommation responsables et solidaires « Sois le changement que tu veux voir dans le monde » (Gandhi). Il est possible, par nos choix de consommation, d’agir sur le changement climatique et la transition écologique. En tant que consommateurs, le choix des produits que nous achetons, la manière dont nous consommons, mais également les quantités consommées ont un impact sur l’avenir de la planète."
					 		
					 	},	
			 		 	{
			 		 		"id": "ecologie-1-1",
					 		"parent": "ecologie-1",
					 		'state' : { 'opened' : true},
					 		"text": "Manger autrement c’est possible",
					 		"keywords": ["alimentation"],
					 		"description":"La consommation «  prêt en 5 minutes » a pris une grande ampleur. Mais manger autrement c’est possible ! N’ayez pas peur du changement. Vous serez gagnant car vous serez en accord avec la nature et avec votre organisme, et de plus vous ferez des économies, avec un rapport plus équilibré au temps. Au cours des dernières années la pression des bio-consommateurs a été telle que les grandes surfaces ont dû se résoudre à mettre en place des rayons bio. Mais il n’est pas suffisant d’acheter bio aveuglément car le bio peut provenir des antipodes ou de personnes sous-payées. D’où les quelques propositions qui suivent : "
			 		 	},	
			 		 	{
			 		 		"id": "ecologie-1-1-1",
					 		"parent": "ecologie-1-1",
					 		'state' : { 'opened' : true},
					 		"text": "Cuisinez par vous-même",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["Consommation", "légumes", "fruits"],
					 		"description":"Face aux injonctions de la publicité pour les plats préparés, il est possible, même pour des gens très occupés, de cuisiner par soi-même. Cela revient beaucoup moins cher (une soupe maison revient 3 à 6 fois moins chères qu’une brique de soupe), et la quantité de sucre, de sel, de matières grasses et d’additifs que nous ingérons diminue radicalement. Cela permet aussi de retrouver des saveurs authentiques, et de goûter le plaisir de faire soi-même est de choisir les produits qu’on mange. Il est possible de regrouper les temps de cuisiner de congeler ou de garder au frais ce que l’on a préparé.",
			 		 		"initiatives": [{"id": "1"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-1-1-2",
					 		"parent": "ecologie-1-1",
					 		'state' : { 'opened' : true},
					 		"text": "Privilégier les marchés, les ventes directes et les cueillettes",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["Consommation", "légumes", "fruits", "bio"],
					 		"description":"D’une manière générale, la grande distribution fait perdre de temps dans des longs trajets en voiture, payer plus cher un grand nombre de produits en dehors de quelques produits d’appel, et nous rend prisonniers d’une spirale d’achats non contrôlés. Pour y échapper, les marchés et les ventes directes sont à privilégier. Ils permettent d’acheter des produits frais, à des producteurs locaux, avec un choix et une possibilité de comparaisons. Il existe en Île-de-France plus de 70 marchés bio.",
			 		 		"initiatives": [{"id": "2"}, {"id": "3"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-1-1-3",
					 		"parent": "ecologie-1-1",
					 		'state' : { 'opened' : true},
					 		"text": "Apprendre la cuisine aux jeunes générations… ",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["Consommation", "légumes", "fruits", "enfants"],
					 		"description":"Beaucoup de jeunes sont conditionnés à manger des plats préparés, des sucres et des féculents et ne savent plus ni choisir les fruits et légumes ni cuisiner. L’éducation dès le plus jeune âge est très importante pour donner aux enfants le goût des fruits, des légumes, d’aliments variés, et orienter leurs préférences culinaires",
			 		 		"initiatives": [{"id": "4"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-1-1-4",
					 		"parent": "ecologie-1-1",
					 		'state' : { 'opened' : true},
					 		"text": "… et aux moins jeunes",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["Consommation", "légumes", "fruits"],
					 		"description":"La « malbouffe » est aussi le lot des moins jeunes, tout autant soumis à la publicité et aux rythmes insensés imposés par la flexibilité et l’intensification du travail. Mais rien n’est perdu ! Il est possible pour des jeunes et des adultes de transformer leurs goûts en découvrant des nouvelles saveurs.",
			 		 		"initiatives": [{"id": "5"}, {"id": "6"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-1-2",
					 		"parent": "ecologie-1",
					 		'state' : { 'opened' : true},
					 		"text": "Réduire au quotidien notre impact sur l’environnement",
					 		"keywords": ["alimentation"],
					 		"description":""
			 		 	},	
			 		 	{
			 		 		"id": "ecologie-1-2-1",
					 		"parent": "ecologie-1-2",
					 		'state' : { 'opened' : true},
					 		"text": "Réapprendre les éco gestes à la maison",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["gaspillage", "pollution"],
					 		"description":"Nous sommes de plus en plus largement conditionnés par la publicité, qui tend à remplacer les habitudes familiales ou sociales pour influencer nos choix les plus simples de la vie quotidienne. Ces conditionnements véhiculent de multiples pratiques qui deviennent de plus en plus inacceptables. Il est possible de trouver des conseils ou des formations pour réapprendre les éco-gestes au quotidien. ",
			 		 		"initiatives": [{"id": "7"}, {"id": "8"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-1-2-2",
					 		"parent": "ecologie-1-2",
					 		'state' : { 'opened' : true},
					 		"text": "Apprendre à produire et faire par soi-même",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["gaspillage", "pollution"],
					 		"description":"Face à une société qui nous pousse à tout acheter, il est gratifiant de retrouver le goût le temps et le savoir pour produire par soi-même. ",
			 		 		"initiatives": [{"id": "9"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-1-3",
					 		"parent": "ecologie-1",
					 		'state' : { 'opened' : true},
					 		"text": "Acheter autrement, donner, échanger",
					 		"keywords": ["Publicité", "gaspillage"],
					 		"description":""
			 		 	},
			 		 	{
			 		 		"id": "ecologie-1-3-1",
					 		"parent": "ecologie-1-3",
					 		'state' : { 'opened' : true},
					 		"text": "Résister aux agressions et aux envoûtements publicitaires",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["Publicité", "gaspillage"],
					 		"description": "Nous sommes aujourd’hui soumis à d’innombrables incitations marketing. Alors qu’à ses débuts la publicité consistait à faire connaître la réalité d’un produit, les techniques actuelles de marketing sont principalement destinées à jouer sur notre inconscient et à façonner nos désirs. La publicité est devenue « un discours idéologique qui conduit à ne plus voir les réalités de la vie, les valeurs de la vie, les dimensions de l’être et les êtres eux-mêmes que comme des marchandises qui se produisent et se vendent » (François Brune).Comment est-il possible d’y résister ? Nous pouvons renforcer nos défenses en étant davantage conscient de leur présence (voir plus loin « s’émanciper des médias, c’est possible !). Nous pouvons aussi participer à la résistance qui s’organise.",
					 		"initiatives": [{"id": "10"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-1-3-2",
					 		"parent": "ecologie-1-3",
					 		'state' : { 'opened' : true},
					 		"text": "Limiter les messages reçus",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["Publicité", "gaspillage"],
					 		"description": "Nous pouvons aussi limiter le nombre de messages publicitaires que nous recevons.",
					 		"initiatives": [{"id": "11"}, {"id": "12"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-2",
					 		"parent": "#",
					 		'state' : { 'opened' : true},
			 		 		"text": "Que faire concrètement à plusieurs ?",
			 		 		"keywords": ["groupe"],
			 		 		"description": "Les actions de groupe",
			 		 		"initiatives": [{"id": "13"},{"id": "14"},{"id": "16"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-2-1",
					 		"parent": "ecologie-2",
					 		'state' : { 'opened' : true},
			 		 		"text": "Diminuer, gérer ses déchets",
			 		 		"keywords": [],
			 		 		"description": "Aujourd’hui, chaque Français produit en moyenne 350 kg de déchets par an. Éviter de générer des déchets est une des premières possibilités d’action des citoyens pour lutter contre le réchauffement climatique. En effet, les objets et les matières contiennent un certain nombre de substances, métaux, qu’il est nécessaire d’économiser. Ils ont coûté de l’énergie pour être produits. Leur traitement et leur destruction coûtent à nouveau de l’énergie, sont sources de pollution des eaux, des sols et de l’atmosphère. Le tri sélectif commence à se généraliser, ce qui est une bonne chose. Mais il est encore plus important de limiter au maximum le volume des déchets."
			 		 	},
			 		 	{
			 		 		"id": "ecologie-2-1-1",
					 		"parent": "ecologie-2-1",
					 		'state' : { 'opened' : true},
			 		 		"text": "Le compostage, en jardin et en ville",
					 		"icon": "glyphicon glyphicon-file",
			 		 		"keywords": ["compost", "légumes", "fruits"],
			 		 		"description": "Près de la moitié de nos déchets sont des matières organiques compostables, donc recyclables. Le compostage est une pratique simple qui permet de contribuer efficacement à la réduction des déchets et à la production de matière organique de bonne qualité, à la ville comme à la campagne. En particulier, il est facile, utile, et inodore de composter ses déchets en appartement.",
					 		"initiatives": [{"id": "13"}, {"id": "14"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-2-1-2",
					 		"parent": "ecologie-2-1",
					 		'state' : { 'opened' : true},
			 		 		"text": "Diminuer sa production de déchets",
					 		"icon": "glyphicon glyphicon-file",
			 		 		"keywords": ["gaspillage", "pollution", "déchet"],
			 		 		"description": "",
					 		"initiatives": [{"id": "15"}]
			 		 	},
			 		 	{
			 		 		"id": "ecologie-2-1-3",
					 		"parent": "ecologie-2-1",
					 		'state' : { 'opened' : true},
			 		 		"text": "Lutter ensemble contre le gaspillage alimentaire",
					 		"icon": "glyphicon glyphicon-file",
			 		 		"keywords": ["gaspillage", "pollution", "déchet", "légumes", "fruit"],
			 		 		"description": "Le gaspillage alimentaire représente au niveau mondial, d’après la FAO, 1/3 des aliments comestibles. Dans les pays développés, il se situe du côté de la transformation, de la distribution et de la consommation. Les consommateurs ont leur part de responsabilité et de conditionnement dans ce gaspillage en exigeant des produits ayant bel aspect, au détriment de leurs goûts et de leur valeur nutritive. Mais le consumérisme trouve sa source principale dans la publicité et le conditionnement des individus dès le plus jeune âge. Ce scandale éthique, écologique, social et économique a pris une telle dimension qu’un rapport vient d’être produit par Guillaume Garot, député et ancien ministre de l’alimentation, pour proposer des adaptations réglementaires. Cependant, les mesures proposées ne s’attaquent pas à la racine du problème. Le problème ne pourra être résolu qu’en modifiant en profondeur les comportements, les rapports de pouvoir tout au long de la chaîne alimentaire et les circuits de distribution. Pour préparer les esprits, nous avons le pouvoir en tant que citoyens de résister en modifiant nos habitudes de consommation, mais aussi par des actions à forte portée éducative et symbolique, comme le glanage, les disco soupes et l’organisation de réseaux de solidarité ville campagne.",
					 		"initiatives": [{"id": "16"}, {"id": "17"}]
			 		 	}
					]
				},
				{
					"label": "geolocalisation",
					"type": "geoloc",
					"keywords": ["geoloc"],
					"tree":
					[
					 	{
					 		"id": "geoloc-1",
					 		"parent": "#",
					 		'state' : { 'opened' : true},
					 		"text": "France",
					 		"keywords": ["france", "national"],
					 		"description": "le pays",
					 		"initiatives": 
					 		[
					 		     {"id": "1"},
						 		    {"id": "2"},
						 		    {"id": "4"},
						 		    {"id": "5"},
						 		    {"id": "7"},
						 		    {"id": "8"},
						 		    {"id": "10"},
						 		    {"id": "11"},
						 		    {"id": "13"},
						 		    {"id": "15"},
						 		    {"id": "16"}
					 		]
					 	},
					 	{
					 		"id": "geoloc-1-1",
					 		"parent": "geoloc-1",
					 		'state' : { 'opened' : true},
					 		"text": "île de france",
					 		"keywords": ["ile-de-france", "region"],
					 		"description": "La région île de France"
					 	},
					 	{
					 		"id": "geoloc-1-1-2",
					 		"parent": "geoloc-1-1",
					 		'state' : { 'opened' : true},
					 		"text": "Hauts de Seine",
					 		"keywords": ["hauts de seine", "departement"],
					 		"description": "Le département des Hauts de Seine",
					 		"initiatives":
					 		[
					 		 	{"id": "3"}
					 		]
					 	},
					 	{
					 		"id": "geoloc-1-1-3",
					 		"parent": "geoloc-1-1",
					 		'state' : { 'opened' : true},
					 		"text": "Loire Atlantique",
					 		"keywords": ["loire atlantique", "departement"],
					 		"description": "Le département de Loire Atlantique"
					 	},
					 	{
					 		"id": "geoloc-1-1-2-1",
					 		"parent": "geoloc-1-1-2",
					 		'state' : { 'opened' : true},
					 		"text": "Chaville",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["chaville", "ville"],
					 		"description": "La ville de Chaville",
					 		"initiatives":
						 		[
						 		 	{"id": "6"}
						 		]
					 	},
					 	{
					 		"id": "geoloc-1-1-2-2",
					 		"parent": "geoloc-1-1-2",
					 		'state' : { 'opened' : true},
					 		"text": "Nanterre",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["nanterre", "ville"],
					 		"description": "La ville de Nanterre",
					 		"initiatives":
					 		[
					 		 	{"id": "9"}
					 		]
					 	},
					 	{
					 		"id": "geoloc-1-1-3-1",
					 		"parent": "geoloc-1-1-3",
					 		'state' : { 'opened' : true},
					 		"text": "Notre Dame des Landes",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["notre dame des landes", "ville"],
					 		"description": "La ville de Notre Dame des Landes",
					 		"initiatives":
					 		[
					 		 	{"id": "12"}
					 		]
					 	},
					 	{
					 		"id": "geoloc-1-1-3-2",
					 		"parent": "geoloc-1-1-3",
					 		'state' : { 'opened' : true},
					 		"text": "Nantes",
					 		"icon": "glyphicon glyphicon-file",
					 		"keywords": ["nantes", "ville"],
					 		"description": "La ville de Nantes",
					 		"initiatives":
					 		[
					 		 	{"id": "14", "id": "17"}
					 		]
					 	}
					 	
					]
				}
			],
				
			"initiatives":
			[
				{
					"id": "1",
					"label": "Recettes végétariennes",
					"keywords": ["Consommation", "légumes", "fruits"],
					"geoloc": "national",
					"description": "Pour des idées de recettes végétariennes",
					"references": [{"label": "http://www.sosbouffe.fr/recettes-vegetariennes/potages-soupes.html", "href": "http://www.sosbouffe.fr/recettes-vegetariennes/potages-soupes.html"}]
				},
				{
			 		"id": "2",
			 		"label": "Répertoire des marchés bio",
	 		 		"description": "On pourra se reporter au répertoire",
			 		"keywords": ["Consommation", "légumes", "fruits", "bio"],
			 		"geoloc": "national",
	 		 		"references": 
	 		 		[
						{"label": "http://www.marches-bio.org/marches.html", "href": "http://www.marches-bio.org/marches.html"}
					]
			 	},
			 	{
			 		"id": "3",
			 		"label": "Cueillettes bio",
			 		"keywords": ["Consommation", "légumes", "fruits", "bio"],
			 		"geoloc": "hauts de seine",
	 		 		"description": "Les cueillettes aussi peuvent être un moyen très utile pour une découverte et une initiation pour apprendre à apprécier la maturation, la couleur, l’odeur, La provenance ",
	 		 		"references": 
	 		 		[
						{"label": "Cueillettes bio dans les Hauts de Seine", "href": " http://www.bioconsomacteurs.org/association/relais-locaux/sophie-watkins/les-fermes-des-yvelines-78"},
						{"label": "Cueillettes bio en Ile de France", "href": "https://amapidf.wordpress.com/vente-de-bio-a-la-ferme/"}
					]
			 	},

			 	{
			 		"id": "4",
			 		"label": "Des recettes",
			 		"description": "Des recettes pour les enfants",
			 		"keywords": ["Consommation", "légumes", "fruits", "enfants"],
			 		"geoloc": "national",
			 		"references": 
			 		[
				 		{
				 			"label": "http://www.enfant.com/cuisine/recettes-enfants/recettes-enfant-legumes.html ", 
				 			"href": "http://www.enfant.com/cuisine/recettes-enfants/recettes-enfant-legumes.html "
				 		}
				 	]
			 	},
			 	{
			 		"id": "5",
			 		"label": "Slow Food ",
			 		"keywords": ["Consommation", "légumes", "fruits"],
			 		"geoloc": "national",
			 		"description": "Slow Food est une association qui s'oppose aux effets dégradants de la culture de la fast-food qui standardisent les goûts : elle promeut la consommation délibérée d'une alimentation locale, avec des programmes d'éducation du goût pour les adultes et les enfants, et travaille pour la sauvegarde d'une conscience publique des traditions culinaires.",
			 		"references": 
			 		[
		 		        {
 		            	   "label": "http://www.slowfood.fr/ ", 
 		            	   "href": "http://www.slowfood.fr/ "
		 		         }
		 		    ]
			 	},
			 	{
			 		"id": "6",
			 		"label": "Action Jeune",
			 		"keywords": ["Consommation", "légumes", "fruits", "jeunes"],
			 		"geoloc": "chaville",
			 		"description": "A Chaville (92), en partenariat avec Action Jeunes, un projet culinaire avec la jeune génération  (accompagnés ou non de leurs parents) est en cours de réalisation",
			 		"references": []
			 	},
			 	{
			 		"id": "7",
			 		"label": "Les Fourmis vertes ",
			 		"keywords": ["gaspillage", "pollution", "enfants"],
			 		"geoloc": "national",
			 		"description": "Les Fourmis vertes transmettent depuis plus de 10 ans leur savoir auprès d’enfants et d’adultes pour les amener à améliorer l’environnement de l’école à la maison, du quartier à la planète. Des temps de sensibilisation et d’apprentissage sont proposés par le biais d’outils pédagogiques adaptés aux différents âges, pour une sensibilisation aux écogestes à la maison : eau, énergie, déchets, produits ménagers, pollution intérieure, éco-consommation.",
			 		"references": 
			 		[
 		               {
 		            	   "label": "http://www.fourmisvertes.eu/ ", 
 		            	   "href": "http://www.fourmisvertes.eu/ "
 		               }
 		            ]
			 	},
			 	{
			 		"id": "8",
			 		"label": "Les 100 vidéos pour l’écologie pratique",
			 		"description": "Guillaume Ruas a réalisé par ses propres moyens, depuis janvier 2015, 100 vidéos pour l’écologie pratique, à raison d’une vidéo par jour. Chacune dure de 1 à 4 minutes. Quelques exemples : remplacer l’eau de Javel, faire son dentifrice, faire sa lessive à la cendre de bois, etc. Pour accéder à ces vidéos, qui constituent une véritable mine d’idées et de pratiques",
			 		"keywords": ["gaspillage", "pollution"],
			 		"geoloc": "national",
			 		"references": 
			 		[
		               {
		            	   "label": "https://www.youtube.com/channel/UCC6MlhJK-t8MkBQErBV8XKg ", 
		            	   "href": "https://www.youtube.com/channel/UCC6MlhJK-t8MkBQErBV8XKg "
		               }
	               ]
			 	},
			 	{
			 		"id": "9",
			 		"label": "Savoir Faire et Découverte",
			 		"keywords": ["gaspillage", "pollution"],
			 		"geoloc": "nanterre",
			 		"description": "L’association Savoir Faire et Découverte propose des stages pratiques destinés à faciliter l'accès aux savoir-faire artisanaux et artistiques écologiquement responsables sur de nombreux thèmes : bricolage, construction, énergies renouvelables, cuisine, fabrication (pain, miel, bière, cidre, charcuterie, tisanes, etc.), jardinage, arboriculture, apiculture, fabrication de produits ménagers, art et artisanat pour la décoration (mosaïque, poterie, cuir, sculpture, encadrement, cannage, osier, cuir, fer, étain...), etc",
			 		"references": 
			 		[
	 		            {
	 		            	   "label": "www.lesavoirfaire.fr",
	 		            	   "href": "http://www.lesavoirfaire.fr"
	 		            },
	 		            {
	 		            	"label": "téléphone",
	 		            	"type": "telephone",
	 		            	"href": "02 33 66 74 67"
	 		            }
	 		           ]
			 	},
			 	{
			 		"id": "10",
			 		"label": "Participer à RAP (Résistance à l’agression publicitaire).",
			 		"keywords": ["gaspillage", "publicite"],
			 		"geoloc": "national",
			 		"description": "L’association a pour objet principal de lutter contre les effets négatifs des activités publicitaires sur l’environnement et les citoyens (gaspillage des ressources, pollution paysagère et du cadre de vie, déchets, bruit) et sur la société (développement de la surconsommation, inégalités, obésité, violence…). ",
			 		"references": 
			 		[          
 		               {
 		            	   "label": "http://antipub.org/spip.php?article2", 
 		            	   "href": "http://antipub.org/spip.php?article2"
	 		            },
	 		            {
	 		            	"label": "téléphone",
	 		            	"href": "01 43 66 02 04",
	 		            	"type": "telephone"
	 		            }
 		            ]
			 	},
			 	{
			 		"id": "11",
			 		"label": "Apposer un autocollant stop pub sur sa boîte aux lettres.",
			 		"keywords": ["gaspillage", "publicite"],
			 		"geoloc": "national",
			 		"description": "Vous pouvez même télécharger la planche stop pub sur le site officiel du gouvernement, avec le logo du ministère de l’écologie et du développement durable ! Merci Ségolène… ",
			 		"references": 
			 		[
 		               {
 		            	   "label": "http://www.developpement-durable.gouv.fr/Stop-pub-moins-de-prospectus-dans.html", 
 		            	   "href": "http://www.developpement-durable.gouv.fr/Stop-pub-moins-de-prospectus-dans.html"
 		               }
 		            ]
			 	},
			 	{
			 		"id": "12",
			 		"label": "Bloquer les fenêtres publicitaires",
			 		"keywords": ["gaspillage", "publicite", "net"],
			 		"geoloc": "notre dame des landes",
			 		"description": "Aujourd’hui, la majeure partie des publicités passe par Internet, avec l’ouverture permanente et intempestive de fenêtres publicitaires quand vous allez sur Internet. Ces publicités peuvent s’ouvrir automatiquement grâce à des cookies ou des pop-up, qui s’installent via les messages, les programmes, ou la consultation des sites. Il est possible de refuser les cookies (voir « options Internet - confidentialité ») et de désactiver les pop-up en allant sur « outils » de la barre d’outils Google (si vous utilisez ce navigateur). Il est également possible d’analyser votre ordinateur avec un petit logiciel gratuit, comme par exemple Malwarebytes Anti-Malware pour éliminer les pop-up installés. Il existe aussi des logiciels plus perfectionnés de blocage des publicités",
			 		"references": []
			 	},
			 	{
			 		"id": "13",
			 		"label": "le compostage c’est facile",
			 		"keywords": ["compost", "légumes", "fruits"],
			 		"geoloc": "national",
			 		"description": "Le site « le compostage c’est facile » fournit tout explication sur les l’utilité du compostage, les techniques, d’utilisation du compost, y compris le compostage en appartement, qui utilise des lombrics et ne dégage aucune mauvaise odeur. ",
			 		"references": 
			 		[
 		               {
 		            	   "label": "http://www.compostage.info/index.php", 
 		            	   "href": "http://www.compostage.info/index.php"
 		               }
 		            ]
			 	},
			 	{
			 		"id": "14",
			 		"label": "le compostage en pied d’immeuble",
			 		"keywords": ["compost", "légumes", "fruits"],
			 		"geoloc": "nantes",
			 		"description": "le compostage en pied d’immeuble commence à se développer, notamment dans le 13e arrondissement avec l’appui de la Ville de Paris, qui met à disposition des bacs de compostage, des outils de communication et un accompagnement.",
			 		"references": 
			 		[
 		               {
 		            	   "label": "http://www.mairie13.paris.fr/mairie13/jsp/site/Portal.jsp?document_id=16456&portlet_id=2838 ", 
 		            	   "href": "http://www.mairie13.paris.fr/mairie13/jsp/site/Portal.jsp?document_id=16456&portlet_id=2838 "
 		               }
 		            ]
			 	},
			 	{
			 		"id": "15",
			 		"label": "Ourcq et Clignon",
			 		"description": "",
			 		"keywords": ["gaspillage", "pollution", "déchet"],
			 		"geoloc": "national",
			 		"references": 
			 		[
 		               {
 		            	   "label": "http://www.ccoc-ourcqetclignon.fr/spip.php?rubrique117", 
 		            	   "href": "http://www.ccoc-ourcqetclignon.fr/spip.php?rubrique117"
 		               }
 		            ]
			 	},
			 	{
			 		"id": "16",
			 		"label": "Les Disco Soupes",
			 		"keywords": ["gaspillage", "pollution", "déchet", "légumes", "fruit"],
			 		"geoloc": "national",
			 		"description": "Les Disco Soupes (ou Disco Salades, Disco Smoothies etc.) sont des sessions collectives et ouvertes de cuisine de fruits et légumes rebuts ou invendus dans une ambiance musicale et festive, pour sensibiliser le grand public au gaspillage alimentaire, qui sont ensuite redistribués à tous gratuitement ou à prix libre. Les Disco Soupes permettent l’éducation à une cuisine saine et goûtue, la (re)découverte du plaisir de cuisiner ensemble, la création de zones de convivialité non-marchandes éphémères dans l’espace public. Le mouvement, né à Paris en 2012, a essaimé dans toutes les régions de France. Pour en savoir plus et connaître les discosoupes à venir voir",
			 		"references": 
			 		[
 		               {
 		            	   "label": "http://discosoupe.org/lemouvement/", 
 		            	   "href": "http://discosoupe.org/lemouvement/"
 		               }
		 		    ]
			 	},
			 	{
			 		"id": "17",
			 		"label": "Rebon, réseau de glanage nantais,",
			 		"keywords": ["gaspillage", "pollution", "déchet", "légumes", "fruit"],
			 		"geoloc": "nantes",
			 		"description": "Rebon, réseau de glanage nantais, récupère au champ des fruits et légumes destinés au rebut, dans des exploitations agricoles. Ces produits sont ensuite redistribués à des associations locales d’aide alimentaire. 14 maraîchers donnent régulièrement accès à leur exploitation. On compte depuis 2 ans 80 opérations de glanage ou de récupération, par 400 bénévoles.",
			 		"references": 
			 		[
 		               {
 		            	   "label": "http://re-bon.wix.com/re-bon", 
 		            	   "href": "http://re-bon.wix.com/re-bon"
 		               }
		 		    ]
			 	}
			]
		};

		/** 
		 *  CREATION DES ARBRES POUR CHAQUE THESAURUS
		 *  INITIALISATION DES EVENEMENTS 
		 *  */
		this.loadThesaurus = function()
		{
			var reperto = this;			
			
			var ecologieVizTree = $('#thesaurus-ecologie-tree').jstree(
			{ 
				'core': 
				{
				    'data': reperto.data.thesaurus[0].tree
				}
			});
			
			$('#thesaurus-ecologie-tree').on('changed.jstree', function (e, data) 
			{
				reperto.selectThesaurusItem(data, reperto.data.thesaurus[0].tree);
			});

			this.tagThesaurus(reperto.data.thesaurus[0].tree);
			this.tagThesaurus(reperto.data.thesaurus[1].tree);
		};
		
		/** Tag du thesaurus : ALGO
		 *  -----------------------------------------------------------------------------------------------------------------------
		 * 		rajouter pour chaque initiative la liste de tous les noeuds du thesaurus qui peuvent pointer dessus.
		 *     -> pour chaque noeud initiative (i_noeud):
		 *     ---> a. recherche de tous les noeuds (t_noeud) du thesaurus qui pointent dessus 
		 *     ---> b. rajouter l'id des t_noeuds dans la clef 'tags' de l'i_noeud
		 *     ---> c. pour chaque t_noeud, parcours remontant de l'arbre jusqu'à la racine 
		 *     -------> d. pour chaque noeud parent (p_t_noeud), 
		 *     -------> e. rajout de son id dans la clef tags du i_noeud 
		 *     
		 *     EXEMPLE
		 *     ---------------------------------------------------------------------------------------------------------------------
		 *     Thesaurus
		 *        |_ CATEGORY_A
		 *           |_CATEGORY_A_1
		 *              |__{"id": 1}
		 *              
		 *     Initiative
		 *        |_ init {id: 1, tags []}
		 *        
		 *     Etape a. recherche ==> [CATEGORY_A_1]
		 *           b. ajout de 'CATEGORY_A_1' dans la clef tags : init {id:1, tags:['CATEGORY_A_1']}
		 *           c. recherche des ascendants de 'CATEGORY_A_1'
		 *           d. Father(CATEGORY_A_1) ==> CATEGORY_A 
		 *           e. ==> init {id:1, tags:['CATEGORY_A_1', 'CATEGORY_A']}
		 *     */
		this.tagThesaurus = function(thesaurus)
		{
			this.data.initiatives.forEach(function(initiative)
			{
				if (! initiative.tags)
				{
					initiative.tags = [];
				}
				if (! initiative.keywords)
				{
					initiative.keywords = [];
				}
				if (! initiative.geoloc)
				{
					initiative.geoloc = "";
				}
				/** etape a.*/
				var thesaurusItems = JSON.search(thesaurus, '//*[initiatives/id/text()="' + initiative.id + '"]');

				/** etape b.*/
				thesaurusItems.forEach(function(node)
				{
					var parentNode = node;
					
					/** etape b.*/
					if (node.id !== undefined && initiative.tags.indexOf(node.id) == -1)
					{
						initiative.tags.push(node.id);
					}
					
					if (node.parent != "#")
					{
						/** etape c.*/
						while (parentNode.parent != "#")
						{
							/** etape d.*/
							parentNode = JSON.search(thesaurus, '//*[id="' + parentNode.parent + '"]');
							parentNode = parentNode[0];
							
							/** etape e.*/
							if (parentNode.id !== undefined && initiative.tags.indexOf(parentNode.id) == -1)
							{
								initiative.tags.push(parentNode.id);
							}
						}
					}
				}, this);
			}, this);
		};
		
		/** 
		 * 
		 * RECHERCHE DES INITIATIVES CORRESPONDANT A UN FILTRE DONNE POUR UN THESAURUS DONNE 
		 * 
		 *  -> ON CONSTRUIT UN NOUVEL ARBRE A PARTIR DES THESAURUS FILTRE
		 *  -> L'AFFICHAGE DES INITIATIVES EST MIS A JOUR
		 *  
		 *  CONSTRUCTION DE L'ARBRE : 
		 *   
		 * 
		 * */
		this.filterThesaurus = function(thesaurus, domId, options)
		{
			var filteredThesaurus = [];
			var matching_i_noeuds = [];
			var added_t_noeuds = {};
			var i_noeuds = this.data.initiatives;
			var matchingKeyType = (thesaurus.type == "geoloc") ? "geoloc" : "keywords";
			
			if (this.activeFilters[thesaurus.type].length == 0)
			{
				this.data.initiatives.forEach(function(initiative)
				{
					initiative[matchingKeyType] = [];
					filteredThesaurus = thesaurus.tree;
				}, this);
			}
			else
			{
				/** parcours des filtres */
				this.activeFilters[thesaurus.type].forEach(function(filter)
				{
					var t_nodes_matching_filter = JSON.search(thesaurus.tree, "//*[keywords/text()='" + filter + "']");
					
					t_nodes_matching_filter.forEach(function(t_node)
					{
						var i_nodes_tagged_with_t_node = JSON.search(this.data.initiatives, "//*[tags/text()='" + t_node.id + "']");
						matching_i_noeuds = matching_i_noeuds.concat(i_nodes_tagged_with_t_node);
						
						i_nodes_tagged_with_t_node.forEach(function(i_node)
						{
							i_node.filtered = true;
						}, this);
					}, this); 
					
				}, this);	
			}
	
			if (this.activeFilterCount == 0)
			{
				this.filteredInitiativeList = this.data.initiatives;				
			}
			else
			{
				this.filteredInitiativeList = this.filteredInitiativeList.concat(matching_i_noeuds);	
			}
		};
		
		this.resetThesaurus = function(type)
		{
			
		};
		
		
		/** FONCTIONS ANNEXES & UTILITAIRES */
		
		this.exportAsPdf = function()
		{
			
		};
		
		this.resetInitiatives = function()
		{
			this.data.initiatives.forEach(function(i_node){delete i_node.filtered;}, this)
		};
		
		/** Affiche les initiatives passées en paramètre et cache les autres */
		this.updateInitiatives = function(i_nodes)
		{
			$(".initiative-item").hide();
			$(".jstree-node a").removeClass("filter-match");
			
			i_nodes.forEach(function(initiative)
			{
				if (this.activeFilterCount == 0)
				{
					$("#initiative-" + initiative.id).show();
				}
				if (initiative.filtered)
				{
					$("#initiative-" + initiative.id).show();
					if (this.activeFilterCount > 0)
					{
						var matchingNode = JSON.search(this.data.initiatives, "//*[id/text()='" + initiative.id + "']");
						if (matchingNode.length > 0)
						{
							matchingNode = matchingNode[0];
							matchingNode.tags.forEach(function(matchingThesaurusItem)
							{
								$("#" + matchingThesaurusItem + ">a").addClass("filter-match");
							}, this);
						}
					}
				}
			}, this);
			
		
		};
		
		
		/** Utilisé lors de la sélection d'un item dans un thésaurus */
		this.selectThesaurusItem = function(jstree_event, thesaurus)
		{
			if (jstree_event.node.parents.length > 2)
			{
				this.selectIdee(jstree_event, thesaurus);
			}
			else if (jstree_event.node.parents.length > 1)
			{
				this.selectChapitre(jstree_event, thesaurus);
			}
			else if (jstree_event.node.parents.length >= 0)
			{
				this.selectPartie(jstree_event, thesaurus);
			}
			else
			{
			}
			
			var thesaurusItemId = jstree_event.node.id;
			var initiativeList = this.data.initiatives;
			
			if (this.filteredInitiativeList.length > 0)
			{
				initiativeList = this.filteredInitiativeList;
			}
			initiativeList = JSON.search(this.data.initiatives, '//*[tags/text()="' + thesaurusItemId + '"]');
			
			this.updateInitiatives(initiativeList);
			this.updateInitiativesMap(initiativeList);
			
		};
		
		
		this.selectIdee = function(jstree_event, thesaurus)
		{
			var ideeNode = JSON.search(thesaurus, '//*[id/text()="' + jstree_event.node.id + '"]');
			
			$("#titre_idee").html(ideeNode[0].text);
			$("#contenu_idee").html(ideeNode[0].description);
			
			if (jstree_event.action != "deselect_all")
			{
				
				var chapitre, partie;
				var chapitreNode, partieNode;
				var array_length = jstree_event.node.parents.length;
				
				for (var i = 0; i < array_length - 2; i++)
				{
					chapitre = jstree_event.node.parents[i];
					partie = jstree_event.node.parents[i+1];
					
					if (chapitre)
					{
						if (chapitre != "#")
						{
							chapitreNode = JSON.search(thesaurus, '//*[id/text()="' + chapitre + '"]');
						}
						$("#titre_chapitre").html(chapitreNode[0].text);
						$("#contenu_chapitre").html(chapitreNode[0].description);
					}
					
					if (partie)
					{
						if (partie != "#")
						{
							partieNode = JSON.search(thesaurus, '//*[id/text()="' + partie + '"]');
						}
						$("#titre_partie").html(partieNode[0].text);
						$("#contenu_partie").html(partieNode[0].description);
					}
					
				}
			}
		};
		
		this.selectChapitre = function(jstree_event, thesaurus)
		{
			$("#titre_idee").html("");
			$("#contenu_idee").html("");
			
			if (jstree_event.action != "deselect_all")
			{
				var partie;
				var chapitreNode, partieNode;
				
				chapitreNode = JSON.search(thesaurus, '//*[id/text()="' + jstree_event.node.id + '"]');
				$("#titre_chapitre").html(chapitreNode[0].text);
				$("#contenu_chapitre").html(chapitreNode[0].description);
				
				var array_length = jstree_event.node.parents.length;
				
				for (var i = 0; i < array_length - 1; i++)
				{
					partie = jstree_event.node.parents[i];
					
					if (partie && partie != "#")
					{
						partieNode = JSON.search(thesaurus, '//*[id/text()="' + partie + '"]');
						$("#titre_partie").html(partieNode[0].text);
						$("#contenu_partie").html(partieNode[0].description);
					}
				}
			}
		};
		
		this.selectPartie = function(jstree_event, thesaurus)
		{
			$("#titre_idee").html("");
			$("#titre_chapitre").html("");
			$("#contenu_idee").html("");
			$("#contenu_chapitre").html("");
			
			if (jstree_event.action != "deselect_all")
			{
				var partie;
				var partieNode;
				partieNode = JSON.search(thesaurus, '//*[id/text()="' + jstree_event.node.id + '"]');
				$("#titre_partie").html(partieNode[0].text);
				$("#contenu_partie").html(partieNode[0].description);
			}
		};
		
		/*** GESTION DES FILTRES ****/
		
		/** construit la liste de tous les mots clefs disponible pour le filtrage des thesaurus */
		this.gatherAvailableFilters = function(thesaurus)
		{
			var keywords = [], geoloc = [];
			
			keywords = JSON.search(thesaurus, "//keywords").sort();
			
			var keywordsSeen = [], geolocSeen = [];
			
			keywords.forEach(function(key)
			{
				if (key !== undefined && keywordsSeen.indexOf(key) == -1)
				{
					keywordsSeen.push(key);
				}
			});

			return keywordsSeen;
		};
		
		
		/** Construit la liste des mots clefs accessibles à l'utilisateur à partir de son entrée clavier */
		
		this.searchFilter = function(type, nodeId, keyEvent)
		{
			var value = $("#" + nodeId).val();
			value = value ? value + keyEvent.key : keyEvent.key;
			
			this.matchedFilters[type] = this.availableFilters[type].filter(function(filterItem){
				return filterItem.match(value)
			});
		};
		
		this.removeFilter = function(type, filter, additive)
		{

			this.filteredInitiativeList = [];
			this.resetInitiatives();
			
			var index = this.activeFilters[type].indexOf(filter);
			if (index != -1)
			{
				this.activeFilters[type].splice(index, 1);
				
				this.activeFilterCount--;
				
				if (type=="keywords")
				{
					this.filterThesaurus(this.data.thesaurus[0], "#thesaurus-ecologie-tree", {"additive": additive, "remove": filter});
				}
			}
			this.updateInitiatives(this.filteredInitiativeList);
		};
		
		this.addFilter = function(type, item, additive)
		{
			this.filteredInitiativeList = [];
			this.resetInitiatives();
			if (item || this.matchedFilters[type])
			{
				var filter = item ? item : this.matchedFilters[type][0];
				if (this.activeFilters[type].indexOf(filter) == -1)
				{
					this.activeFilters[type].push(filter);
					this.activeFilterCount++;
				}
				if (type=="keywords")
				{
					this.filterThesaurus(this.data.thesaurus[0], "#thesaurus-ecologie-tree", {"additive": additive, "add": true});
				}
				this.matchedFilters[type] = [];
				$("#add-" + type).val("");
			}
			this.updateInitiatives(this.filteredInitiativeList);
		};
		
		this.saveInitiative = function(initiative)
		{
			initiative.favorite = true;
			this.savedInitiativeList[initiative.id] = initiative;
			this.savedInitiativeList.length = Object.keys(this.savedInitiativeList).length - 1;
		};
		
		this.removeSavedInitiative = function(initiative)
		{
			initiative.favorite = false;
			delete this.savedInitiativeList[initiative.id];
			this.savedInitiativeList.length = Object.keys(this.savedInitiativeList).length - 1;
		}
		
		this.displaySavedInitiatives = function()
		{
			$(".initiative-item").hide();
			
			for(var key in this.savedInitiativeList)
			{
				$("#initiative-" + this.savedInitiativeList[key].id).show();
			}
		}
		
		this.init = function()
		{
			console.log("init.");
			/** INITIALISATION */
			
			this.filteredActions = [];
			
			this.availableFilters = 
			{
			    "keywords": [],
			    "geoloc": []
			};

			this.activeFilters = 
			{
				    "keywords": [],
				    "geoloc": []
			};

			this.activeFilterCount = 0;

			this.matchedFilters = 
			{
				    "keywords": [],
				    "geoloc": []
			};
			
			this.showSummary = false;
			
			this.loadThesaurus();
			
			this.updateInitiatives(this.data.initiatives);
			this.updateInitiativesMap(this.data.initiatives);
			
			this.availableFilters = 
			{
					"keywords": this.gatherAvailableFilters(this.data.thesaurus[0]),
					"geoloc": this.gatherAvailableFilters(this.data.thesaurus[1])
			}
			
			this.filteredInitiativeList = [];
			this.savedInitiativeList = {};
			this.savedInitiativeList.length = 0;
			
			/** MAP INITIALISATION */
			

		}
		
		this.initMap = function() 
		{
			var paris = new google.maps.LatLng(48.858273,2.3473697);

			var map = new google.maps.Map(document.getElementById('map'), 
			{
				center: paris,
				zoom: 5
			});
			
			return map;
		}
		
		this.updateInitiativesMap = function(initiativesList)
		{
			this.initiatives_gmap = this.initMap();
			
			initiativesList.forEach(function(initiative)
			{
				this.addMarker(this.geoloc[initiative.geoloc], this.initiatives_gmap, initiative);
			}, this);
		};
		
	
		
		this.addMarker = function(place, map, initiative)
		{
			var infoWindow = new google.maps.InfoWindow(
			{
				"content": "<h3>" + initiative.label + "</h3><p>"+initiative.description+"</p>"
			});
			
			
			this.markerList[initiative] = new google.maps.Marker(
			{
				map: map,
				position: place
			});

			google.maps.event.addListener(this.markerList[initiative], 'click', function() 
			{
				infoWindow.open(map, this.markerList[initiative]);
			});
		};
		
		this.highlightInitiative = function(initiative)
		{
			if (this.markerList[initiative])
			{
				this.markerList[initiative].setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function()
				{
					this.markerList[initiative].setAnimation(null);
				}, 2000)
			}
			this.initiatives_gmap.setCenter(this.geoloc[initiative.geoloc]);
			this.initiatives_gmap.setZoom(8);
		};
		
		this.init();
	
	}]);

	odass.directive("filtersBox", function(){return{restrict: 'E', templateUrl: 'modules/reperto/filters-box.html'};});
	odass.directive("thesaurus", function(){return{restrict: 'E', templateUrl: 'modules/reperto/thesaurus.html'};});
	odass.directive("initiativesBox", function(){return{restrict: 'E', templateUrl: 'modules/reperto/initiatives-box.html'};});
	
})();
