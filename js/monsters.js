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

		// Si le monstre n'a plus de hp
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
				if (Tower.monsterTarget != null)
				{
					Tower.previousTarget = Tower.monsterTarget;
					Tower.previousTarget.speed = Tower.previousTarget.baseSpeed;
					console.log(Tower.previousTarget);
				}
				Tower.monsterTarget = monsters[i];
				if (Tower.type == "Ice") {
					//On ralentit le monstre
					Tower.monsterTarget.speed = Tower.monsterTarget.speed*Tower.slow;
				}
				
			}
		}
	}
}

// Fonction qui déplace les monstres et permet aux tours d'attaquer
function monsterMove(Player, Parcours, monsters, towers, speed) {
	var monsterMove = setInterval(function(){

		course(Parcours, monsters, Player);

		// On lance les vérifications pour attaquer ou non les monstres
		for (var i = 0; i < towers.length; i++) {

			// Si la tour a une cible :
			if (towers[i].monsterTarget !== null) {
				// La tour attaque le monstre le plus proche
				monsterHitByTower(towers[i],monsters,Player);
			}
			// Sinon, elle recherche la cible la plus proche
			else {
				monsterClosetToTheTower(towers[i],monsters)	
			}			
		}

		// Si il n'y a plus de monstres, on arrête le jeu et on passe à la vague suivante
		if (monsters.length == 0) {
			clearInterval(monsterMove);

			// On augmente le niveau du joueur de 1
			Player.level++;
			$('.infos span.level').fadeOut('slow', function() {
				$(this).text(Player.level);
			}).fadeIn();
			// On lance la prochaine wave
			startGame(Player, Parcours, monsters, towers);
		}
	}, speed);
}

// Fonction qui crée un monstre
function Monster (top,left,hp,name,money,img,speed) {
	this.top       = top;
	this.topTemp   = top;
	this.left      = left;
	this.leftTemp  = 0;
	this.hp        = hp;
	this.name      = name;
	this.money     = money;
	this.img       = img;
	this.hpMax     = hp;
	this.cStep     = 0;
	this.baseSpeed = speed;
	this.speed     = speed;

	this.create = function() {
		var html  = $('<div class="monster" style="top:' + this.top + 'px; left: ' + this.left + 'px;" data-hp="' + this.hp + '" data-name="' + this.name + '">' +
						'<img src="' + this.img + '" alt="Monstre ' + this.name + '">' +
						'<div class="progress-bar bg-success" role="progressbar" aria-valuemin="0" aria-valuemax="' + hp + '" aria-valuenow="' + this.hp + '" style="width:100%;">' + hp + '</div>' +
					'</div>');

		this.DOM = html;
		$('.monsters').append(html);
	};

	// On appelle la méthode qui crée un monstre (html)
	this.create();

	// Méthode qui permet de déplacer le monstre vers le haut/bas
	this.moveUpDown = function () {
		$(this.DOM).css('top', this.top+'px');
	};

	// Méthode qui permet de déplacer le monstre vers la droite/gauche
	this.moveLeftRight = function () {
		$(this.DOM).css('left', this.left+'px');
	};
}