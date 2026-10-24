#!/usr/bin/env node
/**
 * El puente entre el panel y Obsidian.
 *
 *   npm run obsidian            baja el panel al vault y sube lo del Inbox
 *   npm run obsidian -- --pull  solo bajar
 *   npm run obsidian -- --push  solo subir
 *
 * Baja: pide las notas a /panel/obsidian (donde vive toda la lógica) y las
 * escribe en «Life CRM» dentro del vault. Se sobrescriben enteras.
 * Sube: cada nota suelta de «Life CRM/Inbox» entra en la bandeja del panel y
 * se mueve a «Inbox/enviado».
 *
 * La contraseña no se guarda en ningún fichero: se pide una vez y lo que se
 * queda en disco es la sesión de Supabase, igual que haría un navegador.
 */
import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const env = await readEnv(path.join(root, ".env.local"));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = env.PANEL_ALLOWED_EMAILS?.split(",")[0]?.trim();
const base = (process.env.PANEL_URL || env.PANEL_URL || "https://vco-solutions.vercel.app").replace(/\/$/, "");
const sessionFile = path.join(os.homedir(), ".life-crm", "obsidian-session.json");

if (!url || !key || !email) {
  exit("Falta NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY o PANEL_ALLOWED_EMAILS en .env.local.");
}

const args = process.argv.slice(2);
const only = args.includes("--pull") ? "pull" : args.includes("--push") ? "push" : "both";
const vault = await findVault(process.env.OBSIDIAN_VAULT || env.OBSIDIAN_VAULT);
const folder = path.join(vault, "Life CRM");

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const session = await signIn();

if (only !== "push") await pull();
if (only !== "pull") await push();

// ---------------------------------------------------------------------------

async function pull() {
  const response = await fetch(`${base}/panel/obsidian`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!response.ok) {
    exit(`El panel contestó ${response.status} al pedirle las notas (${base}/panel/obsidian).`);
  }
  const { files, today } = await response.json();

  let written = 0;
  for (const file of files) {
    const target = path.join(folder, ...file.path.split("/"));
    await fs.mkdir(path.dirname(target), { recursive: true });
    const before = await fs.readFile(target, "utf8").catch(() => null);
    if (before !== file.content) {
      await fs.writeFile(target, file.content, "utf8");
      written += 1;
    }
  }
  console.log(`Vault al día (${today}): ${written} de ${files.length} notas cambiaron.`);
  console.log(`  ${folder}`);
}

async function push() {
  const inbox = path.join(folder, "Inbox");
  const sent = path.join(inbox, "enviado");
  await fs.mkdir(sent, { recursive: true });

  const entries = await fs.readdir(inbox, { withFileTypes: true });
  const notes = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith(".md") && entry.name !== "Léeme.md",
  );

  let pushed = 0;
  for (const note of notes) {
    const file = path.join(inbox, note.name);
    const body = await fs.readFile(file, "utf8");
    const text = [note.name.replace(/\.md$/, ""), stripFrontmatter(body).trim()].filter(Boolean).join("\n\n").slice(0, 5000);
    const { error } = await supabase.from("inbox_items").insert({ user_id: session.user.id, text });
    if (error) {
      console.error(`No se pudo subir «${note.name}»: ${error.message}`);
      continue;
    }
    await fs.rename(file, path.join(sent, note.name)).catch(async () => {
      await fs.rm(file);
    });
    pushed += 1;
  }
  console.log(pushed ? `${pushed} nota(s) en la bandeja del panel.` : "Nada nuevo en Inbox.");
}

async function signIn() {
  const saved = await fs.readFile(sessionFile, "utf8").then(JSON.parse).catch(() => null);
  if (saved?.refresh_token) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: saved.refresh_token });
    if (!error && data.session) return await remember(data.session);
  }

  const password = process.env.PANEL_PASSWORD || (await ask(`Contraseña de ${email}: `));
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) exit(`No se pudo entrar: ${error?.message ?? "sin sesión"}`);
  return await remember(data.session);
}

async function remember(session) {
  await fs.mkdir(path.dirname(sessionFile), { recursive: true });
  await fs.writeFile(sessionFile, JSON.stringify({ refresh_token: session.refresh_token }), {
    encoding: "utf8",
    mode: 0o600,
  });
  return session;
}

/** El vault abierto en Obsidian, si no dices otro. */
async function findVault(given) {
  if (given) return given;
  const config = path.join(
    process.env.APPDATA || path.join(os.homedir(), ".config"),
    "obsidian",
    "obsidian.json",
  );
  const data = await fs.readFile(config, "utf8").then(JSON.parse).catch(() => null);
  const vaults = Object.values(data?.vaults ?? {});
  const open = vaults.find((item) => item.open) ?? vaults[0];
  if (!open) exit("No encuentro ningún vault de Obsidian. Pon OBSIDIAN_VAULT en .env.local.");
  return open.path;
}

async function readEnv(file) {
  const text = await fs.readFile(file, "utf8").catch(() => "");
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }
  return out;
}

function stripFrontmatter(text) {
  return text.startsWith("---") ? text.replace(/^---[\s\S]*?\n---\n?/, "") : text;
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function exit(message) {
  console.error(message);
  process.exit(1);
}
