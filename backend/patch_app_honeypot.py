import re

file_path = 'src/App.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Import Honeypot
content = content.replace("const Tracking = lazy(() => import('./pages/Tracking/Tracking'));", "const Tracking = lazy(() => import('./pages/Tracking/Tracking'));\nconst Honeypot = lazy(() => import('./pages/Honeypot/Honeypot'));")

# Add Route
content = content.replace("<Route path=\"*\" element={<PageTransition><NotFound /></PageTransition>} />", "<Route path=\"/wp-admin\" element={<PageTransition><Honeypot /></PageTransition>} />\n        <Route path=\"*\" element={<PageTransition><NotFound /></PageTransition>} />")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Honeypot added to App.jsx")
