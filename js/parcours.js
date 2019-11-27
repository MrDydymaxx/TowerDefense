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
			case 'down':
				html    += '<div style="width: ' + Parcours.sizeCourse + 'px; height: ' + (Parcours.course[i][1]) + 'px;top: ' + prevTop + 'px; left: ' + prevLeft + 'px;"></div>';
				prevTop += Parcours.course[i][1];
				break;

			case 'up':
				html    += '<div style="width: ' + Parcours.sizeCourse + 'px; height: ' + (Parcours.course[i][1]) + 'px;top: ' + (prevTop-Parcours.course[i][1]) + 'px; left: ' + prevLeft + 'px;"></div>';
				prevTop -= Parcours.course[i][1];
				break;

			case 'right':
				html    += '<div style="height: ' + Parcours.sizeCourse + 'px; width: ' + (Parcours.course[i][1] + Parcours.sizeCourse) + 'px;top: ' + (prevTop - Parcours.sizeCourse/2 + 45) + 'px; left: ' + prevLeft + 'px;"></div>';
				prevLeft+= Parcours.course[i][1];
				break;

			case 'left':
				html    += '<div style="height: ' + Parcours.sizeCourse + 'px; width: ' + (Parcours.course[i][1] + Parcours.sizeCourse) + 'px;top: ' + (prevTop - Parcours.sizeCourse/2 + 45) + 'px; left: ' + (prevLeft-Parcours.course[i][1]) + 'px;"></div>';
				prevLeft-= Parcours.course[i][1];
				break;
		}
	}

	html += '</div>';

	// On crée le parcours
	$('.game').append($(html));
}

// Fonction qui calcule la taille de la zone de jeu
function calculSizeCourse(Parcours) {
	var sizeX = Parcours.start + Parcours.sizeCourse*2,
		sizeY = Parcours.sizeCourse*1;

	// Pour chaque étape du parcours :
	for (var i = 0, c = Parcours.course.length; i < c; i++) {
		switch (Parcours.course[i][0]) {
			case 'down':
				sizeY += Parcours.course[i][1];
				break;

			case 'right':
				sizeX += Parcours.course[i][1];
				break;
		}
		
	}
	console.log(sizeX)
	// On définit la largeur du jeu :
	$('.game').css('min-width', sizeX + 'px');

	// On définit la heuteur du jeu :
	$('.game').css('min-height', (sizeY+250) + 'px');
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
				case "down":
					if (monsters[i].topTemp < Parcours.course[monsters[i].cStep][1]) {
						monsters[i].topTemp++;
						monsters[i].top++;
						monsters[i].moveUpDown();
					}
					else {
						monsters[i].topTemp = 0;
						monsters[i].cStep++;
					}
					break;
				
				// SI le monstre doit aller à droite
				case "up":
					if (monsters[i].topTemp < Parcours.course[monsters[i].cStep][1]) {
						monsters[i].topTemp++;
						monsters[i].top--;
						monsters[i].moveUpDown();
					}
					else {
						monsters[i].topTemp = 0;
						monsters[i].cStep++;
					}
					break;

				// SI le monstre doit aller à droite
				case "right":
					if (monsters[i].leftTemp < Parcours.course[monsters[i].cStep][1]) {
						monsters[i].leftTemp++;
						monsters[i].left++;
						monsters[i].moveLeftRight();
					}
					else {
						monsters[i].leftTemp = 0;
						monsters[i].cStep++;
					}
					break;

				// SI le monstre doit aller à gauche
				case "left":
					if (monsters[i].leftTemp < Parcours.course[monsters[i].cStep][1]) {
						monsters[i].leftTemp++;
						monsters[i].left--;
						monsters[i].moveLeftRight();
					}
					else {
						monsters[i].leftTemp = 0;
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
