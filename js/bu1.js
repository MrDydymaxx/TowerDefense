// Fonction jQuery : exécute le jeu une fois que le DOM est chargé
$(function() {

	game();

});

function game() {
	var Tower    = {},
		towers   = [],
		Monster  = {},
		monsters = [],
		Parcours = {
			start : 260, 
			course: [
				['bottom',200],
				['right' ,625],
				['bottom',600]
			]
		},
		monstersToCreate = [
			[-400, Parcours.start-15, 250, 'Pikachu', 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png'],
			[-300, Parcours.start-15, 250, 'Pikachu', 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png'],
			[-200, Parcours.start-15, 250, 'Pikachu', 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png'],
			[-100, Parcours.start-15, 250, 'Pikachu', 'https://cdn0.iconfinder.com/data/icons/Favorite_monsters/256/pink.png'],
		],
		towersTocreate = [
			//[40, 350, 200, 'ICE', 'https://cdn2.iconfinder.com/data/icons/crystalproject/crystal_project_256x256/apps/fortress.png'],
			//[40, 110, 200, 'ICE', 'https://cdn2.iconfinder.com/data/icons/crystalproject/crystal_project_256x256/apps/fortress.png'],
		]; 

	// On crée l'ensemble des tours que l'on stocke dans un tableau
	for (var i = 0; i < towersTocreate.length; i++) {
		// On crée une tour
		Tower = new tower(towersTocreate[i][0], towersTocreate[i][1], towersTocreate[i][2], towersTocreate[i][3], towersTocreate[i][4]);
		towers.push(Tower);
	}
	//console.log(towers);
	makeTower(towers);

	// On crée l'ensemble des monstres que l'on stocke dans un tableau
	for (var i = 0; i < monstersToCreate.length; i++) {
		// On crée un monstre
		Monster = new monster(monstersToCreate[i][0], monstersToCreate[i][1], monstersToCreate[i][2], monstersToCreate[i][3], monstersToCreate[i][4]);
		Monster.create();
		monsters.push(Monster);
	}
	//console.log(monsters);

	// On lance le timer pour déplacer les monstres et attaquer
	var monsterMove = setInterval(function(){

		course(Parcours, monsters);

		// On lance les vérifications pour attaquer ou non les monstres
		for (var i = 0; i < towers.length; i++) {

			// Si la tour a un cible :
			if (towers[i].monsterTarget !== null) {
				
				// La tour attaque le monstre le plus proche
				monsterHiyByTower(towers[i],monsters);
			}
			// Sinon, elle recherche la cible la plus proche
			else {
				monsterClosetToTheTower(towers[i],monsters)	
			}			
		}

		// Si il n'y a plus de monstres, on arrête le jeu
		if (monsters.length == 0) {
			clearInterval(monsterMove);
		}
	}, 20);
}

function infosTower(Tower){
	$(Tower.DOM).click(function(){
		$(Tower.DOM).find('.area').toggle();
		$(Tower.monsterTarget.DOM).find('.progress-bar').toggleClass('target');
		console.log(Tower.type + ' tire sur ' + Tower.monsterTarget.name);
	});
}

function monsterHiyByTower(Tower,monsters) {

	// On vérifie que le monstre est toujours à distance :
	if ( (Tower.minTop < Tower.monsterTarget.top) && (Tower.monsterTarget.top < Tower.maxTop) && (Tower.minLeft < Tower.monsterTarget.left) && (Tower.monsterTarget.left < Tower.maxLeft) && Tower.monsterTarget.hp > 0) {
		
		// On retire des HP au montre en target:
		Tower.monsterTarget.hp--;
		$(Tower.monsterTarget.DOM).find('div.progress-bar').text(Tower.monsterTarget.hp);
		$(Tower.monsterTarget.DOM).find('div.progress-bar').css('width',hpPourcent(Tower.monsterTarget.hp, Tower.monsterTarget.hpMax) + '%');
		$(Tower.monsterTarget.DOM).find('div.progress-bar').attr('aria-valuenow',Tower.monsterTarget.hp);

		//drawShot(Towers);

		//console.log(hpPourcent(Tower.monsterTarget.hp, Tower.monsterTarget.hpMax));

		// Si le montre n'a plus de hp
		if (Tower.monsterTarget.hp == 0){
			console.log(Tower.monsterTarget.name + ' a été tué');

			// On supprime le monstre du jeu HTML
			$(Tower.monsterTarget.DOM).fadeOut('slow',function(){
				$(this).remove();
			});

			// On supprime le montre du tableau des monstres
			for (var i = 0; i < monsters.length; i++) {
			    if (monsters[i] == Tower.monsterTarget) {
			        monsters.splice(i,1);
			    }
			}

			//console.log(monsters);

			// On retire la target de la tour
			Tower.monsterTarget = null;
		}
	}
	else {
		// On retire la target de la tour
		Tower.monsterTarget = null;
	}	
}

function monsterClosetToTheTower(Tower, tabMonsters){
	var hypo,
		distX   = 0,
		distY   = 0,
		distMin = 10000;
		
	//console.log('On trouve une nouvelle cible pour la tour : ' + Tower.type);
	
	for (var i = 0; i < tabMonsters.length; i++) {
		// Si le montre est à distance de tir
		if ( (Tower.minTop < tabMonsters[i].top) && (tabMonsters[i].top < Tower.maxTop) && (Tower.minLeft < tabMonsters[i].left) && (tabMonsters[i].left < Tower.maxLeft) ) {
			distX = Math.abs(tabMonsters[i].left - Tower.left);
			distY = Math.abs(tabMonsters[i].top - Tower.top);
			hypo  = calcHypotenuse(distX, distY);

			if (hypo < distMin) {
				distMin = hypo;
				Tower.monsterTarget = tabMonsters[i];
			}
			//console.log(Tower.type + ' - ' + tabMonsters[i].name + ' - ' + hypo);
		}
	}

	if (Tower.monsterTarget !== null) {
		//console.log('La tour ' + Tower.type + ' tire sur ' + Tower.monsterTarget.name);
	}
	// A ce moment, on sait sur qui doit tirer la tour - SSI un monstre est à porté, sinon pas de cible
}

function monster (top,left,hp,name,img) {
	this.top    = top;
	this.left   = left;
	this.hp     = hp;
	this.name   = name;
	this.img    = img;
	this.hpMax  = hp;
	this.cStep  = 0;

	this.create = function() {
		var html  = $('<div class="monster" style="top:' + this.top + 'px; left: ' + this.left + 'px;" data-hp="' + this.hp + '" data-name="' + this.name + '">' +
						'<img src="' + this.img + '" alt="Monstre ' + this.name + '">' +
						'<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + hp + '" aria-valuenow="' + this.hp + '" style="width:100%;">' + hp + '</div>' +
					'</div>');

		this.DOM = html;
		$('.monsters').append(html);
	};
}

function makeTower(tabTowers) {
	$('.game').click(function(e) {
		//console.log('On crée une tour');

		var top  = e.clientY - 30,
			left = e.clientX - 45,
			distX = 0,
			distY = 0,
			distMin = calcHypotenuse(45, 45),
			canCreate = true;

		// Pour chaque tour existante
		for (var i = 0, c = tabTowers.length; i < c; i++) {
			distX = Math.abs(tabTowers[i].left - left);
			distY = Math.abs(tabTowers[i].top - top);
			hypo  = calcHypotenuse(distX, distY);

			if (hypo < distMin) {
				canCreate = false;
			}
		}

		if (canCreate == true) {
			Tower = new tower(top, left, 200, 'Fire', 'https://cdn2.iconfinder.com/data/icons/crystalproject/crystal_project_256x256/apps/fortress.png');
			tabTowers.push(Tower);
		}

	});
}

function tower (top,left,dist, type, img, sizeX = 60, sizeY = 60) {
	this.top     = top;
	this.left    = left;
	this.sizeX   = sizeX;
	this.sizeY   = sizeY;
	this.dist    = dist;
	this.minLeft = this.left - this.dist;
	this.maxLeft = this.left + this.dist;
	this.minTop  = this.top - this.dist;
	this.maxTop  = this.top + this.dist;
	this.type    = type;
	this.img     = img;
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

	this.create = function() {
		var html  = $('<div class="tower" style="top:' + this.top + 'px; left: ' + this.left + 'px;" data-distance="' + this.dist + '" data-type="' + this.type + '">' +
						'<div class="area"></div>' +
						'<img src="' + this.img + '" alt="Tour ' + this.type + '">' +
						'<div class="hp"><p>' + this.type + '</p></div>' +
					'</div>');

		this.DOM = html;
		$('.towers').append(html);
	};

	this.create();
	infosTower(this);
}

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

function course(Parcours, monsters) {

	// On déplace tous les monstres en fonction du parcours de 1px
	for (var i = 0; i < monsters.length; i++) {

		if (Parcours.course[monsters[i].cStep][0] == "bottom") {
			//console.log('On descend');
			if (monsters[i].top < Parcours.course[monsters[i].cStep][1]-30) {
				monsters[i].top++;
				//console.log(monsters[i].name + ' top : ' + monsters[i].top);
				$(monsters[i].DOM).css('top', monsters[i].top+'px');
			}
			else {
				monsters[i].cStep++;
			}
		}

		if (Parcours.course[monsters[i].cStep][0] == "right") {
			//console.log('On descend');
			if (monsters[i].left < Parcours.course[monsters[i].cStep][1]-30) {
				monsters[i].left++;
				//console.log(monsters[i].name + ' left : ' + monsters[i].left);
				$(monsters[i].DOM).css('left', monsters[i].left+'px');
			}
			else {
				monsters[i].cStep++;
			}
		}

	}
}

function calcHypotenuse(a, b) {
  return(Math.sqrt((a * a) + (b * b)));
}

function hpPourcent (hp, hpMax) {
	return hp * 100 / hpMax;
}

