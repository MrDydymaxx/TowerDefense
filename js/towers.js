// ----------------------
// -- FUNCTIONS TOWERS --
// ----------------------

// Fonction qui définit les tours du jeu
function towersAvailable() {
	var towersAvailable = [];

	var ClassicTower = {
		dist : 100,
		type : 'Classic',
		img  : 'resources/tower.png',
		time : 100,
		money: 20,
		sizeX: 60,
		sizeY: 60,
		damage: 0.20,
		slow: 1,
	};
	towersAvailable.push(ClassicTower);

	var IceTower = {
		dist : 150,
		type : 'Ice',
		img  : 'resources/Ice-tower.png',
		time : 400,
		money: 40,
		sizeX: 60,
		sizeY: 60,
		damage: 0.10,
		slow: 0.70,
	};
	towersAvailable.push(IceTower);

	var FireTower = {
		dist : 200,
		type : 'Fire',
		img  : 'resources/fire-tower.png',
		time : 2000,
		money: 60,
		sizeX: 60,
		sizeY: 60,
		damage: 1,
		slow: 1,
	};
	towersAvailable.push(FireTower);

	return towersAvailable;
}

// Fonction qui affiche les tours dans la partie construction
function displayTowers(Player){
	// On récupère les tours disponibles à créer
	var tabTowersAvailable = towersAvailable();

	// On réinitialise le contenu html dans la partie construction des tours
	$('.game-constructor .all-towers').html('');

	var html = '';

	for (var i = 0, c = tabTowersAvailable.length; i < c; i++) {
		if (Player.money >= tabTowersAvailable[i].money) {
			html = '<div class="col-md-2 tower">';
		}
		else {
			html = '<div class="col-md-2 tower disabled">';
		}
			html += '<div class="infos">' +
					'<p>Distance shot :<br>' + tabTowersAvailable[i].dist + '</p>' +
					'<p>Damage shot :<br>' + tabTowersAvailable[i].damage + '%</p>' +
					'<p>Time to built :<br> ' + tabTowersAvailable[i].time + '</p>' +
					'</div>' +

					'<img src="' + tabTowersAvailable[i].img + '" alt="Tour ' + tabTowersAvailable[i].type + '" class="tower img-fluid">' +
					'<h5>' + tabTowersAvailable[i].type + '</h5>' +
					'<p>' + tabTowersAvailable[i].money + ' <img src="https://cdn3.iconfinder.com/data/icons/shopping-and-retail-15/512/gemstone-512.png" alt="Diamond" class="diamond img-fluid"></p>' +
				'</div>';

		$('.game-constructor .all-towers').append(html);
	}
}

// Fonction qui permet de cliquer pour créer une tour
function makeTowers(towers,Player) {
	var canMakeATower;
	var tabTowersAvailable = towersAvailable();
	var TowerSelected;

	$('.game-constructor').on({
	    mouseenter: function () {
	        $(this).parent().find('.infos').fadeIn();
	    },
	    mouseleave: function () {
	        $(this).parent().find('.infos').fadeOut();
	    }
	}, '.tower img.tower');


	// SI l'utilisateur clique sur un des icons pour créer une tour
	$('.game-constructor').on('click', '.tower img',function() {

		for (i = 0, c = tabTowersAvailable.length; i < c; i++) {
			if (tabTowersAvailable[i].type == $(this).parent().find('h5').text()) {
				TowerSelected = tabTowersAvailable[i];
			}
		}

		if(Player.money >= TowerSelected.money){
			canMakeATower = true;
		}
	});

	// Quand on clique sur une tour du jeu pour obtenir des informations
	$('.game').on('click', '.tower',function(){
		$(this).find('.area').toggle();
	});

	// SI l'utilisateur appuie sur la touche 'echap' afin de ne pas rajouter de tour
	$(document).keyup(function(e) {
		if (e.keyCode === 27) {
			canMakeATower = false;
			$('.follow-tower').css('display', 'none');
		}
	});

	// SI l'utilisateur clique sur la zone du jeu
	$('.game').click(function(e) {
		if (canMakeATower == true) {
			var top       = e.pageY - 30,
				left      = e.pageX - 15,
				distX     = 0,
				distY     = 0,
				distMin   = calcHypotenuse(45, 45),
				canCreate = true;

			//movePeon();

			// Pour chaque tour existante
			for (var i = 0, c = towers.length; i < c; i++) {
				distX = Math.abs(towers[i].left - left);
				distY = Math.abs(towers[i].top - top);
				hypo  = calcHypotenuse(distX, distY);

				// On vérifie si la distance entre le clic et les tours existantes
				// SI le clic est dans une zone d'une tour existante : on refuse l'ajout
				if (hypo < distMin) {
					canCreate = false;
				}
			}

			// SI on peut créer une tour
			if (canCreate == true) {

				// On crée une nouvelle tour
				var newTower = new Tower(top, left, TowerSelected.dist, TowerSelected.type, TowerSelected.img, TowerSelected.time, TowerSelected.money, TowerSelected.damage);
				// On l'ajoute au tableau des tours
				towers.push(newTower);

				canMakeATower = false;
				$('.follow-tower').css('display', 'none');

				// On retire de l'argent au joueur
				Player.money -= TowerSelected.money;
				$('.infos span.money').text(Player.money);

				// On réactualise l'affichage des tours à créer
				displayTowers(Player);
			}
		}
	});

	// Quand on déplace la souris sur la page afin de créer une tour
	$('.game').mousemove(function(e){
		if (canMakeATower == true) {
			console.log( $('div.parcours div:hover').length != 0);

			// On définit la taille de la zone d'attaque
			$('.follow-tower .area').css('width', (TowerSelected.dist*2) + 'px');
			$('.follow-tower .area').css('height', (TowerSelected.dist*2) + 'px');

			// On positionne la zone d'attaque autour du curseur
			$('.follow-tower .area').css('top', ((TowerSelected.dist*2-TowerSelected.sizeY)/-2) + 'px');
			$('.follow-tower .area').css('left', ((TowerSelected.dist*2-TowerSelected.sizeX)/-2) + 'px');

			// On définit le type de la tour à afficher
			$('.follow-tower div.type p').text(TowerSelected.type);

			// On affiche son image
			$('.follow-tower img').attr('src', TowerSelected.img);

			// On affiche la tour
			$('.follow-tower').show();

			// On la déplace en fonction du curseur
			$('.follow-tower').css({'top': e.pageY - 30, 'left': e.pageX - 15 });
		}
	});
}

// classe "Tower" qui crée une tour
function Tower (top, left, dist, type, img, time, money, damage, slow, sizeX = 60, sizeY = 60) {
	this.top       = top;
	this.left      = left;
	this.sizeX     = sizeX;
	this.sizeY     = sizeY;
	this.dist      = dist;
	this.minLeft   = 0;
	this.maxLeft   = this.left + this.dist;
	this.minTop    = 0;
	this.maxTop    = this.top + this.dist;
	this.type      = type;
	this.img       = img;
	this.time      = time;
	this.money     = money;
	this.damage    = damage;
	this.slow      = slow;
	this.canAttack = false;
	this.DOM       = false;
	this.monsterTarget = null;

	if ((this.top-this.dist)>0) {
		this.minTop = this.top - this.dist - 60;
	}

	if ((this.left-this.dist)>0) {
		this.minLeft = this.left - this.dist - 60;
	}
	
	// Permet d'accéder aux propriétés de la tour dans une méthode : on crée une référence
	var that = this;

	this.createTower = function() {
		that.canAttack = true;

		var html  = $('<div class="tower" style="top:' + top + 'px; left: ' + left + 'px;" data-distance="' + dist + '" data-type="' + type + '">' +
						'<div class="area" style="width:' + dist*2 + 'px; height: ' + dist*2 + 'px; top: ' + (dist*2-sizeY)/-2 + 'px; left: ' + (dist*2-sizeX)/-2 + 'px"></div>' +
						'<img src="' + img + '" alt="Tour ' + type + '">' +
						'<div class="type"><p>' + type + '</p></div>' +
					'</div>');
		
		that.DOM = html;
		$('.towers').append(html);
	};

	this.createLoader = function() {
		var html  = $('<div class="tower" style="top:' + (top+15) + 'px; left: ' + (left+30) + 'px;">' +
						'<div class="progress-bar bg-info" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" style="width:0%;">0</div>' +
					'</div>');

		$('.towers').append(html);

		var compte = 0;

		var timer = setInterval(function() {
			if (compte <= that.time) {
				compte++;
				html.find('div.progress-bar').text(hpPourcent(compte, that.time));
				html.find('div.progress-bar').css('width',hpPourcent(compte, that.time) + '%');
				html.find('div.progress-bar').attr('aria-valuenow',compte);
			}
			else {
				clearInterval(timer);
				that.createTower();
				html.remove();
			}
		}, 1);
	};

	this.createLoader();
}


var Peon = {
	left: 30,
	top : 30,
	DOM : $('.game .peon'),
}

function movePeon () {
	var diff = 0;
	var compteMax = 0;

	// SI la différence est plus importante entre le top ou le left
	if ((left - Peon.left) > (top - Peon.top)) {
		diff = (left - Peon.left) / (top - Peon.top);
		compteMax = left - Peon.left;
		//console.log('Left > top : ' + diff);
	}
	else {
		diff = (top - Peon.top) / (left - Peon.left);
		compteMax = top - Peon.top;
		//console.log('Left < top : ' + diff);
	}

	console.log('left - peon.left : ' +(left - Peon.left));
	console.log('top - peon.top : ' + (top - Peon.top));
	console.log('le max est : ' + compteMax);
	
	var timer = setInterval(function() {
		if (compteMax > 0) {
			if ((left - Peon.left) > (top - Peon.top)) {
				Peon.left += 1;
				Peon.top  += (1 / diff);

				Peon.DOM.css('left', Peon.left + 'px');
				Peon.DOM.css('top', Peon.top + 'px');
			}
			else {
				Peon.left += (1 / diff);
				Peon.top  += 1;
				
				Peon.DOM.css('left', Peon.left + 'px');
				Peon.DOM.css('top', Peon.top + 'px');
			}
			compteMax--;
		}
		else {
			clearInterval(timer);
		}
		//console.log(compteMax);
	}, 1);
}