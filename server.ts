import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(express.json());

// Initialize Database
const db = new Database("bitespeed.db");

// Create Contact table
db.exec(`
  CREATE TABLE IF NOT EXISTS Contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phoneNumber TEXT,
    email TEXT,
    linkedId INTEGER,
    linkPrecedence TEXT CHECK(linkPrecedence IN ('primary', 'secondary')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    deletedAt DATETIME
  )
`);

interface Contact {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: "primary" | "secondary";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

app.post("/identify", (req, res) => {
  let { email, phoneNumber } = req.body;
  
  const sanitizedEmail = email ? email.trim().toLowerCase() : null;
  const phoneStr = phoneNumber ? String(phoneNumber).trim() : null;

  if (!sanitizedEmail && !phoneStr) {
    return res.status(400).json({ error: "Email or phoneNumber is required" });
  }

  const matchingContacts = db.prepare(`
    SELECT * FROM Contact 
    WHERE (email = ? AND email IS NOT NULL) 
       OR (phoneNumber = ? AND phoneNumber IS NOT NULL)
  `).all(sanitizedEmail, phoneStr) as Contact[];

  if (matchingContacts.length === 0) {
    const insert = db.prepare(`
      INSERT INTO Contact (email, phoneNumber, linkPrecedence)
      VALUES (?, ?, 'primary')
    `).run(sanitizedEmail, phoneStr);

    return res.json({
      contact: {
        primaryContatctId: Number(insert.lastInsertRowid),
        emails: sanitizedEmail ? [sanitizedEmail] : [],
        phoneNumbers: phoneStr ? [phoneStr] : [],
        secondaryContactIds: []
      }
    });
  }

  const primaryIds = new Set<number>();
  for (const contact of matchingContacts) {
    if (contact.linkPrecedence === "primary") {
      primaryIds.add(contact.id);
    } else if (contact.linkedId) {
      primaryIds.add(contact.linkedId);
    }
  }

  const potentialPrimaries = db.prepare(`
    SELECT id, createdAt FROM Contact 
    WHERE id IN (${Array.from(primaryIds).join(',')})
    ORDER BY createdAt ASC
  `).all() as { id: number, createdAt: string }[];

  const sortedPrimaryIds = potentialPrimaries.map(p => p.id);
  const mainPrimaryId = sortedPrimaryIds[0];
  
  for (let i = 1; i < sortedPrimaryIds.length; i++) {
    const otherPrimaryId = sortedPrimaryIds[i];
    db.prepare(`
      UPDATE Contact 
      SET linkPrecedence = 'secondary', 
          linkedId = ?, 
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ? OR linkedId = ?
    `).run(mainPrimaryId, otherPrimaryId, otherPrimaryId);
  }

  const emailExists = matchingContacts.some(c => c.email === sanitizedEmail);
  const phoneExists = matchingContacts.some(c => c.phoneNumber === phoneStr);

  if ((sanitizedEmail && !emailExists) || (phoneStr && !phoneExists)) {
    db.prepare(`
      INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence)
      VALUES (?, ?, ?, 'secondary')
    `).run(sanitizedEmail, phoneStr, mainPrimaryId);
  }

  const allLinkedContacts = db.prepare(`
    SELECT * FROM Contact 
    WHERE id = ? OR linkedId = ?
    ORDER BY createdAt ASC
  `).all(mainPrimaryId, mainPrimaryId) as Contact[];

  const emails = Array.from(new Set(allLinkedContacts.map(c => c.email).filter(Boolean))) as string[];
  const phoneNumbers = Array.from(new Set(allLinkedContacts.map(c => c.phoneNumber).filter(Boolean))) as string[];
  const secondaryContactIds = allLinkedContacts
    .filter(c => c.id !== mainPrimaryId)
    .map(c => c.id);

  const primaryContact = allLinkedContacts.find(c => c.id === mainPrimaryId);
  if (primaryContact) {
    if (primaryContact.email) {
      const idx = emails.indexOf(primaryContact.email);
      if (idx > -1) {
        emails.splice(idx, 1);
        emails.unshift(primaryContact.email);
      }
    }
    if (primaryContact.phoneNumber) {
      const idx = phoneNumbers.indexOf(primaryContact.phoneNumber);
      if (idx > -1) {
        phoneNumbers.splice(idx, 1);
        phoneNumbers.unshift(primaryContact.phoneNumber);
      }
    }
  }

  res.json({
    contact: {
      primaryContatctId: mainPrimaryId,
      emails,
      phoneNumbers,
      secondaryContactIds
    }
  });
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();