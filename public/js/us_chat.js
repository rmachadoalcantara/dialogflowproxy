$(function () {
	var pgHtml = '<div class="uni21-window uni21-sheet" id="uni21-conversations" style="display: none;">';
	pgHtml += '<div class="uni21-sheet-header" style="background-color: #f0cb00;"> <div class="uni21-sheet-header-title-container">';
	
	pgHtml += '<div class="c21-header-button">';
    pgHtml += '<div class="c21-close-button" tabindex="-1" aria-label="Close" aria-hidden="true" role="button">';
    pgHtml += '<div class="c21-close-button-body" id="button_widget_close" (click)="hideWidget()">';
    pgHtml += '<svg role="img" aria-labelledby="altIconTitle" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>';
    pgHtml += '</div></div></div>';

	pgHtml += '<div class="c21-logo ng-star-inserted">';
	pgHtml += '<img alt="logo" src="https://www.unisalento.it/image/layout_set_logo?img_id=34451&amp;t=1541677925742">';
	pgHtml += '</div>';
	pgHtml += '</div> </div>';
	pgHtml += '<div class="uni21-sheet-content" id="uni21-sheet-content"> <div class="uni21-conversation-parts-container" style="height:100%; overflow-y: hidden;"> <div id="scroll-me" style="height:100%; overflow-y:auto;"> <div id="uni21-contentScroll"> <div id="back-button" style="display: none; padding-left: 30px;">'; 
	// <svg _ngcontent-c8="" width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg"> <path _ngcontent-c8="" style="fill: #c8c8c8;" d="m25.41324,16.00754l-8.03602,0l0.04845,-0.29732l2.5713,-2.5715c0.81019,-0.81069 1.00752,-2.10845 0.33818,-3.03685c-0.85062,-1.17884 -2.50323,-1.276 -3.4877,-0.29157l-6.94299,6.94504c-0.43051,0.42878 -0.6717,1.01073 -0.6717,1.62018c0,0.60831 0.2412,1.19021 0.67055,1.62024l6.92458,6.78379c0.89443,0.89535 2.34391,0.89535 3.23847,0c0.89558,-0.89529 0.89558,-2.34515 0,-3.23929l-3.03885,-2.95914l8.38564,0c1.26261,0 2.28509,-1.013 2.28509,-2.26395l0,-0.04574c0.00005,-1.24969 -1.02364,-2.26389 -2.28502,-2.26389l0.00001,0l-0.00001,-0.00001l0.00001,0.00001zm-6.94769,-16.00754c-10.19879,0 -18.46556,8.19012 -18.46556,18.29434s8.26677,18.29432 18.46556,18.29432s18.46553,-8.19011 18.46553,-18.29432s-8.26675,-18.29434 -18.46553,-18.29434zm0,32.01508c-7.63666,0 -13.84917,-6.1549 -13.84917,-13.72073s6.21251,-13.72076 13.84917,-13.72076s13.84914,6.15491 13.84914,13.72076s-6.21249,13.72073 -13.84914,13.72073z" /> </svg>
	pgHtml += '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>';
	pgHtml += '<span style="font-weight: bold;">Torna indietro</span> </div> <div id="choose-option-container" style="margin: auto;text-align: center;"> <button class="c21-button-primary" id="c21_choose_login_btn"> <span class="v-align-center c21-label-button">Accedi come studente Unisalento</span> <div class="clear"></div> </button> <button class="c21-button-primary" id="c21_choose_anonymous_btn"> <span class="v-align-center c21-label-button">Accedi come utente ospite</span> <div class="clear"></div> </button> </div> <form id="chat21-form-container" action="https://chat.unisalento.it/jwt/" style="display: none"> <div class="text-danger">&nbsp;</div> <span style="font-weight: bold;">Email Istituzionale:</span> <div class="c21-input-container"> <input name="ldap_param_mail" type="text" id="form-field-name" formControlName="name" placeholder="@studenti.unisalento.it"> </div> <br><br> <span style="font-weight: bold;">Password:</span> <div class="c21-input-container"> <input type="password" name="ldap_user_password" placeholder="Password"> </div>';
	pgHtml += '<button class="c21-button-primary" id="c21_submit_btn"> <span class="v-align-center c21-label-button"><span id="c21_submit_btn_content">Login</span></span> <div class="clear"></div> </button> <p style="font-size:12px"><input type="checkbox" id="uni21-privacy-checkbox"> Dichiaro di aver letto e di accettare le norme sulla privacy [<a href="https://www.unisalento.it/privacy" target="_blank" style="text-decoration: underline;">GDPR Privacy Unisalento</a>]</p> </form> </div> </div> </div> </div> </div> <!-- CLOSE ICON --> <div class="uni21-launcher-button uni21-launcher-button-closed" style="display: none; background-color: #f0cb00;"> <div style="width:100%; height:100%; padding:0px; margin: 0px;"> <svg role="img" style="fill: #000" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 90 90"> <path fill="none" d="M0 0h24v24H0V0z" /> <path class="cls-1" d="M54.92,37.08l-2-2L45,43l-7.92-7.92-2,2L43,45l-7.92,7.92,2,2L45,47l7.92,7.92,2-2L47,45Z" /> </svg> </div> </div> <!-- OPEN ICON --> <div class="uni21-launcher-button uni21-launcher-button-open" style="display: none; background-color: #f0cb00;"> <div style="width:100%; height:100%; padding:0px; margin: 0px;"> <svg role="img" style="fill: #000" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 90 90"> <path fill="none" d="M0 0h24v24H0V0z" /> <path d="M33.57,31A4.58,4.58,0,0,0,29,35.57V58.3a1.94,1.94,0,0,0,3.32,1.38l3-3a.29.29,0,0,1,.21-.09H56.43A4.58,4.58,0,0,0,61,52V35.57A4.58,4.58,0,0,0,56.43,31Z" /> </svg> </div>';
	pgHtml += '</div>';
	
	var div_uni21_container = document.createElement('div');
	div_uni21_container.setAttribute('id', 'uni21-container');
	div_uni21_container.innerHTML = pgHtml;
	document.body.appendChild(div_uni21_container);

	//hideLogin();

	console.log("window.tiledesk: " + window.tiledesk);
	try {
		islogged = window.tiledesk.angularcomponent.component.g.isLogged;
		if (!islogged) {
			showLogin();
			window.tiledesk.hide();
		}
	} catch(e) {
		console.log("Errore: ", e);
	}

	var action_url = $("#chat21-form-container").attr('action');
	console.log("form action: ", action_url);
	activateButtons(false);

	$("#button_widget_close").click(function () {
		$("#uni21-conversations").hide();
		$(".uni21-launcher-button-closed").hide();
		$(".uni21-launcher-button-open").show();
	});

	$('#uni21-privacy-checkbox').click(function () {
		activateButtons(this.checked);
	});
	$("#c21_choose_anonymous_btn").click(function () {
		window.tiledesk.setPreChatForm(true);
		window.tiledesk.signInAnonymous();
		hideLogin();
		showWidget();
		return false;
	});
	$(".uni21-launcher-button-open").click(function () {
		$("#uni21-conversations").show();
		$(".uni21-launcher-button-open").hide();
		$(".uni21-launcher-button-closed").show();
		window.loginOpen = true;
	});
	$(".uni21-launcher-button-closed").click(function () {
		$("#uni21-conversations").hide();
		$(".uni21-launcher-button-closed").hide();
		$(".uni21-launcher-button-open").show();
		window.loginOpen = false;
	});
	$(".uni21-header-button").click(function () {
		$("#uni21-conversations").hide();
		$(".uni21-launcher-button-closed").hide();
		$(".uni21-launcher-button-open").show();
	});
	$("#c21_choose_login_btn").click(function () {
		$("#chat21-form-container").show();
		$("#choose-option-container").hide();
		$("#back-button").show();
	});
	$("#back-button").click(function () {
		$("#chat21-form-container").hide();
		$("#choose-option-container").show();
		$("#back-button").hide();
	});
	$("#c21_submit_btn").click(function () {
		var dataString = $("#chat21-form-container").serialize();
		$("#c21_submit_btn").prop("disabled", "disabled");
		$("#c21_submit_btn_content").html('Autenticazione in corso...');
		$.ajax({
			type: "POST",
			url: action_url,
			data: dataString,
			dataType: 'json',
			success: function (json) {
				if (typeof json.jwt !== 'undefined') {
					// the variable is defined
					console.log("Success. JWT: ", json.jwt);
					window.tiledesk.signInWithCustomToken(json.jwt);
					window.tiledesk.setPreChatForm(false);
					hideLogin();
					resetButtons();
					showWidget();
				} else {
					console.log("Error: ", json.erro_msg);
					$("#c21_submit_btn_content").html('Login');
					$(".text-danger").html('ATTENZIONE: i dati inseriti non sembrano essere validi');
					$("#c21_submit_btn").removeAttr('disabled');
				}
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log("error POST");
				console.log(xhr.status);
				console.log(thrownError);
				$("#c21_submit_btn").removeAttr('disabled');
			}
		});
		return false;
	});
});

function activateButtons(checked) {

	if (checked) {
		$("#c21_submit_btn").removeAttr('disabled');
	} else {
		$("#c21_submit_btn").prop("disabled", "disabled");
	}
}

function resetButtons() {
	$("#c21_submit_btn").removeAttr('disabled');
	$("#c21_submit_btn_content").html('Login');
}

function hideLogin() {
	$(".uni21-launcher-button").hide();
	$("#uni21-container").hide();
	window.loginOpen = false;
}

function showLogin() {
	console.log("showLogin()... loginOpen: " + window.loginOpen);
	if (!window.loginOpen) {
		console.log("Mostro il bottone di APERTURA perchè loginOpen (FALSE o UNDEFINED) = " + window.loginOpen);
		$(".uni21-launcher-button").show();
		$("#uni21-container").show();
	}
	else if (window.loginOpen == true) {
		console.log("Mostro INVECE il bottone di CHIUSURA perchè loginOpen (TRUE) = " + window.loginOpen);
		$(".uni21-launcher-button-open").hide();
		$(".uni21-launcher-button-closed").show();
	}
}

function showWidget() {
	window.tiledesk.show();
	window.tiledesk.open();
}



