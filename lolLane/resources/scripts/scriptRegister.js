const FORMAT_VERSION = 2;
const MAX_PLAYERS = 100;
const MAX_IDS = 3;
const MAX_NAME_LEN = 4;
const MAX_ID_LEN = 32;
const LANES = 5;

// Load existing player list from localStorage
let playerList = JSON.parse(localStorage.getItem("playerList")) || [];

var snackbarIn = false;
var snackbarAlertIn = false;
var snackbarZ = 1;

var listener_max = -1;

function snackbarAlertNormal(msg) {
  var x = document.getElementById("snackbarNormal");
  x.textContent = msg;
  x.style.zIndex = snackbarZ++;
  if(!snackbarIn){
    snackbarIn = true;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); snackbarIn = false; }, 3000);
  }
}

function snackbarAlertWarn(msg) {
  var x = document.getElementById("snackbarAlert");
  x.textContent = msg;
  x.style.zIndex = snackbarZ++;
  if(!snackbarAlertIn){
    snackbarAlertIn = true;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); snackbarAlertIn = false; }, 3000);
  }
}

function showCustomConfirm(message) {
  return new Promise((resolve) => {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('customConfirmOverlay').style.display = 'flex';

    document.getElementById('confirmYes').onclick = () => {
      document.getElementById('customConfirmOverlay').style.display = 'none';
      resolve(true); // User clicked Yes
    };

    document.getElementById('confirmNo').onclick = () => {
      document.getElementById('customConfirmOverlay').style.display = 'none';
      resolve(false); // User clicked No
    };
  });
}

async function resetPlayerList(){
  const confirmed = await showCustomConfirm("플레이어 목록을 리셋하면 참가자 목록이 초기화되고, 되돌릴 수 없습니다. 계속 하시겠습니까?");
  if(!confirmed) return;
  
  playerList = [];
  savePlayers();
  snackbarAlertNormal('플레이어 목록을 초기화했습니다.');
}

function savePlayers() {
  localStorage.setItem("playerList", JSON.stringify(playerList));
  renderPlayers();
}

function hasPlayer(name){
  for(b of playerList){
    if(b.name == name) return true;
  }

  return false;
}

function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) return snackbarAlertWarn("이름을 입력하세요.");
  if (name.length > 4) return snackbarAlertWarn("이름은 4글자 이내여야 합니다.");
  if (hasPlayer(name)) return snackbarAlertWarn("이미 존재하는 이름입니다.");

  let block = {};
  block.name = name;

  const skills = [
    +document.getElementById("topSkill").value || 0,
    +document.getElementById("jungleSkill").value || 0,
    +document.getElementById("midSkill").value || 0,
    +document.getElementById("adcSkill").value || 0,
    +document.getElementById("supportSkill").value || 0
  ];
  block.scores = skills;

  let lolID = [];
  if(document.getElementById("lolID1").value){
    lolID.push(document.getElementById("lolID1").value)
  }
  if(document.getElementById("lolID2").value){
    lolID.push(document.getElementById("lolID2").value)
  }
  if(document.getElementById("lolID3").value){
    lolID.push(document.getElementById("lolID3").value)
  }
  block.LoLIDs = lolID;

  playerList.push(block);

  savePlayers();

  // reset form
  document.getElementById("playerName").value = "";
  ["topSkill","jungleSkill","midSkill","adcSkill","supportSkill"].forEach(id => {
    document.getElementById(id).value = "";
  });
  ["lolID1","lolID2","lolID3"].forEach(id => {
    document.getElementById(id).value = "";
  });
  snackbarAlertNormal('플레이어를 추가하였습니다.');
}

function renderPlayers() {
  const body = document.getElementById("playerTableBody");
  body.innerHTML = "";

  var max_idx = -1;

  playerList.forEach((block, idx) => {
    max_idx = Math.max(max_idx, idx);

    const name = block.name;
    const skills = block.scores || [0,0,0,0,0];
    const ids = block.LoLIDs || [];

    const row = document.createElement("tr");

    row.innerHTML = `<td><span class="gradText">${name}</span></td>`;

    ["top","jungle","mid","adc","support"].forEach((role, i) => {
      row.innerHTML += `
        <td>
          <input class="regInputBoxSmall"
                 type="number"
                 value="${skills[i]}"
                 min="0" max="100"
                 id="skill-${role}-${idx}"
                 disabled>
        </td>`;
    });

    for(let i = 0; i < 3; i++){
      row.innerHTML += `
        <td>
          <input class="regInputBoxMed"
                 type="text"
                 placeholder="-"
                 value="${ids[i] || ""}"
                 id="lolid-${i}-${idx}"
                 disabled>
        </td>`;
    }

    row.innerHTML += `
      <td>
        <button class="btn-edit" onclick="editPlayer('${name}', ${idx})">수정</button>
        <button class="btn-save" id="saveBtn-${idx}" onclick="saveEdit('${name}', ${idx})" style="display:none;">저장</button>
        <button class="btn-delete" onclick="deletePlayer('${name}')">삭제</button>
      </td>
    `;

    body.appendChild(row);
  });

  listener_max = max_idx;
}

function editPlayer(name, idx) {
  ["top","jungle","mid","adc","support"].forEach(role => {
    document.getElementById(`skill-${role}-${idx}`).disabled = false;
  });
  document.getElementById(`saveBtn-${idx}`).style.display = "inline-block";
  for(let i=0;i<3;i++){
  const idInput = document.getElementById(`lolid-${i}-${idx}`);
  if(idInput) idInput.disabled = false;
}
}

function saveEdit(name, idx) {
  const newSkills = ["top","jungle","mid","adc","support"].map(role => {
    const val = +document.getElementById(`skill-${role}-${idx}`).value || 0;
    return Math.min(100, Math.max(0, val));
  });
  playerList[idx].scores = newSkills;

  ["top","jungle","mid","adc","support"].forEach(role => {
    document.getElementById(`skill-${role}-${idx}`).disabled = true;
  });
  document.getElementById(`saveBtn-${idx}`).style.display = "none";

  const ids = [];
  for(let i=0;i<3;i++){
    const v = document.getElementById(`lolid-${i}-${idx}`).value.trim();
    if(v.length>0) ids.push(v);
  }
  playerList[idx].LoLIDs = ids;

  savePlayers();
  snackbarAlertNormal('저장되었습니다.');
}

function deletePlayer(name) {
  for(i in playerList){
    if(playerList[i].name == name){
      playerList.splice(i, 1); break;
    }
  }
  savePlayers();
  snackbarAlertNormal('플레이어를 삭제하였습니다.');
}

function gotoMain(){
  window.location.href = '../lolLane.html';
}

function isListV2(plist){
  return Array.isArray(plist);
}

function convertV1toV2(plist){
  let newPlayers;
  if(isListV2(plist)){
    newPlayers = []
    for(let k in players){
      newPlayers.push({
        name: k,
        scores: [].concat(players[k]),
        LoLIDs: []  // Empty by default
      });
    }
  } else return plist;
  return newPlayers;
}

const CRC32_TABLE = (() => {
  let c, table=[];
  for(let n=0;n<256;n++){
    c=n;
    for(let k=0;k<8;k++){
      c=((c&1)?(0xEDB88320^(c>>>1)):(c>>>1));
    }
    table[n]=c>>>0;
  }
  return table;
})();

function crc32Bytes(bytes){
  let crc=0^(-1);
  for(let i=0;i<bytes.length;i++){
    crc=(crc>>>8)^CRC32_TABLE[(crc^bytes[i])&0xFF];
  }
  return (crc^(-1))>>>0;
}

function utf8Encode(str){
  return new TextEncoder().encode(str);
}

function utf8Decode(bytes){
  return new TextDecoder().decode(bytes);
}

function base64UrlEncode(uint8){
  let str = btoa(String.fromCharCode(...uint8));
  return str.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function base64UrlDecode(str){
  str = str.replace(/-/g,'+').replace(/_/g,'/');
  while(str.length % 4) str += '=';
  const bin = atob(str);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

function validatePlayerObject(p){
  if(!p) throw Error("Null player");

  if(!p.name || typeof p.name!=="string")
    throw Error("Invalid player name");

  if(p.name.length>MAX_NAME_LEN)
    throw Error("Name too long");

  if(!Array.isArray(p.scores) || p.scores.length!==LANES)
    throw Error("Invalid score array");

  p.scores.forEach(s=>{
    if(!Number.isInteger(s))
      throw Error("Score not integer");
    if(s<0||s>100)
      throw Error("Score out of range");
  });

  if(p.LoLIDs){
    if(!Array.isArray(p.LoLIDs))
      throw Error("LoLIDs must be array");

    if(p.LoLIDs.length>MAX_IDS)
      throw Error("Too many LoL IDs");

    const seen=new Set();

    p.LoLIDs.forEach(id=>{
      if(typeof id!=="string"||!id.trim())
        throw Error("Invalid LoL ID");

      if(id.length>MAX_ID_LEN)
        throw Error("LoL ID too long");

      if(seen.has(id))
        throw Error("Duplicate LoL ID in player");

      seen.add(id);
    });
  }
}

function encodePlayerList(players){
  if(!Array.isArray(players))
    throw Error("Players must be array");

  if(players.length===0)
    throw Error("Empty player list not allowed");

  if(players.length>MAX_PLAYERS)
    throw Error("Too many players");

  const out=[];

  out.push(FORMAT_VERSION);
  out.push(players.length);

  players.forEach(p=>{
    validatePlayerObject(p);

    const nameBytes=utf8Encode(p.name);

    if(nameBytes.length>255)
      throw Error("Name too long (byte)");

    out.push(nameBytes.length);
    out.push(...nameBytes);

    for(let i=0;i<LANES;i++)
      out.push(p.scores[i]);

    const ids=(p.LoLIDs||[]).slice(0,MAX_IDS);
    out.push(ids.length);

    ids.forEach(id=>{
      const b=utf8Encode(id);

      if(b.length>255)
        throw Error("ID too long (byte)");

      out.push(b.length);
      out.push(...b);
    });
  });

  const body=new Uint8Array(out);
  const crc=crc32Bytes(body);

  const full=new Uint8Array(body.length+4);
  full.set(body,0);
  full.set([
    crc>>>24,
    (crc>>>16)&255,
    (crc>>>8)&255,
    crc&255
  ],body.length);

  return base64UrlEncode(full);
}

function decodePlayerList(str){
  if(!str || typeof str!=="string")
    throw Error("Invalid encoded string");

  const data=base64UrlDecode(str);

  if(data.length<6)
    throw Error("Encoded data too short");

  const body=data.slice(0,-4);

  const storedCrc=
    (data[data.length-4]<<24)|
    (data[data.length-3]<<16)|
    (data[data.length-2]<<8)|
    (data[data.length-1]);

  if(crc32Bytes(body)!==(storedCrc>>>0))
    throw Error("Checksum mismatch");

  let i=0;

  const version=body[i++];
  if(version!==FORMAT_VERSION)
    throw Error("Unsupported version");

  const count=body[i++];

  if(count>MAX_PLAYERS)
    throw Error("Player count exceeds limit");

  const players=[];

  for(let p=0;p<count;p++){

    if(i>=body.length)
      throw Error("Unexpected EOF");

    const nameLen=body[i++];

    if(i+nameLen>body.length)
      throw Error("Invalid name length");

    const name=utf8Decode(body.slice(i,i+nameLen));
    i+=nameLen;

    const scores=[];
    for(let k=0;k<LANES;k++){
      if(i>=body.length)
        throw Error("Score overflow");
      scores.push(body[i++]);
    }

    if(i>=body.length)
      throw Error("Missing ID count");

    const idCount=body[i++];

    if(idCount>MAX_IDS)
      throw Error("Too many IDs");

    const ids=[];

    for(let k=0;k<idCount;k++){
      if(i>=body.length)
        throw Error("ID overflow");

      const len=body[i++];

      if(i+len>body.length)
        throw Error("Invalid ID length");

      ids.push(utf8Decode(body.slice(i,i+len)));
      i+=len;
    }

    const player={name,scores,LoLIDs:ids};

    validatePlayerObject(player);

    players.push(player);
  }

  return players;
}

async function loadPlayerPresetCode(){
  const confirmed = await showCustomConfirm("플레이어 프리셋을 불러올 경우 기존 플레이어 목록은 덮어씌워집니다. 계속하시겠습니까?");
  if(!confirmed) return;

  const ppCode = document.getElementById(`presetCode`).value;

  // Decoding part
  let tryplist;
  try{
    tryplist = decodePlayerList(ppCode);
  } catch(e){
    snackbarAlertWarn('올바르지 않은 프리셋 코드입니다. 프리셋 코드를 확인해주세요.');
    return;
  }
  playerList = [].concat(tryplist);
  savePlayers();

  document.getElementById("presetCode").value = "";
  snackbarAlertNormal('플레이어 프리셋을 불러왔습니다.');
}

function copyPlayerPreset(){
  navigator.clipboard.writeText(encodePlayerList(playerList));
  snackbarAlertNormal("클립보드에 프리셋 코드를 복사했습니다.");
}


// ******** //
// * Main * //
// ******** //

if(!isListV2(playerList)){
  playerList = [].concat(convertV1toV2(playerList));
}

renderPlayers();

document.body.style.backgroundImage = `url(../resources/img/regsetup.png)`

document.getElementById('loadPresetButton').addEventListener('click', loadPlayerPresetCode);
document.getElementById('sharePresetButton').addEventListener('click', copyPlayerPreset);
document.getElementById('resetPlayerListButton').addEventListener('click', resetPlayerList);

document.addEventListener("keypress", (e) => {
  if(e.code == 'Enter'){
    e.preventDefault();
    if(document.getElementById("customConfirmOverlay").style.display != "flex"){ addPlayer(); }
  }
})