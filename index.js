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
  storage: storage
});
module.exports = upload

// app.get('/', function (req, res) {
//   res.send('Hello Dialogflow Proxy!')
// });

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
const METADATA_KEY = "metadata"
const TYPE_TEXT = 'text'
const TYPE_IMAGE = 'image'
const TYPE_AUDIO = 'audio'

app.post('/proxy', (req, res) => {
  var text = "ciao";
  var sessionId = uuid.v4();
  const in_message = message_from_request(req)
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

  const message_type = in_message[TYPE_KEY]
  console.log("Proxy. in_message.type: ", message_type);
  const channel_type = in_message[CHANNEL_TYPE_KEY]
  var language_code = in_message[LANGUAGE_KEY]
  if(!language_code || language_code.length < 5) {
    language_code = 'it-IT'
  }
  console.log("Proxy. Using language code: ", language_code);

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
        repl_message[SENDER_KEY] = recipient
        repl_message[SENDER_FULLNAME_KEY] = recipientFullname
        repl_message[STATUS_KEY] = '150'
        
        const telegram_quickreplies = result['fulfillmentMessages'][0]['quickReplies']
        if (telegram_quickreplies) {
          repl_message[TEXT_KEY] = telegram_quickreplies['title']
          const replies = telegram_quickreplies['quickReplies']
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
          console.log("Proxy. No telegram quickreplies defined, skipping and using fullfillmentText.")
          repl_message[TEXT_KEY] = result['fulfillmentText']
          var text = result['fulfillmentText'];
          repl_message[TYPE_KEY] = TYPE_TEXT

          // looks for images
          var image_pattern = /^\\image:.*/mg; // images are defined as a line starting with \image:IMAGE_URL
          console.log("Searching images with image_pattern: ", image_pattern)
          var images = text.match(image_pattern);
          console.log("images: ", images)
          if (images && images.length > 0) {
            const image_text = images[0]
            var text = text.replace(image_text,"").trim()
            const image_url = image_text.replace("\\image:", "")
            repl_message[TEXT_KEY] = text
            repl_message[TYPE_KEY] = TYPE_IMAGE
            repl_message[METADATA_KEY] = {
              src: image_url,
              width: 200,
              height: 200 
            }
          }

          // looks for bullet buttons
          var button_pattern = /^\*.*/mg; // buttons are defined as a line starting with an asterisk
          var buttons_matches = text.match(button_pattern);
          if (buttons_matches) {
            text = text.replace(button_pattern,"").trim();
            repl_message[TEXT_KEY] = text
            var buttons = []
            buttons_matches.forEach(element => {
              console.log("button ", element)
              var remove_extra_from_button = /^\*/mg;
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
          repl_message[TYPE_KEY] = TYPE_AUDIO
          repl_message[ATTRIBUTES_KEY]["alwaysShowText"] = true // shows text + audio
        }
        // else {
        //   repl_message[TYPE_KEY] = 'text'
        // }
        repl_message[TIMESTAMP_KEY] = new Date()
        repl_message[CHANNEL_TYPE_KEY] = channel_type
        res.status(200).send(repl_message);
    })
  .catch(function(err) {
        console.log('error: ', err);
    });
});

function message_from_request(req) {
  return req.body
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
  const GOOGLE_CREDENTIALS_FOLDER = 'google_credentials/'
  var files = fs.readdirSync(GOOGLE_CREDENTIALS_FOLDER);
  var credentials_filename
  for (var i= 0; i < files.length; i++) {
    f = files[i]
    console.log("found: ", f)
    if (f.startsWith(agent_id)) {
      console.log("found: ", f)
      credentials_filename = f
      break
    }
  }
  credentials_path = GOOGLE_CREDENTIALS_FOLDER + credentials_filename
  try {
    if (fs.existsSync(credentials_path)) {
      console.log("credentials file exists")
    }
    else {
      console.log("ERROR: credentials file do not exist!")
    }
  } catch(err) {
    console.error(err)
  }
  console.log('Proxy. Using google credentials file: ' + credentials_path)
  var credentials
  // fs.readFile(credentials_path, 'utf8', function (err, data) {
  //   console.log("err reading credentials? ", err)
  //   if (err) throw err;
  //   credentials = JSON.parse(data);
  // });
  var credentials_content = fs.readFileSync(credentials_path, 'utf8')
  credentials = JSON.parse(credentials_content);
  console.log("credentials: ", credentials)
  console.log("credentials['client_email']: ", credentials['client_email'])
  
  const sessionClient = new dialogflow.SessionsClient({'credentials':credentials});
  const sessionPath = sessionClient.sessionPath(agent_id, sessionId);
  
  var request;
  if (text) {
    console.log("Proxy. Input Text: ", text)
    request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
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
    };
  }

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Proxy: Detected intent');
  var responses_str = JSON.stringify(responses)
  const result = responses[0].queryResult;
  console.log(`Proxy: Query: ${result.queryText}`);
  console.log(`Proxy: Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`Proxy: Intent: ${result.intent.displayName}`);
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

var port = process.env.PORT || 3000; // heroku
app.listen(port, function () {
    console.log('Example app listening on port ', port);
});
