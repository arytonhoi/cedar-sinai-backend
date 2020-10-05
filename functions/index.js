const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
//const BoxSDK = require('box-node-sdk');
//const secrets = require('../.secrets');

admin.initializeApp();

//var sdk = BoxSDK.getPreconfiguredInstance(box_config)
//var appUserClient = sdk.getAppAuthClient('user', box_uid);

checkUserPrivilege = function(user,timestamp,nonce,hash){
  if(typeof(user)=="undefined" || typeof(timestamp)!="number" ||typeof(nonce)=="undefined" ||typeof(hash)=="undefined"){
    return Promise.resolve({"priv":-1,"message":"Incomplete credentials"})
  }
  nonce = nonce.replace(/ /g,"+")
  hash = hash.replace(/ /g,"+")
  return admin.firestore().collection('cedar-users').doc(user).get().then(
    (data) => {
      if(data.exists && Math.abs(Date.now() - ts) < 10000){
        uinfo = data.data()
        uinfo.sessions = uinfo.sessions.filter(x=>x.expiry._seconds > Date.now()/1000)
        hmac = crypto.createHmac('sha256',uinfo.pw_hash)
        hmac.update(nonce+'|'+timestamp+'|'+user)
        if(hmac.digest('base64') == hash){
          if(uinfo.is_admin){
              return {"priv": 2, "message":"Password is correct, is an admin","info":uinfo}
            }else{
              return {"priv": 1, "message":"Password is correct, is a user","info":uinfo}
            }
          }

        for(i=0;i<uinfo.sessions.length;i++){
          hmac = crypto.createHmac('sha256',uinfo.sessions[i].token)
          hmac.update(user+'|'+timestamp+'|'+nonce)
          if(hmac.digest('base64') == hash){
            if(uinfo.is_admin){
              return {"priv": 2, "message":"Already logged in, is an admin","info":uinfo}
            }else{
              return {"priv": 1, "message":"Already logged in, is a user","info":uinfo}
            }
          }
        }
      }
      return {"priv": -1, "message":"Cannot log you in"}
    }
  )
}

isMessageAuthenticated = function(user,hash,message){
  message = message.replace(/ /g,"+")
  hash = hash.replace(/ /g,"+")
  return admin.firestore().collection('cedar-users').doc(user).get().then(
    (data) => {
      if(data.exists){
        ts = message.match(/\|\d{12,}$/g)
        if(ts != null){
          ts = parseInt(ts[0].slice(1))
        }
        uinfo = data.data()
        if(Math.abs(Date.now() - ts) < 10000 ){
          uinfo.sessions = uinfo.sessions.filter(x=>x.expiry._seconds > Date.now()/1000)
          admin.firestore().collection('cedar-users').doc(user).set(uinfo)
          for(i=0;i<uinfo.sessions.length;i++){
            hmac = crypto.createHmac('sha256',uinfo.sessions[i].token)
            hmac.update(message)
            if(hmac.digest('base64') == hash){
              if(uinfo.is_admin){
                return 2;
              }else{
                return 1;
              }
            }
          }
        }
      }
      return -1;
    }
  )
}

//the hash is uname + timestamp + nonce then hmac hashed by the pw hash
exports.getAccessToken = functions.https.onRequest((req,res) => {
  try{req.body = JSON.parse(req.rawBody.toString())}catch(e){
    return res.json({"error":400,"message":"Invalid JSON structure"});
  }
  uname = req.body.uname
  nonce = req.body.nonce
  ts = req.body.ts
  hash = req.body.hash
  checkUserPrivilege(uname,ts,nonce,hash).then(
    (e)=>{
      if(e.priv>0){
        nonce = crypto.createHash('sha256').update(crypto.randomBytes(64)).digest('base64')
        newSession = {"token":nonce,"expiry":new Date(Date.now()+15552000000)}
        e.info.sessions = e.info.sessions.filter(x=>x.expiry._seconds > Date.now()/1000)
        if(e.info.sessions.length <= 100){
          e.info.sessions.push(newSession)
        }else{
          x = parseInt(Math.random()*99)
          e.info.sessions[x].expiry = new Date(Date.now()+15552000000)
          newSession = e.info.sessions[x]
        }
        admin.firestore().collection('cedar-users').doc(uname).set(e.info).then(
          res.json({"status":200,"message":"Authentication successful","session":newSession})
        )
      }
      return res.json({"error":403,"message":"Incorrect username or password or timestamp"})
    }
  )
})


exports.changePassword = functions.https.onRequest((req,res) => {
  try{req.body = JSON.parse(req.rawBody.toString())}catch(e){
    return res.json({"error":400,"message":"Invalid JSON structure"});
  }
  if(typeof(auth.uname)=="undefined" || typeof(auth.nonce)!="number" ||typeof(auth.ts)=="undefined" ||typeof(hash)=="undefined"){
    return res.json({"error":401,"message":"Incomplete credentials"});
  }
  if(typeof(targetUser)=="undefined"){
    targetUser = req.body.targetuser
  }else{
    targetUser = req.body.uname
  }
  if(typeof(newPwHash)!="string"){
    return res.json({"error":400,"message":"Invalid password hash"})
  }
  uname = req.body.uname
  nonce = req.body.nonce
  ts = req.body.ts
  hash = req.body.hash
  newPwHash = req.body.pwhash
  checkUserPrivilege(uname,ts,nonce,hash).then(
    (e)=>{
      if(e.priv>0){
        if(uname == targetUser){
          nonce = crypto.createHash('sha256').update(crypto.randomBytes(64)).digest('base64')
          e.info.pw_hash = newPwHash
          e.info.sessions = []
          admin.firestore().collection('cedar-users').doc(uname).set(e.info).then(
            res.json({"status":200,"message":"Password successfully changed"})
          )
        }else if(e.priv==2){
          admin.firestore().collection('cedar-users').doc(targetUser).get().then(
            (data) =>{
              if(data.exists){
                uinfo = data.data()
                uinfo.sessions = []
                admin.firestore().collection('cedar-users').doc(targetUser).set(e.uinfo).then(
                  res.json({"status":200,"message":targetUser + "'s password successfully changed"})
                )
              }else{
                return res.json({"error":404,"message":"No such user"})
              }
            }
          )
        }
      }
      return res.json({"error":403,"message":"Incorrect username or password or timestamp"})
    }
  )
})

exports.getPost = functions.https.onRequest((req, res) => {
  try{req.body = JSON.parse(req.rawBody.toString())}catch(e){
    return res.json({"error":400,"message":"Invalid JSON structure"});
  }
  try{auth = req.body.auth}catch(e){return res.json({"error":401,"message":"Empty credentials"})}
  if(typeof(auth.uname)!="string" || typeof(auth.hash)!="string" || typeof(auth.ts)!="number"){
    return res.json({"error":401,"message":"Invalid credentials"})
  }
  loc = req._parsedUrl.pathname.slice(1)
  mes = auth.uname + "|" + loc + "|" + auth.ts
  isMessageAuthenticated(auth.uname,auth.hash,mes).then(
    (e) => {
      if(e == -1){
        return res.json({"error":403,"message":"Incorrect username or hash or timestamp"})
      }else{
        admin.firestore().collection('posts').doc(loc).get().then(
          (data) => {
            if(data.exists){
              return res.json({"status": 200, "message":"Document retrieved successfully", "content":data.data()});
            }else{
              return res.json({"error":404,"message":"Document not found"})
            }
          }
        ).catch(
          (err) =>
            {return res.json({"error": 500, "message":err})}
        );
      }
    }
  )
});

exports.listPostsByCategory = functions.https.onRequest((req, res) => {
  try{req.body = JSON.parse(req.rawBody.toString())}catch(e){
    return res.json({"error":400,"message":"Invalid JSON structure"});
  }
  try{auth = req.body.auth}catch(e){return res.json({"error":401,"message":"Empty credentials"})}
  if(typeof(auth.uname)!="string" || typeof(auth.hash)!="string" || typeof(auth.ts)!="number"){
    return res.json({"error":401,"message":"Invalid credentials"})
  }
  loc = req._parsedUrl.pathname.slice(1)
  mes = auth.uname + "|" + loc + "|" + auth.ts
  isMessageAuthenticated(auth.uname,auth.hash,mes).then(
    (e) => {
      if(e == -1){
        return res.json({"error":403,"message":"Incorrect username or hash or timestamp"})
      }else{
        admin.firestore().collection('posts').where("metadata.category","==",loc).get().then(
          (data) => {
            posts = []
            data.forEach(x=>posts.push(x.id))
            if(posts.length > 0){
              return res.json({"status": 200, "message":posts.length + " document(s) were found", "list":posts});
            }else{
              return res.json({"error":404,"message":"Nonexistent category"})
            }
          }
        ).catch(
          (err) =>
            {return res.json({"error": 500, "message":err})}
        );
      }
    }
  )
});


exports.setPost = functions.https.onRequest((req, res) => {
  try{req.body = JSON.parse(req.rawBody.toString())}catch(e){
    return res.json({"error":400,"message":"Invalid JSON structure"});
  }
  try{auth = req.body.auth}catch(e){return res.json({"error":401,"message":"Empty credentials"})}
  if(typeof(auth.uname)!="string" || typeof(auth.hash)!="string" || typeof(auth.ts)!="number"){
    return res.json({"error":401,"message":"Invalid credentials"})
  }
  loc = req._parsedUrl.pathname.slice(1)
  mes = auth.uname + "|" + loc + "|" + auth.ts
  isMessageAuthenticated(auth.uname,auth.hash,mes).then(
    (e) => {
      if(e == -1){
        return res.json({"error":403,"message":"Incorrect username or hash or timestamp"})
      }else if(e == 1){
        return res.json({"error":403,"message":"Insufficient privileges to do this"})
      }else{
        if(loc.length <= 0){
          return res.json({"error":403, "message": "Cannot edit invalid post"})
        }
        try{change=req.body.post}catch(e){change = {}}
        try{JSON.stringify(change.metadata)}catch(e){change.metadata={}}
        admin.firestore().collection('posts').doc(loc).get().then(
          (data) => {
            if(data.exists){
              existing = data.data()
              message = "Post updated successfully"
            }else{
              existing = {
                "title":loc,
                "text":"",
                "description":"",
                "metadata":{"category":"Uncategorized","created":new Date()}
              }
              message = "Post created successfully"
            }
            if(typeof(change.title)!=="undefined" && change.title.length > 0){
              existing.title = change.title
            }
            if(typeof(change.text)!=="undefined" && change.text.length > 0){
              existing.text = change.text
            }
            if(typeof(change.description)!=="undefined" && change.description.length > 0){
              existing.description = change.description
            }
            if(typeof(change.metadata) == "object"){
              mk = Object.keys(change.metadata)
              for(i=0;i<mk.length;i++){
                if(mk[i] != "created"){
                  existing.metadata[mk[i]] = change.metadata[mk[i]]
                }
              }
            }
            existing.metadata.modified = new Date()
            admin.firestore().collection('posts').doc(loc).set(existing).then(
              res.json({"status":200,"message":message})
            ).catch(
              (err) => {return res.json({"error": 500, "message":err})}
            );
          }
        ).catch(
          (err) => {return res.json({"error": 500, "message":err})}
        )
      }
    }
  )
})

exports.deletePost = functions.https.onRequest((req, res) => {
  try{req.body = JSON.parse(req.rawBody.toString())}catch(e){
    return res.json({"error":400,"message":"Invalid JSON structure"});
  }
  try{auth = req.body.auth}catch(e){return res.json({"error":401,"message":"Empty credentials"})}
  if(typeof(auth.uname)!="string" || typeof(auth.hash)!="string" || typeof(auth.ts)!="number"){
    return res.json({"error":401,"message":"Invalid credentials"})
  }
  loc = req._parsedUrl.pathname.slice(1)
  mes = auth.uname + "|" + loc + "|" + auth.ts
  isMessageAuthenticated(auth.uname,auth.hash,mes).then(
    (e) => {
      if(e == -1){
        return res.json({"error":403,"message":"Incorrect username or hash or timestamp"})
      }else if(e == 1){
        return res.json({"error":403,"message":"Insufficient privileges to do this"})
      }else{
        admin.firestore().collection('posts').doc(loc).delete().then(
          res.json({"status":200,"message":"Document deleted successfully."})
        ).catch(
          (err) =>
            {return res.json({"error":500,"message":"Unable to delete file"})}
        );
      }
    }
  )
});

/*
exports.debug = functions.https.onRequest((req, res) => {
  keys = Object.keys(req);
  results = {};
  for(i=0;i<keys.length;i++){
    if(req[keys[i]] == null || typeof(req[keys[i]]) == "number" || typeof(req[keys[i]]) == "string" || typeof(req[keys[i]]) == "boolean"){
      results[keys[i]] = req[keys[i]]
    }else{
      results[keys[i]] = {'methods':Object.keys(req[keys[i]])}
    }
  }
  console.log(JSON.parse(req.rawBody.toString()))
  results.headers = req.headers
  results.rawHeaders = req.rawHeaders
  results.trailers = req.trailers
  results.rawTrailers = req.rawTrailers
  results.statusCode = req.statusCode
  results.statusMessage = req.statusMessage
  results._parsedUrl = req._parsedUrl
  results.params = req.params
  results.query = req.query
  results._events = req._events
  results.body = req.body
  results.rawBody = req.rawBody
  results.route = req.route
  results._readableState = req._readableState
  return res.json(results);
});

*/
