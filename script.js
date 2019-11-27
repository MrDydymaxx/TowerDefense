// Fonction jQuery : exécute le jeu une fois que le DOM est chargé
$(function() {

	/* ---------- ---------- */
	/* ----- SETTINGS ------ */
	/* ---------- ---------- */

	// Objet littéral qui stocke l'argent, les vies et la vitesse du jeu
	var	Player = {
			money: 600,
			life : 20,
			speed: 10, // 10 = fast; 50 = normal mode
			time : 5,  // time (in sec) before monsters move
			level: 1,
		}; 

	/* ---------- ---------- */
	/* ------ PARCOURS ----- */
	/* ---------- ---------- */

	// Objet littéral qui stocke le parcours des monstres
	var	Parcours = {
			start: 200, 
			sizeCourse: 150,
			course: [
				['bottom',200],
				['right' ,1800],
				['bottom',500],
			]
		};

	// On appelle la fonction qui crée le parcours (visuel)
	makeCourse(Parcours);

	/* ---------- ---------- */
	/* ------ TOWERS ------- */
	/* ---------- ---------- */

	var towers = [];  // Tableau qui stocke toutes les tours du jeu

	// On affiche les tours que l'on peut créer à l'écran
	displayTowers(Player, towers); 

	// On appelle la fonction qui permet de créer des tours
	makeTowers(towers, Player);

	/* ---------- ---------- */
	/* ----- MONSTERS ------ */
	/* ---------- ---------- */

	var	monsters = []; // Tableau qui stocke tous les monstres du jeu

	// On appelle la fonction qui permet de créer des monstres
	makeMonsters(monsters, Parcours);

	/* ---------- ---------- */
	/* ------- GAME -------- */
	/* ---------- ---------- */

	// On appelle la fonction qui lance le jeu
	startGame(Player, Parcours, monsters, towers);
})

// ------------------------------------------------------------------------- //
// ----------------------- ALL FUNCTIONS FOR THE GAME ---------------------- //
// ------------------------------------------------------------------------- //

// ----------------------
// - FUNCTIONS PARCOURS -
// ----------------------

// Fonction qui crée le parcours (visuel)
function makeCourse(Parcours) {

	// On appelle la fonction 'calculSizeCourse' afin de définir la taille du jeu (en CSS) 
	calculSizeCourse(Parcours);

	var prevTop  = 0,
		prevLeft = Parcours.start - 60; // On retire 60 afin de centrer le parcours sur les monstres

	var html = '<div class="parcours" style="top:0px;">';

	for (var i = 0, c = Parcours.course.length; i < c; i++) {
		switch (Parcours.course[i][0]) {
			case 'bottom':
				html    += '<div style="width: ' + Parcours.sizeCourse + 'px; height: ' + (Parcours.course[i][1]) + 'px;top: ' + prevTop + 'px; left: ' + prevLeft + 'px;"></div>';
				prevTop += Parcours.course[i][1];
				break;

			case 'right':
				html    += '<div style="height: ' + Parcours.sizeCourse + 'px; width: ' + (Parcours.course[i][1] + Parcours.sizeCourse) + 'px;top: ' + (prevTop - Parcours.sizeCourse/2 + 45) + 'px; left: ' + prevLeft + 'px;"></div>';
				prevLeft+= Parcours.course[i][1];
				break;

			case 'left':
				html    += '<div style="height: ' + Parcours.sizeCourse + 'px; width: ' + (Parcours.course[i][1] + Parcours.sizeCourse) + 'px;top: ' + (prevTop - Parcours.sizeCourse/2 + 45) + 'px; right: ' + prevLeft + 'px;"></div>';
				prevLeft-= Parcours.course[i][1];
				break;
		}
	}

	html += '</div>';

	// On crée le parcours
	$('.game').append($(html));
}

// Fonction qui déplace les monstres
function course(Parcours, monsters) {

	// On déplace tous les monstres en fonction du parcours de 1px
	for (var i = 0, c = monsters.length; i < c; i++) {

		// SI le monstre est dans une des étapes du parcours
		if (Parcours.course[monsters[i].cStep]) {

			// On vérifie si le monstre doit monter, descendre, aller à droite ou à gauche
			switch (Parcours.course[monsters[i].cStep][0]) {

				// SI le monstre doit descendre
				case "bottom":
					if (monsters[i].top < Parcours.course[monsters[i].cStep][1]+monsters[i].prevTop) {
						monsters[i].top++;
						$(monsters[i].DOM).css('top', monsters[i].top+'px');
					}
					else {
						monsters[i].prevTop = monsters[i].top;
						monsters[i].cStep++;
					}
					break;
				
				// SI le monstre doit aller à droite
				case "right":
					if (monsters[i].left < Parcours.course[monsters[i].cStep][1]+monsters[i].prevLeft) {
						monsters[i].left++;
						$(monsters[i].DOM).css('left', monsters[i].left+'px');
					}
					else {
						monsters[i].prevLeft = monsters[i].left;
						monsters[i].cStep++;
					}
					break;

				// SI le monstre doit aller à gauche
				case "left":
					if (monsters[i].left < Parcours.course[monsters[i].cStep][1]+monsters[i].prevLeft) {
						monsters[i].left++;
						monsters[i].right--;
						$(monsters[i].DOM).css('left', monsters[i].right+'px');
					}
					else {
						monsters[i].prevLeft = monsters[i].left;
						monsters[i].cStep++;
					}
					break;
			}
		}
		// SINON le monstre n'a plus d'étape dans le parcours
		else {
			// On supprime le monstre du jeu (coté HTML)
			$(monsters[i].DOM).fadeOut('slow',function(){
				$(this).remove();
			});

			// On supprime le montre du tableau des monstres
			monsters.splice(i,1);
		}

	}
}

// Fonction qui calcule la taille de la zone de jeu
function calculSizeCourse(Parcours) {
	var sizeX = 0,
		sizeY = 0;

	// On ajoute sur la largeur du document la largeur du parcours (à gauche et droite)
	sizeX += Parcours.start*2;

	// Pour chaque étape du parcours :
	for (var i = 0, c = Parcours.course.length; i < c; i++) {
		switch (Parcours.course[i][0]) {
			case 'bottom':
				sizeY += Parcours.course[i][1];
				break;

			case 'right':
				sizeX += Parcours.course[i][1];
				break;
		}
		
	}

	// On définit la largeur du jeu :
	$('.game').css('width', sizeX + 'px');

	// On définit la heuteur du jeu :
	$('.game').css('height', (sizeY+250) + 'px');
}

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
	};
	towersAvailable.push(ClassicTower);

	var WaterTower = {
		dist : 150,
		type : 'Water',
		img  : 'resources/water-tower.png',
		time : 400,
		money: 40,
		sizeX: 60,
		sizeY: 60,
		damage: 0.25,
	};
	towersAvailable.push(WaterTower);

	var FireTower = {
		dist : 200,
		type : 'Fire',
		img  : 'resources/fire-tower.png',
		time : 2000,
		money: 60,
		sizeX: 60,
		sizeY: 60,
		damage: 1,
	};
	towersAvailable.push(FireTower);

	return towersAvailable;
}

function displayTowers(Player){
	var tabTowersAvailable = towersAvailable();
	var html = '';
	$('.game-constructor .all-towers').html('');

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
	var Tower;

	$('.game-constructor .tower').hover(function() {
		$(this).find('.infos').toggle();
	});

	// SI l'utilisateur clique sur un des icons pour créer une tour
	$('.game-constructor').on('click', '.tower img',function() {

		for (i = 0, c = tabTowersAvailable.length; i < c; i++) {
			if (tabTowersAvailable[i].type == $(this).parent().find('h5').text()) {
				Tower = tabTowersAvailable[i];
			}
		}

		if(Player.money >= Tower.money){
			canMakeATower = true;
		}
	});

	// Quand on cique sur une tour du jeu pour obtenir des informations
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
				Tower = new tower(top, left, Tower.dist, Tower.type, Tower.img, Tower.time, Tower.money, Tower.damage);
				// On l'ajoute au tableau des tours
				towers.push(Tower);

				canMakeATower = false;
				$('.follow-tower').css('display', 'none');

				// On retire de l'argent au joueur
				Player.money -= Tower.money;
				$('.infos span.money').text(Player.money);

				// On réactualise l'affichage des tours à créer
				displayTowers(Player);
				console.log(towers);
			}
		}
	});

	// Quand on déplace la souris sur la page afin de créer une tour
	$('.game').mousemove(function(e){
		if (canMakeATower == true) {
			//console.log($('div.parcours div:hover'').length != 0);

			// On définit la taille de la zone d'attaque
			$('.follow-tower .area').css('width', (Tower.dist*2) + 'px');
			$('.follow-tower .area').css('height', (Tower.dist*2) + 'px');
			//console.log(Tower);
			$('.follow-tower .area').css('top', ((Tower.dist*2-Tower.sizeY)/-2) + 'px');
			$('.follow-tower .area').css('left', ((Tower.dist*2-Tower.sizeX)/-2) + 'px');

			// On définit le type de la tour à afficher
			$('.follow-tower div.type p').text(Tower.type);

			// On affiche son image
			$('.follow-tower img').attr('src', Tower.img);

			// On affiche la tour
			$('.follow-tower').show();

			// On la déplace en fonction du curseur
			$('.follow-tower').css({'top': e.pageY - 30, 'left': e.pageX - 15 });
		}
	});
}

// Fonction qui crée une tour
function tower (top, left, dist, type, img, time, money, damage, sizeX = 60, sizeY = 60) {
	this.top       = top;
	this.left      = left;
	this.sizeX     = sizeX;
	this.sizeY     = sizeY;
	this.dist      = dist;
	this.minLeft   = this.left - this.dist;
	this.maxLeft   = this.left + this.dist;
	this.minTop    = this.top - this.dist;
	this.maxTop    = this.top + this.dist;
	this.type      = type;
	this.img       = img;
	this.time      = time;
	this.money     = money;
	this.damage    = damage;
	this.canAttack = false;
	this.DOM       = false;
	this.monsterTarget = null;

	if ((this.top-this.dist)<0) {
		this.minTop = 0;
	}
	else {
		this.minTop = this.top - this.dist - 60;
	}

	if (this.left-(this.dist)<0) {
		this.minLeft = 0;
	}
	else {
		this.minLeft = this.left - this.dist - 60;
	}
	
	// Permet d'accéder à la tour dans une fonction
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

// ----------------------
// - FUNCTIONS MONSTERS -
// ----------------------

// Fonction qui permet aux tours d'attaquer les monstres 
function monsterHitByTower(Tower,monsters,Player) {

	// SI le monstre est toujours à distance :
	if ( (Tower.minTop < Tower.monsterTarget.top) && (Tower.monsterTarget.top < Tower.maxTop) && (Tower.minLeft < Tower.monsterTarget.left) && (Tower.monsterTarget.left < Tower.maxLeft) && Tower.monsterTarget.hp > 0) {
		
		// On retire des HP au monstre cible
		Tower.monsterTarget.hp -= 1*Tower.damage;

		// On change l'affichage de la barre de HP du monstre
		$(Tower.monsterTarget.DOM).find('div.progress-bar').text(parseInt(Tower.monsterTarget.hp));
		$(Tower.monsterTarget.DOM).find('div.progress-bar').css('width',hpPourcent(Tower.monsterTarget.hp, Tower.monsterTarget.hpMax) + '%');
		$(Tower.monsterTarget.DOM).find('div.progress-bar').attr('aria-valuenow',Tower.monsterTarget.hp);

		// Si le montre n'a plus de hp
		if (Tower.monsterTarget.hp <= 1){

			// On supprime le monstre du jeu (html)
			$(Tower.monsterTarget.DOM).fadeOut('slow',function(){
				$(this).remove();
			});

			// On supprime le montre du tableau des monstres
			for (var i = 0; i < monsters.length; i++) {
			    if (monsters[i] == Tower.monsterTarget) {
			        monsters.splice(i,1);
			    }
			}

			// On fait gagner de l'argent au joueur
			Player.money += Tower.monsterTarget.money;
			$('.infos span.money').text(Player.money);
			console.log(Player.money)
			// On retire la cible de la tour
			Tower.monsterTarget = null;

			// On réactualise l'affichage des tours à créer
			displayTowers(Player);
		}
	}
	// SINON, on retire la target de la tour
	else {
		Tower.monsterTarget = null;
	}	
}

// Fonction qui définit pour chaque tour le monstre le plus proche
function monsterClosetToTheTower(Tower, monsters){
	var hypo,
		distX   = 0,
		distY   = 0,
		distMin = 10000;
		
	// Pour chaque monstre
	for (var i = 0, c = monsters.length; i < c; i++) {

		// SI la tour peut attaquer (elle a fini d'être construite) ET que le montre est à distance de tir
		if ( (Tower.canAttack == true) && (Tower.minTop < monsters[i].top) && (monsters[i].top < Tower.maxTop) && (Tower.minLeft < monsters[i].left) && (monsters[i].left < Tower.maxLeft) ) {
			distX = Math.abs(monsters[i].left - Tower.left);
			distY = Math.abs(monsters[i].top - Tower.top);
			hypo  = calcHypotenuse(distX, distY); // On calcule la distance entre le monstre et la tour

			// Si la distance est inférieur on définit la nouvelle cible
			if (hypo < distMin) {
				distMin = hypo;
				Tower.monsterTarget = monsters[i];
			}
		}
	}
}

// Fonction qui crée un monstre
function monster (top,left,hp,name,money,img) {
	this.top    = top;
	this.prevTop= 0;
	this.left   = left;
	this.prevLeft=left;
	this.right  = left;
	this.hp     = hp;
	this.name   = name;
	this.money  = money;
	this.img    = img;
	this.hpMax  = hp;
	this.cStep  = 0;

	this.create = function() {
		var html  = $('<div class="monster" style="top:' + this.top + 'px; left: ' + this.left + 'px;" data-hp="' + this.hp + '" data-name="' + this.name + '">' +
						'<img src="' + this.img + '" alt="Monstre ' + this.name + '">' +
						'<div class="progress-bar bg-success" role="progressbar" aria-valuemin="0" aria-valuemax="' + hp + '" aria-valuenow="' + this.hp + '" style="width:100%;">' + hp + '</div>' +
					'</div>');

		this.DOM = html;
		$('.monsters').append(html);
	};

	// On appelle la fonction qui crée un monstre (html)
	this.create();
}

// Fonction qui déclare les monstres à créer
function makeMonsters(monsters, Parcours) {
	var	monstersToCreate = [ // Tableau qui stocke les monstres à créer
			[-400, Parcours.start, 250, 'Pikachu', 20, 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png'],
			[-300, Parcours.start, 250, 'Pikachu', 20, 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png'],
			[-200, Parcours.start, 250, 'Pikachu', 20, 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png'],
			[-100, Parcours.start, 250, 'Pikachu', 20, 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png'],
		];

	// On crée l'ensemble des monstres que l'on stocke dans un tableau
	/*for (var i = 0; i < monstersToCreate.length; i++) {
		// On crée un monstre
		Monster = new monster(monstersToCreate[i][0], monstersToCreate[i][1], monstersToCreate[i][2], monstersToCreate[i][3], monstersToCreate[i][4], monstersToCreate[i][5]);
		monsters.push(Monster);
	}*/

	// On crée l'ensemble des monstres que l'on stocke dans un tableau
	for (var i = 0, max = 5; i < max; i++) {
		// On crée un monstre
		Monster = new monster(-100*(i+1), Parcours.start, (i+1)*100, 'Pikachu', 20, 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png');
		monsters.push(Monster);
	}

	//console.log(monsters);
}

// ----------------------
// --- FUNCTIONS GAME ---
// ----------------------

// Fonction qui lance le jeu
function startGame(Player, Parcours, monsters, towers) {
	// On affiche les informations du joueur (html)
	$('.infos span.time').text(Player.time);
	$('.infos span.life').text(Player.life);
	$('.infos span.money').text(Player.money);
	$('.infos span.level').text(Player.level);

	// On lance le décompte
	var timer = setInterval(function() {
		$('.infos span.time').text(Player.time); // On change chaque second le temps restant
		if (Player.time <= 0) {

			// On arrête le décompte
			clearInterval(timer);

			// On lance le timer pour déplacer les monstres et attaquer
			monsterMove(Player, Parcours, monsters, towers, Player.speed);
		}
		else {
			Player.time--;
		}
	}, 1000);
}

// Fonction qui déplace les monstres et permet aux tours d'attaquer
function monsterMove(Player, Parcours, monsters, towers, speed) {
	var monsterMove = setInterval(function(){

		course(Parcours, monsters);

		// On lance les vérifications pour attaquer ou non les monstres
		for (var i = 0; i < towers.length; i++) {

			// Si la tour a un cible :
			if (towers[i].monsterTarget !== null) {
				
				// La tour attaque le monstre le plus proche
				monsterHitByTower(towers[i],monsters,Player);
			}
			// Sinon, elle recherche la cible la plus proche
			else {
				monsterClosetToTheTower(towers[i],monsters)	
			}			
		}

		// Si il n'y a plus de monstres, on arrête le jeu
		if (monsters.length == 0) {
			clearInterval(monsterMove);

			// On augmente le niveau du joueur de 1
			Player.level++;
			$('.infos span.level').text(Player.level);
		}
	}, speed);
}

// ----------------------
// -- FUNCTIONS OTHERS --
// ----------------------

// NOT WORKING
function drawShot(Tower) {
	// On crée un tir
	var $shot = $('.shot');

	// On récupère les positions en top et left de la tour
	var	top  = parseInt($(Tower.DOM).css('top'))+30,
		left = parseInt($(Tower.DOM).css('left'))+30;

	// On positionne le shot à l'endroit de la tour
	$($shot).css('top',top+'px');
	$($shot).css('left',left+'px');

	//diffTop = Math.abs(parseInt($(Tower.monsterTarget.DOM).css('top')) - top);

	// On déplace le shot
	var shotTimer = setInterval(function(){
		top--;
		left++;
		console.log(top);

		$($shot).css('top', top + 'px');
		$($shot).css('left', left + 'px');
		
	},40);
}

// Fonction qui calcule l'hypotenuse
function calcHypotenuse(a, b) {
  return(Math.sqrt((a * a) + (b * b)));
}

// Fonction qui retourne une valeur comprise en % d'un chiffre
function hpPourcent (hp, hpMax) {
	return parseInt(hp * 100 / hpMax);
}



