(function () {
  var uiContainer;
  var nameTag;
  var textBody;
  var choicesContainer;
  var activeNPC = null;

  function initUI() {
    uiContainer = document.createElement('div');
    uiContainer.id = 'dialogue-overlay';
    uiContainer.style.position = 'absolute';
    uiContainer.style.bottom = '0';
    uiContainer.style.left = '0';
    uiContainer.style.width = '100vw';
    uiContainer.style.height = '100vh';
    uiContainer.style.display = 'none';
    uiContainer.style.fontFamily = 'sans-serif';
    uiContainer.style.zIndex = '1000';
    uiContainer.style.background = 'radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)';
    
    var bottomPane = document.createElement('div');
    bottomPane.style.position = 'absolute';
    bottomPane.style.bottom = '30px';
    bottomPane.style.left = '15vw';
    bottomPane.style.width = '70vw';
    bottomPane.style.height = '160px';
    bottomPane.style.backgroundColor = 'rgba(30, 30, 40, 0.85)';
    bottomPane.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    bottomPane.style.borderRadius = '12px';
    bottomPane.style.boxShadow = '0 10px 40px rgba(0,0,0,0.8)';
    bottomPane.style.color = 'white';
    bottomPane.style.display = 'flex';
    bottomPane.style.flexDirection = 'column';
    
    nameTag = document.createElement('div');
    nameTag.style.position = 'absolute';
    nameTag.style.top = '-20px';
    nameTag.style.left = '40px';
    nameTag.style.padding = '5px 20px';
    nameTag.style.backgroundColor = 'rgba(20, 20, 30, 0.95)';
    nameTag.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    nameTag.style.borderRadius = '6px';
    nameTag.style.fontSize = '22px';
    nameTag.style.fontWeight = 'bold';
    nameTag.style.color = '#ffcc00';
    nameTag.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
    bottomPane.appendChild(nameTag);

    textBody = document.createElement('div');
    textBody.style.padding = '35px 40px 20px 40px';
    textBody.style.fontSize = '24px';
    textBody.style.lineHeight = '1.5';
    textBody.style.flex = '1';
    textBody.style.textShadow = '1px 1px 2px #000';
    bottomPane.appendChild(textBody);
    
    choicesContainer = document.createElement('div');
    choicesContainer.style.position = 'absolute';
    choicesContainer.style.right = '15vw';
    choicesContainer.style.bottom = '220px'; // above bottom pane
    choicesContainer.style.display = 'flex';
    choicesContainer.style.flexDirection = 'column';
    choicesContainer.style.alignItems = 'flex-end';
    
    uiContainer.appendChild(bottomPane);
    uiContainer.appendChild(choicesContainer);
    document.body.appendChild(uiContainer);
  }

  function typeText(text, element, speed, callback) {
     element.innerHTML = '';
     var i = 0;
     var interval = setInterval(function() {
         element.innerHTML += text.charAt(i);
         i++;
         if(i >= text.length) {
             clearInterval(interval);
             if(callback) callback();
         }
     }, speed);
     uiContainer.onclick = function() {
         clearInterval(interval);
         element.innerHTML = text;
         uiContainer.onclick = null;
         if(callback) callback();
     };
  }

  function displayLines(lines, choices, onComplete) {
      if (!lines || lines.length === 0) {
          showChoices(choices, onComplete);
          return;
      }
      var currentLine = lines[0];
      nameTag.innerText = currentLine.speaker;
      
      if (currentLine.speaker === 'N') nameTag.style.color = '#FFD700';
      else if (activeNPC && activeNPC.color) nameTag.style.color = activeNPC.color;
      else nameTag.style.color = '#FFF';

      typeText(currentLine.text, textBody, 20, function() {
          var remaining = lines.slice(1);
          if (remaining.length > 0) {
              uiContainer.onclick = function() {
                  uiContainer.onclick = null;
                  displayLines(remaining, choices, onComplete);
              };
          } else {
              showChoices(choices, onComplete);
          }
      });
  }

  function showChoices(choices, onComplete) {
      choicesContainer.innerHTML = '';
      if (!choices || choices.length === 0) {
          uiContainer.onclick = function() {
              uiContainer.onclick = null;
              closeUI();
              if (onComplete) onComplete(null);
          };
          return;
      }
      
      for(var i=0; i<choices.length; i++) {
          var btn = document.createElement('div');
          btn.innerText = choices[i].text;
          btn.style.backgroundColor = 'rgba(40, 40, 50, 0.9)';
          btn.style.color = 'white';
          btn.style.padding = '12px 24px';
          btn.style.margin = '5px 0';
          btn.style.borderRadius = '24px';
          btn.style.border = '1px solid rgba(255, 255, 255, 0.2)';
          btn.style.cursor = 'pointer';
          btn.style.fontSize = '20px';
          btn.style.transition = 'all 0.2s';
          
          btn.onmouseover = function() { 
              this.style.backgroundColor = 'rgba(80, 80, 100, 0.95)'; 
              this.style.transform = 'scale(1.05)';
              this.style.borderColor = 'rgba(255, 255, 255, 0.6)';
          };
          btn.onmouseout = function() { 
              this.style.backgroundColor = 'rgba(40, 40, 50, 0.9)'; 
              this.style.transform = 'scale(1)'; 
              this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          };
          
          (function(choice) {
              btn.onclick = function(e) {
                  e.stopPropagation();
                  choicesContainer.innerHTML = '';
                  if (choice.next) {
                      if (activeNPC.quests && activeNPC.quests[choice.next]) {
                          displayLines(activeNPC.quests[choice.next].lines, activeNPC.quests[choice.next].choices, onComplete);
                      } else {
                          closeUI();
                          if (onComplete) onComplete(choice);
                      }
                  } else {
                      closeUI();
                      if (onComplete) onComplete(choice);
                  }
              };
          })(choices[i]);
          
          choicesContainer.appendChild(btn);
      }
  }

  function closeUI() {
      uiContainer.style.display = 'none';
      activeNPC = null;
      // Resume game logic if needed
      window.isDialogueOpen = false;
  }

  window.DialogueUI = {
      init: function() {
          if(!uiContainer) initUI();
      },
      isOpen: function() {
          return window.isDialogueOpen;
      },
      show: function(npcId, onComplete) {
          if (!window.DialogueData) return;
          var npcData = window.DialogueData[npcId.toLowerCase()];
          if (!npcData) {
              console.warn("No dialogue data for " + npcId);
              return;
          }
          
          window.isDialogueOpen = true;
          activeNPC = npcData;
          uiContainer.style.display = 'block';
          choicesContainer.innerHTML = '';
          textBody.innerHTML = '';
          
          var greeting = npcData.greeting[0];
          displayLines(greeting.lines, greeting.choices, onComplete);
      }
  };
})();
