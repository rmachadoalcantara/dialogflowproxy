
window.tiledeskSettings =
{
  projectid: "5c12662488379d0015753c49",
  calloutTimer: -1,
  themeColor: '#f0cb00',
  themeForegroundColor: '#000000',
  align: 'right',
  allowTranscriptDownload: true,
  /* userFullname: Liferay_userFullname, */
  /* userEmail: Liferay_userEmail, */
  logoChat: "https://www.unisalento.it/image/layout_set_logo?img_id=34451&t=1541677925742",
  widgetTitle: 'Unisalento',
  wellcomeTitle: "Benvenuto sulla nostra live chat",
  wellcomeMsg: "Come ti possiamo aiutare?",
  lang: 'it',
  preChatForm: false,
  startHidden: true,
  autoStart: false,
  startFromHome: true,
  persistence: 'session',
};
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id; //js.async=!0;

  //js.src = "https://widget.tiledesk.com/tiledesk.js";
  js.src = "https://widget.tiledesk.com/v2/tiledesk.js";

  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'tiledesk-jssdk'));

window.tileDeskAsyncInit = function () {

	console.log("window.tileDeskAsyncInit()");

	window.tiledesk.on('isLoggedIn', function (loggedIn) {

		var islogged = loggedIn.detail;

		console.log("window.tiledesk.on LoggedIn ", islogged);

		if (!islogged) {

			console.log("ShowLogin");
			showLogin();
			window.tiledesk.hide();

		} else {

			console.log("HideLogin");
			hideLogin();
			window.tiledesk.show();
			window.tiledesk.open();
			window.tiledesk.angularcomponent.ngZone.run(() => {
            	if (window.tiledesk.angularcomponent.component.g.attributes.userFullname) {
	            	//window.tiledesk.angularcomponent.component.g.wellcomeTitle = "Ciao " + window.tiledesk.angularcomponent.component.g.attributes.userFullname +  ", benvenuto sulla nostra live chat";
    	        	window.tiledesk.angularcomponent.component.g.wellcomeMsg = "Ciao " + window.tiledesk.angularcomponent.component.g.attributes.userFullname +  ", come ti possiamo aiutare?";
            	}
			});
        }
	});
}
