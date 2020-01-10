//Page accueil
$(".fight").click(function (){
	var name=$("#pseudo").val();
		if (name) {
			$("#acc").fadeOut("slow",function () {
				$("#jeu").css("visibility","visible");
				start(life,money,speed);
				$("#jeu").fadeIn("slow");
				});
		}
			else {
			alert("Veuillez indiquer votre pseudo");
		}
});
$('#option1').click(function(){
		life=20;
		money=100;
		speed=50;
		$('.maxlife').text(life);
		$('.money').text(money);
		$('.speed').text(speed);
});
$('#option2').click(function(){
		life=10;
		money=50;
		speed=10;
		$('.difficulteinfo span.maxlife').text(life);
		$('.difficulteinfo span.money').text(money);
		$('.difficulteinfo span.speed').text(speed);
	});
$('#option3').click(function(){
		life=1;
		money=20;
		speed=5;
		$('.difficulteinfo span.maxlife').text(life);
		$('.difficulteinfo span.money').text(money);
		$('.difficulteinfo span.speed').text(speed);
});

// Fonction jQuery : exécute le jeu une fois que le DOM est chargé
function start(life,money,speed) {

	/* ---------- ---------- */
	/* ----- SETTINGS ------ */
	/* ---------- ---------- */

	// Objet littéral qui stocke l'argent, les vies et la vitesse du jeu
	var	Player = {
			money: money,
			life : life,
			speed: speed, // 10 = fast; 5 = normal mode
			time : 10, // time (in sec) before monsters move
			level: 1,
			bestScore :0,
		}; 

	/* ---------- ---------- */
	/* ------ PARCOURS ----- */
	/* ---------- ---------- */

	// Objet littéral qui stocke le parcours des monstres
	var	Parcours = {
			start: 1000, 
			sizeCourse: 75,
			course: [
				['down' ,200],
				['left' ,300],
				['up' ,150],
				['left' ,400],
				['down' ,100],
				['left' ,200],
				['down' ,300],
				['right' ,400],
				['up' ,100],
				['right' ,300],
				['down' ,200],
				['right' ,1000],
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

	/* ---------- ---------- */
	/* ------- GAME -------- */
	/* ---------- ---------- */

	// On appelle la fonction qui lance le jeu
	startGame(Player, Parcours, monsters, towers);
}
	difficulty(Player, Parcours, monsters, towers)

// ------------------------------------------------------------------------- //
// ----------------------- ALL FUNCTIONS FOR THE GAME ---------------------- //
// ------------------------------------------------------------------------- //

// ----------------------
// --- FUNCTIONS GAME ---
// ----------------------

// Fonction qui déclare les monstres à créer et les stocke dans le tableau des monstres
function makeMonsters(monsters, Parcours, Player) {
	var MonsterToCreate;
	var PreviousLocation = 0;
	// On crée l'ensemble des monstres que l'on stocke dans un tableau
	if (Player.life <= 0) {
		Player.level--;
		return;
	}
	//Toutes les dix waves il y a un boss, seul
	if (Player.level % 10 == 0) {
		MonsterToCreate = new Monster(PreviousLocation-100, Parcours.start, 5000+(5000*Player.level/5),"boss", 100,'resources/Images/Monstres/homme-businessman.svg',0.7);
		monsters.push(MonsterToCreate);
	}
	else {
		for (var i = 0, max = 1; i < max; i++) {
		// On crée un monstre
		MonsterToCreate = new Monster(PreviousLocation-100, Parcours.start, 400+(400*Player.level/5), i+1, 5, 'resources/Images/Monstres/homme-tronconneuse.svg',1);
		monsters.push(MonsterToCreate);
		PreviousLocation=MonsterToCreate.top;
		}
		// Toutes les deux waves on ajoute une tronconneuse
		if (Player.level % 2 == 0) {
			for (var i = 0, max = parseInt(Player.level/2); i < max; i++) {
				MonsterToCreate = new Monster(PreviousLocation-100, Parcours.start,400+(400*Player.level/5), i+1, 5, 'resources/Images/Monstres/homme-tronconneuse.svg',1);
				monsters.push(MonsterToCreate);
				PreviousLocation=MonsterToCreate.top;
			}
		}
		// Toutes les trois waves on ajoute une torche
		if (Player.level % 3 == 0) {
			for (var i = 0, max = parseInt(Player.level/3); i < max; i++) {
				MonsterToCreate = new Monster(PreviousLocation-100, Parcours.start, 200+(200*Player.level/5), i+1, 10, 'resources/Images/Monstres/homme-torche.svg',1.5);
				monsters.push(MonsterToCreate);
				PreviousLocation=MonsterToCreate.top;
			}
		}
		//Toutes les cinq waves on ajoute un bulldozer
		if (Player.level % 5 == 0) {
			for (var i = 0, max = parseInt(Player.level/5); i < max; i++) {
				MonsterToCreate = new Monster(PreviousLocation-100, Parcours.start, 1500+(1500*Player.level/5), i+1, 20, 'resources/Images/Monstres/homme-bulldozer.svg',0.5);
				monsters.push(MonsterToCreate);
				PreviousLocation=MonsterToCreate.top;
			}
		}
		//Toutes les 8 waves on ajoute un bombardier
		if (Player.level % 8 == 0) {
			for (var i = 0, max = parseInt(Player.level/8); i < max; i++) {
				MonsterToCreate = new Monster(PreviousLocation-100, Parcours.start,650+(650*Player.level/5), i+1, 15, 'resources/Images/Monstres/homme-bombardier.svg',0.9);
				monsters.push(MonsterToCreate);
				PreviousLocation=MonsterToCreate.top;
			}
		}
	}
}

// Fonction qui lance le jeu
function startGame(Player, Parcours, monsters, towers) {
	// On affiche les informations du joueur (html)
	$('.infos span.time').text(Player.time);
	$('.infos span.life').text(Player.life);
	$('.infos span.money').text(Player.money);
	$('.infos span.level').text(Player.level);

	// On appelle la fonction qui permet de créer des monstres
	makeMonsters(monsters, Parcours, Player);

	// On lance le décompte
	var timer = setInterval(function() {
		$('.infos span.time').text(Player.time); // On change chaque seconde le temps restant
		if (Player.time <= 0) {

			// On arrête le décompte
			clearInterval(timer);
			$(".fight").click(function(){
					//On réinitialise le score
					game.level = 0;
					$("span.level").text("0");
					//On réinitialise le temps
					game.time =0;
					//On relance le timer
					startGame(game);
					//On masque le lien Restart
					$(this).fadeOut(1000);
					});
			// On lance le timer pour déplacer les monstres et attaquer
			monsterMove(Player, Parcours, monsters, towers, Player.speed);
		}
		else {
			Player.time--;
		}
	}, 1000);
}
// ----------------------
// -- FUNCTIONS OTHERS --
// ----------------------

// Fonction qui calcule l'hypotenuse
function calcHypotenuse(a, b) {
  return(Math.sqrt((a * a) + (b * b)));
}

// Fonction qui retourne une valeur comprise en % d'un chiffre
function hpPourcent (hp, hpMax) {
	return parseInt(hp * 100 / hpMax);
}