// Load existing player list from localStorage
let playerList = JSON.parse(localStorage.getItem("playerList")) || {};

var snackbarIn = false;
var snackbarAlertIn = false;
var snackbarZ = 1;

var listener_max = -1;

const playerListScoreForLaneOrig = {
  '안윤수': [50, 53, 60, 57, 50],
  '정민재': [34, 48, 50, 33, 46],
  '홍현기': [34, 38, 50, 43, 46],
  '김진서': [65, 20, 46, 40, 40],
  '전진우': [34, 38, 42, 50, 48],
  '이태규': [64, 64, 64, 64, 64], // 64
  '김지환': [65, 55, 70, 70, 65], // 09
  '고현승': [30, 30, 45, 40, 30],
  '정상엽': [75, 80, 80, 73, 75],
  '정민혁': [45, 40, 40, 33, 45], // Cutie
  '이진서': [55, 50, 54, 50, 45],
  '조영석': [16, 10, 15, 15, 20],
}

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

async function loadDefaultPlayerList(){
  const confirmed = await showCustomConfirm("기본 프리셋을 불러오면 참가자 목록이 초기화되고, 되돌릴 수 없습니다. 계속 하시겠습니까?");
  if(!confirmed) return;
  
  playerList = {};
  for(let name in playerListScoreForLaneOrig){
    playerList[name] = playerListScoreForLaneOrig[name];
  }
  savePlayers();
  snackbarAlertNormal('기본 프리셋을 불러왔습니다.');
}

async function resetPlayerList(){
  const confirmed = await showCustomConfirm("플레이어 목록을 리셋하면 참가자 목록이 초기화되고, 되돌릴 수 없습니다. 계속 하시겠습니까?");
  if(!confirmed) return;
  
  playerList = {};
  savePlayers();
  snackbarAlertNormal('플레이어 목록을 초기화했습니다.');
}

function savePlayers() {
  localStorage.setItem("playerList", JSON.stringify(playerList));
  renderPlayers();
}

function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) return snackbarAlertWarn("이름을 입력하세요.");
  if (name.length > 4) return snackbarAlertWarn("이름은 4글자 이내여야 합니다.");
  if (playerList[name]) return snackbarAlertWarn("이미 존재하는 이름입니다.");

  const skills = [
    +document.getElementById("topSkill").value || 0,
    +document.getElementById("jungleSkill").value || 0,
    +document.getElementById("midSkill").value || 0,
    +document.getElementById("adcSkill").value || 0,
    +document.getElementById("supportSkill").value || 0
  ];

  playerList[name] = skills;
  savePlayers();

  // reset form
  document.getElementById("playerName").value = "";
  ["topSkill","jungleSkill","midSkill","adcSkill","supportSkill"].forEach(id => {
    document.getElementById(id).value = "";
  });
  snackbarAlertNormal('플레이어를 추가하였습니다.');
}

function renderPlayers() {
  const body = document.getElementById("playerTableBody");
  body.innerHTML = "";

  var max_idx = -1;
  Object.keys(playerList).forEach((name, idx) => {
    max_idx = Math.max(max_idx, idx);
    const skills = playerList[name];
    const row = document.createElement("tr");

    // name
    row.innerHTML = `<td><span class="gradText">${name}</span></td>`;

    // skills (editable later)
    ["top","jungle","mid","adc","support"].forEach((role, i) => {
      row.innerHTML += `<td><input class="regInputBoxSmall" type="number" value="${skills[i]}" min="0" max="100" id="skill-${role}-${idx}" disabled></td>`;
    });

    // action buttons
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
}

function saveEdit(name, idx) {
  const newSkills = ["top","jungle","mid","adc","support"].map(role => {
    const val = +document.getElementById(`skill-${role}-${idx}`).value || 0;
    return Math.min(100, Math.max(0, val));
  });
  playerList[name] = newSkills;

  ["top","jungle","mid","adc","support"].forEach(role => {
    document.getElementById(`skill-${role}-${idx}`).disabled = true;
  });
  document.getElementById(`saveBtn-${idx}`).style.display = "none";
  savePlayers();
  snackbarAlertNormal('저장되었습니다.');
}

function deletePlayer(name) {
  delete playerList[name];
  savePlayers();
  snackbarAlertNormal('플레이어를 삭제하였습니다.');
}

function gotoMain(){
  window.location.href = '../lolLane.html';
}


// ******** //
// * Main * //
// ******** //

renderPlayers();

document.body.style.backgroundImage = `url(../resources/img/regsetup.png)`

document.getElementById('loadPresetButton').addEventListener('click', loadDefaultPlayerList);
document.getElementById('resetPlayerListButton').addEventListener('click', resetPlayerList);

document.addEventListener("keypress", (e) => {
  if(e.code == 'Enter'){
    e.preventDefault();
    if(document.getElementById("customConfirmOverlay").style.display != "flex"){ addPlayer(); }
  }
})