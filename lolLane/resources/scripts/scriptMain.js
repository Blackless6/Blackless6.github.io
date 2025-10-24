// ************* //
// * Constants * //
// ************* //

var resLog;
var diffListLog;
var allCombInScoreLog;
var allCombInNameLog;

var playerListScoreForLaneOrig = {
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

var playerListScoreForLane = JSON.parse(localStorage.getItem('playerList'))

var playerListScore = JSON.parse(JSON.stringify(playerListScoreForLane)); // Deep copy

var playerList = Object.keys(playerListScoreForLane).sort();

var rollLog = [];

var registeredPlayerList = {
  teamA: [], teamB: []
};

var selectedOption = "vs5_sel";

var snackbarIn = false;
var snackbarAlertIn = false;
var snackbarZ = 1;

const FAILSAFE_THRESHOLD = 1000000;
const BACKGROUND_NUMBER = 6;

// ************* //
// * Functions * //
// ************* //

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function avg(array){
  let sum = 0;
  if(array.length == 0) return 0;
  for(let i = 0; i < array.length; i++){
    sum += array[i];
  }
  return Math.ceil(sum / array.length);
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

// Example usage:
// async function handleDelete() {
//   const confirmed = await showCustomConfirm("Are you sure you want to delete this item?");
//   if (confirmed) {
//     // Perform deletion action
//     console.log("Item deleted!");
//   } else {
//     console.log("Deletion cancelled.");
//   }
// }
//
// document.getElementById('deleteButton').addEventListener('click', handleDelete);

function regenerateButton(){
  let resHTML = '<p style="margin-top: 0px; margin-bottom: 0px">';
  for(let i = 0; i < playerList.length; i++){
    // resHTML += `<label class="playerLabel"><input id="check${i+1}" type="checkbox" name="check${i+1}" value="${playerList[i]}" class="checkObj"> ${playerList[i]} <small class="tooltip" style="color: #AAA; font-size: 15px;">${avg(playerListScoreForLane[playerList[i]])}<span class="tooltiptext">TOP: ${playerListScoreForLane[playerList[i]][0]}\nJGL: ${playerListScoreForLane[playerList[i]][1]}\nMID: ${playerListScoreForLane[playerList[i]][2]}\nADC: ${playerListScoreForLane[playerList[i]][3]}\nSPT: ${playerListScoreForLane[playerList[i]][4]}</span></small></label> `
    resHTML += `<label class="playerLabel"><input id="check${i+1}" type="checkbox" name="check${i+1}" value="${playerList[i]}" class="checkObj"> ${playerList[i]} <small class="tooltip" style="color: #AAA; font-size: 15px;" data-tooltip="TOP: ${playerListScoreForLane[playerList[i]][0]}\nJGL: ${playerListScoreForLane[playerList[i]][1]}\nMID: ${playerListScoreForLane[playerList[i]][2]}\nADC: ${playerListScoreForLane[playerList[i]][3]}\nSPT: ${playerListScoreForLane[playerList[i]][4]}">${avg(playerListScoreForLane[playerList[i]])}</small></label> `
    if(i % 4 == 3 && i != playerList.length - 1){ resHTML += '<br>'; }
  }
  resHTML += '</p>';
  document.getElementById("playerSelectionArea").innerHTML = resHTML;

  // Save data here.
  localStorage.setItem('playerList', JSON.stringify(playerListScoreForLane))
}

function resetResultTable(isInit){
  const rollMode = document.getElementById("randMode").value;
  selectedOption = rollMode;
  const headText = (rollMode.slice(4, 7) == 'sel') ? '픽 순서' : '배정 라인';
  if(rollMode.slice(0, 3) == 'vs5'){ document.getElementById("resultTable2").hidden = true; document.getElementById("teamTable2").hidden = true; }
  else{ document.getElementById("resultTable2").hidden = false; document.getElementById("teamTable2").hidden = false; }
  document.getElementById("resultTable1").innerHTML = `
  <thead>
    <tr>
      <th class="resultTable1Head">${headText}</th><th class="resultTable1Head">이름</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="resultTable1Body" id="resultTable1_1_1">-</td><td class="resultTable1Body" id="resultTable1_1_2">-</td>
    </tr>
    <tr>
      <td class="resultTable1Body" id="resultTable1_2_1">-</td><td class="resultTable1Body" id="resultTable1_2_2">-</td>
    </tr>
    <tr>
      <td class="resultTable1Body" id="resultTable1_3_1">-</td><td class="resultTable1Body" id="resultTable1_3_2">-</td>
    </tr>
    <tr>
      <td class="resultTable1Body" id="resultTable1_4_1">-</td><td class="resultTable1Body" id="resultTable1_4_2">-</td>
    </tr>
    <tr>
      <td class="resultTable1Body" id="resultTable1_5_1">-</td><td class="resultTable1Body" id="resultTable1_5_2">-</td>
    </tr>
  </tbody>
  `;
  document.getElementById("resultTable2").innerHTML = `
  <thead>
    <tr>
      <th class="resultTable2Head">${headText}</th><th class="resultTable2Head">이름</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="resultTable1Body" id="resultTable2_1_1">-</td><td class="resultTable1Body" id="resultTable2_1_2">-</td>
    </tr>
    <tr>
      <td class="resultTable1Body" id="resultTable2_2_1">-</td><td class="resultTable1Body" id="resultTable2_2_2">-</td>
    </tr>
    <tr>
      <td class="resultTable1Body" id="resultTable2_3_1">-</td><td class="resultTable1Body" id="resultTable2_3_2">-</td>
    </tr>
    <tr>
      <td class="resultTable1Body" id="resultTable2_4_1">-</td><td class="resultTable1Body" id="resultTable2_4_2">-</td>
    </tr>
    <tr>
      <td class="resultTable1Body" id="resultTable2_5_1">-</td><td class="resultTable1Body" id="resultTable2_5_2">-</td>
    </tr>
  </tbody>
  `;
  document.getElementById("modeDisplay").innerHTML = document.getElementById(rollMode).innerHTML;
  if(!isInit){ snackbarAlertNormal("모드가 변경되었습니다."); }
  updateTeamTable();
}

function registerTeamPlayers(registerAt){
  const checkList = document.getElementsByClassName("checkObj");
  const rollMode = document.getElementById("randMode").value;
  let players = [];
  for(let i = 0; i < checkList.length; i++){
    if(checkList[i].checked){ players.push(checkList[i].value); }
  }
  if(players.length == 0){ snackbarAlertWarn("인원을 선택해주세요."); return; }
  switch(registerAt){
    case 'teamA':
      if(rollMode.slice(0, 3) == 'vs5'){ snackbarAlertWarn("[팀에 등록] 기능은 내전 시에만 사용 가능합니다."); return; }
      if(registeredPlayerList.teamA.length + players.length > 5){ snackbarAlertWarn("팀원의 수는 5명을 초과할 수 없습니다."); return; }
      for(let i = 0; i < players.length; i++){
        if(!registeredPlayerList.teamA.includes(players[i]) && !registeredPlayerList.teamB.includes(players[i])){ registeredPlayerList.teamA.push(players[i]); }
      }
      snackbarAlertNormal("팀원을 추가했습니다.");
      for(let i = 0; i < checkList.length; i++){
        checkList[i].checked = false;
      }
      break;
    case 'teamB':
      if(rollMode.slice(0, 3) == 'vs5'){ snackbarAlertWarn("[팀에 등록] 기능은 내전 시에만 사용 가능합니다."); return; }
      if(registeredPlayerList.teamB.length + players.length > 5){ snackbarAlertWarn("팀원의 수는 5명을 초과할 수 없습니다."); return; }
      for(let i = 0; i < players.length; i++){
        if(!registeredPlayerList.teamA.includes(players[i]) && !registeredPlayerList.teamB.includes(players[i])){ registeredPlayerList.teamB.push(players[i]); }
      }
      snackbarAlertNormal("팀원을 추가했습니다.");
      for(let i = 0; i < checkList.length; i++){
        checkList[i].checked = false;
      }
      break;
    case 'all':
      if(rollMode.slice(0, 3) == 'vs5'){
        if(registeredPlayerList.teamA.length + players.length > 5){ snackbarAlertWarn("팀원의 수는 5명을 초과할 수 없습니다."); return; }
        for(let i = 0; i < players.length; i++){
          if(!registeredPlayerList.teamA.includes(players[i]) && !registeredPlayerList.teamB.includes(players[i])){ registeredPlayerList.teamA.push(players[i]); }
        }
      }
      else{
        if(registeredPlayerList.teamA.length + registeredPlayerList.teamB.length + players.length > 10){ snackbarAlertWarn("참가자의 수는 10명을 초과할 수 없습니다."); return; }
        for(let i = 0; i < players.length; i++){
          if(registeredPlayerList.teamA.length <= registeredPlayerList.teamB.length){
            if(!registeredPlayerList.teamA.includes(players[i]) && !registeredPlayerList.teamB.includes(players[i])){ registeredPlayerList.teamA.push(players[i]); }
          } else{
            if(!registeredPlayerList.teamA.includes(players[i]) && !registeredPlayerList.teamB.includes(players[i])){ registeredPlayerList.teamB.push(players[i]); }
          }
        }
      }
      snackbarAlertNormal("팀원을 추가했습니다.");
      for(let i = 0; i < checkList.length; i++){
        checkList[i].checked = false;
      }
      break;
  }
  updateTeamTable();
}

function updateTeamTable(){
  for(let i = 0; i < 5; i++){
    document.getElementById(`teamTable1_${i+1}`).innerHTML = (typeof registeredPlayerList.teamA[i] == 'undefined') ? '-' : registeredPlayerList.teamA[i];
    document.getElementById(`teamTable2_${i+1}`).innerHTML = (typeof registeredPlayerList.teamB[i] == 'undefined') ? '-' : registeredPlayerList.teamB[i];
  }
}

async function resetTeamTable(){
  const confirmed = await showCustomConfirm("참가자를 초기화하면 라인 배정 로그도 초기화됩니다. 계속 하시겠습니까?");
  
  if(!confirmed) return;

  registeredPlayerList = {
    teamA: [], teamB: []
  };
  rollLog = [];
  updateTeamTable();
  resetResultTable(true);
  snackbarAlertNormal("참가자를 초기화하였습니다.");
}

async function rollLine(deleteLastLog){
  if(deleteLastLog){
    if(rollLog.length == 0){
      snackbarAlertWarn("지난 기록이 없습니다."); return;
    }
    const confirmed = await showCustomConfirm("지난 배정 결과를 무효로 하고 다시 배정합니다. 계속 하시겠습니까?");

    if(!confirmed) return;
    rollLog.pop();
  }

  const rollMode = document.getElementById("randMode").value;
  const consec = Number(document.getElementById("consec").value);
  const encControl = document.getElementById("encControl").value;

  let isSingle = true;
  let isForced = false;
  let result = [];
  switch(rollMode){
    case 'vs5_sel':
      if(registeredPlayerList.teamA.length < 4){ snackbarAlertWarn("팀에 참가자 4명 이상을 등록해주세요."); return; }
      // Rolling
      for(let i = 0; i < registeredPlayerList.teamA.length; i++){
        result.push(registeredPlayerList.teamA[i]);
      }
      while(true){ // Intentional code design for more QoL
        shuffle(result);
        break;
      }
      
      // Update table
      for(let i = 0; i < 5; i++){
        document.getElementById(`resultTable1_${i+1}_1`).innerHTML = `${i+1}등`;
        document.getElementById(`resultTable1_${i+1}_2`).innerHTML = (typeof result[i] == 'undefined') ? '-' : result[i];
      }
      break;
    case 'vs5_ass':
      if(registeredPlayerList.teamA.length < 4){ snackbarAlertWarn("팀에 참가자 4명 이상을 등록해주세요."); return; }
      // Rolling
      for(let i = 0; i < registeredPlayerList.teamA.length; i++){
        result.push(registeredPlayerList.teamA[i]);
      }
      var failsafe = 0;
      var bannedLine = document.getElementById('4v4banLine').value;
      var sampleLine = ['TOP', 'JGL', 'MID', 'ADC', 'SPT'];
      if(bannedLine == 'RAND'){ bannedLine = sampleLine[Math.floor(Math.random() * 5)]; }
      while(true){
        shuffle(result);
        var isValid = true;
        if(!document.getElementById('lineSpecif').checked){
          if(consec <= rollLog.length){
            for(let i = 0; i < result.length; i++){
              for(let j = 0; j < consec; j++){
                // if(rollLog[rollLog.length - j - 1][i] != result[i]){ break; }
                if(findLaneInLogFragment(result[i], rollLog[rollLog.length - j - 1]) != sampleLine[i]){ break; }
                if(j == consec - 1){ isValid = false; console.log(`[DEBUG] Tried to assign ${result[i]} to ${findLaneInLogFragment(result[i], rollLog[rollLog.length - j - 1])}`) }
              }
            }
          } else{ break; }
        } else{
          var consecSpec;
          if(result.length == 4){
            var aVariableYoullNeverKnow = false;
            for(let k = 0; k < result.length; k++){
              if(bannedLine == sampleLine[k]){ aVariableYoullNeverKnow = true; }
              if(aVariableYoullNeverKnow){
                consecSpec = Number(document.getElementById(`consecSpec${k+2}`).value);
              } else{
                consecSpec = Number(document.getElementById(`consecSpec${k+1}`).value);
              }
              if(consecSpec <= rollLog.length){
                for(let j = 0; j < consecSpec; j++){
                  // if(rollLog[rollLog.length - j - 1][k] != result[k]){ break; }
                  if(findLaneInLogFragment(result[k], rollLog[rollLog.length - j - 1]) != sampleLine[k]){ break; }
                  if(j == consecSpec - 1){ isValid = false; console.log(`[DEBUG] Tried to assign ${result[i]} to ${findLaneInLogFragment(result[k], rollLog[rollLog.length - j - 1])}`) }
                }
              } /* else{ break; } */
            }
          } else{
            for(let k = 0; k < result.length; k++){
              consecSpec = Number(document.getElementById(`consecSpec${k+1}`).value);
              if(consecSpec <= rollLog.length){
                for(let j = 0; j < consecSpec; j++){
                  // if(rollLog[rollLog.length - j - 1][k] != result[k]){ break; }
                  if(findLaneInLogFragment(result[k], rollLog[rollLog.length - j - 1]) != sampleLine[k]){ break; }
                  if(j == consecSpec - 1){ isValid = false; console.log(`[DEBUG] Tried to assign ${result[k]} to ${findLaneInLogFragment(result[k], rollLog[rollLog.length - j - 1])}`) }
                }
              } /* else{ break; } */
            }
          }
        }
        if(isValid){ break; }
        if(failsafe > FAILSAFE_THRESHOLD){ isForced = true; break; }
        failsafe++;
      }
      
      // Update table
      // var lolLine = ['TOP', 'JGL', 'MID', 'ADC', 'SPT'];
      var lolLine = [];
      var lineCandidate = ['TOP', 'JGL', 'MID', 'ADC', 'SPT'];
      if(registeredPlayerList.teamA.length == 5){ lolLine = lineCandidate; }
      else{
        for(let i = 0; i < 5; i++){
          if(lineCandidate[i] != bannedLine){
            lolLine.push(lineCandidate[i]);
          }
        }
      }

      for(let i = 0; i < 5; i++){
        document.getElementById(`resultTable1_${i+1}_1`).innerHTML = (typeof result[i] == 'undefined') ? '-' : `${lolLine[i]}`;
        document.getElementById(`resultTable1_${i+1}_2`).innerHTML = (typeof result[i] == 'undefined') ? '-' : result[i];
      }
      break;
    case 'ran_sel_new':
      isSingle = true;
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) < 6){ snackbarAlertNormal("참가자 6명 이상을 등록해주세요."); return; }
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) % 2 != 0){ snackbarAlertNormal("참가 인원수는 짝수여야 합니다."); return; }
      // Rolling
      var allPlayers = [];
      for(let i = 0; i < registeredPlayerList.teamA.length + registeredPlayerList.teamB.length; i++){
        if(typeof registeredPlayerList.teamA[i] != 'undefined'){ allPlayers.push(registeredPlayerList.teamA[i]); }
        else{ allPlayers.push(registeredPlayerList.teamB[i - registeredPlayerList.teamA.length]); }
      }
      var failsafe = 0;
      while(true){
        shuffle(allPlayers);
        result.push(allPlayers.slice(0, allPlayers.length / 2));
        result.push(allPlayers.slice(allPlayers.length / 2, allPlayers.length));
        break;
      }
      
      // Update table
      for(let i = 0; i < 5; i++){
        document.getElementById(`resultTable1_${i+1}_1`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : `${i+1}등`;
        document.getElementById(`resultTable1_${i+1}_2`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`resultTable2_${i+1}_1`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : `${i+1}등`;
        document.getElementById(`resultTable2_${i+1}_2`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
        document.getElementById(`teamTable1_${i+1}`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`teamTable2_${i+1}`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
      }
      break;
    case 'ran_ass_new':
      isSingle = true;
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) < 6){ snackbarAlertNormal("참가자 6명 이상을 등록해주세요."); return; }
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) % 2 != 0){ snackbarAlertNormal("참가 인원수는 짝수여야 합니다."); return; }
      // Rolling
      var allPlayers = [];
      for(let i = 0; i < registeredPlayerList.teamA.length + registeredPlayerList.teamB.length; i++){
        if(typeof registeredPlayerList.teamA[i] != 'undefined'){ allPlayers.push(registeredPlayerList.teamA[i]); }
        else{ allPlayers.push(registeredPlayerList.teamB[i - registeredPlayerList.teamA.length]); }
      }
      var failsafe = 0;

      if(allPlayers.length == 8){
        var bannedLine = document.getElementById("4v4banLine").value;
        var sampleLine = ['TOP', 'JGL', 'MID', 'ADC', 'SPT'];
        if(bannedLine == 'RAND'){ bannedLine = sampleLine[Math.floor(Math.random() * 5)]; }
        switch(bannedLine){
          case 'TOP':
            var lolLine = ['JGL', 'MID', 'ADC', 'SPT'];
            break;
          case 'JGL':
            var lolLine = ['TOP', 'MID', 'ADC', 'SPT'];
            break;
          case 'MID':
            var lolLine = ['TOP', 'JGL', 'ADC', 'SPT'];
            break;
          case 'ADC':
          case 'SPT':
            var lolLine = ['TOP', 'JGL', 'MID', 'BOT'];
            break;
        }
      }
      else if(allPlayers.length == 6){ var lolLine = ['TOP', 'MID', 'BOT']; }
      else{ var lolLine = ['TOP', 'MID', 'JGL', 'ADC', 'SPT']; }
      while(true){
        shuffle(allPlayers);
        result = [allPlayers.slice(0, allPlayers.length / 2), allPlayers.slice(allPlayers.length / 2, allPlayers.length)];
        var isValid = true;
        if(consec <= rollLog.length){
          for(let i = 0; i < result.length; i++){
            for(let j = 0; j < consec; j++){
              // if(rollLog[rollLog.length - j - 1][0][i] != result[0][i] && rollLog[rollLog.length - j - 1][1][i] != result[0][i]){ break; }
              if(findLaneInLogFragment(result[0][i], rollLog[rollLog.length - j - 1]) != lolLine[i]){ break; }
              if(j == consec - 1){ isValid = false; }
            }
            for(let j = 0; j < consec; j++){
              // if(rollLog[rollLog.length - j - 1][0][i] != result[1][i] && rollLog[rollLog.length - j - 1][1][i] != result[1][i]){ break; }
              if(findLaneInLogFragment(result[1][i], rollLog[rollLog.length - j - 1]) != lolLine[i]){ break; }
              if(j == consec - 1){ isValid = false; }
            }
          }
        } else{ break; }
        if(isValid){ break; }
        if(failsafe > FAILSAFE_THRESHOLD){ isForced = true; break; }
        failsafe++;
      }
      
      // Update table
      for(let i = 0; i < 5; i++){
        document.getElementById(`resultTable1_${i+1}_1`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : `${lolLine[i]}`;
        document.getElementById(`resultTable1_${i+1}_2`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`resultTable2_${i+1}_1`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : `${lolLine[i]}`;
        document.getElementById(`resultTable2_${i+1}_2`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
        document.getElementById(`teamTable1_${i+1}`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`teamTable2_${i+1}`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
      }
      break;
    case 'ran_sel_consv':
      isSingle = true;
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) < 6){ snackbarAlertNormal("참가자 6명 이상을 등록해주세요."); return; }
      if(registeredPlayerList.teamA.length != registeredPlayerList.teamB.length){ snackbarAlertNormal("두 팀의 인원 수가 동일해야 합니다."); return; }
      var allPlayers = [];
      for(let i = 0; i < registeredPlayerList.teamA.length + registeredPlayerList.teamB.length; i++){
        if(typeof registeredPlayerList.teamA[i] != 'undefined'){ allPlayers.push(registeredPlayerList.teamA[i]); }
        else{ allPlayers.push(registeredPlayerList.teamB[i - registeredPlayerList.teamA.length]); }
      }
      // Rolling
      result = [registeredPlayerList.teamA.slice(0, registeredPlayerList.teamA.length), registeredPlayerList.teamB.slice(0, registeredPlayerList.teamB.length)];
      var failsafe = 0;
      while(true){
        shuffle(result);
        shuffle(result[0]);
        shuffle(result[1]);
        break;
      }
      
      // Update table
      for(let i = 0; i < 5; i++){
        document.getElementById(`resultTable1_${i+1}_1`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : `${i+1}등`;
        document.getElementById(`resultTable1_${i+1}_2`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`resultTable2_${i+1}_1`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : `${i+1}등`;
        document.getElementById(`resultTable2_${i+1}_2`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
        document.getElementById(`teamTable1_${i+1}`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`teamTable2_${i+1}`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
      }
      break;
    case 'ran_ass_consv':
      isSingle = true;
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) < 6){ snackbarAlertNormal("참가자 6명 이상을 등록해주세요."); return; }
      if(registeredPlayerList.teamA.length != registeredPlayerList.teamB.length){ snackbarAlertNormal("두 팀의 인원 수가 동일해야 합니다."); return; }
      var allPlayers = [];
      for(let i = 0; i < registeredPlayerList.teamA.length + registeredPlayerList.teamB.length; i++){
        if(typeof registeredPlayerList.teamA[i] != 'undefined'){ allPlayers.push(registeredPlayerList.teamA[i]); }
        else{ allPlayers.push(registeredPlayerList.teamB[i - registeredPlayerList.teamA.length]); }
      }
      // Rolling
      result = [registeredPlayerList.teamA.slice(0, registeredPlayerList.teamA.length), registeredPlayerList.teamB.slice(0, registeredPlayerList.teamB.length)];
      var failsafe = 0;

      if(allPlayers.length == 8 && document.getElementById("4v4banLine").value == 'SPT'){ var lolLine = ['TOP', 'MID', 'BOT', 'JGL']; }
      else if(allPlayers.length == 6){ var lolLine = ['TOP', 'MID', 'BOT']; }
      else{ var lolLine = ['TOP', 'JGL', 'MID', 'ADC', 'SPT']; }

      while(true){
        shuffle(result);
        shuffle(result[0]);
        shuffle(result[1]);
        var isValid = true;
        if(consec <= rollLog.length){
          for(let i = 0; i < result.length; i++){
            for(let j = 0; j < consec; j++){
              // if(rollLog[rollLog.length - j - 1][0][i] != result[0][i] && rollLog[rollLog.length - j - 1][1][i] != result[0][i]){ break; }
              if(findLaneInLogFragment(result[0][i], rollLog[rollLog.length - j - 1]) != lolLine[i]){ break; }
              if(j == consec - 1){ isValid = false; }
            }
            for(let j = 0; j < consec; j++){
              // if(rollLog[rollLog.length - j - 1][0][i] != result[0][i] && rollLog[rollLog.length - j - 1][1][i] != result[0][i]){ break; }
              if(findLaneInLogFragment(result[1][i], rollLog[rollLog.length - j - 1]) != lolLine[i]){ break; }
              if(j == consec - 1){ isValid = false; }
            }
          }
        } else{ break; }
        if(isValid){ break; }
        if(failsafe > FAILSAFE_THRESHOLD){ isForced = true; break; }
        failsafe++;
      }
      
      // Update table
      for(let i = 0; i < 5; i++){
        document.getElementById(`resultTable1_${i+1}_1`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : `${lolLine[i]}`;
        document.getElementById(`resultTable1_${i+1}_2`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`resultTable2_${i+1}_1`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : `${lolLine[i]}`;
        document.getElementById(`resultTable2_${i+1}_2`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
        document.getElementById(`teamTable1_${i+1}`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`teamTable2_${i+1}`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
      }
      break;
    case 'cal_sel_new':
      isSingle = true;
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) < 6){ snackbarAlertNormal("참가자 6명 이상을 등록해주세요."); return; }
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) % 2 != 0){ snackbarAlertNormal("참가 인원수는 짝수여야 합니다."); return; }
      // Rolling
      var allPlayers = [];
      for(let i = 0; i < registeredPlayerList.teamA.length + registeredPlayerList.teamB.length; i++){
        if(typeof registeredPlayerList.teamA[i] != 'undefined'){ allPlayers.push(registeredPlayerList.teamA[i]); }
        else{ allPlayers.push(registeredPlayerList.teamB[i - registeredPlayerList.teamA.length]); }
      }
      var failsafe = 0;
      var allCombs = findCombination(allPlayers);
      result = allCombs[Math.floor(Math.random() * allCombs.length)];
      while(true){
        shuffle(result);
        shuffle(result[0]);
        shuffle(result[1]);
        break;
      }
      
      // Update table
      for(let i = 0; i < 5; i++){
        document.getElementById(`resultTable1_${i+1}_1`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : `${i+1}등`;
        document.getElementById(`resultTable1_${i+1}_2`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`resultTable2_${i+1}_1`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : `${i+1}등`;
        document.getElementById(`resultTable2_${i+1}_2`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
        document.getElementById(`teamTable1_${i+1}`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`teamTable2_${i+1}`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
      }
      break;
    case 'cal_ass_new':
      isSingle = true;
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) < 6){ snackbarAlertNormal("참가자 6명 이상을 등록해주세요."); return; }
      if((registeredPlayerList.teamA.length + registeredPlayerList.teamB.length) % 2 != 0){ snackbarAlertNormal("참가 인원수는 짝수여야 합니다."); return; }
      // Rolling
      var allPlayers = [];
      for(let i = 0; i < registeredPlayerList.teamA.length + registeredPlayerList.teamB.length; i++){
        if(typeof registeredPlayerList.teamA[i] != 'undefined'){ allPlayers.push(registeredPlayerList.teamA[i]); }
        else{ allPlayers.push(registeredPlayerList.teamB[i - registeredPlayerList.teamA.length]); }
      }
      var failsafe = 0;
      if(document.getElementById('lineScore').checked){
        var allCombs = findCombinationLine(allPlayers);
      } else{
        var allCombs = findCombination(allPlayers);
      }

      var chosenIdx = Math.floor(Math.random() * allCombs.length);
      result = allCombs[chosenIdx];

      if(allPlayers.length == 8 && document.getElementById("4v4banLine").value == 'SPT'){ var lolLine = ['TOP', 'JGL', 'MID', 'BOT']; }
      else if(allPlayers.length == 6){ var lolLine = ['TOP', 'MID', 'BOT']; }
      else{ var lolLine = ['TOP', 'JGL', 'MID', 'ADC', 'SPT']; }

      while(true){
        if(!document.getElementById('lineScore').checked){
          shuffle(result);
          if(encControl == 'false'){
            shuffle(result[0]);
            shuffle(result[1]);
          } else if(encControl == '0'){
            shuffle(result[0]);
            shuffle(result[1]);
            var opponentCopy = result[1].slice(0, result[1].length);
            var shuffledScore = result[0].map(e => avg(playerListScoreForLane[e]));
            var opponentScore = result[1].map(e => avg(playerListScoreForLane[e]));
            var shuffledScoreRank = rankings(shuffledScore);
            var opponentScoreRank = rankings(opponentScore);
            for(let i = 0; i < shuffledScoreRank.length; i++){
              result[1][i] = opponentCopy[opponentScoreRank.indexOf(shuffledScoreRank[i])];
            }
          } else{
            var isValid_internal = false;
            var failsafe_internal = 0;
            while(!isValid_internal){
              isValid_internal = true;
              failsafe_internal++;
              shuffle(result[0]);
              shuffle(result[1]);
              var shuffledScore = result[0].map(e => avg(playerListScoreForLane[e]));
              var opponentScore = result[1].map(e => avg(playerListScoreForLane[e]));
              var shuffledScoreRank = rankings(shuffledScore);
              var opponentScoreRank = rankings(opponentScore);
              for(let i = 0; i < result[0].length; i++){
                if(Math.abs(shuffledScoreRank[i] - opponentScoreRank[i]) > Number(encControl)){ isValid_internal = false; break; }
              }
              if(failsafe_internal > FAILSAFE_THRESHOLD){ isForced = true; break; }
            }
          }
        } else{
          chosenIdx = Math.floor(Math.random() * allCombs.length);
          result = allCombs[chosenIdx];
        }

        var isValid = true;
        if(consec <= rollLog.length){
          for(let i = 0; i < result.length; i++){
            for(let j = 0; j < consec; j++){
              // if(rollLog[rollLog.length - j - 1][0][i] != result[0][i] && rollLog[rollLog.length - j - 1][1][i] != result[0][i]){ break; }
              if(findLaneInLogFragment(result[0][i], rollLog[rollLog.length - j - 1]) != lolLine[i]){ break; }
              if(j == consec - 1){ isValid = false; }
            }
            for(let j = 0; j < consec; j++){
              // if(rollLog[rollLog.length - j - 1][0][i] != result[0][i] && rollLog[rollLog.length - j - 1][1][i] != result[0][i]){ break; }
              if(findLaneInLogFragment(result[1][i], rollLog[rollLog.length - j - 1]) != lolLine[i]){ break; }
              if(j == consec - 1){ isValid = false; }
            }
          }
        } else{ break; }
        if(isValid){ break; }
        if(failsafe > FAILSAFE_THRESHOLD){ isForced = true; break; }
        failsafe++;
        break;
      }
      
      // Update table
      for(let i = 0; i < 5; i++){
        document.getElementById(`resultTable1_${i+1}_1`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : `${lolLine[i]}`;
        document.getElementById(`resultTable1_${i+1}_2`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`resultTable2_${i+1}_1`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : `${lolLine[i]}`;
        document.getElementById(`resultTable2_${i+1}_2`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
        document.getElementById(`teamTable1_${i+1}`).innerHTML = (typeof result[0][i] == 'undefined') ? '-' : result[0][i];
        document.getElementById(`teamTable2_${i+1}`).innerHTML = (typeof result[1][i] == 'undefined') ? '-' : result[1][i];
      }

      console.log(`[DEBUG] Chosen index ${chosenIdx}, among all results!`)
      break;
  }

  // Log the roll
  // rollLog.push(result);

  let pendingLog = {};
  switch(rollMode){
    case 'vs5_sel':
      for(let i = 0; i < result.length; i++){
        pendingLog[`${i+1}등`] = result[i];
      }
      break;
    case 'vs5_ass':
      for(let i = 0; i < result.length; i++){
        pendingLog[`${lolLine[i]}`] = result[i];
      }
      break;
    case 'ran_sel_new':
    case 'cal_sel_new':
    case 'ran_sel_consv':
      pendingLog['레드팀'] = {};
      pendingLog['블루팀'] = {};
      for(let i = 0; i < result[0].length; i++){
        pendingLog['레드팀'][`${i+1}등`] = result[0][i];
      }
      for(let i = 0; i < result[1].length; i++){
        pendingLog['블루팀'][`${i+1}등`] = result[1][i];
      }
      break;
    case 'ran_ass_new':
    case 'cal_ass_new':
    case 'ran_ass_consv':
      pendingLog['레드팀'] = {};
      pendingLog['블루팀'] = {};
      for(let i = 0; i < result[0].length; i++){
        pendingLog['레드팀'][`${lolLine[i]}`] = result[0][i];
      }
      for(let i = 0; i < result[1].length; i++){
        pendingLog['블루팀'][`${lolLine[i]}`] = result[1][i];
      }
      break;
  }
  rollLog.push(
    {
      mode: rollMode,
      timestamp: Date().toLocaleString("ko-KR", { timeZone: "JST" }),
      team: pendingLog
    }
  );

  // Auto copy
  let doCopy = document.getElementById("autoCopy").checked;
  if(doCopy){
    navigator.clipboard.writeText(JSON.stringify(pendingLog).replaceAll('":{"', '\n').replaceAll('","', '\n').replaceAll('":"', ' ').replaceAll('"},"', '\n').replaceAll('"', '').replaceAll('}', '').replaceAll('{', ''))
  }

  if(isForced){
    snackbarAlertNormal("라인 배정을 완료하였습니다." + ((doCopy) ? "\n클립보드에 결과가 자동으로 복사되었습니다.\n(가능한 적절한 배열이 없어 조건을 무시하고 배정되었습니다.)" : "\n(가능한 적절한 배열이 없어 조건을 무시하고 배정되었습니다.)"));
  }
  else{ snackbarAlertNormal("라인 배정을 완료하였습니다." + ((doCopy) ? "\n클립보드에 결과가 자동으로 복사되었습니다." : "")); }
}

function displayLog(){
  if(rollLog.length == 0){ snackbarAlertWarn("기록이 없습니다."); return; }
  // let result = '최근 5회의 기록만 표시됩니다.\n';
  // for(let i = 0; i < Math.min(5, rollLog.length); i++){
  //   result += '\n'
  //   if(typeof rollLog[rollLog.length - i - 1]['레드팀'] != "undefined"){
  //     result += '\n[레드 팀]\n'
  //     for(el of Object.keys(rollLog[rollLog.length - i - 1]['레드팀'])){ result += `${el}: ${rollLog[rollLog.length - i - 1]['레드팀'][el]} ` }
  //     result += '\n[블루 팀]\n'
  //     for(el of Object.keys(rollLog[rollLog.length - i - 1]['블루팀'])){ result += `${el}: ${rollLog[rollLog.length - i - 1]['블루팀'][el]} ` }
  //   } else{
  //     for(el of Object.keys(rollLog[rollLog.length - i - 1])){ result += `${el}: ${rollLog[rollLog.length - i - 1][el]} ` }
  //   }
  // }
  // snackbarAlertNormal(result);
  showLaneHistory();
}

function showLaneHistory() {
  const popup = document.getElementById("laneHistoryPopup");
  const content = document.getElementById("laneHistoryContent");

  // Fill the history text dynamically
  content.innerHTML = generateHistoryHTML(); // assuming this function exists

  // Show the popup (no timeout)
  popup.style.display = "flex";
}

function closeLaneHistory() {
  document.getElementById("laneHistoryPopup").style.display = "none";
}

function toggleLineSpecific(){
  if(document.getElementById("lineSpecif").checked){
    snackbarAlertNormal("라인별 개별 보정을 활성화합니다.");
    document.getElementById("lineSpecifBody").hidden = false;
  } else{
    snackbarAlertNormal("라인별 개별 보정을 비활성화합니다.");
    document.getElementById("lineSpecifBody").hidden = true;
  }
}

function toggleAutoCopy(){
  if(document.getElementById("autoCopy").checked){
    snackbarAlertNormal("클립보드 자동 복사를 활성화합니다.");
  } else{
    snackbarAlertNormal("클립보드 자동 복사를 비활성화합니다.");
  }
}

function generateHistoryHTML() {
  const history = rollLog;

  if (history.length === 0) {
    return `<p style="text-align:center; color:#aaa;">기록이 없습니다.</p>`;
  }

  let html = "";

  // Iterate newest → oldest
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    const date = entry.timestamp || "날짜 미기록";

    switch(entry.mode){
      case 'vs5_sel':
        html += `
          <div class="history-entry">
            <h3>⚔️ [4-5인] 순차 선택 (${date})</h3>
            <div class="history-single">
            <table class="history-table">
              <tr><th>순위</th><th>플레이어</th></tr>
              ${Object.entries(entry.team)
                .map(([prir, player]) => `<tr><td>${prir}</td><td>${player}</td></tr>`)
                .join("")}
            </table>
            </div>
          </div>
        `;
        break;
      case 'vs5_ass':
        html += `
          <div class="history-entry">
            <h3>⚔️ [4-5인] 라인 할당 (${date})</h3>
            <div class="history-single">
              <table class="history-table">
                <tr><th>라인</th><th>플레이어</th></tr>
                ${Object.entries(entry.team)
                  .map(([lane, player]) => `<tr><td>${lane}</td><td>${player}</td></tr>`)
                  .join("")}
              </table>
            </div>
          </div>
        `;
        break;
      case 'ran_sel_new':
      case 'cal_sel_new':
      case 'ran_sel_consv':
        html += `
          <div class="history-entry">
            <h3>🏆 [내전] 순차 선택 (${date})</h3>
            <div class="history-double">
              <table class="history-table teamA">
                <caption>Team A</caption>
                <tr><th>순위</th><th>플레이어</th></tr>
                ${Object.entries(entry.team['레드팀'])
                  .map(([prir, player]) => `<tr><td>${prir}</td><td>${player}</td></tr>`)
                  .join("")}
              </table>

              <table class="history-table teamB">
                <caption>Team B</caption>
                <tr><th>순위</th><th>플레이어</th></tr>
                ${Object.entries(entry.team['블루팀'])
                  .map(([prir, player]) => `<tr><td>${prir}</td><td>${player}</td></tr>`)
                  .join("")}
              </table>
            </div>
          </div>
        `;
        break;
      case 'ran_ass_new':
      case 'cal_ass_new':
      case 'ran_ass_consv':
        html += `
          <div class="history-entry">
            <h3>🏆 [내전] 라인 배정 (${date})</h3>
            <div class="history-double">
              <table class="history-table teamA">
                <caption>Team A</caption>
                <tr><th>라인</th><th>플레이어</th></tr>
                ${Object.entries(entry.team['레드팀'])
                  .map(([lane, player]) => `<tr><td>${lane}</td><td>${player}</td></tr>`)
                  .join("")}
              </table>

              <table class="history-table teamB">
                <caption>Team B</caption>
                <tr><th>라인</th><th>플레이어</th></tr>
                ${Object.entries(entry.team['블루팀'])
                  .map(([lane, player]) => `<tr><td>${lane}</td><td>${player}</td></tr>`)
                  .join("")}
              </table>
            </div>
          </div>
        `;
        break;
    }
  }

  return html;
}

function debug(ln){
  snackbarAlertNormal(ln);
}

/**
 * @link [https://stackoverflow.com/questions/64414816/can-you-return-n-choose-k-combinations-in-javascript-using-array-flatmap]
 */
function choose(arr, k, prefix=[]) {
  if (k == 0) return [prefix];
  return arr.flatMap((v, i) =>
      choose(arr.slice(i+1), k-1, [...prefix, v])
  );
}

function findCombination(playerList){
  const calSensitivity = Number(document.getElementById("calSensitivity").value);
  let allComb = choose(playerList, playerList.length / 2);
  let allCombInName = [];
  let allCombInScore = [];
  let diffList = [];
  let validIdx = [];
  for(let i = 0; i < allComb.length; i++){
    allCombInName.push([allComb[i].slice(0, allComb[i].length), allComb[allComb.length - i - 1].slice(0, allComb[allComb.length - i - 1].length)]);
    allCombInScore.push([allComb[i].map(e => avg(playerListScoreForLane[e])), allComb[allComb.length - i - 1].map(e => avg(playerListScoreForLane[e]))]);
    diffList.push(Math.abs(allCombInScore[i][0].reduce((partialSum, a) => partialSum + a, 0) - allCombInScore[i][1].reduce((partialSum, a) => partialSum + a, 0)) / Math.max(allCombInScore[i][0].reduce((partialSum, a) => partialSum + a, 0), allCombInScore[i][1].reduce((partialSum, a) => partialSum + a, 0)));
    if(diffList[i] <= calSensitivity){ validIdx.push(i); }
  }

  if(validIdx.length == 0){
    validIdx = [0];
    let min = diffList[0];
    for(let i = 1; i < diffList.length; i++){
      if(Math.abs(min - diffList[i]) < 0.0001){ validIdx.push[i]; }
      else if(min > diffList[i]){
        min = diffList[i]; validIdx = [i];
      }
    }
  }

  let res = [];
  console.log(`[DEBUG] Valid combination found: ${validIdx.length}`);
  for(let i = 0; i < validIdx.length; i++){
    res.push(allCombInName[validIdx[i]]);
  }

  console.log(`[DEBUG] All calculations were logged at resLog, allCombInNameLog, allCombInScoreLog, diffListLog. Use this console for more details.`);

  resLog = res;
  allCombInNameLog = allCombInName;
  allCombInScoreLog = allCombInScore;
  diffListLog = diffList;

  return res;
}

function findCombinationLine(playerList){
  const calSensitivity = Number(document.getElementById("calSensitivity").value);
  let allCombInName = permutator(playerList).map(x => [x.slice(0, x.length / 2), x.slice(x.length / 2, x.length)]);
  let allCombInScore = [];
  let diffList = [];
  let validIdx = [];
  for(let i = 0; i < allCombInName.length; i++){
    allCombInScore.push([allCombInName[i][0].map((e, j) => playerListScoreForLane[e][j]), allCombInName[i][1].map((e, j) => playerListScoreForLane[e][j])]);
    diffList.push(Math.abs(allCombInScore[i][0].reduce((partialSum, a) => partialSum + a, 0) - allCombInScore[i][1].reduce((partialSum, a) => partialSum + a, 0)) / Math.max(allCombInScore[i][0].reduce((partialSum, a) => partialSum + a, 0), allCombInScore[i][1].reduce((partialSum, a) => partialSum + a, 0)));
    if(diffList[i] <= calSensitivity){ validIdx.push(i); }
  }

  if(validIdx.length == 0){
    validIdx = [0];
    let min = diffList[0];
    for(let i = 1; i < diffList.length; i++){
      if(Math.abs(min - diffList[i]) < 0.0001){ validIdx.push[i]; }
      else if(min > diffList[i]){
        min = diffList[i]; validIdx = [i];
      }
    }
  }

  let res = [];
  console.log(`[DEBUG] Valid combination found: ${validIdx.length}`);
  for(let i = 0; i < validIdx.length; i++){
    res.push(allCombInName[validIdx[i]]);
  }
  
  const encControl = document.getElementById("encControl").value;

  let result = [];
  if(encControl == 'false'){
    resLog = res;
    allCombInNameLog = allCombInName;
    allCombInScoreLog = allCombInScore;
    diffListLog = diffList;
    console.log(`[DEBUG] Filtered combination found: ${res.length}`);
    console.log(`[DEBUG] All calculations were logged at resLog, allCombInNameLog, allCombInScoreLog, diffListLog. Use this console for more details.`);
    return res;
  } else{
    for(let j = 0; j < res.length; j++){
      var valid = true;

      var shuffledScore = res[j][0].map(e => avg(playerListScoreForLane[e]));
      var opponentScore = res[j][1].map(e => avg(playerListScoreForLane[e]));
      var shuffledScoreRank = rankings(shuffledScore);
      var opponentScoreRank = rankings(opponentScore);
      for(let i = 0; i < shuffledScoreRank.length; i++){
        if(Math.abs(shuffledScoreRank[i] - opponentScoreRank[i]) > Number(encControl)){ valid = false; }
      }

      if(valid){ result.push(res[j]) }
    }
  }
  console.log(`[DEBUG] Filtered combination found: ${result.length}`);
  console.log(`[DEBUG] All calculations were logged at resLog, allCombInNameLog, allCombInScoreLog, diffListLog. Use this console for more details.`);

  resLog = result;
  allCombInNameLog = allCombInName;
  allCombInScoreLog = allCombInScore;
  diffListLog = diffList;

  return result;
}

/**
 * @link [https://stackoverflow.com/questions/9960908/permutations-in-javascript]
 */
function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}

/**
 * @link [https://stackoverflow.com/questions/60989105/ranking-numbers-in-an-array-using-javascript]
 */
function rankings(array) {
  return array
    .map((v, i) => [v, i])
    .sort((a, b) => b[0] - a[0])
    .map((a, i) => [...a, i + 1])
    .sort((a, b) => a[1] - b[1])
    .map(a => a[2]);
}

function findLaneInLogFragment(playerName, logFragment){
  if(typeof logFragment['레드팀'] != "undefined"){
    let items = Object.keys(logFragment['레드팀']);
    for(let i = 0; i < items.length; i++){
      if(logFragment['레드팀'][items[i]] == playerName){ return items[i]; }
    }
    items = Object.keys(logFragment['블루팀']);
    for(let i = 0; i < items.length; i++){
      if(logFragment['블루팀'][items[i]] == playerName){ return items[i]; }
    }

    return undefined;
  }

  let items = Object.keys(logFragment);
  for(let i = 0; i < items.length; i++){
    if(logFragment[items[i]] == playerName){ return items[i]; }
  }

  return undefined;
}

function changeBg(){
  let bgnum = document.getElementById('bgType').value;
  document.body.style.backgroundImage = `url(resources/img/background${bgnum}.png)`
}

function gotoRegister(){
  window.location.href = "util/register.html";
}

// ******** //
// * Main * //
// ******** //

regenerateButton();
resetResultTable(true);

const bg = Math.ceil(Math.random() * BACKGROUND_NUMBER);
document.getElementById(`bg${bg}`).selected = "true";
document.body.style.backgroundImage = `url(resources/img/background${bg}.png)`

document.getElementById('resetTeamButton').addEventListener('click', resetTeamTable);

const globalTooltip = document.getElementById("globalTooltip");

document.querySelectorAll(".tooltip").forEach(el => {
  el.addEventListener("mouseenter", e => {
    const tooltipText = el.getAttribute("data-tooltip");
    if (!tooltipText) return;

    globalTooltip.textContent = tooltipText;
    globalTooltip.style.visibility = "visible";

    const rect = el.getBoundingClientRect();
    globalTooltip.style.left = `${rect.left + rect.width / 2}px`;
    globalTooltip.style.top = `${rect.top - 8}px`;
  });

  el.addEventListener("mouseleave", () => {
    globalTooltip.style.visibility = "hidden";
  });
});

document.addEventListener("keypress", (e) => {
  if(e.code == 'Enter'){
    e.preventDefault();
    if(document.getElementById("customConfirmOverlay").style.display != "flex"){ rollLine(false); }
  }
  else if(e.code == 'KeyR'){ registerTeamPlayers('teamA'); }
  else if(e.code == 'KeyA'){ registerTeamPlayers('all'); }
  else if(e.code == 'KeyB'){ registerTeamPlayers('teamB'); }
})