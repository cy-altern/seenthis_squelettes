var language;
if (langue_visiteur) language = langue_visiteur;
else if (navigator.browserLanguage) language = navigator.browserLanguage;
else language = navigator.language;

if (language.indexOf('fr_tu') > -1) language = "fr_tu";
else if (language.indexOf('fr') > -1) language = "fr";
else if (language.indexOf('nl') > -1) language = "nl";
else if (language.indexOf('en') > -1) language = "en";
else if (language.indexOf('de') > -1) language = "de";
else if (language.indexOf('es') > -1) language = "es";
else if (language.indexOf('ar') > -1) language = "ar";
else language = "fr";

var traduire_avec_google = "traduire avec Google";
var isShift = false;
var isCtrl = false;

function switch_comments(id_me) {
	$('.yourmessage').show();

	$('.repondre').stop().slideUp("fast");

	var message = $('#repondre' + id_me);
	if (!(message.is(':visible') && (message.height() > 10))) {
		$('.formulaire_poster_message').removeClass('focus');
		$('#yourmessage' + id_me).hide();
		message.stop().slideDown("fast").find('.formulaire_poster_message').addClass('focus').find('textarea').show().focus();
	}
}

$.fn.soundmanager = function () {
	return $(this)
		.each(function () {
			var url_son = $(this).find('source[type="audio/mpeg"]').attr('src');
			$(this).html('<div class="lecture"><button class="play">play</button></div><div class="controles"><div class="track sans_titre"><a title="Ecouter" rel="enclosure" href="' + url_son + '"><span class="fn"> </span></a></div><div class="progress_bar"><div class="position"></div><div class="loading"></div></div><div class="lesinfos"><div class="time"></div><div class="duration"></div></div></div><br style="clear:both;">');
			sound_manager_init();
		});
};


function favoris_actifs() {
	if (auteur_connecte > 0) {
		$(".texte_message, .texte_reponse").each(function (_, element) {
            var $this = $(this);
            var rel = $this.find(".favori").children("a.activer_favori").attr("rel");
			var reg = new RegExp(rel, "gi");
			if (auteur_connecte.match(reg)) {
				$this.find(".favori a.activer_favori").addClass("actif");
			} else {
				if ($this.find(".favori .survol").length > 0) {
					$this.find(".favori a.activer_favori").addClass("abonnes");
				} else {
					$this.find(".favori a.activer_favori").addClass("inactif");
				}
			}
        });
	} else {
		$(".favori").css("display", "none");
	}
}

$.fn.afficher_masques = function () {
	$(this).parents('ul.reponses').children('.masquer').each(function () {
		$(this).fadeIn();
	});
	$(this).slideUp(function () {
		$(this).remove();
	});
};

function afficher_traduire() {
	$("blockquote").each(function () {
		var me = $(this);
		me.find(".traduire").remove();
		var langue = me.attr("lang");
		if (langue != "" && langue != language) {
			var contenu = encodeURIComponent(me.html());
			me.append("<div class='traduire'><a href='#'>" + traduire_avec_google + "</a></div>");
			me.find(".traduire").bind("click", function () {
				me.attr("lang", "").find(".traduire").remove();
				me.html("<div class='loading_icone'></div>");
				$.post("index.php?page=translate", {
					contenu: contenu + " ",
					dest: language,
					source: langue
				}, function (data) {
					me.html(data);
				});
				return false;
			});
		}
	});
}

function sucrer_utm(u) {
	u = u.replace(/(http:\/\/twitter.com\/)#!/, "$1");
	u = u.replace(/([\?\&]|\&amp;)utm\_.*/, "");
	u = u.replace(/#xtor.*$/, "");
	return u;
}

$(function () {
	var vals = {};
	$.each(['content', 'ajouter', 'url_site', 'extrait', 'logo'], function () {
		var r;
		var re = new RegExp('[#?&]' + this + '=([^&]*)');
		if (r = window.location.hash.match(re)) {
			vals[this] = $.trim(decodeURIComponent(r[1]));
		}
	});
	var content = "";
	if (vals['content']) {
		content += vals['content'];
	}
	if (vals['ajouter']) {
		content += vals['ajouter'].replace(/@/, ' ') + "\n";
	}
	if (vals['url_site']) {
		content += sucrer_utm(vals['url_site']) + "\n";
	}
	if (vals['logo']) {
		content += sucrer_utm(vals['logo']) + "\n";
	}
	if (vals['extrait']) {
		content += "\n❝" + vals['extrait'] + "❞\n";
	}

	// si on a un content mais qu'on n'est pas loge, l'enregistrer
	// temporairement dans un cookie, et le restituer apres connexion
	if ($('#formulaire_login').length > 0) {
		if (content != '') {
            $.cookie('content', content);
        }
	} else {
		if ($.cookie('content')) {
			content = $.cookie('content');
			window.location.hash = "content=" + content;
			$.cookie('content', null);
		}
        if (content != '') {
            $(".formulaire_principal textarea").val(content);
        }
	}
    if(content != ''){
        window.location.hash = '';
    }

    $('textarea').each(function(_, textArea){
        $(textArea).suivreEdition();
    });

	$.ajaxSetup({cache: true});
	if (langue_visiteur && langue_visiteur != "fr") {
		$.getScript("index.php?page=js.calcul_date&lang=" + langue_visiteur)
	}
	if (langue_visiteur) {
		$.getScript("index.php?page=js.textes_interface&lang=" + langue_visiteur)
	}
	else {
		var lang_id = "";
		if ($.cookie('lang_id')) lang_id = $.cookie('lang_id');
		else {
			lang_id = Math.floor(Math.random() * 1000000);
			$.cookie('lang_id', lang_id, {expires: 1});
		}

		$.getScript("index.php?page=js.textes_interface&lang_id=" + lang_id)

	}

	var bodyElement = $("body");

	/*
	 function charger_alertes() {
	 $.get('index.php?page=alertes', function(e) {
	 $.each($('li', e), function(i,j) {
	 var id = $(j).attr('id');
	 if (id && !$("#"+id).is('li'))
	 $('#alertes ul')
	 .prepend($(j).addClass('nouvelle_alerte'));
	 });
	 });
	 }
	 */

	$.timeout(function () {
		$("#alertes").load("index.php?page=alertes", function () {
			$("#alertes").slideDown();
			// charger les nouvelles alertes de temps en temps (3min)
			// setInterval(charger_alertes, 180000);
		});
	}, 500);

	if (auteur_connecte > 0) {
		bodyElement.on("click", ".bouton_repondre a", function () {
			var id = $(this).attr("rel");
			switch_comments(id);
			return false;
		});
		if (window.auteur_page !== undefined) {
			if (auteur_connecte != auteur_page) {
				$("body.people .messager").show();
			}
		}
	} else {
		$(".bouton_repondre a").hide();
		$("body.message .page_auteur").show();
	}


	if (bodyElement.hasClass("people") && auteur_connecte > 0 && auteur_connecte != auteur_page) {
		$("#follow").load('index.php?action=bouton_follow_people&id_auteur=' + auteur_page);
	}

	if (bodyElement.hasClass("mot") && auteur_connecte > 0) {
		var followMot = $("#follow_mot");
		var tag = followMot.attr('data-tag');
		var type = followMot.attr('data-type');
		followMot.load('index.php?action=bouton_follow_mot&tag=' + encodeURIComponent(tag));
	}

	favoris_actifs();
	afficher_traduire();
	if (language == "ar") {
		bodyElement.attr("dir", "rtl").addClass("lang-ar");

		if ($("#css_rtl").length > 0) {
			$("#css_rtl").attr("rel", "stylesheet");
			$("#css_default").attr("rel", "alternate stylesheet");
		}
	}

	$("ul#scroll_tags").liScroll();

	bodyElement.on("click", "a.spip_out", function () {
		window.open($(this).attr("href"));
		return false;
	});

	//$('textarea').autoResize();


	$("#recherche")
		.focus(function () {
			$("#entete").addClass("rechercher");
		})
		.focusout(function () {
			$("#entete").removeClass("rechercher");
		});

	bodyElement
		.on("keydown", 'textarea', function (e) {
			var area = $(this);
			var keyCode = e.keyCode || 0;

			// (shift ou ctrl) + enter (valider)
			if (keyCode == 13 && (isShift || isCtrl)) {
				isShift = false;
				area.submit();
				return false;
			}
			// shift + tab (citer)
			if (keyCode == 9 && isShift) {
				isShift = false;
				$(this).replaceSelection("\n❝" + $(this).getSelection().text + "❞\n", true);
				return false;
			}

			// detecter le shift
			isShift = (keyCode == 16);
			// detecter le ctrl
			isCtrl = (keyCode == 17);
		})
		.on("keyup", 'textarea', function (e) {
			isShift = false;
		})

		.on("click", '.formulaire_poster_message  textarea', function () {
			$(".formulaire_poster_message").removeClass('focus');
			$(this).parents(".formulaire_poster_message").addClass('focus');
		})

		.on("click", 'input[type=reset]', function () {
			$('.formulaire_poster_message').removeClass('focus');
			$(this).parents(".formulaire_poster_message").find("textarea").val("");
			$('.yourmessage').show();
			$('.repondre').hide();
			return false;
		})

		.on('focus', 'textarea', function () {
			var ta = $(this);
			setTimeout(function () {
				ta.elastic();
			}, 100);
		})
		.on('blur', 'textarea', function () {
			$(this).siblings('.elastic').remove();
		})

		.on("mouseenter", ".texte_message, .texte_reponse", function () {

			if (auteur_connecte > 0) {
				$(this).find(".favori a.inactif").show();

				var rel = $(this).find(".modifier").children("a").attr("rel");
				if (auteur_connecte == rel) {
					$(this).find(".modifier").children("a").show();
					$(this).find(".modifier_themes").show();
				}

				rel = $(this).find(".supprimer").children("a").attr("rel");
				var reg = new RegExp(rel, "gi");
				if (auteur_connecte.match(reg)) {
					$(this).find(".supprimer").children("a").show();
				}
			}

		})
		.on("mouseleave", ".texte_message, .texte_reponse", function () {
			$(this).find(".supprimer").children("a").hide();
			$(this).find(".modifier").children("a").hide();
			$(this).find(".favori a.inactif").hide();
		});
	//afficher_oe();

	// soundmanager
	var soundmanager = function () {
		$('div.audio:not(.soundmanager)')
			.addClass('soundmanager')
			.soundmanager();
	};
	setTimeout(soundmanager, 100);
	setInterval(soundmanager, 2000);

	// gestion de la popup de connection
	bodyElement.on('click', '.intitule_connexion', function(){
		$('#popupCachee, #popupAffichee').toggle();
		return false;
	});
	// s'il y a une erreur de login on affiche la popup
	if($('#formulaire_login ul li.erreur').length > 0) {
		$('#popupCachee .intitule_connexion').click();
	}
});

/* Activer quand on charge un element de page en Ajax
 pour les trucs qui ne fonctionnent pas en mode live */
$(document).ajaxComplete(function () {
	//$('textarea').autoResize();
	favoris_actifs();
});

