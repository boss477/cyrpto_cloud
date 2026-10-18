# Cyrpto Cloud — product design

Use the shared boss477 design system. Product promise: **private cloud storage where files are encrypted before they leave your browser.**

Hero: encrypted storage dashboard, a visible “encrypted locally” status, role badge, storage summary, and a clear Upload action. Use cyan for encryption state, violet for access policy, green for verified uploads. Never imply plaintext reaches the server.

Icon prompt: `encrypted cloud formed from two interlocking shield arcs, tiny keyhole at center, geometric flat vector, dark ink and cyan/violet accents, strong 24px silhouette, no text, no watermark, transparent background`.

Diagram: Browser → AES-256-GCM → RSA-OAEP key wrapping → encrypted Supabase object storage; private key stays inside a browser-only boundary; RBAC gate for admin/user/viewer.
