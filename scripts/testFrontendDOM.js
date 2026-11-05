const fs = require('fs');

const html = fs.readFileSync('server/public/index.html', 'utf8');

// Verify all key elements exist in HTML
const requiredElements = [
  'id="pill-lang-hi"',
  'id="pill-lang-mr"',
  'id="pill-lang-hinglish"',
  'id="hud-tab-eval"',
  'id="hud-tab-align"',
  'id="hud-tab-entities"',
  'id="hud-section-eval"',
  'id="hud-section-align"',
  'id="hud-section-entities"',
  'id="inp-expected"',
  'id="inp-predicted"',
  'id="diff-box"',
  'id="entity-table-body"',
  'id="entity-chips-container"',
  'id="user-display-name"',
  'id="user-display-role"',
  'id="auth-modal"'
];

console.log('--- HTML ELEMENT VERIFICATION ---');
for (const id of requiredElements) {
  if (!html.includes(id)) {
    console.error(`FAIL: Missing ${id}`);
    process.exit(1);
  }
  console.log(`PASS: Found ${id}`);
}

// Verify no default Aditya in static user profile
if (html.includes('<div class="text-xs font-bold text-slate-200">Aditya Yadav</div>')) {
  console.error('FAIL: Still contains hardcoded Aditya Yadav in profile');
  process.exit(1);
} else {
  console.log('PASS: No hardcoded Aditya Yadav in user profile');
}

console.log('\n--- VERIFYING JAVASCRIPT FUNCTIONS ---');
const requiredFunctions = [
  'changeSpeechLang',
  'switchHudTab',
  'switchTab',
  'openAuthModal',
  'switchAuthMode',
  'submitAuthForm',
  'logoutCurrentSession',
  'renderUserProfile',
  'initUserAuth'
];

for (const fn of requiredFunctions) {
  if (!html.includes(`function ${fn}`)) {
    console.error(`FAIL: Missing function ${fn}`);
    process.exit(1);
  }
  console.log(`PASS: Found function ${fn}`);
}

console.log('\nALL VERIFICATIONS PASSED 100%!');
