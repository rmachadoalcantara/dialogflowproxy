const { parse } = require('querystring');
const dialogflow = require('dialogflow');
var express = require('express');
var cors = require('cors');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const { WebhookClient } = require('dialogflow-fulfillment');
const https = require('https');
const multer = require('multer');
const util = require('util');
const fs = require('fs');
// var exec = require('child_process').exec;
// const { spawn } = require('child_process');
var exec = require('child_process').exec

var app = express();
app.use(cors());
app.use(express.static('public'))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true , limit: '50mb'}));

// multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/audio/')
  },
  filename: function (req, file, cb) {
    cb(null , file.originalname);
  }
})

const upload = multer({
  // limits: {
  //   fileSize: 4 * 1024 * 1024
  // },
  storage: storage
  // dest:'uploads/',
  // filename: function (req, file, cb) {
  //   cb(null , file.originalname);
  // }
});
module.exports = upload

// ENDPOINTS

app.get('/hello', function (req, res) {
  res.send('hello world')
});

// var services_token = {
//   "token": "",
//   "data": ""
// }

// links services
const username = "test"
const password = "Links2019"
const hostname = 'web18.linksmt.it'
const audio_service_base_url = 'https://baribot.herokuapp.com'
const servizi_pagamenti_dict = {
  "Codice Servizio 'info' che prevede pagamento": "Codice Servizio 'info pagamento' corrispondente",
  "SS04": "PGSS4", // codice info asilo: codice pagamento asilo
  "SS01": "PGSS1", // codice info materne: codice pagamento materne
  "PGPC": "PGPC" // codice info passi carrabili: codice pagamento passi carrabili
}

// memorizza il pagamento per gli slot mancanti partendo dal nome della entity
const entity_pagamento_codice_pagamento_dict = {
  "Codice Servizio 'info' che prevede pagamento": "Codice Servizio 'info pagamento' corrispondente",
  "asilo nido": "PGSS4", // info asilo: pagamento asilo
  "scuola materna": "PGSS1", // info materne: pagamento materne
  "passo carrabile": "PGPC" // info passi carrabili: pagamento passi carrabili
}

// serve a costruire il menu dello slot entita:pagamento
const entita_pagamenti_array = [
  "Asilo nido",
  "Scuole infanzia",
  "Passo carrabile"
]

var current_city_dict = {
  "SESSION-ID" : "CURRENT-CITY-NAME" // example
}

var current_pagamento_dict = {
  "SESSION-ID" : "CURRENT-PAGAMENTO-SERVICE-CODE" // example
}

// var faq_servizi = {
//   "AV01": {
//     "SERVICE-DATA": "EXAMPLE" // example
//   }
// }

var certificati_array = [
  "AUTOCERTIFICAZIONE",
  "CERTIFICATO CONTESTUALE",
  "CERTIFICATO DI CITTADINANZA",
  "CERTIFICATO DI ESISTENZA IN VITA",
  "CERTIFICATO DI ISCRIZIONE NELLE LISTE ELETTORALI",
  "CERTIFICATO DI MATRIMONIO",
  "CERTIFICATO DI MORTE",
  "CERTIFICATO DI NASCITA",
  "CERTIFICATO DI RESIDENZA",
  "CERTIFICATO DI STATO DI FAMIGLIA"];

var dichiarazioni_array = [
  "AIRE - ISCRIZIONE, AGGIORNAMENTO, CANCELLAZIONE",
  "ABBATTIMENTO BARRIERE ARCHITETTONICHE: SCIVOLI PER DISABILI",
  "ADOZIONE AREE VERDI",
  "AGIBILITA",
  "ALBO PRESIDENTI DI SEGGIO: ISCRIZIONE",
  "ALBO SCRUTATORI: ISCRIZIONE - CANCELLAZIONE - AGGIORNAMENTO - CERTIFICATO DI PRESENZA AL SERVIZIO",
  "ALLOGGI COMUNALI: ASSEGNAZIONE",
  "ALLOGGI COMUNALI: ASSEGNAZIONE SUOLI",
  "ALLOGGI COMUNALI: BANDO DI CONCORSO PER L‘ASSEGNAZIONE",
  "ALLOGGI COMUNALI: DETERMINAZIONE CANONE SOCIALE AGLI ASSEGNATARI"
]

var menu_pagamenti_array = [
  "ASILO NIDO COMUNALE: ISCRIZIONE E PAGAMENTO",
  "PAGAMENTO DELLE SANZIONI PER VIOLAZIONE AL CODICE DELLA STRADA E ISCRIZIONE A RUOLO",
  "PAGAMENTO ONLINE DI DIRITTI DI SEGRETERIA, CONTRIBUTO DEL COSTO DI COSTRUZIONE E SANZIONI RELATIVI ALLE PRATICHE EDILIZIE",
  "PASSO CARRABILE: RILASCIO CONCESSIONE E CONTRASSEGNO",
  "REFEZIONE SCOLASTICA: ISCRIZIONE E PAGAMENTO",
  "SERVIZIO DI TRASPORTO ALUNNI: ISCRIZIONE E PAGAMENTO"
]

var visure_array = [
  "SISTEMA INFORMATIVO TERRITORIALE (SIT)",
  "VISURA POSIZIONE ELETTORALE"
]

var citta_array = [
  "Bari",
  "Ruvo di Puglia",
  "Gioia del Colle",
  "Cassano delle Murge"
];

app.post('/dfwebhook', (req, res) => {
  //console.log("dialogflow webhook call. request: ", JSON.stringify(req));
  const agent = new WebhookClient({ request: req, response: res });
  const df_intent = agent.intent.toLowerCase()
  console.log('Webhook. request body: ' + JSON.stringify(req.body));
  console.log('Webhook. agent.intent: ', df_intent);
  console.log('Webhook. agent.session: ', agent.session);
  console.log('Webhook. agent.queryResult: ', agent.queryResult);
  console.log('Webhook. req.body: ', JSON.stringify(req.body)); // req.body = dialogflow req body
  
  if (req.body.queryResult) {
    console.log('Webhook. req.body.queryResult.fullfillmentText: ', req.body.queryResult.fulfillmentText)
  }
  // console.log("outputContexts=", req.body.queryResult.outputContexts)
  // console.log("outputContexts.parameters=", req.body.queryResult.outputContexts[0].parameters)
  // console.log("outputContexts.parameters.fields.citta.stringValue=", req.body.queryResult["outputContexts"][0]["parameters"]["citta"])
  // var context_parameter_citta = req.body.queryResult["outputContexts"][0]["parameters"]["citta"];
  
  
  // if (df_intent === 'default welcome intent') {
  //   console.log('Webhook: handling welcome intent.');
  //   var df_res = {}
  //   df_res['fulfillmentText'] = `Bene, che tipo di certificato desideri? Ex. Autocertificazione, Certificato contestuale, Certificato di Esistenza in vita etc.`;
  //   df_res['fulfillmentMessages'] = [
  //     {"platform":"TELEGRAM",
  //     "quickReplies":{
  //       "quickReplies":["Area Certificati","Area Pagamenti","Area Visure","Area Dichiarazioni"],
  //       "title":`(webkook) Ciao 👋 sono Ernesto 🤖 il tuo Assistente Virtuale per la Città Metropolitana di Bari. Hai bisogno di aiuto?\n\nScegli un'area di interesse oppure digita una domanda.\n\nAlcuni esempi:\n\n- Vorrei pagare una multa per il comune di Bari\n- Ho affittato una casa a Bitono e vorrei trasferirci la mia residenza\n- Vorrei registrare il mio passo carrabile\n- Voglio contattare URP\n- Vorrei registrarmi come scrutatore per le prossime elezioni\n\nPuoi sempre digitare 'help' o 'aiuto' per visualizzare questo menu`},
  //       "message":"quickReplies"},
  //     {"platform":"PLATFORM_UNSPECIFIED",
  //       "text":{
  //         "text":["Scegli un Certificato (testo per PLATFORM_UNSPECIFIED)"]},
  //       "message":"text"}
  //     ];
  //   res.status(200).send(JSON.stringify(df_res));
  // }

  if (df_intent === "reset") {
    console.log('Webhook: handling Reset intent.');
    console.log("Azzero sessione corrente...");
    var param = agent.parameters['reset_params'];
    var df_res = {}
    if (param === 'citta') {
      setCurrentCity(agent.session, null);
      reply_text = `Ok, città annullata.`
    }
    else if (param === 'pagamento') {
      setCurrentPagamento(agent.session, null);
      reply_text = `Ok, pagamento annullato.`
    }
    else {
      setCurrentCity(agent.session, null);
      setCurrentPagamento(agent.session, null);
      console.log("Azzero tutti i parametri...");
      reply_text = `Ok, ricominciamo dall'inizio.`
    }
    df_res['fulfillmentText'] = reply_text;
    res.status(200).send(JSON.stringify(df_res));
  }
  else if (df_intent === "cambio comune residenza") {
    console.log('Webhook: handlinng intent: Cambio comune residenza');
    console.log("Webhook: req.body['queryResult']['fulfillmentText']: " + req.body['queryResult']['fulfillmentText'])
    var citta = agent.parameters['citta'];
    console.log(`Webhook: Parameters. Citta: ${citta}`);
    const current_city = getCurrentCity(agent.session)
    console.log('Webhook: Current City: ' + getCurrentCity(agent.session) + ' will change...');
    if (citta === undefined || citta == null || citta.length == 0) {
      console.log(`Webhook: no_citta. asking for...`);
      var df_res_slot_fill = no_citta_per_cambio_comune();
      res.status(200).send(JSON.stringify(df_res_slot_fill));
      return
    }
    else {
      setCurrentCity(agent.session, citta)
    }
    var df_res = {}
    df_res['fulfillmentText'] = "Ho impostato la tua Città su " + getCurrentCity(agent.session);
    res.status(200).send(JSON.stringify(df_res));
  }
  else if (df_intent.startsWith("faq")) {
    console.log('Webhook. FAQ intent: ', agent.intent);
    var intent_parts = idServizioByFAQIntent(agent.intent);
    id_servizio = intent_parts["id_servizio"].toUpperCase()
    console.log("id_servizio da faq: " + id_servizio)
    console.log("servizi_pagamenti_dict: ", servizi_pagamenti_dict)
    console.log("servizi_pagamenti_dict[id_servizio]: ", servizi_pagamenti_dict[id_servizio])
    if (servizi_pagamenti_dict[id_servizio]) { // se a questo servizio corrisponde un servizio pagamento...
      setCurrentPagamento(agent.session, servizi_pagamenti_dict[id_servizio]) // ...memorizza il codice pagamento corrispondente in sessione (semplifica ricerche successive)
    }
    intent_name = intent_parts["intent_name"]
    console.log("Webhook. decodificato id_servizio: ", id_servizio)
    console.log("Webhook. decodificato inntent name: ", intent_name)
    
    df_response = req.body["queryResult"]["fulfillmentText"]

    var citta = getCittaBy(agent)
    console.log(`Webhook. Parameters. Citta: ${citta}`);
    console.log('Webhook. Current City: ' + getCurrentCity(agent.session));
    if (citta === undefined || citta == null || citta.length == 0) {
      console.log(`Webhook. Nessuna citta in sessione. Richiedo al servizio...`);
      // mi serve il nome del servizio da inserire nella richiesta della citta, lo richiedo al servizio faq
      get_faq_response(citta, id_servizio, function(servizio, descrizione_servizio) {
        var df_res_slot_fill = no_citta(servizio.title);
        res.status(200).send(JSON.stringify(df_res_slot_fill));
      })
      return
    }
    console.log("Webhook. Citta ok. procedo con recupero info richiesta da servizio")
    get_faq_response(citta, id_servizio, function(servizio, descrizione_servizio) {
      const reply_menu = "\n*🙂 Grazie, è la risposta che volevo\n*🙁 Non sono soddisfatto della risposta\n*🏛 Voglio cambiare Comune"
      var df_res = {}
      df_res['fulfillmentText'] = descrizione_servizio + reply_menu
      res.status(200).send(JSON.stringify(df_res));
    })
  }
  else if (df_intent === "discrimina pagamento") {
    console.log('Webhook. Intent: ', agent.intent);
    var citta = getCittaBy(agent)
    var pagamento = getCodicePagamentoBy(agent)
    console.log(`Webhook. Parameters. Citta: ${citta} Pagamento: ${pagamento}`);
    console.log('Webhook. Current Codice Pagamento: ' + getCurrentCodicePagamento(agent.session));
    console.log('Webhook. Current City: ' + getCurrentCity(agent.session));
    /*
    * WARNING: PLACE ENTITIES CHECK/HANDLING
    * IN THE SAME ORDER THEY ARE DEFINED ON THE DIALOGFLOW INTENT!!!
    */
    if (pagamento === undefined || pagamento == null || pagamento.length == 0) {
      console.log(`Webhook. Nessun pagamento in sessione. Custom slot fill con bottoni pagamenti`);
      var df_res_slot_fill = no_pagamento("Pagamenti");
      res.status(200).send(JSON.stringify(df_res_slot_fill));
      return
    }
    if (citta === undefined || citta == null || citta.length == 0) {
      console.log(`Webhook. Nessuna citta in sessione. Custom slot fill con bottoni citta`);
      var df_res_slot_fill = no_citta("Pagamenti");
      res.status(200).send(JSON.stringify(df_res_slot_fill));
      return
    }
    const id_servizio_pagamento = getCurrentCodicePagamento(agent.session); //entity_pagamento_codice_dict[getCurrentPagamento(agent.session)]
    console.log(`Webhook. Parametri Citta e Pagamento ok. Recupero info pagamento da servizio per Citta: ${citta}, Codice Servizio Pagamento: ${id_servizio_pagamento}`)
    get_faq_response(citta, id_servizio_pagamento, function(servizio, descrizione_servizio) {
      const reply_menu = "\n*🙂 Grazie, è la risposta che volevo\n*🙁 Non sono soddisfatto della risposta\n*🏛 Voglio cambiare Comune"
      var df_res = {}
      //df_res['fulfillmentText'] = faq_intent_response_db[agent.intent] + " per Città di " + citta + reply_menu; //`(Webhook) ${df_response}`;
      df_res['fulfillmentText'] = descrizione_servizio + reply_menu
      res.status(200).send(JSON.stringify(df_res));
    })
    // })
  }

  // *** MENU BENVENUTO ***

  else if (df_intent === "area certificati") {
    console.log('Webhook. Intent: ', agent.intent);
    var df_res = {}
    df_res['fulfillmentText'] = `Bene, che tipo di certificato desideri?\nDomande di esempio:\nAutocertificazione, Certificato contestuale, Certificato di Esistenza in vita etc.`;
    df_res['fulfillmentMessages'] = [
      {"platform":"TELEGRAM",
      "quickReplies":{
        "quickReplies":certificati_array,
        "title":`Che tipo di certificato desideri?`},
        "message":"quickReplies"
      },
      {"platform":"PLATFORM_UNSPECIFIED",
        "text":{
          "text":["Scegli un Certificato (testo per PLATFORM_UNSPECIFIED)"]},
        "message":"text"
      }
    ];
    res.status(200).send(JSON.stringify(df_res));
  }
  else if (df_intent === "area visure") {
    console.log('Webhook. Intent: ', agent.intent);
    var df_res = {}
    df_res['fulfillmentText'] = `Che tipo di visura desideri?`;
    df_res['fulfillmentMessages'] = [
      {"platform":"TELEGRAM",
      "quickReplies":{
        "quickReplies":visure_array,
        "title":`Che tipo di Visura desideri?`},
        "message":"quickReplies"},
      {"platform":"PLATFORM_UNSPECIFIED",
        "text":{
          "text":["Scegli una Visura (testo per PLATFORM_UNSPECIFIED)"]},
        "message":"text"
      }
    ];
    res.status(200).send(JSON.stringify(df_res));
  }
  else if (df_intent === "area dichiarazioni") {
    console.log('Webhook. Intent: ', agent.intent);
    var df_res = {}
    df_res['fulfillmentText'] = `Che tipo di dichiarazione desideri?`;
    df_res['fulfillmentMessages'] = [
      {"platform":"TELEGRAM",
      "quickReplies":{
        "quickReplies":dichiarazioni_array,
        "title":`Che tipo di Dichiarazione desideri?`},
        "message":"quickReplies"},
      {"platform":"PLATFORM_UNSPECIFIED",
        "text":{
          "text":["Scegli una Dichiarazione (testo per PLATFORM_UNSPECIFIED)"]},
        "message":"text"}
      ];
    res.status(200).send(JSON.stringify(df_res));
  }
  else if (df_intent === "area pagamenti") {
    console.log('Webhook. Intent: ', agent.intent);
    var df_res = {}
    df_res['fulfillmentText'] = `Che tipo di pagamento desideri?`;
    df_res['fulfillmentMessages'] = [
      {"platform":"TELEGRAM",
      "quickReplies":{
        "quickReplies":menu_pagamenti_array,
        "title":`Che tipo di Pagamento desideri?`},
        "message":"quickReplies"},
      {"platform":"PLATFORM_UNSPECIFIED",
        "text":{
          "text":["Scegli una Pagamento (testo per PLATFORM_UNSPECIFIED)"]},
        "message":"text"}
      ];
    res.status(200).send(JSON.stringify(df_res));
  }
  else {
    df_res = {}
    df_res['fulfillmentText'] = "Intent non gestito: " + agent.intent;
    console.log('handling intent.');
    res.status(200).send(df_res);
  }
});

function idServizioByFAQIntent(intent) {
  var params = {}
  var parts = intent.split("#")
  if (parts.length > 1) {
    params["intent_name"] = parts[0].trim()
    params["id_servizio"] = parts[1].trim()
  } else {
    console.log("parts.lenght <= 1. Not so good. It's impossible to recognize id_servizio")
    params["intent_name"] = intent
    params["id_servizio"] = "servizio_non_riconosciuto_in_intent_name"
  }
  return params
}

function getCittaBy(agent) {
  var citta = agent.parameters['citta'];
  if (citta != undefined && citta.length > 0) {
    console.log("ho trovato città in agent.parameters: ", citta)
    setCurrentCity(agent.session, citta)
    return citta
  }
  else if (getCurrentCity(agent.session) != null) {
    console.log("ho trovato città memorizzata in sessione: ", citta)
    return getCurrentCity(agent.session)
  }
  else {
    console.log("Webhook. Non ho trovato città in agent.parameters | sessione");
    return null
  }
}

function getCodicePagamentoBy(agent) {
  var entity_pagamento = agent.parameters['pagamento'];
  if (entity_pagamento != undefined && entity_pagamento.length > 0) {
    console.log("Webhook. Ho trovato parametro 'pagamento' in agent.parameterss: ", entity_pagamento)
    codice_pagamento = entity_pagamento_codice_pagamento_dict[entity_pagamento]
    setCurrentPagamento(agent.session,  codice_pagamento)
    return codice_pagamento
  }
  else if (getCurrentCodicePagamento(agent.session) != null) {
    codice_pagamento = getCurrentCodicePagamento(agent.session)
    console.log("ho trovato pagamento memorizzato in sessione: ", codice_pagamento)
    return codice_pagamento
  }
  else {
    console.log("Webhook. Non ho trovato 'pagamento' in agent.prameters | sessione");
    return null
  }
}

function setCurrentCity(session, city_name) {
  current_city_dict[session] = city_name
}

function getCurrentCity(session) {
  console.log("Webhook. current_cities per session: ", current_city_dict)
  return current_city_dict[session]
}

function setCurrentPagamento(session, pagamento) {
  current_pagamento_dict[session] = pagamento
}

function getCurrentCodicePagamento(session) {
  //console.log("Webhook. current_pagamento per session: ", current_pagamento_dict)
  return current_pagamento_dict[session]
}

function get_faq_response(citta, id_servizio, callback) {
  console.log('Webhook. get faq response for service: ' + id_servizio + ", citta: " + citta)
  console.log('Webhook. Getting token first...')
  loginToLinks(username,password,function(token) {
    console.log("Webhook. token: ", token);
    citta_esc = encodeURI(citta)
    // const hostname = 'web18.linksmt.it'
    const path = `/services/interoperability/getInfoServizioAmministrazione?codiceServizio=${id_servizio}&nomeComune=${citta_esc}` 
    console.log("Webhook. calling service url: GET https://" + hostname + path)
    // console.log("using token: " + token)
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: 'GET',
      headers: { 
        'X-Auth': token
      },
    }

    const req = https.request(options, res => {
      // console.log(`statusCode: ${res.statusCode}`) 

      if (res.statusCode != "200") {
        console.log("Errore chiamata  url: ", path)
        callback("Errore chiamata id_servizio: " +  id_servizio) 
      }
      res.on('data', d => {
        let servizio = JSON.parse(d);
        console.log("Webhook. JSON: " + JSON.stringify(servizio))
        var descrizione_servizio = servizio.title + " (" + citta +")" + "\n\n" + servizio.description + "\n\nScheda servizio: " + servizio.service_card_url
        if (servizio.service_online_url) {
          descrizione_servizio += "\n\nOnline: " + servizio.service_online_url
        }
        if (!servizio.is_active) {
          if (citta) {
            descrizione_servizio += "\n\nIL SERVIZIO NON E' ANCORA ATTIVO PER " + citta.toUpperCase()
          } else {
            descrizione_servizio += "\n\nIL SERVIZIO NON E' ANCORA ATTIVO PER QUESTA CITTA'"
          }
        }
        callback(servizio, descrizione_servizio)
      })
    })

    req.on('error', error => {
      console.error(error)
    })

    req.end()
  })
}

app.get('/getcomunitest', (req, res) => {
  get_comuni(function(comuni) {
    console.log("aggiornnato elenco comuni con ", comuni)
    res.status(200).send(JSON.stringify(comuni));
  });
});

app.get('/gettest', (req, res) => {
  console.log("gettest")
  const data = JSON.stringify({"id_project":"5d259f17266500001709b89b"})
  const options = {
    hostname: 'tiledesk-server-pre.herokuapp.com',
    port: 443,
    path: '/auth/signinAnonymously',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
  }
  // console.log("data: " + data)
  // console.log("options: " + options)
  const request = https.request(options, response => {
    console.log(`Webhook. statusCode: ${response.statusCode}`)
    response.on('data', d => {
      let json = JSON.parse(d);
      // console.log('res.headers: ', response.headers)
      res.status(200).send(json)
    })
  })
  request.on('error', error => {
    console.error(error)
  })
  request.write(data)
  request.end()
});

function get_comuni(callback) {
  loginToLinks(username,password,function(token) { // si occupa di tutto -> completare con tokenn in memoria
    console.log("Webhook. token: ", token); // questo token è sempre valido
    // const hostname = 'web18.linksmt.it'
    const path = `/services/interoperability/getCountServizioAmministrazione`
    console.log("Webhook. calling service url: GET https://" + hostname + path)
    // console.log("using token: " + token)
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: 'GET',
      headers: { 
        'X-Auth': token
      },
    }

    const req = https.request(options, res => {
      // console.log(`statusCode: ${res.statusCode}`)

      if (res.statusCode != "200") {
        console.log("Webhook. Errore chiamata url: ", path)
        callback("Webhook. Errore chiamata id_servizio: " +  id_servizio)
      }
      res.on('data', d => {
        let json = JSON.parse(d);
        console.log("Webhook. JSON: " + JSON.stringify(json))

        var comuni = []
        json.forEach(element => {
          // console.log("element: ", element)
          var comune = element["title"]
          comuni.push(comune)
        });
        callback(comuni)
      })
    })
    req.on('error', error => {
      console.error(error)
    })
    req.end()
  })
}

// function richiesta_certificato(agent) {
//   const citta = agent.parameters['cities_bari'];
//   const certificato = agent.parameters['tipo_certificato'];
//   console.log(`Parameters. Certificato: ${certificato}, Citta: ${citta}`);
//   const gotCitta = citta.length > 0;
//   const gotCertificato = certificato.length > 0;

//   if(gotCitta && gotCertificato) {
//     console.log(`ok_richiesta_certificato. Certificato: ${certificato}, Citta: ${citta}`);
//     return ok_richiesta_certificato(certificato,citta);
//   } else if (!gotCitta) {
//     console.log(`no_citta. Certificato: ${certificato}, Citta: ${citta}`);
//     return no_citta(certificato, citta);
//   } else if (!gotCertificato) {
//     console.log(`no_certificato. Certificato: ${certificato}, Citta: ${citta}`);
//     return no_certificato(certificato,citta);
//   }
// }

// function no_certificato(certificato,citta) {
//   var df_res = {}
//   df_res['fulfillmentText'] = `(text response) Bene, per la città di ${citta} che tipo di certificato desideri?`;
//   df_res['fulfillmentMessages'] = [
//     {"platform":"TELEGRAM",
//     "quickReplies":{
//       "quickReplies":certificati_array,
//       "title":`Bene, per la città di ${citta} che tipo di certificato desideri?`},
//       "message":"quickReplies"},
//     {"platform":"PLATFORM_UNSPECIFIED",
//       "text":{
//         "text":["Scegli un Certificato (testo per PLATFORM_UNSPECIFIED)"]},
//       "message":"text"}
//     ];
//     return df_res;
// }

function no_citta(service_description) {
  // console.log('chiedo la citta...')
  get_comuni(function(comuni) {
    citta_array = comuni;
    // console.log("aggiornnato elenco comuni con ", comuni)
  })
  
  var cities_menu = "";
  citta_array.forEach(citta => {
    cities_menu += "*" + citta + "\n"
  });

  var df_res = {}
  const text = `Bene, se il servizio ${service_description} è quello che cercavi, potresti indicarmi per quale città sei interessato?\n\n` + cities_menu
  df_res['fulfillmentText'] = text;
  df_res['fulfillmentMessages'] = [
    // {
    //   "platform":"TELEGRAM",
    //   "quickReplies":{
    //     "quickReplies":citta_array,
    //     "title": text
    //   },
    //   "message":"quickReplies"
    // }
    // ,
    {"platform":"PLATFORM_UNSPECIFIED", // used by audio reply
      "text":{
        "text":[text]
      },
      "message":"text"
    }
  ];
  return df_res;
}

function no_pagamento(service_description) {
  var df_res = {}
  const text = `Bene, se il servizio ${service_description} è quello che cerchi, puoi indicarmi a quale tipologia di pagamento sei interessato?`
  df_res['fulfillmentText'] = text;
  df_res['fulfillmentMessages'] = [
    {
      "platform":"TELEGRAM",
      "quickReplies":{
        "quickReplies":entita_pagamenti_array,
        "title": text
      },
      "message":"quickReplies"
    }
    ,
    {"platform":"PLATFORM_UNSPECIFIED", // used by audio reply
      "text":{
        "text":[text]
      },
      "message":"text"
    }
  ];
  return df_res;
}

function no_citta_per_cambio_comune() {
  get_comuni(function(comuni) {
    citta_array = comuni;
    console.log("aggiornnato elenco comuni con ", comuni)
  })

  var cities_menu = "";
  citta_array.forEach(citta => {
    cities_menu += "*" + citta + "\n"
  });

  const text = 'Per quale città vorresti richiedere supporto?\n\n' + cities_menu
  var df_res = {}
  df_res['fulfillmentText'] = text;
  df_res['fulfillmentMessages'] = [
    // {
    //   "platform":"TELEGRAM",
    //   "quickReplies":{
    //     "quickReplies":citta_array,
    //     "title": text
    //   },
    //   "message":"quickReplies"
    // }
    // ,
    {"platform":"PLATFORM_UNSPECIFIED", // used by audio reply
      "text":{
        "text":[text]
      },
      "message":"text"
    }
  ];
    return df_res;
}

// function no_citta() { // function no_citta(certificato,citta) {
//   var df_res = {}
//   df_res['fulfillmentText'] = `(text response) Bene, per quale città vuoi un certificato?`;
//   df_res['fulfillmentMessages'] = [
//     {
//       "platform":"TELEGRAM",
//       "quickReplies":{
//         "quickReplies":citta_array,
//         "title":`Bene, per quale Città vuoi un certificato?`},
//         "message":"quickReplies"},
//     {
//       "platform":"PLATFORM_UNSPECIFIED",
//       "text":{
//         "text":["Scegli un Certificato (testo per PLATFORM_UNSPECIFIED)"]},
//         "message":"text"}
//   ];
//     return df_res;
// }

// function ok_richiesta_certificato(certificato, citta) {
//   var df_res = {}
//   //df_res['fulfillmentText'] = `Bene, stiamo generando ${certificato} per la Città di ${citta}`;
//   df_res['fulfillmentText'] = `Vuoi ricevere ${certificato} per la Città di ${citta}?`;
//   df_res['fulfillmentMessages'] = [
//     {
//       "platform":"TELEGRAM",
//       "quickReplies":{
//         "quickReplies":[
//             "Si",
//             "No"
//           ],
//         "title":`Vuoi ricevere ${certificato} per la Città di ${citta}?`},
//         "message":"quickReplies"},
//     {
//       "platform":"PLATFORM_UNSPECIFIED",
//       "text":{
//         "text":["Scegli un Certificato (testo per PLATFORM_UNSPECIFIED)"]},
//         "message":"text"}
//   ];
//   return df_res;
// }

// function genero_certificato(certificato, citta) {
//   var df_res = {}
//   df_res['fulfillmentText'] = `Bene, stiamo generando ${certificato} per la Città di ${citta}`;
//   return df_res;
// }

app.post('/sendaudiomessage', upload.single('audio_data'), (req, res) => {
  console.log("sendaudiomessage. request.file: ", req.file)

  const file = req.file
  console.log("sendaudiomessage. file uploaded: ", file)
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  } else {
    var parts = file.originalname.split(".")
    var filename = parts[0]
    var mono_filename = filename.split("__")[0]
    console.log("sendaudiomessage. mono file name " , mono_filename)
    var ext = parts[1]
    var newfilename = mono_filename + "." + ext
    console.log("sendaudiomessage. filename: ", filename)
    console.log("sendaudiomessage. ext: ", ext)
    console.log("sendaudiomessage. converting stereo wav " + file.originalname + " to mono: " + newfilename)
    var cmd = 'ffmpeg -i ' + file.path + ' -ac 1 ' + file.destination + newfilename;
    // var cmd = 'ffmpeg'
    // var arg1 = '-i ' + file.path
    // var arg2 = '-ac 1 '
    // var arg3 = file.destination + newfilename
    console.log("executing command: ", cmd)
    
    execute = exec(cmd, function(err, stdout, stderr) {
      if (err) {
        console.log("Error");
      }
      console.log(stdout);
    });
    execute.on('exit', function (code) {
      console.log("exit code: ", code)
      res.status(200).send({message: 'ok'});
    });
    execute.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    execute.stderr.on('data', function(data) {
        console.error('stderr: ' + data);
    });

    // var execute = spawn(cmd, [arg1, arg2, arg3]);
    // execute.stdout.on('data', function(data) {
    //     console.log('stdout: ' + data);
    // });
    // execute.stderr.on('data', function(data) {
    //     console.error('stderr: ' + data);
    // });

    // const ffmpef = spawn(cmd, []);
    // ffmpef.stdout.on('data', (data) => {
    //   console.log(`stdout: ${data}`);
    //   res.status(200).send({message: 'ok'});
    // });
    // ffmpef.stderr.on('data', (data) => {
    //   console.error(`stderr: ${data}`);
    //   res.status(200).send({message: 'Error converting wav to MONO'});
    // });

    // exec(cmd, function(error, stdout, stderr) {
    //   console.log("cmq stdout: ", stdout)
    //   console.log("cmq stderr: ", stderr)
    //   console.log("error: ", error)
    //   res.status(200).send({message: 'ok'});
    // });
  }
});

const SESSION_KEY = 'session'
const UID_KEY = 'uid'
const TEXT_KEY = 'text'
const AGENT_KEY = 'agent'
const RECIPIENT_KEY = 'recipient'
const RECIPIENT_FULLNAME_KEY = 'recipientFullname'
const SENDER_KEY = 'sender'
const SENDER_FULLNAME_KEY = 'senderFullname'
const LANGUAGE_KEY = 'language'
const TYPE_KEY = 'type'
const KEY_KEY = 'key'
const STATUS_KEY = 'status'
const ATTRIBUTES_KEY = 'attributes'
const CHANNEL_TYPE_KEY = 'channel_type'
const TIMESTAMP_KEY = 'timestamp'

app.post('/proxy', (req, res) => {
  var text = "ciao";
  var sessionId = uuid.v4();
  const in_message = message_from_request(req)
  // console.log('Proxy. Incoming message: ' + JSON.stringify(in_message))
  if (in_message[TEXT_KEY]) {
    text = in_message[TEXT_KEY]
  }

  if (in_message[SESSION_KEY]) {
    sessionId = in_message[SESSION_KEY]
    console.log('Proxy: user provided session: ', sessionId);
  } else {
    console.log('Proxy. Warning: user session not speciefied. Using Auto-session: ', sessionId);
  }
  if (in_message[AGENT_KEY]) {
    agent_id = in_message[AGENT_KEY]
  }
  else {
    console.log("Proxy. Error. Agent id not specified.");
    return;
  }
  
  const recipient = in_message[RECIPIENT_KEY]
  const recipientFullname = in_message[RECIPIENT_FULLNAME_KEY]
  const sender = in_message[SENDER_KEY]
  const senderFullname = in_message[SENDER_FULLNAME_KEY]
  const message_uid = in_message[UID_KEY];

  // const timestamp = in_message['timestamp']
  const message_type = in_message[TYPE_KEY]
  console.log("Proxy. in_message.type: ", message_type);
  const channel_type = in_message[CHANNEL_TYPE_KEY]
  var language_code = in_message[LANGUAGE_KEY]
  if(!language_code || language_code.length < 5) {
    language_code = 'it-IT'
  }
  console.log("Proxy. Using language code: ", language_code);

  // const metadata = in_message['metadata']
  var audio_filename = null;

  if (message_type === 'audio') {
    audio_filename = message_uid + ".wav"
    console.log("Proxy. In message decoded audio file name: " + audio_filename)
    text = null
  }

  runDFQuery(text, audio_filename, agent_id, sessionId, language_code)
  .then(function(result) {
        var repl_message = {}
        repl_message[KEY_KEY] = uuid.v4();
        repl_message[LANGUAGE_KEY] = language_code
        repl_message[RECIPIENT_KEY] = sender
        repl_message[RECIPIENT_KEY] = senderFullname
        repl_message[SENDER_KEY] = recipient //'bot_comunebari'
        repl_message[SENDER_FULLNAME_KEY] = recipientFullname //'Ernesto'
        repl_message[TYPE_KEY] = message_type
        repl_message[STATUS_KEY] = '150'
        

        const telegram_quickreplies = result['fulfillmentMessages'][0]['quickReplies']
        if (telegram_quickreplies) {
          repl_message[TEXT_KEY] = telegram_quickreplies['title']
          const replies = telegram_quickreplies['quickReplies']
          // console.log("Proxy. Replies:", telegram_quickreplies)
          var buttons = []
          replies.forEach(element => {
            var button = {}
            button["type"] = "text"
            button["value"] = element
            buttons.push(button)
          });
          repl_message[ATTRIBUTES_KEY] =
          {
            attachment: {
              type:"template",
              buttons: buttons
            }
          }
        } else {
          console.log("Proxy. No telegram quickreplies are defined, skipping and using fullfillmentText.")
          repl_message['text'] = result['fulfillmentText']
          const text = result['fulfillmentText'];
          // cerca i bottoni eventualmente definiti
          var button_pattern = /^\*.*/mg; // i bottoni occupano una riga che inizia con *
          var text_buttons = text.match(button_pattern);
          if (text_buttons) {
            // ricava il testo rimuovendo i bottoni
            var text_with_removed_buttons = text.replace(button_pattern,"").trim();
            repl_message[TEXT_KEY] = text_with_removed_buttons
            // estrae i bottoni
            var buttons = []
            text_buttons.forEach(element => {
              console.log("button ", element)
              var remove_extra_from_button = /^\*/mg; // rimuove asterisco iniziale
              var button_text = element.replace(remove_extra_from_button, "").trim()
              var button = {}
              button["type"] = "text"
              button["value"] = button_text
              buttons.push(button)
            });
            repl_message[ATTRIBUTES_KEY] =
            { 
              attachment: {
                type:"template",
                buttons: buttons
              }
            }
          } else {
            // non ci sono bottoni
            repl_message['text'] = text
          }
        }

        // AUDIO
        console.log("Proxy. result.audioFilePath:::" + result.audioFilePath)
        if (result.audioFilePath) {
          repl_message['metadata'] = {
            src: result.audioFilePath,
            type: "audio",
            uid: message_uid
          }
          repl_message[TYPE_KEY] = 'audio'
        }
        else {
          repl_message[TYPE_KEY] = 'text'
        }
        repl_message[TIMESTAMP_KEY] = new Date()
        
        // repl_message['attributes'],
        repl_message[CHANNEL_TYPE_KEY] = channel_type
        // repl_message['progectId']
        res.status(200).send(repl_message);
    })
  .catch(function(err) {
        console.log('error: ', err);
    });
});

function message_from_request(req) {
  return req.body
}

async function getInfoComune(comune, id_servizio) {
  console.log("comune: ", comune);
  console.log("id_servizio: ", id_servizio);
}

async function runDFQuery(text, audio_filename, agent_id, sessionId, language_code) {
  // A unique identifier for the given session
  // const sessionId = uuid.v4();
  console.log("Proxy: agent_id: ", agent_id);
  console.log("Proxy: sessionId: ", sessionId);
  console.log("Proxy: query text: ", text);
  console.log("Proxy: query audio file: ", audio_filename);
  console.log("Proxy: language code: ", language_code);
  
  const audio_file_path = "public/audio/" + audio_filename
  if(!language_code) {
    language_code = 'it-IT'
  }

  // Create a new session
  const credentials_filename = './google_credentials' + "__" + agent_id
  console.log('Proxy. Using google credentials file: ' + credentials_filename)
  const google_credentials = require(credentials_filename);
  const credentials = google_credentials.credentials;
  const sessionClient = new dialogflow.SessionsClient({'credentials':credentials});
  const sessionPath = sessionClient.sessionPath(agent_id, sessionId);
  
  var request;
  if (text) {
    console.log("Proxy. Input Text: ", text)
    request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: text,
          // The language used by the client
          languageCode: language_code,
        },
      },
    };
  } else {
    const readFile = util.promisify(fs.readFile);
    const inputAudio = await readFile(audio_file_path);
    console.log("Proxy. InputAudio: ", inputAudio)
    request = {
      session: sessionPath,
      queryInput: {
        audioConfig: {
          audioEncoding: 'Linear16',
          // sampleRateHertz: 16000, // 44100
          languageCode: language_code,
          encoding: `LINEAR16`,
          audioChannelCount: 1
          // enableSeparateRecognitionPerChannel: false
        },
      },
      inputAudio: inputAudio,
      outputAudioConfig: {
        audioEncoding: `OUTPUT_AUDIO_ENCODING_LINEAR_16`,
      }
      // "audio":{ "uri":"gs://gcs-test-data/gettysburg.flac" }
    };
  }

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Proxy: Detected intent');
  var responses_str = JSON.stringify(responses)
  // console.log('Proxy: responses_str: ', responses_str);
  const result = responses[0].queryResult;
  console.log(`Proxy: Query: ${result.queryText}`);
  console.log(`Proxy: Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`Proxy: Intent: ${result.intent.displayName}`);
    // sessionClient.detectIntent(request).then(responses => {
    //   console.log('Detected intent:');

    const audioFile = responses[0].outputAudio;
    if (audioFile != null && audioFile.length != 0) {
      console.log('Proxy. Audio file found in reply message.')
      const outputFilePath = '/audioout/' + audio_filename
      const outputFile = './public' + outputFilePath
      util.promisify(fs.writeFile)(outputFile, audioFile, 'binary');
      console.log(`Proxy. Audio content written to file: ${outputFile}`);
      result.audioFilePath = audio_service_base_url + outputFilePath
      console.log("Proxy. result.audioFilePath: " + result.audioFilePath)
    } else {
      console.log('Proxy. No audio file found in reply message.')
    }
    // });
  } else {
    console.log(`Proxy: No intent matched.`);
  }
  return result;
}

function loginToLinks(username, password, callback) {
  const data = JSON.stringify({
    "username": username,
    "password": password
  })
  // console.log("data: " + data)
  const options = {
    hostname: hostname,
    port: 443,
    path: '/services/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  // console.log("options: " + options)
  const req = https.request(options, res => {
    // console.log(`statusCode: ${res.statusCode}`)
    res.on('data', d => {
      // console.log('links login res.headers: ', res.headers)
      callback(res.headers['x-auth'])
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(data)
  req.end()
}

var port = process.env.PORT || 3000; // heroku
app.listen(port, function () {
    console.log('Example app listening on port ', port);
});

// "card":{
//   "buttons":[
//     {"text":"AUTOCERTIFICAZIONE","postback":""},
//     {"text":"CERTIFICATO CONTESTUALE","postback":""},
//     {"text":"CERTIFICATO DI CITTADINANZA","postback":""},
//     {"text":"CERTIFICATO DI ESISTENZA IN VITA","postback":""},
//     {"text":"CERTIFICATO DI ISCRIZIONE NELLE LISTE ELETTORALI","postback":""},
//     {"text":"CERTIFICATO DI MATRIMONIO","postback":""},
//     {"text":"CERTIFICATO DI MORTE","postback":""},
//     {"text":"CERTIFICATO DI NASCITA","postback":""},
//     {"text":"CERTIFICATO DI RESIDENZA","postback":""},
//     {"text":"CERTIFICATO DI STATO DI FAMIGLIA","postback":""}],
//     "title":`Bene, per la città di ${citta} che tipo di certificato desideri?`,
//     "subtitle":"",
//     "imageUri":""},
//     "message":"card"},