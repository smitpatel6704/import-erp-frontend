const fs = require('fs');
const file = 'src/components/erp/modules/user-management.js';
let content = fs.readFileSync(file, 'utf8');

// Replace all usages of setMessage with toast

content = content.replace(/setMessage\("User permissions updated."\);/g, 'toast({ title: "Success", description: "User permissions updated." });');

content = content.replace(/setMessage\(\s*`User created\. Email was not sent\. Password link: \$\{delivery\.inviteUrl\}`,\s*\);/g, '');

content = content.replace(/setMessage\(\s*error\.message\s*\);/g, 'toast({ title: "Error", description: error.message, variant: "destructive" });');

content = content.replace(/setMessage\(""\);/g, '');

content = content.replace(/setMessage\(\s*json\.data\.emailSent\s*\?\s*"Invitation email sent\."\s*:\s*`Email was not sent\. Password link: \$\{json\.data\.inviteUrl\}`,\s*\);/g, `toast({
        title: json.data.emailSent ? "Success" : "Notice",
        description: json.data.emailSent
          ? "Invitation email sent."
          : \`Email was not sent. Password link: \${json.data.inviteUrl}\`,
      });`);

content = content.replace(/setMessage\("User deleted permanently\."\);/g, 'toast({ title: "Success", description: "User deleted permanently." });');

// Remove the JSX that renders message
content = content.replace(/message &&\s*_jsx\("div", \{\s*className: "rounded-md border bg-muted\/30 p-3 text-xs break-all",\s*children: message,\s*\}\),/g, '');

fs.writeFileSync(file, content);
console.log('Fixed message state');
