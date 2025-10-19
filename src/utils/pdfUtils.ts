/**
 * PDF Generation Utilities for BantayAlert
 * Creates downloadable emergency guides and checklists
 */

/**
 * Generate and download a PDF guide
 * Note: This is a simplified version. For production, use libraries like jsPDF or pdfmake
 */
export function downloadEmergencyGuide(title: string, content: string): void {
  // Create a simple HTML document that can be printed as PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          line-height: 1.6;
        }
        h1 {
          color: #1e40af;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 10px;
        }
        h2 {
          color: #374151;
          margin-top: 30px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        ul {
          margin-left: 20px;
        }
        li {
          margin-bottom: 10px;
        }
        .important {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
        }
        @media print {
          body {
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">BantayAlert</div>
        <p>Emergency Preparedness Guide</p>
        <p><em>National Capital Region, Philippines</em></p>
      </div>
      
      <h1>${title}</h1>
      
      <div class="content">
        ${content}
      </div>
      
      <div class="footer">
        <p><strong>BantayAlert</strong> - Emergency Preparedness for NCR</p>
        <p>For emergencies, call 911 | Philippine Red Cross: 143</p>
        <p>Generated on ${new Date().toLocaleDateString('en-PH', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
    </body>
    </html>
  `;

  // Create a blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Typhoon Preparedness Guide
 */
export function downloadTyphoonGuide(): void {
  const content = `
    <h2>Before a Typhoon</h2>
    <ul>
      <li>Monitor PAGASA weather bulletins and typhoon signals</li>
      <li>Prepare your emergency kit with food, water, and supplies for at least 3 days</li>
      <li>Secure loose objects outside your home</li>
      <li>Check and clean drainage systems and canals</li>
      <li>Know your local evacuation center and routes</li>
      <li>Charge all electronic devices and power banks</li>
      <li>Withdraw emergency cash (ATMs may be offline)</li>
      <li>Store important documents in waterproof containers</li>
    </ul>

    <div class="important">
      <strong>PAGASA Typhoon Signals:</strong><br>
      Signal #1: 30-60 km/h winds expected in 36 hours<br>
      Signal #2: 61-120 km/h winds expected in 24 hours<br>
      Signal #3: 121-170 km/h winds expected in 18 hours<br>
      Signal #4: 171-220 km/h winds expected in 12 hours<br>
      Signal #5: >220 km/h winds expected in 12 hours
    </div>

    <h2>During a Typhoon</h2>
    <ul>
      <li>Stay indoors and away from windows</li>
      <li>Keep your emergency kit accessible</li>
      <li>Monitor radio or TV for updates</li>
      <li>Avoid wading through floodwaters</li>
      <li>If ordered to evacuate, do so immediately</li>
      <li>Turn off main electricity and gas if flooding occurs</li>
      <li>Stay in the strongest part of your house</li>
    </ul>

    <h2>After a Typhoon</h2>
    <ul>
      <li>Wait for official clearance before going outside</li>
      <li>Watch out for fallen power lines and damaged structures</li>
      <li>Boil water before drinking if supply is compromised</li>
      <li>Document damage for insurance claims (take photos)</li>
      <li>Report emergencies to barangay officials or call 911</li>
      <li>Help neighbors, especially elderly and persons with disabilities</li>
    </ul>

    <h2>Emergency Contacts</h2>
    <ul>
      <li>National Emergency Hotline: 911</li>
      <li>NDRRMC Hotline: (02) 8911-1406 / 8911-5061</li>
      <li>Philippine Red Cross: 143 / (02) 8790-2300</li>
      <li>PAGASA Weather: (02) 8284-0800</li>
      <li>Manila DRRM: (02) 8527-5174</li>
    </ul>
  `;
  
  downloadEmergencyGuide('Typhoon Preparedness Guide', content);
}

/**
 * Generate Earthquake Safety Guide
 */
export function downloadEarthquakeGuide(): void {
  const content = `
    <h2>Before an Earthquake</h2>
    <ul>
      <li>Identify safe spots in each room (under sturdy tables, against interior walls)</li>
      <li>Secure heavy furniture and appliances to walls</li>
      <li>Store breakable items on lower shelves</li>
      <li>Know how to turn off gas, water, and electricity</li>
      <li>Conduct earthquake drills with family</li>
      <li>Prepare an emergency kit with supplies for 72 hours</li>
    </ul>

    <div class="important">
      <strong>DROP, COVER, and HOLD ON!</strong><br>
      This is the recommended action during an earthquake.<br>
      DROP to your hands and knees<br>
      Take COVER under a sturdy desk or table<br>
      HOLD ON until shaking stops
    </div>

    <h2>During an Earthquake</h2>
    <ul>
      <li><strong>If indoors:</strong> DROP, COVER, and HOLD ON. Stay away from windows</li>
      <li><strong>If outdoors:</strong> Move to an open area away from buildings, trees, and power lines</li>
      <li><strong>If in a vehicle:</strong> Pull over safely and stay inside with seatbelt on</li>
      <li><strong>If near the coast:</strong> Move to higher ground immediately after shaking (tsunami risk)</li>
      <li>Do NOT use elevators</li>
      <li>Do NOT stand in doorways</li>
      <li>Do NOT run outside during shaking</li>
    </ul>

    <h2>After an Earthquake</h2>
    <ul>
      <li>Check yourself and others for injuries</li>
      <li>Inspect your home for damage and hazards</li>
      <li>Expect aftershocks - be ready to DROP, COVER, and HOLD ON again</li>
      <li>Turn off utilities if damage is suspected</li>
      <li>Use stairs instead of elevators</li>
      <li>Stay out of damaged buildings</li>
      <li>Monitor PHIVOLCS and local news for updates</li>
      <li>If near the coast, stay on high ground for several hours</li>
    </ul>

    <h2>Emergency Contacts</h2>
    <ul>
      <li>National Emergency Hotline: 911</li>
      <li>PHIVOLCS: (02) 8426-1468 to 79</li>
      <li>NDRRMC: (02) 8911-1406</li>
      <li>Philippine Red Cross: 143</li>
    </ul>
  `;
  
  downloadEmergencyGuide('Earthquake Safety Protocol', content);
}

/**
 * Generate Flood Response Guide
 */
export function downloadFloodGuide(): void {
  const content = `
    <h2>Before a Flood</h2>
    <ul>
      <li>Know if you live in a flood-prone area</li>
      <li>Monitor weather forecasts and flood warnings from PAGASA</li>
      <li>Prepare to evacuate if necessary</li>
      <li>Move valuable items to higher floors</li>
      <li>Fill bathtubs and containers with clean water</li>
      <li>Charge electronic devices</li>
      <li>Prepare emergency kit including waterproof bags</li>
    </ul>

    <div class="important">
      <strong>TURN AROUND, DON'T DROWN!</strong><br>
      Just 6 inches of moving water can knock you down.<br>
      One foot of water can sweep your vehicle away.<br>
      Never drive or walk through floodwater.
    </div>

    <h2>During a Flood</h2>
    <ul>
      <li>Evacuate immediately if told to do so</li>
      <li>Move to higher ground</li>
      <li>Avoid walking or driving through floodwater</li>
      <li>Turn off electricity at the main breaker</li>
      <li>Do not touch electrical equipment if wet</li>
      <li>Stay away from floodwaters (may be contaminated)</li>
      <li>If trapped, go to highest floor, not the attic</li>
      <li>Call 911 or wave a flashlight/cloth to signal for help</li>
    </ul>

    <h2>After a Flood</h2>
    <ul>
      <li>Return home only when authorities say it's safe</li>
      <li>Avoid floodwater and standing water</li>
      <li>Document damage with photos for insurance</li>
      <li>Clean and disinfect everything that got wet</li>
      <li>Throw away food that has come in contact with floodwater</li>
      <li>Boil water before drinking until declared safe</li>
      <li>Watch for snakes and other animals</li>
      <li>Be aware of mold growth</li>
    </ul>

    <h2>Emergency Contacts</h2>
    <ul>
      <li>National Emergency Hotline: 911</li>
      <li>PAGASA Weather: (02) 8284-0800</li>
      <li>MMDA Flood Control: 136</li>
      <li>Philippine Red Cross: 143</li>
    </ul>
  `;
  
  downloadEmergencyGuide('Flood Response Guide', content);
}

/**
 * Generate Fire Safety Guide
 */
export function downloadFireGuide(): void {
  const content = `
    <h2>Fire Prevention</h2>
    <ul>
      <li>Install smoke alarms and test them monthly</li>
      <li>Keep fire extinguisher in accessible locations</li>
      <li>Never leave cooking unattended</li>
      <li>Don't overload electrical outlets</li>
      <li>Keep flammable materials away from heat sources</li>
      <li>Store LPG tanks in well-ventilated areas</li>
      <li>Create and practice a fire escape plan</li>
    </ul>

    <div class="important">
      <strong>STOP, DROP, and ROLL!</strong><br>
      If your clothes catch fire:<br>
      STOP where you are<br>
      DROP to the ground<br>
      Cover your face and ROLL over and over to put out flames
    </div>

    <h2>During a Fire</h2>
    <ul>
      <li>Alert everyone - shout "FIRE!" and activate fire alarm if available</li>
      <li>Get out immediately - don't try to save belongings</li>
      <li>Feel doors before opening (if hot, use another way)</li>
      <li>Crawl low under smoke</li>
      <li>Close doors behind you to slow fire spread</li>
      <li>Once out, stay out - never go back inside</li>
      <li>Call Bureau of Fire Protection: (02) 8426-0219 or 911</li>
      <li>Meet at your designated family meeting point</li>
    </ul>

    <h2>Fire Extinguisher Use: PASS</h2>
    <ul>
      <li><strong>P</strong>ull the pin</li>
      <li><strong>A</strong>im at the base of the fire</li>
      <li><strong>S</strong>queeze the handle</li>
      <li><strong>S</strong>weep from side to side</li>
    </ul>

    <h2>After a Fire</h2>
    <ul>
      <li>Let fire department declare the area safe</li>
      <li>Do not enter until cleared by authorities</li>
      <li>Beware of structural damage</li>
      <li>Document damage for insurance</li>
      <li>Contact your barangay for assistance</li>
    </ul>

    <h2>Emergency Contacts</h2>
    <ul>
      <li>National Emergency Hotline: 911</li>
      <li>Bureau of Fire Protection: (02) 8426-0219</li>
      <li>Philippine Red Cross: 143</li>
    </ul>
  `;
  
  downloadEmergencyGuide('Fire Safety & Prevention', content);
}
